const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

const gigSchema = new mongoose.Schema({
  bandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Band',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['member', 'session'],
    required: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  compensation: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'filled'],
    default: 'open'
  },
  applicants: [applicantSchema],
  requirements: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for efficient queries
gigSchema.index({ status: 1, createdAt: -1 });
gigSchema.index({ bandId: 1 });
gigSchema.index({ type: 1 });
gigSchema.index({ role: 1 });

// Virtual for band info
gigSchema.virtual('band', {
  ref: 'Band',
  localField: 'bandId',
  foreignField: '_id',
  justOne: true
});

// Check if user has already applied
gigSchema.methods.hasApplied = function(userId) {
  return this.applicants.some(a => a.userId.equals(userId));
};

// Get applicant by userId
gigSchema.methods.getApplicant = function(userId) {
  return this.applicants.find(a => a.userId.equals(userId));
};

// Count pending applicants
gigSchema.methods.pendingCount = function() {
  return this.applicants.filter(a => a.status === 'pending').length;
};

gigSchema.set('toJSON', { virtuals: true });
gigSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Gig', gigSchema);
