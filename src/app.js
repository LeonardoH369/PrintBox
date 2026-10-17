const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./api/swagger/swagger');
const productRoutes = require('./api/routes/productRoutes');
const errorHandler = require('./api/middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/products', productRoutes);

// Vistas de la Actividad 6: la interfaz consume la API existente.
const webRoot = path.join(__dirname, 'web');
app.use('/assets', express.static(webRoot));
app.get('/', (req, res) => res.redirect('/products'));
app.get('/products', (req, res) => res.sendFile(path.join(webRoot, 'index.html')));
app.get('/products/create', (req, res) => res.sendFile(path.join(webRoot, 'create.html')));
app.get('/products/:id/edit', (req, res) => {
  if (!/^[1-9]\d*$/.test(req.params.id)) return res.status(404).send('Producto no encontrado');
  res.sendFile(path.join(webRoot, 'edit.html'));
});

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada', errors: [] }));
app.use(errorHandler);

module.exports = app;
