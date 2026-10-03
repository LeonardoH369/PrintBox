'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('Products', [
      { name: 'Llavero personalizado', description: 'Llavero impreso en PLA con el nombre que quieras', price: 45.0, stock: 50, category: 'Accesorios', isActive: true, createdAt: now, updatedAt: now },
      { name: 'Soporte para celular', description: 'Soporte de escritorio ajustable impreso en PETG', price: 120.0, stock: 30, category: 'Escritorio', isActive: true, createdAt: now, updatedAt: now },
      { name: 'Dragón articulado', description: 'Figura articulada que se imprime ya armada', price: 220.0, stock: 15, category: 'Figuras', isActive: true, createdAt: now, updatedAt: now },
      { name: 'Organizador de escritorio', description: 'Organizador modular para plumas y papelería', price: 180.0, stock: 20, category: 'Escritorio', isActive: true, createdAt: now, updatedAt: now },
      { name: 'Soporte para audífonos', description: 'Soporte vertical para audífonos de diadema', price: 150.0, stock: 25, category: 'Gaming', isActive: true, createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Products', null, {});
  },
};
