const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getStats,
  automateEMIDeductions,
  getBudgetStats,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getTransactions);
router.post('/', protect, createTransaction);
router.get('/stats', protect, getStats);
// NOTE: /automate-emi MUST be declared before /:id — Express reads routes top-down
router.post('/automate-emi', protect, automateEMIDeductions);
router.put('/:id', protect, updateTransaction);
router.delete('/:id', protect, deleteTransaction);
router.get('/budget-stats', protect, getBudgetStats);

module.exports = router;
