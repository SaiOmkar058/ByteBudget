import React from 'react';

export const StatsCard = ({ title, value, change }) => {
  // Format the value with commas as thousand separators
  const formattedValue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value).replace('₹', '₹ ');

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{formattedValue}</h3>
      </div>
      {change !== undefined && (
        <div className={`mt-3 text-sm font-medium flex items-center ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change >= 0 ? (
            <span className="bg-green-100 px-2 py-0.5 rounded-full text-green-600 text-xs mr-1">
              ↑ {Math.abs(change)}%
            </span>
          ) : (
            <span className="bg-red-100 px-2 py-0.5 rounded-full text-red-600 text-xs mr-1">
              ↓ {Math.abs(change)}%
            </span>
          )}
          <span className="text-gray-500 text-xs">vs last month</span>
        </div>
      )}
    </div>
  );
};

