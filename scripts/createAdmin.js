require('dotenv').config();
const { db, User } = require('../src/infrastructure/database/models');
const { passwordHash, text } = require('../src/application/security');
(async () => {
  const email = text(process.env.ADMIN_EMAIL, 180, 'ADMIN_EMAIL').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error('ADMIN_EMAIL inválido');
  const hash = passwordHash(process.env.ADMIN_PASSWORD);
  const [, created] = await User.findOrCreate({
    where: { email },
    defaults: {
      name: process.env.ADMIN_NAME || 'Administrador PrintBox',
      passwordHash: hash,
      role: 'ADMIN',
      department: 'Administración',
      isActive: true,
    },
  });
  console.log(
    created
      ? 'Administrador creado. La contraseña no se imprime.'
      : 'La cuenta ya existe; no se modificaron credenciales ni permisos.'
  );
})()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => db.close());
