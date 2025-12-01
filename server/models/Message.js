const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['user', 'system'],
    default: 'user'
  },
  text: {
    type: String,
    required: true,
    maxlength: 2000
  },
  relatedAssetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset'
  },
  // Track which users have read this message
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

messageSchema.index({ songId: 1, createdAt: -1 });

messageSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Message', messageSchema);
