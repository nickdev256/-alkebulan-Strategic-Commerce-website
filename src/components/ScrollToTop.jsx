import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTarget } from '../lib/smoothScroll.js';

// On every page change, start at the top of the new page.
// (Scroll animations are in Motion.jsx; page titles and SEO in App.jsx.)
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    scrollToTarget(0, { immediate: true });
  }, [pathname]);

  return null;
}
