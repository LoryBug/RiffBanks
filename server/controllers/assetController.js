const Asset = require('../models/Asset');
const Song = require('../models/Song');
const Band = require('../models/Band');
const fs = require('fs').promises;
const path = require('path');
const { createNotification, emitNotification } = require('./notificationController');
const { emitSystemNotification } = require('../socket/index');

// Get assets by song
exports.list = async (req, res) => {
  try {
    const { songId } = req.query;

    if (!songId) {
      return res.status(400).json({ error: 'Song ID is required' });
    }

    // Verify access through song -> band membership
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const band = await Band.findById(song.bandId);
    if (!band || !band.isMember(req.userId)) {
      return res.status(403).json({ error: 'You do not have access to this song' });
    }

    const assets = await Asset.find({ songId })
      .sort({ createdAt: -1 })
      .populate('uploaderId', 'username avatar');

    // Add votedByMe flag
    const assetsWithVoteStatus = assets.map(asset => ({
      ...asset.toJSON(),
      votedByMe: asset.hasVoted(req.userId)
    }));

    res.json(assetsWithVoteStatus);
  } catch (err) {
    console.error('List assets error:', err);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
};

// Upload asset
exports.upload = async (req, res) => {
  try {
    const { songId, title } = req.body;

    if (!songId) {
      return res.status(400).json({ error: 'Song ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify access
    const song = await Song.findById(songId);
    if (!song) {
      // Clean up uploaded file
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(404).json({ error: 'Song not found' });
    }

    const band = await Band.findById(song.bandId);
    if (!band || !band.isMember(req.userId)) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(403).json({ error: 'You do not have access to this song' });
    }

    const asset = new Asset({
      songId,
      uploaderId: req.userId,
      type: req.fileType || 'audio',
      title: title || req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      authorName: req.user.username
    });

    await asset.save();
    await asset.populate('uploaderId', 'username avatar');

    // Emit socket notification
    req.io.to(`song:${songId}`).emit('asset_uploaded', {
      asset: asset.toJSON(),
      uploadedBy: req.user.username
    });

    // Create system message in chat for file history
    const assetTypeLabels = { audio: 'audio', image: 'immagine', text: 'testo' };
    const assetLabel = assetTypeLabels[asset.type] || 'file';
    await emitSystemNotification(
      req.io,
      songId,
      req.userId,
      `ha caricato ${assetLabel}: "${asset.title}"`,
      asset._id
    );

    // Notify band members about new asset
    for (const member of band.members) {
      // Skip the uploader
      if (member.userId.toString() === req.userId) continue;

      const notification = await createNotification(
        member.userId,
        'new_asset',
        `Nuovo ${assetLabel} in "${song.title}"`,
        `${req.user.username} ha caricato "${asset.title}"`,
        song._id,
        'song',
        `/song/${song._id}`
      );

      if (notification && req.io) {
        emitNotification(req.io, member.userId, notification);
      }
    }

    res.status(201).json({
      ...asset.toJSON(),
      votedByMe: false
    });
  } catch (err) {
    console.error('Upload asset error:', err);
    // Clean up file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ error: 'Failed to upload asset' });
  }
};

// Create text asset (for AI-generated content)
exports.createText = async (req, res) => {
  try {
    const { songId, title, content } = req.body;

    if (!songId || !content) {
      return res.status(400).json({ error: 'Song ID and content are required' });
    }

    // Verify access
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const band = await Band.findById(song.bandId);
    if (!band || !band.isMember(req.userId)) {
      return res.status(403).json({ error: 'You do not have access to this song' });
    }

    const asset = new Asset({
      songId,
      uploaderId: req.userId,
      type: 'text',
      title: title || 'Lyrics',
      content,
      authorName: req.user.username
    });

    await asset.save();
    await asset.populate('uploaderId', 'username avatar');

    // Emit socket notification
    req.io.to(`song:${songId}`).emit('asset_uploaded', {
      asset: asset.toJSON(),
      uploadedBy: req.user.username
    });

    // Create system message in chat for text history
    await emitSystemNotification(
      req.io,
      songId,
      req.userId,
      `ha aggiunto testo: "${asset.title}"`,
      asset._id
    );

    // Notify band members about new text asset
    for (const member of band.members) {
      // Skip the creator
      if (member.userId.toString() === req.userId) continue;

      const notification = await createNotification(
        member.userId,
        'new_asset',
        `Nuovo testo in "${song.title}"`,
        `${req.user.username} ha aggiunto "${asset.title}"`,
        song._id,
        'song',
        `/song/${song._id}`
      );

      if (notification && req.io) {
        emitNotification(req.io, member.userId, notification);
      }
    }

    res.status(201).json({
      ...asset.toJSON(),
      votedByMe: false
    });
  } catch (err) {
    console.error('Create text asset error:', err);
    res.status(500).json({ error: 'Failed to create text asset' });
  }
};

// Toggle vote
exports.vote = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Verify access
    const song = await Song.findById(asset.songId);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const band = await Band.findById(song.bandId);
    if (!band || !band.isMember(req.userId)) {
      return res.status(403).json({ error: 'You do not have access to this asset' });
    }

    const voteIndex = asset.votes.findIndex(v => v.equals(req.userId));
    const votedByMe = voteIndex === -1;

    if (votedByMe) {
      // Add vote
      asset.votes.push(req.userId);
    } else {
      // Remove vote
      asset.votes.splice(voteIndex, 1);
    }

    await asset.save();

    // Emit socket notification
    req.io.to(`song:${asset.songId}`).emit('vote_update', {
      assetId: asset._id,
      votes: asset.votes.length,
      votedBy: req.user.username,
      action: votedByMe ? 'liked' : 'unliked'
    });

    res.json({
      votes: asset.votes.length,
      votedByMe
    });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Failed to toggle vote' });
  }
};

// Delete asset
exports.delete = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Verify access - only uploader or band admin can delete
    const song = await Song.findById(asset.songId);
    const band = await Band.findById(song?.bandId);

    const isUploader = asset.uploaderId?.equals(req.userId);
    const isAdmin = band?.isAdmin(req.userId);

    if (!isUploader && !isAdmin) {
      return res.status(403).json({ error: 'Only the uploader or band admin can delete this asset' });
    }

    // Delete file if exists
    if (asset.url) {
      const filePath = path.join(process.cwd(), asset.url);
      await fs.unlink(filePath).catch(() => {});
    }

    await asset.deleteOne();

    // Emit socket notification
    req.io.to(`song:${asset.songId}`).emit('asset_deleted', {
      assetId: asset._id
    });

    res.json({ message: 'Asset deleted successfully' });
  } catch (err) {
    console.error('Delete asset error:', err);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
};
