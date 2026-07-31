/**
 * Indian Income Tax Configuration — FY 2025-26 / AY 2026-27
 *
 * IMPORTANT: India's tax slabs and deduction limits are updated annually in the
 * Union Budget. Update this file at the start of each Financial Year (April 1st).
 * All values are in Indian Rupees (₹).
 */

// ─────────────────────────────────────────────────────────────
// NEW TAX REGIME (Section 115BAC — Default from FY 2023-24)
// ─────────────────────────────────────────────────────────────
export const NEW_REGIME = {
  label: 'New Tax Regime',
  standardDeduction: 75000,   // Budget 2024 — increased from ₹50,000
  rebateLimit: 700000,        // Section 87A: No tax if total income ≤ ₹7,00,000
  rebateAmount: 25000,        // Max rebate under 87A
  slabs: [
    { upTo: 300000,   rate: 0.00 },
    { upTo: 600000,   rate: 0.05 },
    { upTo: 900000,   rate: 0.10 },
    { upTo: 1200000,  rate: 0.15 },
    { upTo: 1500000,  rate: 0.20 },
    { upTo: Infinity, rate: 0.30 },
  ],
};

// ─────────────────────────────────────────────────────────────
// OLD TAX REGIME
// ─────────────────────────────────────────────────────────────
export const OLD_REGIME = {
  label: 'Old Tax Regime',
  standardDeduction: 50000,   // Unchanged
  maxSection80C: 150000,      // PF, ELSS, PPF, NSC, etc.
  rebateLimit: 500000,        // Section 87A: No tax if total income ≤ ₹5,00,000
  rebateAmount: 12500,        // Max rebate under 87A
  slabs: [
    { upTo: 250000,   rate: 0.00 },
    { upTo: 500000,   rate: 0.05 },
    { upTo: 1000000,  rate: 0.20 },
    { upTo: Infinity, rate: 0.30 },
  ],
};

// ─────────────────────────────────────────────────────────────
// COMMON CESS
// ─────────────────────────────────────────────────────────────
export const HEALTH_EDU_CESS = 0.04; // 4% on computed tax

// ─────────────────────────────────────────────────────────────
// SURCHARGE (applies on tax amount for high incomes)
// ─────────────────────────────────────────────────────────────
export const SURCHARGE_RATES = [
  { aboveIncome: 50000000, rate: 0.37 }, // > ₹5 Cr (Old) / 0.25 New (post-2023)
  { aboveIncome: 20000000, rate: 0.25 },
  { aboveIncome: 10000000, rate: 0.15 },
  { aboveIncome: 5000000,  rate: 0.10 },
];

// ─────────────────────────────────────────────────────────────
// TAX COMPUTATION UTILITY
// ─────────────────────────────────────────────────────────────

/**
 * Compute slab-wise tax for a given taxable income and slabs array.
 * Handles year-boundary correctly since each slab is cumulative.
 */
export function computeSlabTax(taxableIncome, slabs) {
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  let previousLimit = 0;

  for (const slab of slabs) {
    if (taxableIncome <= previousLimit) break;
    const taxableInSlab = Math.min(taxableIncome, slab.upTo) - previousLimit;
    tax += taxableInSlab * slab.rate;
    previousLimit = slab.upTo;
    if (slab.upTo === Infinity) break;
  }

  return Math.max(0, tax);
}

/**
 * Apply Section 87A rebate if eligible.
 */
export function applyRebate(tax, grossTaxableIncome, rebateLimit, rebateAmount) {
  if (grossTaxableIncome <= rebateLimit) {
    return Math.max(0, tax - Math.min(tax, rebateAmount));
  }
  return tax;
}

/**
 * Apply Health & Education Cess on the final tax.
 */
export function applyCess(tax) {
  return tax * (1 + HEALTH_EDU_CESS);
}
