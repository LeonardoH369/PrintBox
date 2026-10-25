const {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} = require('node:crypto');
const { AppError } = require('./errors/AppError');
function passwordHash(password) {
  if (
    typeof password !== 'string' ||
    password.length < 12 ||
    password.length > 128
  )
    throw new AppError('La contraseña debe tener de 12 a 128 caracteres', 400);
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
function verifyPassword(password, hash) {
  if (typeof password !== 'string' || password.length > 128) return false;
  const [salt, value] = hash.split(':');
  const stored = Buffer.from(value, 'hex');
  const actual = scryptSync(password, salt, 64);
  return stored.length === actual.length && timingSafeEqual(stored, actual);
}
const digest = (token) => createHash('sha256').update(token).digest('hex');
function text(value, max, label) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max)
    throw new AppError(
      `${label}: campo obligatorio, máximo ${max} caracteres`,
      400
    );
  return value.trim();
}
function positiveId(value) {
  if (!/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(Number(value)))
    throw new AppError('Identificador inválido', 400);
  return Number(value);
}
const statuses = ['RECEIVED', 'PRINTING', 'READY', 'IN_ROUTE', 'DELIVERED'];
function nextStatus(current, next) {
  if (
    statuses.indexOf(next) !== statuses.indexOf(current) + 1 ||
    !statuses.includes(next)
  )
    throw new AppError(
      'El estado debe avanzar al siguiente paso del proceso',
      409
    );
}
function photo(input) {
  if (
    !input ||
    !['image/png', 'image/jpeg'].includes(input.mime) ||
    typeof input.base64 !== 'string' ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(input.base64)
  )
    throw new AppError('Adjunta una fotografía PNG o JPEG', 400);
  const data = Buffer.from(input.base64, 'base64');
  if (!data.length || data.length > 3 * 1024 * 1024)
    throw new AppError('La fotografía debe pesar como máximo 3 MB', 400);
  const png = data
    .subarray(0, 8)
    .equals(Buffer.from('89504e470d0a1a0a', 'hex'));
  const jpeg =
    data[0] === 255 &&
    data[1] === 216 &&
    data[2] === 255 &&
    data.at(-2) === 255 &&
    data.at(-1) === 217;
  if (!(input.mime === 'image/png' ? png : jpeg))
    throw new AppError(
      'El contenido no coincide con el formato de imagen',
      400
    );
  return { mime: input.mime, data };
}
module.exports = {
  passwordHash,
  verifyPassword,
  digest,
  text,
  positiveId,
  nextStatus,
  photo,
  statuses,
};
