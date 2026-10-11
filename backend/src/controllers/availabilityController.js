const User = require('../models/User');
const Booking = require('../models/Booking');
const { to12Hour, toMinutes } = require('../utils/locale');

// @desc    Get provider availability
exports.getAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.params.providerId);
    if (!user) return res.status(404).json({ success: false, message: 'Provider not found' });
    if (user.role !== 'provider') return res.status(400).json({ success: false, message: 'Not a provider' });

    res.status(200).json({
      success: true,
      availability: user.providerDetails?.availability || [],
      blockedDates: user.providerDetails?.blockedDates || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update availability
exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role !== 'provider') return res.status(400).json({ success: false, message: 'Only providers can set availability' });

    if (!user.providerDetails) user.providerDetails = {};

    const formatted = availability.map(slot => ({
      ...slot,
      startTime: to12Hour(slot.startTime),
      endTime: to12Hour(slot.endTime)
    }));

    user.providerDetails.availability = formatted;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated (Ethiopian Time)',
      availability: user.providerDetails.availability
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Block date
exports.blockDate = async (req, res) => {
  try {
    const { date, reason } = req.body;
    if (!date) return res.status(400).json({ success: false, message: 'Please provide a date' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role !== 'provider') return res.status(400).json({ success: false, message: 'Only providers can block dates' });

    if (!user.providerDetails) user.providerDetails = {};
    if (!user.providerDetails.blockedDates) user.providerDetails.blockedDates = [];

    const dateObj = new Date(date);
    const alreadyBlocked = user.providerDetails.blockedDates.some(
      b => new Date(b.date).toDateString() === dateObj.toDateString()
    );

    if (alreadyBlocked) return res.status(400).json({ success: false, message: 'Date already blocked' });

    user.providerDetails.blockedDates.push({ date: dateObj, reason: reason || 'Unavailable' });
    await user.save();

    res.status(200).json({ success: true, message: 'Date blocked', blockedDates: user.providerDetails.blockedDates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unblock date
exports.unblockDate = async (req, res) => {
  try {
    const { date } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.providerDetails?.blockedDates) {
      return res.status(400).json({ success: false, message: 'No blocked dates' });
    }

    const dateObj = new Date(date);
    user.providerDetails.blockedDates = user.providerDetails.blockedDates.filter(
      b => new Date(b.date).toDateString() !== dateObj.toDateString()
    );
    await user.save();

    res.status(200).json({ success: true, message: 'Date unblocked', blockedDates: user.providerDetails.blockedDates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check availability
exports.checkAvailability = async (req, res) => {
  try {
    const { providerId, bookingDate, startTime, endTime } = req.body;
    if (!providerId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const user = await User.findById(providerId);
    if (!user) return res.status(404).json({ success: false, message: 'Provider not found' });

    const dateObj = new Date(bookingDate);
    const isBlocked = user.providerDetails?.blockedDates?.some(
      b => new Date(b.date).toDateString() === dateObj.toDateString()
    );
    if (isBlocked) return res.status(200).json({ success: true, available: false, message: 'Provider is unavailable on this date' });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[dateObj.getDay()];
    const availability = user.providerDetails?.availability || [];
    const daySchedule = availability.find(a => a.day === dayName && a.isAvailable);

    if (!daySchedule) return res.status(200).json({ success: true, available: false, message: `Provider is not available on ${dayName}s` });

    const bookingStart = toMinutes(startTime);
    const bookingEnd = toMinutes(endTime);
    const scheduleStart = toMinutes(daySchedule.startTime);
    const scheduleEnd = toMinutes(daySchedule.endTime);

    if (bookingStart < scheduleStart || bookingEnd > scheduleEnd) {
      return res.status(200).json({
        success: true,
        available: false,
        message: `Provider works from ${daySchedule.startTime} to ${daySchedule.endTime} (Ethiopian Time) on ${dayName}s`
      });
    }

    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Booking.findOne({
      providerId,
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existing) {
      const existingStart = toMinutes(existing.startTime);
      const existingEnd = toMinutes(existing.endTime);
      if (bookingStart < existingEnd && bookingEnd > existingStart) {
        return res.status(200).json({ success: true, available: false, message: 'Provider is already booked at this time' });
      }
    }

    res.status(200).json({ success: true, available: true, message: 'Provider is available' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};