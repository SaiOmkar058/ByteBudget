/**
 * Natural language transaction parser for ByteBudget Telegram Bot.
 *
 * Automatically extracts:
 * - Transaction type (expense / income)
 * - Amount (must be > 0)
 * - Category (from ByteBudget taxonomy)
 * - Subcategory (if recognized)
 * - Budget category (Need / Want / Savings/Investment)
 * - Concise, capitalized description
 */

// Keyword mappings for expense categories and subcategories
const EXPENSE_RULES = [
  // Investments (treated as financial outflows under Savings/Investment)
  {
    category: 'Investments',
    budgetCategory: 'Savings/Investment',
    subcategories: [
      { name: 'Mutual Fund SIP', keywords: ['sip', 'mutual fund', 'mutual funds', 'mf'] },
      { name: 'Stocks', keywords: ['stock', 'stocks', 'share', 'shares', 'equity'] },
      { name: 'ETFs', keywords: ['etf', 'etfs'] },
      { name: 'Fixed Deposit (FD)', keywords: ['fixed deposit', 'fd'] },
      { name: 'Recurring Deposit (RD)', keywords: ['recurring deposit', 'rd'] },
      { name: 'PPF', keywords: ['ppf', 'public provident fund'] },
      { name: 'NPS', keywords: ['nps', 'national pension'] },
      { name: 'Gold', keywords: ['gold', 'sovereign gold'] },
      { name: 'Other Investments', keywords: ['invest', 'invested', 'investment', 'crypto', 'bitcoin'] },
    ],
  },
  // Food & Dining
  {
    category: 'Food & Dining',
    budgetCategory: 'Need',
    subcategories: [
      { name: 'Food Delivery', keywords: ['swiggy', 'zomato', 'delivery', 'order food', 'takeaway'] },
      { name: 'Snacks', keywords: ['snack', 'snacks', 'tea', 'chai', 'coffee', 'samosa', 'biscuit', 'cappuccino'] },
      { name: 'Restaurants', keywords: ['lunch', 'dinner', 'breakfast', 'restaurant', 'cafe', 'dining', 'pizza', 'burger', 'biryani', 'meal', 'meals', 'food', 'eat'] },
    ],
  },
  // Groceries
  {
    category: 'Groceries',
    budgetCategory: 'Need',
    keywords: ['grocery', 'groceries', 'vegetables', 'veggies', 'fruits', 'milk', 'supermarket', 'dmart', 'blinkit', 'zepto', 'instamart', 'bigbasket', 'ration'],
    subcategories: [],
  },
  // Transport
  {
    category: 'Transport',
    budgetCategory: 'Need',
    subcategories: [
      { name: 'Fuel', keywords: ['petrol', 'diesel', 'fuel', 'cng', 'gas'] },
      { name: 'Cab', keywords: ['cab', 'uber', 'ola', 'taxi', 'auto', 'rickshaw', 'rapido'] },
      { name: 'Public Transport', keywords: ['bus', 'train', 'metro', 'subway', 'ticket'] },
      { name: 'Vehicle Maintenance', keywords: ['car service', 'bike service', 'puncture', 'mechanic', 'car wash', 'vehicle service'] },
    ],
  },
  // Bills & Utilities
  {
    category: 'Bills & Utilities',
    budgetCategory: 'Need',
    subcategories: [
      { name: 'Electricity', keywords: ['electricity', 'current bill', 'power bill', 'eb bill', 'electric bill'] },
      { name: 'Water', keywords: ['water bill', 'water'] },
      { name: 'Internet', keywords: ['internet', 'wifi', 'broadband', 'fiber', 'wi-fi'] },
      { name: 'Mobile Recharge', keywords: ['recharge', 'mobile bill', 'phone bill', 'airtel', 'jio', 'vi'] },
    ],
  },
  // Housing & Rent
  {
    category: 'Housing & Rent',
    budgetCategory: 'Need',
    subcategories: [
      { name: 'Rent', keywords: ['rent', 'house rent', 'flat rent', 'room rent'] },
      { name: 'Maintenance', keywords: ['society maintenance', 'flat maintenance', 'building maintenance'] },
      { name: 'Hostel', keywords: ['hostel', 'pg', 'paying guest'] },
    ],
  },
  // Healthcare
  {
    category: 'Healthcare',
    budgetCategory: 'Need',
    subcategories: [
      { name: 'Medicines', keywords: ['medicine', 'medicines', 'pharmacy', 'medical', 'tablets', 'pills', 'apollo', 'pharmeasy'] },
      { name: 'Doctor Consultation', keywords: ['doctor', 'consultation', 'clinic', 'dentist', 'physician', 'hospital'] },
      { name: 'Medical Tests', keywords: ['blood test', 'lab test', 'scan', 'mri', 'x-ray', 'xray', 'test'] },
    ],
  },
  // Shopping
  {
    category: 'Shopping',
    budgetCategory: 'Want',
    subcategories: [
      { name: 'Clothing', keywords: ['clothes', 'clothing', 'shirt', 'pants', 'tshirt', 'jeans', 'dress', 'saree'] },
      { name: 'Footwear', keywords: ['shoes', 'footwear', 'sneakers', 'sandals', 'slippers'] },
      { name: 'Electronics', keywords: ['electronics', 'gadget', 'laptop', 'mobile phone', 'earphones', 'headphones'] },
      { name: 'Accessories', keywords: ['watch', 'bag', 'sunglasses', 'wallet', 'belt'] },
    ],
    keywords: ['shopping', 'amazon', 'flipkart', 'myntra', 'bought'],
  },
  // Subscriptions
  {
    category: 'Subscriptions',
    budgetCategory: 'Want',
    subcategories: [
      { name: 'Streaming', keywords: ['netflix', 'prime video', 'disney', 'hotstar', 'hulu', 'ott'] },
      { name: 'Music', keywords: ['spotify', 'apple music', 'youtube music', 'gaana'] },
      { name: 'Software', keywords: ['chatgpt', 'github', 'adobe', 'icloud', 'notion', 'google one', 'dropbox'] },
    ],
  },
  // Entertainment
  {
    category: 'Entertainment',
    budgetCategory: 'Want',
    keywords: ['movie', 'cinema', 'theatre', 'concert', 'gaming', 'game', 'party', 'outing'],
    subcategories: [],
  },
  // Education
  {
    category: 'Education',
    budgetCategory: 'Need',
    keywords: ['tuition', 'school fee', 'college fee', 'course', 'books', 'book', 'exam fee', 'education'],
    subcategories: [],
  },
  // Personal Care
  {
    category: 'Personal Care',
    budgetCategory: 'Want',
    keywords: ['haircut', 'salon', 'spa', 'massage', 'facial', 'shaving', 'grooming', 'makeup', 'skincare'],
    subcategories: [],
  },
  // Travel
  {
    category: 'Travel',
    budgetCategory: 'Want',
    keywords: ['flight', 'hotel', 'resort', 'vacation', 'trip', 'holiday', 'airbnb', 'tour'],
    subcategories: [],
  },
  // Insurance
  {
    category: 'Insurance',
    budgetCategory: 'Need',
    keywords: ['insurance', 'lic', 'premium', 'health insurance', 'term insurance', 'car insurance', 'bike insurance'],
    subcategories: [],
  },
  // Loan & EMI
  {
    category: 'Loan & EMI',
    budgetCategory: 'Need',
    keywords: ['emi', 'loan', 'car loan', 'home loan', 'personal loan', 'education loan'],
    subcategories: [],
  },
  // Taxes & Fees
  {
    category: 'Taxes & Fees',
    budgetCategory: 'Need',
    keywords: ['tax', 'taxes', 'gst', 'income tax', 'property tax', 'fine', 'penalty', 'challan'],
    subcategories: [],
  },
  // Other
  {
    category: 'Other',
    budgetCategory: 'Want',
    keywords: ['misc', 'miscellaneous', 'other'],
    subcategories: [],
  },
];

// Keyword mappings for income categories
const INCOME_RULES = [
  {
    category: 'Salary',
    keywords: ['salary', 'paycheck', 'wages', 'monthly salary', 'stipend'],
    subcategories: [],
  },
  {
    category: 'Freelance',
    keywords: ['freelance', 'freelancing', 'upwork', 'fiverr', 'client work', 'gig', 'consulting'],
    subcategories: [],
  },
  {
    category: 'Business',
    keywords: ['business', 'sales', 'revenue', 'store', 'shop revenue'],
    subcategories: [],
  },
  {
    category: 'Investment Returns',
    keywords: ['investment return', 'mutual fund return', 'stock profit', 'trading profit', 'capital gain'],
    subcategories: [
      { name: 'Mutual Fund Returns', keywords: ['mutual fund returns', 'mf return'] },
      { name: 'Stock Profits', keywords: ['stock profit', 'trading profit', 'capital gains'] },
      { name: 'Dividends', keywords: ['dividend', 'dividends'] },
    ],
  },
  {
    category: 'Interest Income',
    keywords: ['interest', 'bank interest', 'savings interest', 'fd interest'],
    subcategories: [],
  },
  {
    category: 'Dividends',
    keywords: ['dividend', 'dividends'],
    subcategories: [],
  },
  {
    category: 'Rental Income',
    keywords: ['rental income', 'rent received', 'tenant rent'],
    subcategories: [],
  },
  {
    category: 'Bonus',
    keywords: ['bonus', 'incentive', 'diwali bonus', 'appraisal bonus'],
    subcategories: [],
  },
  {
    category: 'Pocket Money / Allowance',
    keywords: ['pocket money', 'allowance', 'pocket allowance'],
    subcategories: [],
  },
  {
    category: 'Gift',
    keywords: ['gift', 'present', 'cash gift'],
    subcategories: [],
  },
  {
    category: 'Refund / Cashback',
    keywords: ['cashback', 'refund', 'cash back', 'gpay reward', 'paytm cashback'],
    subcategories: [],
  },
  {
    category: 'Reimbursement',
    keywords: ['reimbursement', 'reimbursed', 'expense claim'],
    subcategories: [],
  },
  {
    category: 'Other',
    keywords: ['income', 'credit', 'credited'],
    subcategories: [],
  },
];

/**
 * Extracts numeric amount from message text.
 * Handles: "150", "₹150", "rs 150", "inr 150", "150.50", "26,000", "26000".
 */
function extractAmount(text) {
  // Replace comma separators in numbers (e.g. 26,000 -> 26000)
  const cleaned = text.replace(/(\d+),(\d+)/g, '$1$2');

  // Regex looking for currency symbol or standalone numbers
  const match = cleaned.match(/(?:(?:₹|rs\.?|inr)\s*)?(\b\d+(?:\.\d{1,2})?\b)(?:\s*(?:₹|rs\.?|inr|rupees))?/i);
  if (!match) return null;

  const num = parseFloat(match[1]);
  return isNaN(num) || num <= 0 ? null : num;
}

/**
 * Clean and format a human-readable transaction description from message.
 */
function cleanDescription(text, matchedAmount, matchedCategory, matchedSubcategory) {
  let cleaned = text;

  // Remove the amount and currency markers
  cleaned = cleaned.replace(/(?:₹|rs\.?|inr)\s*\d+(?:\.\d{1,2})?/gi, ' ');
  cleaned = cleaned.replace(/\b\d+(?:\.\d{1,2})?\s*(?:₹|rs\.?|inr|rupees)?/gi, ' ');

  // Remove common prefix verbs and prepositions
  cleaned = cleaned.replace(/\b(spent|spend|paid|pay|bought|purchased|received|got|earned|credited|invested|invest)\b/gi, ' ');
  cleaned = cleaned.replace(/\b(on|for|in|from|to|as|a|an|the|my)\b/gi, ' ');

  cleaned = cleaned.trim().replace(/\s+/g, ' ');

  if (!cleaned || cleaned.length < 2) {
    // Fall back to subcategory or category name
    return matchedSubcategory || matchedCategory;
  }

  // Capitalize first character
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Main parser function.
 * @param {string} text Raw message from Telegram
 * @returns {object} Parse result
 */
function parseTelegramMessage(text) {
  if (!text || typeof text !== 'string') {
    return {
      success: false,
      reason: 'Empty message received. Please provide transaction details (e.g., "Spent 150 on lunch").',
    };
  }

  const raw = text.trim();
  const lower = raw.toLowerCase();

  // 1. Check Amount
  const amount = extractAmount(raw);
  if (!amount) {
    return {
      success: false,
      reason: 'Could not find a valid transaction amount. Please include a positive amount (e.g., "Spent 150 on lunch" or "Received 26000 salary").',
    };
  }

  // 2. Identify Intent & Type
  // Explicit investment words
  const isInvestmentKeyword = /\b(invested|invest|investing|investment|sip|mutual fund|stocks|shares|etf|fd|rd|ppf|nps|gold)\b/i.test(lower);

  // Income keywords
  const isIncomeKeyword = /\b(received|got|earned|credited|income|salary|cashback|refund|reimbursement|freelance|dividend)\b/i.test(lower);

  // Expense keywords
  const isExpenseKeyword = /\b(spent|spend|paid|pay|bought|purchased|bill|cost|fee|charge|order|recharge)\b/i.test(lower);

  let type = null;
  if (isInvestmentKeyword) {
    type = 'expense'; // ByteBudget classifies investments as financial outflows (Savings/Investment)
  } else if (isIncomeKeyword && !isExpenseKeyword) {
    type = 'income';
  } else if (isExpenseKeyword) {
    type = 'expense';
  } else {
    // Default to expense if words like "lunch", "coffee", "petrol" exist, or income if "salary"
    if (/\b(salary|freelance|cashback|refund)\b/i.test(lower)) {
      type = 'income';
    } else {
      type = 'expense';
    }
  }

  // 3. Match Category & Subcategory
  let category = type === 'income' ? 'Other' : 'Other';
  let subcategory = '';
  let budgetCategory = type === 'expense' ? 'Want' : '';

  if (isInvestmentKeyword) {
    category = 'Investments';
    budgetCategory = 'Savings/Investment';
    const invRule = EXPENSE_RULES.find((r) => r.category === 'Investments');
    if (invRule) {
      for (const sub of invRule.subcategories) {
        if (sub.keywords.some((k) => lower.includes(k))) {
          subcategory = sub.name;
          break;
        }
      }
    }
    if (!subcategory) {
      subcategory = 'Other Investments';
    }
  } else if (type === 'income') {
    let matchedRule = null;
    for (const rule of INCOME_RULES) {
      if (rule.keywords.some((k) => lower.includes(k))) {
        matchedRule = rule;
        category = rule.category;
        break;
      }
    }

    if (matchedRule && matchedRule.subcategories.length > 0) {
      for (const sub of matchedRule.subcategories) {
        if (sub.keywords.some((k) => lower.includes(k))) {
          subcategory = sub.name;
          break;
        }
      }
    }
  } else {
    // Ordinary Expense
    let matchedRule = null;
    for (const rule of EXPENSE_RULES) {
      if (rule.category === 'Investments') continue; // Handled above

      // Check subcategories first
      if (rule.subcategories) {
        for (const sub of rule.subcategories) {
          if (sub.keywords.some((k) => lower.includes(k))) {
            matchedRule = rule;
            category = rule.category;
            subcategory = sub.name;
            budgetCategory = rule.budgetCategory || 'Need';
            break;
          }
        }
      }
      if (matchedRule) break;

      // Check category keywords
      if (rule.keywords && rule.keywords.some((k) => lower.includes(k))) {
        matchedRule = rule;
        category = rule.category;
        budgetCategory = rule.budgetCategory || 'Need';
        break;
      }
    }
  }

  // 4. Generate clean description
  const description = cleanDescription(raw, amount, category, subcategory);

  return {
    success: true,
    type,
    amount,
    category,
    subcategory,
    budgetCategory,
    description,
  };
}

module.exports = {
  parseTelegramMessage,
  extractAmount,
  cleanDescription,
};
