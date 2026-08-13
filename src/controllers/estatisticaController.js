import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const estatisticaController = {
    contarDiscentes: async (req, res) => {
        try {
            const result = await db.sequelize.query(
                "SELECT COUNT(*) as total FROM usuario WHERE tipo_usuario = 'discente'",
                { type: db.Sequelize.QueryTypes.SELECT }
            );

            res.status(200).json({ total: result[0].total });
        } catch (error) {
            console.error('Erro ao contar discentes:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    contarDocentes: async (req, res) => {
        try {
            const result = await db.sequelize.query(
                "SELECT COUNT(*) as total FROM usuario u INNER JOIN usuario_docente ud ON u.id = ud.usuario_id WHERE ud.status_aprovacao = 'aprovado'",
                { type: db.Sequelize.QueryTypes.SELECT }
            );

            res.status(200).json({ total: result[0].total });
        } catch (error) {
            console.error('Erro ao contar docentes:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    contarAudiovisual: async (req, res) => {
        try {
            const result = await db.sequelize.query(
                'SELECT COUNT(*) as total FROM obra_audiovisual',
                { type: db.Sequelize.QueryTypes.SELECT }
            );
            res.status(200).json({ total: result[0].total });
        } catch (error) {
            console.error('Erro ao contar obras audiovisuais:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    contarMateriais: async (req, res) => {
        try {
            const result = await db.sequelize.query(
                'SELECT COUNT(*) as total FROM material_didatico',
                { type: db.Sequelize.QueryTypes.SELECT }
            );
            res.status(200).json({ total: result[0].total });
        } catch (error) {
            console.error('Erro ao contar materiais:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    }
};

export default estatisticaController;