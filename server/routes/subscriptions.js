const express = require('express');
const router = express.Router();
const {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSubscriptions);
router.post('/', protect, createSubscription);
router.put('/:id', protect, updateSubscription);
router.delete('/:id', protect, deleteSubscription);

module.exports = router;
