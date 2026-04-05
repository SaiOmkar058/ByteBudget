import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from '../components/Auth/AuthLayout';
import '../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (error) setError('');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      // Success: Immediate redirect without toast
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-header">
        <h1 className="auth-title">
          <span className="emoji">💰</span>
          ByteBudget
        </h1>
        <h2 className="auth-subtitle">Log in to your account</h2>
      </div>

      {error && (
        <div className="auth-alert error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" autoComplete="on">
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="name@company.com"
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <button id="submit-login" name="submit-login" type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="auth-link">
        Don't have an account? <Link to="/register">Create one for free</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
