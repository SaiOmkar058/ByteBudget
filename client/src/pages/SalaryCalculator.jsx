import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import {
  NEW_REGIME,
  OLD_REGIME,
  HEALTH_EDU_CESS,
  computeSlabTax,
  applyRebate,
  applyCess,
} from '../utils/taxConfig';
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
      toast.success(`₹${amount.toLocaleString('en-IN')} saved as income transaction!`);
      setSavedRegime(label);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save income');
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
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
                <span className="salary-input-prefix">₹</span>
                <input
                  type="number"
                  name="grossAnnualSalary"
                  className="salary-input"
                  value={inputs.grossAnnualSalary}
                  onChange={handleChange}
                  placeholder="e.g. 1000000"
                  min="0"
                  required
                />
              </div>
              <p className="salary-hint">Enter your total annual CTC package</p>
            </div>

            <div className="salary-form-group">
              <label className="salary-label">Section 80C Investments (Old Regime only)</label>
              <div className="salary-input-wrap">
                <span className="salary-input-prefix">₹</span>
                <input
                  type="number"
                  name="section80C"
                  className="salary-input"
                  value={inputs.section80C}
                  onChange={handleChange}
                  placeholder={`Max ₹${(OLD_REGIME.maxSection80C).toLocaleString('en-IN')}`}
                  min="0"
                  max={OLD_REGIME.maxSection80C}
                />
              </div>
              <p className="salary-hint">PF, PPF, ELSS, NSC, LIC — only applies to Old Regime</p>
            </div>
          </div>

          <button type="submit" className="salary-calc-btn">
            Calculate Take-Home →
          </button>
        </form>
      </div>

      {/* Results */}
      {results && (
        <>
          {/* Regime Comparison Cards */}
          <div className="salary-results-grid">
            {[
              { regime: results.newRegime, config: NEW_REGIME, label: 'New Regime', highlight: saving_diff >= 0 },
              { regime: results.oldRegime, config: OLD_REGIME, label: 'Old Regime', highlight: saving_diff < 0 },
            ].map(({ regime, config, label, highlight }) => (
              <div key={label} className={`salary-regime-card ${highlight ? 'regime-recommended' : ''}`}>
                {highlight && <span className="regime-badge">Recommended</span>}
                <h3 className="regime-title">{config.label}</h3>

                <div className="regime-stats">
                  <div className="regime-stat">
                    <span className="regime-stat-label">Standard Deduction</span>
                    <span className="regime-stat-value deduction">{fmt(config.standardDeduction)}</span>
                  </div>
                  {config === OLD_REGIME && (
                    <div className="regime-stat">
                      <span className="regime-stat-label">80C Deduction</span>
                      <span className="regime-stat-value deduction">{fmt(Math.min(results.pf, config.maxSection80C))}</span>
                    </div>
                  )}
                  <div className="regime-stat">
                    <span className="regime-stat-label">Taxable Income</span>
                    <span className="regime-stat-value">{fmt(regime.taxableIncome)}</span>
                  </div>
                  <div className="regime-stat">
                    <span className="regime-stat-label">Tax + 4% Cess</span>
                    <span className="regime-stat-value danger">{fmt(regime.totalTax)}</span>
                  </div>
                </div>

                <div className="regime-takehome-box">
                  <div>
                    <p className="regime-takehome-label">Annual Take-Home</p>
                    <p className="regime-takehome">{fmt(regime.takeHome)}</p>
                  </div>
                  <div>
                    <p className="regime-takehome-label">Monthly Take-Home</p>
                    <p className="regime-takehome-monthly">{fmt(regime.monthlyTakeHome)}</p>
                  </div>
                </div>

                <button
                  className={`regime-save-btn ${savedRegime === label ? 'saved' : ''}`}
                  onClick={() => handleSaveAsIncome(regime, label)}
                  disabled={saving || savedRegime === label}
                >
                  {savedRegime === label ? '✓ Saved as Income' : '+ Set as Monthly Income'}
                </button>
              </div>
            ))}
          </div>

          {/* Savings Summary */}
          <div className="salary-card salary-summary-card">
            <h3 className="salary-card-title">📊 Tax Regime Comparison</h3>
            <div className="salary-summary-row">
              <span className="salary-summary-label">You save with {saving_diff >= 0 ? 'New' : 'Old'} Regime</span>
              <span className={`salary-savings-amt ${saving_diff >= 0 ? 'positive' : 'negative'}`}>
                {fmt(Math.abs(saving_diff))} / year
              </span>
            </div>
            <div className="salary-summary-row">
              <span className="salary-summary-label">Monthly difference</span>
              <span className="salary-savings-amt">{fmt(Math.abs(Math.round(saving_diff / 12)))} / month</span>
            </div>
          </div>

          {/* Tax Slabs Reference */}
          <div className="salary-card">
            <h3 className="salary-card-title">📋 Tax Slabs Reference (FY 2025-26)</h3>
            <div className="slab-tables">
              {[{ config: NEW_REGIME }, { config: OLD_REGIME }].map(({ config }) => (
                <div key={config.label} className="slab-table-wrap">
                  <h4 className="slab-table-title">{config.label}</h4>
                  <table className="slab-table">
                    <thead>
                      <tr>
                        <th>Income Range</th>
                        <th>Tax Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {config.slabs.map((slab, i) => {
                        const prev = i === 0 ? 0 : config.slabs[i - 1].upTo;
                        const label = slab.upTo === Infinity
                          ? `Above ₹${(prev / 100000).toFixed(0)}L`
                          : `₹${(prev / 100000).toFixed(1)}L – ₹${(slab.upTo / 100000).toFixed(1)}L`;
                        return (
                          <tr key={i}>
                            <td>{label}</td>
                            <td>{(slab.rate * 100).toFixed(0)}%</td>
                          </tr>
                        );
                      })}
                      <tr className="slab-cess-row">
                        <td>Health & Education Cess</td>
                        <td>{(HEALTH_EDU_CESS * 100).toFixed(0)}% on tax</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalaryCalculator;
