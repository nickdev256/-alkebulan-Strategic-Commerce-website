import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Blocks that fade up as they scroll into view.
const REVEAL_TARGETS = [
  '.section-head',
  '.home-head',
  '.card',
  '.service-steps li',
  '.service-row',
  '.work-step',
  '.prose',
  '.brand-card',
  '.checklist li',
  '.csr-quote',
  '.cta-band',
  '.portfolio-note',
  '.contact-form',
  '.contact-aside',
  '.channel-card',
  '.hq-card',
  '.office-card',
  '.pillars span',
  '.intro-photos',
  '.intro-text',
  '.photo-break-caption',
].join(',');

// Browser-tab title for each page.
const pageTitles = {
  '/': 'Alkebulan Global | Strategic Commerce & Development',
  '/about': 'Company Snapshot',
  '/about/company-snapshot': 'Company Snapshot',
  '/about/who-we-are': 'Who We Are',
  '/about/strategic-partners': 'Strategic Partners',
  '/about/what-sets-us-apart': 'What Sets Alkebulan Global Apart',
  '/services': 'Core Services',
  '/services/sectors': 'Core Sectors',
  '/services/core-services': 'Core Services',
  '/portfolio': 'Projects & Engagements',
  '/csr': 'Corporate Social Responsibility',
  '/contact': 'Contact Us',
  '/privacy': 'Privacy Policy',
};

// On every page change: set the tab title, jump to the top,
// then set up the scroll animations.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = pageTitles[pathname.replace(/\/$/, '') || '/'];
    document.title =
      pathname === '/' ? page : `${page ?? 'Page Not Found'} | Alkebulan Global`;

    window.scrollTo({ top: 0, behavior: 'instant' });

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    const elements = [...document.querySelectorAll(REVEAL_TARGETS)];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );

    elements.forEach((el) => {
      // Stagger items that sit side by side in the same grid or list.
      const siblings = [...el.parentElement.children].filter((child) =>
        child.matches(REVEAL_TARGETS),
      );
      const index = Math.min(siblings.indexOf(el), 5);
      el.style.setProperty('--reveal-delay', `${index * 80}ms`);
      el.classList.add('reveal');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
