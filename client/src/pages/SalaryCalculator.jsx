import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';
import { CURRENCY_CONFIG } from '../utils/currency';
import '../styles/SalaryCalculator.css';

/** 
 * Compute full tax liability for a given regime. 
 * All values in INR (Indian Rupees). 
 */
function computeTax(grossSalary, regime, section80C = 0) {
  const stdDeduction = regime.standardDeduction;
  const pfDeduction = regime === OLD_REGIME ? Math.min(section80C, regime.maxSection80C) : 0;

  const taxableIncome = Math.max(0, grossSalary - stdDeduction - pfDeduction);
  let tax = computeSlabTax(taxableIncome, regime.slabs);
  tax = applyRebate(tax, taxableIncome, regime.rebateLimit, regime.rebateAmount);
  tax = applyCess(tax);

  return {
    taxableIncome,
    taxBeforeCess: Math.max(0, computeSlabTax(taxableIncome, regime.slabs)),
    cessAmount: tax - Math.max(0, computeSlabTax(taxableIncome, regime.slabs)),
    totalTax: Math.round(tax),
    takeHome: Math.round(grossSalary - tax),
    monthlyTakeHome: Math.round((grossSalary - tax) / 12),
  };
}

const SalaryCalculator = () => {
  const [inputs, setInputs] = useState({
    grossAnnualSalary: '',
    section80C: '',
  });
  const [results, setResults] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedRegime, setSavedRegime] = useState(null);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    const gross = Number(inputs.grossAnnualSalary);
    if (!gross || gross <= 0) {
      toast.error('Please enter a valid annual salary');
      return;
    }
    const pf = Number(inputs.section80C) || 0;
    const newResult = computeTax(gross, NEW_REGIME, pf);
    const oldResult = computeTax(gross, OLD_REGIME, pf);
    setResults({ gross, pf, newRegime: newResult, oldRegime: oldResult });
    setSavedRegime(null);
  };

  const handleSaveAsIncome = async (regime, label) => {
    if (!results) return;
    setSaving(true);
    try {
      const amount = regime.monthlyTakeHome;
      await api.post('/transactions', {
        type: 'income',
        category: 'Salary',
        amount,
        description: `Monthly Take-Home Salary (${label})`,
        date: new Date().toISOString().split('T')[0],
        budgetCategory: '',
      });
      toast.success(`${formatCurrency(amount)} saved as income transaction!`);
      setSavedRegime(label);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save income');
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n) => formatCurrency(n);
  const saving_diff = results
    ? results.oldRegime.totalTax - results.newRegime.totalTax
    : 0;

  return (
    <div className="salary-page">
      <div className="salary-header">
        <div className="salary-header-text">
          <h2 className="salary-page-title">Take-Home Salary Calculator</h2>
          <p className="salary-page-sub">Compare Old vs New Indian Tax Regime — FY 2025-26</p>
        </div>
        <span className="salary-fy-badge">FY 2025-26 / AY 2026-27</span>
      </div>

      {/* Input Card */}
      <div className="salary-card">
        <h3 className="salary-card-title">💼 Enter Your Details</h3>
        <form onSubmit={handleCalculate} className="salary-form">
          <div className="salary-form-grid">
            <div className="salary-form-group">
              <label className="salary-label">Gross Annual Salary (CTC) *</label>
              <div className="salary-input-wrap">
                <span className="salary-input-prefix">{formatCurrency(CURRENCY_CONFIG.INR.symbol)}</span>
                <input type="number" name="grossAnnualSalary" className="form-input" value={inputs.grossAnnualSalary} onChange={handleChange} placeholder="e.g. 1000000" required />
              </div>
            </div>
            <div className="salary-form-group">
              <label className="salary-label">Section 80C Investment</label>
              <div className="salary-input-wrap">
                <span className="salary-input-prefix">{formatCurrency(CURRENCY_CONFIG.INR.symbol)}</span>
                <input type="number" name="section80C" className="form-input" value={inputs.section80C} onChange={handleChange} placeholder="e.g. 150000" />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Calculate Tax</button>
        </form>
      </div>
    </div>
  );
};

export default SalaryCalculator;
