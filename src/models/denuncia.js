// Model que representa a tabela 'denuncia'
// Guarda denúncias feitas por usuários contra materiais, posts e comentários.
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Denuncia = sequelize.define('Denuncia', {

    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // O que foi denunciado. conteudo_id não tem chave estrangeira porque
    // aponta para tabelas diferentes dependendo do tipo (e o conteúdo pode
    // ser apagado depois — a denúncia continua no histórico).
    tipo_conteudo: {
      type: DataTypes.ENUM('material', 'publicacao', 'comentario'),
      allowNull: false
    },

    conteudo_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    // Título do material/post, ou o começo do texto do comentário.
    // Fica salvo aqui pra o painel continuar mostrando o que foi
    // denunciado mesmo depois que o conteúdo for excluído.
    resumo_conteudo: {
      type: DataTypes.STRING(300),
      allowNull: true
    },

    // Só para comentários: em qual post ele estava (pra montar o link)
    publicacao_ref_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    denunciante_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuario', key: 'id' }
    },

    // Autor do conteúdo denunciado (quem recebe o aviso por e-mail)
    denunciado_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'usuario', key: 'id' }
    },

    motivo: {
      type: DataTypes.ENUM('spam', 'ofensivo', 'inapropriado', 'plagio', 'desinformacao', 'outro'),
      allowNull: false
    },

    // Detalhes opcionais escritos por quem denunciou (só o admin vê)
    descricao: {
      type: DataTypes.STRING(500),
      allowNull: true
    },

    status: {
      type: DataTypes.ENUM('pendente', 'procedente', 'improcedente'),
      allowNull: false,
      defaultValue: 'pendente'
    },

    data_denuncia: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },

    data_decisao: {
      type: DataTypes.DATE,
      allowNull: true
    },

    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'usuario', key: 'id' }
    },

    observacao_admin: {
      type: DataTypes.STRING(500),
      allowNull: true
    }

  }, {
    tableName: 'denuncia',
    timestamps: false
  });

  Denuncia.associate = (models) => {
    Denuncia.belongsTo(models.Usuario, { foreignKey: 'denunciante_id', as: 'denunciante' });
    Denuncia.belongsTo(models.Usuario, { foreignKey: 'denunciado_id', as: 'denunciado' });
    Denuncia.belongsTo(models.Usuario, { foreignKey: 'admin_id', as: 'admin' });
  };

  return Denuncia;
};