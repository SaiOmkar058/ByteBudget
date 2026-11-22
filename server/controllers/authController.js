const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update the current user's profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update current user's preferences (budget, savingsGoal, currency, theme)
// @route   PUT /api/auth/preferences
// @access  Private
const updatePreferences = async (req, res) => {
  try {
    const { monthlyBudget, savingsGoal, currency, theme } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.preferences) {
      user.preferences = {};
    }

    if (monthlyBudget !== undefined) user.preferences.monthlyBudget = Math.max(0, Number(monthlyBudget));
    if (savingsGoal !== undefined) user.preferences.savingsGoal = Math.max(0, Number(savingsGoal));
    if (currency) user.preferences.currency = currency;
    if (theme) user.preferences.theme = theme;

    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Change the current user's password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Generate a single-use 5-minute Telegram linking code
// @route   POST /api/auth/telegram/link-code
// @access  Private
const generateTelegramLinkCode = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cryptographically secure 6-character hex code
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.telegramLinkingCode = {
      code,
      expiresAt,
    };
    await user.save();

    // Note: Do not log the code to application logs (Safeguard 11)
    res.json({
      code,
      expiresAt,
      expiresInSeconds: 300,
      botUsername: 'ByteBudget_ExpenseBot',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Telegram linking status for user
// @route   GET /api/auth/telegram/status
// @access  Private
const getTelegramStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isLinked = Boolean(user.telegramChatId);
    res.json({
      isLinked,
      telegramChatId: isLinked ? `••••${user.telegramChatId.slice(-4)}` : null,
      botUsername: 'ByteBudget_ExpenseBot',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unlink Telegram account
// @route   POST /api/auth/telegram/unlink
// @access  Private
const unlinkTelegram = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.telegramChatId = undefined;
    user.telegramLinkingCode = { code: null, expiresAt: null };
    await user.save();

    res.json({ message: 'Telegram account unlinked successfully', isLinked: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  updatePreferences,
  updatePassword,
  generateTelegramLinkCode,
  getTelegramStatus,
  unlinkTelegram,
};
