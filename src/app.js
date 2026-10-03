const express = require('express');
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

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada', errors: [] }));
app.use(errorHandler);

module.exports = app;
