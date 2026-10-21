import { DataTypes } from 'sequelize';

export default (sequelize) => sequelize.define('OAuthIdentity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuario',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  provider: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  provider_subject: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'oauth_identity',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['provider', 'provider_subject'] },
    { unique: true, fields: ['usuario_id', 'provider'] }
  ]
});
