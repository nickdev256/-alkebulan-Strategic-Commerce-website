import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
  ShieldCheck,
  CheckCircle2,
  Mail,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

import { supabase } from '../../lib/supabase';
import AuthLayout from '../components/AuthLayout';
import './AdminRegister.css';

export default function AdminRegister() {
  const navigate = useNavigate();

  const [step, setStep] = useState('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();

  // STEP 1: Register the user and request an email OTP.
  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');

    if (fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (!normalizedEmail) {
      setError('Please enter a valid email address.');
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
      // Prevent accidentally registering an existing signed-in account.
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (currentUser) {
        await supabase.auth.signOut();
      }

      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

      if (signUpError) throw signUpError;

      if (data.session) {
        // OTP verification must be enabled in Supabase.
        await supabase.auth.signOut();

        throw new Error(
          'Email OTP verification is not enabled. Please enable email confirmation in Supabase before registering.'
        );
      }

      if (!data.user) {
        throw new Error('Unable to create your account. Please try again.');
      }

      setStep('verify');
    } catch (err) {
      setError(err.message || 'Unable to register your account.');
    } finally {
      setSubmitting(false);
    }
  };

  // STEP 2: Verify the OTP sent to the user's email.
  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError('');

    const cleanOtp = otp.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setSubmitting(true);

    try {
      const { data, error: otpError } =
        await supabase.auth.verifyOtp({
          email: normalizedEmail,
          token: cleanOtp,
          type: 'signup',
        });

      if (otpError) throw otpError;

      if (!data.user || !data.session) {
        throw new Error(
          'Email verification could not be completed. Please try again.'
        );
      }

      // Create the administrator profile only after email verification.
      // New registrations can never assign themselves owner privileges.
      const { error: profileError } = await supabase
        .from('admin_users')
        .insert({
          id: data.user.id,
          email: normalizedEmail,
          full_name: fullName.trim(),
          role: 'editor',
          status: 'pending',
        });

      if (profileError) {
        // Do not overwrite an existing administrator's role or status.
        if (profileError.code === '23505') {
          const { data: existingProfile, error: lookupError } =
            await supabase
              .from('admin_users')
              .select('id, status')
              .eq('id', data.user.id)
              .maybeSingle();

          if (lookupError || !existingProfile) {
            throw profileError;
          }
        } else {
          throw new Error(
            `Your email was verified, but your administrator profile could not be created. ${profileError.message}`
          );
        }
      }

      setSuccess(true);
      setStep('success');

      // The user must wait for owner approval before logging in.
      await supabase.auth.signOut();
    } catch (err) {
      setError(err.message || 'Unable to verify your email.');
    } finally {
      setSubmitting(false);
    }
  };

  // Resend the OTP.
  const handleResendOtp = async () => {
    setError('');
    setResending(true);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: normalizedEmail,
      });

      if (resendError) throw resendError;

      setOtp('');
      setError('');
      alert('A new verification code has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Unable to resend the verification code.');
    } finally {
      setResending(false);
    }
  };

  const goToLogin = () => {
    navigate('/admin/login', { replace: true });
  };

  return (
    <AuthLayout>
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
            {step === 'success' ? (
              <CheckCircle2 size={25} />
            ) : step === 'verify' ? (
              <Mail size={25} />
            ) : (
              <ShieldCheck size={25} />
            )}
          </div>

          <p className="ag-auth-eyebrow">
            {step === 'register'
              ? 'ADMINISTRATOR REGISTRATION'
              : step === 'verify'
                ? 'EMAIL VERIFICATION'
                : 'REGISTRATION COMPLETE'}
          </p>

          <h1>
            {step === 'register'
              ? 'Create your account.'
              : step === 'verify'
                ? 'Verify your email.'
                : 'Registration successful.'}
          </h1>

          <p className="ag-auth-description">
            {step === 'register' &&
              'Create an administrator account to request access to the Alkebulan Global CMS.'}

            {step === 'verify' &&
              `We have sent a 6-digit verification code to ${normalizedEmail}. Enter it below to verify your email.`}

            {step === 'success' &&
              'Your email has been verified and your administrator access request has been submitted.'}
          </p>

          {error && (
            <div className="ag-auth-alert ag-auth-alert--error">
              {error}
            </div>
          )}

          {step === 'register' && (
            <form onSubmit={handleRegister}>

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
                <label htmlFor="register-email">Email address</label>

                <div className="ag-auth-input-wrap">
                  <Mail size={18} />

                  <input
                    id="register-email"
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
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
                disabled={submitting}
              >
                {submitting ? 'Creating account...' : 'Create account'}
              </button>

            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerifyOtp}>

              <div className="ag-register-invited-email">
                <span>Verification email sent to</span>
                <strong>{normalizedEmail}</strong>
              </div>

              <div className="ag-auth-field">
                <label htmlFor="register-otp">6-digit verification code</label>

                <div className="ag-auth-input-wrap">
                  <Mail size={18} />

                  <input
                    id="register-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter your 6-digit code"
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="ag-auth-submit"
                disabled={submitting || otp.length !== 6}
              >
                {submitting ? 'Verifying email...' : 'Verify email'}
              </button>

              <button
                type="button"
                className="ag-register-resend"
                onClick={handleResendOtp}
                disabled={resending}
              >
                <RefreshCw size={16} />
                {resending ? 'Sending code...' : 'Resend verification code'}
              </button>

              <button
                type="button"
                className="ag-register-back"
                onClick={() => {
                  setError('');
                  setOtp('');
                  setStep('register');
                }}
              >
                <ArrowLeft size={16} />
                Back to registration
              </button>

            </form>
          )}

          {step === 'success' && (
            <div className="ag-register-success">
              <CheckCircle2 size={38} />

              <h2>Awaiting approval</h2>

              <p>
                Your email has been verified. Your administrator account
                is now awaiting approval from the website owner.
              </p>

              <p>
                You will be able to log in once your account has been approved.
              </p>

              <button
                type="button"
                className="ag-auth-submit"
                onClick={goToLogin}
              >
                Return to administrator login
              </button>
            </div>
          )}

          {step !== 'success' && (
            <div className="ag-auth-security">
              <ShieldCheck size={17} />
              <span>
                {step === 'register'
                  ? 'Email verification and owner approval required'
                  : 'Your email must be verified before approval'}
              </span>
            </div>
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
    </AuthLayout>
  );
}
