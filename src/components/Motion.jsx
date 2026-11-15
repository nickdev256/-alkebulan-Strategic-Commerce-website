import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { scrollToTarget } from '../lib/smoothScroll.js';

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });

// Development only: lets the browser console reach GSAP for testing.
if (import.meta.env.DEV) Object.assign(window, { gsap, ScrollTrigger });

// Blocks that fade up as they scroll into view (staggered when side by side).
const REVEAL = [
  '.section-head',
  '.home-head',
  '.card',
  '.service-row',
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
  '.sector-grid li',
  '.partner-types li',
  '.question-grid li',
  '.markets-card',
  '.advantage-list li',
  '.diaspora-card',
  '.stage-list li',
  '.intro-text',
  '.intro-facts div',
  '.photo-break-caption',
  '.org-person',
  '.org-unit',
  '.org-shared',
  '.stage-panel',
  '.privacy-section',
  '.privacy-contact',
  '.explorer',
  '.roles',
  '.team-card',
  '.partner-orgs li',
  '.country-partners-list li',
  '.projects-toolbar',
  '.places-head',
].join(',');

// Photos that wipe in from the bottom.
const WIPE = [
  '.intro-photo-main',
  '.intro-photo-inset',
  '.brand-card img',
  '.leader-badge',
  '.team-card-photo',
  '.partner-org-logo',
].join(',');

// Headings whose lines rise into view.
const HEADLINES = [
  '.hero h1',
  '.page-hero h1',
  '.section-head h2',
  '.home-head h2',
  '.privacy-glance-head h2',
].join(',');

/*
 * Site-wide motion with GSAP + ScrollTrigger + SplitText.
 * Rebuilt on every page change and fully cleaned up afterwards.
 * Visitors who prefer reduced motion get the plain, still page.
 */
export default function Motion() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Start at the top before positions are measured.
    scrollToTarget(0, { immediate: true });
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const page = document.querySelector('.page-transition');

      // Page transition: the new page rises and fades in.
      if (page) {
        gsap.from(page, {
          autoAlpha: 0,
          y: 24,
          duration: 0.7,
          ease: 'power3.out',
          clearProps: 'opacity,visibility,transform',
          onComplete: () => ScrollTrigger.refresh(),
        });
      }

      // Headlines: each line slides up from behind a mask.
      const splits = [];
      document.querySelectorAll(HEADLINES).forEach((el) => {
        const inHero = el.closest('.hero, .page-hero');
        splits.push(
          SplitText.create(el, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                duration: 1,
                stagger: 0.12,
                ease: 'power4.out',
                delay: inHero ? 0.25 : 0,
                scrollTrigger: inHero ? undefined : { trigger: el, start: 'top 90%', once: true },
              }),
          }),
        );
      });

      // Blocks fade up in batches, staggered left to right.
      const blocks = gsap.utils.toArray(REVEAL);
      gsap.set(blocks, { autoAlpha: 0, y: 36 });
      ScrollTrigger.batch(blocks, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.09,
            ease: 'power3.out',
            overwrite: true,
            // Hand control back to CSS so hover effects keep working.
            clearProps: 'opacity,visibility,transform',
          }),
      });

      // Photos wipe up from the bottom, with a slow zoom on the image inside.
      gsap.utils.toArray(WIPE).forEach((el) => {
        const trigger = { trigger: el.parentElement, start: 'top 88%', once: true };
        gsap.fromTo(
          el,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power3.inOut', scrollTrigger: trigger, clearProps: 'clipPath' },
        );
        const inner = el.tagName === 'IMG' ? null : el.querySelector('img');
        if (inner) {
          gsap.fromTo(inner, { scale: 1.18 }, { scale: 1, duration: 1.8, ease: 'power3.out', scrollTrigger: trigger, clearProps: 'scale' });
        }
      });

      // Full-width photo strips: the photo drifts and zooms out while scrolling past.
      gsap.utils.toArray('.photo-break').forEach((strip) => {
        const img = strip.querySelector('img');
        if (!img) return;
        gsap.fromTo(
          img,
          { yPercent: -8, scale: 1.2 },
          { yPercent: 8, scale: 1, ease: 'none', scrollTrigger: { trigger: strip, start: 'top bottom', end: 'bottom top', scrub: true } },
        );
      });

      // Banners: the photo moves slower than the page; the text fades and lifts away.
      document.querySelectorAll('.hero, .page-hero').forEach((hero) => {
        const scrub = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
        const bg = hero.querySelector('.hero-bg, .page-hero-bg');
        // Explicit start values: the text must start fully visible even if the
        // page is still fading in when these are measured.
        if (bg) {
          gsap.fromTo(bg, { yPercent: 0 }, { yPercent: 22, ease: 'none', immediateRender: false, scrollTrigger: scrub });
        }
        const copy = hero.querySelector('.hero-copy') || hero.querySelector(':scope > .container');
        if (copy) {
          gsap.fromTo(
            copy,
            { autoAlpha: 1, y: 0 },
            { autoAlpha: 0.15, y: -70, ease: 'none', immediateRender: false, scrollTrigger: scrub },
          );
        }
      });

      // Recalculate positions once late images and fonts have settled.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh);
      const timer = setTimeout(refresh, 800);

      return () => {
        window.removeEventListener('load', refresh);
        clearTimeout(timer);
        splits.forEach((split) => split.revert());
      };
    });

    // Safety net: if the browser never runs animation frames (some hidden or
    // background views), drop the animations so the page is never left invisible.
    const startFrame = gsap.ticker.frame;
    const safety = setTimeout(() => {
      if (gsap.ticker.frame === startFrame) mm.revert();
    }, 2500);

    return () => {
      clearTimeout(safety);
      mm.revert();
    };
  }, [pathname]);

  return null;
}
