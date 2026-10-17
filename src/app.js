const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./api/swagger/swagger');
const productRoutes = require('./api/routes/productRoutes');
const webRoutes = require('./api/routes/webRoutes');
const errorHandler = require('./api/middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/products', productRoutes);

// Las rutas web delegan la respuesta al controlador de vistas.
const webRoot = path.join(__dirname, 'web');
app.use('/assets', express.static(webRoot));
app.use('/', webRoutes);

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada', errors: [] }));
app.use(errorHandler);

module.exports = app;
