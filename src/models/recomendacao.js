import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Recomendacao = sequelize.define('Recomendacao', {

    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    usuario_docente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuario_docente', key: 'id' }
    },

    obra_audiovisual_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'obra_audiovisual', key: 'id' }
    },

    plataforma_streaming_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'plataforma_streaming', key: 'id' }
    },

    data_recomendacao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }

  }, {
    tableName: 'recomendacao',
    timestamps: false
  });

  Recomendacao.associate = (models) => {
    Recomendacao.belongsTo(models.UsuarioDocente, {
      foreignKey: 'usuario_docente_id',
      as: 'docente'
    });
    Recomendacao.belongsTo(models.ObraAudiovisual, {
      foreignKey: 'obra_audiovisual_id',
      as: 'obra'
    });
    Recomendacao.belongsTo(models.PlataformaStreaming, {
      foreignKey: 'plataforma_streaming_id',
      as: 'plataforma'
    });
  };

  return Recomendacao;
};