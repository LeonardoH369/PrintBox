const test = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
test(
  'flujo HTTP con base real: permisos, pedidos, evidencia, archivo y concurrencia',
  { skip: process.env.RUN_DB_TESTS !== 'true' },
  async () => {
    if (!process.env.DB_NAME?.endsWith('_test'))
      throw new Error(
        'DB_NAME debe terminar en _test; usa una base desechable'
      );
    const {
      db,
      User,
      Session,
      Product,
      Order,
      OrderItem,
      OrderHistory,
      Evidence,
    } = require('../src/infrastructure/database/models');
    const { passwordHash } = require('../src/application/security');
    const prefix = randomBytes(6).toString('hex');
    const admin = await User.create({
      name: prefix,
      email: `${prefix}@test.invalid`,
      passwordHash: passwordHash('TestPassword-12345'),
      role: 'ADMIN',
      department: 'QA',
    });
    const server = require('../src/app').listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const userIds = [admin.id];
    const orderIds = [];
    const productIds = [];
    async function request(path, method = 'GET', body, cookie, custom = true) {
      const response = await fetch(base + path, {
        method,
        redirect: 'manual',
        headers: {
          'Content-Type': 'application/json',
          ...(custom ? { 'X-PrintBox': '1' } : {}),
          ...(cookie ? { cookie } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const type = response.headers.get('content-type') || '';
      const data = type.includes('application/json')
        ? await response.json()
        : await response.text();
      return { response, data, status: response.status };
    }
    try {
      assert.equal((await request('/admin')).status, 302);
      assert.equal((await request('/api/orders')).status, 401);
      assert.equal((await request('/api/products')).status, 401);
      assert.equal((await request('/assets/admin.html')).status, 401);
      assert.equal(
        (await request('/api/auth/login', 'POST', {}, null, false)).status,
        403
      );
      assert.equal(
        (
          await request('/api/auth/login', 'POST', {
            email: admin.email,
            password: 'wrong',
          })
        ).status,
        401
      );
      const login = await request('/api/auth/login', 'POST', {
        email: admin.email,
        password: 'TestPassword-12345',
      });
      assert.equal(login.status, 200);
      const cookie = login.response.headers.get('set-cookie').split(';')[0];
      assert.match(login.response.headers.get('set-cookie'), /HttpOnly/i);
      assert.equal(
        (await request('/api/auth/me', 'GET', null, cookie)).data.passwordHash,
        undefined
      );
      const user = await request(
        '/api/users',
        'POST',
        {
          name: prefix,
          email: `op-${prefix}@test.invalid`,
          password: 'OperatorTest12345',
          role: 'OPERATOR',
          department: 'Impresión',
          isActive: true,
        },
        cookie
      );
      assert.equal(user.status, 201);
      userIds.push(user.data.id);
      assert.equal(user.data.passwordHash, undefined);
      const operatorLogin = await request('/api/auth/login', 'POST', {
        email: user.data.email,
        password: 'OperatorTest12345',
      });
      const opCookie = operatorLogin.response.headers
        .get('set-cookie')
        .split(';')[0];
      assert.equal(
        (await request('/api/users', 'GET', null, opCookie)).status,
        403
      );
      assert.equal(
        (await request('/api/products', 'POST', {}, opCookie)).status,
        403
      );
      const product = await Product.create({
        name: prefix,
        price: '45.50',
        stock: 2,
        isActive: true,
      });
      productIds.push(product.id);
      const created = await request(
        '/api/orders',
        'POST',
        {
          customerName: prefix,
          description: 'Prueba',
          items: [{ productId: product.id, quantity: 1 }],
        },
        cookie
      );
      assert.equal(created.status, 201);
      const order = created.data;
      orderIds.push(order.id);
      assert.equal((await product.reload()).stock, 1);
      assert.equal(
        (await request('/api/orders', 'GET', null, cookie)).data[0].id,
        order.id
      );
      assert.equal(
        (
          await request(
            `/api/orders/${order.id}/status`,
            'POST',
            { status: 'DELIVERED' },
            cookie
          )
        ).status,
        409
      );
      assert.equal(
        (
          await request(
            `/api/orders/${order.id}`,
            'PUT',
            { customerName: prefix, description: 'Actualizado' },
            cookie
          )
        ).status,
        200
      );
      for (const status of ['PRINTING', 'READY'])
        assert.equal(
          (
            await request(
              `/api/orders/${order.id}/status`,
              'POST',
              { status },
              opCookie
            )
          ).status,
          200
        );
      assert.equal(
        (
          await request(
            `/api/orders/${order.id}/status`,
            'POST',
            { status: 'IN_ROUTE' },
            cookie
          )
        ).status,
        400
      );
      assert.equal((await Order.findByPk(order.id)).status, 'READY');
      const photo = {
        mime: 'image/png',
        base64:
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=',
      };
      for (const status of ['IN_ROUTE', 'DELIVERED'])
        assert.equal(
          (
            await request(
              `/api/orders/${order.id}/status`,
              'POST',
              { status, photo },
              cookie
            )
          ).status,
          200
        );
      const detail = await request(
        `/api/orders/${order.id}`,
        'GET',
        null,
        cookie
      );
      assert.equal(detail.data.evidence.length, 2);
      assert.equal(detail.data.history.length, 5);
      assert.equal(detail.data.items[0].unitPrice, '45.50');
      assert.equal(detail.data.evidence[0].data, undefined);
      const tracking = await request(`/api/tracking/${order.invoice}`);
      assert.equal(tracking.data.status, 'DELIVERED');
      assert.equal(tracking.data.customerName, undefined);
      assert.equal((await request(tracking.data.photo)).status, 200);
      assert.equal(
        (await request(`/api/orders/${order.id}`, 'DELETE', null, opCookie))
          .status,
        403
      );
      assert.equal(
        (await request(`/api/orders/${order.id}`, 'DELETE', null, cookie))
          .status,
        204
      );
      assert.equal(
        (await request(`/api/tracking/${order.invoice}`)).status,
        404
      );
      assert.equal(
        (
          await request('/api/orders?archived=true', 'GET', null, cookie)
        ).data.some((o) => o.id === order.id),
        true
      );
      assert.equal(
        (await request(`/api/orders/${order.id}/restore`, 'POST', null, cookie))
          .status,
        204
      );
      assert.equal((await product.reload()).stock, 1);
      const concurrent = await Promise.all(
        [1, 2].map(() =>
          request(
            '/api/orders',
            'POST',
            {
              customerName: prefix,
              description: 'Concurrente',
              items: [{ productId: product.id, quantity: 1 }],
            },
            cookie
          )
        )
      );
      concurrent
        .filter((r) => r.status === 201)
        .forEach((r) => orderIds.push(r.data.id));
      assert.deepEqual(concurrent.map((r) => r.status).sort(), [201, 409]);
      assert.equal((await product.reload()).stock, 0);
      const partial = await Product.create({
        name: `${prefix}-rollback`,
        price: '10.00',
        stock: 2,
        isActive: true,
      });
      productIds.push(partial.id);
      const unavailable = await Product.create({
        name: `${prefix}-sin-stock`,
        price: '10.00',
        stock: 0,
        isActive: true,
      });
      productIds.push(unavailable.id);
      const before = await Order.count();
      assert.equal(
        (
          await request(
            '/api/orders',
            'POST',
            {
              customerName: prefix,
              description: 'Debe revertirse',
              items: [
                { productId: partial.id, quantity: 1 },
                { productId: unavailable.id, quantity: 1 },
              ],
            },
            cookie
          )
        ).status,
        409
      );
      assert.equal((await partial.reload()).stock, 2);
      assert.equal(await Order.count(), before);
      const updateUser = {
        name: prefix,
        email: user.data.email,
        role: 'OPERATOR',
        department: 'QA',
        isActive: false,
      };
      assert.equal(
        (await request(`/api/users/${user.data.id}`, 'PUT', updateUser, cookie))
          .status,
        200
      );
      assert.equal(
        (await request('/api/orders', 'GET', null, opCookie)).status,
        401
      );
      assert.equal(
        (
          await request(
            `/api/users/${admin.id}`,
            'PUT',
            {
              name: prefix,
              email: admin.email,
              role: 'ADMIN',
              department: 'QA',
              isActive: false,
            },
            cookie
          )
        ).status,
        409
      );
      assert.equal(
        (await request('/api/auth/logout', 'POST', null, cookie)).status,
        204
      );
      assert.equal(
        (await request('/api/orders', 'GET', null, cookie)).status,
        401
      );
    } finally {
      // Borra exclusivamente las filas creadas por esta prueba.
      for (const model of [Evidence, OrderHistory, OrderItem])
        await model.destroy({ where: { orderId: orderIds } });
      await Order.destroy({ where: { id: orderIds } });
      await Product.destroy({ where: { id: productIds } });
      await Session.destroy({ where: { userId: userIds } });
      await User.destroy({ where: { id: userIds } });
      await new Promise((resolve) => server.close(resolve));
      await db.close();
    }
  }
);
