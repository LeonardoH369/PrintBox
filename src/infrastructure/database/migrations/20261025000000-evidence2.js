'use strict';
module.exports = {
  async up(q, S) {
    const id = () => ({
      type: S.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    });
    const dates = () => ({
      createdAt: { type: S.DATE, allowNull: false },
      updatedAt: { type: S.DATE, allowNull: false },
    });
    const fk = (model) => ({
      type: S.INTEGER,
      allowNull: false,
      references: { model, key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
    await q.createTable('Users', {
      id: id(),
      name: { type: S.STRING(100), allowNull: false },
      email: { type: S.STRING(180), unique: true, allowNull: false },
      passwordHash: { type: S.STRING(200), allowNull: false },
      role: { type: S.ENUM('ADMIN', 'OPERATOR'), allowNull: false },
      department: {
        type: S.STRING(100),
        allowNull: false,
        defaultValue: 'General',
      },
      isActive: { type: S.BOOLEAN, allowNull: false, defaultValue: true },
      ...dates(),
    });
    await q.createTable('Sessions', {
      tokenHash: { type: S.STRING(64), primaryKey: true, allowNull: false },
      userId: fk('Users'),
      expiresAt: { type: S.DATE, allowNull: false },
      ...dates(),
    });
    await q.createTable('Orders', {
      id: id(),
      invoice: { type: S.STRING(40), allowNull: false, unique: true },
      customerName: { type: S.STRING(100), allowNull: false },
      description: { type: S.TEXT, allowNull: false },
      status: {
        type: S.ENUM('RECEIVED', 'PRINTING', 'READY', 'IN_ROUTE', 'DELIVERED'),
        allowNull: false,
        defaultValue: 'RECEIVED',
      },
      statusChangedAt: { type: S.DATE, allowNull: false },
      createdBy: fk('Users'),
      archivedAt: { type: S.DATE, allowNull: true },
      ...dates(),
    });
    await q.createTable('OrderItems', {
      id: id(),
      orderId: fk('Orders'),
      productId: fk('Products'),
      quantity: { type: S.INTEGER, allowNull: false },
      unitPrice: { type: S.DECIMAL(10, 2), allowNull: false },
      ...dates(),
    });
    await q.addIndex('OrderItems', ['orderId', 'productId'], { unique: true });
    await q.createTable('OrderHistories', {
      id: id(),
      orderId: fk('Orders'),
      userId: fk('Users'),
      status: { type: S.STRING(20), allowNull: false },
      ...dates(),
    });
    await q.createTable('Evidence', {
      id: id(),
      orderId: fk('Orders'),
      userId: fk('Users'),
      status: { type: S.ENUM('IN_ROUTE', 'DELIVERED'), allowNull: false },
      mime: { type: S.STRING(20), allowNull: false },
      data: { type: S.BLOB('medium'), allowNull: false },
      ...dates(),
    });
    await q.addIndex('Orders', ['archivedAt', 'createdAt']);
    await q.addIndex('Sessions', ['expiresAt']);
    await q.addIndex('Evidence', ['orderId', 'status']);
  },
  async down(q) {
    for (const table of [
      'Evidence',
      'OrderHistories',
      'OrderItems',
      'Orders',
      'Sessions',
      'Users',
    ])
      await q.dropTable(table);
  },
};
