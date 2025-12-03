const Message = require('../models/Message');
const Song = require('../models/Song');
const Band = require('../models/Band');
const jwt = require('jsonwebtoken');

// Socket.io event handlers
module.exports = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.user = { _id: decoded.userId };
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id, 'userId:', socket.userId);

    // Join user's personal room for notifications
    socket.join(`user:${socket.userId}`);

    // Join a song room
    socket.on('join_room', async (songId) => {
      try {
        // Verify user has access to this song's band
        const song = await Song.findById(songId);
        if (!song) {
          socket.emit('error', { message: 'Song not found' });
          return;
        }

        const band = await Band.findById(song.bandId);
        if (!band) {
          socket.emit('error', { message: 'Band not found' });
          return;
        }

        const isMember = band.members.some(m => m.userId.toString() === socket.userId);
        if (!isMember) {
          socket.emit('error', { message: 'Not a band member' });
          return;
        }

        socket.join(`song:${songId}`);
        socket.currentSongId = songId;
        console.log(`Socket ${socket.id} joined room song:${songId}`);

        // Notify others in the room
        socket.to(`song:${songId}`).emit('user_joined', {
          userId: socket.userId,
          timestamp: new Date()
        });
      } catch (err) {
        console.error('Join room error:', err);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave a song room
    socket.on('leave_room', (songId) => {
      socket.leave(`song:${songId}`);
      socket.currentSongId = null;
      console.log(`Socket ${socket.id} left room song:${songId}`);

      // Notify others
      socket.to(`song:${songId}`).emit('user_left', {
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    // Handle chat messages
    socket.on('send_message', async (data) => {
      try {
        const { songId, text } = data;

        if (!text || !text.trim()) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        if (text.length > 2000) {
          socket.emit('error', { message: 'Message too long' });
          return;
        }

        // Create and save message
        const message = new Message({
          songId,
          userId: socket.userId,
          type: 'user',
          text: text.trim()
        });

        await message.save();

        // Populate user info
        await message.populate('userId', 'username profilePic');

        // Format message for broadcast
        const messageData = {
          _id: message._id,
          songId: message.songId,
          userId: message.userId._id,
          username: message.userId.username,
          profilePic: message.userId.profilePic,
          type: message.type,
          text: message.text,
          createdAt: message.createdAt
        };

        // Broadcast to all in room including sender
        io.to(`song:${songId}`).emit('new_message', messageData);

        // Emit unread count update to band members not in the room
        const song = await Song.findById(songId);
        if (song) {
          const { emitUnreadCountUpdate } = require('./index');
          emitUnreadCountUpdate(io, song.bandId);
        }

      } catch (err) {
        console.error('Send message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing_start', (songId) => {
      socket.to(`song:${songId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (songId) => {
      socket.to(`song:${songId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: false
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      // Notify room if user was in one
      if (socket.currentSongId) {
        socket.to(`song:${socket.currentSongId}`).emit('user_left', {
          userId: socket.userId,
          timestamp: new Date()
        });
      }
    });
  });
};

// Helper function to emit system notifications (used by controllers)
module.exports.emitSystemNotification = async (io, songId, userId, text, relatedAssetId = null) => {
  try {
    // Save system message to DB
    const message = new Message({
      songId,
      userId,
      type: 'system',
      text,
      relatedAssetId
    });

    await message.save();
    await message.populate('userId', 'username profilePic');

    const messageData = {
      _id: message._id,
      songId: message.songId,
      userId: message.userId._id,
      username: message.userId.username,
      type: message.type,
      text: message.text,
      relatedAssetId: message.relatedAssetId,
      createdAt: message.createdAt
    };

    io.to(`song:${songId}`).emit('new_message', messageData);
  } catch (err) {
    console.error('System notification error:', err);
  }
};

// Helper to emit vote updates
module.exports.emitVoteUpdate = (io, songId, assetId, voteCount) => {
  io.to(`song:${songId}`).emit('vote_update', {
    assetId,
    voteCount,
    timestamp: new Date()
  });
};

// Helper to emit unread count updates to specific users
module.exports.emitUnreadCountUpdate = async (io, bandId) => {
  try {
    const Band = require('../models/Band');
    const band = await Band.findById(bandId);

    if (!band) return;

    // Emit to all band members
    band.members.forEach(member => {
      io.to(`user:${member.userId}`).emit('unread_count_update', {
        bandId,
        timestamp: new Date()
      });
    });
  } catch (err) {
    console.error('Emit unread count update error:', err);
  }
};

// Helper to emit new gig notification to all users
module.exports.emitNewGig = (io, gigData) => {
  io.emit('new_gig', {
    gig: gigData,
    timestamp: new Date()
  });
};
