const path = require('path');

const DEFAULT_DB_PATH = path.resolve(__dirname, '../../data/app.sqlite');

module.exports = {
  port: Number(process.env.PORT || 3000),
  dbPath: process.env.DB_PATH || DEFAULT_DB_PATH,
  enableTestEndpoints: process.env.ENABLE_TEST_ENDPOINTS === 'true',
  demoUser: {
    email: 'admin@demo.com',
    password: 'Admin123*',
    nombre: 'Administrador Demo'
  }
};