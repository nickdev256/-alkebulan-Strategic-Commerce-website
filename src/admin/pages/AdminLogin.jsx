import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import './AdminLogin.css';

export default function AdminLogin() {
  const { login, loading, user, admin } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const redirectTo =
    location.state?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    if (!loading && user && admin?.status === 'approved') {
      navigate(redirectTo, { replace: true });
    }
  }, [loading, user, admin, navigate, redirectTo]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    setSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(
        err.message || 'Unable to sign in. Please check your credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && user && admin?.status === 'approved') {
    return null;
  }

  return (
    <AuthLayout>
      <div className="ag-auth-container">
        <Link to="/" className="ag-auth-brand">
          <span className="ag-auth-brand-mark">AG</span>
          <span>
            <strong>ALKEBULAN GLOBAL</strong>
            <small>STRATEGIC COMMERCE &amp; DEVELOPMENT</small>
          </span>
        </Link>

        <div className="ag-auth-card">
          <div className="ag-auth-icon">
            <LockKeyhole size={25} />
          </div>

          <p className="ag-auth-eyebrow">SECURE ADMINISTRATION</p>

          <h1>Welcome back.</h1>

          <p className="ag-auth-description">
            Sign in to access the Alkebulan Global content
            management system.
          </p>

          {location.state?.error && (
            <div className="ag-auth-alert ag-auth-alert--error">
              {location.state.error}
            </div>
          )}

          {error && (
            <div className="ag-auth-alert ag-auth-alert--error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="ag-auth-field">
              <label htmlFor="admin-email">Email address</label>

              <div className="ag-auth-input-wrap">
                <Mail size={18} />

                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="ag-auth-field">
              <div className="ag-auth-label-row">
                <label htmlFor="admin-password">Password</label>

                <Link to="/admin/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <div className="ag-auth-input-wrap">
                <LockKeyhole size={18} />

                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="ag-auth-password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="ag-auth-submit"
              disabled={submitting || loading}
            >
              {submitting ? 'Signing in...' : 'Sign in securely'}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="ag-auth-register">
            <p>Don't have an administrator account?</p>

            <Link to="/admin/register">
              <UserPlus size={17} />
              Register here
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="ag-auth-security">
            <ShieldCheck size={17} />
            <span>Protected administrator access</span>
          </div>
        </div>

        <p className="ag-auth-footer">
          © {new Date().getFullYear()} Alkebulan Global LLC.
          All rights reserved.
        </p>

        <Link to="/" className="ag-auth-back">
          Return to website
        </Link>
      </div>
    </AuthLayout>
  );
}
