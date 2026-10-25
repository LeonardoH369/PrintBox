const { randomBytes } = require('node:crypto');
const { Op } = require('sequelize');
const { User, Session } = require('../../infrastructure/database/models');
const { digest, verifyPassword } = require('../../application/security');
const { AppError } = require('../../application/errors/AppError');
const attempts = new Map();
const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};
exports.login = async (req, res) => {
  const now = Date.now();
  for (const [key, value] of attempts)
    if (value.until < now) attempts.delete(key);
  const key = req.ip;
  const entry = attempts.get(key) || { count: 0, until: now + 15 * 60 * 1000 };
  if (entry.count >= 10 || attempts.size >= 10000)
    throw new AppError('Demasiados intentos. Intenta en 15 minutos', 429);
  entry.count++;
  attempts.set(key, entry);
  if (
    typeof req.body.email !== 'string' ||
    typeof req.body.password !== 'string'
  )
    throw new AppError('Credenciales inválidas', 401);
  const user = await User.unscoped().findOne({
    where: { email: req.body.email.trim().toLowerCase(), isActive: true },
  });
  if (!user || !verifyPassword(req.body.password, user.passwordHash))
    throw new AppError('Credenciales inválidas', 401);
  const token = randomBytes(32).toString('hex');
  await Session.destroy({ where: { expiresAt: { [Op.lt]: new Date() } } });
  await Session.create({
    tokenHash: digest(token),
    userId: user.id,
    expiresAt: new Date(now + 8 * 3600000),
  });
  res.cookie('printbox', token, { ...cookieOptions, maxAge: 8 * 3600000 });
  res.json({ id: user.id, name: user.name, role: user.role });
};
exports.me = (req, res) => res.json(req.user);
exports.logout = async (req, res) => {
  await Session.destroy({ where: { tokenHash: req.sessionHash } });
  res.clearCookie('printbox', cookieOptions);
  res.sendStatus(204);
};
