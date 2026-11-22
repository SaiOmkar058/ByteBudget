import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';
import {
  getCategoryColor,
  normalizeCategory,
  isInvestmentCategory,
  isEarnedIncome,
} from '../utils/categories';
import '../styles/Reports.css';

const Reports = () => {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    savingsRate: 0,
    investmentsTotal: 0,
    earnedIncomeTotal: 0,
    inflowAdjustmentsTotal: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const txRes = await api.get('/transactions');
        const transactions = txRes.data || [];

        // Calculate stats and classifications
        let totalIncome = 0;
        let totalExpenses = 0;
        let totalInvestments = 0;
        let totalEarnedIncome = 0;
        let totalInflowAdjustments = 0;

        // Category breakdown (expenses only)
        const categoryTotals = {};
        let totalExpenseForPercent = 0;

        transactions.forEach(t => {
          const amt = Number(t.amount) || 0;
          if (t.type === 'income') {
            totalIncome += amt;
            if (isEarnedIncome(t.category)) {
              totalEarnedIncome += amt;
            } else {
              totalInflowAdjustments += amt;
            }
          } else if (t.type === 'expense') {
            totalExpenses += amt;
            if (isInvestmentCategory(t.category, t.subcategory) || t.budgetCategory === 'Savings/Investment') {
              totalInvestments += amt;
            }
            if (t.category) {
              const norm = normalizeCategory(t.category, 'expense');
              categoryTotals[norm] = (categoryTotals[norm] || 0) + amt;
              totalExpenseForPercent += amt;
            }
          }
        });

        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;
        setStats({
          totalIncome,
          totalExpenses,
          balance,
          savingsRate,
          investmentsTotal: totalInvestments,
          earnedIncomeTotal: totalEarnedIncome,
          inflowAdjustmentsTotal: totalInflowAdjustments,
        });

        // Monthly trend (group by month)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyMap = {};
        transactions.forEach(t => {
          const d = new Date(t.date);
          const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
          if (!monthlyMap[key]) monthlyMap[key] = { month: key, income: 0, expenses: 0 };
          if (t.type === 'income') monthlyMap[key].income += Number(t.amount) || 0;
          else monthlyMap[key].expenses += Number(t.amount) || 0;
        });
        // Present the six most recent months in chronological order.
        const sortedMonths = Object.values(monthlyMap)
          .sort((a, b) => {
            const [ma, ya] = a.month.split(' ');
            const [mb, yb] = b.month.split(' ');
            return new Date(`${ma} 1, ${ya}`) - new Date(`${mb} 1, ${yb}`);
          })
          .slice(-6);
        setMonthlyData(sortedMonths);

        const categoryArr = Object.entries(categoryTotals)
          .map(([category, amount]) => ({
            category,
            amount,
            percentage: totalExpenseForPercent ? Math.round((amount / totalExpenseForPercent) * 100) : 0
          }))
          .sort((a, b) => b.amount - a.amount);
        setCategoryData(categoryArr);
      } catch {
        toast.error('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  return (
    <div className="reports-page">

      <main className="reports-main">
        <div className="reports-container">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card income-summary">
              <div className="summary-icon">📈</div>
              <div className="summary-content">
                <p className="summary-label">Total Income</p>
                <h2 className="summary-value">{formatCurrency(stats.totalIncome)}</h2>
                <p className="summary-change">All recorded income</p>
              </div>
            </div>

            <div className="summary-card expense-summary">
              <div className="summary-icon">📉</div>
              <div className="summary-content">
                <p className="summary-label">Total Expenses</p>
                <h2 className="summary-value">{formatCurrency(stats.totalExpenses)}</h2>
                <p className="summary-change">All recorded expenses</p>
              </div>
            </div>

            <div className="summary-card balance-summary">
              <div className="summary-icon">💵</div>
              <div className="summary-content">
                <p className="summary-label">Net Balance</p>
                <h2 className="summary-value">{formatCurrency(stats.balance)}</h2>
                <p className="summary-change">Income minus expenses</p>
              </div>
            </div>

            <div className="summary-card savings-summary">
              <div className="summary-icon">🎯</div>
              <div className="summary-content">
                <p className="summary-label">Savings Rate</p>
                <h2 className="summary-value">{stats.savingsRate}%</h2>
                <p className="summary-change">Of total income</p>
              </div>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Monthly Income vs Expenses</h3>
            <div className="bar-chart">
              {loading ? (
                <div className="empty-state"><p className="empty-text">Loading...</p></div>
              ) : monthlyData.length === 0 ? (
                <div className="empty-state"><p className="empty-text">No data</p></div>
              ) : monthlyData.map((month, index) => {
                const maxValue = Math.max(...monthlyData.map(m => Math.max(m.income, m.expenses)), 1);
                const incomeHeight = (month.income / maxValue) * 100;
                const expenseHeight = (month.expenses / maxValue) * 100;
                return (
                  <div key={index} className="bar-group">
                    <div className="bars">
                      <div 
                        className="bar income-bar" 
                        style={{ height: `${incomeHeight}%` }}
                        title={`Income: ${formatCurrency(month.income)}`}
                      ></div>
                      <div 
                        className="bar expense-bar" 
                        style={{ height: `${expenseHeight}%` }}
                        title={`Expenses: ${formatCurrency(month.expenses)}`}
                      ></div>
                    </div>
                    <p className="bar-label">{month.month}</p>
                  </div>
                );
              })}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color income-color"></span>
                <span>Income</span>
              </div>
              <div className="legend-item">
                <span className="legend-color expense-color"></span>
                <span>Expenses</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="chart-card">
            <h3 className="chart-title">Expense Breakdown by Category</h3>
            <div className="category-chart">
              {loading ? (
                <div className="empty-state"><p className="empty-text">Loading...</p></div>
              ) : categoryData.length === 0 ? (
                <div className="empty-state"><p className="empty-text">No data</p></div>
              ) : categoryData.map((item, index) => (
                <div key={index} className="category-row">
                  <div className="category-info">
                    <div className="category-name-row">
                      <span className="category-name">{item.category}</span>
                      <span className="category-amount">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: getCategoryColor(item.category)
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="category-percentage">{item.percentage}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="insights-card">
            <h3 className="insights-title">💡 Financial Insights</h3>
            <div className="insights-list">
              {/* Dynamic: Investments & Savings Outflow */}
              {stats.investmentsTotal > 0 && (
                <div className="insight-item info-insight">
                  <span className="insight-icon">📈</span>
                  <div className="insight-content">
                    <p className="insight-text">
                      Investment & Savings Outflows: {formatCurrency(stats.investmentsTotal)}
                    </p>
                    <p className="insight-subtext">
                      {stats.totalExpenses > 0 ? Math.round((stats.investmentsTotal / stats.totalExpenses) * 100) : 0}% of outflows dedicated to wealth creation (separated from consumption spending)
                    </p>
                  </div>
                </div>
              )}
              {/* Dynamic: Inflow Breakdown */}
              {stats.inflowAdjustmentsTotal > 0 && (
                <div className="insight-item neutral-insight">
                  <span className="insight-icon">💳</span>
                  <div className="insight-content">
                    <p className="insight-text">
                      Refunds & Adjustments: {formatCurrency(stats.inflowAdjustmentsTotal)}
                    </p>
                    <p className="insight-subtext">
                      Distinguished from regular earned income of {formatCurrency(stats.earnedIncomeTotal)}
                    </p>
                  </div>
                </div>
              )}
              {/* Dynamic: Savings Rate */}
              {stats.savingsRate > 25 && (
                <div className="insight-item positive-insight">
                  <span className="insight-icon">✅</span>
                  <div className="insight-content">
                    <p className="insight-text">Great job! Your savings rate is above 25%</p>
                    <p className="insight-subtext">Recorded balance: {formatCurrency(stats.balance)}</p>
                  </div>
                </div>
              )}
              {stats.savingsRate <= 25 && stats.savingsRate > 0 && (
                <div className="insight-item warning-insight">
                  <span className="insight-icon">⚠️</span>
                  <div className="insight-content">
                    <p className="insight-text">Your savings rate is below 25%</p>
                    <p className="insight-subtext">Try to increase your savings for better financial health</p>
                  </div>
                </div>
              )}
              {/* Dynamic: Top Expense Category */}
              {categoryData.length > 0 && (
                <div className="insight-item warning-insight">
                  <span className="insight-icon">⚠️</span>
                  <div className="insight-content">
                    <p className="insight-text">Highest spending: {categoryData[0].category}</p>
                    <p className="insight-subtext">{categoryData[0].percentage}% of total expenses - consider reviewing this category</p>
                  </div>
                </div>
              )}
              {/* Dynamic: Income/Expense Trend */}
              {monthlyData.length > 1 && (() => {
                const last = monthlyData[monthlyData.length - 1];
                const prev = monthlyData[monthlyData.length - 2];
                const incomeChange = prev.income ? Math.round(((last.income - prev.income) / prev.income) * 100) : 0;
                const expenseChange = prev.expenses ? Math.round(((last.expenses - prev.expenses) / prev.expenses) * 100) : 0;
                return (
                  <>
                    <div className={`insight-item ${incomeChange > 0 ? 'info-insight' : 'neutral-insight'}`}>
                      <span className="insight-icon">💡</span>
                      <div className="insight-content">
                        <p className="insight-text">Your income {incomeChange >= 0 ? 'increased' : 'decreased'} by {Math.abs(incomeChange)}% this month</p>
                        <p className="insight-subtext">{incomeChange >= 0 ? 'Keep up the excellent work!' : 'Review your income sources.'}</p>
                      </div>
                    </div>
                    <div className={`insight-item ${expenseChange > 0 ? 'warning-insight' : 'positive-insight'}`}>
                      <span className="insight-icon">{expenseChange > 0 ? '⚠️' : '✅'}</span>
                      <div className="insight-content">
                        <p className="insight-text">Your expenses {expenseChange >= 0 ? 'increased' : 'decreased'} by {Math.abs(expenseChange)}% this month</p>
                        <p className="insight-subtext">{expenseChange >= 0 ? 'Try to control your spending.' : 'Good job on reducing expenses!'}</p>
                      </div>
                    </div>
                  </>
                );
              })()}
              {/* Dynamic: Entertainment spending stable */}
              {categoryData.find(c => c.category.toLowerCase().includes('entertainment')) && (
                <div className="insight-item neutral-insight">
                  <span className="insight-icon">📊</span>
                  <div className="insight-content">
                    <p className="insight-text">Entertainment spending is {(() => {
                      const ent = categoryData.find(c => c.category.toLowerCase().includes('entertainment'));
                      return ent && ent.percentage < 20 ? 'well balanced' : 'high';
                    })()}</p>
                    <p className="insight-subtext">{(() => {
                      const ent = categoryData.find(c => c.category.toLowerCase().includes('entertainment'));
                      return ent ? `${ent.percentage}% of expenses` : '';
                    })()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
