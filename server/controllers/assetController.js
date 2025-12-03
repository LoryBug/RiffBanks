const Asset = require('../models/Asset');
const Song = require('../models/Song');
const Band = require('../models/Band');
const fs = require('fs').promises;
const path = require('path');

// Get assets by song
exports.list = async (req, res) => {
  try {
    const { songId } = req.query;

    if (!songId) {
      return res.status(400).json({ error: 'Song ID is required' });
    }

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
    const song = await Song.findById(songId);
    if (!song) {
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

    res.status(201).json({
      ...asset.toJSON(),
      votedByMe: false
    });
  } catch (err) {
    console.error('Upload asset error:', err);
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ error: 'Failed to upload asset' });
  }
};
// Create text asset
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
      asset.votes.push(req.userId);
    } else {
      asset.votes.splice(voteIndex, 1);
    }

    await asset.save();

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

    const song = await Song.findById(asset.songId);
    const band = await Band.findById(song?.bandId);

    const isUploader = asset.uploaderId?.equals(req.userId);
    const isAdmin = band?.isAdmin(req.userId);

    if (!isUploader && !isAdmin) {
      return res.status(403).json({ error: 'Only the uploader or band admin can delete this asset' });
    }

    if (asset.url) {
      const filePath = path.join(process.cwd(), asset.url);
      await fs.unlink(filePath).catch(() => {});
    }

    await asset.deleteOne();

    res.json({ message: 'Asset deleted successfully' });
  } catch (err) {
    console.error('Delete asset error:', err);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
};
