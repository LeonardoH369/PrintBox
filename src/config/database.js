const { Sequelize } = require('sequelize');
const { database } = require('./settings');

const sequelize = new Sequelize(database.name, database.username, database.password, {
  host: database.host,
  port: database.port,
  dialect: database.dialect,
  logging: false,
});

module.exports = sequelize;
