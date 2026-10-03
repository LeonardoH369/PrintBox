# PrintBox API

## Descripción
PrintBox es una API RESTful desarrollada para la gestión del catálogo de productos. Este proyecto permite realizar operaciones CRUD (Crear, Leer, Actualizar y Eliminar) sobre los registros, aplicando buenas prácticas de desarrollo para asegurar que el código sea escalable, modular y fácil de mantener.

## Tecnologías y Herramientas Utilizadas

* **Entorno de ejecución:** Node.js
* **Framework:** Express.js
* **Base de Datos:** MySQL (mediante XAMPP)
* **ORM (Object-Relational Mapping):** Sequelize (para el manejo de modelos, migraciones y seeders)
* **Arquitectura:** Clean Architecture (separación en capas: Dominio, Aplicación, Infraestructura y API)
* **Documentación y Pruebas:** Swagger (para documentación interactiva) y Postman (para pruebas de endpoints)

## Instalación y Ejecución Local

1. Instalar las dependencias del proyecto:
   `npm install`
2. Configurar las credenciales de la base de datos en el archivo `.env`.
3. Ejecutar las migraciones y datos de prueba:
   `npm run db:migrate`
   `npm run db:seed`
4. Levantar el servidor en modo desarrollo:
   `npm run dev`

## Documentación
Una vez que el servidor esté corriendo, la documentación interactiva de los endpoints se encuentra disponible en `http://localhost:3000/api/docs`.