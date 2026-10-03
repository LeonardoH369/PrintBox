const app = require('./app');
const sequelize = require('./config/database');
const { app: appConfig } = require('./config/settings');

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySQL exitosa');
    app.listen(appConfig.port, () => {
      console.log(`${appConfig.name} corriendo en http://localhost:${appConfig.port}`);
      console.log(`Swagger en http://localhost:${appConfig.port}/api/docs`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error.message);
    process.exit(1);
  }
}

start();
