const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAllBarbers, getBarberById, createBarber, updateBarber, deleteBarber, getBarberSchedule, getMySchedule } = require('../controllers/barberController');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

router.get('/', getAllBarbers);
router.get('/my-schedule', authenticate, requirePermission('ViewBooking'), getMySchedule);
router.get('/:id', getBarberById);
router.get('/:id/schedule', authenticate, requirePermission('ViewBooking'), getBarberSchedule);

router.post('/', authenticate, requirePermission('ManageBarber'), [
  body('name').notEmpty().withMessage('Tên thợ là bắt buộc'),
  body('experienceYears').isInt({ min: 0 }).withMessage('Số năm kinh nghiệm không hợp lệ'),
], createBarber);

router.put('/:id', authenticate, requirePermission('ManageBarber'), updateBarber);
router.delete('/:id', authenticate, requirePermission('ManageBarber'), deleteBarber);

module.exports = router;
