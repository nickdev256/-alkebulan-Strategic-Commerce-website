
import { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    interest: '',
    sector: '',
    message: '',
  });

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const subject = encodeURIComponent(
      `Website inquiry: ${form.interest}`
    );

    const body = encodeURIComponent(
      `Name: ${form.name}\n` +
      `Email: ${form.email}\n` +
      `Company: ${form.company}\n` +
      `Interest: ${form.interest}\n` +
      `Sector: ${form.sector}\n\n` +
      `Message:\n${form.message}`
    );

    window.location.href =
      `mailto:info@alkebulanglobal.com?subject=${subject}&body=${body}`;
  }

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <p className="eyebrow">Engage Alkebulan Global</p>
        <h1>Let's Start a Conversation</h1>
        <p>
          Tell us about your business, sourcing needs, project,
          or potential strategic partnership.
        </p>
      </section>

      <section className="contact-content">
        <div className="contact-intro">
          <h2>Business Inquiries</h2>
          <p>
            Share some information about your organisation and
            the opportunity you would like to explore. This will
            help us understand the nature of your inquiry.
          </p>
        </div>

        <div className="contact-layout">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-grid">
              <div className="contact-field">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="contact-field">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="contact-field">
              <label htmlFor="company">
                Company / Organisation
              </label>
              <input
                id="company"
                name="company"
                autoComplete="organization"
                value={form.company}
                onChange={handleChange}
              />
            </div>

            <div className="contact-form-grid">
              <div className="contact-field">
                <label htmlFor="interest">Area of Interest</label>
                <select
                  id="interest"
                  name="interest"
                  value={form.interest}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select an option</option>
                  <option>Global Sourcing</option>
                  <option>Market Access</option>
                  <option>Business Development</option>
                  <option>Trade & Investment</option>
                  <option>Strategic Advisory</option>
                  <option>Training & Capacity Building</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="contact-field">
                <label htmlFor="sector">Sector</label>
                <select
                  id="sector"
                  name="sector"
                  value={form.sector}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a sector</option>
                  <option>Energy</option>
                  <option>Raw & Critical Minerals</option>
                  <option>Precious Metals & Gemstones</option>
                  <option>Manufacturing</option>
                  <option>Agriculture</option>
                  <option>Waste Management</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="contact-field">
              <label htmlFor="message">Your Message</label>
              <textarea
                id="message"
                name="message"
                rows="7"
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>

            <button className="gold-button" type="submit">
              Prepare Email Inquiry
            </button>
          </form>

          <aside className="contact-details">
            <h2>Connect With Us</h2>
            <p>
              For business, sourcing, and partnership inquiries,
              please use the form or contact us by email.
            </p>

            <div className="contact-detail">
              <h3>Email</h3>
              <a href="mailto:info@alkebulanglobal.com">
                info@alkebulanglobal.com
              </a>
            </div>

            <div className="contact-detail">
              <h3>Areas of Focus</h3>
              <p>US–Africa Trade</p>
              <p>Global Sourcing</p>
              <p>Strategic Partnerships</p>
              <p>Business Development</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
