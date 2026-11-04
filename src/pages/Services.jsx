
import { Link, useLocation } from 'react-router-dom';
import './Services.css';

const sectors = [
  ['Energy', 'Strategic energy infrastructure and project development connecting African resources to global demand.'],
  ['Waste Management & Circular Economy', 'Innovative solutions transforming waste into resources and building sustainable circular systems.'],
  ['Raw & Critical Minerals', 'Connecting African mineral assets to global supply chains with compliance and integrity.'],
  ['Precious Metals & Gemstones', 'High-value commodity expertise connecting producers to premium markets responsibly.'],
  ['Global Product Sourcing', 'Comprehensive sourcing solutions leveraging African production capabilities for global buyers.'],
];

const services = [
  ['Market Intelligence & Strategy', 'Analysis of sector dynamics, regulatory landscapes, and commercial opportunities.'],
  ['Cross-Border Transaction Support', 'Coordination of transactions with a focus on compliance, risk mitigation, documentation, and stakeholder alignment.'],
  ['Partnership Development', 'Connecting enterprises, producers, and projects with international partners, buyers, and investors.'],
  ['KYC/KYB & Compliance Coordination', 'Supporting customer and business verification processes for cross-border engagement.'],
  ['Stakeholder & Regulatory Liaison', 'Coordination with government, institutional, and commercial stakeholders.'],
  ['Value Chain Training & Capacity Building', 'Training in export readiness, quality standards, supply chain management, and buyer relationships.'],
  ['Manufacturing & Vocational Training', 'Technical and vocational skills development aligned with manufacturing and industry requirements.'],
];

export default function Services() {
  const location = useLocation();
  const isSectors = location.pathname.endsWith('/sectors');
  const items = isSectors ? sectors : services;

  return (
    <div className="services-page">
      <section className="services-hero">
        <p className="eyebrow">Our Expertise</p>
        <h1>{isSectors ? 'Core Sectors' : 'Core Services'}</h1>
        <p>
          Strategic support for market access, cross-border commerce,
          supplier development, and international partnerships.
        </p>
        <div className="services-switch">
          <Link to="/services/sectors">Core Sectors</Link>
          <Link to="/services/core-services">Core Services</Link>
        </div>
      </section>

      <section className="services-content">
        <div className="services-grid">
          {items.map(([title, text]) => (
            <article className="services-card" key={title}>
              <span className="services-line" />
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="services-cta">
        <h2>Discuss Your Requirements</h2>
        <p>Tell us about your sector, project, or sourcing needs.</p>
        <Link to="/contact" className="gold-button">
          Contact Us
        </Link>
      </section>
    </div>
  );
}
