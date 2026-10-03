class Product {
  constructor({ id = null, name, description = null, price, stock = 0, category = null, isActive = true }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.category = category;
    this.isActive = isActive;
  }

  validate() {
    const errors = [];
    if (!this.name || !String(this.name).trim()) {
      errors.push('name es obligatorio');
    }
    if (this.price === undefined || this.price === null || isNaN(Number(this.price)) || Number(this.price) < 0) {
      errors.push('price debe ser un número mayor o igual a 0');
    }
    if (!Number.isInteger(Number(this.stock)) || Number(this.stock) < 0) {
      errors.push('stock debe ser un entero mayor o igual a 0');
    }
    return errors;
  }
}

module.exports = Product;
