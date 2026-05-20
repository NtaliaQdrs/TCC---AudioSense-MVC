// Model que representa a tabela 'solicitacao_admin'
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const SolicitacaoAdmin = sequelize.define('SolicitacaoAdmin', {

    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // Referência ao docente que fez a solicitação
    usuario_docente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuario_docente', key: 'id' }
    },

    status: {
      type: DataTypes.ENUM('pendente', 'aprovado', 'rejeitado'),
      defaultValue: 'pendente'
    },

    data_solicitacao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },

    data_decisao: {
      type: DataTypes.DATE,
      allowNull: true
    },

    // Id do admin que aprovou ou rejeitou
    admin_aprovador_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    motivo_rejeicao: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    justificativa: {
      type: DataTypes.TEXT,
      allowNull: true
    }

  }, {
    tableName: 'solicitacao_admin',
    timestamps: false
  });

  return SolicitacaoAdmin;
};