const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'provider', 'admin'],
    default: 'customer'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  
  // ✅ Provider details
  providerDetails: {
    services: {
      type: [String],
      default: []
    },
    hourlyRate: {
      type: Number,
      default: null
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    
    // ✅ Weekly availability schedule
    availability: {
      type: [
        {
          day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          },
          startTime: {
            type: String,
            default: '09:00 AM'
          },
          endTime: {
            type: String,
            default: '05:00 PM'
          },
          isAvailable: {
            type: Boolean,
            default: true
          }
        }
      ],
      default: []
    },
    
    // ✅ Blocked dates (holidays, time off)
    blockedDates: {
      type: [
        {
          date: {
            type: Date,
            required: true
          },
          reason: {
            type: String,
            default: 'Unavailable'
          }
        }
      ],
      default: []
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Indexes for better query performance
//userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'providerDetails.availability.day': 1 });

module.exports = mongoose.model('User', userSchema);