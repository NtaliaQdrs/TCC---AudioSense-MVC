import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ObraAudiovisual = sequelize.define('ObraAudiovisual', {

    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    sinopse: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    poster_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    genero: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    tipo_obra: {
      type: DataTypes.ENUM('filme', 'serie', 'documentario', 'outro'),
      allowNull: false
    },

    data_lancamento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }

  }, {
    tableName: 'obra_audiovisual',
    timestamps: false
  });

  ObraAudiovisual.associate = (models) => {
    ObraAudiovisual.hasMany(models.Recomendacao, {
      foreignKey: 'obra_audiovisual_id',
      as: 'recomendacoes'
    });
  };

  return ObraAudiovisual;
};