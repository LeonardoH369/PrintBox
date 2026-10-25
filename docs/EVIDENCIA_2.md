# Guion de demostración — Evidencia 2

## Tecnologías utilizadas

Desarrollé la lógica de PrintBox con JavaScript y Node.js. Express recibe las solicitudes; Sequelize representa entidades y relaciones y ejecuta consultas contra MariaDB/MySQL. Las vistas HTML/CSS/JavaScript consumen la API REST. Estas herramientas cubren modelos, migraciones, controladores, seeders y vistas sin usar Laravel ni Blade.

## Recorrido para obtener las capturas

1. Mostrar `models/index.js` y sus asociaciones; abrir las dos migraciones y señalar PK, FK e índices.
2. Ejecutar las migraciones y cargar los datos de demostración siguiendo el README. Mostrar tablas en tu administrador de base de datos; ocultar credenciales.
3. Abrir `/` sin sesión y buscar un folio tomado del panel. Capturar un pedido en proceso con nombre del estado y fecha; después uno entregado con su imagen final. Si usas el seed, aclarar que la imagen de un píxel es ficticia.
4. Abrir `/admin` sin sesión: se redirige al acceso. Iniciar sesión y capturar el dashboard con sus enlaces.
5. En Usuarios, mostrar activos e inactivos; crear un operador con departamento; editarlo y desactivarlo. No mostrar contraseñas.
6. En Pedidos, crear uno seleccionando productos y cantidades. Capturar el listado descendente y su detalle con precios históricos.
7. Editar cliente o descripción. Avanzar recibido → en impresión → listo. Intentar avanzar a en ruta sin foto para mostrar la validación; después tomar o adjuntar fotografía.
8. Marcar entregado con una segunda fotografía. Mostrar ambas evidencias y el historial del pedido. Consultar el mismo folio desde la vista pública.
9. Como administrador, archivar el pedido. Mostrar la lista de archivados, recuperarlo y comprobar que reaparece sin modificar otra vez el stock.
10. Ejecutar las pruebas y mostrar los resultados reales. Abrir GitHub y el README actualizado.

No presentes como pruebas ejecutadas los pasos que aún no hayas realizado personalmente. Las capturas deben proceder de tu ejecución; este guion no sustituye las imágenes que te solicite el docente.

## Explicación de buenas prácticas

La aplicación separa rutas, controladores, reglas y persistencia. Valida entradas en servidor y verifica sesión/rol en cada API privada. Guarda contraseñas con hash y protege las cookies. Usa transacciones y bloqueos para evitar sobreventa. El archivado preserva relaciones e historial y permite recuperar los pedidos. Los seeders y las pruebas utilizan datos identificados como ficticios.
