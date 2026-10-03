const { ValidationError } = require('../../application/errors/AppError');

const parseId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new ValidationError(['El id debe ser un entero positivo']);
  return id;
};

class ProductController {
  constructor({ createProduct, updateProduct, deleteProduct, getProductById, getActiveProducts }) {
    this.createProduct = createProduct;
    this.updateProduct = updateProduct;
    this.deleteProduct = deleteProduct;
    this.getProductById = getProductById;
    this.getActiveProducts = getActiveProducts;
  }

  create = async (req, res, next) => {
    try {
      const product = await this.createProduct.execute(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const product = await this.updateProduct.execute(parseId(req.params.id), req.body);
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  };

  remove = async (req, res, next) => {
    try {
      await this.deleteProduct.execute(parseId(req.params.id));
      res.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const product = await this.getProductById.execute(parseId(req.params.id));
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req, res, next) => {
    try {
      const products = await this.getActiveProducts.execute();
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = ProductController;
