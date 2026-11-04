
import { Link } from 'react-router-dom';
import './Portfolio.css';

const projects = [
  {
    category: 'Energy',
    title: 'Energy Infrastructure',
    text: 'Exploring connections between energy project developers, strategic partners, and potential international buyers.',
  },
  {
    category: 'Critical Minerals',
    title: 'Responsible Mineral Sourcing',
    text: 'Supporting responsible sourcing discussions, traceability considerations, and compliant supply-chain relationships.',
  },
  {
    category: 'Manufacturing',
    title: 'African Manufacturing',
    text: 'Exploring pathways for African manufacturers to meet international buyer requirements and develop export opportunities.',
  },
  {
    category: 'Agriculture',
    title: 'Agricultural Export Development',
    text: 'Connecting agricultural producers with potential international buyers and relevant market-entry support.',
  },
  {
    category: 'Precious Metals',
    title: 'Precious Metals Market Access',
    text: 'Exploring responsible market-access pathways that account for due diligence and supply-chain integrity.',
  },
  {
    category: 'Trade Finance',
    title: 'Trade Finance Partnerships',
    text: 'Identifying potential finance and institutional relationships to support commercially viable trade opportunities.',
  },
];

export default function Portfolio() {
  return (
    <div className="portfolio-page">
      <section className="portfolio-hero">
        <p className="eyebrow">Our Work</p>
        <h1>Opportunities &amp; Engagements</h1>
        <p>
          Exploring strategic opportunities across sectors that
          connect African capabilities with global markets.
        </p>
      </section>

      <section className="portfolio-content">
        <div className="portfolio-intro">
          <h2>Areas of Engagement</h2>
          <p>
            The examples below illustrate areas of potential focus.
            They are not representations of completed projects or
            confirmed client engagements.
          </p>
        </div>

        <div className="portfolio-grid">
          {projects.map((project) => (
            <article className="portfolio-card" key={project.title}>
              <div className="portfolio-accent" />
              <p className="portfolio-category">{project.category}</p>
              <h2>{project.title}</h2>
              <p>{project.text}</p>
              <Link to="/contact">Discuss this area →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="portfolio-cta">
        <h2>Have an Opportunity to Explore?</h2>
        <p>
          Contact us to discuss a project, sourcing requirement,
          or strategic partnership.
        </p>
        <Link to="/contact" className="gold-button">
          Start a Conversation
        </Link>
      </section>
    </div>
  );
}
