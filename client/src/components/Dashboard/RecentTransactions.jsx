import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { formatCurrency } from '../../utils/currency';

export const RecentTransactions = ({ transactions = [], currency = 'INR' }) => {
  const navigate = useNavigate();

  if (transactions.length === 0) {
    return (
      <div className="recent-transactions">
        <div className="section-header">
          <h3 className="section-title">Recent Transactions</h3>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p className="empty-text">No recent transactions found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-transactions">
      <div className="section-header">
        <h3 className="section-title">Recent Transactions</h3>
        <button className="btn-link" onClick={() => navigate('/transactions')}>View All →</button>
      </div>
      <div className="transactions-list">
        {transactions.map((transaction) => {
          const capitalizedDescription = transaction.description
            ? transaction.description.charAt(0).toUpperCase() + transaction.description.slice(1)
            : transaction.category || 'Transaction';

          const formattedDate = new Date(transaction.date).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          const isIncome = transaction.type === 'income';

          return (
            <div key={transaction._id || transaction.id} className="transaction-item">
              <div
                className="transaction-icon"
                style={{
                  background: isIncome
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)'
                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.3) 100%)',
                  borderColor: isIncome ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                  color: isIncome ? '#10b981' : '#ef4444',
                }}
              >
                {isIncome ? <FiArrowDownRight size={20} /> : <FiArrowUpRight size={20} />}
              </div>
              <div className="transaction-details">
                <p className="transaction-description">{capitalizedDescription}</p>
                <div className="transaction-meta">
                  <span className="transaction-category">
                    {transaction.category}
                    {transaction.subcategory ? ` • ${transaction.subcategory}` : ''}
                  </span>
                  <span>•</span>
                  <span>{formattedDate}</span>
                </div>
              </div>
              <span className={`transaction-amount ${isIncome ? 'income' : 'expense'}`}>
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentTransactions;
