import React from 'react';
import AuthPreview from './AuthPreview';
import '../../styles/Auth.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout-container">
      <div className="auth-grid">
        <div className="auth-form-section">
          <div className="auth-form-content">
            {children}
          </div>
        </div>
        <div className="auth-preview-section">
          <AuthPreview />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
