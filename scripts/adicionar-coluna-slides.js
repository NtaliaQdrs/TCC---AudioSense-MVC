import sequelize from '../src/config/db.js'; // use o MESMO caminho que funcionou no script anterior

async function main() {
  try {
    await sequelize.query(`
      ALTER TABLE material_didatico
      DROP COLUMN IF EXISTS slides;
    `);
    console.log('✅ Coluna "slides" removida com sucesso de material_didatico.');
  } catch (err) {
    console.error('❌ Erro ao remover coluna:', err.message);
  } finally {
    await sequelize.close();
  }
}

main();