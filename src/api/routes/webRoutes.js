const { Router } = require('express');
const productViews = require('../controllers/ProductViewController');

// Equivalente de routes/web.php en el stack autorizado de PrintBox.
const router = Router();

router.get('/', (req, res) => res.redirect('/products'));
router.get('/products', productViews.index);
router.get('/products/create', productViews.create);
// Se conserva para una actividad posterior, sin enlace en el listado.
router.get('/products/:id/edit', productViews.edit);

module.exports = router;
