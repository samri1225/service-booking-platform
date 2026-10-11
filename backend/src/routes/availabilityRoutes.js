const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAvailability,
  updateAvailability,
  blockDate,
  unblockDate,
  checkAvailability
} = require('../controllers/availabilityController');

// Public routes
router.get('/:providerId', getAvailability);
router.post('/check', checkAvailability);

// Protected routes (Provider only)
router.put('/', protect, updateAvailability);
router.post('/block-date', protect, blockDate);
router.delete('/block-date/:date', protect, unblockDate);

module.exports = router;