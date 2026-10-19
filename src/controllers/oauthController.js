import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../models/index.js';

const PROVIDERS = {
  google: {
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: () => process.env.GOOGLE_CALLBACK_URL || callbackFromBaseUrl('google'),
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: 'openid email profile'
  },
  facebook: {
    clientId: () => process.env.FACEBOOK_CLIENT_ID,
    clientSecret: () => process.env.FACEBOOK_CLIENT_SECRET,
    callbackUrl: () => process.env.FACEBOOK_CALLBACK_URL || callbackFromBaseUrl('facebook'),
    scopes: 'email public_profile'
  }
};

function callbackFromBaseUrl(provider) {
  const baseUrl = process.env.APP_BASE_URL;
  if (!baseUrl) return null;
  try {
    return new URL(`/usuario/oauth/${provider}/callback`, baseUrl).toString();
  } catch {
    return null;
  }
}

function providerIsConfigured(provider) {
  const config = PROVIDERS[provider];
  if (!config || !config.clientId() || !config.clientSecret()) return false;
  try {
    const configuredCallbackUrl = config.callbackUrl();
    if (!configuredCallbackUrl) return false;
    const callbackUrl = new URL(configuredCallbackUrl);
    if (!['http:', 'https:'].includes(callbackUrl.protocol)) return false;
    if (process.env.NODE_ENV === 'production' && callbackUrl.protocol !== 'https:') return false;
  } catch {
    return false;
  }
  if (provider === 'facebook') return true;
  return Boolean(config.authorizationUrl && config.tokenUrl);
}

function redirectToLogin(res, error) {
  return res.redirect(`/usuario?erro=${encodeURIComponent(error)}`);
}

function createAuthorizationUrl(provider, callbackUrl, clientId, state) {
  const config = PROVIDERS[provider];
  const graphVersion = process.env.FACEBOOK_GRAPH_VERSION?.trim();
  const url = new URL(
    provider === 'google'
      ? config.authorizationUrl
      : `https://www.facebook.com${graphVersion ? `/${graphVersion}` : ''}/dialog/oauth`
  );
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: config.scopes,
    state
  }).toString();
  if (provider === 'google') url.searchParams.set('prompt', 'select_account');
  return url.toString();
}

export function iniciarOAuth(req, res) {
  const { provider } = req.params;
  if (!providerIsConfigured(provider)) {
    return redirectToLogin(res, 'oauth_indisponivel');
  }

  const flow = req.query.flow === 'register' ? 'register' : 'login';
  const state = crypto.randomBytes(32).toString('hex');
  const agora = Date.now();
  const transacoes = (req.session.oauthTransactions || [])
    .filter(transaction => agora - transaction.createdAt < 10 * 60 * 1000)
    .slice(-4);
  transacoes.push({ state, provider, flow, createdAt: agora });
  req.session.oauthTransactions = transacoes;

  const config = PROVIDERS[provider];
  return res.redirect(createAuthorizationUrl(provider, config.callbackUrl(), config.clientId(), state));
}

async function trocarCodigoPorPerfil(provider, code, callbackUrl) {
  const config = PROVIDERS[provider];
  const parametros = new URLSearchParams({
    code,
    client_id: config.clientId(),
    client_secret: config.clientSecret(),
    redirect_uri: callbackUrl,
    grant_type: 'authorization_code'
  });
  const graphVersion = process.env.FACEBOOK_GRAPH_VERSION?.trim();
  const graphPrefix = graphVersion ? `/${graphVersion}` : '';
  let tokenResponse;
  if (provider === 'google') {
    tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: parametros,
      signal: AbortSignal.timeout(10000)
    });
  } else {
    const tokenUrl = new URL(`https://graph.facebook.com${graphPrefix}/oauth/access_token`);
    tokenUrl.search = parametros.toString();
    tokenResponse = await fetch(tokenUrl, { signal: AbortSignal.timeout(10000) });
  }
  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  if (!tokenResponse.ok || !accessToken) throw new Error('OAuth token exchange failed');

  const profileUrl = provider === 'google'
    ? 'https://openidconnect.googleapis.com/v1/userinfo'
    : `https://graph.facebook.com${graphPrefix}/me?fields=id,name,email`;
  const profileResponse = await fetch(profileUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10000)
  });
  const profile = await profileResponse.json();
  if (!profileResponse.ok) throw new Error('OAuth profile request failed');

  return provider === 'google'
    ? {
        subject: profile.sub,
        email: profile.email,
        emailVerified: profile.email_verified === true,
        name: profile.name
      }
    : {
        subject: profile.id,
        email: profile.email,
        emailVerified: Boolean(profile.email),
        name: profile.name
      };
}

function normalizarEmail(email) {
  return email.trim().toLocaleLowerCase('en-US');
}

async function encontrarUsuarioPorEmail(email, transaction) {
  return db.Usuario.findOne({
    where: db.Sequelize.where(
      db.Sequelize.fn('LOWER', db.Sequelize.col('email')),
      normalizarEmail(email)
    ),
    transaction
  });
}

async function criarNomeUsuario(nome, email) {
  const base = (nome || email.split('@')[0])
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .slice(0, 30) || 'usuario';

  for (let tentativa = 0; tentativa < 5; tentativa += 1) {
    const candidato = `${base}_${crypto.randomBytes(3).toString('hex')}`;
    const existente = await db.Usuario.findOne({ where: { nome_usuario: candidato } });
    if (!existente) return candidato;
  }
  throw new Error('Could not create a unique username');
}

async function criarContaDiscente(provider, profile) {
  const transaction = await db.sequelize.transaction();
  try {
    const nomeUsuario = await criarNomeUsuario(profile.name, profile.email);
    const senhaAleatoria = crypto.randomBytes(48).toString('hex');
    const senhaHash = await bcrypt.hash(senhaAleatoria, 10);
    const usuario = await db.Usuario.create({
      nome_completo: profile.name.trim().slice(0, 100),
      email: normalizarEmail(profile.email),
      senha: senhaHash,
      tipo_usuario: 'discente',
      nome_usuario: nomeUsuario
    }, { transaction });

    await db.UsuarioDiscente.create({ usuario_id: usuario.id }, { transaction });
    await db.OAuthIdentity.create({
      usuario_id: usuario.id,
      provider,
      provider_subject: profile.subject
    }, { transaction });
    await transaction.commit();
    return usuario;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function obterContaAutenticada(req, res, usuario) {
  if (usuario.status_conta !== 'ativo') {
    redirectToLogin(res, 'oauth_conta_indisponivel');
    return false;
  }

  let docente = null;
  if (usuario.tipo_usuario === 'docente') {
    docente = await db.UsuarioDocente.findOne({ where: { usuario_id: usuario.id } });
    if (!docente || docente.status_aprovacao === 'pendente') {
      redirectToLogin(res, 'pendente');
      return false;
    }
    if (docente.status_aprovacao === 'rejeitado') {
      redirectToLogin(res, 'rejeitado');
      return false;
    }
  }

  await new Promise((resolve, reject) => {
    req.session.regenerate(err => err ? reject(err) : resolve());
  });
  req.session.usuarioLogado = {
    id: usuario.id,
    tipo_usuario: usuario.tipo_usuario,
    is_admin: docente ? docente.is_admin : 0,
    nome_usuario: usuario.nome_usuario,
    foto_perfil: usuario.foto_perfil || null
  };
  return true;
}

export async function concluirOAuth(req, res) {
  const { provider } = req.params;
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const transacoes = req.session.oauthTransactions || [];
  const indice = transacoes.findIndex(transaction =>
    transaction.provider === provider &&
    transaction.state.length === state.length &&
    crypto.timingSafeEqual(Buffer.from(transaction.state), Buffer.from(state))
  );
  const transacao = indice >= 0 ? transacoes.splice(indice, 1)[0] : null;
  req.session.oauthTransactions = transacoes;

  if (!providerIsConfigured(provider)) return redirectToLogin(res, 'oauth_indisponivel');
  if (!transacao || Date.now() - transacao.createdAt > 10 * 60 * 1000 || req.query.error) {
    return redirectToLogin(res, req.query.error ? 'oauth_cancelado' : 'oauth_invalido');
  }
  if (typeof req.query.code !== 'string') return redirectToLogin(res, 'oauth_invalido');

  try {
    const config = PROVIDERS[provider];
    const perfil = await trocarCodigoPorPerfil(provider, req.query.code, config.callbackUrl());
    if ((!['string', 'number'].includes(typeof perfil.subject)) ||
        typeof perfil.email !== 'string' ||
        !perfil.emailVerified ||
        typeof perfil.name !== 'string') {
      return redirectToLogin(res, 'oauth_email_nao_verificado');
    }
    const email = normalizarEmail(perfil.email);
    if (email.length > 50 || perfil.name.trim().length === 0) {
      return redirectToLogin(res, 'oauth_dados_invalidos');
    }

    let usuario;
    const identidade = await db.OAuthIdentity.findOne({
      where: { provider, provider_subject: String(perfil.subject) }
    });
    if (identidade) {
      usuario = await db.Usuario.findByPk(identidade.usuario_id);
      if (!usuario || normalizarEmail(usuario.email) !== email) {
        return redirectToLogin(res, 'oauth_email_divergente');
      }
    } else {
      usuario = await encontrarUsuarioPorEmail(email);
      if (usuario) {
        await db.OAuthIdentity.create({
          usuario_id: usuario.id,
          provider,
          provider_subject: String(perfil.subject)
        });
      } else {
        if (transacao.flow !== 'register') return redirectToLogin(res, 'oauth_sem_conta');
        usuario = await criarContaDiscente(provider, perfil);
      }
    }

    const autenticado = await obterContaAutenticada(req, res, usuario);
    if (!autenticado) return;
    return res.redirect('/usuario/perfil');
  } catch (err) {
    console.error(`Erro de autenticação OAuth (${provider}):`, err.message);
    return redirectToLogin(res, 'oauth_erro');
  }
}
