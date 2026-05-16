// Middleware de autenticação — verifica sessão (para views) ou token JWT (para API)
import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  // Tenta primeiro pela sessão (usuário logado pelo navegador)
  if (req.session && req.session.usuarioLogado) {
    req.usuario = req.session.usuarioLogado;
    return next();
  }

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ erro: 'Token inválido ou expirado.' });
  }
};

export default auth;