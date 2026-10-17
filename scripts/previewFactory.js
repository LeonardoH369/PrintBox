const { createProducts } = require('../src/infrastructure/database/factories/ProductFactory');
const count = Number(process.argv[2] || 5);
console.log(JSON.stringify(createProducts(count), null, 2));
