require('dotenv').config();
const appsettings = require('../../appsettings.json');

module.exports = {
  app: appsettings.app,
  database: {
    ...appsettings.database,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
};
