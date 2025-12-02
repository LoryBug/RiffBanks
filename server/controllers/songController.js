const Song = require('../models/Song');
const Band = require('../models/Band');

// Get songs by band
exports.list = async (req, res) => {
  try {
    const { bandId } = req.query;

    if (!bandId) {
      return res.status(400).json({ error: 'Band ID is required' });
    }

    const band = await Band.findById(bandId);
    if (!band) {
      return res.status(404).json({ error: 'Band not found' });
    }
    if (!band.isMember(req.userId)) {
      return res.status(403).json({ error: 'You are not a member of this band' });
    }

    const songs = await Song.find({ bandId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username avatar');

    res.json(songs);
  } catch (err) {
    console.error('List songs error:', err);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
};

// Create song
exports.create = async (req, res) => {
  try {
    const { bandId, title, bpm, genre, description, status } = req.body;

    if (!bandId || !title) {
      return res.status(400).json({ error: 'Band ID and title are required' });
    }

    // Verify user is member of band
    const band = await Band.findById(bandId);
    if (!band) {
      return res.status(404).json({ error: 'Band not found' });
    }
    if (!band.isMember(req.userId)) {
      return res.status(403).json({ error: 'You are not a member of this band' });
    }

    const song = new Song({
      bandId,
      title,
      bpm: bpm || undefined,
      genre,
      description,
      status: status || 'Idea',
      createdBy: req.userId
    });

    await song.save();
    await song.populate('createdBy', 'username avatar');

    res.status(201).json(song);
  } catch (err) {
    console.error('Create song error:', err);
    res.status(500).json({ error: 'Failed to create song' });
  }
};

// Get song by ID
exports.get = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('createdBy', 'username avatar');

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    
    const band = await Band.findById(song.bandId);
    if (!band || !band.isMember(req.userId)) {
      return res.status(403).json({ error: 'You do not have access to this song' });
    }

    const assetsCount = await Asset.countDocuments({ songId: song._id });

    res.json({ ...song.toJSON(), assetsCount });
  } catch (err) {
    console.error('Get song error:', err);
    res.status(500).json({ error: 'Failed to fetch song' });
  }
};

// Update song
exports.update = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const band = await Band.findById(song.bandId);
    if (!band || !band.isMember(req.userId)) {
      return res.status(403).json({ error: 'You do not have access to this song' });
    }

    const { title, bpm, genre, description, status } = req.body;

    if (title) song.title = title;
    if (bpm !== undefined) song.bpm = bpm || undefined;
    if (genre !== undefined) song.genre = genre;
    if (description !== undefined) song.description = description;
    if (status) song.status = status;

    await song.save();
    await song.populate('createdBy', 'username avatar');

    res.json(song);
  } catch (err) {
    console.error('Update song error:', err);
    res.status(500).json({ error: 'Failed to update song' });
  }
};

// Delete song
exports.delete = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const band = await Band.findById(song.bandId);
    if (!band || !band.isAdmin(req.userId)) {
      return res.status(403).json({ error: 'Only band admins can delete songs' });
    }

    await song.deleteOne();

    res.json({ message: 'Song deleted successfully' });
  } catch (err) {
    console.error('Delete song error:', err);
    res.status(500).json({ error: 'Failed to delete song' });
  }
};