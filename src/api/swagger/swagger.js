const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const { app } = require('../../config/settings');

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: app.name,
      version: app.version,
      description: 'Product catalog API for the PrintBox 3D printing store, with soft deletion',
    },
    servers: [{ url: `http://localhost:${app.port}` }],
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Custom keychain' },
            description: { type: 'string', nullable: true, example: 'PLA-printed keychain' },
            price: { type: 'number', example: 45 },
            stock: { type: 'integer', example: 50 },
            category: { type: 'string', nullable: true, example: 'Accessories' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ProductInput: {
          type: 'object',
          required: ['name', 'price'],
          properties: {
            name: { type: 'string', example: 'Custom keychain' },
            description: { type: 'string', example: 'PLA-printed keychain' },
            price: { type: 'number', example: 45 },
            stock: { type: 'integer', example: 50 },
            category: { type: 'string', example: 'Accessories' },
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

