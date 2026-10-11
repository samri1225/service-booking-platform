const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'declined'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  depositAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'deposit_paid', 'full_paid', 'refunded'],
    default: 'pending'
  },
  stripePaymentIntentId: String,
  customerNotes: String,
  providerNotes: String,
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['customer', 'provider', 'admin']
  },
  completedAt: Date,

  // ✅ Rating & Review fields
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true,
    maxlength: 500
  },
  ratedAt: Date
}, {
  timestamps: true
});

// Auto-generate booking ID
bookingSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Booking').countDocuments({
      bookingId: new RegExp(`^BK-${year}-`)
    });
    this.bookingId = `BK-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Indexes
bookingSchema.index({ customerId: 1 });
bookingSchema.index({ providerId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ providerId: 1, bookingDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);