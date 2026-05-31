// Model que representa a tabela 'usuario_discente'
// Armazena o vínculo entre um usuário e o perfil de discente
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const UsuarioDiscente = sequelize.define('UsuarioDiscente', {

    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // Referência ao usuário na tabela 'usuario'
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuario', // Nome da tabela no banco
        key: 'id'
      }
    }

  }, {
    tableName: 'usuario_discente',
    timestamps: false
  });

  UsuarioDiscente.associate = (db) => {
    UsuarioDiscente.belongsTo(db.Usuario, {
      foreignKey: 'usuario_id'
    });
  };

  return UsuarioDiscente;

  return UsuarioDiscente;
};