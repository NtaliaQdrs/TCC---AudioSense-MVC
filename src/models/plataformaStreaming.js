import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const PlataformaStreaming = sequelize.define('PlataformaStreaming', {

    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },

    // URL da logo oficial da plataforma (via CDN/Wikipedia)
    // Quando migrar uploads para nuvem, pode substituir por URL do próprio storage
    logo_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    }

  }, {
    tableName: 'plataforma_streaming',
    timestamps: false
  });

  PlataformaStreaming.associate = (models) => {
    PlataformaStreaming.hasMany(models.Recomendacao, {
      foreignKey: 'plataforma_streaming_id',
      as: 'recomendacoes'
    });
  };

  return PlataformaStreaming;
};