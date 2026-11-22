import { useState, useEffect, createContext } from 'react';
import api from '../services/api';

// The context is intentionally exported for the useAuth hook.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  // Sync theme when user preferences change
  useEffect(() => {
    const theme = user?.preferences?.theme || localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', theme);
  }, [user]);

  // Check if user is already logged in
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        if (response.data.preferences) {
          if (response.data.preferences.monthlyBudget) {
            localStorage.setItem('monthlyBudget', response.data.preferences.monthlyBudget);
          }
          if (response.data.preferences.savingsGoal) {
            localStorage.setItem('savingsGoal', response.data.preferences.savingsGoal);
          }
          if (response.data.preferences.currency) {
            localStorage.setItem('currency', response.data.preferences.currency);
          }
          if (response.data.preferences.theme) {
            localStorage.setItem('theme', response.data.preferences.theme);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  // Login function
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data);
    if (response.data.preferences) {
      if (response.data.preferences.monthlyBudget) {
        localStorage.setItem('monthlyBudget', response.data.preferences.monthlyBudget);
      }
      if (response.data.preferences.savingsGoal) {
        localStorage.setItem('savingsGoal', response.data.preferences.savingsGoal);
      }
      if (response.data.preferences.currency) {
        localStorage.setItem('currency', response.data.preferences.currency);
      }
      if (response.data.preferences.theme) {
        localStorage.setItem('theme', response.data.preferences.theme);
      }
    }
    return response.data;
  };

  // Register function
  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data);
    return response.data;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser((currentUser) => ({ ...currentUser, ...updatedUser }));
  };

  const updatePreferences = async (newPreferences) => {
    const response = await api.put('/auth/preferences', newPreferences);
    setUser((currentUser) => ({
      ...currentUser,
      ...response.data,
      preferences: response.data.preferences,
    }));
    if (newPreferences.monthlyBudget !== undefined) {
      localStorage.setItem('monthlyBudget', newPreferences.monthlyBudget);
    }
    if (newPreferences.savingsGoal !== undefined) {
      localStorage.setItem('savingsGoal', newPreferences.savingsGoal);
    }
    if (newPreferences.currency) {
      localStorage.setItem('currency', newPreferences.currency);
    }
    if (newPreferences.theme) {
      localStorage.setItem('theme', newPreferences.theme);
      document.body.setAttribute('data-theme', newPreferences.theme);
    }
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, updatePreferences, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
