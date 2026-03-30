const express = require('express');
const router = express.Router();
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const { createProductOrder, getAllProductOrders, updateProductOrderStatus } = require('../controllers/productOrderController');

// Khách hàng vãng lai cũng có thể tự đặt lịch
router.post('/', optionalAuthenticate, createProductOrder);

// Quản lý đơn hàng (admin only)
router.get('/', authenticate, requirePermission('ManageProduct'), getAllProductOrders);
router.put('/:id/status', authenticate, requirePermission('ManageProduct'), updateProductOrderStatus);

module.exports = router;
