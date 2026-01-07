const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'application_accepted',    
      'application_rejected',    
      'new_applicant',          
      'member_joined',          
      'new_message',            
      'new_asset'              
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    maxlength: 200
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  relatedType: {
    type: String,
    enum: ['gig', 'band', 'song', 'user']
  },
  link: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

// Auto-delete old notifications 
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);
