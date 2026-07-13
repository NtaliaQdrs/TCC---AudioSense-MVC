import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Comentario = sequelize.define('Comentario', {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        publicacao_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        texto_comentario: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        data_comentario: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },

        resposta_a_comentario_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }

    }, {
        tableName: 'comentario',
        timestamps: false
    });

    Comentario.associate = (models) => {
        Comentario.belongsTo(models.Publicacao, {
            foreignKey: 'publicacao_id'
        });
        Comentario.belongsTo(models.Usuario, {
            foreignKey: 'usuario_id',
            as: 'autor'
        });
        Comentario.belongsTo(models.Comentario, {
            foreignKey: 'resposta_a_comentario_id',
            as: 'comentarioPai'
        });
        Comentario.hasMany(models.Comentario, {
            foreignKey: 'resposta_a_comentario_id',
            as: 'respostas'
        });
    };

    return Comentario;
};