import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const PublicacaoCurtida = sequelize.define('PublicacaoCurtida', {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        publicacao_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        data_curtida: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }

    }, {
        tableName: 'publicacao_curtida',
        timestamps: false
    });

    PublicacaoCurtida.associate = (models) => {
        PublicacaoCurtida.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
        PublicacaoCurtida.belongsTo(models.Publicacao, { foreignKey: 'publicacao_id' });
    };

    return PublicacaoCurtida;
};