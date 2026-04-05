import React from 'react';
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';

export const RecentTransactions = ({ transactions = [] }) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <p className="text-gray-500 text-center py-8">No recent transactions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        {transactions.map((transaction) => {
          const capitalizedDescription = transaction.description ? 
            transaction.description.charAt(0).toUpperCase() + transaction.description.slice(1) : 
            'No description';
          
          const formattedDate = new Date(transaction.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });

          return (
            <div key={transaction._id || transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'income' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
                }`}>
                  {transaction.type === 'income' ? <FiArrowDownRight size={18} /> : <FiArrowUpRight size={18} />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{capitalizedDescription}</p>
                  <p className="text-sm text-gray-500">{transaction.category} • {formattedDate}</p>
                </div>
              </div>
              <span className={`font-medium ${
                transaction.type === 'income' ? 'text-green-600' : 'text-gray-900'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString()}
              </span>
            </div>
          );
        })}
    </div>
  );
};

