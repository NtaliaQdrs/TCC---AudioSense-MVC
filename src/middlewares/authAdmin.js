// Middleware de autenticação para administradores
// Verifica se o usuário está logado E se é um docente com is_admin = 1
import db from '../models/index.js';

const authAdmin = async (req, res, next) => {
  // Verifica se tem sessão
  if (!req.session || !req.session.usuarioLogado) {
    return res.redirect('/usuario');
  }

  const { id, tipo_usuario } = req.session.usuarioLogado;

  // Só docentes podem ser admin
  if (tipo_usuario !== 'docente') {
    return res.status(403).render('error', { 
      message: 'Acesso negado.', 
      error: { status: 403 } 
    });
  }

  try {
    // Verifica se o docente tem is_admin = 1 no banco
    const docente = await db.UsuarioDocente.findOne({ where: { usuario_id: id } });

    if (!docente || docente.is_admin !== 1) {
      return res.status(403).render('error', { 
        message: 'Acesso negado. Você não tem permissão de administrador.', 
        error: { status: 403 } 
      });
    }

    next();
  } catch (err) {
    console.error('Erro no middleware de admin:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export default authAdmin;