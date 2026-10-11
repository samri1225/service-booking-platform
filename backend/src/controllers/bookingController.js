const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const { to12Hour, toMinutes } = require('../utils/locale');
const {
  sendBookingNotification,
  sendBookingConfirmation,
  sendBookingCompleted,
  sendBookingCancelled
} = require('../utils/email');

// @desc    Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { serviceId, bookingDate, startTime, endTime, customerNotes } = req.body;
    const customerId = req.user.id;

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    const provider = await User.findById(service.providerId);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    if (!provider.isApproved) {
      return res.status(400).json({ success: false, message: 'Provider is not approved yet' });
    }

    // CHECK 1: Is the date blocked?
    const dateObj = new Date(bookingDate);
    const isBlocked = provider.providerDetails?.blockedDates?.some(
      b => new Date(b.date).toDateString() === dateObj.toDateString()
    );
    if (isBlocked) {
      return res.status(400).json({ success: false, message: 'Provider is unavailable on this date (blocked)' });
    }

    // CHECK 2: Is the day available?
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[dateObj.getDay()];
    const availability = provider.providerDetails?.availability || [];
    const daySchedule = availability.find(a => a.day === dayName && a.isAvailable);

    if (!daySchedule) {
      return res.status(400).json({ success: false, message: `Provider is not available on ${dayName}s` });
    }

    // CHECK 3: Is time within working hours?
    const bookingStart = toMinutes(startTime);
    const bookingEnd = toMinutes(endTime);
    const scheduleStart = toMinutes(daySchedule.startTime);
    const scheduleEnd = toMinutes(daySchedule.endTime);

    if (bookingStart >= bookingEnd) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    if (bookingStart < scheduleStart || bookingEnd > scheduleEnd) {
      return res.status(400).json({
        success: false,
        message: `Provider works from ${daySchedule.startTime} to ${daySchedule.endTime} (Ethiopian Time) on ${dayName}s.`
      });
    }

    // CHECK 4: Double-booking?
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBooking = await Booking.findOne({
      providerId: service.providerId,
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      const existingStart = toMinutes(existingBooking.startTime);
      const existingEnd = toMinutes(existingBooking.endTime);
      if (bookingStart < existingEnd && bookingEnd > existingStart) {
        return res.status(400).json({ success: false, message: 'Provider is already booked at this time.' });
      }
    }

    const totalAmount = service.price;
    const depositAmount = totalAmount * 0.2;

    const booking = await Booking.create({
      customerId,
      providerId: service.providerId,
      serviceId,
      bookingDate,
      startTime: to12Hour(startTime),
      endTime: to12Hour(endTime),
      totalAmount,
      depositAmount,
      customerNotes,
      status: 'pending',
      paymentStatus: 'pending'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email')
      .populate('providerId', 'name email')
      .populate('serviceId', 'title price duration category');

    try {
      await sendBookingNotification(populatedBooking, populatedBooking.providerId, populatedBooking.customerId);
    } catch (error) {
      console.error('Email error:', error.message);
    }

    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings
exports.getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let filter = {};
    if (userRole === 'customer') filter.customerId = userId;
    else if (userRole === 'provider') filter.providerId = userId;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bookings = await Booking.find(filter)
      .populate('customerId', 'name email')
      .populate('providerId', 'name email')
      .populate('serviceId', 'title price duration category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      bookings,
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

// @desc    Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'name email')
      .populate('providerId', 'name email')
      .populate('serviceId', 'title price duration category description');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const userId = req.user.id;
    const userRole = req.user.role;
    const isCustomer = booking.customerId._id.toString() === userId;
    const isProvider = booking.providerId._id.toString() === userId;

    if (!isCustomer && !isProvider && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'name email')
      .populate('providerId', 'name email')
      .populate('serviceId', 'title price');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isProvider = booking.providerId._id.toString() === req.user.id;
    const isCustomer = booking.customerId._id.toString() === req.user.id;
    const userRole = req.user.role;

    const validTransitions = {
      pending: ['confirmed', 'declined', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
      declined: []
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot transition from ${booking.status} to ${status}` });
    }

    if (['confirmed', 'declined'].includes(status) && !isProvider && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only provider can confirm/decline' });
    }
    if (status === 'declined' && !reason) {
      return res.status(400).json({ success: false, message: 'Provide a reason for declining' });
    }
    if (status === 'cancelled' && !isCustomer && !isProvider && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel' });
    }
    if (status === 'completed' && !isProvider && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only provider can complete' });
    }

    booking.status = status;
    if (reason) booking.cancellationReason = reason;
    if (status === 'completed') booking.completedAt = new Date();
    await booking.save();

    try {
      if (status === 'confirmed') await sendBookingConfirmation(booking, booking.customerId, booking.providerId);
      if (status === 'completed') await sendBookingCompleted(booking, booking.customerId, booking.providerId);
      if (['cancelled', 'declined'].includes(status)) await sendBookingCancelled(booking, booking.customerId, booking.providerId, userRole);
    } catch (emailError) {
      console.error('Email error:', emailError.message);
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete booking
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'name email')
      .populate('providerId', 'name email')
      .populate('serviceId', 'title price');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.providerId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only provider can complete' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Booking must be confirmed first' });
    }

    booking.status = 'completed';
    booking.completedAt = new Date();
    await booking.save();

    try {
      await sendBookingCompleted(booking, booking.customerId, booking.providerId);
    } catch (error) {
      console.error('Email error:', error.message);
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm completion with rating and review
// @route   PUT /api/bookings/:id/confirm
// @access  Private (Customer only)
exports.confirmCompletion = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const bookingId = req.params.id;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId)
      .populate('customerId', 'name email')
      .populate('providerId', 'name email')
      .populate('serviceId', 'title price');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check customer ownership
    if (booking.customerId._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the customer can confirm this booking' });
    }

    // Must be completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Booking must be completed before rating' });
    }

    // Already rated?
    if (booking.rating) {
      return res.status(400).json({ success: false, message: 'You have already rated this booking' });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a rating between 1 and 5' });
    }

    // Save rating and review
    booking.rating = rating;
    booking.review = review || '';
    booking.ratedAt = new Date();
    await booking.save();

    // ✅ Recalculate provider's average rating
    const provider = await User.findById(booking.providerId._id);
    if (provider) {
      const allRatedBookings = await Booking.find({
        providerId: booking.providerId._id,
        rating: { $exists: true, $ne: null }
      });

      const totalRatings = allRatedBookings.reduce((sum, b) => sum + b.rating, 0);
      const avgRating = allRatedBookings.length > 0 ? totalRatings / allRatedBookings.length : 0;

      if (!provider.providerDetails) provider.providerDetails = {};
      provider.providerDetails.rating = Math.round(avgRating * 10) / 10;
      provider.providerDetails.totalReviews = allRatedBookings.length;
      await provider.save();
    }

    res.status(200).json({
      success: true,
      message: 'Thank you for your rating!',
      booking
    });
  } catch (error) {
    console.error('Confirm completion error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'name email')
      .populate('providerId', 'name email')
      .populate('serviceId', 'title price');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isCustomer = booking.customerId._id.toString() === req.user.id;
    const isProvider = booking.providerId._id.toString() === req.user.id;
    const userRole = req.user.role;

    if (!isCustomer && !isProvider && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Completed bookings cannot be cancelled' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Already cancelled' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'Cancelled by user';
    booking.cancelledBy = userRole;
    await booking.save();

    try {
      await sendBookingCancelled(booking, booking.customerId, booking.providerId, userRole);
    } catch (error) {
      console.error('Email error:', error.message);
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};