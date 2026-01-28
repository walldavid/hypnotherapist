const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  sections: [{
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['heading', 'paragraph', 'list', 'image'],
      default: 'paragraph'
    },
    content: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  metaDescription: {
    type: String,
    maxlength: 160
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published'
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Update lastModified on save
pageSchema.pre('save', async function() {
  this.lastModified = Date.now();
});

module.exports = mongoose.model('Page', pageSchema);
