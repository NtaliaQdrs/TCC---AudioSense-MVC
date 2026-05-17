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

    return res.render('painelAdmin2', {
      title: 'Painel de Administração',
      docentesPendentes
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