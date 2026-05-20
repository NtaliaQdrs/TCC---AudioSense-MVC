// Controller do painel administrativo
import db from '../models/index.js';

// PAINEL ADMIN — busca docentes pendentes e solicitações de admin
export const verPainelAdmin = async (req, res) => {
  try {
    // Busca docentes com cadastro pendente
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

    // Busca solicitações de admin pendentes
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
};

// APROVAR DOCENTE
export const aprovarDocente = async (req, res) => {
  try {
    const { docente_id } = req.params;
    await db.UsuarioDocente.update(
      { status_aprovacao: 'aprovado' },
      { where: { id: docente_id } }
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

    // Busca o docente pelo usuario_id
    const docente = await db.UsuarioDocente.findOne({ where: { usuario_id: usuarioId } });

    if (!docente || docente.status_aprovacao !== 'aprovado') {
      return res.status(403).json({ erro: 'Apenas docentes aprovados podem solicitar acesso de administrador.' });
    }

    // Verifica se já tem uma solicitação pendente
    const solicitacaoExistente = await db.SolicitacaoAdmin.findOne({
      where: { usuario_docente_id: docente.id, status: 'pendente' }
    });

    if (solicitacaoExistente) {
      return res.status(400).json({ erro: 'Você já tem uma solicitação pendente.' });
    }

    // Cria a solicitação
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

    // Busca a solicitação para pegar o docente_id
    const solicitacao = await db.SolicitacaoAdmin.findOne({ where: { id: solicitacao_id } });

    // Atualiza a solicitação
    await db.SolicitacaoAdmin.update(
      { 
        status: 'aprovado',
        data_decisao: new Date(),
        admin_aprovador_id: adminId
      },
      { where: { id: solicitacao_id } }
    );

    // Seta is_admin = 1 no docente
    await db.UsuarioDocente.update(
      { is_admin: 1 },
      { where: { id: solicitacao.usuario_docente_id } }
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

    await db.SolicitacaoAdmin.update(
      {
        status: 'rejeitado',
        motivo_rejeicao,
        data_decisao: new Date(),
        admin_aprovador_id: adminId
      },
      { where: { id: solicitacao_id } }
    );

    return res.redirect('/painelAdmin1/painel-admin');
  } catch (err) {
    console.error('Erro ao rejeitar solicitação de admin:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// VER PAINEL DOCENTE — verifica se já tem solicitação pendente
export const verPainelDocente = async (req, res) => {
  try {
    const usuarioId = req.session.usuarioLogado.id;
    const docente = await db.UsuarioDocente.findOne({ where: { usuario_id: usuarioId } });

    let solicitacaoPendente = false;
    if (docente) {
      const solicitacao = await db.SolicitacaoAdmin.findOne({
        where: { usuario_docente_id: docente.id, status: 'pendente' }
      });
      solicitacaoPendente = !!solicitacao;
    }

    return res.render('painelAdmin1', {
      title: 'Painel de Administração',
      solicitacaoPendente
    });

  } catch (err) {
    console.error('Erro ao carregar painel docente:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};