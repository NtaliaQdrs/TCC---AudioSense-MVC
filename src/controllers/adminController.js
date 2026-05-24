// Controller do painel administrativo
import db from '../models/index.js';
import { enviarEmail } from '../config/email.js';

// Função auxiliar para criar notificação
const criarNotificacao = async (usuarioId, titulo, mensagem, link = null) => {
  await db.Notificacao.create({ usuario_id: usuarioId, titulo, mensagem, link });
};

// PAINEL ADMIN — busca docentes pendentes e solicitações de admin
export const verPainelAdmin = async (req, res) => {
  try {
    const docentesPendentes = await db.sequelize.query(`
      SELECT 
        u.id,
        u.nome_completo,
        u.email,
        ud.id as docente_id,
        ud.comprovante_vinculo,
        ud.informacao_adicional,
        ud.status_aprovacao,
        d.titulo as disciplina
      FROM usuario u
      INNER JOIN usuario_docente ud ON u.id = ud.usuario_id
      LEFT JOIN docente_disciplina dd ON ud.id = dd.docente_id
      LEFT JOIN disciplina d ON dd.disciplina_id = d.id
      WHERE ud.status_aprovacao = 'pendente'
      ORDER BY u.id DESC
    `, { type: db.Sequelize.QueryTypes.SELECT });

    const solicitacoesAdmin = await db.sequelize.query(`
      SELECT 
        sa.id as solicitacao_id,
        sa.justificativa,
        sa.data_solicitacao,
        sa.status,
        u.nome_completo,
        u.email
      FROM solicitacao_admin sa
      INNER JOIN usuario_docente ud ON sa.usuario_docente_id = ud.id
      INNER JOIN usuario u ON ud.usuario_id = u.id
      WHERE sa.status = 'pendente'
      ORDER BY sa.data_solicitacao DESC
    `, { type: db.Sequelize.QueryTypes.SELECT });

    return res.render('painelAdmin2', {
      title: 'Painel de Administração',
      docentesPendentes,
      solicitacoesAdmin
    });

  } catch (err) {
    console.error('Erro ao carregar painel admin:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }

  console.log('solicitacaoRej:', solicitacaoRej);
  console.log('motivoRejeicao:', motivoRejeicao);
};

// APROVAR DOCENTE
export const aprovarDocente = async (req, res) => {
  try {
    const { docente_id } = req.params;

    await db.UsuarioDocente.update(
      { status_aprovacao: 'aprovado' },
      { where: { id: docente_id } }
    );



    const docente = await db.UsuarioDocente.findOne({ where: { id: docente_id } });
    const usuario = await db.Usuario.findOne({ where: { id: docente.usuario_id } });

    await criarNotificacao(
      usuario.id,
      'Cadastro aprovado!',
      'Seu cadastro como docente foi aprovado. Você já pode acessar a plataforma.',
      '/usuario/perfil'
    );

    await enviarEmail(
      usuario.email,
      'Cadastro aprovado - AudioSense',
      `
        <h2>Parabéns, ${usuario.nome_completo}!</h2>
        <p>Seu cadastro como docente na plataforma <strong>AudioSense</strong> foi <strong>aprovado</strong>.</p>
        <p>Você já pode acessar a plataforma com seu email e senha cadastrados.</p>
        <a href="http://localhost:3000/usuario">Acessar o AudioSense</a>
      `
    );

    return res.redirect('/painelAdmin1/painel-admin');
  } catch (err) {
    console.error('Erro ao aprovar docente:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// REJEITAR DOCENTE
export const rejeitarDocente = async (req, res) => {
  try {
    const { docente_id } = req.params;
    const { motivo_rejeicao } = req.body;

    await db.UsuarioDocente.update(
      { status_aprovacao: 'rejeitado', motivo_rejeicao },
      { where: { id: docente_id } }
    );

    const docente = await db.UsuarioDocente.findOne({ where: { id: docente_id } });
    const usuario = await db.Usuario.findOne({ where: { id: docente.usuario_id } });

    await criarNotificacao(
      usuario.id,
      'Cadastro rejeitado',
      `Seu cadastro foi rejeitado. Motivo: ${motivo_rejeicao}`,
      `/usuario?status=rejeitado&motivo=${encodeURIComponent(motivo_rejeicao)}&email=${encodeURIComponent(usuario.email)}`
    );

    await enviarEmail(
      usuario.email,
      'Cadastro rejeitado - AudioSense',
      `
        <h2>Olá, ${usuario.nome_completo}.</h2>
        <p>Infelizmente, seu cadastro como docente na plataforma <strong>AudioSense</strong> foi <strong>rejeitado</strong>.</p>
        <p><strong>Motivo:</strong> ${motivo_rejeicao}</p>
        <p>Você pode reenviar seu cadastro com um novo comprovante clicando no link abaixo:</p>
        <a href="http://localhost:3000/usuario?status=rejeitado&motivo=${encodeURIComponent(motivo_rejeicao)}&email=${encodeURIComponent(usuario.email)}">Reenviar cadastro</a>
      `
    );

    return res.redirect('/painelAdmin1/painel-admin');
  } catch (err) {
    console.error('Erro ao rejeitar docente:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// ENVIAR SOLICITAÇÃO DE ADMIN
export const enviarSolicitacaoAdmin = async (req, res) => {
  try {
    const { justificativa } = req.body;
    const usuarioId = req.session.usuarioLogado.id;

    const docente = await db.UsuarioDocente.findOne({ where: { usuario_id: usuarioId } });

    if (!docente || docente.status_aprovacao !== 'aprovado') {
      return res.status(403).json({ erro: 'Apenas docentes aprovados podem solicitar acesso de administrador.' });
    }

    const solicitacaoExistente = await db.SolicitacaoAdmin.findOne({
      where: { usuario_docente_id: docente.id, status: 'pendente' }
    });

    if (solicitacaoExistente) {
      return res.status(400).json({ erro: 'Você já tem uma solicitação pendente.' });
    }

    await db.SolicitacaoAdmin.create({
      usuario_docente_id: docente.id,
      justificativa,
      status: 'pendente'
    });

    return res.render('painelAdmin1', {
      title: 'Painel de Administração',
      mensagem: 'Solicitação enviada com sucesso! Aguarde a aprovação do administrador.'
    });

  } catch (err) {
    console.error('Erro ao enviar solicitação de admin:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// APROVAR SOLICITAÇÃO DE ADMIN
export const aprovarSolicitacaoAdmin = async (req, res) => {
  try {
    const { solicitacao_id } = req.params;
    const adminId = req.session.usuarioLogado.id;

    const solicitacao = await db.SolicitacaoAdmin.findOne({ where: { id: solicitacao_id } });

    await db.SolicitacaoAdmin.update(
      { status: 'aprovado', data_decisao: new Date(), admin_aprovador_id: adminId },
      { where: { id: solicitacao_id } }
    );

    await db.UsuarioDocente.update(
      { is_admin: 1 },
      { where: { id: solicitacao.usuario_docente_id } }
    );

    const docenteAprovado = await db.UsuarioDocente.findOne({ where: { id: solicitacao.usuario_docente_id } });
    const usuarioAprovado = await db.Usuario.findOne({ where: { id: docenteAprovado.usuario_id } });

    await criarNotificacao(
      usuarioAprovado.id,
      'Acesso de administrador aprovado!',
      'Sua solicitação de acesso de administrador foi aprovada.',
      '/painelAdmin1/painel-admin'
    );

    return res.redirect('/painelAdmin1/painel-admin');
  } catch (err) {
    console.error('Erro ao aprovar solicitação de admin:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// REJEITAR SOLICITAÇÃO DE ADMIN
export const rejeitarSolicitacaoAdmin = async (req, res) => {
  try {
    const { solicitacao_id } = req.params;
    const { motivo_rejeicao } = req.body;
    const adminId = req.session.usuarioLogado.id;

    const solicitacao = await db.SolicitacaoAdmin.findOne({ where: { id: solicitacao_id } });

    await db.SolicitacaoAdmin.update(
      { status: 'rejeitado', motivo_rejeicao, data_decisao: new Date(), admin_aprovador_id: adminId },
      { where: { id: solicitacao_id } }
    );

    const docenteRejeitado = await db.UsuarioDocente.findOne({ where: { id: solicitacao.usuario_docente_id } });
    const usuarioRejeitado = await db.Usuario.findOne({ where: { id: docenteRejeitado.usuario_id } });

    // Rejeição de admin
    await criarNotificacao(
      usuarioRejeitado.id,
      'Solicitação de administrador rejeitada',
      `Sua solicitação foi rejeitada. Motivo: ${motivo_rejeicao}`,
      '/painelAdmin1'
    );

    return res.redirect('/painelAdmin1/painel-admin');
  } catch (err) {
    console.error('Erro ao rejeitar solicitação de admin:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// VER PAINEL DOCENTE
export const verPainelDocente = async (req, res) => {
  try {
    const usuarioId = req.session.usuarioLogado.id;
    const docente = await db.UsuarioDocente.findOne({ where: { usuario_id: usuarioId } });

    let solicitacaoPendente = false;
    let solicitacaoRejeitada = false;
    let motivoRejeicao = null;

    if (docente) {
      const solicitacaoPend = await db.SolicitacaoAdmin.findOne({
        where: { usuario_docente_id: docente.id, status: 'pendente' }
      });
      solicitacaoPendente = !!solicitacaoPend;

      const solicitacaoRej = await db.SolicitacaoAdmin.findOne({
        where: { usuario_docente_id: docente.id, status: 'rejeitado' },
        order: [['id', 'DESC']] // pega a mais recente
      });
      console.log('solicitacaoRej:', solicitacaoRej);
      console.log('motivoRejeicao:', solicitacaoRej?.motivo_rejeicao);
      if (solicitacaoRej) {
        solicitacaoRejeitada = true;
        motivoRejeicao = solicitacaoRej.motivo_rejeicao;
      }
    }

    return res.render('painelAdmin1', {
      title: 'Painel de Administração',
      solicitacaoPendente,
      solicitacaoRejeitada,
      motivoRejeicao
    });

  } catch (err) {
    console.error('Erro ao carregar painel docente:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};