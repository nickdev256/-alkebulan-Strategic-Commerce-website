import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import CtaBand from '../components/CtaBand.jsx';
import PhotoBreak from '../components/PhotoBreak.jsx';
import Icon from '../components/Icon.jsx';
import { activeProjects, projectSectors } from '../projects.js';
import { scrollToTarget } from '../lib/smoothScroll.js';
import './Portfolio.css';

// Areas of potential engagement, each with a short description.
const projects = [
  {
    icon: 'bolt',
    category: 'Energy',
    sector: 'energy',
    title: 'Energy & Infrastructure',
    text: 'Exploring strategic relationships between energy developers, infrastructure partners, investors and international markets to support commercially viable opportunities.',
  },
  {
    icon: 'mountain',
    category: 'Critical Minerals',
    sector: 'minerals',
    title: 'Responsible Mineral Sourcing',
    text: 'Supporting responsible sourcing initiatives, supply-chain transparency, traceability and partnerships that align with international due diligence expectations.',
  },
  {
    icon: 'factory',
    category: 'Manufacturing',
    sector: 'manufacturing',
    title: 'African Manufacturing',
    text: 'Exploring opportunities for African manufacturers to strengthen market readiness, meet international buyer requirements and expand their global reach.',
  },
  {
    icon: 'wheat',
    category: 'Agriculture',
    sector: 'agriculture',
    title: 'Agricultural Trade & Exports',
    text: 'Connecting agricultural producers and businesses with potential international buyers, market-entry opportunities and strategic trade relationships.',
  },
  {
    icon: 'gem',
    category: 'Precious Metals',
    sector: 'precious-metals',
    title: 'Precious Metals & Market Access',
    text: 'Exploring responsible market-access opportunities with attention to supply-chain integrity, regulatory considerations and trusted commercial relationships.',
  },
  {
    icon: 'coins',
    category: 'Trade Finance',
    sector: 'trade-finance',
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
              <Icon name="chevron-left" size={18} />
            </button>
            <button
              type="button"
              aria-label="Next stage"
              onClick={() => choose((active + 1) % stages.length)}
            >
              <Icon name="chevron-right" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const countBySector = (key) => activeProjects.filter((p) => p.sector === key).length;
const sectorOf = (key) => projectSectors.find((s) => s.key === key) ?? { label: key, icon: 'target' };

// Headline figures for the projects section.
const projectStats = [
  { value: activeProjects.length, label: 'Active projects' },
  { value: new Set(activeProjects.map((p) => p.country)).size, label: 'Countries' },
  { value: new Set(activeProjects.map((p) => p.sector)).size, label: 'Sectors' },
];

function ProjectCard({ project }) {
  const sector = sectorOf(project.sector);
  return (
    <li className="project-card">
      <div className="project-cover">
        <span className="project-cover-icon" aria-hidden="true">
          <Icon name={sector.icon} size={30} />
        </span>
        <span className="project-status">
          <span className="project-status-dot" aria-hidden="true" />
          {project.status}
        </span>
        <span className="project-cover-place">
          <img src={`https://flagcdn.com/${project.code}.svg`} alt="" width="40" height="27" loading="lazy" />
          {project.country}
        </span>
      </div>

      <div className="project-body">
        <span className="project-sector">{sector.label}</span>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>

        <dl className="project-meta">
          <div>
            <dt>Location</dt>
            <dd>{project.country}</dd>
          </div>
          <div>
            <dt>Sector</dt>
            <dd>{sector.label}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{project.status}</dd>
          </div>
        </dl>

        <Link to="/contact" className="btn btn--dark project-cta" aria-label={`Request the project brief for ${project.title}`}>
          Request project brief
        </Link>
      </div>
    </li>
  );
}

// Active projects with a search box and sector / country filters. The chosen
// sector and country are kept in the address (?sector=energy&country=Namibia)
// so a filtered list can be shared as a link.
function ActiveProjects({ sector, country, onSector, onCountry, onClear }) {
  const [query, setQuery] = useState('');
  const countries = [...new Set(activeProjects.map((p) => p.country))].sort();
  const q = query.trim().toLowerCase();
  const shown = activeProjects.filter(
    (p) =>
      (sector === 'all' || p.sector === sector) &&
      (country === 'all' || p.country === country) &&
      (!q || [p.title, p.country, p.summary, sectorOf(p.sector).label].join(' ').toLowerCase().includes(q)),
  );
  const filtered = sector !== 'all' || country !== 'all' || q;

  const clearAll = () => {
    setQuery('');
    onClear();
  };

  return (
    <section className="section section--white projects-section" id="active-projects" aria-labelledby="active-projects-title">
      <div className="container">
        <div className="projects-head">
          <div className="section-head">
            <p className="eyebrow">Active Projects</p>
            <h2 id="active-projects-title">Projects we are currently advancing</h2>
            <p>
              Explore opportunities by sector and country. Project briefs are
              shared with qualified partners on request.
            </p>
          </div>

          <dl className="projects-stats">
            {projectStats.map((stat) => (
              <div key={stat.label}>
                <dt>{stat.label}</dt>
                <dd data-count={stat.value}>{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="projects-toolbar">
          <div className="projects-search">
            <Icon name="search" size={18} />
            <label htmlFor="project-search" className="visually-hidden">Search projects</label>
            <input
              id="project-search"
              type="search"
              placeholder="Search by project, country or sector"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <label className="projects-select">
            <span className="visually-hidden">Filter by country</span>
            <select value={country} onChange={(event) => onCountry(event.target.value)}>
              <option value="all">All countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <div className="projects-tabs" role="group" aria-label="Filter by sector">
            <button type="button" className={sector === 'all' ? 'is-active' : undefined} aria-pressed={sector === 'all'} onClick={() => onSector('all')}>
              All <span>{activeProjects.length}</span>
            </button>
            {projectSectors.map((s) => (
              <button
                type="button"
                key={s.key}
                className={sector === s.key ? 'is-active' : undefined}
                aria-pressed={sector === s.key}
                onClick={() => onSector(s.key)}
              >
                <Icon name={s.icon} size={16} />
                {s.label} <span>{countBySector(s.key)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="projects-result" aria-live="polite">
          <p>
            <strong>{shown.length}</strong> {shown.length === 1 ? 'project' : 'projects'}
            {sector !== 'all' && <> in <strong>{sectorOf(sector).label}</strong></>}
            {country !== 'all' && <> in <strong>{country}</strong></>}
            {q && <> matching &ldquo;{query.trim()}&rdquo;</>}
          </p>
          {filtered && (
            <button type="button" className="projects-clear" onClick={clearAll}>
              Clear filters
            </button>
          )}
        </div>

        {shown.length ? (
          <ul className="project-list">
            {shown.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </ul>
        ) : (
          <div className="project-empty">
            <span className="project-empty-icon" aria-hidden="true">
              <Icon name="globe" size={28} />
            </span>
            <h3>No active projects listed here yet</h3>
            <p>
              We are developing opportunities in this area. Tell us what you
              are looking for and we will be in touch.
            </p>
            <div className="project-empty-actions">
              <Link to="/contact" className="btn btn--dark">Discuss an opportunity</Link>
              <button type="button" className="projects-clear" onClick={clearAll}>View all projects</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Portfolio() {
  const [params, setParams] = useSearchParams();
  const sector = params.get('sector') ?? 'all';
  const country = params.get('country') ?? 'all';

  const setFilter = (name, value) => {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete(name);
    else next.set(name, value);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  // Card button: show that sector's projects and bring the list into view.
  const viewSector = (key) => {
    setParams({ sector: key }, { replace: true, preventScrollReset: true });
    scrollToTarget(document.getElementById('active-projects'), { offset: -90 });
  };

  return (
    <>
      <PageHero
        image="/images/photos/strategy-table.jpg"
        imageAlt="Africa map and an Alkebulan Global notebook on a meeting table"
        focus="center 55%"
        eyebrow="Our Work"
        title="Projects & Engagements"
        intro="Energy, mining, agriculture, manufacturing and trade work we are advancing with partners across Africa and the United States."
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
            <h2>Six sectors we work in</h2>
            <p>
              In each sector we look for credible partners, a real market,
              and a clear route to execution.
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

                <button
                  type="button"
                  className="text-link portfolio-view"
                  onClick={() => viewSector(project.sector)}
                  aria-label={`View active ${project.category} projects`}
                >
                  View active projects <span className="portfolio-count">{countBySector(project.sector)}</span>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ActiveProjects
        sector={sector}
        country={country}
        onSector={(value) => setFilter('sector', value)}
        onCountry={(value) => setFilter('country', value)}
        onClear={() => setParams({}, { replace: true, preventScrollReset: true })}
      />

      <PhotoBreak
        image="/images/photos/boardroom.jpg"
        alt="Alkebulan Global boardroom with a world map display"
        focus="center 45%"
        eyebrow="From Introduction to Execution"
        title="Helping deals move from introductions to implementable transactions."
      />

      <CtaBand
        title="Have a project in mind?"
        text="Tell us about your project, sourcing need, or partnership idea, and our team will follow up."
      />
    </>
  );
}
