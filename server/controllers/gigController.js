const Gig = require('../models/Gig');
const Band = require('../models/Band');
const User = require('../models/User');
const { createNotification, emitNotification } = require('./notificationController');

// List all open gigs (public)
exports.list = async (req, res) => {
  try {
    const { type, role, genre, search } = req.query;

    let query = { status: 'open' };

    if (type) {
      query.type = type;
    }

    if (role) {
      query.role = { $regex: role, $options: 'i' };
    }

    if (genre) {
      query.genre = { $regex: genre, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } }
      ];
    }

    const gigs = await Gig.find(query)
      .sort({ createdAt: -1 })
      .populate('bandId', 'name genre coverImage')
      .populate('createdBy', 'username')
      .lean();

    // Add hasApplied flag for authenticated users
    const gigsWithStatus = gigs.map(gig => ({
      ...gig,
      applicantCount: gig.applicants?.length || 0,
      hasApplied: gig.applicants?.some(a => a.userId.toString() === req.userId) || false,
      // Remove applicants array from public listing
      applicants: undefined
    }));

    res.json(gigsWithStatus);
  } catch (err) {
    console.error('List gigs error:', err);
    res.status(500).json({ error: 'Failed to fetch gigs' });
  }
};

// List gigs where user has applied
exports.myApplications = async (req, res) => {
  try {
    const gigs = await Gig.find({
      'applicants.userId': req.userId
    })
      .sort({ createdAt: -1 })
      .populate('bandId', 'name genre coverImage')
      .populate('createdBy', 'username')
      .lean();

    // Add user's application status to each gig
    const gigsWithStatus = gigs.map(gig => {
      const myApplication = gig.applicants.find(a => a.userId.toString() === req.userId);
      return {
        ...gig,
        myApplicationStatus: myApplication?.status || 'pending',
        myApplicationMessage: myApplication?.message || '',
        myApplicationDate: myApplication?.appliedAt,
        applicantCount: gig.applicants?.length || 0,
        // Remove other applicants for privacy
        applicants: undefined
      };
    });

    res.json(gigsWithStatus);
  } catch (err) {
    console.error('My applications error:', err);
    res.status(500).json({ error: 'Failed to fetch your applications' });
  }
};

// List gigs created by user's bands
exports.myGigs = async (req, res) => {
  try {
    // Get user's bands where they are admin
    const bands = await Band.find({
      'members': {
        $elemMatch: {
          userId: req.userId,
          role: 'Admin'
        }
      }
    });

    const bandIds = bands.map(b => b._id);

    const gigs = await Gig.find({ bandId: { $in: bandIds } })
      .sort({ createdAt: -1 })
      .populate('bandId', 'name genre coverImage')
      .populate('applicants.userId', 'username instruments genres profilePic')
      .lean();

    res.json(gigs);
  } catch (err) {
    console.error('My gigs error:', err);
    res.status(500).json({ error: 'Failed to fetch your gigs' });
  }
};

// Get single gig
exports.get = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('bandId', 'name genre coverImage members')
      .populate('createdBy', 'username')
      .populate('applicants.userId', 'username instruments genres profilePic');

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Check if user is band admin to show applicants
    const band = gig.bandId;
    const isAdmin = band.members?.some(m =>
      m.userId.toString() === req.userId && m.role === 'Admin'
    );

    const gigData = gig.toJSON();

    // Only show applicants to band admins
    if (!isAdmin) {
      gigData.applicants = undefined;
      gigData.hasApplied = gig.hasApplied(req.userId);
    }

    res.json(gigData);
  } catch (err) {
    console.error('Get gig error:', err);
    res.status(500).json({ error: 'Failed to fetch gig' });
  }
};

// Create gig (band admin only)
exports.create = async (req, res) => {
  try {
    const { bandId, title, description, type, role, genre, location, compensation, requirements } = req.body;

    if (!bandId || !title || !type || !role) {
      return res.status(400).json({ error: 'Band, title, type, and role are required' });
    }

    // Verify user is band admin
    const band = await Band.findById(bandId);
    if (!band) {
      return res.status(404).json({ error: 'Band not found' });
    }

    if (!band.isAdmin(req.userId)) {
      return res.status(403).json({ error: 'Only band admins can create gigs' });
    }

    const gig = new Gig({
      bandId,
      createdBy: req.userId,
      title,
      description,
      type,
      role,
      genre: genre || band.genre,
      location,
      compensation,
      requirements: requirements || []
    });

    await gig.save();
    await gig.populate('bandId', 'name genre coverImage');
    await gig.populate('createdBy', 'username');

    // Emit new gig notification via Socket.io
    if (req.io) {
      const { emitNewGig } = require('../socket');
      emitNewGig(req.io, gig);
    }

    res.status(201).json(gig);
  } catch (err) {
    console.error('Create gig error:', err);
    res.status(500).json({ error: 'Failed to create gig' });
  }
};

// Update gig (band admin only)
exports.update = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Verify user is band admin
    const band = await Band.findById(gig.bandId);
    if (!band || !band.isAdmin(req.userId)) {
      return res.status(403).json({ error: 'Only band admins can update gigs' });
    }

    const allowedUpdates = ['title', 'description', 'role', 'genre', 'location', 'compensation', 'requirements', 'status'];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        gig[field] = req.body[field];
      }
    });

    await gig.save();
    await gig.populate('bandId', 'name genre coverImage');

    res.json(gig);
  } catch (err) {
    console.error('Update gig error:', err);
    res.status(500).json({ error: 'Failed to update gig' });
  }
};

// Delete gig (band admin only)
exports.delete = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Verify user is band admin
    const band = await Band.findById(gig.bandId);
    if (!band || !band.isAdmin(req.userId)) {
      return res.status(403).json({ error: 'Only band admins can delete gigs' });
    }

    await gig.deleteOne();

    res.json({ message: 'Gig deleted successfully' });
  } catch (err) {
    console.error('Delete gig error:', err);
    res.status(500).json({ error: 'Failed to delete gig' });
  }
};

// Apply to gig
exports.apply = async (req, res) => {
  try {
    const { message } = req.body;

    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ error: 'This gig is no longer accepting applications' });
    }

    // Check if already applied
    if (gig.hasApplied(req.userId)) {
      return res.status(400).json({ error: 'You have already applied to this gig' });
    }

    // Check if user is already a band member
    const band = await Band.findById(gig.bandId);
    if (band && band.isMember(req.userId)) {
      return res.status(400).json({ error: 'You are already a member of this band' });
    }

    gig.applicants.push({
      userId: req.userId,
      message: message || ''
    });

    await gig.save();

    // Get applicant username for notification
    const applicant = await User.findById(req.userId).select('username');

    // Notify band admins about new applicant
    if (band) {
      const admins = band.members.filter(m => m.role === 'Admin' || m.role === 'admin');
      for (const admin of admins) {
        const notification = await createNotification(
          admin.userId,
          'new_applicant',
          'Nuovo candidato',
          `${applicant?.username || 'Qualcuno'} si e' candidato per "${gig.role}"`,
          gig._id,
          'gig',
          `/gigs`
        );
        if (notification && req.io) {
          emitNotification(req.io, admin.userId, notification);
        }
      }
    }

    res.json({ message: 'Application submitted successfully' });
  } catch (err) {
    console.error('Apply to gig error:', err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

// Withdraw application
exports.withdraw = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    const applicantIndex = gig.applicants.findIndex(a => a.userId.equals(req.userId));

    if (applicantIndex === -1) {
      return res.status(400).json({ error: 'You have not applied to this gig' });
    }

    // Can only withdraw pending applications
    if (gig.applicants[applicantIndex].status !== 'pending') {
      return res.status(400).json({ error: 'Cannot withdraw a processed application' });
    }

    gig.applicants.splice(applicantIndex, 1);
    await gig.save();

    res.json({ message: 'Application withdrawn successfully' });
  } catch (err) {
    console.error('Withdraw application error:', err);
    res.status(500).json({ error: 'Failed to withdraw application' });
  }
};

// Accept/reject applicant (band admin only)
exports.respondToApplicant = async (req, res) => {
  try {
    const { applicantId, action } = req.body;

    if (!applicantId || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Applicant ID and valid action (accept/reject) are required' });
    }

    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Verify user is band admin
    const band = await Band.findById(gig.bandId);
    if (!band || !band.isAdmin(req.userId)) {
      return res.status(403).json({ error: 'Only band admins can respond to applicants' });
    }

    const applicant = gig.applicants.id(applicantId);

    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    if (applicant.status !== 'pending') {
      return res.status(400).json({ error: 'This application has already been processed' });
    }

    applicant.status = action === 'accept' ? 'accepted' : 'rejected';

    // If accepting and it's a member gig, add user to band
    if (action === 'accept' && gig.type === 'member') {
      // Add to band as member
      band.members.push({
        userId: applicant.userId,
        role: 'member',
        instrument: gig.role
      });
      await band.save();

      // Optionally close the gig if filled
      // gig.status = 'filled';
    }

    await gig.save();
    await gig.populate('applicants.userId', 'username instruments genres profilePic');

    // Notify the applicant about the decision
    const notificationType = action === 'accept' ? 'application_accepted' : 'application_rejected';
    const notificationTitle = action === 'accept' ? 'Candidatura accettata!' : 'Candidatura rifiutata';
    const notificationMessage = action === 'accept'
      ? `Sei stato accettato per "${gig.role}" in ${band.name}`
      : `La tua candidatura per "${gig.role}" non e' stata accettata`;

    const notification = await createNotification(
      applicant.userId,
      notificationType,
      notificationTitle,
      notificationMessage,
      gig._id,
      'gig',
      action === 'accept' ? `/gigs` : null
    );

    if (notification && req.io) {
      emitNotification(req.io, applicant.userId, notification);
    }

    res.json({
      message: `Application ${action}ed successfully`,
      applicants: gig.applicants
    });
  } catch (err) {
    console.error('Respond to applicant error:', err);
    res.status(500).json({ error: 'Failed to process application' });
  }
};

// Get count of new gigs since last visit
exports.getNewGigsCount = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const lastVisit = user.lastGigBoardVisit || new Date(0);

    const count = await Gig.countDocuments({
      status: 'open',
      createdAt: { $gt: lastVisit }
    });

    res.json({ count });
  } catch (err) {
    console.error('Get new gigs count error:', err);
    res.status(500).json({ error: 'Failed to get new gigs count' });
  }
};

// Update last gig board visit timestamp
exports.markGigBoardVisited = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      lastGigBoardVisit: new Date()
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Mark gig board visited error:', err);
    res.status(500).json({ error: 'Failed to update visit timestamp' });
  }
};
