const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./api/swagger/swagger');
const productRoutes = require('./api/routes/productRoutes');
const errorHandler = require('./api/middlewares/errorHandler');
const {
  authenticated,
  admin,
  protectWrites,
} = require('./api/middlewares/auth');

const app = express();

app.disable('x-powered-by');
app.use((req, res, next) => {
  res
    .set('X-Content-Type-Options', 'nosniff')
    .set('Referrer-Policy', 'no-referrer');
  res.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
  );
  if (
    req.path.startsWith('/api') ||
    req.path === '/admin' ||
    req.path.startsWith('/products')
  )
    res.set('Cache-Control', 'no-store');
  next();
});
app.use(protectWrites);
app.use(express.json({ limit: '5mb' }));
app.use((req, res, next) => {
  req.body ??= {};
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use(
  '/api/products',
  authenticated,
  (req, res, next) =>
    ['GET', 'HEAD'].includes(req.method) ? next() : admin(req, res, next),
  productRoutes
);
app.use(
  '/api/docs',
  authenticated,
  (req, res, next) => {
    res.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'"
    );
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      requestInterceptor: function (request) {
        request.headers['X-PrintBox'] = '1';
        return request;
      },
    },
  })
);
app.use('/api', require('./api/routes/evidenceRoutes'));

// Vistas de la Actividad 6: la interfaz consume la API existente.
const webRoot = path.join(__dirname, 'web');
app.use(
  '/assets',
  (req, res, next) =>
    /\.html$/i.test(req.path) ? authenticated(req, res, next) : next(),
  express.static(webRoot)
);
app.get('/', (req, res) =>
  res.sendFile(path.join(webRoot, 'tracking.html'), { dotfiles: 'allow' })
);
app.get('/login', (req, res) =>
  res.sendFile(path.join(webRoot, 'login.html'), { dotfiles: 'allow' })
);
async function privateView(req, res, next) {
  await authenticated(req, res, (err) =>
    err ? res.redirect('/login') : next()
  );
}
app.get('/admin', privateView, (req, res) =>
  res.sendFile(path.join(webRoot, 'admin.html'), { dotfiles: 'allow' })
);
app.get('/products', privateView, (req, res) =>
  res.sendFile(path.join(webRoot, 'index.html'), { dotfiles: 'allow' })
);
app.get('/products/create', privateView, admin, (req, res) =>
  res.sendFile(path.join(webRoot, 'create.html'), { dotfiles: 'allow' })
);
app.get('/products/:id/edit', privateView, admin, (req, res) => {
  if (!/^[1-9]\d*$/.test(req.params.id))
    return res.status(404).send('Producto no encontrado');
  res.sendFile(path.join(webRoot, 'edit.html'), { dotfiles: 'allow' });
});

app.use((req, res) =>
  res.status(404).json({ message: 'Ruta no encontrada', errors: [] })
);
app.use(errorHandler);

module.exports = app;
