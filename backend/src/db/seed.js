const sampleTickets = [
  {
    titulo: 'Error al iniciar sesion',
    descripcion: 'El formulario muestra un mensaje generico y no orienta al usuario.',
    prioridad: 'Alta',
    responsable: 'Laura Gomez',
    estado: 'En progreso',
    fechaCreacion: '2026-03-15 09:00:00'
  },
  {
    titulo: 'Actualizar texto de ayuda',
    descripcion: 'La pantalla principal necesita instrucciones mas claras para estudiantes nuevos.',
    prioridad: 'Media',
    responsable: 'Carlos Ruiz',
    estado: 'Nuevo',
    fechaCreacion: '2026-03-16 14:30:00'
  },
  {
    titulo: 'Validar filtros por prioridad',
    descripcion: 'Se requiere confirmar que los filtros de busqueda respetan el catalogo permitido.',
    prioridad: 'Baja',
    responsable: 'Ana Torres',
    estado: 'Resuelto',
    fechaCreacion: '2026-03-17 08:15:00'
  },
  {
    titulo: 'Prueba de regresion en formulario de tickets',
    descripcion: 'Se necesita comprobar que el formulario conserva las validaciones despues de un cambio visual.',
    prioridad: 'Alta',
    responsable: 'Miguel Perez',
    estado: 'Nuevo',
    fechaCreacion: '2026-03-17 10:00:00'
  },
  {
    titulo: 'Corregir mensaje de error del login demo',
    descripcion: 'El mensaje debe indicar claramente que las credenciales demo estan precargadas para la practica.',
    prioridad: 'Media',
    responsable: 'Sofia Herrera',
    estado: 'En progreso',
    fechaCreacion: '2026-03-17 11:20:00'
  },
  {
    titulo: 'Ajustar colores para accesibilidad',
    descripcion: 'La interfaz debe mantener buen contraste para explicar criterios basicos de calidad visual.',
    prioridad: 'Baja',
    responsable: 'Diego Ramirez',
    estado: 'Nuevo',
    fechaCreacion: '2026-03-17 13:10:00'
  },
  {
    titulo: 'Ticket resuelto para demo de cierre',
    descripcion: 'Caso listo para mostrar como cambia el estado de un ticket hasta quedar resuelto.',
    prioridad: 'Alta',
    responsable: 'Paula Castillo',
    estado: 'Resuelto',
    fechaCreacion: '2026-03-17 15:45:00'
  },
  {
    titulo: 'Documentar flujo de pruebas',
    descripcion: 'Se requiere una referencia breve para explicar a estudiantes la diferencia entre pruebas unitarias, API y E2E.',
    prioridad: 'Media',
    responsable: 'Camilo Vega',
    estado: 'Resuelto',
    fechaCreacion: '2026-03-17 16:30:00'
  }
];

async function insertTicket(db, ticket) {
  await db.run(
    `
      INSERT INTO tickets (titulo, descripcion, prioridad, responsable, estado, fechaCreacion)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      ticket.titulo,
      ticket.descripcion,
      ticket.prioridad,
      ticket.responsable,
      ticket.estado,
      ticket.fechaCreacion
    ]
  );
}

async function seedTickets(db, options = {}) {
  const { force = false } = options;
  const countResult = await db.get('SELECT COUNT(*) AS count FROM tickets');

  if (!force && countResult.count > 0) {
    return;
  }

  for (const ticket of sampleTickets) {
    await insertTicket(db, ticket);
  }
}

module.exports = {
  sampleTickets,
  insertTicket,
  seedTickets
};