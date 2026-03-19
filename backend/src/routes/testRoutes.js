const express = require('express');
const { resetDatabase } = require('../db/database');

const router = express.Router();

router.post('/reset', async (_req, res, next) => {
  try {
    await resetDatabase();

    res.json({
      message: 'Base de datos de prueba reiniciada.'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;