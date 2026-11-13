
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { subPages } from '../navigation.js';

import {
  contactEmail as email,
  contactPhone as phone,
  contactWhatsApp as whatsapp,
  socialLinks,
} from '../content.js';

import Icon from './Icon.jsx';
import SocialIcon from './SocialIcon.jsx';
import './Footer.css';

const expertise = subPages('Expertise');

const offices = [
  ['United States', 'us'],
  ['Uganda', 'ug'],
  ['Namibia', 'na'],
  ['Mozambique', 'mz'],
  ['Nigeria', 'ng'],
];

const directions =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('1 World Trade Center, Suite 8500, New York, NY 10007');

export default function Footer() {
  const navigate = useNavigate();

  const [subscriber, setSubscriber] = useState('');
  const [status, setStatus] = useState('idle');
  const [showCmsLoader, setShowCmsLoader] = useState(false);

  const logoClicks = useRef(0);
  const clickTimer = useRef(null);
  const redirectTimer = useRef(null);

  // Clean up timers when the footer unmounts.
  useEffect(() => {
    return () => {
      clearTimeout(clickTimer.current);
      clearTimeout(redirectTimer.current);
    };
  }, []);

  // Hidden CMS access: click the logo three times.
  function handleLogoClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (showCmsLoader) return;

    logoClicks.current += 1;

    clearTimeout(clickTimer.current);

    if (logoClicks.current >= 3) {
      logoClicks.current = 0;
      setShowCmsLoader(true);

      redirectTimer.current = setTimeout(() => {
        navigate('/admin/login');
      }, 1800);

      return;
    }

    clickTimer.current = setTimeout(() => {
      logoClicks.current = 0;
    }, 1800);
  }

  // Newsletter subscription.
  async function handleSubscribe(event) {
    event.preventDefault();

    const cleanEmail = subscriber.trim().toLowerCase();

    if (!cleanEmail) return;

    setStatus('sending');

    try {
      const API_BASE_URL = (
        import.meta.env.VITE_API_URL || 'http://localhost:5000'
      ).replace(/\/+$/, '');

      const response = await fetch(`${API_BASE_URL}/api/newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cleanEmail,
          _gotcha: '',
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Subscription failed.');
      }

      setSubscriber('');
      setStatus('sent');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setStatus('error');
    }
  }

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">

          {/* Brand and social links */}
          <div className="footer-brand">

            <div
              className="footer-secret-logo"
              onClick={handleLogoClick}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  handleLogoClick(event);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Alkebulan Global"
              title="Alkebulan Global"
            >
              <Logo size="lg" />
            </div>

            <p>
              Bridging policy, commerce, and execution to expand
              Africa's participation in global trade.
            </p>

            <ul className="footer-flags" aria-label="Our offices">
              {offices.map(([country, code]) => (
                <li key={code} title={country}>
                  <img
                    src={`https://flagcdn.com/${code}.svg`}
                    alt={country}
                    width="28"
                    height="19"
                    loading="lazy"
                  />
                </li>
              ))}
            </ul>

            <ul
              className="footer-social"
              aria-label="Follow Alkebulan Global"
            >
              {socialLinks.map((item) => (
                <li key={item.name}>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Alkebulan Global on ${item.name}`}
                    >
                      <SocialIcon name={item.icon} />
                    </a>
                  ) : (
                    <span title={`${item.name} (link coming soon)`}>
                      <SocialIcon name={item.icon} />
                      <span className="visually-hidden">
                        {item.name}
                      </span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div className="footer-col">
            <h3>Company</h3>
            <Link to="/about">About Us</Link>
            <Link to="/portfolio">Projects</Link>
            <Link to="/csr">Responsibility</Link>
            <Link to="/contact">Engage</Link>
          </div>

          {/* Expertise links */}
          <div className="footer-col">
            <h3>Expertise</h3>

            {expertise.map((item) => (
              <Link key={item.path} to={item.path}>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Contact information */}
          <div className="footer-col footer-contact">
            <h3>Contact</h3>

            <a href={`mailto:${email}`}>
              <Icon name="mail" size={18} />
              <span>{email}</span>
            </a>

            <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
              <Icon name="phone" size={18} />
              <span>{phone}</span>
            </a>

            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="chat" size={18} />
              <span>
                {whatsapp}
                <small>WhatsApp</small>
              </span>
            </a>
          </div>

          {/* Headquarters */}
          <div className="footer-col footer-contact">
            <h3>Headquarters</h3>

            <a
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="pin" size={18} />

              <address>
                Alkebulan Global LLC
                <br />
                1 World Trade Center, Suite 8500
                <br />
                New York, NY 10007
              </address>
            </a>

            <p className="footer-offices">
              Satellite offices in Uganda, Namibia, Mozambique,
              and Nigeria.
            </p>
          </div>

        </div>

        {/* Newsletter subscription */}
        <div className="footer-subscribe">
          <div className="subscribe-text">
            <h3>Stay Connected</h3>
            <p>Get updates on our sectors and projects.</p>
          </div>

          <form
            className="subscribe-form"
            onSubmit={handleSubscribe}
          >
            <label
              htmlFor="subscribe-email"
              className="visually-hidden"
            >
              Email address
            </label>

            <div className="subscribe-field">
              <input
                id="subscribe-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Your email address"
                value={subscriber}
                onChange={(event) => {
                  setSubscriber(event.target.value);

                  if (status !== 'idle') {
                    setStatus('idle');
                  }
                }}
                required
                maxLength={254}
                disabled={status === 'sending'}
              />

              <button
                className="btn btn--primary"
                type="submit"
                disabled={status === 'sending'}
              >
                {status === 'sending'
                  ? 'Subscribing…'
                  : 'Subscribe'}
              </button>
            </div>

            <p className="subscribe-note">
              By subscribing, you agree to receive occasional
              updates from Alkebulan Global.
            </p>

            <div aria-live="polite">
              {status === 'sent' && (
                <p className="subscribe-note" role="status">
                  Thank you for subscribing! Please check your
                  inbox for a welcome email.
                </p>
              )}

              {status === 'error' && (
                <p className="subscribe-note" role="alert">
                  Sorry, we could not complete your subscription.
                  Please try again.
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Footer bottom */}
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Alkebulan Global LLC.
            All rights reserved.{' '}

            <Link to="/privacy" className="footer-legal">
              Privacy Policy
            </Link>
          </p>

          <p className="footer-slogan">
            Where Excellence Meets Opportunity™
          </p>
        </div>
      </div>

      {/* Hidden CMS loading animation */}
      {showCmsLoader && (
        <div
          className="cms-loading-overlay"
          role="status"
          aria-live="polite"
          aria-label="Opening administration portal"
        >
          <div className="cms-loader-content">

            <div className="cms-globe">
              <span className="cms-globe-meridian" />
              <span className="cms-globe-equator" />
              <span className="cms-globe-core">✦</span>
            </div>

            <h2>ALKEBULAN GLOBAL</h2>

            <p>
              Preparing your administration portal...
            </p>

            <div className="cms-loading-line">
              <span />
            </div>

          </div>
        </div>
      )}
    </footer>
  );
}
