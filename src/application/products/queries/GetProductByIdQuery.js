const { NotFoundError } = require('../../errors/AppError');

class GetProductByIdQuery {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(id) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundError('Producto no encontrado');
    return product;
  }
}

module.exports = GetProductByIdQuery;
