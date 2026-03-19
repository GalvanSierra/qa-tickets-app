const { PRIORITIES, STATES } = require('../config/catalogs');
const { getDb } = require('../db/database');
const { validateTicketPayload, validateStatusPayload } = require('../validators/ticketValidator');

function createServiceError(status, message, details = []) {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatTimestamp(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function buildCreateTicketData(payload) {
  const validation = validateTicketPayload(payload, 'create');

  if (!validation.isValid) {
    throw createServiceError(400, 'La informacion del ticket no es valida.', validation.errors);
  }

  return {
    ...validation.sanitized,
    fechaCreacion: formatTimestamp()
  };
}

function buildUpdateTicketData(payload) {
  const validation = validateTicketPayload(payload, 'update');

  if (!validation.isValid) {
    throw createServiceError(400, 'La informacion del ticket no es valida.', validation.errors);
  }

  return validation.sanitized;
}

function buildStatusUpdate(payload) {
  const validation = validateStatusPayload(payload);

  if (!validation.isValid) {
    throw createServiceError(400, 'El estado enviado no es valido.', validation.errors);
  }

  return validation.sanitized;
}

async function listTickets(filters = {}) {
  const db = await getDb();
  const conditions = [];
  const values = [];

  if (filters.estado) {
    if (!STATES.includes(filters.estado)) {
      throw createServiceError(400, 'El estado del filtro no es valido.', [
        `Estado permitido: ${STATES.join(', ')}.`
      ]);
    }

    conditions.push('estado = ?');
    values.push(filters.estado);
  }

  if (filters.prioridad) {
    if (!PRIORITIES.includes(filters.prioridad)) {
      throw createServiceError(400, 'La prioridad del filtro no es valida.', [
        `Prioridad permitida: ${PRIORITIES.join(', ')}.`
      ]);
    }

    conditions.push('prioridad = ?');
    values.push(filters.prioridad);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return db.all(
    `
      SELECT id, titulo, descripcion, prioridad, responsable, estado, fechaCreacion
      FROM tickets
      ${whereClause}
      ORDER BY fechaCreacion DESC, id DESC
    `,
    values
  );
}

async function getTicketById(id) {
  const db = await getDb();
  const ticket = await db.get(
    `
      SELECT id, titulo, descripcion, prioridad, responsable, estado, fechaCreacion
      FROM tickets
      WHERE id = ?
    `,
    [id]
  );

  if (!ticket) {
    throw createServiceError(404, 'Ticket no encontrado.');
  }

  return ticket;
}

async function createTicket(payload) {
  const db = await getDb();
  const ticketData = buildCreateTicketData(payload);

  const result = await db.run(
    `
      INSERT INTO tickets (titulo, descripcion, prioridad, responsable, estado, fechaCreacion)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      ticketData.titulo,
      ticketData.descripcion,
      ticketData.prioridad,
      ticketData.responsable,
      ticketData.estado,
      ticketData.fechaCreacion
    ]
  );

  return getTicketById(result.lastID);
}

async function updateTicket(id, payload) {
  const db = await getDb();
  await getTicketById(id);
  const ticketData = buildUpdateTicketData(payload);

  await db.run(
    `
      UPDATE tickets
      SET titulo = ?, descripcion = ?, prioridad = ?, responsable = ?, estado = ?
      WHERE id = ?
    `,
    [
      ticketData.titulo,
      ticketData.descripcion,
      ticketData.prioridad,
      ticketData.responsable,
      ticketData.estado,
      id
    ]
  );

  return getTicketById(id);
}

async function updateTicketStatus(id, payload) {
  const db = await getDb();
  await getTicketById(id);
  const statusData = buildStatusUpdate(payload);

  await db.run('UPDATE tickets SET estado = ? WHERE id = ?', [statusData.estado, id]);

  return getTicketById(id);
}

async function deleteTicket(id) {
  const db = await getDb();
  await getTicketById(id);
  await db.run('DELETE FROM tickets WHERE id = ?', [id]);

  return {
    message: 'Ticket eliminado correctamente.'
  };
}

module.exports = {
  buildCreateTicketData,
  buildUpdateTicketData,
  buildStatusUpdate,
  listTickets,
  getTicketById,
  createTicket,
  updateTicket,
  updateTicketStatus,
  deleteTicket
};