import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Strategic Commerce &amp; Development</p>

          <h1>
            Where Excellence Meets Opportunity
          </h1>

          <p className="hero-tagline">
            Strategic access. Global partnerships. Transformative projects.
          </p>

          <p className="hero-description">
            Connecting Africa, the United States, the Caribbean and global
            markets through relationships built to deliver results.
          </p>

          <div className="hero-actions">
            <Link to="/portfolio" className="btn btn--primary">
              Explore Projects
            </Link>
            <Link to="/contact" className="btn btn--ghost">
              Engage Alkebulan Global
            </Link>
          </div>
        </div>

        {/* Brand emblem with slowly turning orbit rings */}
        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit--outer">
            <span className="orbit-dot" />
          </div>
          <div className="orbit orbit--inner">
            <span className="orbit-dot" />
          </div>
          <div className="hero-emblem-glow" />
          <img
            className="hero-emblem"
            src="/images/alkebulan-emblem.jpg"
            alt=""
            width="480"
            height="480"
          />

          <div className="hero-badge hero-badge--top">
            <strong>6</strong> Core sectors
          </div>
          <div className="hero-badge hero-badge--bottom">
            <strong>4</strong> Regions connected
          </div>
        </div>
      </div>
    </section>
  );
}
