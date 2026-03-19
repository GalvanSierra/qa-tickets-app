# QA Tickets App

QA Tickets App es una mini aplicacion full-stack pensada para fines academicos en QA y DevOps. Su objetivo es mostrar, con el menor ruido posible, un flujo completo de calidad de software: interfaz web, API REST, persistencia real, validaciones, pruebas automatizadas y CI.

La app es intencionalmente pequena. No usa microservicios, JWT, Redux, TypeScript, Docker ni arquitectura avanzada. Cada decision apunta a que estudiantes puedan entender el recorrido de punta a punta sin perderse.

## Proposito del proyecto

Esta aplicacion sirve para ensenar, en un solo repositorio, como se conectan estas piezas:

- una interfaz React facil de recorrer
- una API Express con reglas de negocio claras
- una base SQLite con datos reales
- pruebas unitarias, API y E2E bien separadas
- un pipeline de GitHub Actions que automatiza la calidad

## Stack usado

- Frontend: React + Vite
- Backend: Node.js + Express
- Base de datos: SQLite
- Pruebas unitarias backend: Jest
- Pruebas API: Playwright
- Pruebas E2E: Playwright
- Linting: ESLint
- CI: GitHub Actions

## Usuario demo

- email: `admin@demo.com`
- password: `Admin123*`

## Funcionalidades principales

- Login simple con usuario demo
- Crear, listar, ver detalle, editar y eliminar tickets
- Cambiar estado de tickets
- Filtrar por estado y prioridad
- Validaciones basicas en backend y frontend
- Seed inicial para tener datos utiles desde el primer arranque

## Estructura del proyecto

```text
qa-tickets-app/
|-- backend/
|   |-- src/
|   |   |-- app.js
|   |   |-- server.js
|   |   |-- config/
|   |   |-- db/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- validators/
|   |   `-- test/
|   |       `-- unit/
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- api.js
|   |   |-- App.jsx
|   |   |-- constants.js
|   |   |-- main.jsx
|   |   `-- styles.css
|   |-- index.html
|   |-- package.json
|   `-- vite.config.js
|-- tests/
|   |-- api/
|   `-- e2e/
|-- .github/workflows/ci.yml
|-- eslint.config.js
|-- playwright.api.config.js
|-- playwright.e2e.config.js
|-- package.json
`-- README.md
```

## Datos semilla para demos

La base se crea con varios tickets para facilitar demostraciones de clase, filtros y cambios de estado. En una base nueva, los primeros tickets son estos:

| ID | Titulo | Prioridad | Estado | Responsable |
|---|---|---|---|---|
| 1 | Error al iniciar sesion | Alta | En progreso | Laura Gomez |
| 2 | Actualizar texto de ayuda | Media | Nuevo | Carlos Ruiz |
| 3 | Validar filtros por prioridad | Baja | Resuelto | Ana Torres |
| 4 | Prueba de regresion en formulario de tickets | Alta | Nuevo | Miguel Perez |
| 5 | Corregir mensaje de error del login demo | Media | En progreso | Sofia Herrera |
| 6 | Ajustar colores para accesibilidad | Baja | Nuevo | Diego Ramirez |
| 7 | Ticket resuelto para demo de cierre | Alta | Resuelto | Paula Castillo |
| 8 | Documentar flujo de pruebas | Media | Resuelto | Camilo Vega |

Esto permite hacer demos rapidas de:

- filtros por estado y prioridad
- tickets nuevos, en progreso y resueltos
- diferentes responsables
- actualizacion de estado sin tener que crear datos manualmente

## Como instalar

1. Instala dependencias en la raiz:

```bash
npm install
```

2. Instala el navegador usado por Playwright para las pruebas E2E:

```bash
npx playwright install chromium
```

3. Si quieres inicializar la base manualmente, ejecuta:

```bash
npm run db:init
```

La base tambien se crea automaticamente al arrancar el backend por primera vez.

Nota para Windows PowerShell:
si `npm` es bloqueado por la politica de ejecucion, usa `npm.cmd` en los mismos comandos.

## Como ejecutar frontend y backend

Abre dos terminales en la raiz del proyecto.

Terminal 1:

```bash
npm run backend
```

Terminal 2:

```bash
npm run frontend
```

URLs esperadas:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Endpoints REST del backend

- `POST /api/auth/login`
- `GET /api/tickets`
- `GET /api/tickets/:id`
- `POST /api/tickets`
- `PUT /api/tickets/:id`
- `PATCH /api/tickets/:id/status`
- `DELETE /api/tickets/:id`

## Validaciones implementadas

- `titulo` obligatorio
- `descripcion` obligatoria
- `prioridad` obligatoria
- `responsable` obligatorio
- `estado` inicial por defecto: `Nuevo`
- `prioridad` solo permite: `Baja`, `Media`, `Alta`
- `estado` solo permite: `Nuevo`, `En progreso`, `Resuelto`

## Scripts npm disponibles

- `npm run frontend`: levanta el frontend con Vite
- `npm run backend`: levanta el backend con nodemon
- `npm run db:init`: crea la base SQLite e inserta datos semilla si no existen
- `npm run lint`: ejecuta ESLint en todo el proyecto
- `npm run test:unit`: corre pruebas unitarias del backend
- `npm run test:api`: corre pruebas API con Playwright
- `npm run test:e2e`: corre pruebas end-to-end con Playwright
- `npm run test:all`: corre toda la suite automatizada

## Separacion de pruebas

Las pruebas estan separadas por objetivo para que sea facil explicar el papel de cada una:

### 1. Pruebas unitarias

Ubicacion: `backend/src/test/unit`

Objetivo:
validar funciones pequenas y reglas de negocio sin pasar por HTTP ni por la interfaz.

Ejemplos incluidos:

- validacion de payloads
- estado inicial por defecto
- rechazo de prioridades y estados invalidos
- reglas para crear y actualizar tickets

Ejecucion:

```bash
npm run test:unit
```

### 2. Pruebas API

Ubicacion: `tests/api`

Objetivo:
validar la API REST de manera aislada, sin depender del frontend.

Ejemplos incluidos:

- crear ticket valido
- rechazar ticket sin titulo
- listar tickets semilla
- filtrar tickets
- actualizar estado
- eliminar ticket

Ejecucion:

```bash
npm run test:api
```

### 3. Pruebas E2E

Ubicacion: `tests/e2e`

Objetivo:
validar el flujo completo del usuario, desde la interfaz hasta la persistencia.

Ejemplos incluidos:

- login exitoso
- crear ticket desde UI
- validar mensaje por formulario incompleto
- cambiar estado de un ticket
- filtrar tickets

Ejecucion:

```bash
npm run test:e2e
```

## Estabilidad de las pruebas

La suite esta preparada para ser repetible y estable:

- las pruebas API y E2E reinician la base de datos antes de cada caso usando un endpoint de testing
- las pruebas usan datos semilla conocidos y suficientes para demos
- los tests E2E usan regiones accesibles de la interfaz en lugar de depender solo de clases CSS
- las pruebas unitarias usan Jest en modo secuencial para evitar fragilidad en entornos restringidos

Para correr todo junto:

```bash
npm run test:all
```

## Como funciona el pipeline

El workflow [ci.yml](./.github/workflows/ci.yml) ejecuta este flujo:

1. checkout del repositorio
2. instalacion de Node.js
3. instalacion de dependencias con `npm ci`
4. instalacion de Chromium para Playwright
5. lint
6. pruebas unitarias
7. pruebas API
8. pruebas E2E
9. subida de artefactos de Playwright si algo falla

Esto deja una puerta de calidad simple, visible y adecuada para clase.

## Uso en clase

### Objetivos de aprendizaje

- comprender la diferencia entre pruebas unitarias, pruebas API y pruebas E2E
- relacionar requisitos funcionales con casos de prueba automatizados
- identificar donde conviene validar en frontend y donde conviene validar en backend
- entender el valor de datos semilla y entornos repetibles para automatizacion
- observar como un pipeline CI automatiza controles de calidad

### Actividades sugeridas

- ejecutar la app manualmente y recorrer login, CRUD, filtros y cambio de estado
- revisar el backend y pedir a estudiantes ubicar donde estan las validaciones
- correr `npm run test:unit`, `npm run test:api` y `npm run test:e2e` por separado y comparar que cubre cada suite
- modificar una regla, por ejemplo hacer obligatorio un campo adicional, y actualizar las pruebas correspondientes
- pedir que agreguen un caso de prueba nuevo para un bug imaginario o una regla nueva
- revisar el workflow de GitHub Actions y discutir por que el orden de pasos importa

### Errores tipicos para discutir con estudiantes

- validar solo en frontend y olvidar validar tambien en backend
- escribir pruebas E2E que dependen de datos creados manualmente y no de un entorno reiniciable
- usar selectores UI fragiles en lugar de selectores mas accesibles y estables
- acoplar demasiado las pruebas a conteos exactos cuando no es necesario
- mezclar responsabilidades de una suite con otra, por ejemplo usar E2E para probar reglas pequenas que deberian vivir en unitarias

### Posibles extensiones futuras

- agregar busqueda por texto
- agregar comentarios o historial simple por ticket
- incorporar reporte de cobertura para pruebas unitarias
- agregar una prueba de contrato o validacion de esquema de API
- incluir mas checks en CI, como build del frontend o artefactos HTML de reportes
- introducir autenticacion real en una segunda fase del curso para comparar complejidad

## Decisiones de arquitectura

Estas son las decisiones mas importantes y por que se tomaron asi:

- Login simulado en lugar de autenticacion real: reduce complejidad y mantiene el foco en calidad y automatizacion.
- Monorepo pequeno con `frontend` y `backend`: facilita explicar donde vive cada responsabilidad.
- SQLite con inicializacion automatica y seed: permite persistencia real sin depender de servicios externos.
- Una sola entidad principal (`tickets`): mantiene el dominio pequeno y comprensible.
- React sin router ni estado global: suficiente para este caso y mas facil de estudiar.
- Servicio + validador en backend: muestra estructura profesional basica sin sobredisenar.
- Endpoint `/api/test/reset` solo para testing: ayuda a explicar pruebas repetibles y datos controlados.

## Que se puede ensenar con esta app en QA/DevOps

- diferencia de alcance entre tipos de prueba
- trazabilidad entre requisitos y automatizacion
- validaciones de negocio y feedback al usuario
- importancia de datos semilla y reinicio de entorno
- integracion de linting como control temprano
- uso de CI como ejecucion automatica de puertas de calidad
- valor de mantener una arquitectura simple para automatizar mejor

## Configuracion util

No hace falta crear un archivo `.env`, pero el backend soporta:

- `PORT`: puerto del backend
- `DB_PATH`: ruta del archivo SQLite
- `ENABLE_TEST_ENDPOINTS=true`: habilita el endpoint de reseteo para pruebas

El frontend soporta:

- `VITE_API_URL`: URL base de la API

## Estado del proyecto

El proyecto queda listo para:

- ejecutar frontend y backend localmente
- usar SQLite real con datos semilla utiles
- correr lint
- correr pruebas unitarias, API y E2E por separado o juntas
- ejecutar pipeline de GitHub Actions con todas las verificaciones pedidas