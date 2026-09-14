import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const MaterialDidatico = sequelize.define('MaterialDidatico', {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        titulo: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        tipo_material: {
            type: DataTypes.ENUM('artigo', 'slide', 'video', 'outro'),
            allowNull: false
        },

        caminho_arquivo: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        caminho_audio_descricao: {
            type: DataTypes.STRING(255),
            allowNull: true
        },



        caminho_audio_descricao: {
            type: DataTypes.STRING(255),
            allowNull: true
        },

        roteiro_audio_descricao: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        caminho_capa: {
            type: DataTypes.STRING(255),
            allowNull: true
        },

        descricao: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        disciplina_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'disciplina',
                key: 'id'
            }
        },

        disciplina_outro: {
            type: DataTypes.STRING(60),
            allowNull: true
        },

        docente_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario_docente',
                key: 'id'
            }
        },

        data_publicacao: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },


    }, {
        tableName: 'material_didatico',
        timestamps: false
    });

    MaterialDidatico.associate = (models) => {
        MaterialDidatico.belongsTo(models.UsuarioDocente, {
            foreignKey: 'docente_id',
            as: 'docente'
        });
        MaterialDidatico.belongsTo(models.Disciplina, {
            foreignKey: 'disciplina_id',
            as: 'disciplina'
        });
        MaterialDidatico.hasMany(models.AvaliacaoMaterial, {
            foreignKey: 'material_didatico_id',
            as: 'avaliacoes'
        });
    };

    return MaterialDidatico;
};