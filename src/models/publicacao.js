import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Publicacao = sequelize.define('Publicacao', {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        titulo: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        corpo_texto: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        imagem_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },

        video_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },

        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        data_postagem: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },

        curtidas: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }

    }, {
        tableName: 'publicacao',
        timestamps: false
    });

    Publicacao.associate = (models) => {
        Publicacao.belongsTo(models.Usuario, {
            foreignKey: 'usuario_id',
            as: 'autor'
        });
        Publicacao.hasMany(models.Comentario, {
            foreignKey: 'publicacao_id',
            as: 'comentarios'
        });
    };

    return Publicacao;
};