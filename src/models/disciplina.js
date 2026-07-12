// src/models/disciplina.js
// Model que representa a tabela 'disciplina'
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Disciplina = sequelize.define('Disciplina', {

    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    titulo: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true
    }

  }, {
    tableName: 'disciplina',
    timestamps: false
  });

  Disciplina.associate = (db) => {
    Disciplina.belongsToMany(db.UsuarioDocente, {
      through: db.DocenteDisciplina,
      foreignKey: 'disciplina_id',
      otherKey: 'docente_id'
    });
  };

  return Disciplina;
};