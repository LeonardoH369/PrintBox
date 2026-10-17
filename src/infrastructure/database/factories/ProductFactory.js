// Factory de datos de demostración, sin dependencias ni conexión a la BD.
const adjectives = ['Modular', 'Compacto', 'Personalizado', 'Articulado', 'Minimalista', 'Reforzado'];
const items = ['Soporte para teléfono', 'Organizador', 'Llavero', 'Figura decorativa', 'Portacables', 'Base para laptop'];
const categories = ['Escritorio', 'Accesorios', 'Figuras', 'Organización'];

function createProduct(overrides = {}) {
  const pick = (values) => values[Math.floor(Math.random() * values.length)];
  return {
    name: `${pick(items)} ${pick(adjectives)}`,
    description: 'Producto de muestra fabricado mediante impresión 3D.',
    price: Number((35 + Math.random() * 400).toFixed(2)),
    stock: Math.floor(Math.random() * 51),
    category: pick(categories),
    isActive: true,
    ...overrides,
  };
}

function createProducts(count = 5) {
  if (!Number.isInteger(count) || count < 1 || count > 100) {
    throw new RangeError('count debe ser un entero entre 1 y 100');
  }
  return Array.from({ length: count }, () => createProduct());
}

module.exports = { createProduct, createProducts };
