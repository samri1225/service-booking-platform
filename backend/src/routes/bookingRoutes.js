const express = require('express');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  completeBooking,
  confirmCompletion,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, authorise } = require('../middleware/auth');

const router = express.Router();

// All booking routes require authentication
router.use(protect);

router.route('/')
  .post(authorise('customer'), createBooking)  // customers only
  .get(getMyBookings);                          // role-aware inside controller

router.get('/:id', getBookingById);

router.put('/:id/status', updateBookingStatus);
router.put('/:id/complete', authorise('provider'), completeBooking);
router.put('/:id/confirm', authorise('customer'), confirmCompletion);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
