// Model que representa a tabela 'usuario_docente'
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const UsuarioDocente = sequelize.define('UsuarioDocente', {

    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'usuario', key: 'id' }
    },

    // Caminho do arquivo de comprovante de vínculo
    comprovante_vinculo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    // Define se o docente tem permissão de administrador
    is_admin: {
      type: DataTypes.TINYINT,
      defaultValue: 0
    },

    // Status da aprovação pelo administrador
    status_aprovacao: {
      type: DataTypes.ENUM('pendente', 'aprovado', 'rejeitado'),
      defaultValue: 'pendente'
    },

    informacao_adicional: {
      type: DataTypes.STRING(300),
      allowNull: true
    },

    // Motivo caso o cadastro seja rejeitado pelo admin
    motivo_rejeicao: {
      type: DataTypes.STRING(500),
      allowNull: true
    }

  }, {
    tableName: 'usuario_docente',
    timestamps: false
  });

  return UsuarioDocente;
};