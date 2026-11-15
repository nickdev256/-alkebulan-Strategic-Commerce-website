import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { useLocation } from 'react-router-dom';
import { scrollToTarget } from '../lib/smoothScroll.js';
import './Interactions.css';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/*
 * Site-wide interactive layer:
 * - gold reading-progress bar
 * - back-to-top button
 * - numbers that count up when they come into view ([data-count])
 */
export default function Interactions() {
  const { pathname } = useLocation();
  const barRef = useRef(null);
  const [showTop, setShowTop] = useState(false);

  // Scroll: progress bar and back-to-top (scroll animations live in Motion.jsx)
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      setShowTop(window.scrollY > 700);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  // Count-up numbers
  useEffect(() => {
    const items = [...document.querySelectorAll('[data-count]')];
    if (!items.length) return undefined;

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return undefined;

    const run = (el) => {
      const target = Number(el.dataset.count);
      const start = performance.now();
      const duration = 1400;
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - (1 - t) ** 3;
        el.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      el.textContent = '0';
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 },
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <span ref={barRef} />
      </div>

      <button
        type="button"
        className={`to-top${showTop ? ' is-shown' : ''}`}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
        onClick={() => scrollToTarget(0)}
      >
        <Icon name="chevron-up" size={20} />
      </button>
    </>
  );
}
