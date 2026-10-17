const path = require('path');

const webRoot = path.join(__dirname, '../../web');

// Equivalente al controlador resource de vistas; la API conserva su controlador.
class ProductViewController {
  index(req, res) {
    return res.sendFile(path.join(webRoot, 'index.html'));
  }

  create(req, res) {
    return res.sendFile(path.join(webRoot, 'create.html'));
  }

  edit(req, res) {
    if (!/^[1-9]\d*$/.test(req.params.id)) {
      return res.status(404).send('Producto no encontrado');
    }
    return res.sendFile(path.join(webRoot, 'edit.html'));
  }
}

module.exports = new ProductViewController();
