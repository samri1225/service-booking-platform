const express = require('express');
const router = express.Router();
const { protect, authorise } = require('../middleware/auth');
const {
  createService,
  getAllServices,
  getServiceById,
  getServicesByProvider,
  getProviderReviews,
  updateService,
  deleteService
} = require('../controllers/serviceController');

// Public routes
router.get('/', getAllServices);
router.get('/provider/:providerId', getServicesByProvider);
router.get('/provider/:providerId/reviews', getProviderReviews);
router.get('/:id', getServiceById);

// Protected routes
router.post('/', protect, authorise('provider', 'admin'), createService);
router.put('/:id', protect, authorise('provider', 'admin'), updateService);
router.delete('/:id', protect, authorise('provider', 'admin'), deleteService);

module.exports = router;