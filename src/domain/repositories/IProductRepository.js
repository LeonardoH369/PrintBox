// Contrato que debe cumplir cualquier repositorio de productos.
// La capa de aplicación depende de este contrato, no de Sequelize.
class IProductRepository {
  async create(product) { throw new Error('No implementado'); }
  async findById(id) { throw new Error('No implementado'); }
  async findAllActive() { throw new Error('No implementado'); }
  async update(id, product) { throw new Error('No implementado'); }
  async softDelete(id) { throw new Error('No implementado'); }
}

module.exports = IProductRepository;
