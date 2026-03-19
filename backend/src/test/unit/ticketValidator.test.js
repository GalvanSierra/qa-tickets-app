const { describe, expect, test } = require('@jest/globals');
const { validateTicketPayload, validateStatusPayload } = require('../../validators/ticketValidator');

describe('ticketValidator', () => {
  test('acepta un ticket valido y asigna estado inicial Nuevo por defecto', () => {
    const result = validateTicketPayload({
      titulo: 'Nuevo ticket',
      descripcion: 'Descripcion valida',
      prioridad: 'Alta',
      responsable: 'Maria'
    });

    expect(result.isValid).toBe(true);
    expect(result.sanitized.estado).toBe('Nuevo');
  });

  test('rechaza un ticket sin titulo', () => {
    const result = validateTicketPayload({
      titulo: ' ',
      descripcion: 'Descripcion valida',
      prioridad: 'Media',
      responsable: 'Maria'
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El titulo es obligatorio.');
  });

  test('rechaza prioridades fuera del catalogo', () => {
    const result = validateTicketPayload({
      titulo: 'Ticket',
      descripcion: 'Descripcion',
      prioridad: 'Urgente',
      responsable: 'Maria'
    });

    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('prioridad');
  });

  test('rechaza estados fuera del catalogo en actualizacion', () => {
    const result = validateTicketPayload(
      {
        titulo: 'Ticket',
        descripcion: 'Descripcion',
        prioridad: 'Alta',
        responsable: 'Maria',
        estado: 'Cerrado'
      },
      'update'
    );

    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('estado');
  });

  test('valida cambios de estado puntuales', () => {
    const result = validateStatusPayload({
      estado: 'Resuelto'
    });

    expect(result.isValid).toBe(true);
    expect(result.sanitized.estado).toBe('Resuelto');
  });
});