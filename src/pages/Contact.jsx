import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import Icon from '../components/Icon.jsx';
import PhotoBreak from '../components/PhotoBreak.jsx';
import {
  contactEmail as email,
  contactPhone as phone,
  contactWhatsApp as whatsapp,
  sectors as coreSectors,
} from '../content.js';
import './Contact.css';

const interests = [
  'Global Sourcing',
  'Market Access',
  'Business Development',
  'Trade & Investment',
  'Strategic Advisory',
  'Training & Capacity Building',
  'Other',
];

// The six core sectors, plus a few extra options.
const sectorOptions = [...coreSectors.map((sector) => sector.title), 'Trade Finance', 'Other'];

const headquarters = {
  name: 'Alkebulan Global LLC',
  street: '1 World Trade Center, Suite 8500',
  city: 'New York, NY 10007',
  query: '1 World Trade Center, Suite 8500, New York, NY 10007',
};

// Offices with their two-letter flag codes.
const offices = [
  { country: 'United States', code: 'us', role: 'Headquarters · New York' },
  { country: 'Uganda', code: 'ug', role: 'Satellite office' },
  { country: 'Namibia', code: 'na', role: 'Satellite office' },
  { country: 'Mozambique', code: 'mz', role: 'Satellite office' },
  { country: 'Nigeria', code: 'ng', role: 'Satellite office' },
];

// The three ways to reach the team directly.
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
  { title: 'We review your inquiry', text: 'Our team reads every message and looks at how your opportunity fits our sectors and network.' },
  { title: 'We arrange a conversation', text: 'We reach out by email or phone to set up an introductory call.' },
  { title: 'We map the path forward', text: 'Together we agree on partners, documentation, and practical next steps.' },
];

const emptyForm = { name: '', email: '', phone: '', company: '', interest: '', sector: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(emptyForm);
  const [sent, setSent] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  // No backend yet: open the visitor's email app with the inquiry filled in.
  function handleSubmit(event) {
    event.preventDefault();

    const subject = encodeURIComponent(`Website inquiry: ${form.interest}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\n` +
        `Email: ${form.email}\n` +
        `Phone: ${form.phone}\n` +
        `Company: ${form.company}\n` +
        `Interest: ${form.interest}\n` +
        `Sector: ${form.sector}\n\n` +
        `Message:\n${form.message}`,
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setSent(true);
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
        intro="Tell us about your business, sourcing needs, project, or potential strategic partnership."
      />

      {/* Direct contact options */}
      <section className="contact-channels">
        <div className="container">
          <div className="channel-grid">
            {channels.map((channel) => (
              <a
                key={channel.label}
                className="channel-card"
                href={channel.href}
                {...(channel.external && { target: '_blank', rel: 'noopener noreferrer' })}
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

      {/* Inquiry form and what to expect */}
      <section className="section contact-main">
        <div className="container contact-layout">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-head">
              <p className="eyebrow">Business Inquiries</p>
              <h2>Tell us about your opportunity</h2>
              <p>
                Share some information about your organization and what you
                would like to explore. Fields marked optional can be left blank.
              </p>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input id="name" name="name" autoComplete="name" placeholder="Jane Doe" value={form.name} onChange={handleChange} required />
              </div>
              <div className="field">
                <label htmlFor="email">Work email</label>
                <input id="email" name="email" type="email" autoComplete="email" placeholder="jane@company.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="phone">
                  Phone <span className="optional">Optional</span>
                </label>
                <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="company">
                  Company <span className="optional">Optional</span>
                </label>
                <input id="company" name="company" autoComplete="organization" placeholder="Organization name" value={form.company} onChange={handleChange} />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="interest">Area of interest</label>
                <select id="interest" name="interest" value={form.interest} onChange={handleChange} required>
                  <option value="">Select an option</option>
                  {interests.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="sector">Sector</label>
                <select id="sector" name="sector" value={form.sector} onChange={handleChange} required>
                  <option value="">Select a sector</option>
                  {sectorOptions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="message">How can we help?</label>
              <textarea
                id="message"
                name="message"
                rows="6"
                placeholder="Briefly describe your project, product, or partnership goals."
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-footer">
              <button className="btn btn--dark" type="submit">
                Send Inquiry
              </button>
              <p className="form-note">
                Your email app will open with your inquiry ready to send. See
                our <Link to="/privacy">Privacy Policy</Link>.
              </p>
            </div>

            {sent && (
              <p className="form-status" role="status">
                <Icon name="check" size={18} />
                Your email app should now be open. Press send there to
                complete your inquiry.
              </p>
            )}
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

      <PhotoBreak
        image="/images/photos/reception.jpg"
        alt="Alkebulan Global reception desk with the company emblem"
        focus="center 35%"
        eyebrow="Africa · United States · Global Markets"
        title="Connecting Africa, the United States, the Caribbean and global markets."
      />

      {/* Offices */}
      <section className="section section--sand contact-offices">
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
                <img src={`https://flagcdn.com/${office.code}.svg`} alt="" width="48" height="32" loading="lazy" />
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
