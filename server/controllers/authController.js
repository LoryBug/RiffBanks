const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = new User({
      username,
      email: email.toLowerCase(),
      passwordHash: password 
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: user.toJSON()
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: user.toJSON()
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user
exports.me = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// Update profile (instruments, genres, avatar)
exports.updateProfile = async (req, res) => {
  try {
    const { instruments, genres, avatar, username } = req.body;

    const updateData = {};
    if (instruments) updateData.instruments = instruments;
    if (genres) updateData.genres = genres;
    if (avatar) updateData.avatar = avatar;
    if (username) updateData.username = username;

    // Mark profile as complete if instruments and genres are provided
    if (instruments?.length > 0 && genres?.length > 0) {
      updateData.isProfileComplete = true;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json(user.toJSON());
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
