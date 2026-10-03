// Aquí se conectan todas las piezas: repositorio, commands, queries y controller.
const ProductRepository = require('../infrastructure/repositories/ProductRepository');
const CreateProductCommand = require('../application/products/commands/CreateProductCommand');
const UpdateProductCommand = require('../application/products/commands/UpdateProductCommand');
const DeleteProductCommand = require('../application/products/commands/DeleteProductCommand');
const GetProductByIdQuery = require('../application/products/queries/GetProductByIdQuery');
const GetActiveProductsQuery = require('../application/products/queries/GetActiveProductsQuery');
const ProductController = require('../api/controllers/ProductController');

const productRepository = new ProductRepository();

const productController = new ProductController({
  createProduct: new CreateProductCommand(productRepository),
  updateProduct: new UpdateProductCommand(productRepository),
  deleteProduct: new DeleteProductCommand(productRepository),
  getProductById: new GetProductByIdQuery(productRepository),
  getActiveProducts: new GetActiveProductsQuery(productRepository),
});

module.exports = { productController };
