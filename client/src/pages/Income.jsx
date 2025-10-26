import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import '../styles/Transactions.css';

const Income = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Salary',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const res = await api.get('/transactions');
      setIncomes(res.data.filter(txn => txn.type === 'income'));
    } catch {
      toast.error('Failed to fetch incomes');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Bonus', 'Other'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      if (editingId) {
        // Update income
        const res = await api.put(`/transactions/${editingId}`, {
          ...formData,
          type: 'income',
          amount: Number(formData.amount),
        });
        setIncomes(incomes.map(inc => inc._id === editingId ? res.data : inc));
        toast.success('Income updated successfully!');
        setEditingId(null);
      } else {
        // Add new income
        const res = await api.post('/transactions', {
          ...formData,
          type: 'income',
          amount: Number(formData.amount),
        });
        setIncomes([res.data, ...incomes]);
        toast.success('Income added successfully!');
      }

      setFormData({
        amount: '',
        category: 'Salary',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save income');
    }
  };

  const handleEdit = (income) => {
    setFormData({
      amount: income.amount,
      category: income.category,
      description: income.description,
      date: income.date.split('T')[0]
    });
    setEditingId(income._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      amount: '',
      category: 'Salary',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      setIncomes(incomes.filter(inc => inc._id !== id));
      toast.success('Income deleted successfully!');
      setDeleteConfirm(null);
    } catch {
      toast.error('Failed to delete income');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Salary: '💼',
      Freelance: '💻',
      Business: '🏢',
      Investment: '📈',
      Gift: '🎁',
      Bonus: '💰',
      Other: '💵'
    };
    return icons[category] || '💵';
  };

  const totalIncome = incomes.reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);

  return (
    <div className="transactions-page">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Delete Income?</h3>
            <p className="modal-message">
              Are you sure you want to delete this income? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="page-header income-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">
              <span className="emoji">💰</span>
              <span className="gradient-text">ByteBudget</span>
            </h1>
            <p className="page-subtitle">Track Your Income 📈</p>
          </div>
          <div className="header-actions">
            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
              ← Dashboard
            </button>
            <button onClick={handleLogout} className="btn btn-outline">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="transactions-main">
        <div className="transactions-container">
          {/* Add/Edit Income Form */}
          <div className="transaction-form-card">
            <h2 className="form-title">
              {editingId ? '✏️ Edit Income' : 'Add New Income'}
            </h2>
            <form onSubmit={handleSubmit} className="transaction-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="amount" className="form-label">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    className="form-input"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="form-input"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{getCategoryIcon(cat)} {cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  className="form-input"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Where did this come from?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="date" className="form-label">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  className="form-input"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn btn-primary btn-full">
                  {editingId ? 'Update Income' : 'Add Income'}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-full"
                    onClick={handleCancelEdit}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Income List */}
          <div className="transactions-list-card">
            <div className="list-header">
              <h2 className="list-title">Recent Income</h2>
              <div className="total-badge income-badge">
                Total: ₹{totalIncome.toLocaleString()}
              </div>
            </div>

            <div className="transactions-list">
              {loading ? (
                <div className="loading-state">
                  <p>Loading income...</p>
                </div>
              ) : incomes.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-icon">📭</p>
                  <p className="empty-text">No income yet</p>
                  <p className="empty-subtext">Add your first income above!</p>
                </div>
              ) : (
                incomes.map(income => (
                  <div key={income._id || income.id} className="transaction-item income-item">
                    <div className="transaction-icon">
                      {getCategoryIcon(income.category)}
                    </div>
                    <div className="transaction-details">
                      <p className="transaction-description">{income.description || 'No description'}</p>
                      <p className="transaction-meta">
                        <span className="transaction-category">{income.category}</span>
                        <span className="transaction-date">{income.date?.split('T')[0]}</span>
                      </p>
                    </div>
                    <div className="transaction-right">
                      <div className="transaction-amount income-amount">
                        +₹{Number(income.amount).toLocaleString()}
                      </div>
                      <div className="transaction-actions">
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(income)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => setDeleteConfirm(income._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Income;
