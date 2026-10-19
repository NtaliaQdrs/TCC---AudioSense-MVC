import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const PublicacaoTag = sequelize.define('PublicacaoTag', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        publicacao_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        tag: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    }, {
        tableName: 'publicacao_tag',
        timestamps: false,
        indexes: [{ unique: true, fields: ['publicacao_id', 'tag'] }]
    });

    PublicacaoTag.associate = (models) => {
        PublicacaoTag.belongsTo(models.Publicacao, {
            foreignKey: 'publicacao_id',
            as: 'publicacao',
            onDelete: 'CASCADE'
        });
    };

    return PublicacaoTag;
};
