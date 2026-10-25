'use strict';
// Exclusivo para una base de demostración; no incluye credenciales conocidas.
module.exports = {
  async up() {
    if (
      process.env.SEED_DEMO !== 'true' ||
      process.env.NODE_ENV === 'production'
    )
      throw new Error('Usa SEED_DEMO=true únicamente en desarrollo');
    const { randomBytes } = require('node:crypto');
    const {
      db,
      User,
      Product,
      Order,
      OrderItem,
      OrderHistory,
      Evidence,
    } = require('../models');
    const { passwordHash, statuses } = require('../../../application/security');
    await db.transaction(async (transaction) => {
      const admin = await User.findOne({
        where: {
          email: (process.env.ADMIN_EMAIL || '').toLowerCase(),
          role: 'ADMIN',
          isActive: true,
        },
        transaction,
      });
      if (!admin)
        throw new Error(
          'Primero ejecuta npm run admin:create con ADMIN_EMAIL configurado'
        );
      await User.findOrCreate({
        where: { email: 'demo-inactive@printbox.invalid' },
        defaults: {
          name: 'DEMO Usuario inactivo',
          passwordHash: passwordHash(randomBytes(24).toString('hex')),
          role: 'OPERATOR',
          department: 'Impresión',
          isActive: false,
        },
        transaction,
      });
      const [product] = await Product.findOrCreate({
        where: { name: '[DEMO E2] Pieza de prueba' },
        defaults: {
          price: 45,
          stock: 50,
          category: 'Demostración',
          isActive: true,
        },
        transaction,
      });
      const png = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=',
        'base64'
      );
      for (const [index, status] of statuses.entries()) {
        const description = `[DEMO E2] Estado ${status}. Imagen de prueba de un píxel; no es una entrega real.`;
        if (await Order.findOne({ where: { description }, transaction }))
          continue;
        const order = await Order.create(
          {
            invoice: `PB-${randomBytes(16).toString('hex')}`,
            customerName: 'Cliente ficticio',
            description,
            status,
            statusChangedAt: new Date(),
            createdBy: admin.id,
            archivedAt: index === 0 ? new Date() : null,
          },
          { transaction }
        );
        await OrderItem.create(
          {
            orderId: order.id,
            productId: product.id,
            quantity: 1,
            unitPrice: product.price,
          },
          { transaction }
        );
        for (const step of statuses.slice(0, index + 1)) {
          await OrderHistory.create(
            { orderId: order.id, userId: admin.id, status: step },
            { transaction }
          );
          if (['IN_ROUTE', 'DELIVERED'].includes(step))
            await Evidence.create(
              {
                orderId: order.id,
                userId: admin.id,
                status: step,
                mime: 'image/png',
                data: png,
              },
              { transaction }
            );
        }
        await product.decrement('stock', { transaction });
      }
    });
    console.log('Datos DEMO E2 cargados. Consulta los folios en el panel.');
  },
  async down() {
    throw new Error(
      'No se eliminan pedidos históricos automáticamente. Usa una base desechable para demostraciones.'
    );
  },
};
