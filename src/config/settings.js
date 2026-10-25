require('dotenv').config();
const appsettings = require('../../appsettings.json');

module.exports = {
  app: {
    ...appsettings.app,
    port: Number(process.env.PORT || appsettings.app.port),
  },
  database: {
    ...appsettings.database,
    host: process.env.DB_HOST || appsettings.database.host,
    port: Number(process.env.DB_PORT || appsettings.database.port),
    name: process.env.DB_NAME || appsettings.database.name,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
};
