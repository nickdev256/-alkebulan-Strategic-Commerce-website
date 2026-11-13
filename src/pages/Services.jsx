import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import CtaBand from '../components/CtaBand.jsx';
import PhotoBreak from '../components/PhotoBreak.jsx';
import Icon from '../components/Icon.jsx';
import { subPages } from '../navigation.js';
import { sectors, services } from '../content.js';
import './Services.css';

const tabs = subPages('Expertise');

// One service pillar: the summary is always visible, the detail opens on click.
function ServiceRow({ item, index, open, onToggle }) {
  const id = `service-detail-${index}`;
  return (
    <article className={`service-row${open ? ' is-open' : ''}`}>
      <span className="service-row-num">{String(index + 1).padStart(2, '0')}</span>
      <div className="icon-badge">
        <Icon name={item.icon} />
      </div>
      <div>
        <h3>
          <button type="button" className="service-toggle" aria-expanded={open} aria-controls={id} onClick={onToggle}>
            <span>{item.title}</span>
            <span className="service-plus" aria-hidden="true" />
          </button>
        </h3>
        <p>{item.text}</p>
        <div className="service-row-more" id={id}>
          <div>
            <p className="service-row-detail">{item.detail}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Services() {
  const [openRows, setOpenRows] = useState(() => new Set([0]));
  const toggle = (index) =>
    setOpenRows((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const { pathname } = useLocation();
  const isSectors = pathname.endsWith('/sectors');
  const title = isSectors ? 'Core Sectors' : 'Core Services';

  return (
    <>
      <PageHero
        image="/images/photos/boardroom.jpg"
        imageAlt="Alkebulan Global boardroom with a world map display"
        focus="center 40%"
        eyebrow="Our Expertise"
        title={title}
        intro="Strategic advisory, diplomatic procurement, and global market access across Africa and international markets."
        tabs={tabs}
      />

      <section className="section">
        <div className="container">
          {isSectors ? (
            <>
              <div className="section-head">
                <p className="eyebrow">Strategic Industry Sectors</p>
                <h2>Eight sectors at the heart of growth and trade</h2>
                <p>
                  Alkebulan Global focuses on sectors central to economic
                  diversification, industrial development, and international
                  trade.
                </p>
              </div>
              <div className="sector-cards">
                {sectors.map((item) => (
                  <article className="card" key={item.title}>
                    <div className="icon-badge">
                      <Icon name={item.icon} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                ))}
                <Link to="/contact" className="sector-cards-cta">
                  <h3>Have a project in one of these sectors?</h3>
                  <span>Discuss your requirements</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="section-head">
                <p className="eyebrow">What we do</p>
                <h2>Our six strategic service pillars</h2>
                <p>Select a pillar to see how it works in practice.</p>
              </div>
              <div className="service-rows">
                {services.map((item, index) => (
                  <ServiceRow
                    key={item.title}
                    item={item}
                    index={index}
                    open={openRows.has(index)}
                    onToggle={() => toggle(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <PhotoBreak
        image="/images/photos/trade-briefing-wide.jpg"
        alt="Alkebulan Global presenter leading a briefing on Africa–U.S. trade and investment opportunities"
        focus="center 4%"
        eyebrow="Africa–U.S. Trade & Investment"
        title="From responsible sourcing to project enablement and investor readiness."
      />

      <CtaBand
        title="Discuss Your Requirements"
        text="Tell us about your sector, project, or sourcing needs."
        button="Contact Us"
      />
    </>
  );
}
