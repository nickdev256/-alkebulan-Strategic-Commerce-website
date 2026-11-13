import { useState } from 'react';
import { isFormspreeReady, sendToFormspree } from '../lib/formspree.js';
import { Link } from 'react-router-dom';
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

// Countries where we have an office, with their flag codes.
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
  const [subscriber, setSubscriber] = useState('');
  // idle | sending | sent | drafted | error
  const [status, setStatus] = useState('idle');

  async function handleSubscribe(event) {
    event.preventDefault();

    // Without the form service, fall back to an email request to the team.
    if (!isFormspreeReady) {
      const subject = encodeURIComponent('Newsletter subscription');
      const body = encodeURIComponent(`Please add ${subscriber} to the Alkebulan Global mailing list.`);
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      setStatus('drafted');
      return;
    }

    setStatus('sending');
    try {
      await sendToFormspree({
        email: subscriber,
        _subject: 'Newsletter subscription',
        _replyto: subscriber,
        page: 'Footer: Stay Connected',
      });
      setSubscriber('');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo size="lg" />
            <p>
              Bridging policy, commerce, and execution to expand
              Africa's participation in global trade.
            </p>
            <ul className="footer-flags" aria-label="Our offices">
              {offices.map(([country, code]) => (
                <li key={code} title={country}>
                  <img src={`https://flagcdn.com/${code}.svg`} alt={country} width="28" height="19" loading="lazy" />
                </li>
              ))}
            </ul>

            <ul className="footer-social" aria-label="Follow Alkebulan Global">
              {socialLinks.map((item) => (
                <li key={item.name}>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`Alkebulan Global on ${item.name}`}>
                      <SocialIcon name={item.icon} />
                    </a>
                  ) : (
                    <span title={`${item.name} (link coming soon)`}>
                      <SocialIcon name={item.icon} />
                      <span className="visually-hidden">{item.name}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h3>Company</h3>
            <Link to="/about">About Us</Link>
            <Link to="/portfolio">Projects</Link>
            <Link to="/csr">Responsibility</Link>
            <Link to="/contact">Engage</Link>
          </div>

          <div className="footer-col">
            <h3>Expertise</h3>
            {expertise.map((item) => (
              <Link key={item.path} to={item.path}>
                {item.label}
              </Link>
            ))}
          </div>

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
            <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
              <Icon name="chat" size={18} />
              <span>
                {whatsapp} <small>WhatsApp</small>
              </span>
            </a>
          </div>

          <div className="footer-col footer-contact">
            <h3>Headquarters</h3>
            <a href={directions} target="_blank" rel="noopener noreferrer">
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
              Satellite offices in Uganda, Namibia, Mozambique, and Nigeria.
            </p>
          </div>
        </div>

        <div className="footer-subscribe">
          <div className="subscribe-text">
            <h3>Stay Connected</h3>
            <p>Get updates on our sectors and projects.</p>
          </div>

          <form className="subscribe-form" onSubmit={handleSubscribe}>
            <label htmlFor="subscribe-email" className="visually-hidden">
              Email address
            </label>
            <div className="subscribe-field">
              <input
                id="subscribe-email"
                type="email"
                autoComplete="email"
                placeholder="Your email address"
                value={subscriber}
                onChange={(event) => setSubscriber(event.target.value)}
                required
              />
              <button className="btn btn--primary" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Subscribe'}
              </button>
            </div>
            <div aria-live="polite">
              {status === 'sent' && (
                <p className="subscribe-note" role="status">
                  Thank you for subscribing.
                </p>
              )}
              {status === 'drafted' && (
                <p className="subscribe-note" role="status">
                  Your email app should now be open. Press send to finish.
                </p>
              )}
              {status === 'error' && (
                <p className="subscribe-note" role="alert">
                  Sorry, that did not go through. Please try again.
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Alkebulan Global LLC. All rights reserved.{' '}
            <Link to="/privacy" className="footer-legal">Privacy Policy</Link>
          </p>
          <p className="footer-slogan">Where Excellence Meets Opportunity™</p>
        </div>
      </div>
    </footer>
  );
}
