const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');

test('vistas y CRUD REST con persistencia y borrado logico', async (t) => {
  // Nunca ejecutar contra el catalogo de trabajo del usuario.
  assert.match(process.env.DB_NAME || '', /_test$/, 'DB_NAME debe terminar en _test');
  const app = require('../src/app');
  const sequelize = require('../src/config/database');
  const ProductModel = require('../src/infrastructure/database/models/ProductModel');
  await sequelize.authenticate();
  const server = app.listen(0, '127.0.0.1');
  let id;
  t.after(async () => {
    try {
      if (id) await ProductModel.destroy({ where: { id } });
    } finally {
      await new Promise((resolve) => server.close(resolve));
      await sequelize.close();
    }
  });
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const send = (url, method, body) => fetch(base + url, {
    method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  for (const [path, title] of [
    ['/products', 'Product View'], ['/products/create', 'New Product Creation'],
    ['/products/1/edit', 'Product Editing'],
  ]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes(`<title>${title} | PrintBox</title>`));
    if (path === '/products') {
      assert.match(html, /href="\/products\/create">Add Product<\/a>/);
    }
  }
  assert.equal((await fetch(base + '/assets/app.js')).status, 200);
  assert.equal((await fetch(base + '/api/docs/')).status, 200);
  assert.equal((await fetch(base + '/products/no/edit')).status, 404);
  assert.equal((await send('/api/products', 'POST', { name: '', price: -1 })).status, 400);
  assert.equal((await fetch(base + '/api/products/no')).status, 400);
  const input = { name: 'Prueba Actividad 6', description: 'Temporal', price: 125.5, stock: 3, category: 'Pruebas' };
  const created = await send('/api/products', 'POST', input);
  assert.equal(created.status, 201);
  const item = await created.json();
  id = item.id;
  assert.ok(Number.isInteger(id));
  const found = await fetch(base + `/api/products/${id}`);
  assert.equal(found.status, 200);
  assert.equal((await found.json()).price, 125.5);
  const list = await fetch(base + '/api/products');
  assert.equal(list.status, 200);
  assert.ok((await list.json()).some((product) => product.id === id));
  const updated = await send(`/api/products/${id}`, 'PUT', { ...input, name: 'Producto editado', price: 150, stock: 7 });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).stock, 7);
  assert.equal((await ProductModel.findByPk(id)).name, 'Producto editado');
  assert.equal((await send(`/api/products/${id}`, 'DELETE')).status, 200);
  assert.equal((await ProductModel.findByPk(id)).isActive, false);
  assert.equal((await fetch(base + `/api/products/${id}`)).status, 404);
  assert.equal((await send(`/api/products/${id}`, 'PUT', input)).status, 404);
  assert.equal((await send(`/api/products/${id}`, 'DELETE')).status, 404);
  const remaining = await (await fetch(base + '/api/products')).json();
  assert.ok(!remaining.some((product) => product.id === id));
});
