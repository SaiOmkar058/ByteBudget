import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import '../styles/Subscriptions.css';

const SERVICE_ICONS = {
  Netflix: '🎬', Spotify: '🎵', YouTube: '▶️', Amazon: '📦',
  'Amazon Prime': '📦', Disney: '🏰', 'Disney+': '🏰', Hotstar: '🌟',
  'Disney+ Hotstar': '🌟', Apple: '🍎', 'iCloud': '☁️', Notion: '📝',
  Figma: '🎨', GitHub: '🐙', 'ChatGPT': '🤖', 'OpenAI': '🤖',
  Duolingo: '🦉', Zoom: '📹', Slack: '💬', Dropbox: '📂',
  Adobe: '🖌️', VPN: '🔒', Gym: '💪', Default: '💳',
};

function getIcon(name) {
  const match = Object.keys(SERVICE_ICONS).find((k) =>
    name.toLowerCase().includes(k.toLowerCase())
  );
  return match ? SERVICE_ICONS[match] : SERVICE_ICONS.Default;
}

const CATEGORIES = ['Entertainment', 'Productivity', 'Health & Fitness', 'Storage', 'Tools', 'Education', 'Other'];

const defaultForm = {
  name: '',
  amount: '',
  billingCycle: 'monthly',
  category: 'Entertainment',
  nextDueDate: new Date().toISOString().split('T')[0],
  isActive: true,
};

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get('/subscriptions');
      setSubscriptions(res.data || []);
    } catch {
      toast.error('Failed to load subscriptions');
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
    if (!formData.name || !formData.amount || formData.amount <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      if (editingId) {
        const res = await api.put(`/subscriptions/${editingId}`, {
          ...formData,
          amount: Number(formData.amount),
        });
        setSubscriptions(subscriptions.map((s) => (s._id === editingId ? res.data : s)));
        toast.success('Subscription updated!');
      } else {
        const res = await api.post('/subscriptions', {
          ...formData,
          amount: Number(formData.amount),
        });
        setSubscriptions([res.data, ...subscriptions]);
        toast.success('Subscription added!');
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save subscription');
    }
  };

  const handleEdit = (sub) => {
    setFormData({
      name: sub.name,
      amount: sub.amount,
      billingCycle: sub.billingCycle,
      category: sub.category || 'Entertainment',
      nextDueDate: sub.nextDueDate?.split('T')[0] || '',
      isActive: sub.isActive,
    });
    setEditingId(sub._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/subscriptions/${id}`);
      setSubscriptions(subscriptions.filter((s) => s._id !== id));
      setDeleteConfirm(null);
      toast.success('Subscription removed');
    } catch {
      toast.error('Failed to delete subscription');
    }
  };

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingId(null);
    setShowForm(false);
  };

  // Compute totals: prorate yearly → monthly
  const activeSubscriptions = subscriptions.filter((s) => s.isActive);
  const totalMonthly = activeSubscriptions.reduce((sum, s) => {
    const monthly = s.billingCycle === 'yearly' ? s.amount / 12 : s.amount;
    return sum + monthly;
  }, 0);
  const totalYearly = activeSubscriptions.reduce((sum, s) => {
    const yearly = s.billingCycle === 'monthly' ? s.amount * 12 : s.amount;
    return sum + yearly;
  }, 0);

  const getDueDays = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="subs-page">
      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Remove Subscription?</h3>
            <p className="modal-message">This subscription will be permanently removed.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="subs-header">
        <div>
          <h2 className="subs-title">Subscription Tracker</h2>
          <p className="subs-subtitle">Track all your recurring SaaS, streaming & service costs</p>
        </div>
        <button className="subs-add-btn" onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(defaultForm); }}>
          {showForm ? '✕ Cancel' : '+ Add Subscription'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="subs-summary-grid">
        <div className="subs-summary-card">
          <div className="subs-summary-icon">💳</div>
          <div>
            <p className="subs-summary-label">Monthly Cost</p>
            <p className="subs-summary-value">₹{Math.round(totalMonthly).toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="subs-summary-card">
          <div className="subs-summary-icon">📅</div>
          <div>
            <p className="subs-summary-label">Yearly Cost</p>
            <p className="subs-summary-value">₹{Math.round(totalYearly).toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="subs-summary-card">
          <div className="subs-summary-icon">📊</div>
          <div>
            <p className="subs-summary-label">Active Services</p>
            <p className="subs-summary-value">{activeSubscriptions.length}</p>
          </div>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="subs-form-card">
          <h3 className="subs-form-title">{editingId ? '✏️ Edit Subscription' : '➕ New Subscription'}</h3>
          <form onSubmit={handleSubmit} className="subs-form">
            <div className="subs-form-row">
              <div className="form-group">
                <label className="form-label">Service Name *</label>
                <input name="name" className="form-input" value={formData.name} onChange={handleChange} placeholder="e.g. Netflix, Spotify" required />
              </div>
              <div className="form-group">
                <label className="form-label">Amount *</label>
                <input type="number" name="amount" className="form-input" value={formData.amount} onChange={handleChange} placeholder="0" min="0" step="0.01" required />
              </div>
            </div>
            <div className="subs-form-row">
              <div className="form-group">
                <label className="form-label">Billing Cycle</label>
                <select name="billingCycle" className="form-input" value={formData.billingCycle} onChange={handleChange}>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category" className="form-input" value={formData.category} onChange={handleChange}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Next Due Date *</label>
                <input type="date" name="nextDueDate" className="form-input" value={formData.nextDueDate} onChange={handleChange} required />
              </div>
            </div>
            <div className="subs-form-check">
              <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} />
              <label htmlFor="isActive" className="form-label">Active subscription</label>
            </div>
            <div className="subs-form-btns">
              <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add Subscription'}</button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Subscriptions Grid */}
      {loading ? (
        <div className="loading-state"><p>Loading subscriptions...</p></div>
      ) : subscriptions.length === 0 ? (
        <div className="subs-empty">
          <div className="empty-icon">💳</div>
          <h3>No subscriptions yet</h3>
          <p>Add your streaming, SaaS, and service subscriptions to track costs.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add First Subscription</button>
        </div>
      ) : (
        <div className="subs-grid">
          {subscriptions.map((sub) => {
            const monthlyEquivalent = sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount;
            const dueDays = getDueDays(sub.nextDueDate);
            const isOverdue = dueDays < 0;
            const isDueSoon = dueDays >= 0 && dueDays <= 7;
            return (
              <div key={sub._id} className={`sub-card ${!sub.isActive ? 'sub-inactive' : ''}`}>
                <div className="sub-card-header">
                  <div className="sub-icon">{getIcon(sub.name)}</div>
                  <div className="sub-card-title-wrap">
                    <h4 className="sub-name">{sub.name}</h4>
                    <span className="sub-category-badge">{sub.category || 'Entertainment'}</span>
                  </div>
                  <div className="sub-card-actions">
                    <button className="action-btn edit-btn" onClick={() => handleEdit(sub)} title="Edit">✏️</button>
                    <button className="action-btn delete-btn" onClick={() => setDeleteConfirm(sub._id)} title="Delete">🗑️</button>
                  </div>
                </div>

                <div className="sub-card-body">
                  <div className="sub-amount-row">
                    <span className="sub-amount">₹{Number(sub.amount).toLocaleString('en-IN')}</span>
                    <span className="sub-cycle-badge">{sub.billingCycle === 'yearly' ? '/ year' : '/ month'}</span>
                  </div>
                  {sub.billingCycle === 'yearly' && (
                    <p className="sub-monthly-equiv">≈ ₹{Math.round(monthlyEquivalent).toLocaleString('en-IN')} / month</p>
                  )}
                </div>

                <div className="sub-card-footer">
                  <span className={`sub-due-badge ${isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : 'upcoming'}`}>
                    {isOverdue ? `Overdue ${Math.abs(dueDays)}d` : dueDays === 0 ? 'Due Today' : `Due in ${dueDays}d`}
                  </span>
                  {!sub.isActive && <span className="sub-paused-badge">Paused</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
