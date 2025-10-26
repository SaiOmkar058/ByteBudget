import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyBudget: Number(localStorage.getItem('monthlyBudget')) || 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spendingByCategory, setSpendingByCategory] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all transactions
        const txRes = await api.get('/transactions');
        const transactions = txRes.data || [];
        // Sort by date descending
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentTransactions(transactions.slice(0, 5));

        // Calculate stats
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const balance = totalIncome - totalExpenses;
        setStats({
          totalIncome,
          totalExpenses,
          balance,
          monthlyBudget: Number(localStorage.getItem('monthlyBudget')) || 0
        });

        // Calculate spending by category for expenses
        const expenseTx = transactions.filter(t => t.type === 'expense');
        const categoryTotals = {};
        let max = 0;
        expenseTx.forEach(t => {
          if (!t.category) return;
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + (Number(t.amount) || 0);
          if (categoryTotals[t.category] > max) max = categoryTotals[t.category];
        });
        // Convert to array and sort by amount desc
        const sorted = Object.entries(categoryTotals)
          .map(([category, amount]) => ({ category, amount }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 4); // Top 4 categories
        // Calculate percent for bar width
        const withPercent = sorted.map(item => ({
          ...item,
          percent: max ? Math.round((item.amount / max) * 100) : 0
        }));
        setSpendingByCategory(withPercent);
      } catch {
        // Optionally show error
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="dashboard-title">
              <span className="emoji">💰</span>
              <span className="gradient-text">ByteBudget</span>
            </h1>
            <p className="dashboard-subtitle">Welcome back, {user?.name}! 👋</p>
          </div>
          <button onClick={handleLogout} className="btn btn-outline logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card income-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <p className="stat-label">Total Income</p>
              <h2 className="stat-value">₹{stats.totalIncome.toLocaleString()}</h2>
            </div>
          </div>

          <div className="stat-card expense-card">
            <div className="stat-icon">📉</div>
            <div className="stat-content">
              <p className="stat-label">Total Expenses</p>
              <h2 className="stat-value">₹{stats.totalExpenses.toLocaleString()}</h2>
            </div>
          </div>

          <div className="stat-card balance-card">
            <div className="stat-icon">💵</div>
            <div className="stat-content">
              <p className="stat-label">Current Balance</p>
              <h2 className="stat-value">₹{stats.balance.toLocaleString()}</h2>
            </div>
          </div>

          <div className="stat-card budget-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <p className="stat-label">Monthly Budget</p>
              <h2 className="stat-value">₹{stats.monthlyBudget.toLocaleString()}</h2>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3 className="section-title">Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-btn income-action" onClick={() => navigate('/income')}>
              <span className="action-icon">➕</span>
              <span className="action-text">Add Income</span>
            </button>
            <button className="action-btn expense-action" onClick={() => navigate('/expenses')}>
              <span className="action-icon">➖</span>
              <span className="action-text">Add Expense</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/reports')}>
              <span className="action-icon">📊</span>
              <span className="action-text">View Reports</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/settings')}>
              <span className="action-icon">⚙️</span>
              <span className="action-text">Settings</span>
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="recent-transactions">
          <div className="section-header">
            <h3 className="section-title">Recent Transactions</h3>
            <button className="btn-link">View All →</button>
          </div>
          
          <div className="transactions-list">
            {loading ? (
              <div className="empty-state">
                <p className="empty-text">Loading...</p>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="empty-state">
                <p className="empty-icon">📭</p>
                <p className="empty-text">No transactions yet</p>
              </div>
            ) : (
              recentTransactions.map(transaction => (
                <div key={transaction._id || transaction.id} className="transaction-item">
                  <div className="transaction-icon">
                    {transaction.type === 'income' ? '📥' : '📤'}
                  </div>
                  <div className="transaction-details">
                    <p className="transaction-description">{transaction.description}</p>
                    <p className="transaction-meta">
                      <span className="transaction-category">{transaction.category}</span>
                      <span className="transaction-date">{transaction.date?.split('T')[0]}</span>
                    </p>
                  </div>
                  <div className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Spending Overview */}
        <div className="spending-overview">
          <h3 className="section-title">Spending Overview</h3>
          <div className="spending-bars">
            {loading ? (
              <div className="empty-state"><p className="empty-text">Loading...</p></div>
            ) : spendingByCategory.length === 0 ? (
              <div className="empty-state">
                <p className="empty-icon">📭</p>
                <p className="empty-text">No spending data yet</p>
              </div>
            ) : (
              spendingByCategory.map((item, idx) => (
                <div className="spending-bar" key={item.category}>
                  <div className="spending-label">
                    <span>{item.category}</span>
                    <span className="spending-amount">₹{Number(item.amount).toLocaleString()}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${item.percent}%`, backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"][idx % 4] }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
