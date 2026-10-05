// Controller de denúncias:
//  - qualquer usuário logado denuncia um material, post ou comentário
//  - o autor do conteúdo recebe um aviso (notificação + e-mail) na hora
//  - o administrador analisa no painel e decide: excluir ou manter
import db from '../models/index.js';
import { enviarEmail } from '../config/email.js';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// ⚠️ AJUSTE AQUI: rota real da página que exibe um material da biblioteca
const rotaMaterial = (id) => `/biblioteca/material/${id}`;

// Motivos aceitos. As chaves precisam bater com os "value" dos radios
// em views/partials/denuncia-modal.pug.
export const MOTIVOS = {
  spam: 'Spam ou propaganda',
  ofensivo: 'Conteúdo ofensivo ou discriminatório',
  inapropriado: 'Conteúdo inapropriado',
  plagio: 'Plágio ou violação de direitos autorais',
  desinformacao: 'Informação falsa ou enganosa',
  outro: 'Outro motivo'
};

const TIPOS = ['material', 'publicacao', 'comentario'];
const ROTULO_TIPO = { material: 'Material', publicacao: 'Post do fórum', comentario: 'Comentário' };
const ROTULO_STATUS = {
  pendente: 'Pendente',
  procedente: 'Procedente — conteúdo removido',
  improcedente: 'Improcedente — conteúdo mantido'
};

// ─── AUXILIARES ───────────────────────────────────────────────────────────

// Escapa texto vindo de usuários antes de colocar em HTML de e-mail
const escapeHtml = (texto = '') =>
  String(texto).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

const formatarData = (data) =>
  new Date(data).toLocaleString('pt-BR', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo'
  });

const linkConteudo = (tipo, id, publicacaoRefId) => {
  if (tipo === 'publicacao') return `/forum/${id}`;
  if (tipo === 'comentario') return publicacaoRefId ? `/forum/${publicacaoRefId}#comentarios` : null;
  if (tipo === 'material') return rotaMaterial(id);
  return null;
};

// Busca o conteúdo denunciado e descobre quem é o autor.
// Retorna null se o conteúdo não existe (mais).
const carregarConteudo = async (tipo, id) => {
  if (tipo === 'material') {
    const material = await db.MaterialDidatico.findByPk(id, {
      include: [{ model: db.UsuarioDocente, as: 'docente', attributes: ['usuario_id'] }]
    });
    if (!material) return null;
    return { autorUsuarioId: material.docente?.usuario_id ?? null, resumo: material.titulo };
  }

  if (tipo === 'publicacao') {
    const post = await db.Publicacao.findByPk(id);
    if (!post) return null;
    return { autorUsuarioId: post.usuario_id, resumo: post.titulo };
  }

  if (tipo === 'comentario') {
    const comentario = await db.Comentario.findByPk(id);
    if (!comentario) return null;
    // ⚠️ Os nomes abaixo são suposições (não vi o model Comentario).
    // Se o campo de texto ou o de autor tiverem outro nome, ajuste aqui.
    const texto = comentario.texto ?? comentario.corpo_texto ?? comentario.conteudo ?? '';
    return {
      autorUsuarioId: comentario.usuario_id ?? null,
      resumo: String(texto).slice(0, 200),
      publicacaoRefId: comentario.publicacao_id ?? null
    };
  }

  return null;
};

// Apaga registros de OUTRAS tabelas que apontam para o conteúdo (curtidas,
// avaliações...), procurando por qualquer model que tenha a coluna indicada.
// Assim não quebra por chave estrangeira mesmo sem eu conhecer todos os models.
const apagarDependentes = async (campo, valor, t, ignorar = []) => {
  const nuncaApagar = ['Denuncia', ...ignorar];
  for (const modelo of Object.values(db.sequelize.models)) {
    if (nuncaApagar.includes(modelo.name)) continue;
    if (modelo.rawAttributes[campo]) {
      await modelo.destroy({ where: { [campo]: valor }, transaction: t });
    }
  }
};

// Possíveis nomes da coluna que liga uma resposta ao comentário "pai"
const CAMPOS_COMENTARIO_PAI = ['comentario_pai_id', 'comentario_id', 'parent_id', 'resposta_para_id'];

const removerComentario = async (id, t) => {
  const campoPai = CAMPOS_COMENTARIO_PAI.find((c) => db.Comentario.rawAttributes[c]);
  if (campoPai) {
    const respostas = await db.Comentario.findAll({
      where: { [campoPai]: id }, attributes: ['id'], transaction: t
    });
    for (const resposta of respostas) await removerComentario(resposta.id, t);
  }
  await apagarDependentes('comentario_id', id, t, ['Comentario']);
  await db.Comentario.destroy({ where: { id }, transaction: t });
};

const removerConteudo = async (tipo, id, t) => {
  if (tipo === 'material') {
    await apagarDependentes('material_didatico_id', id, t);
    await db.MaterialDidatico.destroy({ where: { id }, transaction: t });
  } else if (tipo === 'publicacao') {
    const comentarios = await db.Comentario.findAll({
      where: { publicacao_id: id }, attributes: ['id'], transaction: t
    });
    for (const c of comentarios) await removerComentario(c.id, t);
    await apagarDependentes('publicacao_id', id, t, ['Comentario']);
    await db.Publicacao.destroy({ where: { id }, transaction: t });
  } else if (tipo === 'comentario') {
    await removerComentario(id, t);
  }
};

// Avisa o autor do conteúdo (notificação no site + e-mail).
// Falhas aqui NÃO impedem a denúncia de ser registrada.
const avisarDenunciado = async (motivo, tipo, conteudo, conteudoId) => {
  if (!conteudo.autorUsuarioId) return;

  const autor = await db.Usuario.findByPk(conteudo.autorUsuarioId, {
    attributes: ['id', 'nome_completo', 'email']
  });
  if (!autor) return;

  const oQue = { material: 'material', publicacao: 'post', comentario: 'comentário' }[tipo];
  const resumo = conteudo.resumo || '';

  try {
    await db.Notificacao.create({
      usuario_id: autor.id,
      titulo: 'Seu conteúdo foi denunciado',
      mensagem: `Um ${oQue} seu ("${resumo}") recebeu uma denúncia. Motivo: ${MOTIVOS[motivo]}. A moderação irá analisar.`,
      link: linkConteudo(tipo, conteudoId, conteudo.publicacaoRefId)
    });
  } catch (err) {
    console.error('Erro ao criar notificação de denúncia:', err);
  }

  try {
    await enviarEmail(
      autor.email,
      'Aviso: seu conteúdo foi denunciado - AudioSense',
      `
        <h2>Olá, ${escapeHtml(autor.nome_completo)}.</h2>
        <p>Um ${oQue} seu na plataforma <strong>AudioSense</strong> recebeu uma denúncia:</p>
        <blockquote>“${escapeHtml(resumo)}”</blockquote>
        <p><strong>Motivo informado:</strong> ${escapeHtml(MOTIVOS[motivo])}</p>
        <p>Este é apenas um aviso: nenhuma ação foi tomada até agora. A equipe de moderação vai analisar a denúncia e, se o conteúdo for considerado inadequado, ele poderá ser removido.</p>
        <p>A identidade de quem denunciou não é divulgada.</p>
        <p>Se você acredita que houve um engano, escreva para <a href="mailto:contato.audiosense@gmail.com">contato.audiosense@gmail.com</a>.</p>
        <a href="${APP_URL}/usuario">Acessar o AudioSense</a>
      `
    );
  } catch (err) {
    console.error('Erro ao enviar e-mail de aviso de denúncia:', err);
  }
};

// ─── POST /denuncias  (qualquer usuário logado) ───────────────────────────
export const criarDenuncia = async (req, res) => {
  try {
    const { tipo_conteudo, conteudo_id, motivo, descricao } = req.body;
    const denuncianteId = req.usuario.id;

    if (!TIPOS.includes(tipo_conteudo)) {
      return res.status(400).json({ erro: 'Tipo de conteúdo inválido.' });
    }
    if (!MOTIVOS[motivo]) {
      return res.status(400).json({ erro: 'Selecione um motivo para a denúncia.' });
    }
    const idConteudo = parseInt(conteudo_id, 10);
    if (!Number.isInteger(idConteudo)) {
      return res.status(400).json({ erro: 'Conteúdo inválido.' });
    }

    const conteudo = await carregarConteudo(tipo_conteudo, idConteudo);
    if (!conteudo) {
      return res.status(404).json({ erro: 'Conteúdo não encontrado. Ele pode já ter sido removido.' });
    }

    if (conteudo.autorUsuarioId === denuncianteId) {
      return res.status(400).json({ erro: 'Você não pode denunciar o seu próprio conteúdo.' });
    }

    const jaDenunciou = await db.Denuncia.findOne({
      where: {
        denunciante_id: denuncianteId,
        tipo_conteudo,
        conteudo_id: idConteudo,
        status: 'pendente'
      }
    });
    if (jaDenunciou) {
      return res.status(409).json({ erro: 'Você já denunciou este conteúdo. Nossa equipe irá analisar.' });
    }

    await db.Denuncia.create({
      tipo_conteudo,
      conteudo_id: idConteudo,
      resumo_conteudo: (conteudo.resumo || '').slice(0, 300),
      publicacao_ref_id: conteudo.publicacaoRefId ?? null,
      denunciante_id: denuncianteId,
      denunciado_id: conteudo.autorUsuarioId,
      motivo,
      descricao: (descricao || '').toString().trim().slice(0, 500) || null
    });

    await avisarDenunciado(motivo, tipo_conteudo, conteudo, idConteudo);

    return res.status(201).json({
      mensagem: 'Denúncia enviada. Obrigado por ajudar a manter a plataforma segura.'
    });
  } catch (err) {
    console.error('Erro ao criar denúncia:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// ─── GET /admin/denuncias?status=pendente|procedente|improcedente ─────────
export const verPainelDenuncias = async (req, res) => {
  try {
    const filtro = ['pendente', 'procedente', 'improcedente'].includes(req.query.status)
      ? req.query.status
      : 'pendente';

    const denuncias = await db.Denuncia.findAll({
      where: { status: filtro },
      include: [
        { model: db.Usuario, as: 'denunciante', attributes: ['id', 'nome_completo', 'nome_usuario'] },
        { model: db.Usuario, as: 'denunciado', attributes: ['id', 'nome_completo', 'nome_usuario'] },
        { model: db.Usuario, as: 'admin', attributes: ['id', 'nome_completo'] }
      ],
      // fila: as pendentes mais antigas primeiro; histórico: mais recentes primeiro
      order: filtro === 'pendente' ? [['data_denuncia', 'ASC']] : [['data_decisao', 'DESC']],
      limit: 100
    });

    const itens = await Promise.all(denuncias.map(async (d) => {
      // conteúdo de denúncia procedente foi removido; nos outros casos confere se ainda existe
      const existe = d.status === 'procedente'
        ? false
        : !!(await carregarConteudo(d.tipo_conteudo, d.conteudo_id));

      return {
        ...d.toJSON(),
        rotuloTipo: ROTULO_TIPO[d.tipo_conteudo],
        rotuloMotivo: MOTIVOS[d.motivo],
        rotuloStatus: ROTULO_STATUS[d.status],
        dataDenuncia: formatarData(d.data_denuncia),
        dataDenunciaISO: new Date(d.data_denuncia).toISOString(),
        dataDecisao: d.data_decisao ? formatarData(d.data_decisao) : null,
        link: linkConteudo(d.tipo_conteudo, d.conteudo_id, d.publicacao_ref_id),
        conteudoExiste: existe
      };
    }));

    const linhas = await db.Denuncia.findAll({
      attributes: ['status', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'total']],
      group: ['status'],
      raw: true
    });
    const contagens = { pendente: 0, procedente: 0, improcedente: 0 };
    linhas.forEach((l) => { contagens[l.status] = parseInt(l.total, 10); });

    return res.render('painelDenuncias', {
      title: 'Painel de Denúncias',
      denuncias: itens,
      filtro,
      contagens
    });
  } catch (err) {
    console.error('Erro ao carregar painel de denúncias:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// ─── POST /admin/denuncias/:id/excluir  (denúncia procedente) ─────────────
export const excluirConteudoDenunciado = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const denuncia = await db.Denuncia.findByPk(req.params.id, { transaction: t });

    if (!denuncia) {
      await t.rollback();
      return res.status(404).json({ erro: 'Denúncia não encontrada.' });
    }
    if (denuncia.status !== 'pendente') {
      await t.rollback();
      return res.redirect('/admin/denuncias');
    }

    await removerConteudo(denuncia.tipo_conteudo, denuncia.conteudo_id, t);

    // O conteúdo não existe mais, então todas as denúncias pendentes
    // sobre ele são encerradas de uma vez.
    await db.Denuncia.update(
      {
        status: 'procedente',
        data_decisao: new Date(),
        admin_id: req.usuario.id,
        observacao_admin: (req.body.observacao || '').trim().slice(0, 500) || null
      },
      {
        where: {
          tipo_conteudo: denuncia.tipo_conteudo,
          conteudo_id: denuncia.conteudo_id,
          status: 'pendente'
        },
        transaction: t
      }
    );

    await t.commit();
    return res.redirect('/admin/denuncias');
  } catch (err) {
    await t.rollback();
    console.error('Erro ao excluir conteúdo denunciado:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// ─── POST /admin/denuncias/:id/manter  (denúncia improcedente) ────────────
export const manterConteudoDenunciado = async (req, res) => {
  try {
    const denuncia = await db.Denuncia.findByPk(req.params.id);
    if (!denuncia) return res.status(404).json({ erro: 'Denúncia não encontrada.' });

    if (denuncia.status === 'pendente') {
      denuncia.status = 'improcedente';
      denuncia.data_decisao = new Date();
      denuncia.admin_id = req.usuario.id;
      denuncia.observacao_admin = (req.body.observacao || '').trim().slice(0, 500) || null;
      await denuncia.save();
    }

    return res.redirect('/admin/denuncias');
  } catch (err) {
    console.error('Erro ao manter conteúdo denunciado:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};