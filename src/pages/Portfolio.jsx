import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import CtaBand from '../components/CtaBand.jsx';
import Icon from '../components/Icon.jsx';
import './Portfolio.css';

const projects = [
  { icon: 'bolt', category: 'Energy', title: 'Energy Infrastructure', text: 'Exploring connections between energy project developers, strategic partners, and potential international buyers.' },
  { icon: 'mountain', category: 'Critical Minerals', title: 'Responsible Mineral Sourcing', text: 'Supporting responsible sourcing discussions, traceability considerations, and compliant supply-chain relationships.' },
  { icon: 'factory', category: 'Manufacturing', title: 'African Manufacturing', text: 'Exploring pathways for African manufacturers to meet international buyer requirements and develop export opportunities.' },
  { icon: 'wheat', category: 'Agriculture', title: 'Agricultural Export Development', text: 'Connecting agricultural producers with potential international buyers and relevant market-entry support.' },
  { icon: 'gem', category: 'Precious Metals', title: 'Precious Metals Market Access', text: 'Exploring responsible market-access pathways that account for due diligence and supply-chain integrity.' },
  { icon: 'coins', category: 'Trade Finance', title: 'Trade Finance Partnerships', text: 'Identifying potential finance and institutional relationships to support commercially viable trade opportunities.' },
];

export default function Portfolio() {
  return (
    <>
      <PageHero
        eyebrow="Our Work"
        title="Opportunities & Engagements"
        intro="Exploring strategic opportunities across sectors that connect African capabilities with global markets."
      />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Areas of Engagement</p>
            <h2>Where we see opportunity</h2>
          </div>

          <p className="portfolio-note">
            <Icon name="file" size={18} />
            The examples below illustrate areas of potential focus. They are
            not representations of completed projects or confirmed client
            engagements.
          </p>

          <div className="grid grid--3">
            {projects.map((project) => (
              <article className="card" key={project.title}>
                <div className="portfolio-card-top">
                  <div className="icon-badge">
                    <Icon name={project.icon} />
                  </div>
                  <span className="tag">{project.category}</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.text}</p>
                <Link to="/contact" className="text-link">
                  Discuss this area
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Have an Opportunity to Explore?"
        text="Contact us to discuss a project, sourcing requirement, or strategic partnership."
      />
    </>
  );
}
