import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const correcaoAudiodescricao = sequelize.define('correcaoAudiodescricao', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    texto_sugestao: { type: DataTypes.TEXT, allowNull: false },
    data_correcao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    projeto_id: { type: DataTypes.INTEGER, allowNull: false },
    docente_id: { type: DataTypes.INTEGER, allowNull: false },
    imagem_url: { type: DataTypes.STRING(255), allowNull: true },

  }, {
    tableName: 'correcao_audiodescricao',
    timestamps: false
  });

  return correcaoAudiodescricao;
};