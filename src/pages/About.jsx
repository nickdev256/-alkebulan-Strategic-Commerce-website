
import { Link, useLocation } from 'react-router-dom';
import './About.css';

const pages = {
  'company-snapshot': {
    title: 'Company Snapshot',
    intro: 'An overview of Alkebulan Global and our strategic purpose.',
  },
  'who-we-are': {
    title: 'Who We Are',
    intro: 'A strategic business firm focused on global sourcing, advisory, and business development.',
  },
  'strategic-partners': {
    title: 'Strategic Partners',
    intro: 'Building partnerships between African enterprises and international markets.',
  },
  'what-sets-us-apart': {
    title: 'What Sets AG Apart',
    intro: 'A considered approach to market access, compliance, and cross-border execution.',
  },
};

const foundation = [
  ['Our Mission', 'To connect African enterprises with global opportunities through strategic commerce, trusted partnerships, and practical execution.'],
  ['Our Approach', 'We bring together market intelligence, stakeholder coordination, partnership development, and transaction support.'],
  ['Our Three-Pillar Strategy', 'Strategic thinking, business development, and organisational analysis underpin our approach to sustainable growth.'],
];

const partners = [
  ['African Enterprises & Producers', 'Support market access and connections with qualified international buyers.'],
  ['Corporate & Commercial Partners', 'Explore sourcing, supplier relationships, investment opportunities, and cross-border collaboration.'],
  ['Institutional & Development Partners', 'Coordinate with relevant institutions, agencies, and stakeholders where there is a shared objective.'],
  ['Professional Service Partners', 'Collaborate with qualified legal, compliance, financial, logistics, and sector specialists.'],
];

const advantages = [
  ['Diplomatic Procurement', 'Bridge policy, commerce, and execution in complex cross-border engagements.'],
  ['Africa-to-U.S. Market Access', 'Connect African enterprises to relevant buyer ecosystems and strategic relationships.'],
  ['Execution-Ready Partnerships', 'Establish clear roles, qualified partners, documentation, and practical commercial pathways.'],
  ['High-Integrity Transactions', 'Coordinate due diligence, KYC/KYB readiness, and risk-aware transaction processes.'],
  ['Strategic Market Intelligence', 'Use sector and market analysis to inform partnership and market-entry decisions.'],
  ['Stakeholder Coordination', 'Help align commercial, institutional, and other relevant stakeholders.'],
];

function Cards({ items }) {
  return (
    <div className="about-grid">
      {items.map(([title, text]) => (
        <article className="about-card" key={title}>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}

export default function About() {
  const location = useLocation();
  const slug = location.pathname.split('/')[2] || 'company-snapshot';
  const page = pages[slug] || pages['company-snapshot'];

  return (
    <div className="about-page">
      <section className="about-hero">
        <p className="eyebrow">About Alkebulan Global</p>
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
      </section>

      {slug === 'company-snapshot' && (
        <section className="about-section">
          <div className="about-copy">
            <h2>Our Company</h2>
            <p>
              Alkebulan Global is a strategic business firm focused on
              global sourcing, strategic thinking, leadership consulting,
              business development, and organisational analysis.
            </p>
            <p>
              With a focus on Africa-linked trade and investment, our
              approach is to help connect African capabilities with
              relevant international buyers, partners, and opportunities.
            </p>
            <p>
              We aim to bridge policy, commerce, and execution through
              professional relationships, clear processes, and a
              commitment to integrity.
            </p>
          </div>
          <h2 className="about-heading">Our Strategic Foundation</h2>
          <Cards items={foundation} />
        </section>
      )}

      {slug === 'who-we-are' && (
        <section className="about-section">
          <h2>Our Identity</h2>
          <p className="about-intro">
            We work at the intersection of commerce, strategic advisory,
            partnership development, and market access.
          </p>
          <Cards items={foundation} />
          <div className="about-copy">
            <h2>How We Work</h2>
            <p>
              We begin by understanding the organisation, opportunity,
              sector requirements, and intended outcome. We then help
              identify potential partners and coordinate the steps
              required to explore a commercially viable relationship.
            </p>
            <p>
              Each engagement should be guided by appropriate due
              diligence, clear communication, and realistic expectations.
            </p>
          </div>
        </section>
      )}

      {slug === 'strategic-partners' && (
        <section className="about-section">
          <h2>Our Partnership Network</h2>
          <p className="about-intro">
            Strong international commerce depends on reliable relationships
            across suppliers, buyers, institutions, and specialist advisers.
          </p>
          <Cards items={partners} />
          <div className="about-copy">
            <h2>Partnership Benefits</h2>
            <ul>
              <li>Explore new market and sourcing opportunities.</li>
              <li>Build relationships with relevant commercial partners.</li>
              <li>Coordinate due diligence and transaction readiness.</li>
              <li>Improve communication between stakeholders.</li>
              <li>Identify practical pathways from introductions to execution.</li>
            </ul>
          </div>
        </section>
      )}

      {slug === 'what-sets-us-apart' && (
        <section className="about-section">
          <h2>Our Competitive Advantages</h2>
          <p className="about-intro">
            We focus on practical collaboration, market access, and
            responsible execution rather than introductions alone.
          </p>
          <Cards items={advantages} />
        </section>
      )}

      <section className="about-navigation">
        <h2>Explore About Us</h2>
        <div className="about-page-links">
          {Object.entries(pages).map(([key, item]) => (
            <Link to={`/about/${key}`} key={key}>
              {item.title} <span>→</span>
            </Link>
          ))}
        </div>
        <Link to="/contact" className="gold-button">
          Discuss a Partnership
        </Link>
      </section>
    </div>
  );
}
