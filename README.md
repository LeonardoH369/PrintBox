# PrintBox — Evidencia 2 / Learning Outcome 2

Aplicación para administrar productos y pedidos de una tienda de impresión 3D. Continúa la API existente y sus vistas de productos. La lógica utiliza **JavaScript, Node.js, Express, Sequelize y MariaDB/MySQL**; las vistas usan **HTML, CSS y JavaScript**, sin cambiar a PHP/Laravel/Blade.

La adaptación conserva los objetivos funcionales de la actividad. La aceptación de la sustitución tecnológica corresponde al docente; este repositorio no constituye su aprobación.

## Instalación

Requisitos: Node.js 24 (versión usada en la verificación), npm y MariaDB o MySQL. Crea un usuario de base con permisos sobre una base de desarrollo exclusiva para PrintBox. No uses credenciales de producción.

```sh
git clone https://github.com/LeonardoH369/PrintBox.git
cd PrintBox
git switch codex/evidence-2
npm ci
```

Copia `.env.example` como `.env` y configura `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`. La contraseña inicial debe tener de 12 a 128 caracteres. No existe una contraseña de acceso predeterminada.

```sh
npm run db:create
npm run db:migrate
npm run admin:create
```

Si tu usuario no tiene permiso para crear bases, crea `DB_NAME` desde tu administrador de MariaDB/MySQL y omite `db:create`. Las migraciones nuevas agregan tablas sin reemplazar la tabla Products.

Para datos de demostración, configura `SEED_DEMO=true` en `.env` y ejecuta **una vez** el seeder original de productos, que no es idempotente:

```sh
npx sequelize-cli db:seed --seed 20261003000001initialProducts.js
npx sequelize-cli db:seed --seed 20261025000001-evidence2-demo.js
npm run dev
```

El segundo seeder es idempotente y crea una cuenta inactiva sin contraseña conocida, cinco pedidos ficticios (uno archivado), historial y evidencias de imagen de un píxel. Esas imágenes son datos de prueba, **no fotografías de entregas reales**. Para probar la cámara utiliza tus propias fotografías. Después de cargar demos, vuelve a `SEED_DEMO=false`. `db:seed` ejecuta ambos seeders; no lo repitas indiscriminadamente porque el original duplica productos.

- Inicio y búsqueda por folio: `http://localhost:3000/`.
- Acceso del personal: `http://localhost:3000/login`.
- Dashboard protegido: `http://localhost:3000/admin`.
- Productos protegidos: `http://localhost:3000/products`.
- Swagger del catálogo: `http://localhost:3000/api/docs` (requiere sesión; operaciones de escritura requieren el encabezado `X-PrintBox: 1`).

`PORT` permite cambiar el puerto. El folio `PB-…` es el número de pedido para seguimiento de esta actividad; no es un comprobante fiscal. Cópialo desde el panel y compártelo sólo con el cliente.

## Correspondencia con la rúbrica

| Criterio                      | Implementación / ubicación                                                                                                                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Modelos y relaciones          | `src/infrastructure/database/models/index.js`: User, Session, Order, OrderItem, OrderHistory, Evidence, relacionados mediante `hasMany` y `belongsTo`; ProductModel conserva el catálogo |
| Migraciones con PK y FK       | `src/infrastructure/database/migrations/`: Products y tablas de la evidencia; FK con RESTRICT, índices y folio/correo únicos                                                             |
| Controladores                 | `src/api/controllers/`: ProductController, AuthController, UserController y OrderController                                                                                              |
| Seeders y factory             | `src/infrastructure/database/seeders/` y `factories/ProductFactory.js`                                                                                                                   |
| Inicio público                | `src/web/tracking.html`: búsqueda por folio, estado y fecha del proceso; fotografía final si está entregado                                                                              |
| Vistas protegidas / dashboard | `src/web/admin.html`, autenticación en servidor y enlaces a los módulos                                                                                                                  |
| Usuarios                      | Listado activo/inactivo; creación; edición de nombre, correo, departamento, rol y estado; contraseña opcional al editar                                                                  |
| Pedidos                       | Listado descendente, creación con productos y cantidades, detalle, edición de cliente/descripción y cambios de estado                                                                    |
| Evidencias fotográficas       | Cámara o archivo PNG/JPEG obligatorio al pasar a en ruta y entregado; consulta desde el pedido                                                                                           |
| Borrado lógico / recuperación | `archivedAt`, listado de archivados y recuperación conservando líneas, fotos e historial                                                                                                 |
| GitHub y README               | Código y descripción de cambios en este repositorio; ver `docs/EVIDENCIA_2.md` para la demostración                                                                                      |

Relaciones: un usuario tiene sesiones y pedidos creados; un pedido tiene líneas, historial y fotos; cada línea pertenece a un producto; cada evento y foto registra el usuario responsable. Los precios se copian a la línea para conservar el importe histórico.

## Permisos y reglas

- **ADMIN:** usuarios, productos, pedidos, archivado y recuperación.
- **OPERATOR:** consulta de productos, creación y edición de pedidos, avance de estados y fotografías. No administra usuarios/productos ni archiva.
- No existe registro público. El primer administrador se crea por consola; después, desde Usuarios.
- No se permite desactivar ni quitar el rol al último administrador activo. Editar un usuario invalida sus sesiones; si editas tu propia cuenta debes volver a iniciar sesión.
- Sesiones de ocho horas con cookie HttpOnly/SameSite=Strict y Secure en producción. En base sólo se almacena el hash del token. Contraseñas con scrypt y salt aleatorio. Login limitado por IP en memoria.
- Las APIs comprueban autorización en cada solicitud. Las escrituras requieren `X-PrintBox: 1`; CORS queda cerrado para impedir solicitudes del navegador desde otros sitios. JSON máximo 5 MB; fotografías máximo 3 MB, MIME y firma PNG/JPEG comprobados.
- Flujo: recibido → en impresión → listo → en ruta → entregado. No se permiten saltos ni retrocesos. Foto y cambio de estado se guardan en la misma transacción.
- La creación de pedidos descuenta stock con bloqueo de filas y transacción; si falta stock, todo se revierte. Las cantidades de un mismo producto deben agruparse.
- Archivar oculta el pedido del listado activo y del seguimiento público. **No cancela ni devuelve stock**. Recuperar tampoco vuelve a descontarlo.
- La edición del pedido comprende cliente y descripción antes de la entrega. Las líneas y sus precios se conservan como historial; no hay edición de líneas ni cancelación con devolución de stock en esta entrega.

## API de la evidencia

Todas las escrituras usan JSON y `X-PrintBox: 1`. Las rutas privadas usan la cookie obtenida al iniciar sesión.

| Método             | Ruta                                   | Uso                                             |
| ------------------ | -------------------------------------- | ----------------------------------------------- |
| POST               | `/api/auth/login`                      | `{email,password}`                              |
| GET / POST         | `/api/auth/me` / `/api/auth/logout`    | Consultar sesión / salir                        |
| GET                | `/api/tracking/:invoice`               | Público: estado, fecha y ruta de foto final     |
| GET                | `/api/tracking/:invoice/photo`         | Público: foto final del folio activo entregado  |
| GET / POST         | `/api/users`                           | Listar / crear usuarios, sólo ADMIN             |
| PUT                | `/api/users/:id`                       | Editar usuario, sólo ADMIN                      |
| GET / POST         | `/api/orders`                          | Listar / crear pedido                           |
| GET                | `/api/orders?archived=true`            | Pedidos archivados                              |
| GET / PUT / DELETE | `/api/orders/:id`                      | Detalle / editar / archivar (DELETE sólo ADMIN) |
| POST               | `/api/orders/:id/status`               | `{status,photo?:{mime,base64}}`                 |
| POST               | `/api/orders/:id/restore`              | Recuperar, sólo ADMIN                           |
| GET                | `/api/orders/:id/evidence/:evidenceId` | Fotografía privada                              |

Crear pedido: `{ "customerName": "Cliente", "description": "Pieza PLA", "items": [{"productId": 1, "quantity": 2}] }`. La API anterior `/api/products` se conserva, ahora protegida por sesión y rol para escrituras.

## Pruebas

```sh
npm test
npm run test:factory
npm run factory:preview -- 5
```

Para ejecutar también integración, crea una base **desechable** cuyo nombre termine en `_test`, apunta las variables DB a ella y aplica migraciones. No cargues seeders para esta prueba. En PowerShell:

```powershell
$env:DB_NAME='printbox_e2_test'
npm run db:create
npm run db:migrate
$env:RUN_DB_TESTS='true'
npm test
```

Linux: `RUN_DB_TESTS=true npm test`. La prueba crea sus propias cuentas y filas y las elimina al terminar. Comprueba rutas protegidas, roles, contraseñas, estados, evidencia obligatoria, persistencia, seguimiento, archivo/recuperación, invalidación de sesiones y dos pedidos concurrentes contra una última pieza. Sin `RUN_DB_TESTS=true`, integración se omite de forma explícita.

Ver el registro de ejecución y límites en `docs/VERIFICACION_E2.md`. No se afirma validación contra MariaDB ni despliegue público por haber probado MySQL. No incluye cobros, publicación ni cambios a servicios del homelab.
