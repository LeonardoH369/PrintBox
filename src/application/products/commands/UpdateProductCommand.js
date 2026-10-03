const Product = require('../../../domain/entities/Product');
const { ValidationError, NotFoundError } = require('../../errors/AppError');

class UpdateProductCommand {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(id, data) {
    const existing = await this.productRepository.findById(id);
    if (!existing) throw new NotFoundError('Producto no encontrado');

    const product = new Product({ ...existing, ...data, id: existing.id });
    const errors = product.validate();
    if (errors.length > 0) throw new ValidationError(errors);
    return this.productRepository.update(id, product);
  }
}

module.exports = UpdateProductCommand;
