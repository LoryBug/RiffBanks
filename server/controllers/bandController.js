const Band = require('../models/Band');
const User = require('../models/User');

// Get user's bands
exports.list = async (req, res) => {
  try {
    const bands = await Band.find({
      'members.userId': req.userId,
      active: true
    }).populate('members.userId', 'username avatar');

    res.json(bands);
  } catch (err) {
    console.error('List bands error:', err);
    res.status(500).json({ error: 'Failed to fetch bands' });
  }
};

// Create new band
exports.create = async (req, res) => {
  try {
    const { name, genre, bio, location, instrument } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Band name is required' });
    }

    // Generate unique invite code
    let inviteCode;
    let isUnique = false;
    while (!isUnique) {
      inviteCode = Band.generateInviteCode(name);
      const existing = await Band.findOne({ inviteCode });
      if (!existing) isUnique = true;
    }

    const band = new Band({
      name,
      genre,
      bio,
      location,
      inviteCode,
      members: [{
        userId: req.userId,
        role: 'Admin',
        instrument: instrument || req.user.instruments?.[0] || '',
        joinedAt: new Date()
      }]
    });

    await band.save();

    // Populate member info before returning
    await band.populate('members.userId', 'username avatar');

    res.status(201).json(band);
  } catch (err) {
    console.error('Create band error:', err);
    res.status(500).json({ error: 'Failed to create band' });
  }
};

// Join band with invite code
exports.join = async (req, res) => {
  try {
    const { inviteCode, instrument } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ error: 'Invite code is required' });
    }

    const band = await Band.findOne({
      inviteCode: inviteCode.toUpperCase(),
      active: true
    });

    if (!band) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    // Check if already a member
    if (band.isMember(req.userId)) {
      return res.status(400).json({ error: 'You are already a member of this band' });
    }

    // Add as member
    band.members.push({
      userId: req.userId,
      role: 'Member',
      instrument: instrument || req.user.instruments?.[0] || '',
      joinedAt: new Date()
    });

    await band.save();
    await band.populate('members.userId', 'username avatar');

    res.json(band);
  } catch (err) {
    console.error('Join band error:', err);
    res.status(500).json({ error: 'Failed to join band' });
  }
};

// Get band by ID
exports.get = async (req, res) => {
  try {
    const band = await Band.findById(req.params.id)
      .populate('members.userId', 'username avatar instruments genres');

    if (!band) {
      return res.status(404).json({ error: 'Band not found' });
    }

    // Check if user is a member
    if (!band.isMember(req.userId)) {
      return res.status(403).json({ error: 'You are not a member of this band' });
    }

    res.json(band);
  } catch (err) {
    console.error('Get band error:', err);
    res.status(500).json({ error: 'Failed to fetch band' });
  }
};

// Update band (admin only)
exports.update = async (req, res) => {
  try {
    const band = await Band.findById(req.params.id);

    if (!band) {
      return res.status(404).json({ error: 'Band not found' });
    }

    if (!band.isAdmin(req.userId)) {
      return res.status(403).json({ error: 'Only admins can update band info' });
    }

    const { name, genre, bio, location, cover } = req.body;

    if (name) band.name = name;
    if (genre !== undefined) band.genre = genre;
    if (bio !== undefined) band.bio = bio;
    if (location !== undefined) band.location = location;
    if (cover) band.cover = cover;

    await band.save();
    await band.populate('members.userId', 'username avatar');

    res.json(band);
  } catch (err) {
    console.error('Update band error:', err);
    res.status(500).json({ error: 'Failed to update band' });
  }
};

// Leave band
exports.leave = async (req, res) => {
  try {
    const band = await Band.findById(req.params.id);

    if (!band) {
      return res.status(404).json({ error: 'Band not found' });
    }

    if (!band.isMember(req.userId)) {
      return res.status(400).json({ error: 'You are not a member of this band' });
    }

    // Check if user is admin
    const isAdmin = band.isAdmin(req.userId);
    const adminCount = band.members.filter(m => m.role === 'Admin').length;

    // Remove member
    band.members = band.members.filter(m => !m.userId.equals(req.userId));

    // If no members left, deactivate band
    if (band.members.length === 0) {
      band.active = false;
    } else if (isAdmin && adminCount === 1) {
      // User was the only admin - transfer admin role to the oldest member (by join date)
      const sortedMembers = [...band.members].sort((a, b) =>
        new Date(a.joinedAt) - new Date(b.joinedAt)
      );
      sortedMembers[0].role = 'Admin';
    }

    await band.save();

    res.json({ message: 'Left band successfully' });
  } catch (err) {
    console.error('Leave band error:', err);
    res.status(500).json({ error: 'Failed to leave band' });
  }
};

// Regenerate invite code (admin only)
exports.regenerateCode = async (req, res) => {
  try {
    const band = await Band.findById(req.params.id);

    if (!band) {
      return res.status(404).json({ error: 'Band not found' });
    }

    if (!band.isAdmin(req.userId)) {
      return res.status(403).json({ error: 'Only admins can regenerate invite code' });
    }

    // Generate new unique code
    let inviteCode;
    let isUnique = false;
    while (!isUnique) {
      inviteCode = Band.generateInviteCode(band.name);
      const existing = await Band.findOne({ inviteCode });
      if (!existing) isUnique = true;
    }

    band.inviteCode = inviteCode;
    await band.save();

    res.json({ inviteCode: band.inviteCode });
  } catch (err) {
    console.error('Regenerate code error:', err);
    res.status(500).json({ error: 'Failed to regenerate code' });
  }
};

// Remove member (admin only)
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const band = await Band.findById(req.params.id);

    if (!band) {
      return res.status(404).json({ error: 'Band not found' });
    }

    if (!band.isAdmin(req.userId)) {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }

    // Cannot remove yourself
    if (userId === req.userId) {
      return res.status(400).json({ error: 'Use leave function to remove yourself' });
    }

    // Check if target is a member
    const memberToRemove = band.members.find(m => m.userId.equals(userId));
    if (!memberToRemove) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Cannot remove another admin
    if (memberToRemove.role === 'Admin') {
      return res.status(400).json({ error: 'Cannot remove another admin' });
    }

    // Remove member
    band.members = band.members.filter(m => !m.userId.equals(userId));
    await band.save();

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};
