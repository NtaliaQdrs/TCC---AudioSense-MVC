import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const estatisticaController = {
    // FUNÇÕES DE ESTATÍSTICAS

    // Contar discentes
    contarDiscentes: async (req, res) => {
        try {
            // Usamos db.sequelize.query para executar SQL puro no Sequelize
            // O QueryTypes.SELECT garante que o retorno seja apenas o array de resultados
            const result = await db.sequelize.query(
                'SELECT COUNT(*) as total FROM usuario WHERE tipo_usuario = "discente"',
                { type: db.Sequelize.QueryTypes.SELECT }
            );
            
            // No Sequelize com QueryTypes.SELECT, o result já é o array de linhas
            res.status(200).json({ total: result[0].total });
        } catch (error) {
            console.error('Erro ao contar discentes:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    // Contar docentes aprovados
    contarDocentes: async (req, res) => {
        try {
            const result = await db.sequelize.query(
                'SELECT COUNT(*) as total FROM usuario u INNER JOIN usuario_docente ud ON u.id = ud.usuario_id WHERE ud.status_aprovacao = "aprovado"',
                { type: db.Sequelize.QueryTypes.SELECT }
            );
            
            res.status(200).json({ total: result[0].total });
        } catch (error) {
            console.error('Erro ao contar docentes:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    }
};

export default estatisticaController;
