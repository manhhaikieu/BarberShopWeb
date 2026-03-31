const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, sellProduct } = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

router.get('/', getAllProducts);
router.get('/:id', getProductById);

router.post('/', authenticate, requirePermission('ManageProduct'), [
  body('name').notEmpty().withMessage('Tên sản phẩm là bắt buộc'),
  body('price').isFloat({ min: 0 }).withMessage('Giá không hợp lệ'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Số lượng không hợp lệ'),
], createProduct);

router.put('/:id', authenticate, requirePermission('ManageProduct'), updateProduct);
router.delete('/:id', authenticate, requirePermission('ManageProduct'), deleteProduct);
router.post('/:id/sell', authenticate, requirePermission('ManageProduct'), sellProduct);

module.exports = router;
