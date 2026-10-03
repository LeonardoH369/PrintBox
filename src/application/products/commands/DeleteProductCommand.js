const { NotFoundError } = require('../../errors/AppError');

class DeleteProductCommand {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(id) {
    const deleted = await this.productRepository.softDelete(id);
    if (!deleted) throw new NotFoundError('Producto no encontrado');
  }
}

module.exports = DeleteProductCommand;
