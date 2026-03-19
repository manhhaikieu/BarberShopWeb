const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAllServices, getServiceById, createService, updateService, deleteService } = require('../controllers/serviceController');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

router.get('/', getAllServices);
router.get('/:id', getServiceById);

router.post('/', authenticate, requirePermission('ManageBooking'), [
  body('name').notEmpty().withMessage('Tên dịch vụ là bắt buộc'),
  body('price').isFloat({ min: 0 }).withMessage('Giá không hợp lệ'),
  body('duration').isInt({ min: 1 }).withMessage('Thời gian tối thiểu 1 phút'),
], createService);

router.put('/:id', authenticate, requirePermission('ManageBooking'), updateService);
router.delete('/:id', authenticate, requirePermission('ManageBooking'), deleteService);

module.exports = router;
