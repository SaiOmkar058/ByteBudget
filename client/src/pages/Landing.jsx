import { useScrollFadeUp } from '../hooks/useScrollFadeUp';
import { useNavigate } from 'react-router-dom';
import '../styles/Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  // scroll animations for sections
  const featuresAnim = useScrollFadeUp();
  const stepsAnim = useScrollFadeUp();
  const ctaAnim = useScrollFadeUp();

  return (
    <div className="landing-page">
      {/*Hero*/}
      <header className="landing-hero">
        <nav className="landing-nav">
          <div className="landing-logo">
            <span className="logo-emoji">💰</span>
            <span className="logo-text">ByteBudget</span>
          </div>
          <div className="landing-nav-actions">
            <button
              className="btn btn-outline landing-nav-btn"
              onClick={() => navigate('/login')}
            >
              Log in
            </button>
            <button
              className="btn btn-primary landing-nav-btn"
              onClick={() => navigate('/register')}
            >
              Get started
            </button>
          </div>
        </nav>

        <div className="landing-hero-content">
          <div className="landing-hero-text animate-fade-up animate-delay-1">
            <h1 className="landing-title">Take control of your money in minutes.</h1>
            <p className="landing-subtitle">
              ByteBudget helps you track income, expenses, and budgets in a clean,
              simple dashboard. See where your money goes and build healthy habits.
            </p>
            <div className="landing-hero-actions">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/register')}
              >
                Start tracking for free
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/login')}
              >
                I already have an account
              </button>
            </div>
            <p className="landing-small-text">
              No credit card. No ads. Just a simple expense tracker.
            </p>
          </div>

          <div className="landing-hero-preview animate-fade-up animate-delay-3">
            <div className="preview-card">
              <div className="preview-header">
                <p className="preview-title">Monthly Overview</p>
                <span className="preview-pill">Sample data</span>
              </div>
              <div className="preview-stats">
                <div className="preview-stat">
                  <p className="preview-label">Total income</p>
                  <p className="preview-value income">₹45,000</p>
                </div>
                <div className="preview-stat">
                  <p className="preview-label">Total expenses</p>
                  <p className="preview-value expense">₹32,450</p>
                </div>
                <div className="preview-stat">
                  <p className="preview-label">Balance</p>
                  <p className="preview-value balance">₹12,550</p>
                </div>
              </div>
              <div className="preview-bars">
                <div className="preview-bar-row">
                  <span className="preview-bar-label">Food</span>
                  <div className="preview-bar-track">
                    <div className="preview-bar-fill food" />
                  </div>
                  <span className="preview-bar-amount">₹8,500</span>
                </div>
                <div className="preview-bar-row">
                  <span className="preview-bar-label">Transport</span>
                  <div className="preview-bar-track">
                    <div className="preview-bar-fill transport" />
                  </div>
                  <span className="preview-bar-amount">₹3,200</span>
                </div>
                <div className="preview-bar-row">
                  <span className="preview-bar-label">Bills</span>
                  <div className="preview-bar-track">
                    <div className="preview-bar-fill bills" />
                  </div>
                  <span className="preview-bar-amount">₹4,800</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section
        className={`landing-section scroll-fade-up ${
          featuresAnim.isVisible ? 'is-visible' : ''
        }`}
        ref={featuresAnim.ref}
      >
        <div className="landing-section-header">
          <h2>Everything you need to stay on top of your spending</h2>
          <p>
            ByteBudget gives you a clear picture of your finances so you can make
            better decisions every month.
          </p>
        </div>
        <div className="landing-features">
          <div className="feature-card scroll-delay-1">
            <span className="feature-icon">📒</span>
            <h3>Simple transaction logging</h3>
            <p>
              Add income and expenses in seconds with clean forms and sensible
              defaults.
            </p>
          </div>
          <div className="feature-card scroll-delay-2">
            <span className="feature-icon">📊</span>
            <h3>Clear reports & stats</h3>
            <p>
              See monthly totals, category breakdowns, and trends at a glance on
              your dashboard.
            </p>
          </div>
          <div className="feature-card scroll-delay-3">
            <span className="feature-icon">🎯</span>
            <h3>Budgets & goals</h3>
            <p>
              Set monthly budgets and savings goals, and track your progress without
              spreadsheets.
            </p>
          </div>
          <div className="feature-card scroll-delay-4">
            <span className="feature-icon">🔒</span>
            <h3>Private & secure</h3>
            <p>
              Your account is protected with secure authentication. Your data is
              yours, not for sale.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className={`landing-section scroll-fade-up ${
          stepsAnim.isVisible ? 'is-visible' : ''
        }`}
        ref={stepsAnim.ref}
      >
        <div className="landing-section-header">
          <h2>How ByteBudget works</h2>
          <p>Get set up in just a few minutes.</p>
        </div>
        <div className="landing-steps">
          <div className="step-card scroll-delay-1">
            <div className="step-number">1</div>
            <h3>Create your free account</h3>
            <p>
              Sign up with your name, email, and password. No payment details
              required.
            </p>
          </div>
          <div className="step-card scroll-delay-2">
            <div className="step-number">2</div>
            <h3>Add income & expenses</h3>
            <p>
              Log your salary, side income, and daily spending using clear
              categories.
            </p>
          </div>
          <div className="step-card scroll-delay-3">
            <div className="step-number">3</div>
            <h3>See where money goes</h3>
            <p>
              Use the dashboard, reports, and budgets to stay in control each
              month.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className={`landing-cta scroll-fade-up ${
          ctaAnim.isVisible ? 'is-visible' : ''
        }`}
        ref={ctaAnim.ref}
      >
        <div className="landing-cta-inner">
          <h2>Ready to get on top of your expenses?</h2>
          <p>
            Join ByteBudget and start tracking your money with a simple,
            distraction‑free tool.
          </p>
          <div className="landing-hero-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/register')}
            >
              Create your free account
            </button>
            <button
              className="btn btn-outline"
              onClick={() => navigate('/login')}
            >
              Log in instead
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} ByteBudget. All rights reserved.</p>
        <div className="landing-footer-links">
          <button type="button">Privacy</button>
          <button type="button">Terms</button>
          <button type="button">Contact</button>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
