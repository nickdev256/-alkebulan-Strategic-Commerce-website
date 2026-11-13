import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import CtaBand from '../components/CtaBand.jsx';
import PhotoBreak from '../components/PhotoBreak.jsx';
import Icon from '../components/Icon.jsx';
import { sectors } from '../content.js';
import './Portfolio.css';

// Our approach to engagement: five interconnected stages.
const stages = [
  { title: 'Discover', text: 'Identify opportunities, client objectives, market requirements, and commercial priorities.' },
  { title: 'Validate', text: 'Assess counterparties, commercial feasibility, risks, compliance requirements, and strategic alignment.' },
  { title: 'Structure', text: 'Support partnership frameworks, procurement pathways, commercial arrangements, and implementation strategies.' },
  { title: 'Enable', text: 'Coordinate qualified stakeholders, technical expertise, institutional engagement, and project-development activities.' },
  { title: 'Advance', text: 'Support commercial progress, relationship management, milestone tracking, and transition toward implementation.' },
];

const STAGE_TIME = 6000;

/*
 * Interactive five-stage stepper. It plays through the stages on its own while
 * it is on screen, pauses on hover or focus, and stops once a visitor picks a
 * stage themselves.
 */
function StageStepper() {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  const tabs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const playing = autoplay && inView && !paused;

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setTimeout(() => setActive((i) => (i + 1) % stages.length), STAGE_TIME);
    return () => clearTimeout(timer);
  }, [playing, active]);

  const choose = (index, focus = false) => {
    setAutoplay(false);
    setActive(index);
    if (focus) tabs.current[index]?.focus();
  };

  const onKeyDown = (event) => {
    const last = stages.length - 1;
    const moves = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: last };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = moves[event.key];
    choose(next < 0 ? last : next > last ? 0 : next, true);
  };

  const stage = stages[active];

  return (
    <div
      className="stepper"
      ref={ref}
      style={{ '--stage-progress': active / (stages.length - 1) }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <ol className="stage-list" role="tablist" aria-label="Engagement stages" onKeyDown={onKeyDown}>
        {stages.map((item, index) => (
          <li key={item.title} role="presentation">
            <button
              type="button"
              role="tab"
              id={`stage-tab-${index}`}
              ref={(el) => { tabs.current[index] = el; }}
              aria-selected={index === active}
              aria-controls="stage-panel"
              tabIndex={index === active ? 0 : -1}
              className={`stage-btn${index === active ? ' is-active' : ''}${index < active ? ' is-done' : ''}`}
              onClick={() => choose(index)}
            >
              <span className="stage-num">{index + 1}</span>
              <span className="stage-title">{item.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <div
        className="stage-panel"
        role="tabpanel"
        id="stage-panel"
        aria-labelledby={`stage-tab-${active}`}
        aria-live="polite"
      >
        <div className="stage-panel-body" key={active}>
          <p className="stage-panel-count">
            Stage {active + 1} of {stages.length}
          </p>
          <h3>{stage.title}</h3>
          <p>{stage.text}</p>
        </div>

        <div className="stage-panel-foot">
          <div className={`stage-timer${playing ? ' is-playing' : ''}`} aria-hidden="true">
            <span key={`${active}-${autoplay}`} style={{ animationDuration: `${STAGE_TIME}ms` }} />
          </div>
          <div className="stage-nav">
            <button
              type="button"
              aria-label="Previous stage"
              onClick={() => choose(active === 0 ? stages.length - 1 : active - 1)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button
              type="button"
              aria-label="Next stage"
              onClick={() => choose((active + 1) % stages.length)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

      <section className="section section--white">
        <div className="container">
          <div className="section-head section-head--center">
            <p className="eyebrow">Our Approach to Engagement</p>
            <h2>Five interconnected stages</h2>
            <p>How we move an opportunity from first conversation toward implementation.</p>
          </div>

          <StageStepper />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Areas of Engagement</p>
            <h2>Where we see opportunity</h2>
          </div>

          <p className="portfolio-note">
            <Icon name="file" size={18} />
            These are areas of focus. They are not representations of
            completed projects or confirmed client engagements.
          </p>

          <ul className="area-list">
            {sectors.map((sector) => (
              <li key={sector.title}>
                <Link to="/contact" className="area-item">
                  <span className="icon-badge">
                    <Icon name={sector.icon} />
                  </span>
                  <span className="area-title">{sector.title}</span>
                  <span className="area-link">Discuss</span>
                </Link>
              </li>
            ))}
          </ul>
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
