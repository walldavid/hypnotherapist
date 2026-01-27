const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['audio', 'course', 'pdf', 'video', 'bundle'],
    default: 'audio'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  files: [{
    filename: String,
    originalName: String,
    gcsUrl: String,  // Google Cloud Storage URL
    fileSize: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  features: [String],
  tags: [String],
  duration: String,  // e.g., "45 minutes", "6 hours"
  downloadLimit: {
    type: Number,
    default: 5  // Number of times a customer can download
  },
  downloadExpiry: {
    type: Number,
    default: 48  // Hours until download link expires
  },
  salesCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return `€${this.price.toFixed(2)}`;
});

module.exports = mongoose.model('Product', productSchema);
