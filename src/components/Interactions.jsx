import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Interactions.css';

// Cards that get a soft gold glow following the cursor.
const SPOTLIGHT = [
  '.card',
  '.channel-card',
  '.office-card',
  '.sector-tile',
  '.area-item',
  '.org-unit',
  '.org-person',
  '.partner-types li',
  '.hq-card',
].join(',');

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/*
 * Site-wide interactive layer:
 * - gold reading-progress bar
 * - back-to-top button
 * - cursor spotlight on cards (mouse / trackpad only)
 * - gentle parallax on banner and photo-strip images
 * - numbers that count up when they come into view ([data-count])
 */
export default function Interactions() {
  const { pathname } = useLocation();
  const barRef = useRef(null);
  const [showTop, setShowTop] = useState(false);

  // Scroll: progress bar, back-to-top, parallax
  useEffect(() => {
    const reduce = prefersReducedMotion();
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      setShowTop(window.scrollY > 700);

      if (reduce) return;
      const vh = window.innerHeight;

      doc.style.setProperty('--hero-shift', `${Math.min(window.scrollY, 900) * 0.28}px`);

      document.querySelectorAll('.photo-break').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const offset = (rect.top + rect.height / 2 - vh / 2) / vh;
        el.style.setProperty('--pb-shift', `${(offset * -0.16 * rect.height).toFixed(1)}px`);
      });
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

  // Cursor spotlight on cards (fine pointers only)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;

    const onMove = (event) => {
      const card = event.target.closest?.(SPOTLIGHT);
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    return () => document.removeEventListener('pointermove', onMove);
  }, []);

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
        onClick={() =>
          window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
        }
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 15 6-6 6 6" />
        </svg>
      </button>
    </>
  );
}
