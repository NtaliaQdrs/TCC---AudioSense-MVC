// Model que representa a tabela 'redefinicao_senha'
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const RedefinicaoSenha = sequelize.define('RedefinicaoSenha', {

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

    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },

    expira_em: {
      type: DataTypes.DATE,
      allowNull: false
    },

    usado: {
      type: DataTypes.TINYINT,
      defaultValue: 0
    }

  }, {
    tableName: 'redefinicao_senha',
    timestamps: false
  });

  return RedefinicaoSenha;
};