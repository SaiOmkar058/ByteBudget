/**
 * Categories configuration for ByteBudget
 * Supports 2-level category structure (Parent Category & Subcategories)
 * with backward-compatible alias mapping for legacy categories.
 */

export const EXPENSE_CATEGORIES = [
  {
    name: 'Food & Dining',
    emoji: '🍔',
    defaultBudgetCategory: 'Need',
    subcategories: ['Restaurants', 'Food Delivery', 'Snacks'],
  },
  {
    name: 'Groceries',
    emoji: '🛒',
    defaultBudgetCategory: 'Need',
    subcategories: [],
  },
  {
    name: 'Transport',
    emoji: '🚕',
    defaultBudgetCategory: 'Need',
    subcategories: ['Fuel', 'Public Transport', 'Cab', 'Vehicle Maintenance'],
  },
  {
    name: 'Housing & Rent',
    emoji: '🏠',
    defaultBudgetCategory: 'Need',
    subcategories: ['Rent', 'Maintenance', 'Hostel'],
  },
  {
    name: 'Bills & Utilities',
    emoji: '💡',
    defaultBudgetCategory: 'Need',
    subcategories: ['Electricity', 'Water', 'Internet', 'Mobile Recharge'],
  },
  {
    name: 'Shopping',
    emoji: '🛍️',
    defaultBudgetCategory: 'Want',
    subcategories: ['Clothing', 'Footwear', 'Electronics', 'Accessories'],
  },
  {
    name: 'Entertainment',
    emoji: '🎬',
    defaultBudgetCategory: 'Want',
    subcategories: [],
  },
  {
    name: 'Healthcare',
    emoji: '🏥',
    defaultBudgetCategory: 'Need',
    subcategories: ['Medicines', 'Doctor Consultation', 'Medical Tests'],
  },
  {
    name: 'Education',
    emoji: '📚',
    defaultBudgetCategory: 'Need',
    subcategories: [],
  },
  {
    name: 'Personal Care',
    emoji: '🧴',
    defaultBudgetCategory: 'Want',
    subcategories: [],
  },
  {
    name: 'Travel',
    emoji: '✈️',
    defaultBudgetCategory: 'Want',
    subcategories: [],
  },
  {
    name: 'Subscriptions',
    emoji: '📱',
    defaultBudgetCategory: 'Want',
    subcategories: ['Streaming', 'Music', 'Software'],
  },
  {
    name: 'Family & Personal',
    emoji: '👨‍👩‍👧',
    defaultBudgetCategory: 'Need',
    subcategories: [],
  },
  {
    name: 'Insurance',
    emoji: '🛡️',
    defaultBudgetCategory: 'Need',
    subcategories: [],
  },
  {
    name: 'Loan & EMI',
    emoji: '🏦',
    defaultBudgetCategory: 'Need',
    subcategories: [],
  },
  {
    name: 'Taxes & Fees',
    emoji: '🧾',
    defaultBudgetCategory: 'Need',
    subcategories: [],
  },
  {
    name: 'Investments',
    emoji: '📈',
    defaultBudgetCategory: 'Savings/Investment',
    subcategories: [
      'Mutual Fund SIP',
      'Stocks',
      'ETFs',
      'Fixed Deposit (FD)',
      'Recurring Deposit (RD)',
      'PPF',
      'NPS',
      'Gold',
      'Other Investments',
    ],
  },
  {
    name: 'Other',
    emoji: '📦',
    defaultBudgetCategory: 'Want',
    subcategories: [],
  },
];

export const INCOME_CATEGORIES = [
  {
    name: 'Salary',
    emoji: '💼',
    type: 'earned',
    subcategories: [],
  },
  {
    name: 'Freelance',
    emoji: '💻',
    type: 'earned',
    subcategories: [],
  },
  {
    name: 'Business',
    emoji: '🏢',
    type: 'earned',
    subcategories: [],
  },
  {
    name: 'Investment Returns',
    emoji: '📈',
    type: 'investment',
    subcategories: ['Mutual Fund Returns', 'Stock Profits', 'Dividends'],
  },
  {
    name: 'Interest Income',
    emoji: '🏦',
    type: 'investment',
    subcategories: [],
  },
  {
    name: 'Dividends',
    emoji: '💰',
    type: 'investment',
    subcategories: [],
  },
  {
    name: 'Rental Income',
    emoji: '🏠',
    type: 'passive',
    subcategories: [],
  },
  {
    name: 'Bonus',
    emoji: '🎁',
    type: 'earned',
    subcategories: [],
  },
  {
    name: 'Pocket Money / Allowance',
    emoji: '👨‍👩‍👧',
    type: 'other',
    subcategories: [],
  },
  {
    name: 'Gift',
    emoji: '🎀',
    type: 'other',
    subcategories: [],
  },
  {
    name: 'Refund / Cashback',
    emoji: '💳',
    type: 'inflow_adjustment',
    subcategories: [],
  },
  {
    name: 'Reimbursement',
    emoji: '🧾',
    type: 'inflow_adjustment',
    subcategories: [],
  },
  {
    name: 'Other',
    emoji: '💵',
    type: 'other',
    subcategories: [],
  },
];

// Backward-compatibility aliases for legacy category strings
export const CATEGORY_ALIASES = {
  // Expenses legacy
  'Food': 'Food & Dining',
  'Bills': 'Bills & Utilities',
  'Investment': 'Investments',
  'Others': 'Other',
};

// Color palettes and details for UI components
export const CATEGORY_DETAILS = {
  // Expenses
  'Food & Dining': { icon: '🍔', color: '#10b981', gradient: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' },
  'Groceries': { icon: '🛒', color: '#059669', gradient: 'linear-gradient(90deg, #059669 0%, #10b981 100%)' },
  'Transport': { icon: '🚕', color: '#3b82f6', gradient: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)' },
  'Housing & Rent': { icon: '🏠', color: '#6366f1', gradient: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)' },
  'Bills & Utilities': { icon: '💡', color: '#8b5cf6', gradient: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)' },
  'Shopping': { icon: '🛍️', color: '#ef4444', gradient: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)' },
  'Entertainment': { icon: '🎬', color: '#f59e0b', gradient: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)' },
  'Healthcare': { icon: '🏥', color: '#ec4899', gradient: 'linear-gradient(90deg, #ec4899 0%, #f472b6 100%)' },
  'Education': { icon: '📚', color: '#06b6d4', gradient: 'linear-gradient(90deg, #06b6d4 0%, #22d3ee 100%)' },
  'Personal Care': { icon: '🧴', color: '#14b8a6', gradient: 'linear-gradient(90deg, #14b8a6 0%, #2dd4bf 100%)' },
  'Travel': { icon: '✈️', color: '#0284c7', gradient: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)' },
  'Subscriptions': { icon: '📱', color: '#d946ef', gradient: 'linear-gradient(90deg, #d946ef 0%, #e879f9 100%)' },
  'Family & Personal': { icon: '👨‍👩‍👧', color: '#f97316', gradient: 'linear-gradient(90deg, #f97316 0%, #fb923c 100%)' },
  'Insurance': { icon: '🛡️', color: '#475569', gradient: 'linear-gradient(90deg, #475569 0%, #64748b 100%)' },
  'Loan & EMI': { icon: '🏦', color: '#dc2626', gradient: 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)' },
  'Taxes & Fees': { icon: '🧾', color: '#78716c', gradient: 'linear-gradient(90deg, #78716c 0%, #a8a29e 100%)' },
  'Investments': { icon: '📈', color: '#9333ea', gradient: 'linear-gradient(90deg, #9333ea 0%, #c084fc 100%)' },
  'Other': { icon: '📦', color: '#6b7280', gradient: 'linear-gradient(90deg, #6b7280 0%, #9ca3af 100%)' },

  // Legacy mappings
  'Food': { icon: '🍔', color: '#10b981', gradient: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' },
  'Bills': { icon: '💡', color: '#8b5cf6', gradient: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)' },
  'Investment': { icon: '📈', color: '#9333ea', gradient: 'linear-gradient(90deg, #9333ea 0%, #c084fc 100%)' },
  'Others': { icon: '📦', color: '#6b7280', gradient: 'linear-gradient(90deg, #6b7280 0%, #9ca3af 100%)' },

  // Income categories
  'Salary': { icon: '💼', color: '#10b981', gradient: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' },
  'Freelance': { icon: '💻', color: '#3b82f6', gradient: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)' },
  'Business': { icon: '🏢', color: '#8b5cf6', gradient: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)' },
  'Investment Returns': { icon: '📈', color: '#f59e0b', gradient: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)' },
  'Interest Income': { icon: '🏦', color: '#06b6d4', gradient: 'linear-gradient(90deg, #06b6d4 0%, #22d3ee 100%)' },
  'Dividends': { icon: '💰', color: '#eab308', gradient: 'linear-gradient(90deg, #eab308 0%, #facc15 100%)' },
  'Rental Income': { icon: '🏠', color: '#14b8a6', gradient: 'linear-gradient(90deg, #14b8a6 0%, #2dd4bf 100%)' },
  'Bonus': { icon: '🎁', color: '#ec4899', gradient: 'linear-gradient(90deg, #ec4899 0%, #f472b6 100%)' },
  'Pocket Money / Allowance': { icon: '👨‍👩‍👧', color: '#f97316', gradient: 'linear-gradient(90deg, #f97316 0%, #fb923c 100%)' },
  'Gift': { icon: '🎀', color: '#a855f7', gradient: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)' },
  'Refund / Cashback': { icon: '💳', color: '#0ea5e9', gradient: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)' },
  'Reimbursement': { icon: '🧾', color: '#64748b', gradient: 'linear-gradient(90deg, #64748b 0%, #94a3b8 100%)' },
};

export const normalizeCategory = (category, type = 'expense') => {
  if (!category) return type === 'income' ? 'Salary' : 'Other';
  if (CATEGORY_ALIASES[category]) {
    if (category === 'Investment' && type === 'income') {
      return 'Investment Returns';
    }
    return CATEGORY_ALIASES[category];
  }
  return category;
};

export const getCategoryIcon = (category, type = 'expense') => {
  if (!category) return type === 'income' ? '💵' : '📦';
  const normalized = normalizeCategory(category, type);
  if (CATEGORY_DETAILS[normalized]) {
    return CATEGORY_DETAILS[normalized].icon;
  }
  if (CATEGORY_DETAILS[category]) {
    return CATEGORY_DETAILS[category].icon;
  }
  const expMatch = EXPENSE_CATEGORIES.find((c) => c.name.toLowerCase() === category.toLowerCase());
  if (expMatch) return expMatch.emoji;
  const incMatch = INCOME_CATEGORIES.find((c) => c.name.toLowerCase() === category.toLowerCase());
  if (incMatch) return incMatch.emoji;
  return type === 'income' ? '💵' : '📦';
};

export const getCategoryDetails = (category, type = 'expense') => {
  const normalized = normalizeCategory(category, type);
  return (
    CATEGORY_DETAILS[normalized] ||
    CATEGORY_DETAILS[category] || {
      icon: type === 'income' ? '💵' : '📦',
      gradient: 'linear-gradient(90deg, #6b7280 0%, #9ca3af 100%)',
      color: '#6b7280',
    }
  );
};

export const getCategoryColor = (category, type = 'expense') => {
  return getCategoryDetails(category, type).color;
};

export const getSubcategories = (category, type = 'expense') => {
  if (!category) return [];
  const normalized = normalizeCategory(category, type);
  if (type === 'income') {
    const found = INCOME_CATEGORIES.find((c) => c.name.toLowerCase() === normalized.toLowerCase());
    return found ? found.subcategories : [];
  }
  const found = EXPENSE_CATEGORIES.find((c) => c.name.toLowerCase() === normalized.toLowerCase());
  return found ? found.subcategories : [];
};

export const getDefaultBudgetCategory = (category, subcategory = '') => {
  const norm = normalizeCategory(category, 'expense');
  if (norm === 'Investments' || category === 'Investment') {
    return 'Savings/Investment';
  }
  const found = EXPENSE_CATEGORIES.find((c) => c.name === norm);
  return found ? found.defaultBudgetCategory : 'Want';
};

export const isInvestmentCategory = (category, subcategory = '') => {
  const norm = normalizeCategory(category, 'expense');
  if (norm === 'Investments' || category === 'Investment') return true;
  const invCat = EXPENSE_CATEGORIES.find((c) => c.name === 'Investments');
  if (invCat && invCat.subcategories.includes(subcategory)) return true;
  return false;
};

export const isEarnedIncome = (category) => {
  const norm = normalizeCategory(category, 'income');
  const found = INCOME_CATEGORIES.find((c) => c.name === norm);
  return found ? found.type === 'earned' : true;
};
