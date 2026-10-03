const Product = require('../../../domain/entities/Product');
const { ValidationError } = require('../../errors/AppError');

class CreateProductCommand {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(data) {
    const product = new Product(data);
    const errors = product.validate();
    if (errors.length > 0) throw new ValidationError(errors);
    return this.productRepository.create(product);
  }
}

module.exports = CreateProductCommand;
