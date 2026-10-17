# Homework 5

## Investigación sobre rutas en Laravel 7

Una ruta relaciona un método HTTP y una URL con una función o acción de controlador. Las rutas web se definen en `routes/web.php` y reciben el grupo de middleware `web`, con sesiones y protección CSRF. Las rutas de `routes/api.php` son independientes de las sesiones y usan el prefijo `/api`.

Laravel dispone de `Route::get`, `post`, `put`, `patch` y `delete`. Los parámetros se escriben entre llaves, por ejemplo `{product}`; pueden ser opcionales y tener restricciones. Las rutas con nombre permiten generar enlaces sin repetir direcciones. Los grupos comparten prefijos o middleware, y el model binding resuelve modelos desde parámetros. `php artisan route:list` permite inspeccionar las rutas.

Un controlador resource reúne acciones como `index`, `create`, `store`, `show`, `edit`, `update` y `destroy`. Las acciones que muestran páginas pueden devolver `view('products.index')`, `view('products.create')` o `view('products.edit')`; los archivos Blade se ubican en `resources/views/products/`. Las rutas específicas deben evitar conflictos con parámetros generales.

## Adaptación implementada en PrintBox

Se conserva Node.js, Express y Sequelize según la autorización del docente. `src/api/routes/webRoutes.js` cumple el papel del archivo de rutas web, y `src/api/controllers/ProductViewController.js` devuelve las vistas HTML equivalentes mediante `res.sendFile`.

| Método y ruta | Acción | Vista |
| --- | --- | --- |
| GET /products | index() | src/web/index.html |
| GET /products/create | create() | src/web/create.html |
| GET /products/:id/edit | edit() | src/web/edit.html |

El listado incluye el enlace con apariencia de botón **Add Product**, que abre `/products/create`. No muestra botones ni enlaces de edición; se conservan la ruta, la función y el archivo de edición para continuar posteriormente. Esto concilia el punto que pide mantener `edit()` devolviendo su vista con el punto que indica no mostrarla durante el flujo de esta tarea.

Los endpoints de datos continúan en `/api/products`, con su controlador REST. Express no incorpora automáticamente las sesiones ni el middleware CSRF de Laravel.

## Verificación y entrega

`npm test` comprueba la factory. `npm run test:integration`, con una base independiente cuyo nombre termine en `_test`, comprueba vistas, botón de alta y API con persistencia. `npm run routes:list` incluye las rutas web y de datos.

La tarea se publica en la rama `homework-5` con el mensaje de commit exacto `homework 5`, sobre el trabajo de la Actividad 6.

## Referencias oficiales

- https://laravel.com/docs/7.x/routing
- https://laravel.com/docs/7.x/controllers
- https://laravel.com/docs/7.x/views
