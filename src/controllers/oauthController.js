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
    const callback = config.callbackUrl();
    if (!callback) return false;
    const url = new URL(callback);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') return false;
  } catch {
    return false;
  }
  return true;
}

function redirectToLogin(res, error) {
  return res.redirect(`/usuario?erro=${encodeURIComponent(error)}`);
}

function createAuthorizationUrl(provider, state) {
  const config = PROVIDERS[provider];
  const callbackUrl = config.callbackUrl();
  const url = new URL(config.authorizationUrl);
  url.search = new URLSearchParams({
    client_id: config.clientId(),
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
  if (!providerIsConfigured(provider)) return redirectToLogin(res, 'oauth_indisponivel');

  const flow = req.query.flow === 'register' ? 'register' : 'login';
  const state = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const transactions = (req.session.oauthTransactions || [])
    .filter(transaction => now - transaction.createdAt < 10 * 60 * 1000)
    .slice(-4);
  transactions.push({ state, provider, flow, createdAt: now });
  req.session.oauthTransactions = transactions;

  return res.redirect(createAuthorizationUrl(provider, state));
}

async function exchangeCodeForProfile(provider, code) {
  const config = PROVIDERS[provider];
  const callbackUrl = config.callbackUrl();
  const tokenParameters = new URLSearchParams({
    code,
    client_id: config.clientId(),
    client_secret: config.clientSecret(),
    redirect_uri: callbackUrl,
    grant_type: 'authorization_code'
  });
  const tokenResponse = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParameters,
    signal: AbortSignal.timeout(10000)
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok || typeof tokenData.access_token !== 'string') {
    throw new Error('OAuth token exchange failed');
  }

  const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
    signal: AbortSignal.timeout(10000)
  });
  const profile = await profileResponse.json();
  if (!profileResponse.ok) throw new Error('OAuth profile request failed');

  return {
    subject: profile.sub,
    email: profile.email,
    emailVerified: profile.email_verified === true,
    name: profile.name
  };
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function findUserByEmail(email) {
  return db.Usuario.findOne({
    where: db.Sequelize.where(
      db.Sequelize.fn('LOWER', db.Sequelize.col('email')),
      normalizeEmail(email)
    )
  });
}

async function createUsername(name, email) {
  const base = (name || email.split('@')[0])
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .slice(0, 30) || 'usuario';

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const username = `${base}_${crypto.randomBytes(4).toString('hex')}`;
    const exists = await db.Usuario.findOne({ where: { nome_usuario: username } });
    if (!exists) return username;
  }
  throw new Error('Could not create a unique username');
}

async function createStudentAccount(provider, profile) {
  const transaction = await db.sequelize.transaction();
  try {
    const email = normalizeEmail(profile.email);
    const username = await createUsername(profile.name, email);
    const password = await bcrypt.hash(crypto.randomBytes(48).toString('hex'), 10);
    const user = await db.Usuario.create({
      nome_completo: profile.name.trim().slice(0, 100),
      email,
      senha: password,
      tipo_usuario: 'discente',
      nome_usuario: username
    }, { transaction });

    await db.UsuarioDiscente.create({ usuario_id: user.id }, { transaction });
    await db.OAuthIdentity.create({
      usuario_id: user.id,
      provider,
      provider_subject: String(profile.subject)
    }, { transaction });
    await transaction.commit();
    return user;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function authenticateUser(req, res, user) {
  if (user.status_conta !== 'ativo') {
    redirectToLogin(res, 'oauth_conta_indisponivel');
    return false;
  }

  let docente = null;
  if (user.tipo_usuario === 'docente') {
    docente = await db.UsuarioDocente.findOne({ where: { usuario_id: user.id } });
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
    req.session.regenerate(error => error ? reject(error) : resolve());
  });
  req.session.usuarioLogado = {
    id: user.id,
    tipo_usuario: user.tipo_usuario,
    is_admin: docente ? docente.is_admin : 0,
    nome_usuario: user.nome_usuario,
    foto_perfil: user.foto_perfil || null
  };
  return true;
}

export async function concluirOAuth(req, res) {
  const { provider } = req.params;
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const transactions = req.session.oauthTransactions || [];
  const validState = /^[a-f0-9]{64}$/.test(state);
  const index = validState ? transactions.findIndex(transaction =>
    transaction.provider === provider &&
    transaction.state.length === state.length &&
    crypto.timingSafeEqual(Buffer.from(transaction.state), Buffer.from(state))
  ) : -1;
  const transaction = index >= 0 ? transactions.splice(index, 1)[0] : null;
  req.session.oauthTransactions = transactions;

  if (!providerIsConfigured(provider)) return redirectToLogin(res, 'oauth_indisponivel');
  if (!transaction || Date.now() - transaction.createdAt > 10 * 60 * 1000 || req.query.error) {
    return redirectToLogin(res, req.query.error ? 'oauth_cancelado' : 'oauth_invalido');
  }
  if (typeof req.query.code !== 'string' || !req.query.code || req.query.code.length > 2048) {
    return redirectToLogin(res, 'oauth_invalido');
  }

  try {
    const profile = await exchangeCodeForProfile(provider, req.query.code);
    const validIdentity = (typeof profile.subject === 'string' || typeof profile.subject === 'number') &&
      String(profile.subject).trim().length > 0 &&
      typeof profile.email === 'string' &&
      typeof profile.name === 'string' &&
      profile.name.trim().length > 0 &&
      profile.email.trim().length > 0;
    if (!validIdentity || !profile.emailVerified) {
      return redirectToLogin(res, 'oauth_email_nao_verificado');
    }

    const email = normalizeEmail(profile.email);
    if (email.length > 50 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        profile.name.trim().length > 100 ||
        String(profile.subject).length > 255) {
      return redirectToLogin(res, 'oauth_dados_invalidos');
    }
    const providerSubject = String(profile.subject);
    let user;
    const identity = await db.OAuthIdentity.findOne({
      where: { provider, provider_subject: providerSubject }
    });

    if (identity) {
      user = await db.Usuario.findByPk(identity.usuario_id);
      if (!user) return redirectToLogin(res, 'oauth_erro');
    } else {
      const existingUser = await findUserByEmail(email);
      if (existingUser) return redirectToLogin(res, 'oauth_email_existente');
      if (transaction.flow !== 'register') return redirectToLogin(res, 'oauth_sem_conta');
      user = await createStudentAccount(provider, profile);
    }

    const authenticated = await authenticateUser(req, res, user);
    if (!authenticated) return;
    return res.redirect('/usuario/perfil');
  } catch (error) {
    console.error(`Falha de autenticação pelo provedor ${provider}.`);
    return redirectToLogin(res, 'oauth_erro');
  }
}
