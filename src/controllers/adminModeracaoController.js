import { Op } from 'sequelize';
import db from '../models/index.js';
import { enviarEmail } from '../config/email.js';

const adminModeracaoController = {

  // GET /admin/moderacao
  listarFilaDenuncias: async (req, res) => {
    try {
      const denuncias = await db.Denuncia.findAll({
        where: { tipo_conteudo: { [Op.in]: ['publicacao', 'material'] } },
        attributes: ['id', 'tipo_conteudo', 'conteudo_id', 'status', 'motivo', 'data_denuncia'],
        order: [['data_denuncia', 'DESC']]
      });

      const grupos = new Map();
      for (const denuncia of denuncias) {
        const chave = `${denuncia.tipo_conteudo}:${denuncia.conteudo_id}`;
        let grupo = grupos.get(chave);
        if (!grupo) {
          grupo = {
            tipo: denuncia.tipo_conteudo,
            id: denuncia.conteudo_id,
            denunciaId: null,
            totalDenuncias: 0,
            pendentes: 0,
            motivos: {},
            ultimaDenuncia: denuncia.data_denuncia
          };
          grupos.set(chave, grupo);
        }
        grupo.totalDenuncias += 1;
        if (denuncia.status === 'pendente') {
          grupo.pendentes += 1;
          grupo.denunciaId ||= denuncia.id;
        }
        grupo.motivos[denuncia.motivo] = (grupo.motivos[denuncia.motivo] || 0) + 1;
      }

      const fila = [...grupos.values()].filter(grupo => grupo.pendentes > 0);
      const idsPublicacoes = fila.filter(item => item.tipo === 'publicacao').map(item => item.id);
      const idsMateriais = fila.filter(item => item.tipo === 'material').map(item => item.id);
      const [publicacoes, materiais] = await Promise.all([
        idsPublicacoes.length
          ? db.Publicacao.findAll({
              where: { id: { [Op.in]: idsPublicacoes } },
              include: [{ model: db.Usuario, as: 'autor', attributes: ['id', 'nome_usuario', 'nome_completo', 'email'] }]
            })
          : [],
        idsMateriais.length
          ? db.MaterialDidatico.findAll({
              where: { id: { [Op.in]: idsMateriais } },
              include: [{
                model: db.UsuarioDocente,
                as: 'docente',
                include: [{ model: db.Usuario, as: 'usuario', attributes: ['id', 'nome_usuario', 'nome_completo', 'email'] }]
              }]
            })
          : []
      ]);

      const conteudos = new Map();
      publicacoes.forEach(publicacao => {
        conteudos.set(`publicacao:${publicacao.id}`, {
          titulo: publicacao.titulo,
          resumo: publicacao.corpo_texto,
          link: `/forum/${publicacao.id}`,
          autor: publicacao.autor
        });
      });
      materiais.forEach(material => {
        conteudos.set(`material:${material.id}`, {
          titulo: material.titulo,
          resumo: material.descricao,
          link: `/material/${material.id}`,
          autor: material.docente?.usuario || null
        });
      });

      const itens = fila.map(item => ({
        ...item,
        ...conteudos.get(`${item.tipo}:${item.id}`),
        rotuloTipo: item.tipo === 'publicacao' ? 'Post do fórum' : 'Material didático',
        dataDenuncia: new Date(item.ultimaDenuncia).toLocaleString('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short',
          timeZone: 'America/Sao_Paulo'
        })
      })).sort((a, b) => new Date(b.ultimaDenuncia) - new Date(a.ultimaDenuncia));

      return res.render('painelModeracao', {
        title: 'Moderação de conteúdo',
        itens,
        totalPendentes: itens.reduce((total, item) => total + item.pendentes, 0),
        resultado: req.query.resultado || null
      });
    } catch (error) {
      console.error('Erro ao carregar fila de moderação:', error);
      return res.status(500).json({ erro: 'Não foi possível carregar a fila de moderação.' });
    }
  },

  // POST /admin/moderacao/:tipo/:id/avisar
  enviarAvisoModeracao: async (req, res) => {
    try {
      const { tipo, id } = req.params;
      if (!['publicacao', 'material'].includes(tipo)) {
        return res.status(400).json({ erro: 'Tipo de conteúdo inválido.' });
      }

      const conteudoId = Number(id);
      if (!Number.isInteger(conteudoId) || conteudoId < 1) {
        return res.status(400).json({ erro: 'Conteúdo inválido.' });
      }

      const mensagem = typeof req.body.mensagem === 'string' ? req.body.mensagem.trim() : '';
      if (!mensagem || mensagem.length > 1000) {
        return res.redirect('/admin/moderacao?resultado=aviso-invalido');
      }

      let tituloConteudo;
      let autor;
      let link;
      if (tipo === 'publicacao') {
        const publicacao = await db.Publicacao.findByPk(conteudoId);
        if (!publicacao) return res.status(404).json({ erro: 'Post não encontrado.' });
        tituloConteudo = publicacao.titulo;
        autor = await db.Usuario.findByPk(publicacao.usuario_id, {
          attributes: ['id', 'nome_completo', 'email']
        });
        link = `/forum/${publicacao.id}`;
      } else {
        const material = await db.MaterialDidatico.findByPk(conteudoId, {
          include: [{
            model: db.UsuarioDocente,
            as: 'docente',
            include: [{ model: db.Usuario, as: 'usuario', attributes: ['id', 'nome_completo', 'email'] }]
          }]
        });
        if (!material) return res.status(404).json({ erro: 'Material não encontrado.' });
        tituloConteudo = material.titulo;
        autor = material.docente?.usuario || null;
        link = `/material/${material.id}`;
      }

      if (!autor) {
        return res.status(409).json({ erro: 'Não foi possível identificar o autor deste conteúdo.' });
      }

      const avisoCompleto = `${mensagem}\n\nConteúdo relacionado: ${tituloConteudo}`;
      await db.Notificacao.create({
        usuario_id: autor.id,
        titulo: 'Aviso da moderação',
        mensagem: avisoCompleto,
        link
      });

      const escaparHtml = texto => String(texto).replace(/[&<>"']/g, caractere => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[caractere]);

      enviarEmail(
        autor.email,
        'Aviso da moderação - AudioSense',
        `<p>Olá, ${escaparHtml(autor.nome_completo || 'usuário')}.</p><p>${escaparHtml(mensagem).replace(/\n/g, '<br>')}</p><p>Conteúdo relacionado: <a href="${escaparHtml(process.env.APP_URL || 'http://localhost:3000')}${link}">${escaparHtml(tituloConteudo)}</a></p>`
      ).catch(error => console.error('Erro ao enviar e-mail de aviso de moderação:', error));

      return res.redirect('/admin/moderacao?resultado=aviso-enviado');
    } catch (error) {
      console.error('Erro ao enviar aviso de moderação:', error);
      return res.status(500).json({ erro: 'Não foi possível enviar o aviso de moderação.' });
    }
  },

  // DELETE /admin/forum/:id
  // Apaga um tópico do fórum e seus comentários (nessa ordem, numa
  // transação, pra não violar a chave estrangeira comentario -> publicacao).
  excluirPublicacao: async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      const publicacao = await db.Publicacao.findByPk(id, { transaction: t });

      if (!publicacao) {
        await t.rollback();
        return res.status(404).json({ erro: 'Tópico não encontrado.' });
      }

      if (db.Comentario) {
        await db.Comentario.destroy({ where: { publicacao_id: id }, transaction: t });
      }
      await publicacao.destroy({ transaction: t });

      await t.commit();
      res.status(200).json({ mensagem: 'Tópico removido com sucesso.' });
    } catch (error) {
      await t.rollback();
      console.error('Erro ao excluir publicação:', error);
      res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  },

  // DELETE /admin/materiais/:id
  // Apaga um material didático e suas avaliações associadas.
  excluirMaterial: async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      const material = await db.MaterialDidatico.findByPk(id, { transaction: t });

      if (!material) {
        await t.rollback();
        return res.status(404).json({ erro: 'Material não encontrado.' });
      }

      if (db.AvaliacaoMaterial) {
        await db.AvaliacaoMaterial.destroy({ where: { material_didatico_id: id }, transaction: t });
      }
      await material.destroy({ transaction: t });

      await t.commit();
      res.status(200).json({ mensagem: 'Material removido com sucesso.' });
    } catch (error) {
      await t.rollback();
      console.error('Erro ao excluir material:', error);
      res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  },

  // DELETE /admin/audiodescricoes/:id
  // Apaga um projeto de audiodescrição enviado por um discente,
  // junto com suas correções associadas.
  excluirProjetoAudiodescricao: async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      const projeto = await db.projetoAudiodescricao.findByPk(id, { transaction: t });

      if (!projeto) {
        await t.rollback();
        return res.status(404).json({ erro: 'Projeto não encontrado.' });
      }

      if (db.correcaoAudiodescricao) {
        await db.correcaoAudiodescricao.destroy({ where: { projeto_id: id }, transaction: t });
      }
      await projeto.destroy({ transaction: t });

      await t.commit();
      res.status(200).json({ mensagem: 'Projeto de audiodescrição removido com sucesso.' });
    } catch (error) {
      await t.rollback();
      console.error('Erro ao excluir projeto de audiodescrição:', error);
      res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  },

  // GET /admin/moderacao/resumo
  // Números rápidos pra um painel de moderação (opcional, útil pro front)
  resumoModeracao: async (req, res) => {
    try {
      const [totalPosts, totalMateriais, totalProjetos] = await Promise.all([
        db.Publicacao.count(),
        db.MaterialDidatico.count(),
        db.projetoAudiodescricao.count()
      ]);

      res.status(200).json({ totalPosts, totalMateriais, totalProjetos });
    } catch (error) {
      console.error('Erro ao gerar resumo de moderação:', error);
      res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }
};

export default adminModeracaoController;
