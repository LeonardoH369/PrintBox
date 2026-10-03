const { database } = require('./settings');

const config = {
  username: database.username,
  password: database.password,
  database: database.name,
  host: database.host,
  port: database.port,
  dialect: database.dialect,
};

module.exports = { development: config, production: config };
