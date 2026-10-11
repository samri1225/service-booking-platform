const Service = require('../models/Service');
const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Create a new service
// @route   POST /api/services
// @access  Private (Provider only)
exports.createService = async (req, res) => {
  try {
    const { title, description, category, price, duration, location, images } = req.body;

    const provider = await User.findById(req.user.id);
    if (!provider || provider.role !== 'provider') {
      return res.status(403).json({ success: false, message: 'Only providers can create services' });
    }
    if (!provider.isApproved) {
      return res.status(403).json({ success: false, message: 'Your provider account is pending approval' });
    }

    const service = await Service.create({
      providerId: req.user.id,
      title,
      description,
      category,
      price,
      duration,
      location,
      images: images || [],
      isActive: true
    });

    res.status(201).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all active services (with provider rating & review count)
// @route   GET /api/services
// @access  Public
exports.getAllServices = async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const services = await Service.find(filter)
      .populate({
        path: 'providerId',
        select: 'name email providerDetails.rating providerDetails.totalReviews profile'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Service.countDocuments(filter);

    res.status(200).json({
      success: true,
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single service by ID (with provider rating)
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate({
      path: 'providerId',
      select: 'name email providerDetails.rating providerDetails.totalReviews profile'
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.status(200).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get services by a specific provider
// @route   GET /api/services/provider/:providerId
// @access  Public
exports.getServicesByProvider = async (req, res) => {
  try {
    const services = await Service.find({
      providerId: req.params.providerId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Provider who owns it)
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (service.providerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this service' });
    }

    const { title, description, category, price, duration, location, images, isActive } = req.body;

    if (title !== undefined) service.title = title;
    if (description !== undefined) service.description = description;
    if (category !== undefined) service.category = category;
    if (price !== undefined) service.price = price;
    if (duration !== undefined) service.duration = duration;
    if (location !== undefined) service.location = location;
    if (images !== undefined) service.images = images;
    if (isActive !== undefined) service.isActive = isActive;

    await service.save();

    res.status(200).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Provider who owns it)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (service.providerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this service' });
    }

    await service.deleteOne();
    res.status(200).json({ success: true, message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews for a provider (public)
// @route   GET /api/services/provider/:providerId/reviews
// @access  Public
exports.getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;

    const reviews = await Booking.find({
      providerId,
      rating: { $exists: true, $ne: null }
    })
      .populate('customerId', 'name profile.profileImage')
      .populate('serviceId', 'title category')
      .select('rating review ratedAt serviceId customerId createdAt')
      .sort({ ratedAt: -1, createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      reviews,
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        distribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};