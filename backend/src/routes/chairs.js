const express = require('express');
const router = express.Router();
const { getAllChairs, createChair, updateChair, deleteChair } = require('../controllers/chairController');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

router.get('/', getAllChairs);
router.post('/', authenticate, requirePermission('ManageBarber'), createChair);
router.put('/:id', authenticate, requirePermission('ManageBarber'), updateChair);
router.delete('/:id', authenticate, requirePermission('ManageBarber'), deleteChair);

module.exports = router;
