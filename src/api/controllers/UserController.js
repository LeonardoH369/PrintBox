const { db, User, Session } = require('../../infrastructure/database/models');
const {
  text,
  passwordHash,
  positiveId,
} = require('../../application/security');
const { AppError } = require('../../application/errors/AppError');
function fields(body) {
  const name = text(body.name, 100, 'Nombre');
  const email = text(body.email, 180, 'Correo').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new AppError('Correo inválido', 400);
  if (!['ADMIN', 'OPERATOR'].includes(body.role))
    throw new AppError('Rol inválido', 400);
  if (typeof body.isActive !== 'boolean')
    throw new AppError('Estado de usuario inválido', 400);
  return {
    name,
    email,
    role: body.role,
    department: text(body.department, 100, 'Departamento'),
    isActive: body.isActive,
  };
}
exports.list = async (req, res) =>
  res.json(await User.findAll({ order: [['id', 'DESC']] }));
exports.create = async (req, res) => {
  const data = fields(req.body);
  const user = await User.create({
    ...data,
    passwordHash: passwordHash(req.body.password),
  });
  res.status(201).json(await User.findByPk(user.id));
};
exports.update = async (req, res) => {
  const id = positiveId(req.params.id);
  const data = fields(req.body);
  // Serializa cambios de administradores; nunca deja el sistema sin uno activo.
  await db.transaction(async (transaction) => {
    const admins = await User.findAll({
      where: { role: 'ADMIN', isActive: true },
      order: [['id', 'ASC']],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const user = await User.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!user) throw new AppError('Usuario no encontrado', 404);
    if (
      user.role === 'ADMIN' &&
      user.isActive &&
      admins.length === 1 &&
      (data.role !== 'ADMIN' || !data.isActive)
    )
      throw new AppError('Debe permanecer un administrador activo', 409);
    if (req.body.password) data.passwordHash = passwordHash(req.body.password);
    await user.update(data, { transaction });
    await Session.destroy({ where: { userId: id }, transaction });
  });
  res.json(await User.findByPk(id));
};
