
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminLogin.css';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your administrator email address.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email.trim());

      setSuccess(
        'If an account exists for this email, a password reset link will be sent. Please check your inbox.'
      );
    } catch (err) {
      setError(
        err.message || 'Unable to send the password reset email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ag-auth-page">
      <div className="ag-auth-container">
        <Link to="/admin/login" className="ag-auth-back">
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <div className="ag-auth-brand">
          <div className="ag-auth-brand-mark">A</div>
          <h1>ALKEBULAN GLOBAL</h1>
          <span>STRATEGIC COMMERCE & DEVELOPMENT</span>
        </div>

        <section className="ag-auth-card">
          <div className="ag-auth-icon">
            <ShieldCheck size={25} />
          </div>

          <p className="ag-auth-eyebrow">ACCOUNT RECOVERY</p>
          <h2>Reset Your Password</h2>

          <p className="ag-auth-description">
            Enter the email address associated with your administrator
            account. We will send instructions to reset your password.
          </p>

          {error && (
            <div className="ag-auth-alert ag-auth-alert--error">
              {error}
            </div>
          )}

          {success && (
            <div className="ag-auth-alert ag-auth-alert--success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label className="ag-auth-field">
              Administrator Email
              <div className="ag-auth-input-wrap">
                <Mail size={17} />
                <input
                  type="email"
                  placeholder="admin@alkebulan-global.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              className="ag-auth-submit"
              disabled={loading}
            >
              {loading ? 'Sending instructions...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="ag-auth-security">
            <ShieldCheck size={16} />
            <span>Secure administrator account recovery</span>
          </div>
        </section>

        <p className="ag-auth-footer">
          © {new Date().getFullYear()} Alkebulan Global LLC.
          All rights reserved.
        </p>
      </div>
    </main>
  );
}
