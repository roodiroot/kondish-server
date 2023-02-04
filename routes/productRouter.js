const Router = require('express');

const productController = require('../controllers/productsController.js');
const checkRole = require('../middleware/checkRoleMiddleware.js');

const router = new Router();

router.get('/', productController.getAll);
router.get('/:id', productController.getOne);
router.post('/', checkRole('ADMIN'), productController.create);

module.exports = router;
