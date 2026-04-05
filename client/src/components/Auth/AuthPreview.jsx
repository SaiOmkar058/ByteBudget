import React from 'react';
import '../../styles/Auth.css';

const AuthPreview = () => {
  return (
    <div className="auth-preview">
      <div className="preview-content">
        <div className="preview-header">
          <h1>Take Control of Your Expenses</h1>
          <p>Track spending, set budgets, and make smarter financial decisions.</p>
        </div>

        <div className="mock-dashboard-container">
          <div className="mock-dashboard">
            {/* Mock Stats Cards */}
            <div className="mock-grid">
              <div className="mock-card">
                <span className="mock-label">Balance</span>
                <span className="mock-value">$4,250</span>
                <div className="mock-trend positive">+12%</div>
              </div>
              <div className="mock-card">
                <span className="mock-label">Budget</span>
                <span className="mock-value">$2,000</span>
                <div className="mock-progress-container">
                  <div className="mock-progress-bar" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>

            {/* Mock Chart Area */}
            <div className="mock-card mock-chart-card">
              <div className="mock-chart">
                <div className="chart-bar" style={{ height: '40%' }}></div>
                <div className="chart-bar" style={{ height: '70%' }}></div>
                <div className="chart-bar" style={{ height: '55%' }}></div>
                <div className="chart-bar active" style={{ height: '90%' }}></div>
                <div className="chart-bar" style={{ height: '65%' }}></div>
                <div className="chart-bar" style={{ height: '80%' }}></div>
                <div className="chart-bar" style={{ height: '50%' }}></div>
              </div>
            </div>

            {/* Mock Transactions */}
            <div className="mock-card">
              <div className="mock-transaction">
                <div className="tx-icon">🛒</div>
                <div className="tx-info">
                  <span className="tx-name">Groceries</span>
                  <span className="tx-date">Today</span>
                </div>
                <span className="tx-amount negative">-$84</span>
              </div>
            </div>
          </div>
        </div>

        <div className="preview-footer">
          <span className="feature-pill">✨ Visualize</span>
          <span className="feature-pill">🎯 Budgets</span>
          <span className="feature-pill">🛡️ Secure</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPreview;
