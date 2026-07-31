const Debt = require('../models/Debt');

// @desc    Get all debts for user
// @route   GET /api/debts
// @access  Private
const getDebts = async (req, res) => {
  try {
    const debts = await Debt.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(debts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create debt
// @route   POST /api/debts
// @access  Private
const createDebt = async (req, res) => {
  try {
    const { name, type, principalAmount, interestRate, totalEMIs, emisPaid, emiAmount, automateEMI, startDate } = req.body;
    const debt = await Debt.create({
      user: req.user._id,
      name,
      type,
      principalAmount,
      interestRate,
      totalEMIs,
      emisPaid: emisPaid || 0,
      emiAmount,
      automateEMI: automateEMI || false,
      startDate,
    });
    res.status(201).json(debt);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update debt
// @route   PUT /api/debts/:id
// @access  Private
const updateDebt = async (req, res) => {
  try {
    const debt = await Debt.findById(req.params.id);
    if (!debt) {
      return res.status(404).json({ message: 'Debt not found' });
    }
    if (debt.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const updated = await Debt.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete debt
// @route   DELETE /api/debts/:id
// @access  Private
const deleteDebt = async (req, res) => {
  try {
    const debt = await Debt.findById(req.params.id);
    if (!debt) {
      return res.status(404).json({ message: 'Debt not found' });
    }
    if (debt.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await debt.deleteOne();
    res.json({ message: 'Debt removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDebts, createDebt, updateDebt, deleteDebt };
