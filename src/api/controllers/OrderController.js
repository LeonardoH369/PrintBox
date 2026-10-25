const { randomBytes } = require('node:crypto');
const { Op } = require('sequelize');
const {
  db,
  Product,
  Order,
  OrderItem,
  OrderHistory,
  Evidence,
} = require('../../infrastructure/database/models');
const {
  text,
  positiveId,
  nextStatus,
  photo,
} = require('../../application/security');
const { AppError } = require('../../application/errors/AppError');
const details = [
  { model: OrderItem, as: 'items', include: [{ model: Product }] },
  { model: OrderHistory, as: 'history' },
  { model: Evidence, as: 'evidence' },
];
async function locked(id, transaction) {
  const order = await Order.findByPk(positiveId(id), {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!order) throw new AppError('Pedido no encontrado', 404);
  return order;
}
function active(order) {
  if (order.archivedAt)
    throw new AppError('Recupera el pedido antes de modificarlo', 409);
}
exports.list = async (req, res) =>
  res.json(
    await Order.findAll({
      where: {
        archivedAt: req.query.archived === 'true' ? { [Op.ne]: null } : null,
      },
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
    })
  );
exports.get = async (req, res) => {
  const order = await Order.findByPk(positiveId(req.params.id), {
    include: details,
  });
  if (!order) throw new AppError('Pedido no encontrado', 404);
  res.json(order);
};
exports.create = async (req, res) => {
  const customerName = text(req.body.customerName, 100, 'Cliente');
  const description = text(req.body.description, 3000, 'Descripción');
  const items = req.body.items;
  if (!Array.isArray(items) || !items.length || items.length > 30)
    throw new AppError('Agrega de 1 a 30 productos', 400);
  const normalized = items
    .map((item) => ({
      productId: positiveId(item.productId),
      quantity: positiveId(item.quantity),
    }))
    .sort((a, b) => a.productId - b.productId);
  if (new Set(normalized.map((item) => item.productId)).size !== items.length)
    throw new AppError('Agrupa las cantidades de cada producto', 400);
  const order = await db.transaction(async (transaction) => {
    const order = await Order.create(
      {
        invoice: `PB-${randomBytes(16).toString('hex')}`,
        customerName,
        description,
        createdBy: req.user.id,
        statusChangedAt: new Date(),
      },
      { transaction }
    );
    for (const item of normalized) {
      const product = await Product.findByPk(item.productId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!product?.isActive || product.stock < item.quantity)
        throw new AppError(
          'Producto inactivo o existencias insuficientes',
          409
        );
      await product.decrement('stock', { by: item.quantity, transaction });
      await OrderItem.create(
        { orderId: order.id, ...item, unitPrice: product.price },
        { transaction }
      );
    }
    await OrderHistory.create(
      { orderId: order.id, userId: req.user.id, status: 'RECEIVED' },
      { transaction }
    );
    return order;
  });
  res.status(201).json(order);
};
exports.update = async (req, res) => {
  const data = {
    customerName: text(req.body.customerName, 100, 'Cliente'),
    description: text(req.body.description, 3000, 'Descripción'),
  };
  const result = await db.transaction(async (transaction) => {
    const order = await locked(req.params.id, transaction);
    active(order);
    if (order.status === 'DELIVERED')
      throw new AppError(
        'Un pedido entregado conserva sus datos históricos',
        409
      );
    return order.update(data, { transaction });
  });
  res.json(result);
};
exports.status = async (req, res) => {
  const result = await db.transaction(async (transaction) => {
    const order = await locked(req.params.id, transaction);
    active(order);
    nextStatus(order.status, req.body.status);
    if (['IN_ROUTE', 'DELIVERED'].includes(req.body.status)) {
      const image = photo(req.body.photo);
      await Evidence.create(
        {
          orderId: order.id,
          userId: req.user.id,
          status: req.body.status,
          ...image,
        },
        { transaction }
      );
    }
    await OrderHistory.create(
      { orderId: order.id, userId: req.user.id, status: req.body.status },
      { transaction }
    );
    return order.update(
      { status: req.body.status, statusChangedAt: new Date() },
      { transaction }
    );
  });
  res.json(result);
};
exports.archive = async (req, res) => {
  await db.transaction(async (transaction) => {
    const order = await locked(req.params.id, transaction);
    active(order);
    await order.update({ archivedAt: new Date() }, { transaction });
  });
  res.sendStatus(204);
};
exports.restore = async (req, res) => {
  await db.transaction(async (transaction) => {
    const order = await locked(req.params.id, transaction);
    if (!order.archivedAt) throw new AppError('El pedido ya está activo', 409);
    await order.update({ archivedAt: null }, { transaction });
  });
  res.sendStatus(204);
};
exports.track = async (req, res) => {
  if (!/^PB-[a-f0-9]{32}$/.test(req.params.invoice))
    throw new AppError('Folio no encontrado', 404);
  const order = await Order.findOne({
    where: { invoice: req.params.invoice, archivedAt: null },
  });
  if (!order) throw new AppError('Folio no encontrado', 404);
  const evidence =
    order.status === 'DELIVERED'
      ? await Evidence.findOne({
          where: { orderId: order.id, status: 'DELIVERED' },
          order: [['id', 'DESC']],
        })
      : null;
  res.json({
    invoice: order.invoice,
    status: order.status,
    date: order.statusChangedAt,
    photo: evidence ? `/api/tracking/${order.invoice}/photo` : null,
  });
};
exports.publicPhoto = async (req, res) => {
  if (!/^PB-[a-f0-9]{32}$/.test(req.params.invoice))
    throw new AppError('Folio no encontrado', 404);
  const order = await Order.findOne({
    where: {
      invoice: req.params.invoice,
      archivedAt: null,
      status: 'DELIVERED',
    },
  });
  if (!order) throw new AppError('Fotografía no encontrada', 404);
  const image = await Evidence.unscoped().findOne({
    where: { orderId: order.id, status: 'DELIVERED' },
    order: [['id', 'DESC']],
  });
  return sendPhoto(res, image);
};
function sendPhoto(res, image) {
  if (!image) throw new AppError('Fotografía no encontrada', 404);
  res
    .set('Content-Type', image.mime)
    .set('X-Content-Type-Options', 'nosniff')
    .set('Cache-Control', 'no-store')
    .send(image.data);
}
exports.photo = async (req, res) =>
  sendPhoto(
    res,
    await Evidence.unscoped().findOne({
      where: {
        id: positiveId(req.params.evidenceId),
        orderId: positiveId(req.params.id),
      },
    })
  );
