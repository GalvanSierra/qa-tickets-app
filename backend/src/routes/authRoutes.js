const express = require('express');
const { demoUser } = require('../config/env');

const router = express.Router();

router.post('/login', (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (email !== demoUser.email || password !== demoUser.password) {
    return res.status(401).json({
      message: 'Credenciales invalidas. Usa el usuario demo para ingresar.'
    });
  }

  return res.json({
    message: 'Inicio de sesion exitoso.',
    user: {
      email: demoUser.email,
      nombre: demoUser.nombre
    }
  });
});

module.exports = router;