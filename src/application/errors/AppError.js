class AppError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

class ValidationError extends AppError {
  constructor(errors = []) {
    super('Datos inválidos', 400, errors);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

module.exports = { AppError, ValidationError, NotFoundError };
