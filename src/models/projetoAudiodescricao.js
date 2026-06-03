import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const projetoAudiodescricao = sequelize.define('projetoAudiodescricao', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titulo: { type: DataTypes.STRING(255), allowNull: false },
    imagem_url: { type: DataTypes.STRING(255), allowNull: false },
    roteiro_texto: { type: DataTypes.TEXT, allowNull: false },
    audio_final_url: { type: DataTypes.BLOB, allowNull: true },

    status: {
      type: DataTypes.ENUM('em_analise', 'requer_ajustes', 'aprovado', 'concluido'),
      allowNull: false,
      defaultValue: 'em_analise'
    },

    discente_id: { type: DataTypes.INTEGER, allowNull: false },
    docente_id: { type: DataTypes.INTEGER, allowNull: true },
    data_submissao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    data_aprovacao: { type: DataTypes.DATE, allowNull: true },
    descricao: { type: DataTypes.STRING(100), allowNull: true }

  }, {
    tableName: 'projeto_audiodescricao',
    timestamps: false
  });
   
  
  projetoAudiodescricao.associate = (db) => {
    projetoAudiodescricao.belongsTo(db.UsuarioDiscente, {
      foreignKey: 'discente_id'
    });

     projetoAudiodescricao.hasMany(db.correcaoAudiodescricao, {  // <- adicione isso
    foreignKey: 'projeto_id'
  });
  };

  return projetoAudiodescricao;
};