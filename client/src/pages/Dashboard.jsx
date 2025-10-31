import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatsCard from '../components/dashboard/StatsCard';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import ExpenseChart from '../components/dashboard/ExpenseChart';
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
  const [_recentTransactions, setRecentTransactions] = useState([]);
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

        // Calculate spending by category
        const categoryMap = new Map();
        transactions
          .filter(t => t.type === 'expense')
          .forEach(t => {
            const category = t.category;
            if (!category) return;
            const amount = Number(t.amount) || 0;
            categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
          });
        setSpendingByCategory(Array.from(categoryMap.entries())
          .map(([category, amount]) => ({ category, amount }))
          .sort((a, b) => b.amount - a.amount));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate monthly data for the chart
  const calculateMonthlyData = (transactions) => {
    const monthlyData = {
      income: new Array(12).fill(0),
      expenses: new Array(12).fill(0)
    };

    const currentYear = new Date().getFullYear();

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth(); // 0-11
        const amount = Number(transaction.amount) || 0;

        if (transaction.type === 'income') {
          monthlyData.income[month] += amount;
        } else if (transaction.type === 'expense') {
          monthlyData.expenses[month] += amount;
        }
      }
    });

    return monthlyData;
  };

  const chartData = spendingByCategory.length > 0 ? calculateMonthlyData(_recentTransactions) : {
    income: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    expenses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  };



  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="dashboard-title">
            <span className="emoji">💰</span>
            <span className="gradient-text">ByteBudget</span>
          </div>
          <div className="dashboard-subtitle">
            Welcome back, {user?.name || 'User'}! Here's what's happening with your finances today.
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-main">

        {/* Stats Cards */}
        <div className="stats-grid">
          <StatsCard
            type="income"
            title="Total Income"
            value={stats.totalIncome}
            change={12.5}
          />
          <StatsCard
            type="expense"
            title="Total Expenses"
            value={stats.totalExpenses}
            change={-5.2}
          />
          <StatsCard
            type="balance"
            title="Current Balance"
            value={stats.balance}
            change={0}
          />
          <StatsCard
            type="budget"
            title="Monthly Budget"
            value={stats.monthlyBudget}
            change={0}
          />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <button
              onClick={() => navigate('/income/add')}
              className="action-btn income-action"
            >
              <div className="action-icon">💰</div>
              <span className="action-text">Add Income</span>
            </button>

            <button
              onClick={() => navigate('/expenses/add')}
              className="action-btn expense-action"
            >
              <div className="action-icon">💸</div>
              <span className="action-text">Add Expense</span>
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="action-btn"
            >
              <div className="action-icon">📊</div>
              <span className="action-text">View Reports</span>
            </button>

            <button
              onClick={() => navigate('/settings')}
              className="action-btn"
            >
              <div className="action-icon">⚙️</div>
              <span className="action-text">Settings</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 spending-overview">
            <div className="flex justify-between items-center mb-6">
              <h2 className="section-title">Expense Overview</h2>
              <select className="text-sm border border-gray-200 rounded px-2 py-1">
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 6 Months</option>
              </select>
            </div>
            <ExpenseChart data={chartData} />
          </div>

          {/* Recent Transactions */}
          <div className="recent-transactions">
            <div className="section-header">
              <h2 className="section-title">Recent Transactions</h2>
              <button className="btn-link" onClick={() => navigate('/transactions')}>View All</button>
            </div>
            <RecentTransactions transactions={_recentTransactions} />
          </div>
        </div>

        {/* Spending by Category */}
        <div className="spending-overview">
          <div className="section-header">
            <h2 className="section-title">Spending by Category</h2>
            <button className="btn-link" onClick={() => navigate('/reports')}>View All</button>
          </div>
          
          {spendingByCategory && spendingByCategory.length > 0 ? (
            <div className="spending-bars">
              {spendingByCategory.map((item, idx) => {
                const colors = [
                  'bg-blue-500',
                  'bg-purple-500',
                  'bg-yellow-500',
                  'bg-red-500',
                  'bg-green-500',
                  'bg-pink-500'
                ];
                const color = colors[idx % colors.length];
                const percentage = stats.totalExpenses > 0
                  ? (item.amount / stats.totalExpenses) * 100
                  : 0;

                return (
                  <div key={item.category} className="spending-bar">
                    <div className="spending-label">
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full ${color} mr-3`}></span>
                        <span>{item.category}</span>
                      </div>
                      <span className="spending-amount">₹{Number(item.amount).toLocaleString()}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-gray-500">No spending data yet</p>
              <button
                onClick={() => navigate('/expenses/add')}
                className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                Add your first transaction
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
