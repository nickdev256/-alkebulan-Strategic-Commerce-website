
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';

import './AdminRegister.css';

export default function AdminRegister() {
  const { completeInvitation, verifyAdmin } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState('');

  useEffect(() => {
    let active = true;

    const checkInvitation = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!active) return;

        if (!session?.user) {
          setError(
            'No valid invitation session was found. Open the invitation link sent to your email.'
          );
        } else {
          setInvitedEmail(session.user.email || '');
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setChecking(false);
      }
    };

    checkInvitation();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (password.length < 8) {
      setError('Your password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const updatedUser = await completeInvitation(fullName, password);

      const adminProfile = await verifyAdmin(updatedUser);

      if (!adminProfile) {
        setError(
          'Your account has been created, but administrator access has not yet been assigned. Contact the website owner.'
        );
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message || 'Unable to complete registration.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="ag-auth-page">
        <div className="ag-register-loading">
          Verifying your invitation...
        </div>
      </div>
    );
  }

  return (
    <div className="ag-auth-page">
      <div className="ag-auth-decoration ag-auth-decoration--one" />
      <div className="ag-auth-decoration ag-auth-decoration--two" />

      <div className="ag-auth-container">

        <Link to="/" className="ag-auth-brand">
          <span className="ag-auth-brand-mark">AG</span>
          <span>
            <strong>ALKEBULAN GLOBAL</strong>
            <small>STRATEGIC COMMERCE & DEVELOPMENT</small>
          </span>
        </Link>

        <div className="ag-auth-card">

          <div className="ag-auth-icon">
            <ShieldCheck size={25} />
          </div>

          <p className="ag-auth-eyebrow">INVITED ADMINISTRATOR</p>

          <h1>Complete your account.</h1>

          <p className="ag-auth-description">
            Set up your administrator profile to access the
            Alkebulan Global CMS.
          </p>

          {invitedEmail && (
            <div className="ag-register-invited-email">
              <span>Invitation sent to</span>
              <strong>{invitedEmail}</strong>
            </div>
          )}

          {error && (
            <div className="ag-auth-alert ag-auth-alert--error">
              {error}
            </div>
          )}

          {success ? (
            <div className="ag-register-success">
              <CheckCircle2 size={34} />
              <h2>Account completed</h2>
              <p>Taking you to your administration dashboard...</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit}>

                <div className="ag-auth-field">
                  <label htmlFor="register-name">Full name</label>

                  <div className="ag-auth-input-wrap">
                    <UserRound size={18} />

                    <input
                      id="register-name"
                      type="text"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>

                <div className="ag-auth-field">
                  <label htmlFor="register-password">Create password</label>

                  <div className="ag-auth-input-wrap">
                    <LockKeyhole size={18} />

                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />

                    <button
                      type="button"
                      className="ag-auth-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="ag-auth-field">
                  <label htmlFor="register-confirm-password">
                    Confirm password
                  </label>

                  <div className="ag-auth-input-wrap">
                    <LockKeyhole size={18} />

                    <input
                      id="register-confirm-password"
                      type="password"
                      placeholder="Enter your password again"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="ag-auth-submit"
                  disabled={submitting || !invitedEmail}
                >
                  {submitting ? 'Completing registration...' : 'Complete registration'}
                </button>

              </form>

              <div className="ag-auth-security">
                <ShieldCheck size={17} />
                <span>Invitation-only administrator registration</span>
              </div>
            </>
          )}

        </div>

        <p className="ag-auth-footer">
          © {new Date().getFullYear()} Alkebulan Global LLC.
          All rights reserved.
        </p>

        <Link to="/admin/login" className="ag-auth-back">
          Return to administrator login
        </Link>

      </div>
    </div>
  );
}
