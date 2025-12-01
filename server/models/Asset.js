const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: [true, 'Song ID is required'],
    index: true
  },
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  type: {
    type: String,
    enum: ['audio', 'image', 'text'],
    required: [true, 'Asset type is required']
  },
  title: {
    type: String,
    trim: true,
    default: ''
  },
  url: {
    type: String,
    default: null
  },
  content: {
    type: String,
    default: null 
  },
  duration: {
    type: String,
    default: null
  },
  votes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  authorName: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

assetSchema.index({ songId: 1, createdAt: -1 });

assetSchema.virtual('voteCount').get(function() {
  return this.votes?.length || 0;
});

// Check if user has voted
assetSchema.methods.hasVoted = function(userId) {
  return this.votes.some(v => v.equals(userId));
};

assetSchema.set('toJSON', { virtuals: true });
assetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Asset', assetSchema);
