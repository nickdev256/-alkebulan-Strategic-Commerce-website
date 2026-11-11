import { Link } from 'react-router-dom';
import Hero from '../sections/Hero.jsx';
import Icon from '../components/Icon.jsx';
import CtaBand from '../components/CtaBand.jsx';
import PhotoBreak from '../components/PhotoBreak.jsx';
import { advantages, sectors, services } from '../content.js';
import './Home.css';

// The four pillars from the brand logo.
const pillars = ['Access', 'Partnerships', 'Investment', 'Impact'];


export default function Home() {
  return (
    <>
      <Hero />

      <div className="pillars">
        <div className="container">
          {pillars.map((item) => (
            <span key={item}>{item}</span> 
          ))}
        </div>
      </div>

      {/* Who we are, with photos */}
      <section className="section section--white">
        <div className="container home-intro">
          <div className="intro-photos">
            <img
              className="intro-photo-main"
              src="/images/photos/executive-office.jpg"
              alt="Alkebulan Global executive office with the company emblem"
              width="1100"
              height="1557"
              loading="lazy"
            />
            <img
              className="intro-photo-inset"
              src="/images/photos/workspace.jpg"
              alt="Open-plan Alkebulan Global office with city views"
              width="1100"
              height="1557"
              loading="lazy"
            />
          </div>

          <div className="intro-text">
            <p className="eyebrow">Who We Are</p>
            <h2>A trusted bridge between African capability and global opportunity</h2>
            <p>
              Alkebulan Global is a strategic business firm focused on global
              sourcing, strategic thinking, leadership consulting, business
              development, and organizational analysis.
            </p>
            <p>
              Headquartered at One World Trade Center in New York, with
              satellite offices in Uganda, Namibia, Mozambique, and Nigeria,
              we connect African enterprises with international buyers,
              partners, and investors.
            </p>
            <Link to="/about" className="btn btn--dark">
              About Alkebulan Global
            </Link>
          </div>
        </div>
      </section>

      {/* Core Sectors */}
      <section className="section">
        <div className="container">
          <div className="home-head">
            <div className="section-head">
              <p className="eyebrow">Core Sectors</p>
              <h2>Strategic focus areas</h2>
              <p>Driving impact across Africa and global markets.</p>
            </div>
            <Link to="/services/sectors" className="text-link">
              View all sectors
            </Link>
          </div>

          <div className="grid grid--3">
            {sectors.map((sector) => (
              <article className="card" key={sector.title}>
                <div className="icon-badge">
                  <Icon name={sector.icon} />
                </div>
                <h3>{sector.title}</h3>
                <p>{sector.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PhotoBreak
        image="/images/photos/reception-wide.jpg"
        alt="Alkebulan Global reception with the company emblem above a marble desk"
        focus="center 40%"
        eyebrow="Alkebulan Global"
        title="Connecting Opportunity. Building Legacy."
      />

      {/* What Sets Alkebulan Global Apart */}
      <section className="section section--dark">
        <div className="container">
          <div className="home-head">
            <div className="section-head">
              <p className="eyebrow">What Sets Alkebulan Global Apart</p>
              <h2>Built for complex, cross-border engagements</h2>
            </div>
            <Link to="/about/what-sets-us-apart" className="text-link text-link--light">
              All advantages
            </Link>
          </div>

          <div className="grid grid--2">
            {advantages.slice(0, 4).map((item, index) => (
              <article className="card card--dark" key={item.title}>
                <span className="card-number">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="section section--white">
        <div className="container split split--top">
          <div className="services-intro">
            <p className="eyebrow">Core Services</p>
            <h2>From first introduction to implementable transaction</h2>
            <p className="lead">
              Practical support across intelligence, compliance,
              partnerships, and stakeholder coordination.
            </p>
            <Link to="/services/core-services" className="btn btn--dark">
              Explore our services
            </Link>
          </div>

          <ol className="service-steps">
            {services.slice(0, 5).map((service) => (
              <li key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="section--white">
        <CtaBand
          title="Ready to Explore an Opportunity?"
          text="Connect with Alkebulan Global to discuss strategic partnerships, market access, and transformative projects."
        />
      </div>
    </>
  );
}
