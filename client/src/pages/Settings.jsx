import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { CURRENCY_CONFIG, formatCurrency } from '../utils/currency';
import '../styles/Settings.css';

const Settings = () => {
  const { user, updateUser, updatePreferences } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Security Settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Budget & Preferences Settings
  const [budgetSettings, setBudgetSettings] = useState({
    monthlyBudget: String(user?.preferences?.monthlyBudget ?? localStorage.getItem('monthlyBudget') ?? 35000),
    savingsGoal: String(user?.preferences?.savingsGoal ?? localStorage.getItem('savingsGoal') ?? 10000),
    currency: user?.preferences?.currency || localStorage.getItem('currency') || 'INR',
  });

  // Telegram Bot Settings
  const [telegramStatus, setTelegramStatus] = useState({
    isLinked: false,
    telegramChatId: null,
    botUsername: 'ByteBudget_ExpenseBot',
  });
  const [linkingCode, setLinkingCode] = useState(null);
  const [codeExpiresAt, setCodeExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadingTelegram, setLoadingTelegram] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTelegramStatus();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
      });
      if (user.preferences) {
        setBudgetSettings({
          monthlyBudget: String(user.preferences.monthlyBudget ?? 35000),
          savingsGoal: String(user.preferences.savingsGoal ?? 10000),
          currency: user.preferences.currency || 'INR',
        });
      }
    }
  }, [user]);

  const fetchTelegramStatus = async () => {
    try {
      const res = await api.get('/auth/telegram/status');
      setTelegramStatus(res.data);
    } catch {
      // ignore
    }
  };

  // Countdown timer for linking code
  useEffect(() => {
    if (!codeExpiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((codeExpiresAt - new Date()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setLinkingCode(null);
        setCodeExpiresAt(null);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [codeExpiresAt]);

  // Poll for link completion when a code is active
  useEffect(() => {
    if (!linkingCode || telegramStatus.isLinked) return;
    const pollInterval = setInterval(async () => {
      try {
        const res = await api.get('/auth/telegram/status');
        if (res.data?.isLinked) {
          setTelegramStatus(res.data);
          setLinkingCode(null);
          setCodeExpiresAt(null);
          toast.success('🎉 Telegram account linked successfully!');
        }
      } catch {
        // ignore
      }
    }, 3000);
    return () => clearInterval(pollInterval);
  }, [linkingCode, telegramStatus.isLinked]);

  const handleGenerateLinkCode = async () => {
    setLoadingTelegram(true);
    try {
      const res = await api.post('/auth/telegram/link-code');
      setLinkingCode(res.data.code);
      setCodeExpiresAt(new Date(res.data.expiresAt));
      setTimeLeft(res.data.expiresInSeconds || 300);
      setCopied(false);
      toast.success('New linking code generated! Valid for 5 minutes.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate linking code');
    } finally {
      setLoadingTelegram(false);
    }
  };

  const handleCopyCode = () => {
    if (!linkingCode) return;
    navigator.clipboard.writeText(`/link ${linkingCode}`);
    setCopied(true);
    toast.info('Copied command `/link ' + linkingCode + '` to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleUnlinkTelegram = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Telegram account from ByteBudget?')) {
      return;
    }
    setLoadingTelegram(true);
    try {
      await api.post('/auth/telegram/unlink');
      setTelegramStatus({
        isLinked: false,
        telegramChatId: null,
        botUsername: 'ByteBudget_ExpenseBot',
      });
      setLinkingCode(null);
      toast.success('Telegram account disconnected.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disconnect Telegram');
    } finally {
      setLoadingTelegram(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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

  const handleBudgetChange = (e) => {
    const updated = {
      ...budgetSettings,
      [e.target.name]: e.target.value,
    };
    setBudgetSettings(updated);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/auth/profile', { name: profileData.name });
      updateUser(response.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    try {
      if (updatePreferences) {
        await updatePreferences({
          monthlyBudget: Number(budgetSettings.monthlyBudget),
          savingsGoal: Number(budgetSettings.savingsGoal),
          currency: budgetSettings.currency,
        });
      } else {
        localStorage.setItem('monthlyBudget', budgetSettings.monthlyBudget);
        localStorage.setItem('savingsGoal', budgetSettings.savingsGoal);
        localStorage.setItem('currency', budgetSettings.currency);
      }
      toast.success('Budget & Currency settings saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save budget settings');
    }
  };

  const parsedBudget = Number(budgetSettings.monthlyBudget) || 1;
  const parsedSavings = Number(budgetSettings.savingsGoal) || 0;
  const goalPercentage = ((parsedSavings / parsedBudget) * 100).toFixed(1);

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
              className={`tab ${activeTab === 'budget' ? 'active' : ''}`}
              onClick={() => setActiveTab('budget')}
            >
              <span className="tab-icon">💰</span>
              <span className="tab-text">Budget & Currency</span>
            </button>
            <button
              className={`tab ${activeTab === 'telegram' ? 'active' : ''}`}
              onClick={() => setActiveTab('telegram')}
            >
              <span className="tab-icon">🤖</span>
              <span className="tab-text">Telegram Bot</span>
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
                    <li>Use a strong, unique password with letters, numbers, and symbols</li>
                    <li>Never share your credentials with anyone</li>
                    <li>Change your password periodically</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Budget & Currency Tab */}
            {activeTab === 'budget' && (
              <div className="settings-section">
                <h2 className="section-title">Budget & Currency Configuration</h2>
                <form onSubmit={handleBudgetSubmit} className="settings-form">
                  <div className="form-group">
                    <label className="form-label">Default Currency</label>
                    <select
                      name="currency"
                      className="form-input"
                      value={budgetSettings.currency}
                      onChange={handleBudgetChange}
                    >
                      {Object.entries(CURRENCY_CONFIG).map(([code, config]) => (
                        <option key={code} value={code}>
                          {code} ({config.symbol}) — {config.name}
                        </option>
                      ))}
                    </select>
                    <p className="form-hint">Changes will reflect across your entire dashboard and reports</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Monthly Spending Limit</label>
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
                    <p className="form-hint">Set your target maximum spending each month</p>
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
                    <p className="form-hint">Target amount to set aside or invest each month</p>
                  </div>

                  <button id="save-budget" name="save-budget" type="submit" className="btn btn-primary">
                    Save Preferences
                  </button>
                </form>

                <div className="budget-preview">
                  <h3 className="preview-title">Current Budget Overview</h3>
                  <div className="preview-stats">
                    <div className="preview-stat">
                      <span className="stat-label">Monthly Limit:</span>
                      <span className="stat-value">{formatCurrency(budgetSettings.monthlyBudget, budgetSettings.currency)}</span>
                    </div>
                    <div className="preview-stat">
                      <span className="stat-label">Savings Goal:</span>
                      <span className="stat-value">{formatCurrency(budgetSettings.savingsGoal, budgetSettings.currency)}</span>
                    </div>
                    <div className="preview-stat">
                      <span className="stat-label">Goal Percentage:</span>
                      <span className="stat-value">{goalPercentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Telegram Bot Tab */}
            {activeTab === 'telegram' && (
              <div className="settings-section telegram-section">
                <div className="telegram-header">
                  <h2 className="section-title">Telegram Bot Integration</h2>
                  <span className={`status-pill ${telegramStatus.isLinked ? 'connected' : 'disconnected'}`}>
                    {telegramStatus.isLinked ? '✅ Connected' : '⚪ Not Linked'}
                  </span>
                </div>

                <p className="section-description">
                  Connect your Telegram account to log expenses, check your balance, and view recent transactions in real-time.
                </p>

                {telegramStatus.isLinked ? (
                  <div className="telegram-connected-card">
                    <div className="connected-info">
                      <div className="bot-avatar">🤖</div>
                      <div>
                        <h4 className="bot-title">ByteBudget Telegram Bot</h4>
                        <p className="bot-id">Linked Telegram ID: {telegramStatus.telegramChatId || 'Connected'}</p>
                        <a
                          href="https://t.me/ByteBudget_ExpenseBot"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bot-link"
                        >
                          Open @ByteBudget_ExpenseBot ↗
                        </a>
                      </div>
                    </div>

                    <div className="telegram-actions" style={{ marginTop: '1.25rem' }}>
                      <button
                        onClick={handleUnlinkTelegram}
                        className="btn btn-danger"
                        disabled={loadingTelegram}
                      >
                        Disconnect Telegram
                      </button>
                    </div>

                    <div className="telegram-instructions" style={{ marginTop: '1.5rem' }}>
                      <h4 className="instructions-title">Available Telegram Commands:</h4>
                      <ul className="commands-list">
                        <li><code>/balance</code> — Check your current net balance and totals</li>
                        <li><code>/recent</code> — View your 5 most recent transactions</li>
                        <li><code>Spent 150 on lunch</code> — Instantly add an expense</li>
                        <li><code>Paid 800 for electricity</code> — Add utility bill expense</li>
                        <li><code>Received 26000 salary</code> — Record income</li>
                        <li><code>Invested 1000 in SIP</code> — Record savings / investment</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="telegram-connect-card">
                    <div className="steps-container">
                      <div className="step-item">
                        <span className="step-num">1</span>
                        <div className="step-content">
                          <strong>Open the Telegram Bot:</strong>
                          <p>
                            Search for <a href="https://t.me/ByteBudget_ExpenseBot" target="_blank" rel="noopener noreferrer">@ByteBudget_ExpenseBot</a> in Telegram and tap <em>Start</em>.
                          </p>
                        </div>
                      </div>

                      <div className="step-item">
                        <span className="step-num">2</span>
                        <div className="step-content">
                          <strong>Generate a Secure Linking Code:</strong>
                          <p>Click below to generate a single-use code that is valid for 5 minutes.</p>
                        </div>
                      </div>

                      <div className="step-item">
                        <span className="step-num">3</span>
                        <div className="step-content">
                          <strong>Send Command to Bot:</strong>
                          <p>In Telegram, send: <code>/link YOUR_CODE</code></p>
                        </div>
                      </div>
                    </div>

                    {linkingCode ? (
                      <div className="code-display-box">
                        <span className="code-label">YOUR SINGLE-USE CODE:</span>
                        <div className="code-value-row">
                          <span className="code-value">{linkingCode}</span>
                          <button
                            type="button"
                            onClick={handleCopyCode}
                            className="btn btn-secondary btn-sm"
                          >
                            {copied ? '✓ Copied' : '📋 Copy /link'}
                          </button>
                        </div>
                        <div className="code-timer">
                          ⏱️ Code expires in: <strong className="timer-text">{formatTimer(timeLeft)}</strong>
                        </div>
                        <p className="code-hint">
                          Send <code>/link {linkingCode}</code> to <a href="https://t.me/ByteBudget_ExpenseBot" target="_blank" rel="noopener noreferrer">@ByteBudget_ExpenseBot</a>
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGenerateLinkCode}
                        className="btn btn-primary btn-generate"
                        disabled={loadingTelegram}
                      >
                        {loadingTelegram ? 'Generating...' : '⚡ Generate Linking Code'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
