const express = require('express');
const router = express.Router();
const { protect, authorise } = require('../middleware/auth');
const {
  getAllUsers,
  getAllBookings,
  approveProvider,
  deleteUser,
  getDashboardStats
} = require('../controllers/adminController');

// All admin routes require authentication AND admin role
router.use(protect);
router.use(authorise('admin'));

// Admin routes
router.get('/users', getAllUsers);
router.get('/bookings', getAllBookings);
router.put('/users/:id/approve', approveProvider);
router.delete('/users/:id', deleteUser);
router.get('/stats', getDashboardStats);

module.exports = router;