import { useState } from 'react';
import { Link } from 'react-router-dom';

// The shared auth styles live in AdminLogin.css; importing them here means
// the register and forgot-password pages are styled even if visited first.
import '../pages/AdminLogin.css';

// ==========================================
// SLIDESHOW CONTENT
// ==========================================

const SLIDES = [
  {
    image: '/images/photos/home-hero.jpg',
    eyebrow: 'GLOBAL PARTNERS',
    title: 'Real impact across Africa and beyond.',
    text: 'Connecting investors, governments and enterprises to opportunities that last.',
  },
  {
    image: '/images/photos/trade-briefing-wide.jpg',
    eyebrow: 'TRADE & INVESTMENT',
    title: 'Intelligence that moves markets.',
    text: 'Strategic briefings and trade facilitation for the continent’s growth sectors.',
  },
  {
    image: '/images/photos/home-hero-2.jpg',
    eyebrow: 'STRATEGIC COMMERCE',
    title: 'Partnerships built on trust.',
    text: 'From first conversation to signed agreement, we stay at the table with you.',
  },
  {
    image: '/images/photos/reception-wide.jpg',
    eyebrow: 'DEVELOPMENT',
    title: 'Projects with purpose.',
    text: 'Infrastructure, energy and community initiatives delivered with accountability.',
  },
  {
    image: '/images/photos/library-wide.jpg',
    eyebrow: 'INSIGHT',
    title: 'Research that informs every decision.',
    text: 'Market studies and policy expertise behind every recommendation we make.',
  },
  {
    image: '/images/photos/home-hero-3.jpg',
    eyebrow: 'ALKEBULAN GLOBAL',
    title: 'One network. Many markets.',
    text: 'A trusted bridge between Africa and the world’s leading economies.',
  },
];

// Seconds each slide stays on screen. The progress bar animation is the
// timer: when it finishes, the next slide starts (see onAnimationEnd).
const SLIDE_SECONDS = 7;

const pad = (number) => String(number).padStart(2, '0');

/**
 * Split-screen layout for the admin sign-in pages:
 * a full-screen rotating photo slideshow, highlights on the left,
 * and a frosted-glass panel on the right holding the form.
 */
export default function AuthLayout({ children }) {
  const [active, setActive] = useState(0);
  // The outgoing slide keeps its slow zoom while it fades out (no jump).
  const [previous, setPrevious] = useState(null);
  const [paused, setPaused] = useState(false);

  // Only load an image when its slide is (about to be) shown.
  const [loaded, setLoaded] = useState(() => new Set([0, 1]));

  const goTo = (index) => {
    const next = (index + SLIDES.length) % SLIDES.length;
    if (next === active) return;
    setPrevious(active);
    setActive(next);
    setLoaded((seen) =>
      new Set(seen).add(next).add((next + 1) % SLIDES.length)
    );
  };

  const slide = SLIDES[active];

  return (
    <div className={`ag-auth-page ${paused ? 'is-paused' : ''}`}>
      {/* FULL-SCREEN SLIDESHOW */}
      <div className="ag-auth-slides" aria-hidden="true">
        {SLIDES.map((item, index) => (
          <div
            key={item.image}
            className={`ag-auth-slide ${index === active ? 'is-active' : ''} ${
              index === previous ? 'is-leaving' : ''
            }`}
            style={
              loaded.has(index)
                ? { backgroundImage: `url(${item.image})` }
                : undefined
            }
          />
        ))}
        <div className="ag-auth-slides-shade" />
      </div>

      {/* LEFT: HIGHLIGHTS */}
      <aside
        className="ag-auth-showcase"
        aria-label="Alkebulan Global highlights"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <Link to="/" className="ag-auth-showcase-brand">
          <span className="ag-auth-globe" aria-hidden="true">
            <span className="ag-auth-globe-ring" />
            <span className="ag-auth-globe-mark">AG</span>
          </span>
          <span>
            <strong>ALKEBULAN GLOBAL</strong>
            <small>STRATEGIC COMMERCE &amp; DEVELOPMENT</small>
          </span>
        </Link>

        <div className="ag-auth-orbits" aria-hidden="true">
          <span className="ag-auth-orbit ag-auth-orbit--one" />
          <span className="ag-auth-orbit ag-auth-orbit--two" />
          <span className="ag-auth-orbit ag-auth-orbit--three" />
        </div>

        <div className="ag-auth-showcase-content" aria-live="polite">
          <div className="ag-auth-showcase-text" key={active}>
            <p className="ag-auth-showcase-eyebrow">{slide.eyebrow}</p>
            <h2>{slide.title}</h2>
            <p>{slide.text}</p>
          </div>

          <div className="ag-auth-progress">
            <span className="ag-auth-counter">
              {pad(active + 1)} <em>/ {pad(SLIDES.length)}</em>
            </span>

            <div className="ag-auth-progress-bars">
              {SLIDES.map((item, index) => (
                <button
                  key={item.image}
                  type="button"
                  className={`ag-auth-progress-bar ${
                    index === active ? 'is-active' : ''
                  } ${index < active ? 'is-done' : ''}`}
                  aria-label={`Show slide ${index + 1}: ${item.title}`}
                  aria-current={index === active}
                  onClick={() => goTo(index)}
                >
                  <span
                    style={{ animationDuration: `${SLIDE_SECONDS}s` }}
                    onAnimationEnd={() => index === active && goTo(active + 1)}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT: FROSTED-GLASS FORM PANEL */}
      <main className="ag-auth-panel">{children}</main>
    </div>
  );
}
