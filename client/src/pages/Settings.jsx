import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import '../styles/Settings.css';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    currency: 'INR',
  });

  // Security Settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    budgetAlerts: true,
    monthlyReports: false,
    transactionAlerts: true,
  });

  // Budget Settings
  const [budgetSettings, setBudgetSettings] = useState({
    monthlyBudget: '35000',
    savingsGoal: '10000',
    currency: 'INR',
  });

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNotificationToggle = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key],
    });
  };

  const handleBudgetChange = (e) => {
    const updated = {
      ...budgetSettings,
      [e.target.name]: e.target.value,
    };
    setBudgetSettings(updated);
    // Save to localStorage for Dashboard sync
    localStorage.setItem('monthlyBudget', updated.monthlyBudget);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    toast.success('Password updated successfully!');
  };

  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('monthlyBudget', budgetSettings.monthlyBudget);
    localStorage.setItem('savingsGoal', budgetSettings.savingsGoal);
    toast.success('Budget settings saved!');
  };

  return (
    <div className="settings-page">

      <main className="settings-main">
        <div className="settings-container">
          {/* Tabs */}
          <div className="settings-tabs">
            <button
              className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="tab-icon">👤</span>
              <span className="tab-text">Profile</span>
            </button>
            <button
              className={`tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <span className="tab-icon">🔒</span>
              <span className="tab-text">Security</span>
            </button>
            <button
              className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <span className="tab-icon">🔔</span>
              <span className="tab-text">Notifications</span>
            </button>
            <button
              className={`tab ${activeTab === 'budget' ? 'active' : ''}`}
              onClick={() => setActiveTab('budget')}
            >
              <span className="tab-icon">💰</span>
              <span className="tab-text">Budget</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="settings-content">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="settings-section">
                <h2 className="section-title">Profile Information</h2>
                <form onSubmit={handleProfileSubmit} className="settings-form">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                      disabled
                    />
                    <p className="form-hint">Email cannot be changed</p>
                  </div>


                  <div className="form-group">
                    <label className="form-label">Preferred Currency</label>
                    <select
                      name="currency"
                      className="form-input"
                      value={profileData.currency}
                      onChange={handleProfileChange}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <button id="save-profile" name="save-profile" type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="settings-section">
                <h2 className="section-title">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="settings-form">
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      className="form-input"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      className="form-input"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                      placeholder="Enter new password"
                    />
                    <p className="form-hint">Must be at least 6 characters</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-input"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button id="save-password" name="save-password" type="submit" className="btn btn-primary">
                    Update Password
                  </button>
                </form>

                <div className="security-info">
                  <h3 className="info-title">🔒 Security Tips</h3>
                  <ul className="info-list">
                    <li>Use a strong, unique password</li>
                    <li>Enable two-factor authentication (coming soon)</li>
                    <li>Never share your password with anyone</li>
                    <li>Change your password regularly</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h2 className="section-title">Notification Preferences</h2>
                <div className="notification-settings">
                  <div className="notification-item">
                    <div className="notification-info">
                      <h4 className="notification-title">Email Notifications</h4>
                      <p className="notification-description">
                        Receive email updates about your account
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.emailNotifications}
                        onChange={() => handleNotificationToggle('emailNotifications')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <h4 className="notification-title">Budget Alerts</h4>
                      <p className="notification-description">
                        Get notified when you're close to your budget limit
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.budgetAlerts}
                        onChange={() => handleNotificationToggle('budgetAlerts')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <h4 className="notification-title">Monthly Reports</h4>
                      <p className="notification-description">
                        Receive monthly financial summary via email
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.monthlyReports}
                        onChange={() => handleNotificationToggle('monthlyReports')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <h4 className="notification-title">Transaction Alerts</h4>
                      <p className="notification-description">
                        Get notified for each transaction you add
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.transactionAlerts}
                        onChange={() => handleNotificationToggle('transactionAlerts')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Budget Tab */}
            {activeTab === 'budget' && (
              <div className="settings-section">
                <h2 className="section-title">Budget Configuration</h2>
                <form onSubmit={handleBudgetSubmit} className="settings-form">
                  <div className="form-group">
                    <label className="form-label">Monthly Budget Limit</label>
                    <input
                      type="number"
                      name="monthlyBudget"
                      className="form-input"
                      value={budgetSettings.monthlyBudget}
                      onChange={handleBudgetChange}
                      required
                      min="0"
                      placeholder="35000"
                    />
                    <p className="form-hint">Set your monthly spending limit</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Monthly Savings Goal</label>
                    <input
                      type="number"
                      name="savingsGoal"
                      className="form-input"
                      value={budgetSettings.savingsGoal}
                      onChange={handleBudgetChange}
                      required
                      min="0"
                      placeholder="10000"
                    />
                    <p className="form-hint">Target amount to save each month</p>
                  </div>

                  <button id="save-budget" name="save-budget" type="submit" className="btn btn-primary">
                    Save Budget Settings
                  </button>
                </form>

                <div className="budget-preview">
                  <h3 className="preview-title">Current Budget Overview</h3>
                  <div className="preview-stats">
                    <div className="preview-stat">
                      <span className="stat-label">Monthly Limit:</span>
                      <span className="stat-value">₹{parseInt(budgetSettings.monthlyBudget).toLocaleString()}</span>
                    </div>
                    <div className="preview-stat">
                      <span className="stat-label">Savings Goal:</span>
                      <span className="stat-value">₹{parseInt(budgetSettings.savingsGoal).toLocaleString()}</span>
                    </div>
                    <div className="preview-stat">
                      <span className="stat-label">Goal Percentage:</span>
                      <span className="stat-value">
                        {((parseInt(budgetSettings.savingsGoal) / parseInt(budgetSettings.monthlyBudget)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
