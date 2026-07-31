import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const ExpenseChart = ({ data, selectedPeriod, onPeriodChange }) => {
  const chartData = {
    labels: data?.labels || [],
    datasets: [
      {
        label: 'Income',
        data: data?.income || [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Expenses',
        data: data?.expenses || [],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: '500' },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#6B7280',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { drawBorder: false, color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: function (value) {
            return '₹' + value.toLocaleString('en-IN');
          },
          font: { size: 11 },
        },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
    animation: { duration: 1000, easing: 'easeInOutQuart' },
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Income vs Expenses</h3>
        <select
          className="chart-period-selector"
          value={selectedPeriod}
          onChange={(e) => onPeriodChange(e.target.value)}
        >
          <option value="this-month">This Month</option>
          <option value="last-6-months">Last 6 Months</option>
          <option value="this-year">This Year</option>
          <option value="last-year">Last Year</option>
          <option value="all-time">All Time</option>
        </select>
      </div>
      <div className="chart-wrapper">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
