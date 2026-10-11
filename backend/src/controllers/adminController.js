const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });  // ✅ Newest users first
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customerId', 'name email')
      .populate('providerId', 'name email')
      .populate('serviceId', 'title price')
      .sort({ bookingDate: -1, createdAt: -1 });  // ✅ Newest bookings first
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve a provider
// @route   PUT /api/admin/users/:id/approve
// @access  Private/Admin
exports.approveProvider = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.isApproved = true;
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Provider approved successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await user.deleteOne();
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const pendingProviders = await User.countDocuments({ role: 'provider', isApproved: false });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    
    const completed = await Booking.find({ status: 'completed' });
    const totalRevenue = completed.reduce((sum, b) => sum + b.totalAmount, 0);
    const platformCommission = totalRevenue * 0.1;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProviders,
        totalCustomers,
        pendingProviders,
        totalBookings,
        pendingBookings,
        completedBookings,
        totalRevenue,
        platformCommission
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};