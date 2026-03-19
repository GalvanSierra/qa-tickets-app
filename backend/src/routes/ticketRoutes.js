const express = require('express');
const {
  listTickets,
  getTicketById,
  createTicket,
  updateTicket,
  updateTicketStatus,
  deleteTicket
} = require('../services/ticketService');

const router = express.Router();

function parseId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error('El identificador del ticket no es valido.');
    error.status = 400;
    throw error;
  }

  return id;
}

router.get('/', async (req, res, next) => {
  try {
    const tickets = await listTickets({
      estado: req.query.estado,
      prioridad: req.query.prioridad
    });

    res.json(tickets);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const ticket = await getTicketById(parseId(req.params.id));
    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const ticket = await createTicket(req.body);
    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const ticket = await updateTicket(parseId(req.params.id), req.body);
    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const ticket = await updateTicketStatus(parseId(req.params.id), req.body);
    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteTicket(parseId(req.params.id));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;