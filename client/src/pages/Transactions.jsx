import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { FiEdit2, FiTrash2, FiArrowUp, FiArrowDown, FiPlus, FiSearch, FiTrendingUp, FiTrendingDown, FiInfo, FiChevronDown } from 'react-icons/fi';
import '../styles/Transactions.css';

const CustomDropdown = ({ value, onChange, options, labelPrefix }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className={`dropdown-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="dropdown-trigger-text">
          {labelPrefix ? `${labelPrefix}: ` : ''}{selectedOption ? selectedOption.label : value}
        </span>
        <FiChevronDown className={`dropdown-chevron-icon ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <ul className="dropdown-options">
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`dropdown-option ${value === opt.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


const Transactions = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Sync with URL search query param (e.g. from topbar search bar)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search') || '';
    setSearchTerm(query);
  }, [location.search]);

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
      toast.error('Error fetching transactions');
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



  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        setTransactions(transactions.filter(txn => txn._id !== id));
      } catch (error) {
        console.error('Error deleting transaction:', error);
        toast.error('Failed to delete transaction');
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
    return <div className="loading">Loading transactions...</div>;
  }

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="transactions-container">
      <div className="transactions-header">
        <div className="header-info">
          <h2>Overview</h2>
          <p className="subtitle">Track and filter all your cash flows in one place</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-add income-btn"
            onClick={() => navigate('/income/add')}
          >
            <FiPlus style={{ marginRight: '0.5rem' }} /> Add Income
          </button>
          <button
            className="btn-add expense-btn"
            onClick={() => navigate('/expenses/add')}
          >
            <FiPlus style={{ marginRight: '0.5rem' }} /> Add Expense
          </button>
        </div>
      </div>

      {/* Real-time summary cards */}
      <div className="transactions-summary-cards">
        <div className="summary-card income">
          <div className="card-icon"><FiTrendingUp /></div>
          <div className="card-info">
            <span className="summary-label">Filtered Income</span>
            <span className="summary-value">₹{totalIncome.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="summary-card expense">
          <div className="card-icon"><FiTrendingDown /></div>
          <div className="card-info">
            <span className="summary-label">Filtered Expense</span>
            <span className="summary-value">₹{totalExpense.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="summary-card balance">
          <div className="card-icon"><FiInfo /></div>
          <div className="card-info">
            <span className="summary-label">Net Balance</span>
            <span className={`summary-value ${netBalance >= 0 ? 'positive' : 'negative'}`}>
              {netBalance >= 0 ? '+' : '-'}₹{Math.abs(netBalance).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-bar">
          <FiSearch className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <CustomDropdown
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All Flow' },
              { value: 'income', label: 'Income Only' },
              { value: 'expense', label: 'Expenses Only' }
            ]}
          />

          <CustomDropdown
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'date', label: 'Sort by Date' },
              { value: 'amount', label: 'Sort by Amount' },
              { value: 'category', label: 'Sort by Category' }
            ]}
          />

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-btn"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
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
                  className="btn-add income-btn"
                  onClick={() => navigate('/income/add')}
                >
                  <FiPlus style={{ marginRight: '0.5rem' }} /> Add Income
                </button>
                <button
                  className="btn-add expense-btn"
                  onClick={() => navigate('/expenses/add')}
                >
                  <FiPlus style={{ marginRight: '0.5rem' }} /> Add Expense
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div key={transaction._id} className={`transaction-card ${transaction.type}`}>
              <div className="transaction-left-section">
                <div className="transaction-icon">
                  {transaction.type === 'income' ? <FiTrendingUp /> : <FiTrendingDown />}
                </div>
                <div className="transaction-details">
                  <div className="transaction-description">
                    {transaction.description}
                  </div>
                  <span className={`category-badge ${transaction.type}`}>
                    {transaction.category}
                  </span>
                </div>
              </div>

              <div className="transaction-middle-section">
                <span className="transaction-date">{formatDate(transaction.date)}</span>
              </div>

              <div className="transaction-right-section">
                <span className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString('en-IN')}
                </span>
                <div className="transaction-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => navigate(`/${transaction.type}s/edit/${transaction._id}`)}
                    title="Edit Transaction"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteTransaction(transaction._id)}
                    title="Delete Transaction"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;
