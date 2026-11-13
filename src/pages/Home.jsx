import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../sections/Hero.jsx';
import Icon from '../components/Icon.jsx';
import CtaBand from '../components/CtaBand.jsx';
import PhotoBreak from '../components/PhotoBreak.jsx';
import { advantages, sectors, services } from '../content.js';
import './Home.css';

// The five strategic advantages, shown as a gold strip under the banner.
const pillars = advantages.map((item) => item.title);

// Quick facts beside the Who We Are introduction.
const facts = [
  { label: 'Founder & CEO', value: 'Ambassador Dr. Karen L. Booker', link: '/about/our-team' },
  { label: 'Headquarters', value: 'One World Trade Center, New York' },
  { label: 'Satellite offices', value: 'Uganda, Namibia, Mozambique, Nigeria' },
  { label: 'Connecting', value: 'Africa, the U.S., the Caribbean & global markets' },
];


// Six pillars: a list on the left, the chosen pillar's summary on the right.
// On phones the summary opens under the chosen pillar instead.
function ServiceExplorer() {
  const [active, setActive] = useState(0);
  const tabs = useRef([]);
  const service = services[active];

  const onKeyDown = (event) => {
    const last = services.length - 1;
    const moves = { ArrowDown: active + 1, ArrowRight: active + 1, ArrowUp: active - 1, ArrowLeft: active - 1, Home: 0, End: last };
    if (!(event.key in moves)) return;
    event.preventDefault();
    let next = moves[event.key];
    if (next < 0) next = last;
    if (next > last) next = 0;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="explorer">
      <div className="explorer-list" role="tablist" aria-label="Service pillars" aria-orientation="vertical" onKeyDown={onKeyDown}>
        {services.map((item, index) => {
          const selected = index === active;
          return (
            <div key={item.title} className={`explorer-item${selected ? ' is-active' : ''}`}>
              <button
                type="button"
                role="tab"
                id={`pillar-tab-${index}`}
                ref={(el) => { tabs.current[index] = el; }}
                aria-selected={selected}
                aria-controls="pillar-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(index)}
              >
                <span className="explorer-num">{String(index + 1).padStart(2, '0')}</span>
                <span className="explorer-title">{item.title}</span>
              </button>
              {/* Phone view: summary shows under the chosen pillar */}
              {selected && <p className="explorer-inline">{item.summary}</p>}
            </div>
          );
        })}
      </div>

      <div className="explorer-panel" role="tabpanel" id="pillar-panel" aria-labelledby={`pillar-tab-${active}`}>
        <div className="explorer-panel-body" key={active}>
          <span className="icon-badge">
            <Icon name={service.icon} size={26} />
          </span>
          <p className="explorer-count">
            Pillar {active + 1} of {services.length}
          </p>
          <h3>{service.title}</h3>
          <p>{service.summary}</p>
        </div>
        <Link to="/services/core-services" className="btn btn--primary">
          Explore our services
        </Link>
      </div>
    </div>
  );
}

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

      {/* Who we are: the first thing visitors read after the banner */}
      <section className="section section--white home-about">
        <div className="container home-intro">
          <div className="intro-text">
            <p className="eyebrow">Who We Are</p>
            <h2>We do more than connect opportunities</h2>
            <p className="intro-lead">
              Alkebulan Global LLC is a U.S.-based international strategic
              advisory, diplomatic procurement, and market-access enterprise
              connecting Africa with the United States, the Caribbean, and
              global markets.
            </p>
            <p>
              Founded by Ambassador Dr. Karen L. Booker, we work with
              governments, corporations, institutional buyers, investors,
              project developers, and qualified suppliers to identify
              commercially viable opportunities and advance them toward
              execution. We help establish the relationships, structures, and
              pathways necessary to transform opportunity into sustainable
              commercial value.
            </p>

            <dl className="intro-facts">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>
                    {fact.link ? <Link to={fact.link}>{fact.value}</Link> : fact.value}
                  </dd>
                </div>
              ))}
            </dl>

            <Link to="/about" className="btn btn--dark">
              More about Alkebulan Global
            </Link>
          </div>

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
        </div>
      </section>

      {/* Core Sectors */}
      <section className="section">
        <div className="container">
          <div className="home-head">
            <div className="section-head">
              <p className="eyebrow">Strategic Industry Sectors</p>
              <h2>Sectors central to diversification, industry, and trade</h2>
            </div>
            <Link to="/services/sectors" className="text-link">
              View all sectors
            </Link>
          </div>

          <ul className="sector-grid">
            {sectors.map((sector) => (
              <li key={sector.title}>
                <Link to="/services/sectors" className="sector-tile">
                  <span className="icon-badge">
                    <Icon name={sector.icon} />
                  </span>
                  <span>{sector.title}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link to="/contact" className="sector-tile sector-tile--more">
                <span>Have a different sector in mind?</span>
                <span className="sector-tile-link">Start a conversation</span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <PhotoBreak
        image="/images/photos/reception-wide.jpg"
        alt="Alkebulan Global reception with the company emblem above a marble desk"
        focus="center 40%"
        eyebrow="Our Commitment"
        title="Exceptional opportunities emerge when credible partners, sound strategies, and the capacity to execute come together."
      />

      {/* Core Services: pick a pillar to read a short summary */}
      <section className="section section--white">
        <div className="container">
          <div className="home-head">
            <div className="section-head">
              <p className="eyebrow">Core Services</p>
              <h2>Six strategic service pillars</h2>
              <p>Select a pillar to see what it covers.</p>
            </div>
            <Link to="/services/core-services" className="text-link">
              View all services
            </Link>
          </div>

          <ServiceExplorer />
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
