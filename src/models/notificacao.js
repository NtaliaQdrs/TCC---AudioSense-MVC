// Model que representa a tabela 'notificacao'
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Notificacao = sequelize.define('Notificacao', {

    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuario', key: 'id' }
    },

    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    mensagem: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    lida: {
      type: DataTypes.TINYINT,
      defaultValue: 0
    },

    data_criacao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }

  }, {
    tableName: 'notificacao',
    timestamps: false
  });

  return Notificacao;
};