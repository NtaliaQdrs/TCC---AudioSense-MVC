import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import sequelize from '../config/db.js'; // Importa a instância do Sequelize

const basename = path.basename(__filename);
const db = {};

// Lê os arquivos da pasta de forma síncrona
const files = fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 && 
      file !== basename && 
      file.slice(-3) === '.js' &&
      file !== 'index.js' // Excluir o próprio index.js
    );
  });

for (const file of files) { 
  const fullPath = path.join(__dirname, file);
  const module = await import(pathToFileURL(fullPath).href);
  // O modelo deve ser exportado como default e receber sequelize e DataTypes
  const model = module.default(sequelize, Sequelize.DataTypes);
  
  db[model.name] = model;
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;