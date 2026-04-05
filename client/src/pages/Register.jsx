import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from '../components/Auth/AuthLayout';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (status.message) setStatus({ type: '', message: '' });
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    if (formData.password.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await register(formData.name, formData.email, formData.password);
      setStatus({ 
        type: 'success', 
        message: 'Account created successfully! Redirecting to login...' 
      });
      // Delay redirect to allow user to see success message
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Registration failed. Please try again.' 
      });
    } finally {
      // Don't set loading false on success to prevent button flicker during redirect
      if (!error) setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-header">
        <h1 className="auth-title">
          <span className="emoji">💰</span>
          ByteBudget
        </h1>
        <h2 className="auth-subtitle">Create your free account</h2>
      </div>

      {status.message && (
        <div className={`auth-alert ${status.type}`}>
          <span className="alert-icon">
            {status.type === 'success' ? '✅' : '⚠️'}
          </span>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="John Doe"
          />
        </div>

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
            minLength="6"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="form-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />
        </div>

        <button id="submit-register" name="submit-register" type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="auth-link">
        Already have an account? <Link to="/login">Sign in here</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
