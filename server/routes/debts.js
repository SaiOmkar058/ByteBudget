const express = require('express');
const router = express.Router();
const {
  getDebts,
  createDebt,
  updateDebt,
  deleteDebt,
} = require('../controllers/debtController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDebts);
router.post('/', protect, createDebt);
router.put('/:id', protect, updateDebt);
router.delete('/:id', protect, deleteDebt);

module.exports = router;
