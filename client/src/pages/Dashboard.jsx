import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { StatsCard } from '../components/Dashboard/StatsCard';
import { RecentTransactions } from '../components/Dashboard/RecentTransactions';
import { ExpenseChart } from '../components/Dashboard/ExpenseChart';
import BudgetGauge from '../components/Dashboard/BudgetGauge';
import '../styles/Dashboard.css';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getCategoryDetails = (category) => {
  const details = {
    Food: { icon: '🍔', gradient: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', color: '#10b981' },
    Transport: { icon: '🚗', gradient: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)', color: '#3b82f6' },
    Entertainment: { icon: '🎬', gradient: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)', color: '#f59e0b' },
    Shopping: { icon: '🛍️', gradient: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)', color: '#ef4444' },
    Bills: { icon: '📄', gradient: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)', color: '#8b5cf6' },
    Healthcare: { icon: '🏥', gradient: 'linear-gradient(90deg, #ec4899 0%, #f472b6 100%)', color: '#ec4899' },
    Education: { icon: '📚', gradient: 'linear-gradient(90deg, #06b6d4 0%, #22d3ee 100%)', color: '#06b6d4' },
    Other: { icon: '📦', gradient: 'linear-gradient(90deg, #6b7280 0%, #9ca3af 100%)', color: '#6b7280' },
  };
  return details[category] || { icon: '📦', gradient: 'linear-gradient(90deg, #6b7280 0%, #9ca3af 100%)', color: '#6b7280' };
};

/**
 * Build chart data object for a list of {label, income, expenses} points.
 * Handles year-boundary correctly since labels and data are built together.
 */
function buildChartData(points) {
  return {
    labels: points.map((p) => p.label),
    income: points.map((p) => p.income),
    expenses: points.map((p) => p.expenses),
  };
}

/**
 * Aggregate transactions into monthly buckets for a given year.
 * Returns 12 data points (Jan–Dec).
 */
function aggregateByYear(transactions, year) {
  const points = MONTH_NAMES.map((label) => ({ label, income: 0, expenses: 0 }));
  transactions.forEach((t) => {
    const d = new Date(t.date);
    if (d.getFullYear() !== year) return;
    const idx = d.getMonth();
    const amt = Number(t.amount) || 0;
    if (t.type === 'income') points[idx].income += amt;
    else if (t.type === 'expense') points[idx].expenses += amt;
  });
  return points;
}

/**
 * Calculate chart data based on the selected period.
 * Correctly handles year boundaries for "Last 6 Months" and "All Time".
 */
function calculateChartData(transactions, period) {
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth(); // 0-indexed

  switch (period) {
    case 'this-month': {
      // Daily buckets for the current month
      const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
      const points = Array.from({ length: daysInMonth }, (_, i) => ({
        label: String(i + 1),
        income: 0,
        expenses: 0,
      }));
      transactions.forEach((t) => {
        const d = new Date(t.date);
        if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) {
          const day = d.getDate() - 1; // 0-indexed
          const amt = Number(t.amount) || 0;
          if (t.type === 'income') points[day].income += amt;
          else if (t.type === 'expense') points[day].expenses += amt;
        }
      });
      return buildChartData(points);
    }

    case 'last-6-months': {
      // 6 months going backwards from current month, crossing year boundary correctly
      const points = [];
      for (let i = 5; i >= 0; i--) {
        // Subtract i months from current date
        let m = thisMonth - i;
        let y = thisYear;
        if (m < 0) {
          m += 12;
          y -= 1;
        }
        points.push({ label: `${MONTH_NAMES[m]} '${String(y).slice(-2)}`, income: 0, expenses: 0, month: m, year: y });
      }
      transactions.forEach((t) => {
        const d = new Date(t.date);
        const tYear = d.getFullYear();
        const tMonth = d.getMonth();
        const pt = points.find((p) => p.month === tMonth && p.year === tYear);
        if (!pt) return;
        const amt = Number(t.amount) || 0;
        if (t.type === 'income') pt.income += amt;
        else if (t.type === 'expense') pt.expenses += amt;
      });
      return buildChartData(points);
    }

    case 'this-year':
      return buildChartData(aggregateByYear(transactions, thisYear));

    case 'last-year':
      return buildChartData(aggregateByYear(transactions, thisYear - 1));

    case 'all-time': {
      // Find earliest transaction and create monthly buckets from there to now
      if (!transactions.length) return buildChartData([]);
      const earliest = new Date(Math.min(...transactions.map((t) => new Date(t.date))));
      const points = [];
      let y = earliest.getFullYear();
      let m = earliest.getMonth();
      // Build month array from earliest to current month (inclusive), respecting year boundaries
      while (y < thisYear || (y === thisYear && m <= thisMonth)) {
        points.push({ label: `${MONTH_NAMES[m]} '${String(y).slice(-2)}`, income: 0, expenses: 0, month: m, year: y });
        m++;
        if (m > 11) { m = 0; y++; }
      }
      transactions.forEach((t) => {
        const d = new Date(t.date);
        const pt = points.find((p) => p.month === d.getMonth() && p.year === d.getFullYear());
        if (!pt) return;
        const amt = Number(t.amount) || 0;
        if (t.type === 'income') pt.income += amt;
        else if (t.type === 'expense') pt.expenses += amt;
      });
      return buildChartData(points);
    }

    default:
      return buildChartData(aggregateByYear(transactions, thisYear));
  }
}

// ─── Inline SVG Quick Action Icons ────────────────────────────────────────────
const IncomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20m0-20l-3 3m3-3l3 3" />
    <rect x="2" y="10" width="20" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ExpenseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V4m0 18l3-3m-3 3l-3-3" />
    <rect x="2" y="4" width="20" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ReportsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l4-5 4 3 4-6" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);
// ──────────────────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allTransactions, setAllTransactions] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyBudget: Number(localStorage.getItem('monthlyBudget')) || 35000,
  });
  const [spendingByCategory, setSpendingByCategory] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('this-year');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const txRes = await api.get('/transactions');
        const transactions = txRes.data || [];
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        setAllTransactions(transactions);
        setRecentTransactions(transactions.slice(0, 5));

        const totalIncome = transactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const totalExpenses = transactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        setStats({
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
          monthlyBudget: Number(localStorage.getItem('monthlyBudget')) || 35000,
        });

        const categoryMap = new Map();
        transactions
          .filter((t) => t.type === 'expense')
          .forEach((t) => {
            if (!t.category) return;
            categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + (Number(t.amount) || 0));
          });
        setSpendingByCategory(
          Array.from(categoryMap.entries())
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount)
        );
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchDashboardData();
  }, []);

  const chartData = calculateChartData(allTransactions, chartPeriod);

  return (
    <div className="dashboard">
      <div className="dashboard-welcome">
        <h2>Welcome back, {user?.name || 'User'}! 👋</h2>
        <p className="welcome-subtitle">Here's what's happening with your finances today.</p>
      </div>

      <div className="dashboard-main">
        {/* Stats Cards */}
        <div className="stats-grid">
          <StatsCard type="income" title="Total Income" value={stats.totalIncome} />
          <StatsCard type="expense" title="Total Expenses" value={stats.totalExpenses} />
          <StatsCard type="balance" title="Current Balance" value={stats.balance} />
          <StatsCard type="budget" title="Monthly Budget" value={stats.monthlyBudget} />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <button onClick={() => navigate('/income/add')} className="quick-action-btn income-action">
              <div className="action-icon income-icon"><IncomeIcon /></div>
              <span className="action-text">Add Income</span>
            </button>

            <button onClick={() => navigate('/expenses/add')} className="quick-action-btn expense-action">
              <div className="action-icon expense-icon"><ExpenseIcon /></div>
              <span className="action-text">Add Expense</span>
            </button>

            <button onClick={() => navigate('/reports')} className="quick-action-btn">
              <div className="action-icon reports-icon"><ReportsIcon /></div>
              <span className="action-text">View Reports</span>
            </button>

            <button onClick={() => navigate('/settings')} className="quick-action-btn">
              <div className="action-icon settings-icon"><SettingsIcon /></div>
              <span className="action-text">Settings</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-content-grid">
          {/* Chart Section */}
          <div className="spending-overview">
            <div className="section-header">
              <h2 className="section-title">Expense Overview</h2>
            </div>
            <ExpenseChart
              data={chartData}
              selectedPeriod={chartPeriod}
              onPeriodChange={setChartPeriod}
            />
          </div>

          {/* Recent Transactions */}
          <div className="recent-transactions">
            <div className="section-header">
              <h2 className="section-title">Recent Transactions</h2>
              <button className="btn-link" onClick={() => navigate('/transactions')}>View All</button>
            </div>
            <RecentTransactions transactions={recentTransactions} />
          </div>
        </div>

        {/* 50-30-20 Budget Gauge */}
        <div className="dashboard-gauge-row">
          <BudgetGauge transactions={allTransactions} />
        </div>

        {/* Spending by Category */}
        <div className="spending-overview">
          <div className="section-header">
            <h2 className="section-title">Spending by Category</h2>
            <button className="btn-link" onClick={() => navigate('/reports')}>View All</button>
          </div>

          {spendingByCategory && spendingByCategory.length > 0 ? (
            <div className="spending-grid">
              {spendingByCategory.map((item) => {
                const { icon, gradient, color } = getCategoryDetails(item.category);
                const percentage = stats.totalExpenses > 0
                  ? (item.amount / stats.totalExpenses) * 100
                  : 0;
                return (
                  <div key={item.category} className="spending-card">
                    <div className="spending-card-header">
                      <div className="spending-card-title">
                        <span className="category-emoji" style={{ backgroundColor: `${color}15`, color }}>
                          {icon}
                        </span>
                        <span className="category-name">{item.category}</span>
                      </div>
                      <span className="category-percent">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="spending-card-amount">₹{Number(item.amount).toLocaleString('en-IN')}</div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${percentage}%`,
                          background: gradient,
                          boxShadow: `0 2px 6px ${color}30`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p className="empty-text">No spending data yet</p>
              <button
                onClick={() => navigate('/expenses/add')}
                className="btn btn-primary"
                style={{ marginTop: '1rem' }}
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
