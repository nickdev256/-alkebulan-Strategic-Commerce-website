import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import CtaBand from '../components/CtaBand.jsx';
import PhotoBreak from '../components/PhotoBreak.jsx';
import Icon from '../components/Icon.jsx';
import { sectors } from '../content.js';
import './Portfolio.css';

// Same six sectors as the Core Sectors page, each with a short label.
const labels = ['Energy', 'Minerals', 'Manufacturing', 'Agriculture', 'Infrastructure', 'Strategic Projects'];
const projects = sectors.map((sector, i) => ({ ...sector, category: labels[i] }));

export default function Portfolio() {
  return (
    <>
      <PageHero
        image="/images/photos/strategy-table.jpg"
        imageAlt="Africa map and an Alkebulan Global notebook on a meeting table"
        focus="center 55%"
        eyebrow="Our Work"
        title="Projects & Engagements"
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

      <PhotoBreak
        image="/images/photos/boardroom.jpg"
        alt="Alkebulan Global boardroom with a world map display"
        focus="center 45%"
        eyebrow="From Introduction to Execution"
        title="Helping deals move from introductions to implementable transactions."
      />

      <CtaBand
        title="Have a Project to Explore?"
        text="Contact us to discuss a project, sourcing requirement, or strategic partnership."
      />
    </>
  );
}
