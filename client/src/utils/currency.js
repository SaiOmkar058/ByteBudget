/**
 * Centralized currency formatting utility.
 */

export const CURRENCY_CONFIG = {
  INR: { symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
  USD: { symbol: '$', locale: 'en-US', name: 'US Dollar' },
  EUR: { symbol: '€', locale: 'de-DE', name: 'Euro' },
  GBP: { symbol: '£', locale: 'en-GB', name: 'British Pound' },
  CAD: { symbol: 'CA$', locale: 'en-CA', name: 'Canadian Dollar' },
  AUD: { symbol: 'AU$', locale: 'en-AU', name: 'Australian Dollar' },
  JPY: { symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen' },
  AED: { symbol: 'AED', locale: 'en-AE', name: 'UAE Dirham' },
};

export const getCurrencySymbol = (currencyCode = 'INR') => {
  return CURRENCY_CONFIG[currencyCode]?.symbol || '₹';
};

export const formatCurrency = (amount, currencyCode = 'INR', options = {}) => {
  const num = Number(amount) || 0;
  const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.INR;

  const formattedNumber = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: options.decimals !== undefined ? options.decimals : 0,
    maximumFractionDigits: options.decimals !== undefined ? options.decimals : 0,
  }).format(num);

  return `${config.symbol}${formattedNumber}`;
};
