const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Member'],
    default: 'Member'
  },
  instrument: {
    type: String,
    trim: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const bandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Band name is required'],
    trim: true,
    minlength: [2, 'Band name must be at least 2 characters']
  },
  genre: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  location: {
    type: String,
    trim: true
  },
  cover: {
    type: String,
    default: 'gradient-1'
  },
  inviteCode: {
    type: String,
    unique: true,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  members: [memberSchema]
}, {
  timestamps: true
});

// Indexes
bandSchema.index({ inviteCode: 1 });
bandSchema.index({ 'members.userId': 1 });

// Generate unique invite code
bandSchema.statics.generateInviteCode = function(bandName) {
  const prefix = bandName
    .substring(0, 2)
    .toUpperCase()
    .replace(/[^A-Z]/g, 'X');
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${random}-${suffix}`;
};

// Check if user is member
bandSchema.methods.isMember = function(userId) {
  return this.members.some(m => m.userId.equals(userId));
};

// Check if user is admin
bandSchema.methods.isAdmin = function(userId) {
  const member = this.members.find(m => m.userId.equals(userId));
  return member && member.role === 'Admin';
};

// Get member info
bandSchema.methods.getMember = function(userId) {
  return this.members.find(m => m.userId.equals(userId));
};

module.exports = mongoose.model('Band', bandSchema);
