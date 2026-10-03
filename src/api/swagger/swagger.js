const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const { app } = require('../../config/settings');

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: app.name,
      version: app.version,
      description: 'Catálogo de productos de la tienda de impresión 3D PrintBox, con borrado seguro',
    },
    servers: [{ url: `http://localhost:${app.port}` }],
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Llavero personalizado' },
            description: { type: 'string', nullable: true, example: 'Llavero impreso en PLA' },
            price: { type: 'number', example: 45 },
            stock: { type: 'integer', example: 50 },
            category: { type: 'string', nullable: true, example: 'Accesorios' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ProductInput: {
          type: 'object',
          required: ['name', 'price'],
          properties: {
            name: { type: 'string', example: 'Llavero personalizado' },
            description: { type: 'string', example: 'Llavero impreso en PLA' },
            price: { type: 'number', example: 45 },
            stock: { type: 'integer', example: 50 },
            category: { type: 'string', example: 'Accesorios' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Producto no encontrado' },
            errors: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, '../routes/*.js')],
});
