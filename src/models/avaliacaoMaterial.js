import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const AvaliacaoMaterial = sequelize.define('AvaliacaoMaterial', {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        material_didatico_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'material_didatico',
                key: 'id'
            }
        },

        discente_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario_discente',
                key: 'id'
            }
        },

        nota: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },

        comentario: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        data_avaliacao: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }

    }, {
        tableName: 'avaliacao_material',
        timestamps: false
    });

    AvaliacaoMaterial.associate = (models) => {
        AvaliacaoMaterial.belongsTo(models.MaterialDidatico, {
            foreignKey: 'material_didatico_id',
            as: 'material'
        });
        AvaliacaoMaterial.belongsTo(models.UsuarioDiscente, {
            foreignKey: 'discente_id',
            as: 'discente'
        });
    };

    return AvaliacaoMaterial;
};