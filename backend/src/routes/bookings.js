const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createBooking, getAllBookings, getMyBookings, getBookingById, updateBookingStatus, cancelBooking } = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

router.get('/', authenticate, requirePermission('ViewBooking'), getAllBookings);
router.get('/my', authenticate, getMyBookings);
router.get('/busy', authenticate, require('express-validator').query('date').isString(), require('../controllers/bookingController').getBusySlots);
router.get('/:id', authenticate, requirePermission('ViewBooking'), getBookingById);

router.post('/', authenticate, requirePermission('CreateBooking'), [
  body('serviceIds').isArray({ min: 1 }).withMessage('Cần chọn ít nhất 1 dịch vụ'),
  body('startTime').isISO8601().withMessage('Thời gian không hợp lệ'),
  body('chairId').notEmpty().withMessage('Cần chọn ghế'),
], createBooking);

router.patch('/:id/status', authenticate, requirePermission('ManageBooking'), updateBookingStatus);
router.patch('/:id/cancel', authenticate, cancelBooking);

module.exports = router;
