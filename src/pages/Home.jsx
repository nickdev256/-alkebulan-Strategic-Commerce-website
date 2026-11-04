
import { Link } from 'react-router-dom';
import Hero from '../sections/Hero.jsx';
import './Home.css';

const sectors = [
  {
    title: 'Energy',
    text: 'Strategic energy infrastructure and project development connecting African resources to global demand.',
  },
  {
    title: 'Waste Management & Circular Economy',
    text: 'Innovative solutions transforming waste into resources and building sustainable circular systems.',
  },
  {
    title: 'Raw & Critical Minerals',
    text: 'Connecting African mineral assets to global supply chains with compliance and integrity.',
  },
  {
    title: 'Precious Metals & Gemstones',
    text: 'High-value commodity expertise connecting producers to premium markets responsibly.',
  },
  {
    title: 'Global Product Sourcing',
    text: 'Comprehensive sourcing solutions leveraging African production capabilities for global buyers.',
  },
];

const differentiators = [
  {
    title: 'Diplomatic Procurement Approach',
    text: 'We operate as a bridge between policy, commerce, and execution—supporting complex cross-border engagements where credibility, compliance, and stakeholder alignment matter.',
  },
  {
    title: 'Africa-to-U.S. Market Access',
    text: 'Connect African enterprises and projects to U.S. buyer ecosystems, institutional relationships, diaspora networks, and strategic partners—while enabling routes to the Middle East and global markets.',
  },
  {
    title: 'Execution-Ready Partnering',
    text: 'We prioritize real-world deliverability: qualified partners, clear roles, defined documentation flow, and practical commercial pathways from concept to completion.',
  },
  {
    title: 'High-Integrity Transaction Support',
    text: 'Support due diligence coordination, KYC/KYB readiness, and risk-managed structuring—helping deals move from introductions to implementable transactions.',
  },
];

const services = [
  {
    title: 'Market Intelligence & Strategy',
    text: 'Deep-dive analysis of sector dynamics, regulatory landscapes, and commercial opportunities. We provide actionable intelligence that informs strategic partnerships and market entry.',
  },
  {
    title: 'Cross-Border Transaction Support',
    text: 'From initial due diligence to final implementation, we coordinate complex multi-jurisdictional transactions with focus on compliance, risk mitigation, and stakeholder alignment.',
  },
  {
    title: 'Partnership Development',
    text: 'Strategic matchmaking connecting African enterprises, producers, and projects with qualified international partners, buyers, and institutional investors.',
  },
  {
    title: 'KYC/KYB & Compliance Coordination',
    text: 'Streamline Know-Your-Customer and Know-Your-Business processes, ensuring transaction readiness and reducing friction in cross-border engagement.',
  },
  {
    title: 'Stakeholder & Regulatory Liaison',
    text: 'Navigate complex policy environments and coordinate with government, institutional, and commercial stakeholders to ensure alignment and regulatory compliance.',
  },
];

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero matching the reference design */}
      <Hero />

      {/* Core Sectors */}
      <section className="home-sectors-section" id="sectors">
        <div className="home-section-header">
          <h2>Core Sectors</h2>
          <p>
            Strategic focus areas driving impact across Africa and
            global markets.
          </p>
        </div>

        <div className="home-sectors-grid">
          {sectors.map((sector) => (
            <article
              className="home-sector-card"
              key={sector.title}
            >
              <h3>{sector.title}</h3>
              <p>{sector.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* What Sets AG Apart */}
      <section
        className="home-differentiators-section"
        id="differentiators"
      >
        <h2>What Sets AG Apart</h2>

        <div className="home-differentiators-grid">
          {differentiators.map((item) => (
            <article
              className="home-differentiator"
              key={item.title}
            >
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Core Services */}
      <section className="home-services-section" id="services">
        <h2>Core Services</h2>

        <div className="home-services-list">
          {services.map((service) => (
            <article
              className="home-service-item"
              key={service.title}
            >
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>

        {/* Call to action */}
        <div className="home-bottom-cta">
          <h2>Ready to Explore an Opportunity?</h2>
          <p>
            Connect with Alkebulan Global to discuss strategic
            partnerships, market access, and transformative projects.
          </p>
          <Link to="/contact" className="home-cta-button">
            Engage Alkebulan Global
          </Link>
        </div>
      </section>
    </div>
  );
}
