// Middleware de autenticação — verifica sessão (para views) ou token JWT (para API)
import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const auth = async (req, res, next) => {
  let usuario = null;

  // Tenta primeiro pela sessão (usuário logado pelo navegador)
  if (req.session && req.session.usuarioLogado) {
    usuario = req.session.usuarioLogado;
  } else {
    // Tenta pelo token JWT (para chamadas de API)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // Se for uma requisição de navegador, redireciona pro login
      if (req.accepts('html')) {
        return res.redirect('/usuario');
      }
      return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    try {
      usuario = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }
  }

  // NOVO — confere o status_conta atual no banco a cada requisição.
  // Precisa ser no banco (não só no session/token) porque um admin pode
  // banir alguém que já está com sessão ativa nesse exato momento — sem
  // essa checagem, a pessoa banida continuaria navegando normalmente até
  // a sessão expirar sozinha.
  try {
    const registro = await db.Usuario.findByPk(usuario.id, {
      attributes: ['id', 'status_conta']
    });

    if (!registro || registro.status_conta !== 'ativo') {
      if (req.session) req.session.destroy(() => {});

      if (req.accepts('html')) {
        const motivo = registro?.status_conta === 'banido' ? 'banido' : 'desativado';
        return res.redirect(`/usuario?conta=${motivo}`);
      }
      return res.status(403).json({ erro: 'Esta conta está banida ou foi desativada.' });
    }
  } catch (err) {
    console.error('Erro ao verificar status_conta:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }

  req.usuario = usuario;
  next();
};

export default auth;