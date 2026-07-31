const Transaction = require('../models/Transaction.js');
const Debt = require('../models/Debt.js');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({
      date: -1,
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      category,
      amount,
      description,
      date,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check user ownership
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check user ownership
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });

    const stats = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      transactionCount: transactions.length,
    };

    transactions.forEach((transaction) => {
      if (transaction.type === 'income') {
        stats.totalIncome += transaction.amount;
      } else {
        stats.totalExpenses += transaction.amount;
      }
    });

    stats.balance = stats.totalIncome - stats.totalExpenses;

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Simulate automated EMI deductions for debts with automateEMI: true
// @route   POST /api/transactions/automate-emi
// @access  Private
// NOTE: This function is designed to be cron-ready. You can plug it directly into
// a node-cron job in server.js (e.g., '0 0 1 * *' = 1st of every month).
const automateEMIDeductions = async (req, res) => {
  try {
    const userId = req.user._id;
    const activeDebts = await Debt.find({
      user: userId,
      automateEMI: true,
    });

    const results = [];
    const skipped = [];

    for (const debt of activeDebts) {
      const remaining = debt.totalEMIs - debt.emisPaid;
      if (remaining <= 0) {
        skipped.push({ name: debt.name, reason: 'All EMIs already paid' });
        continue;
      }

      const emisPaidNum = debt.emisPaid + 1;

      // Create the expense transaction
      const transaction = await Transaction.create({
        user: userId,
        type: 'expense',
        category: 'Bills',
        amount: debt.emiAmount,
        description: `EMI Payment ${emisPaidNum}/${debt.totalEMIs} — ${debt.name}`,
        date: new Date(),
        budgetCategory: 'Need',
      });

      // Increment emisPaid on the debt
      await Debt.findByIdAndUpdate(debt._id, { emisPaid: emisPaidNum });

      results.push({
        debtName: debt.name,
        emiAmount: debt.emiAmount,
        emisPaidNow: emisPaidNum,
        remainingEMIs: remaining - 1,
        transactionId: transaction._id,
      });
    }

    res.json({
      message: `Automated ${results.length} EMI deduction(s)`,
      processed: results,
      skipped,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getStats,
  automateEMIDeductions,
};
