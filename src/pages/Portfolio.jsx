import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import CtaBand from '../components/CtaBand.jsx';
import PhotoBreak from '../components/PhotoBreak.jsx';
import Icon from '../components/Icon.jsx';
import './Portfolio.css';

// Areas of potential engagement, each with a short description.
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
        title="Connecting Opportunities. Building Global Partnerships."
        intro="We explore strategic opportunities across key industries, bringing together African capabilities, international markets and relationships that can support sustainable commercial growth."
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
            {projects.map((project) => (
              <article className="card portfolio-card" key={project.title}>
                <div className="portfolio-card-top">
                  <div className="icon-badge" aria-hidden="true">
                    <Icon name={project.icon} />
                  </div>
                  <span className="tag">{project.category}</span>
                </div>

                <h3>{project.title}</h3>
                <p>{project.text}</p>

                <Link
                  to="/contact"
                  className="text-link"
                  aria-label={`Discuss ${project.title} with Alkebulan Global`}
                >
                  Discuss this opportunity
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
        title="Let's Explore What's Possible."
        text="Have a project, sourcing requirement or partnership opportunity? Connect with Alkebulan Global and let's explore how we can move it forward."
      />
    </>
  );
}
