const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  updatePreferences,
  updatePassword,
  generateTelegramLinkCode,
  getTelegramStatus,
  unlinkTelegram,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);
router.put('/password', protect, updatePassword);

// Telegram Bot endpoints
router.post('/telegram/link-code', protect, generateTelegramLinkCode);
router.get('/telegram/status', protect, getTelegramStatus);
router.post('/telegram/unlink', protect, unlinkTelegram);

module.exports = router;
