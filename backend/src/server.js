const { createApp } = require('./app');
const { port } = require('./config/env');
const { initDatabase, closeDatabase } = require('./db/database');

async function startServer() {
  await initDatabase();

  const app = createApp();
  const server = app.listen(port, () => {
    console.log(`Backend listo en http://localhost:${port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch(async (error) => {
  console.error('No fue posible iniciar el backend.', error);
  await closeDatabase();
  process.exit(1);
});