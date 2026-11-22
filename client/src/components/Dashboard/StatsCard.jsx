import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiCreditCard, FiTarget } from 'react-icons/fi';
import { formatCurrency } from '../../utils/currency';

const TYPE_CONFIG = {
  income: {
    icon: <FiTrendingUp size={32} color="#10b981" />,
    badgeClass: 'income-badge',
  },
  expense: {
    icon: <FiTrendingDown size={32} color="#ef4444" />,
    badgeClass: 'expense-badge',
  },
  balance: {
    icon: <FiCreditCard size={32} color="#3b82f6" />,
    badgeClass: 'balance-badge',
  },
  budget: {
    icon: <FiTarget size={32} color="#f59e0b" />,
    badgeClass: 'budget-badge',
  },
};

export const StatsCard = ({ type = 'income', title, value = 0, currency = 'INR', change }) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.income;
  const formattedValue = formatCurrency(value, currency);

  return (
    <div className={`stat-card ${type}-card`}>
      <div className="stat-icon">
        {config.icon}
      </div>
      <div className="stat-content">
        <p className="stat-label">{title}</p>
        <h3 className="stat-value">{formattedValue}</h3>
        {change !== undefined && (
          <div className="stat-change">
            <span className={change >= 0 ? 'positive-change' : 'negative-change'}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
            </span>
            <span>vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
