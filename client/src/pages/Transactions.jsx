import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import '../styles/Transactions.css';

const Transactions = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, income, expense
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, amount, category
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterAndSortTransactions();
  }, [transactions, filter, searchTerm, sortBy, sortOrder]);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      const txns = response.data || [];
      // Sort by date descending by default
      txns.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(txns);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  const filterAndSortTransactions = () => {
    let filtered = [...transactions];

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(txn => txn.type === filter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(txn =>
        txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'amount':
          aValue = Number(a.amount);
          bValue = Number(b.amount);
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'date':
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTransactions(filtered);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        setTransactions(transactions.filter(txn => txn._id !== id));
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Failed to delete transaction');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="transactions-page">
        <Sidebar />
        <div className="main-content">
          <TopBar onLogout={handleLogout} />
          <div className="loading">Loading transactions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-page">
      <Sidebar />
      <div className="main-content">
        <TopBar onLogout={handleLogout} />

        <div className="transactions-container">
          <div className="transactions-header">
            <h1>All Transactions</h1>
            <div className="header-actions">
              <button
                className="btn-primary"
                onClick={() => navigate('/income/add')}
              >
                + Add Income
              </button>
              <button
                className="btn-secondary"
                onClick={() => navigate('/expenses/add')}
              >
                + Add Expense
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="filters-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-controls">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Transactions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="category">Sort by Category</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="sort-btn"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div className="transactions-list">
            {filteredTransactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <h3>No transactions found</h3>
                <p>
                  {searchTerm || filter !== 'all'
                    ? 'Try adjusting your filters or search terms.'
                    : 'Start by adding your first transaction.'
                  }
                </p>
                {!searchTerm && filter === 'all' && (
                  <div className="empty-actions">
                    <button
                      className="btn-primary"
                      onClick={() => navigate('/income/add')}
                    >
                      Add Income
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => navigate('/expenses/add')}
                    >
                      Add Expense
                    </button>
                  </div>
                )}
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div key={transaction._id} className="transaction-card">
                  <div className="transaction-icon">
                    {transaction.type === 'income' ? '💰' : '💸'}
                  </div>

                  <div className="transaction-details">
                    <div className="transaction-description">
                      {transaction.description}
                    </div>
                    <div className="transaction-meta">
                      <span className="transaction-category">{transaction.category}</span>
                      <span className="transaction-date">{formatDate(transaction.date)}</span>
                    </div>
                  </div>

                  <div className="transaction-amount">
                    <span className={`amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString()}
                    </span>
                  </div>

                  <div className="transaction-actions">
                    <button
                      className="edit-btn"
                      onClick={() => navigate(`/${transaction.type}s/edit/${transaction._id}`)}
                    >
                      ✏️
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteTransaction(transaction._id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
