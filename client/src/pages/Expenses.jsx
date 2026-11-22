import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';
import {
  EXPENSE_CATEGORIES,
  getCategoryIcon,
  getSubcategories,
  getDefaultBudgetCategory,
  normalizeCategory,
} from '../utils/categories';
import '../styles/Transactions.css';

const Expenses = () => {
  const location = useLocation();

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food & Dining',
    subcategory: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    budgetCategory: 'Need',
  });

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (location.state?.editTransaction?.type === 'expense') {
      handleEdit(location.state.editTransaction);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/transactions');
      setExpenses(res.data.filter(txn => txn.type === 'expense'));
    } catch {
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    const availableSubs = getSubcategories(newCategory, 'expense');
    const autoBudget = getDefaultBudgetCategory(newCategory);
    setFormData((prev) => ({
      ...prev,
      category: newCategory,
      subcategory: availableSubs.includes(prev.subcategory) ? prev.subcategory : '',
      budgetCategory: autoBudget,
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
        // Update expense
        const res = await api.put(`/transactions/${editingId}`, {
          ...formData,
          type: 'expense',
          amount: Number(formData.amount),
        });
        setExpenses(expenses.map(exp => exp._id === editingId ? res.data : exp));
        setEditingId(null);
        toast.success('Expense updated successfully!');
      } else {
        // Add new expense
        const res = await api.post('/transactions', {
          ...formData,
          type: 'expense',
          amount: Number(formData.amount),
        });
        setExpenses([res.data, ...expenses]);
        toast.success('Expense added successfully!');
      }

      setFormData({
        amount: '',
        category: 'Food & Dining',
        subcategory: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        budgetCategory: 'Need',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleEdit = (expense) => {
    const normalizedCat = normalizeCategory(expense.category, 'expense');
    setFormData({
      amount: expense.amount,
      category: normalizedCat,
      subcategory: expense.subcategory || '',
      description: expense.description || '',
      date: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
      budgetCategory: expense.budgetCategory || getDefaultBudgetCategory(normalizedCat, expense.subcategory),
    });
    setEditingId(expense._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      amount: '',
      category: 'Food & Dining',
      subcategory: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      budgetCategory: 'Need',
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      setExpenses(expenses.filter(exp => exp._id !== id));
      setDeleteConfirm(null);
      toast.success('Expense deleted successfully!');
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  const currentSubcategories = getSubcategories(formData.category, 'expense');
  const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

  return (
    <div className="transactions-page">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Delete Expense?</h3>
            <p className="modal-message">
              Are you sure you want to delete this expense? This action cannot be undone.
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

      <main className="transactions-main">
        <div className="transactions-container">
          {/* Add/Edit Expense Form */}
          <div className="transaction-form-card">
            <h2 className="form-title">
              {editingId ? '✏️ Edit Expense' : 'Add New Expense'}
            </h2>
            <form onSubmit={handleSubmit} className="transaction-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="amount" className="form-label">
                    Amount ({formatCurrency(0)}) *
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
                    onChange={handleCategoryChange}
                    required
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat.name} value={cat.name}>
                        {cat.emoji} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {currentSubcategories.length > 0 && (
                <div className="form-group">
                  <label htmlFor="subcategory" className="form-label">
                    Subcategory <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #9ca3af)', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <select
                    id="subcategory"
                    name="subcategory"
                    className="form-input"
                    value={formData.subcategory}
                    onChange={handleChange}
                  >
                    <option value="">— Select a Subcategory (Optional) —</option>
                    {currentSubcategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}

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
                  placeholder="What did you spend on?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="budgetCategory" className="form-label">
                  Budget Rule Category
                </label>
                <select
                  id="budgetCategory"
                  name="budgetCategory"
                  className="form-input"
                  value={formData.budgetCategory}
                  onChange={handleChange}
                >
                  <option value="">— Not categorized —</option>
                  <option value="Need">🏠 Need (50% target)</option>
                  <option value="Want">🎬 Want (30% target)</option>
                  <option value="Savings/Investment">💰 Savings / Investment (20% target)</option>
                </select>
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
                <button id="submit-expense" name="submit-expense" type="submit" className="btn btn-primary btn-full">
                  {editingId ? 'Update Expense' : 'Add Expense'}
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

          {/* Expenses List */}
          <div className="transactions-list-card">
            <div className="list-header">
              <h2 className="list-title">Recent Expenses</h2>
              <div className="total-badge expense-badge">
                Total: {formatCurrency(totalExpenses)}
              </div>
            </div>

            <div className="transactions-list">
              {loading ? (
                <div className="loading-state">
                  <p>Loading expenses...</p>
                </div>
              ) : expenses.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-icon">📭</p>
                  <p className="empty-text">No expenses yet</p>
                  <p className="empty-subtext">Add your first expense above!</p>
                </div>
              ) : (
                expenses.map(expense => (
                  <div key={expense._id || expense.id} className="transaction-item expense-item">
                    <div className="transaction-icon">
                      {getCategoryIcon(expense.category, 'expense')}
                    </div>
                    <div className="transaction-details">
                      <p className="transaction-description">{expense.description || 'No description'}</p>
                      <p className="transaction-meta">
                        <span className="transaction-category">
                          {expense.category}
                          {expense.subcategory ? ` • ${expense.subcategory}` : ''}
                        </span>
                        <span className="transaction-date">{expense.date?.split('T')[0]}</span>
                      </p>
                    </div>
                    <div className="transaction-right">
                      <div className="transaction-amount expense-amount">
                        -{formatCurrency(Number(expense.amount))}
                      </div>
                      <div className="transaction-actions">
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(expense)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => setDeleteConfirm(expense._id)}
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

export default Expenses;
