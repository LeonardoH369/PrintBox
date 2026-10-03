const IProductRepository = require('../../domain/repositories/IProductRepository');
const ProductModel = require('../database/models/ProductModel');

const toPlain = (row) => ({ ...row.toJSON(), price: Number(row.price) });

class ProductRepository extends IProductRepository {
  async create(product) {
    const { id, ...data } = product;
    const created = await ProductModel.create(data);
    return toPlain(created);
  }

  async findById(id) {
    const row = await ProductModel.findOne({ where: { id, isActive: true } });
    return row ? toPlain(row) : null;
  }

  async findAllActive() {
    const rows = await ProductModel.findAll({ where: { isActive: true }, order: [['id', 'ASC']] });
    return rows.map(toPlain);
  }

  async update(id, product) {
    const { id: ignoredId, isActive, ...data } = product;
    await ProductModel.update(data, { where: { id, isActive: true } });
    return this.findById(id);
  }

  // Borrado seguro: la fila se queda en la base, solo se marca como inactiva
  async softDelete(id) {
    const [affected] = await ProductModel.update({ isActive: false }, { where: { id, isActive: true } });
    return affected > 0;
  }
}

module.exports = ProductRepository;
