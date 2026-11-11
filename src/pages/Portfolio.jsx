
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import CtaBand from '../components/CtaBand.jsx';
import Icon from '../components/Icon.jsx';
import './Portfolio.css';

const projects = [
  {
    icon: 'bolt',
    category: 'Energy',
    title: 'Energy & Infrastructure',
    text: 'Exploring strategic relationships between energy developers, infrastructure partners, investors and international markets to support commercially viable opportunities.',
  },
  {
    icon: 'mountain',
    category: 'Critical Minerals',
    title: 'Responsible Mineral Sourcing',
    text: 'Supporting responsible sourcing initiatives, supply-chain transparency, traceability and partnerships that align with international due diligence expectations.',
  },
  {
    icon: 'factory',
    category: 'Manufacturing',
    title: 'African Manufacturing',
    text: 'Exploring opportunities for African manufacturers to strengthen market readiness, meet international buyer requirements and expand their global reach.',
  },
  {
    icon: 'wheat',
    category: 'Agriculture',
    title: 'Agricultural Trade & Exports',
    text: 'Connecting agricultural producers and businesses with potential international buyers, market-entry opportunities and strategic trade relationships.',
  },
  {
    icon: 'gem',
    category: 'Precious Metals',
    title: 'Precious Metals & Market Access',
    text: 'Exploring responsible market-access opportunities with attention to supply-chain integrity, regulatory considerations and trusted commercial relationships.',
  },
  {
    icon: 'coins',
    category: 'Trade Finance',
    title: 'Trade Finance & Partnerships',
    text: 'Exploring potential relationships with financial institutions, investors and strategic partners to support structured and commercially viable trade.',
  },
];

export default function Portfolio() {
  return (
    <>
      <PageHero
        eyebrow="Our Work"
        title="Connecting Opportunities. Building Global Partnerships."
        intro="We explore strategic opportunities across key industries, bringing together African capabilities, international markets and relationships that can support sustainable commercial growth."
      />

      <section className="section">
        <div className="container">

          <div className="section-head">
            <p className="eyebrow">Our Areas of Engagement</p>
            <h2>Where Strategy Meets Opportunity</h2>
            <p>
              Our work focuses on identifying opportunities, facilitating
              meaningful connections and exploring partnerships across
              sectors with potential for long-term value creation.
            </p>
          </div>

          <div className="portfolio-note">
            <Icon name="file" size={18} />
            <p>
              The areas presented below represent sectors of potential
              engagement and strategic focus. They are illustrative
              opportunities and should not be interpreted as completed
              projects, confirmed transactions or existing client engagements.
            </p>
          </div>

          <div className="grid grid--3">
            {projects.map((project, index) => (
              <article
                className="card portfolio-card"
                key={project.title}
              >
                <div className="portfolio-card-top">
                  <div className="icon-badge" aria-hidden="true">
                    <Icon name={project.icon} />
                  </div>

                  <span className="tag">
                    {project.category}
                  </span>
                </div>

                <h3>{project.title}</h3>

                <p>{project.text}</p>

                <Link
                  to="/contact"
                  className="text-link"
                  aria-label={`Discuss ${project.title} with Alkebulan Global`}
                >
                  Discuss this opportunity
                  <span aria-hidden="true"> →</span>
                </Link>
              </article>
            ))}
          </div>

        </div>
      </section>

      <CtaBand
        title="Let's Explore What's Possible."
        text="Have a project, sourcing requirement or partnership opportunity? Connect with Alkebulan Global and let's explore how we can move it forward."
      />
    </>
  );
}
