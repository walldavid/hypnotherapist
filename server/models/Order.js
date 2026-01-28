const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  customerName: {
    type: String,
    trim: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'EUR',
    uppercase: true
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    transactionId: String,
    stripePaymentIntentId: String,
    paypalOrderId: String,
    paidAt: Date
  },
  downloads: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    downloadToken: String,
    downloadCount: {
      type: Number,
      default: 0
    },
    lastDownloadedAt: Date,
    expiresAt: Date
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: String,
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes (keep composite and special indexes, remove duplicate unique indexes)
orderSchema.index({ customerEmail: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'downloads.token': 1 }); // For download token lookup

// Generate unique order number
orderSchema.pre('save', async function() {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `HT${year}${month}${random}`;
  }
});

// Virtual for formatted total
orderSchema.virtual('formattedTotal').get(function() {
  return `€${this.total.toFixed(2)}`;
});

module.exports = mongoose.model('Order', orderSchema);
