class GetActiveProductsQuery {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute() {
    return this.productRepository.findAllActive();
  }
}

module.exports = GetActiveProductsQuery;
