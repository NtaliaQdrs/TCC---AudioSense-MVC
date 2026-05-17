// Model que representa a tabela 'docente_disciplina' — vínculo entre docente e disciplina
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const DocenteDisciplina = sequelize.define('DocenteDisciplina', {

    docente_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'usuario_docente', key: 'id' }
    },

    disciplina_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'disciplina', key: 'id' }
    }

  }, {
    tableName: 'docente_disciplina',
    timestamps: false
  });

  return DocenteDisciplina;
};