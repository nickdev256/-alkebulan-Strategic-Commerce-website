
import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-logo">
          <img
            src="/images/alkebulan-global-logo.png"
            alt="Alkebulan Global Logo"
          />
        </div>

        <h1>
          Where Excellence Meets Opportunity<sup>™</sup>
        </h1>

        <p className="hero-tagline">
          Strategic access. Global partnerships. Transformative projects.
        </p>

        <p className="hero-description">
          Connecting Africa, the United States, the Caribbean and
          global markets through relationships built to deliver results.
        </p>

        <div className="hero-actions">
          <Link to="/portfolio" className="hero-button hero-button-primary">
            Explore Opportunities
          </Link>

          <Link to="/contact" className="hero-button hero-button-outline">
            Engage Alkebulan Global
          </Link>
        </div>
      </div>
    </section>
  );
}
