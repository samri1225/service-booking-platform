const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider ID is required']
  },
  title: {
    type: String,
    required: [true, 'Please provide a service title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a service description'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: [
      'Plumbing',
      'Tutoring',
      'Cleaning',
      'Electrician',
      'Gardening',
      'Painting',
      'Carpentry',
      'Moving',
      'Photography',
      'Event Planning',
      'Catering',
      'Transport',
      'IT Support',
      'Other'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  duration: {
    type: Number,
    required: [true, 'Please provide duration in minutes'],
    min: [15, 'Duration must be at least 15 minutes']
  },
  images: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
serviceSchema.index({ category: 1 });
serviceSchema.index({ providerId: 1 });
serviceSchema.index({ isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);
