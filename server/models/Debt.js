const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a loan/debt name'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify debt type'],
      trim: true,
      // e.g. "Home Loan", "Car Loan", "Personal Loan", "Student Loan", "Credit Card EMI"
    },
    principalAmount: {
      type: Number,
      required: [true, 'Please add the principal amount'],
      min: [0, 'Amount cannot be negative'],
    },
    interestRate: {
      type: Number,
      required: [true, 'Please add the interest rate'],
      min: [0, 'Interest rate cannot be negative'],
    },
    totalEMIs: {
      type: Number,
      required: [true, 'Please add total number of EMIs'],
      min: [1, 'Must have at least 1 EMI'],
    },
    emisPaid: {
      type: Number,
      default: 0,
      min: [0, 'EMIs paid cannot be negative'],
    },
    emiAmount: {
      type: Number,
      required: [true, 'Please add the EMI amount'],
      min: [0, 'EMI amount cannot be negative'],
    },
    automateEMI: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Debt', debtSchema);
