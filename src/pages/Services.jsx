import { useLocation } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import CtaBand from '../components/CtaBand.jsx';
import Icon from '../components/Icon.jsx';
import { subPages } from '../navigation.js';
import { sectors, services } from '../content.js';
import './Services.css';

const tabs = subPages('Expertise');

export default function Services() {
  const { pathname } = useLocation();
  const isSectors = pathname.endsWith('/sectors');
  const title = isSectors ? 'Core Sectors' : 'Core Services';

  return (
    <>
      <PageHero
        eyebrow="Our Expertise"
        title={title}
        intro="Strategic support for market access, cross-border commerce, supplier development, and international partnerships."
        tabs={tabs}
      />

      <section className="section">
        <div className="container">
          {isSectors ? (
            <>
              <div className="section-head">
                <p className="eyebrow">Where we focus</p>
                <h2>Five sectors, one integrated approach</h2>
              </div>
              <div className="grid grid--3">
                {sectors.map((item) => (
                  <article className="card" key={item.title}>
                    <div className="icon-badge">
                      <Icon name={item.icon} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="section-head">
                <p className="eyebrow">What we do</p>
                <h2>Support at every stage of the engagement</h2>
              </div>
              <div className="service-rows">
                {services.map((item, index) => (
                  <article className="service-row" key={item.title}>
                    <span className="service-row-num">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="icon-badge">
                      <Icon name={item.icon} />
                    </div>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <CtaBand
        title="Discuss Your Requirements"
        text="Tell us about your sector, project, or sourcing needs."
        button="Contact Us"
      />
    </>
  );
}
