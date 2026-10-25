const { Session, User } = require('../../infrastructure/database/models');
const { digest } = require('../../application/security');
const { AppError } = require('../../application/errors/AppError');
async function authenticated(req, res, next) {
  const token = (req.headers.cookie || '')
    .split(';')
    .map((v) => v.trim())
    .find((v) => v.startsWith('printbox='))
    ?.slice(9);
  if (!token || !/^[a-f0-9]{64}$/.test(token))
    return next(new AppError('Inicia sesión para continuar', 401));
  const session = await Session.findByPk(digest(token), { include: User });
  if (!session || session.expiresAt <= new Date() || !session.User?.isActive)
    return next(new AppError('Sesión vencida o cuenta inactiva', 401));
  req.user = session.User;
  req.sessionHash = session.tokenHash;
  next();
}
function admin(req, res, next) {
  if (req.user.role !== 'ADMIN')
    return next(new AppError('Se requiere el rol administrador', 403));
  next();
}
function protectWrites(req, res, next) {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
    req.get('X-PrintBox') !== '1'
  )
    return next(
      new AppError('Falta el encabezado de protección de la solicitud', 403)
    );
  // No se habilita CORS: un sitio ajeno no puede enviar este encabezado desde el navegador.
  next();
}
module.exports = { authenticated, admin, protectWrites };
