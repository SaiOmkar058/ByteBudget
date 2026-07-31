import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import '../styles/DebtTracker.css';

const DEBT_TYPES = ['Home Loan', 'Car Loan', 'Personal Loan', 'Student Loan', 'Education Loan', 'Credit Card EMI', 'Consumer EMI', 'Other'];

const defaultForm = {
  name: '',
  type: 'Personal Loan',
  principalAmount: '',
  interestRate: '',
  totalEMIs: '',
  emisPaid: '',
  emiAmount: '',
  automateEMI: false,
  startDate: new Date().toISOString().split('T')[0],
};

const DebtTracker = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      const res = await api.get('/debts');
      setDebts(res.data || []);
    } catch {
      toast.error('Failed to load debts');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, type, principalAmount, interestRate, totalEMIs, emiAmount } = formData;
    if (!name || !type || !principalAmount || !interestRate || !totalEMIs || !emiAmount) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const payload = {
        ...formData,
        principalAmount: Number(principalAmount),
        interestRate: Number(interestRate),
        totalEMIs: Number(totalEMIs),
        emisPaid: Number(formData.emisPaid) || 0,
        emiAmount: Number(emiAmount),
      };
      if (editingId) {
        const res = await api.put(`/debts/${editingId}`, payload);
        setDebts(debts.map((d) => (d._id === editingId ? res.data : d)));
        toast.success('Debt updated!');
      } else {
        const res = await api.post('/debts', payload);
        setDebts([res.data, ...debts]);
        toast.success('Debt added!');
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save debt');
    }
  };

  const handleEdit = (debt) => {
    setFormData({
      name: debt.name,
      type: debt.type,
      principalAmount: debt.principalAmount,
      interestRate: debt.interestRate,
      totalEMIs: debt.totalEMIs,
      emisPaid: debt.emisPaid,
      emiAmount: debt.emiAmount,
      automateEMI: debt.automateEMI,
      startDate: debt.startDate?.split('T')[0] || '',
    });
    setEditingId(debt._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/debts/${id}`);
      setDebts(debts.filter((d) => d._id !== id));
      setDeleteConfirm(null);
      toast.success('Debt removed');
    } catch {
      toast.error('Failed to delete debt');
    }
  };

  const handleToggleAutomate = async (debt) => {
    try {
      const res = await api.put(`/debts/${debt._id}`, { automateEMI: !debt.automateEMI });
      setDebts(debts.map((d) => (d._id === debt._id ? res.data : d)));
      toast.success(`EMI auto-deduction ${!debt.automateEMI ? 'enabled' : 'disabled'} for ${debt.name}`);
    } catch {
      toast.error('Failed to update auto-deduction setting');
    }
  };

  const handleSimulateEMI = async () => {
    setSimulating(true);
    setSimResult(null);
    try {
      const res = await api.post('/transactions/automate-emi');
      setSimResult(res.data);
      // Refresh debts to show updated emisPaid
      await fetchDebts();
      if (res.data.processed.length > 0) {
        toast.success(`✅ ${res.data.processed.length} EMI(s) deducted successfully!`);
      } else {
        toast.info('No eligible automated EMI debts found.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'EMI simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingId(null);
    setShowForm(false);
  };

  const totalDebt = debts.reduce((sum, d) => sum + (Number(d.principalAmount) || 0), 0);
  const totalMonthlyEMI = debts
    .filter((d) => d.emisPaid < d.totalEMIs)
    .reduce((sum, d) => sum + (Number(d.emiAmount) || 0), 0);
  const automatedCount = debts.filter((d) => d.automateEMI && d.emisPaid < d.totalEMIs).length;

  return (
    <div className="debt-page">
      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Remove Debt?</h3>
            <p className="modal-message">This debt record will be permanently removed.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="debt-header">
        <div>
          <h2 className="debt-title">Loan & EMI Tracker</h2>
          <p className="debt-subtitle">Track payoff progress and automate monthly EMI deductions</p>
        </div>
        <div className="debt-header-btns">
          <button
            className={`debt-simulate-btn ${simulating ? 'simulating' : ''}`}
            onClick={handleSimulateEMI}
            disabled={simulating || automatedCount === 0}
            title={automatedCount === 0 ? 'Enable auto-deduction on at least one debt first' : ''}
          >
            {simulating ? '⏳ Processing...' : `⚡ Trigger EMI (${automatedCount} active)`}
          </button>
          <button className="subs-add-btn" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
            {showForm ? '✕ Cancel' : '+ Add Debt/Loan'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="debt-summary-grid">
        <div className="debt-summary-card">
          <div className="debt-summary-icon danger-icon">🏦</div>
          <div>
            <p className="debt-summary-label">Total Debt Principal</p>
            <p className="debt-summary-value danger-val">₹{totalDebt.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="debt-summary-card">
          <div className="debt-summary-icon warning-icon">📆</div>
          <div>
            <p className="debt-summary-label">Monthly EMI Outflow</p>
            <p className="debt-summary-value warning-val">₹{totalMonthlyEMI.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="debt-summary-card">
          <div className="debt-summary-icon success-icon">⚡</div>
          <div>
            <p className="debt-summary-label">Auto-Deduction Active</p>
            <p className="debt-summary-value success-val">{automatedCount} Loan{automatedCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Simulation Result */}
      {simResult && (
        <div className="sim-result-card">
          <h3 className="sim-result-title">⚡ EMI Simulation Result</h3>
          {simResult.processed.length > 0 && (
            <div className="sim-processed">
              <p className="sim-section-label">✅ Processed ({simResult.processed.length})</p>
              {simResult.processed.map((r, i) => (
                <div key={i} className="sim-row">
                  <span className="sim-row-name">{r.debtName}</span>
                  <span className="sim-row-detail">₹{Number(r.emiAmount).toLocaleString('en-IN')} • EMI {r.emisPaidNow}/{r.emisPaidNow + r.remainingEMIs}</span>
                </div>
              ))}
            </div>
          )}
          {simResult.skipped.length > 0 && (
            <div className="sim-skipped">
              <p className="sim-section-label">⏭ Skipped ({simResult.skipped.length})</p>
              {simResult.skipped.map((s, i) => (
                <div key={i} className="sim-row">
                  <span className="sim-row-name">{s.name}</span>
                  <span className="sim-row-detail muted">{s.reason}</span>
                </div>
              ))}
            </div>
          )}
          <button className="sim-close-btn" onClick={() => setSimResult(null)}>Dismiss</button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="debt-form-card">
          <h3 className="debt-form-title">{editingId ? '✏️ Edit Debt/Loan' : '➕ Add Debt/Loan'}</h3>
          <form onSubmit={handleSubmit} className="debt-form">
            <div className="debt-form-row">
              <div className="form-group">
                <label className="form-label">Loan Name *</label>
                <input name="name" className="form-input" value={formData.name} onChange={handleChange} placeholder="e.g. SBI Home Loan" required />
              </div>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select name="type" className="form-input" value={formData.type} onChange={handleChange}>
                  {DEBT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="debt-form-row">
              <div className="form-group">
                <label className="form-label">Principal Amount (₹) *</label>
                <input type="number" name="principalAmount" className="form-input" value={formData.principalAmount} onChange={handleChange} placeholder="e.g. 500000" min="0" required />
              </div>
              <div className="form-group">
                <label className="form-label">Interest Rate (% p.a.) *</label>
                <input type="number" name="interestRate" className="form-input" value={formData.interestRate} onChange={handleChange} placeholder="e.g. 8.5" min="0" step="0.01" required />
              </div>
              <div className="form-group">
                <label className="form-label">EMI Amount (₹) *</label>
                <input type="number" name="emiAmount" className="form-input" value={formData.emiAmount} onChange={handleChange} placeholder="e.g. 9500" min="0" required />
              </div>
            </div>
            <div className="debt-form-row">
              <div className="form-group">
                <label className="form-label">Total EMIs *</label>
                <input type="number" name="totalEMIs" className="form-input" value={formData.totalEMIs} onChange={handleChange} placeholder="e.g. 60" min="1" required />
              </div>
              <div className="form-group">
                <label className="form-label">EMIs Already Paid</label>
                <input type="number" name="emisPaid" className="form-input" value={formData.emisPaid} onChange={handleChange} placeholder="0" min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Loan Start Date</label>
                <input type="date" name="startDate" className="form-input" value={formData.startDate} onChange={handleChange} />
              </div>
            </div>
            <div className="subs-form-check">
              <input type="checkbox" id="automateEMI" name="automateEMI" checked={formData.automateEMI} onChange={handleChange} />
              <label htmlFor="automateEMI" className="form-label">Enable automatic monthly EMI deduction (via Trigger button)</label>
            </div>
            <div className="subs-form-btns">
              <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add Debt'}</button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Debt Cards */}
      {loading ? (
        <div className="loading-state"><p>Loading debts...</p></div>
      ) : debts.length === 0 ? (
        <div className="subs-empty">
          <div className="empty-icon">🏦</div>
          <h3>No debts tracked</h3>
          <p>Add your loans and EMIs to see payoff progress and automate deductions.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add First Debt</button>
        </div>
      ) : (
        <div className="debt-list">
          {debts.map((debt) => {
            const paid = Number(debt.emisPaid) || 0;
            const total = Number(debt.totalEMIs) || 1;
            const progress = Math.min((paid / total) * 100, 100);
            const remaining = Math.max(total - paid, 0);
            const isCompleted = remaining === 0;
            const amountPaid = paid * debt.emiAmount;
            const amountRemaining = remaining * debt.emiAmount;

            return (
              <div key={debt._id} className={`debt-card ${isCompleted ? 'debt-completed' : ''}`}>
                <div className="debt-card-top">
                  <div className="debt-card-info">
                    <div className="debt-type-badge">{debt.type}</div>
                    <h4 className="debt-name">{debt.name}</h4>
                    <p className="debt-meta">
                      ₹{Number(debt.principalAmount).toLocaleString('en-IN')} @ {debt.interestRate}% p.a.
                    </p>
                  </div>
                  <div className="debt-card-controls">
                    <div className="debt-toggle-row">
                      <span className="debt-toggle-label">Auto EMI</span>
                      <button
                        className={`toggle-switch ${debt.automateEMI ? 'on' : 'off'} ${isCompleted ? 'disabled' : ''}`}
                        onClick={() => !isCompleted && handleToggleAutomate(debt)}
                        title={isCompleted ? 'Loan completed' : `${debt.automateEMI ? 'Disable' : 'Enable'} auto-deduction`}
                      >
                        <span className="toggle-knob" />
                      </button>
                    </div>
                    <div className="debt-card-actions">
                      <button className="action-btn edit-btn" onClick={() => handleEdit(debt)} title="Edit">✏️</button>
                      <button className="action-btn delete-btn" onClick={() => setDeleteConfirm(debt._id)} title="Delete">🗑️</button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="debt-progress-wrap">
                  <div className="debt-progress-header">
                    <span className="debt-progress-label">Payoff Progress</span>
                    <span className="debt-progress-pct">{Math.round(progress)}%</span>
                  </div>
                  <div className="debt-progress-bar">
                    <div
                      className={`debt-progress-fill ${isCompleted ? 'completed' : ''}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="debt-progress-labels">
                    <span>{paid}/{total} EMIs paid</span>
                    {isCompleted
                      ? <span className="debt-done-badge">🎉 Fully Paid!</span>
                      : <span>{remaining} remaining</span>
                    }
                  </div>
                </div>

                {/* Amount Breakdown */}
                <div className="debt-amounts">
                  <div className="debt-amount-item">
                    <span className="debt-amount-label">Monthly EMI</span>
                    <span className="debt-amount-val">₹{Number(debt.emiAmount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="debt-amount-item">
                    <span className="debt-amount-label">Paid So Far</span>
                    <span className="debt-amount-val success-val">₹{amountPaid.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="debt-amount-item">
                    <span className="debt-amount-label">Outstanding</span>
                    <span className="debt-amount-val danger-val">₹{amountRemaining.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DebtTracker;
