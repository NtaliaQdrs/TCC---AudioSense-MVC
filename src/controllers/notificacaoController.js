// Controller de notificações
import db from '../models/index.js';

// Busca as notificações do usuário logado
export const buscarNotificacoes = async (req, res) => {
  try {
    const usuarioId = req.session.usuarioLogado.id;

    const notificacoes = await db.Notificacao.findAll({
      where: { usuario_id: usuarioId, lida: false },
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
      { where: { usuario_id: usuarioId, lida: false } }
    );

    return res.json({ mensagem: 'Notificações marcadas como lidas.' });

  } catch (err) {
    console.error('Erro ao marcar notificações:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// Marca uma notificação específica como lida
export const marcarNotificacaoLida = async (req, res) => {
  try {
    const usuarioId = req.session.usuarioLogado.id;
    const { id } = req.params;

    await db.Notificacao.update(
      { lida: true },
      { where: { id, usuario_id: usuarioId } }
    );

    return res.json({ mensagem: 'Notificação marcada como lida.' });

  } catch (err) {
    console.error('Erro ao marcar notificação:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};