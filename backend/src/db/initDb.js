const { dbPath } = require('../config/env');
const { initDatabase, closeDatabase } = require('./database');

async function run() {
  await initDatabase();
  console.log(`Base de datos inicializada en: ${dbPath}`);
  await closeDatabase();
}

run().catch(async (error) => {
  console.error('No fue posible inicializar la base de datos.', error);
  await closeDatabase();
  process.exit(1);
});