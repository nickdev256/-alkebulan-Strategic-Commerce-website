import { Link } from 'react-router-dom';
import { useRef } from 'react';
import './Hero.css';

// Number of stacked gold discs that form the medallion's rim.
const COIN_LAYERS = 12;

// Background photos that take turns behind the banner.
const heroSlides = [
  { src: '/images/photos/home-hero.jpg', width: 1672, height: 941, focus: 'center 50%' },
  { src: '/images/photos/home-hero-2.jpg', width: 1671, height: 941, focus: 'center 35%' },
  { src: '/images/photos/home-hero-3.jpg', width: 1672, height: 941, focus: 'center 40%' },
  { src: '/images/photos/home-hero-4.jpg', width: 1672, height: 941, focus: 'center 35%' },
];

export default function Hero() {
  // The emblem drifts gently toward the cursor (mouse / trackpad only).
  const visual = useRef(null);

  const onPointerMove = (event) => {
    if (event.pointerType !== 'mouse' || !visual.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    visual.current.style.setProperty('--px', x.toFixed(3));
    visual.current.style.setProperty('--py', y.toFixed(3));
  };

  const onPointerLeave = () => {
    visual.current?.style.setProperty('--px', 0);
    visual.current?.style.setProperty('--py', 0);
  };

  return (
    <section className="hero" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      {/* Slideshow of background photos, shaded so the text and emblem stay readable */}
      <div className="hero-bg" aria-hidden="true" style={{ '--slides': heroSlides.length }}>
        {heroSlides.map((slide, index) => (
          <img
            key={slide.src}
            src={slide.src}
            alt=""
            width={slide.width}
            height={slide.height}
            style={{ '--slide': index, objectPosition: slide.focus }}
            fetchPriority={index === 0 ? 'high' : 'low'}
            decoding="async"
          />
        ))}
      </div>

      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Strategic Commerce &amp; Development</p>

          <h1>
            Where Excellence Meets Opportunity<sup>™</sup>
          </h1>

          <p className="hero-tagline">
            Strategic Advisory • Diplomatic Procurement • Global Market Access
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
        <div className="hero-visual" aria-hidden="true" ref={visual}>
          <div className="orbit orbit--outer">
            <span className="orbit-dot" />
          </div>
          <div className="orbit orbit--inner">
            <span className="orbit-dot" />
          </div>
          <div className="hero-emblem-glow" />
          {/* 3D gold medallion: two emblem faces with a solid rim between them */}
          <div className="hero-emblem">
            <div className="coin-tilt">
              <div className="coin">
                {Array.from({ length: COIN_LAYERS }, (_, i) => (
                  <span key={i} className="coin-edge" style={{ '--layer': i }} />
                ))}
                <div className="coin-face coin-face--front">
                  <img src="/images/alkebulan-emblem.jpg" alt="" width="480" height="480" />
                </div>
                <div className="coin-face coin-face--back">
                  <img src="/images/alkebulan-emblem.jpg" alt="" width="480" height="480" />
                </div>
              </div>
            </div>
          </div>

          <div className="hero-badge hero-badge--top">
            <strong data-count="8">8</strong> Strategic sectors
          </div>
          <div className="hero-badge hero-badge--bottom">
            <strong data-count="4">4</strong> Regions connected
          </div>
        </div>
      </div>
    </section>
  );
}
