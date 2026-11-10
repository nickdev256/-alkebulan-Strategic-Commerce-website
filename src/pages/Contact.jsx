import { useState } from 'react';
import PageHero from '../components/PageHero.jsx';
import Icon from '../components/Icon.jsx';
import { contactEmail as email, sectors as coreSectors } from '../content.js';
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

// The five core sectors, plus the other areas shown on the Opportunities page.
const sectorOptions = [
  ...coreSectors.map((sector) => sector.title),
  'Manufacturing',
  'Agriculture',
  'Trade Finance',
  'Other',
];
export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    interest: '',
    sector: '',
    message: '',
  });
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
        `Company: ${form.company}\n` +
        `Interest: ${form.interest}\n` +
        `Sector: ${form.sector}\n\n` +
        `Message:\n${form.message}`,
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <>
      <PageHero
        eyebrow="Engage Alkebulan Global"
        title="Let's Start a Conversation"
        intro="Tell us about your business, sourcing needs, project, or potential strategic partnership."
      />

      <section className="section">
        <div className="container contact-layout">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-head">
              <h2>Business Inquiries</h2>
              <p>
                Share some information about your organization and the
                opportunity you would like to explore. This will help us
                understand the nature of your inquiry.
              </p>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input id="name" name="name" autoComplete="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="field">
                <label htmlFor="email">Email address</label>
                <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="field">
              <label htmlFor="company">
                Company / Organization <span className="optional">Optional</span>
              </label>
              <input id="company" name="company" autoComplete="organization" value={form.company} onChange={handleChange} />
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
              <label htmlFor="message">Your message</label>
              <textarea id="message" name="message" rows="6" value={form.message} onChange={handleChange} required />
            </div>

            <button className="btn btn--dark" type="submit">
              Prepare Email Inquiry
            </button>

            {sent && (
              <p className="form-status" role="status">
                Your email app should open with your inquiry filled in.
                Press send there to complete it.
              </p>
            )}
          </form>

          <aside className="contact-aside">
            <h2>Connect With Us</h2>
            <p>
              For business, sourcing, and partnership inquiries, please use
              the form or contact us by email.
            </p>

            <a className="contact-email" href={`mailto:${email}`}>
              <span className="icon-badge">
                <Icon name="mail" />
              </span>
              <span>
                <small>Email</small>
                {/* Allow a line break after the @ rather than mid-word */}
                {email.split('@')[0]}@<wbr />
                {email.split('@')[1]}
              </span>
            </a>

          </aside>
        </div>
      </section>
    </>
  );
}
