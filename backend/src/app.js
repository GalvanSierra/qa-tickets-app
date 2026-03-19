const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const testRoutes = require('./routes/testRoutes');
const { enableTestEndpoints } = require('./config/env');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok'
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/tickets', ticketRoutes);

  if (enableTestEndpoints) {
    app.use('/api/test', testRoutes);
  }

  app.use((req, res) => {
    res.status(404).json({
      message: 'Ruta no encontrada.'
    });
  });

  app.use((error, _req, res, _next) => {
    const status = error.status || 500;

    res.status(status).json({
      message: error.message || 'Ocurrio un error inesperado.',
      details: error.details || []
    });
  });

  return app;
}

module.exports = {
  createApp
};