// Controller de notificações
import db from '../models/index.js';

// Busca as notificações do usuário logado
export const buscarNotificacoes = async (req, res) => {
  try {
    const usuarioId = req.session.usuarioLogado.id;

    const notificacoes = await db.Notificacao.findAll({
      where: { usuario_id: usuarioId, lida: 0 },
      order: [['data_criacao', 'DESC']],
      limit: 10
    });

    const naoLidas = notificacoes.length;

    return res.json({ notificacoes, naoLidas });

  } catch (err) {
    console.error('Erro ao buscar notificações:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// Marca todas as notificações como lidas
export const marcarTodasLidas = async (req, res) => {
  try {
    const usuarioId = req.session.usuarioLogado.id;

    await db.Notificacao.update(
      { lida: 1 },
      { where: { usuario_id: usuarioId, lida: 0 } }
    );

    return res.json({ mensagem: 'Notificações marcadas como lidas.' });

  } catch (err) {
    console.error('Erro ao marcar notificações:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};