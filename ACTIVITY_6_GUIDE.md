# PrintBox — Guía de implementación de la Actividad 6

## Adaptación tecnológica
El proyecto utiliza Node.js, Express, Sequelize y MariaDB, con autorización del docente para elegir framework. No utiliza Laravel, Artisan ni Blade. La equivalencia de vistas se realiza con HTML, CSS y JavaScript consumiendo una API REST.

## Funcionalidades
- Modelo Product: `src/infrastructure/database/models/ProductModel.js` y entidad de dominio.
- Controlador REST: `src/api/controllers/ProductController.js`.
- Migración y seeder: `src/infrastructure/database/migrations/` y `seeders/`.
- Factory independiente de BD: `src/infrastructure/database/factories/ProductFactory.js`.
- Listado: `GET /products` y `src/web/index.html`.
- Creación: `GET /products/create` y `src/web/create.html`.
- Edición: `GET /products/:id/edit` y `src/web/edit.html`.
- API y Swagger se mantienen sin modificar sus contratos.

## Ejecución en CachyOS
1. `npm ci`
2. Configurar `.env` con `DB_USER` y `DB_PASSWORD`, basándose en `.env.example`.
3. Asegurar MariaDB en ejecución y la BD `printbox_db` existente.
4. `npm run db:migrate` y `npm run db:seed` (el seeder inicial solo una vez para evitar duplicados).
5. `npm run dev`; abrir `http://localhost:3000/products`.
6. `npm run factory:preview -- 5` para ver productos ficticios **sin insertarlos** en la BD.
7. `npm run test:factory` para ejecutar pruebas de la factory.

## Ejecución en Windows con PowerShell
Desde la carpeta que contiene `package.json`:

```powershell
npm ci
Copy-Item .env.example .env
# Editar .env localmente con el usuario y la contraseña reales de MySQL.
npm run db:create
npm run db:migrate
npm run db:seed
npm run dev
```

Si la base ya existe, omitir `db:create`. Ejecutar el seeder una sola vez en una base nueva: no registra historial de semillas y repetirlo duplica productos. La base y el puerto por defecto siguen en `appsettings.json`; se pueden sobrescribir con `DB_NAME`, `DB_HOST` y `DB_PORT` sin editar el archivo. `PORT` cambia el puerto web.

## Validación
`npm test` ejecuta las tres pruebas de factory sin base de datos. `npm run routes:list` muestra las rutas. `npm run factory:preview -- 5` genera cinco productos de ejemplo sin guardarlos.

La prueba de integración requiere una base independiente cuyo nombre termine en `_test`. No usar la base de trabajo. Ejemplo, con un servidor MySQL local disponible y credenciales configuradas en `.env`:

```powershell
$env:DB_NAME = 'printbox_activity6_test'
npm run db:create
npm run db:migrate
npm run test:integration
Remove-Item Env:DB_NAME
```

La prueba crea y limpia únicamente su producto temporal; comprueba las tres vistas por HTTP, Swagger, listado, consulta, alta, modificación, errores 400/404 y persistencia del borrado lógico. No sustituye una prueba visual en navegador.

## Git y entrega
La rama de entrega se llama `activity-6` y parte del historial recuperado de `origin/main`. El commit requerido usa el mensaje `Base Products`. `README.md` contiene únicamente `# Activity 6`; las instrucciones viven en esta guía. No copiar `.env` ni `node_modules` al repositorio.

El paquete incluye un archivo Git bundle para recuperar la rama con su historial. Extraer el ZIP en una carpeta nueva y consultar `LEEME_ENTREGA.md` antes de usarlo. La publicación en GitHub se realiza después de revisar y aprobar la entrega; no se debe sustituir ni forzar la rama `main`.

## Consideraciones
La factory no requiere Faker, para evitar dependencias y cambios innecesarios en el lockfile. Las vistas son HTML/CSS/JS vanilla (no Blade). La funcionalidad CRUD consume la API que ya existía; las acciones delete aplican borrado lógico. Es una implementación local de aprendizaje: antes de publicarla en internet hay que añadir autenticación, autorización, CSRF/controles adecuados y restringir CORS.
