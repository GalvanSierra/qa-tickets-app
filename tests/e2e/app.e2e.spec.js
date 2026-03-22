const { test, expect } = require('@playwright/test');

async function resetDatabase(request) {
  const response = await request.post('http://127.0.0.1:3100/api/test/reset');
  expect(response.ok()).toBeTruthy();
}

async function login(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Listado general' })).toBeVisible();
}

test.beforeEach(async ({ page, request }) => {
  await resetDatabase(request);
  await page.goto('/');
});

test('login exitoso', async ({ page }) => {
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByText('Inicio de sesion exitoso.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Listado general' })).toBeVisible();
});

test('crear ticket desde la interfaz', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Nuevo ticket' }).click();

  const form = page.getByRole('region', { name: 'Formulario de creacion de ticket' });
  await form.getByLabel('Titulo').fill('Ticket creado desde UI');
  await form.getByLabel('Descripcion').fill('Este ticket valida el flujo completo desde la interfaz.');
  await form.getByLabel('Prioridad').selectOption('Alta');
  await form.getByLabel('Responsable').fill('Patricia QA');
  await page.getByRole('button', { name: 'Crear ticket' }).click();

  const list = page.getByRole('region', { name: 'Listado de tickets' });
  await expect(page.getByText('Ticket creado correctamente.')).toBeVisible();
  await expect(list.getByText('Ticket creado desde UI')).toBeVisible();
});

test('muestra error por formulario incompleto', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Nuevo ticket' }).click();
  await page.getByRole('button', { name: 'Crear ticket' }).click();

  await expect(page.getByText('El titulo es obligatorio.')).toBeVisible();
  await expect(page.getByText('La descripcion es obligatoria.')).toBeVisible();
});

test('cambiar estado de un ticket', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: /Actualizar texto de ayuda/i }).click();

  const detail = page.getByRole('region', { name: 'Detalle del ticket' });
  await detail.getByLabel('Cambiar estado').selectOption('Resuelto');
  await page.getByRole('button', { name: 'Actualizar estado' }).click();

  await expect(page.getByText('Estado actualizado correctamente.')).toBeVisible();
  await expect(detail.locator('.badge-resuelto').first()).toBeVisible();
});

test('filtrar tickets', async ({ page }) => {
  await login(page);

  const filters = page.getByRole('region', { name: 'Filtros de tickets' });
  const list = page.getByRole('region', { name: 'Listado de tickets' });

  await filters.getByLabel('Estado').selectOption('Resuelto');
  await filters.getByLabel('Prioridad').selectOption('Baja');

  await expect(list.getByText('Validar filtros por prioridad')).toBeVisible();
  await expect(list.getByText('Actualizar texto de ayuda')).toHaveCount(0);
});

// test('editar ticket desde la interfaz', async ({ page }) => {
// await login(page);
// // Seleccionar ticket
// await page.getByText('Actualizar texto de ayuda').click();
// // Abrir edición
// await page.getByRole('button', { name: /Editar/i }).click();

// // Modificar campos
// const form = page.getByRole('region', { name: /Formulario/i });
// await form.getByLabel('Titulo').fill('Titulo editado');
// await form.getByLabel('Prioridad').selectOption('Baja');

// // Guardar
// await page.getByRole('button', { name: 'Guardar cambios' }).click();

// // Verificar
// await expect(page.getByText('Ticket actualizado correctamente.')).toBeVisible();
// await expect(page.getByText('Titulo editado')).toBeVisible();
// })

test('eliminar ticket muestra confirmación y actualiza lista', async ({ page }) => {
await login(page);
await page.getByText('Error al iniciar sesion').click();

page.on('dialog', dialog => dialog.accept());
await page.getByRole('button', { name: /Eliminar/i }).click();

await expect(page.getByText('Ticket eliminado correctamente.')).toBeVisible();
await expect(page.getByText('Error al iniciar sesion')).toHaveCount(0);
});
