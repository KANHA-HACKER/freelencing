// models/Service.js - Service Schema
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Web Development',
      'Mobile Development',
      'Graphic Design',
      'Content Writing',
      'Digital Marketing',
      'Tutoring',
      'Photography',
      'Plumbing',
      'Electrical Work',
      'Carpentry',
      'Music Lessons',
      'Fitness Training'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  deliveryTime: {
    type: String,
    required: [true, 'Delivery time is required'],
    enum: ['1 day', '2 days', '3 days', '5 days', '1 week', '2 weeks', '1 month']
  },
  features: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
serviceSchema.index({ userId: 1, category: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ rating: -1 });

// Virtual populate for user details
serviceSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included when converting to JSON
serviceSchema.set('toJSON', { virtuals: true });
serviceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Service', serviceSchema);