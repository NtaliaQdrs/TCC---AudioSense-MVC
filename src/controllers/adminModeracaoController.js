import db from '../models/index.js';

const adminModeracaoController = {

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
