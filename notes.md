### 11. **Revise las pruebas E2E actuales. ¿Cubren flujos críticos del usuario o se enfocan en interacciones de poco valor? Argumente.**

Los flujos actuales cubiertos por las pruebas E2E son: login exitoso, crear ticket desde UI, validar mensaje por formulario incompleto, cambiar estado de un ticket y filtrar tickets.

Todos son flujos críticos, refiriéndonos como ‘critico’ a los comportamientos más comunes que tendrá el usuario dentro del sistema de tickets como el login crear, consultar y actualizar tickets.

El test de 'validar mensaje por formulario incompleto' puede ser redundante si el test 'rechazar ticket sin titulo' (tickets.api.spec.js:30-45) ya existe.

### 12. **¿Observa huecos claros de regresión en las pruebas existentes? Señale al menos dos.**

Si, hay huecos claros de regresión:

- En el E2E no hay una cobertura total de los flujos críticos tales como la edición del ticket (no unicamente el estado) y eliminación de tickets.

- En el API no hay pruebas para `PUT /api/tickets/:id` - La actualización completa de tickets no tiene cobertura de pruebas en ninguna capa.

- En ambos E2E y API no hay pruebas de cierre de sesión o ingreso con credenciales invalidas.

---

### 13 **¿Qué funcionalidad del sistema considera más expuesta a una regresión no detectada por la suite actual? Explique por qué.**

Actualización completa de tickets (`PUT /api/tickets/:id`) debido a que no existen Unit test, API test, ni E2E test y es usada en el frontend con `api.updateTicket(id, payload) // → PUT /api/tickets/:id`

¿Por qué es la más expuesta?

1. Se usa en producción pero nadie la verifica.
   En frontend/src/components/TicketDashboard.jsx existe un formulario de edición completo pero ningún test verifica que este flujo funcione.
2. Es la única forma de cambiar múltiples campos a la vez

3. Validación más compleja que otras operaciones
   buildUpdateTicketData() requiere estado obligatorio (ticketValidator.js:22):
   estado: mode === 'create' ? payload.estado || 'Nuevo' : normalizeString(payload.estado)
   Un regresión aquí podría:
   - Permitir actualizar sin estado
   - Aceptar estados inválidos como "Cerrado" (válido en catálogo pero rechazado en update)
   - Sobrescribir datos sin validación

La actualización completa (PUT /tickets/:id) es la funcionalidad más expuesta porque es usada activamente por el frontend, tiene lógica de validación única, y no tiene cobertura de pruebas en ningún nivel. Una regresión en buildUpdateTicketData() o updateTicket() pasaría desapercibida hasta que un usuario real edite un ticket.

### 14 **Tomando como referencia el proyecto, explique con ejemplos concretos qué tipo de validaciones conviene automatizar como pruebas unitarias y cuáles no.**

Convine automatizar pruebas de lógica pura de validación y transformación. Estas funciones son deterministas, sin dependencias externas y su comportamiento se verifica bien con unit tests:

1. `validateTicketPayload() (ticketValidator.js)`

   ```jsx

   test('rechaza un ticket sin titulo', () => {
   const result = validateTicketPayload({ titulo: ' ', ... });
   expect(result.isValid).toBe(false);
   expect(result.errors).toContain('El titulo es obligatorio.');
   });
   ```

2. `buildCreateTicketData() en ticketService.js:20-31`

   Recibe payload → Retorna datos con fecha formateada

   No deberían de ser automatizadas validaciones que requieren contexto HTTP

3. Validación de rutas/endpoints

   ```jsx
   // MAL: Probar Express routes con Jest
   test('crear ticket valido', () => {
   const app = express();
   app.post('/tickets', ...);
   request(app).post('/tickets', {...}).expect(201); // ❌
   });
   ```

   Razón: Necesitas montar el servidor real, base de datos, middleware. Esto es prueba de integración/API.

4. Consultas a base de datos

   ```jsx
   // MAL: Probar deleteTicket() con Jest
   test('elimina ticket', async () => {
     await deleteTicket(3); // ❌ Depende de SQLite real
     const ticket = await getTicketById(3);
     expect(ticket).toBeUndefined();
   });
   ```

5. Flujos end-to-end

   ```jsx
   test('login exitoso', () => {
   const page = await browser.newPage(); // ❌ Requiere navegador real
   await page.goto('/');
   ...
   });
   ```

---

### 15 **Tomando como referencia el proyecto, explique con ejemplos concretos qué comportamientos conviene validar a nivel de API.**

1. Contrato de endpoints (status codes y estructura)

```jsx
// tickets.api.spec.js:30-45
test('rechazar ticket sin titulo', async ({ request }) => {
  const response = await request.post('/api/tickets', {
    data: {
      titulo: ' ',
      descripcion: '...',
      prioridad: 'Media',
      responsable: 'QA',
    },
  });
  expect(response.status()).toBe(400); // Verifica código HTTP
  const body = await response.json();
  expect(body.message).toBe('La informacion del ticket no es valida.');
  expect(body.details).toContain('El titulo es obligatorio.'); // Estructura de respuesta
});
```

Por qué API y no unit: Verifica que Express envíe el código 400, no el validador. El validador podría retornar {isValid: false} pero la ruta podría enviar 200.

Comportamiento de filtros

```jsx
// tickets.api.spec.js:58-65
test('filtrar tickets por estado y prioridad', async ({ request }) => {
  const response = await request.get(
    '/api/tickets?estado=Resuelto&prioridad=Baja'
  );
  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body).toHaveLength(1);
  expect(body[0].titulo).toBe('Validar filtros por prioridad');
});
```

Por qué API: La query string llega al service via req.query.estado (ticketRoutes.js:28). El unit test no puede probar que el parámetro llegue correctamente desde HTTP.

Casos borde de HTTP

```jsx
// LO QUE FALTA en los tests actuales
test('retorna 404 para ticket inexistente', async ({ request }) => {
  const response = await request.get('/api/tickets/9999');
  expect(response.status()).toBe(404);
});
```

Por qué API: El error 404 se genera en getTicketById() pero se propaga via next(error) (ticketRoutes.js:42). El middleware de errores Express lo convierte en respuesta HTTP

### 16. Tomando como referencia el proyecto, explique qué flujos sí justifican una prueba E2E y cuáles no merecen ese costo

Los que merecen el costo son los flujos críticos del sistema explicados anteriormente tales como inicio de sesión (credenciales validas e invalidas), operaciones CRUD y el filtrado sobre los tickets, dado que necesitan verificar que múltiples capas (HTTP + DOM + estado + interacción humana) trabajan juntas de forma que ningún test de nivel inferior puede replicar.

- Login completo (ya existe)

  ```jsx
  test('login exitoso', async ({ page }) => {});
  ```

¿Por qué? Depende de: render del DOM → click del usuario → fetch → localStorage → redirect. Múltiples capas interactuando.

- Crear ticket con éxito (ya existe)

```jsx
test('crear ticket desde la interfaz', async ({ page }) => {});
```

¿Por qué? Verifica: modal abre → usuario llena formulario → submit → API → notificación → lista actualiza → elemento aparece en pantalla. Un test de API no puede verificar que el DOM se actualizó.

- Editar ticket existente (NO existe - hueco)

  ```jsx
  // TicketDashboard.jsx:123-129

  const updatedTicket = await api.updateTicket(selectedTicket.id, formData);
  onNotify('success', 'Ticket actualizado correctamente.');
  closeForm();
  await loadTickets(updatedTicket.id);
  await loadSelectedTicket(updatedTicket.id);
  return;
  ```

Solo E2E puede verificar que:

- El formulario de edición se abre con datos precargados
- Los campos se modifican correctamente
- Al guardar, la lista y el detalle se actualizan
- El modal se cierra

Operaciones que no requieren una prueba E2E serian flujos redundantes frente a los críticos y/o su alcance es limitado a una capa de la aplicación, como:

- Validación de formulario vacío (ya existe)

  ```jsx
  test('muestra error por formulario incompleto', async ({ page }) => {
    await page.getByRole('button', { name: 'Crear ticket' }).click();
    await expect(page.getByText('El titulo es obligatorio.')).toBeVisible();
  });
  ```

  La lógica de validación ya existe en unit tests (ticketValidator.test.js). El test E2E solo verifica que el error del API se renderiza en el DOM. Eso es redundante.

---

### 17 Si el equipo decidiera agregar 10 pruebas nuevas, ¿cómo las distribuiría entre unitarias, API y E2E? Justifique el criterio de reparto.

Unit Tests (4)
Justificación: Son rápidas, deterministas y detectan regresiones en lógica pura

1. parseId() - casos de borde

   ```jsx
   test('retorna 400 para ID no numérico', () => {
     expect(() => parseId('abc')).toThrow(
       'El identificador del ticket no es valido.'
     );
   });

   test('retorna 400 para ID negativo', () => {
     expect(() => parseId('-5')).toThrow();
   });
   ```

2. validateTicketPayload() - responsable obligatorio

   ```jsx
   test('rechaza ticket sin responsable', () => {
     const result = validateTicketPayload({
       titulo: 'Test',
       descripcion: 'Test',
       prioridad: 'Alta',
       responsable: ' ',
     });
     expect(result.isValid).toBe(false);
     expect(result.errors).toContain('El responsable es obligatorio.');
   });
   ```

3. validateTicketPayload() - descripción obligatoria (existe en validator pero no en unit)

   ```jsx
   test('rechaza ticket sin descripción', () => {
     const result = validateTicketPayload({
       titulo: 'Test',
       descripcion: ' ',
       prioridad: 'Alta',
       responsable: 'Pedro',
     });
     expect(result.isValid).toBe(false);
     expect(result.errors).toContain('La descripcion es obligatoria.');
   });
   ```

---

API Tests (4)

Justificación: Verifican contrato HTTP, status codes y la cadena ruta→servicio→DB

5.  GET /api/tickets/:id - obtener detalle

```jsx
test('obtener ticket por ID retorna 200 y datos correctos', async ({
  request,
}) => {
  const response = await request.get('/api/tickets/1');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.id).toBe(1);
  expect(body.titulo).toBeDefined();
});
```

6. PUT /api/tickets/:id - actualización completa (funcionalidad más expuesta)

```jsx
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
```

7. GET /api/tickets/:id - 404 para inexistente

```jsx
test('retorna 404 para ticket inexistente', async ({ request }) => {
  const response = await request.get('/api/tickets/9999');
  expect(response.status()).toBe(404);
  const body = await response.json();
  expect(body.message).toBe('Ticket no encontrado.');
});
```

8. POST /api/auth/login - credenciales inválidas (401)

```jsx
test('login con credenciales inválidas retorna 401', async ({ request }) => {
  const response = await request.post('/api/auth/login', {
    data: { email: 'wrong@test.com', password: 'wrong' },
  });
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.message).toContain('Credenciales invalidas');
});
```

---

E2E Tests (2)
Justificación: Solo E2E puede verificar el flujo completo de edición con formulario precargado 9. Editar ticket existente (flujo completo)
test('editar ticket desde la interfaz', async ({ page }) => {
await login(page);
// Seleccionar ticket
await page.getByText('Actualizar texto de ayuda').click();
// Abrir edición
await page.getByRole('button', { name: /Editar/i }).click();

// Modificar campos
const form = page.getByRole('region', { name: /Formulario/i });
await form.getByLabel('Titulo').fill('Titulo editado');
await form.getByLabel('Prioridad').selectOption('Baja');

// Guardar
await page.getByRole('button', { name: 'Guardar cambios' }).click();

// Verificar
await expect(page.getByText('Ticket actualizado correctamente.')).toBeVisible();
await expect(page.getByText('Titulo editado')).toBeVisible();
}); 10. Eliminar ticket con confirmación
test('eliminar ticket muestra confirmación y actualiza lista', async ({ page }) => {
await login(page);
await page.getByText('Error al iniciar sesion').click();

page.on('dialog', dialog => dialog.accept());
await page.getByRole('button', { name: /Eliminar/i }).click();

await expect(page.getByText('Ticket eliminado correctamente.')).toBeVisible();
await expect(page.getByText('Error al iniciar sesion')).toHaveCount(0);
});

---

### 18. Explique por qué una estrategia basada casi exclusivamente en E2E sería técnicamente más costosa y menos conveniente para este proyecto.

Fragilidad de los tests: Los tests E2E dependen de selectores del DOM

```jsx
// Si alguien renombra un botón...
await page.getByRole('button', { name: 'Crear ticket' }).click();
// ↓ Esto rompe el test
await page.getByRole('button', { name: 'Guardar ticket' }).click();
En este proyecto:
```

- TicketDashboard.jsx usa getByRole('button', { name: '...' })
- Si un diseñador cambia "Eliminar" por "Borrar", Fallan los tests
- Un test unitario de deleteTicket() no se rompe por cambios de UX

3. Dependencias externas

   Un test unitario solo necesita node y el módulo. Un test E2E necesita toda la infraestructura de un servidor backend corriendo, bases de datos inicializada, frontend corriendo en puerto, navegador Chromium (Playwright) y red entre procesos.

4. Dificultad de depuración

   Un test E2E falló con el siguiente mensaje "No se encontró el botón Crear ticket"
   Posibles causas:
   - El botón no existe en el DOM
   - El formulario no se abrió
   - El usuario no estaba logueado
   - La API respondió 500
   - La DB no tiene datos
   - El timeout fue muy corto
   - El selector cambió

   En unit test:
   Test unit falló: "Expected 400, got 200"
   Causa única: parseId() permite IDs inválidos

5. Costo de mantenimiento exponencial tanto en planeación, implementación,costos, etc. Multiplicando el costo por 3-4x sin mejorar la cobertura real.

### 19. ¿Qué cambios futuros podrían romper el negocio sin ser detectados por las pruebas actuales? Explique el riesgo desde la perspectiva de cobertura

1 . Agregar campo categoria obligatorio
// Nuevo requisito: todos los tickets deben tener categoría
async function createTicket(payload) {
const ticketData = buildCreateTicketData(payload);
// Sin agregar validación de 'categoria'
}
Riesgo: Se agrega código en el frontend y la DB, pero nadie actualiza validateTicketPayload().
Tests actuales: No hay test que verifique que TODOS los campos obligatorios son validados.
Regresión no detectada: Tickets sin categoría se crean correctamente en la DB.

---

3. Cambiar formato de fecha
   // ticketService.js
   function formatTimestamp() {
   return new Date().toISOString(); // Antes: "2024-01-01 12:00:00"
   } // Después: "2024-01-01T12:00:00.000Z"
   Tests actuales:
   // Unit test hardcodea el formato
   expect(ticket.fechaCreacion).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
   Regresión no detectada: Si se cambia el formato, el unit test falla pero la API sigue funcionando. Sin embargo, el frontend que formatea esa fecha podría romperse silenciosamente.

---

5. Agregar autenticación real
   // Nuevo requisito: JWT en headers
   router.get('/tickets', authMiddleware, async (req, res) => { ... });
   Riesgo: El test E2E actual usa login() que funciona con sesión implícita. Si se cambia a JWT, los tests E2E pasan (porque Playwright maneja cookies) pero los API tests fallan.
   Tests actuales: Los API tests no verifican autenticación en absoluto.
   Regresión no detectada: Endpoints expuestos sin autenticación.

---

6. Cambiar nombre de campo responsable → asignado
   // Nuevo requisito de negocio: renombrar campo
   const ticket = { ...responsable: 'Pedro' }; // Antes
   const ticket = { ...asignado: 'Pedro' }; // Después
   Riesgo: Backend cambia el nombre, frontend espera responsable, el detalle del ticket muestra undefined.
   Tests actuales:

- API test verifica body.titulo, body.estado, pero no verifica todos los campos
- E2E solo busca texto visible, no estructura del JSON
  Regresión no detectada: Campo responsable desaparece del response sin warning.

### 20 ¿Qué prácticas adicionales propondría para fortalecer el aseguramiento de la calidad del proyecto sin aumentar demasiado su complejidad?

1. Reporte de cobertura para las pruebas unitarias
   El backend/package.json corre Jest con --runInBand, pero no tiene configurado --coverage. Las pruebas unitarias actuales en ticketValidator.test.js y ticketService.test.js cubren casos felices y algunos negativos, pero no hay manera de saber qué porcentaje del validador o del servicio está siendo ejercido. Agregar jest --coverage al script test:unit costaría cero esfuerzo y daría visibilidad inmediata sobre zonas ciegas, como por ejemplo si buildUpdateTicketData tiene ramas sin testear.
2. Validación de esquema de respuesta en las pruebas de API
   Revisando tests/api/tickets.api.spec.js, los tests verifican campos puntuales como body.titulo o body.estado, pero ninguno valida la estructura completa del objeto retornado. Si mañana alguien elimina fechaCreacion del SELECT en ticketService.js, ninguna prueba de API lo detectaría a menos que ese campo se esté usando explícitamente. Agregar una validación de esquema liviana, sin necesidad de una librería como Zod, bastaría con un helper que compruebe que las claves esperadas existen en el body. Costo bajo, ganancia real en regresiones silenciosas.
