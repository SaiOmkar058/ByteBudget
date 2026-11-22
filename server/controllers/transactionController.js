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
    const { type, category, subcategory, amount, description, budgetCategory, date } = req.body;

    let finalBudgetCategory = budgetCategory;
    if (type === 'expense' && (!finalBudgetCategory || finalBudgetCategory === '')) {
      if (category === 'Investments' || category === 'Investment') {
        finalBudgetCategory = 'Savings/Investment';
      }
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      category,
      subcategory: subcategory || '',
      amount,
      description,
      budgetCategory: finalBudgetCategory,
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

    const allowedFields = ['type', 'category', 'subcategory', 'amount', 'description', 'budgetCategory', 'date'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updates,
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

// @desc    Get budget statistics (spending by category vs budget)
// @route   GET /api/transactions/budget-stats
// @access  Private
const getBudgetStats = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });

    // Initialize budget tracking for each category
    const budgetCategories = {
      Need: Number(req.user.preferences?.monthlyBudget) || 35000,
      Want: 0,
      'Savings/Investment': Number(req.user.preferences?.savingsGoal) || 10000,
    };

    // Track spending per category
    const spendingByCategory = {
      Need: 0,
      Want: 0,
      'Savings/Investment': 0,
    };

    transactions.forEach((transaction) => {
      if (transaction.type !== 'expense') return;

      const category = transaction.budgetCategory || '';
      const amount = Number(transaction.amount) || 0;

      // Only count recognized budget categories
      if (budgetCategories[category] !== undefined) {
        spendingByCategory[category] += amount;
      }

      // Also count uncategorized expenses under 'Want' as default
      if (!category || category === '') {
        spendingByCategory.Want += amount;
      }
    });

    // Calculate budget status
    const budgetStats = {
      monthlyBudget: budgetCategories.Need,
      spendingByCategory,
      budgetRemaining: {
        Need: (Number(req.user.preferences?.monthlyBudget) || 35000) - spendingByCategory.Need,
        Want: (0) - spendingByCategory.Want, // No set limit for Want
        'Savings/Investment': (Number(req.user.preferences?.savingsGoal) || 10000) - spendingByCategory['Savings/Investment'],
      },
      percentageUsed: {
        Need: spendingByCategory.Need > 0 ? Math.round((spendingByCategory.Need / (Number(req.user.preferences?.monthlyBudget) || 35000)) * 100) : 0,
        Want: 0,
        'Savings/Investment': spendingByCategory['Savings/Investment'] > 0 ? Math.round((spendingByCategory['Savings/Investment'] / (Number(req.user.preferences?.savingsGoal) || 10000)) * 100) : 0,
      },
      warnings: [],
    };

    // Add warnings for over-budget categories
    if (budgetStats.percentageUsed.Need > 100) {
      budgetStats.warnings.push({
        category: 'Need',
        message: 'You have exceeded your monthly budget for Need expenses!',
      });
    }
    if (budgetStats.percentageUsed['Savings/Investment'] > 80 && budgetStats.percentageUsed['Savings/Investment'] <= 100) {
      budgetStats.warnings.push({
        category: 'Savings/Investment',
        message: 'You have used most of your savings goal. Consider reviewing your spending.',
      });
    }

    res.json(budgetStats);
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
  getBudgetStats,
};
