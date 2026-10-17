const app = require('../src/app');
const products = require('../src/api/routes/productRoutes');

function routes(stack, prefix = '') {
  for (const layer of stack) {
    if (!layer.route) continue;
    for (const method of Object.keys(layer.route.methods)) {
      console.log(`${method.toUpperCase().padEnd(7)} ${prefix}${layer.route.path}`);
    }
  }
}

routes(app.router.stack);
routes(products.stack, '/api/products');
console.log('GET     /api/docs (Swagger UI)');
console.log('GET     /assets/* (archivos estaticos)');
