const Band = require('../model/Band');

// Create a new band
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

// Join bad with invite code
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