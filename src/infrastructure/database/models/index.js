const { DataTypes: D } = require('sequelize');
const db = require('../../../config/database');
const Product = require('./ProductModel');
const id = () => ({ type: D.INTEGER, primaryKey: true, autoIncrement: true });
const User = db.define(
  'User',
  {
    id: id(),
    name: { type: D.STRING(100), allowNull: false },
    email: { type: D.STRING(180), allowNull: false, unique: true },
    passwordHash: { type: D.STRING(200), allowNull: false },
    role: { type: D.ENUM('ADMIN', 'OPERATOR'), allowNull: false },
    department: {
      type: D.STRING(100),
      allowNull: false,
      defaultValue: 'General',
    },
    isActive: { type: D.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { defaultScope: { attributes: { exclude: ['passwordHash'] } } }
);
const Session = db.define('Session', {
  tokenHash: { type: D.STRING(64), primaryKey: true },
  userId: { type: D.INTEGER, allowNull: false },
  expiresAt: { type: D.DATE, allowNull: false },
});
const Order = db.define('Order', {
  id: id(),
  invoice: { type: D.STRING(40), allowNull: false, unique: true },
  customerName: { type: D.STRING(100), allowNull: false },
  description: { type: D.TEXT, allowNull: false },
  status: {
    type: D.ENUM('RECEIVED', 'PRINTING', 'READY', 'IN_ROUTE', 'DELIVERED'),
    allowNull: false,
    defaultValue: 'RECEIVED',
  },
  statusChangedAt: { type: D.DATE, allowNull: false },
  createdBy: { type: D.INTEGER, allowNull: false },
  archivedAt: { type: D.DATE, allowNull: true },
});
const OrderItem = db.define('OrderItem', {
  id: id(),
  orderId: { type: D.INTEGER, allowNull: false },
  productId: { type: D.INTEGER, allowNull: false },
  quantity: { type: D.INTEGER, allowNull: false },
  unitPrice: { type: D.DECIMAL(10, 2), allowNull: false },
});
const OrderHistory = db.define('OrderHistory', {
  id: id(),
  orderId: { type: D.INTEGER, allowNull: false },
  userId: { type: D.INTEGER, allowNull: false },
  status: { type: D.STRING(20), allowNull: false },
});
const Evidence = db.define(
  'Evidence',
  {
    id: id(),
    orderId: { type: D.INTEGER, allowNull: false },
    userId: { type: D.INTEGER, allowNull: false },
    status: { type: D.ENUM('IN_ROUTE', 'DELIVERED'), allowNull: false },
    mime: { type: D.STRING(20), allowNull: false },
    data: { type: D.BLOB('medium'), allowNull: false },
  },
  { tableName: 'Evidence', defaultScope: { attributes: { exclude: ['data'] } } }
);
// Relaciones bidireccionales: Sequelize resuelve includes y claves foráneas.
User.hasMany(Session, { foreignKey: 'userId' });
Session.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'createdBy' });
Order.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });
for (const Model of [OrderHistory, Evidence]) {
  Order.hasMany(Model, {
    as: Model === Evidence ? 'evidence' : 'history',
    foreignKey: 'orderId',
  });
  Model.belongsTo(Order, { foreignKey: 'orderId' });
  User.hasMany(Model, { foreignKey: 'userId' });
  Model.belongsTo(User, { foreignKey: 'userId' });
}
module.exports = {
  db,
  Product,
  User,
  Session,
  Order,
  OrderItem,
  OrderHistory,
  Evidence,
};
