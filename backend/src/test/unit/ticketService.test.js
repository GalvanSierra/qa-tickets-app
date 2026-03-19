const { describe, expect, test } = require('@jest/globals');
const {
  buildCreateTicketData,
  buildUpdateTicketData,
  buildStatusUpdate
} = require('../../services/ticketService');

describe('ticketService business rules', () => {
  test('completa fecha de creacion al preparar un ticket nuevo', () => {
    const ticket = buildCreateTicketData({
      titulo: 'Ticket demo',
      descripcion: 'Descripcion demo',
      prioridad: 'Baja',
      responsable: 'Pedro'
    });

    expect(ticket.estado).toBe('Nuevo');
    expect(ticket.fechaCreacion).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  test('requiere estado al actualizar un ticket completo', () => {
    expect(() =>
      buildUpdateTicketData({
        titulo: 'Ticket demo',
        descripcion: 'Descripcion demo',
        prioridad: 'Baja',
        responsable: 'Pedro'
      })
    ).toThrow('La informacion del ticket no es valida.');
  });

  test('solo permite cambios de estado validos', () => {
    expect(() =>
      buildStatusUpdate({
        estado: 'Pendiente QA'
      })
    ).toThrow('El estado enviado no es valido.');
  });
});