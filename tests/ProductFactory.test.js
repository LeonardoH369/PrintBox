const test = require('node:test');
const assert = require('node:assert/strict');
const { createProduct, createProducts } = require('../src/infrastructure/database/factories/ProductFactory');
test('factory crea un Product con valores válidos', () => {
  const item = createProduct();
  assert.ok(item.name); assert.ok(item.price >= 0); assert.ok(Number.isInteger(item.stock));
});
test('factory permite sobrescribir atributos', () => {
  const item = createProduct({ name: 'Pieza especial', stock: 7 });
  assert.equal(item.name, 'Pieza especial'); assert.equal(item.stock, 7);
});
test('factory produce una lista y valida sus límites', () => {
  assert.equal(createProducts(4).length, 4);
  assert.throws(() => createProducts(101), RangeError);
});
