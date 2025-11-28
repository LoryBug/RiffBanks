const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  bandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Band',
    required: [true, 'Band ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Song title is required'],
    trim: true,
    minlength: [1, 'Title cannot be empty']
  },
  bpm: {
    type: Number,
    min: [20, 'BPM must be at least 20'],
    max: [300, 'BPM cannot exceed 300']
  },
  genre: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['Idea', 'In Progress', 'Mix', 'Master'],
    default: 'Idea'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for band queries
songSchema.index({ bandId: 1, createdAt: -1 });

module.exports = mongoose.model('Song', songSchema);
