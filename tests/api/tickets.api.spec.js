const { test, expect } = require('@playwright/test');

async function resetDatabase(request) {
  const response = await request.post('/api/test/reset');
  expect(response.ok()).toBeTruthy();
}

test.beforeEach(async ({ request }) => {
  await resetDatabase(request);
});

test('crear ticket valido', async ({ request }) => {
  const response = await request.post('/api/tickets', {
    data: {
      titulo: 'Ticket creado por API',
      descripcion: 'Caso de prueba para validar el endpoint de creacion.',
      prioridad: 'Alta',
      responsable: 'Equipo QA',
    },
  });

  expect(response.status()).toBe(201);

  const body = await response.json();
  expect(body.titulo).toBe('Ticket creado por API');
  expect(body.estado).toBe('Nuevo');
  expect(body.id).toBeGreaterThan(0);
});

test('rechazar ticket sin titulo', async ({ request }) => {
  const response = await request.post('/api/tickets', {
    data: {
      titulo: ' ',
      descripcion: 'Descripcion incompleta',
      prioridad: 'Media',
      responsable: 'Equipo QA',
    },
  });

  expect(response.status()).toBe(400);

  const body = await response.json();
  expect(body.message).toBe('La informacion del ticket no es valida.');
  expect(body.details).toContain('El titulo es obligatorio.');
});

test('listar tickets semilla', async ({ request }) => {
  const response = await request.get('/api/tickets');
  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeGreaterThanOrEqual(8);
  expect(
    body.some((ticket) => ticket.titulo === 'Error al iniciar sesion')
  ).toBe(true);
  expect(body.some((ticket) => ticket.estado === 'Resuelto')).toBe(true);
});

test('filtrar tickets por estado y prioridad', async ({ request }) => {
  const response = await request.get(
    '/api/tickets?estado=Resuelto&prioridad=Baja'
  );
  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body).toHaveLength(1);
  expect(body[0].titulo).toBe('Validar filtros por prioridad');
});

test('actualizar estado', async ({ request }) => {
  const response = await request.patch('/api/tickets/2/status', {
    data: {
      estado: 'Resuelto',
    },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.id).toBe(2);
  expect(body.estado).toBe('Resuelto');
});

test('eliminar ticket', async ({ request }) => {
  const beforeResponse = await request.get('/api/tickets');
  const beforeTickets = await beforeResponse.json();

  const deleteResponse = await request.delete('/api/tickets/3');
  expect(deleteResponse.ok()).toBeTruthy();

  const afterResponse = await request.get('/api/tickets');
  const afterTickets = await afterResponse.json();
  expect(afterTickets).toHaveLength(beforeTickets.length - 1);

  const detailResponse = await request.get('/api/tickets/3');
  expect(detailResponse.status()).toBe(404);
});

test('retorna 404 para ticket inexistente', async ({ request }) => {
  const response = await request.get('/api/tickets/9999');
  expect(response.status()).toBe(404);
});

test('obtener ticket por ID retorna 200 y datos correctos', async ({
  request,
}) => {
  const response = await request.get('/api/tickets/1');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.id).toBe(1);
  expect(body.titulo).toBeDefined();
});

test('actualizar ticket completo retorna 200 con datos modificados', async ({
  request,
}) => {
  const response = await request.put('/api/tickets/2', {
    data: {
      titulo: 'Editado',
      descripcion: 'Nueva desc',
      prioridad: 'Baja',
      responsable: 'Ana',
      estado: 'En progreso',
    },
  });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.titulo).toBe('Editado');
  expect(body.estado).toBe('En progreso');
});

test('login con credenciales inválidas retorna 401', async ({ request }) => {
  const response = await request.post('/api/auth/login', {
    data: { email: 'wrong@test.com', password: 'wrong' },
  });
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.message).toContain('Credenciales invalidas');
});
