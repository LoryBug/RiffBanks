const Message = require('../models/Message');
const Song = require('../models/Song');
const Band = require('../models/Band');
const mongoose = require('mongoose');

// Get messages for a song
exports.list = async (req, res) => {
  try {
    const { songId } = req.query;

    if (!songId) {
      return res.status(400).json({ error: 'songId is required' });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const band = await Band.findById(song.bandId);
    if (!band) {
      return res.status(404).json({ error: 'Band not found' });
    }

    const isMember = band.members.some(m => m.userId.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ error: 'Not a band member' });
    }

    // Get messages with pagination
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before;

    let query = { songId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'username profilePic')
      .lean();

    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      songId: msg.songId,
      userId: msg.userId._id,
      username: msg.userId.username,
      profilePic: msg.userId.profilePic,
      type: msg.type,
      text: msg.text,
      relatedAssetId: msg.relatedAssetId,
      createdAt: msg.createdAt
    }));

    // Return in chronological order
    res.json(formattedMessages.reverse());
  } catch (err) {
    console.error('List messages error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get unread message counts for user's bands
exports.getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all bands the user is a member of
    const bands = await Band.find({
      'members.userId': userId
    }).lean();

    if (bands.length === 0) {
      return res.json({});
    }

    const bandIds = bands.map(b => b._id);

    // Get all songs for these bands
    const songs = await Song.find({
      bandId: { $in: bandIds }
    }).lean();

    if (songs.length === 0) {
      return res.json({});
    }

    const songIds = songs.map(s => s._id);

    // Aggregate unread messages by band
    const unreadMessages = await Message.aggregate([
      {
        $match: {
          songId: { $in: songIds },
          readBy: { $ne: new mongoose.Types.ObjectId(userId) }
        }
      },
      {
        $lookup: {
          from: 'songs',
          localField: 'songId',
          foreignField: '_id',
          as: 'song'
        }
      },
      {
        $unwind: '$song'
      },
      {
        $group: {
          _id: '$song.bandId',
          count: { $sum: 1 }
        }
      }
    ]);

    const counts = {};
    unreadMessages.forEach(item => {
      counts[item._id.toString()] = item.count;
    });

    res.json(counts);
  } catch (err) {
    console.error('Get unread counts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.user._id;

    if (!songId) {
      return res.status(400).json({ error: 'songId is required' });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const band = await Band.findById(song.bandId);
    if (!band) {
      return res.status(404).json({ error: 'Band not found' });
    }

    const isMember = band.members.some(m => m.userId.toString() === userId.toString());
    if (!isMember) {
      return res.status(403).json({ error: 'Not a band member' });
    }

    // Add user to readBy array for all unread messages in this song
    await Message.updateMany(
      {
        songId,
        readBy: { $ne: userId }
      },
      {
        $addToSet: { readBy: userId }
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
