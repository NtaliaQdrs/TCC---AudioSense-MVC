import { Op } from 'sequelize';
import db from '../models/index.js';

const adminUsuariosController = {

  // GET /admin/usuarios?busca=&tipo=&status=&pagina=
  listarUsuarios: async (req, res) => {
    try {
      const { busca, tipo, status, pagina = 1 } = req.query;
      const LIMITE = 20;
      const offset = (parseInt(pagina) - 1) * LIMITE;

      const where = {};

      if (busca) {
        where[Op.or] = [
          { nome_completo: { [Op.iLike]: `%${busca}%` } },
          { email: { [Op.iLike]: `%${busca}%` } },
          { nome_usuario: { [Op.iLike]: `%${busca}%` } }
        ];
      }

      if (tipo) where.tipo_usuario = tipo;
      if (status) where.status_conta = status;

      const { rows, count } = await db.Usuario.findAndCountAll({
        where,
        attributes: [
          'id', 'nome_usuario', 'nome_completo', 'email', 'tipo_usuario',
          'status_conta', 'motivo_status', 'foto_perfil', 'data_cadastro'
        ],
        include: [
          { model: db.UsuarioDocente, as: 'docente', attributes: ['is_admin', 'status_aprovacao'] }
        ],
        order: [['data_cadastro', 'DESC']],
        limit: LIMITE,
        offset
      });

      res.status(200).json({
        usuarios: rows,
        total: count,
        paginaAtual: parseInt(pagina),
        totalPaginas: Math.ceil(count / LIMITE)
      });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  },

  // PATCH /admin/usuarios/:id/banir   body: { motivo }
  banirUsuario: async (req, res) => {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      if (parseInt(id) === req.usuario.id) {
        return res.status(400).json({ erro: 'Você não pode banir a própria conta.' });
      }

      const usuario = await db.Usuario.findByPk(id);
      if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

      usuario.status_conta = 'banido';
      usuario.motivo_status = motivo || null;
      await usuario.save();

      res.status(200).json({ mensagem: 'Usuário banido com sucesso.' });
    } catch (error) {
      console.error('Erro ao banir usuário:', error);
      res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  },

  // PATCH /admin/usuarios/:id/desbanir
  desbanirUsuario: async (req, res) => {
    try {
      const { id } = req.params;
      const usuario = await db.Usuario.findByPk(id);
      if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

      usuario.status_conta = 'ativo';
      usuario.motivo_status = null;
      await usuario.save();

      res.status(200).json({ mensagem: 'Usuário reativado com sucesso.' });
    } catch (error) {
      console.error('Erro ao desbanir usuário:', error);
      res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  },

  // PUT /admin/usuarios/:id   body: { nome_completo, email, tipo_usuario }
  // Não altera senha por aqui — troca de senha deve continuar no fluxo
  // próprio do usuário (que já cuida do hash corretamente).
  editarUsuario: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome_completo, email, tipo_usuario } = req.body;

      const usuario = await db.Usuario.findByPk(id);
      if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

      if (email && email !== usuario.email) {
        const emailEmUso = await db.Usuario.findOne({ where: { email } });
        if (emailEmUso) {
          return res.status(409).json({ erro: 'Este e-mail já está em uso por outra conta.' });
        }
      }

      if (nome_completo) usuario.nome_completo = nome_completo;
      if (email) usuario.email = email;
      if (tipo_usuario) usuario.tipo_usuario = tipo_usuario;

      await usuario.save();

      res.status(200).json({ mensagem: 'Usuário atualizado com sucesso.', usuario });
    } catch (error) {
      console.error('Erro ao editar usuário:', error);
      res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  },

  // DELETE /admin/usuarios/:id   body: { motivo }
  // Exclusão "suave": marca status_conta='excluido' em vez de apagar a
  // linha, preservando posts/materiais/comentários já ligados a ela.
  excluirUsuario: async (req, res) => {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      if (parseInt(id) === req.usuario.id) {
        return res.status(400).json({ erro: 'Você não pode excluir a própria conta por aqui.' });
      }

      const usuario = await db.Usuario.findByPk(id);
      if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

      usuario.status_conta = 'excluido';
      usuario.motivo_status = motivo || null;
      await usuario.save();

      res.status(200).json({ mensagem: 'Usuário excluído com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }
};

export default adminUsuariosController;
