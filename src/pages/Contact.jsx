
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import Icon from '../components/Icon.jsx';
import {
  contactEmail as email,
  contactPhone as phone,
  contactWhatsApp as whatsapp,
  sectors as coreSectors,
} from '../content.js';
import './Contact.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

const interests = [
  'Global Sourcing',
  'Market Access',
  'Business Development',
  'Trade & Investment',
  'Strategic Advisory',
  'Training & Capacity Building',
  'Other',
];

const sectorOptions = [
  ...coreSectors.map((sector) => sector.title),
  'Trade Finance',
  'Other',
];

const headquarters = {
  name: 'Alkebulan Global LLC',
  street: '1 World Trade Center, Suite 8500',
  city: 'New York, NY 10007',
  query: '1 World Trade Center, Suite 8500, New York, NY 10007',
};

const offices = [
  { country: 'United States', code: 'us', role: 'Headquarters · New York' },
  { country: 'Uganda', code: 'ug', role: 'Satellite office' },
  { country: 'Namibia', code: 'na', role: 'Satellite office' },
  { country: 'Mozambique', code: 'mz', role: 'Satellite office' },
  { country: 'Nigeria', code: 'ng', role: 'Satellite office' },
];

const channels = [
  {
    icon: 'mail',
    label: 'Email us',
    value: email,
    action: 'Send an email',
    href: `mailto:${email}`,
  },
  {
    icon: 'phone',
    label: 'Call our main line',
    value: phone,
    action: 'Call now',
    href: `tel:${phone.replace(/[^+\d]/g, '')}`,
  },
  {
    icon: 'chat',
    label: 'Message on WhatsApp',
    value: whatsapp,
    action: 'Open WhatsApp',
    href: `https://wa.me/${whatsapp.replace(/\D/g, '')}`,
    external: true,
  },
];

const nextSteps = [
  {
    title: 'We review your inquiry',
    text: 'Our team reads your message and considers how your opportunity aligns with our sectors, expertise and network.',
  },
  {
    title: 'We arrange a conversation',
    text: 'We contact you by email or phone to arrange an introductory discussion.',
  },
  {
    title: 'We map the way forward',
    text: 'Together, we explore potential partners, documentation and practical next steps.',
  },
];

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  interest: '',
  sector: '',
  message: '',
  _gotcha: '',
};

export default function Contact() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const sending = status === 'sending';

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (sending) return;

    // The hidden field helps identify automated submissions.
    if (form._gotcha.trim()) return;

    setStatus('sending');
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company: form.company.trim(),
          interest: form.interest,
          sector: form.sector,
          message: form.message.trim(),
          _gotcha: form._gotcha,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
          result.error ||
          'We could not submit your inquiry. Please try again.'
        );
      }

      setForm({ ...emptyForm });
      setStatus('sent');
    } catch (err) {
      setError(
        err.message ||
        'Unable to connect to our server. Please try again later.'
      );
      setStatus('error');
    }
  }

  const mapQuery = encodeURIComponent(headquarters.query);

  return (
    <>
      <PageHero
        image="/images/photos/executive-office.jpg"
        imageAlt="Alkebulan Global executive office with city views"
        focus="center 24%"
        eyebrow="Engage Alkebulan Global"
        title="Let's Start a Conversation"
        intro="Tell us about your business, sourcing needs, project or potential strategic partnership. We welcome conversations that create meaningful opportunities across markets."
      />

      {/* Direct contact channels */}
      <section className="contact-channels">
        <div className="container">
          <div className="channel-grid">
            {channels.map((channel) => (
              <a
                key={channel.label}
                className="channel-card"
                href={channel.href}
                {...(
                  channel.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {}
                )}
              >
                <span className="channel-icon">
                  <Icon name={channel.icon} size={24} />
                </span>
                <span className="channel-label">{channel.label}</span>
                <span className="channel-value">{channel.value}</span>
                <span className="channel-action">{channel.action}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form and next steps */}
      <section className="section contact-main">
        <div className="container contact-layout">
          <form
            className="contact-form"
            onSubmit={handleSubmit}
            aria-busy={sending}
          >
            {/* Hidden spam-trap field */}
            <div className="form-trap" aria-hidden="true">
              <label htmlFor="_gotcha">Leave this field empty</label>
              <input
                id="_gotcha"
                name="_gotcha"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form._gotcha}
                onChange={handleChange}
              />
            </div>

            <div className="contact-form-head">
              <p className="eyebrow">Business Inquiries</p>
              <h2>Tell us about your opportunity</h2>
              <p>
                Share some information about your organisation and what you
                would like to explore. Fields marked optional can be left blank.
              </p>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={120}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="email">Work email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="jane@company.com"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={254}
                  required
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="phone">
                  Phone <span className="optional">Optional</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={50}
                />
              </div>

              <div className="field">
                <label htmlFor="company">
                  Company <span className="optional">Optional</span>
                </label>
                <input
                  id="company"
                  name="company"
                  autoComplete="organization"
                  placeholder="Organisation name"
                  value={form.company}
                  onChange={handleChange}
                  maxLength={200}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="interest">Area of interest</label>
                <select
                  id="interest"
                  name="interest"
                  value={form.interest}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select an option</option>
                  {interests.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="sector">Sector</label>
                <select
                  id="sector"
                  name="sector"
                  value={form.sector}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a sector</option>
                  {sectorOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="message">How can we help?</label>
              <textarea
                id="message"
                name="message"
                rows={6}
                placeholder="Briefly describe your project, product, business needs or partnership goals."
                value={form.message}
                onChange={handleChange}
                maxLength={5000}
                required
              />
            </div>

            <div className="form-footer">
              <button
                className="btn btn--dark"
                type="submit"
                disabled={sending}
              >
                {sending && (
                  <span className="btn-spinner" aria-hidden="true" />
                )}
                {sending ? 'Submitting...' : 'Submit Inquiry'}
              </button>

              <p className="form-note">
                Your information will be handled securely and used to respond
                to your inquiry. See our{' '}
                <Link to="/privacy">Privacy Policy</Link>.
              </p>
            </div>

            <div aria-live="polite">
              {status === 'sent' && (
                <p className="form-status" role="status">
                  <Icon name="check" size={18} />
                  <span>
                    Thank you for contacting Alkebulan Global. Your inquiry
                    has been submitted successfully. Our team will be in touch.
                  </span>
                </p>
              )}

              {status === 'error' && (
                <p className="form-status form-status--error" role="alert">
                  <Icon name="mail" size={18} />
                  <span>
                    {error}{' '}
                    You can also contact us directly at{' '}
                    <a href={`mailto:${email}`}>{email}</a>.
                  </span>
                </p>
              )}
            </div>
          </form>

          <aside className="contact-aside">
            <p className="eyebrow">What happens next</p>
            <h2>From first message to partnership</h2>

            <ol className="next-steps">
              {nextSteps.map((step, index) => (
                <li key={step.title}>
                  <span className="step-number">{index + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="aside-direct">
              <p>Prefer to talk now?</p>
              <a href={channels[1].href}>
                <Icon name="phone" size={18} />
                {phone}
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* Global presence */}
      <section className="section section--sand">
        <div className="container">
          <div className="section-head section-head--center">
            <p className="eyebrow">Africa · United States · Global Markets</p>
            <h2>Connecting markets. Creating opportunities.</h2>
            <p>
              Alkebulan Global connects Africa, the United States, the
              Caribbean and the wider global marketplace through strategic
              relationships and business opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="section contact-offices">
        <div className="container">
          <div className="section-head section-head--center">
            <p className="eyebrow">Our Offices</p>
            <h2>Headquartered in New York, present across Africa</h2>
          </div>

          <div className="hq-card">
            <div className="hq-details">
              <span className="channel-icon">
                <Icon name="pin" size={24} />
              </span>

              <p className="eyebrow">Global Headquarters</p>
              <h3>{headquarters.name}</h3>

              <address>
                {headquarters.street}
                <br />
                {headquarters.city}
                <br />
                United States
              </address>

              <a
                className="btn btn--dark"
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Directions
              </a>
            </div>

            <iframe
              className="hq-map"
              title="Map of Alkebulan Global headquarters at 1 World Trade Center, New York"
              src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <ul className="office-grid">
            {offices.map((office) => (
              <li key={office.country} className="office-card">
                <img
                  src={`https://flagcdn.com/${office.code}.svg`}
                  alt={`${office.country} flag`}
                  width="48"
                  height="32"
                  loading="lazy"
                />
                <div>
                  <h3>{office.country}</h3>
                  <p>{office.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
