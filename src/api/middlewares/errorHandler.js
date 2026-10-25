const { AppError } = require('../../application/errors/AppError');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res
      .status(err.status)
      .json({ message: err.message, errors: err.errors });
  }
  if (err.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json({
        message: 'El cuerpo de la petición no es un JSON válido',
        errors: [],
      });
  }
  if (err.type === 'entity.too.large')
    return res
      .status(413)
      .json({
        message: 'Archivo demasiado grande (máximo 3 MB de imagen)',
        errors: [],
      });
  if (err.name === 'SequelizeUniqueConstraintError')
    return res
      .status(409)
      .json({ message: 'El correo o folio ya existe', errors: [] });
  if (err.name === 'SequelizeForeignKeyConstraintError')
    return res
      .status(409)
      .json({
        message: 'La operación afecta registros relacionados',
        errors: [],
      });
  console.error(err);
  return res
    .status(500)
    .json({ message: 'Error interno del servidor', errors: [] });
};
