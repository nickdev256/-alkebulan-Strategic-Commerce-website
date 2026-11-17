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

const CLEAR = 'opacity,visibility,transform,filter,clipPath';

/*
 * Projects page: bold entrances for the stage stepper, sector cards, stats,
 * filters and project cards. Returns the elements it animates so the general
 * fade-up leaves them alone. Does nothing on other pages.
 */
function projectsMotion() {
  const owned = new Set();
  if (!document.querySelector('.projects-section')) return owned;
  const own = (selector) => {
    const els = gsap.utils.toArray(selector);
    els.forEach((el) => owned.add(el));
    return els;
  };
  const once = (trigger, start = 'top 85%') => ({ trigger, start, once: true });

  // Stage stepper: the five stages drop in, their numbers spin, the panel wipes open.
  const stages = own('.stage-list li');
  const panel = own('.stage-panel');
  if (stages.length) {
    const nums = stages.map((li) => li.querySelector('.stage-num')).filter(Boolean);
    gsap.set(stages, { autoAlpha: 0, y: -60, rotationX: 70, transformPerspective: 800 });
    gsap.set(nums, { scale: 0, rotation: -270 });
    gsap.set(panel, { autoAlpha: 0, clipPath: 'inset(0% 0% 100% 0%)', y: 40 });
    gsap
      .timeline({ defaults: { ease: 'expo.out' }, scrollTrigger: once(stages[0].parentElement) })
      .to(stages, { autoAlpha: 1, y: 0, rotationX: 0, duration: 1.1, stagger: 0.12, clearProps: CLEAR })
      .to(nums, { scale: 1, rotation: 0, duration: 1, stagger: 0.12, ease: 'back.out(2.5)', clearProps: CLEAR }, 0.15)
      .to(panel, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.3, ease: 'power4.inOut', clearProps: CLEAR }, 0.45);
  }

  // Disclaimer note slides in from the left out of a blur.
  own('.portfolio-note').forEach((note) => {
    gsap.fromTo(
      note,
      { autoAlpha: 0, x: -120, filter: 'blur(10px)' },
      { autoAlpha: 1, x: 0, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out', scrollTrigger: once(note), clearProps: CLEAR },
    );
  });

  // Sector cards flip up in 3D, then their icons spin and tags slide in.
  const sectorCards = own('.portfolio-card');
  if (sectorCards.length) {
    gsap.set(sectorCards, { autoAlpha: 0, y: 140, rotationX: 45, scale: 0.82, filter: 'blur(10px)', transformPerspective: 1000, transformOrigin: '50% 100%' });
    ScrollTrigger.batch(sectorCards, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
        tl.to(batch, { autoAlpha: 1, y: 0, rotationX: 0, scale: 1, filter: 'blur(0px)', duration: 1.4, stagger: 0.15, clearProps: CLEAR });
        tl.from(batch.map((c) => c.querySelector('.icon-badge')), { scale: 0, rotation: -180, duration: 1.2, stagger: 0.15, ease: 'elastic.out(1, 0.5)', clearProps: CLEAR }, 0.35);
        tl.from(batch.map((c) => c.querySelector('.tag')), { autoAlpha: 0, x: 50, duration: 0.8, stagger: 0.15, clearProps: CLEAR }, 0.5);
      },
    });
  }

  // Stats boxes pop and the numbers count up from zero.
  const stats = own('.projects-stats div');
  if (stats.length) {
    const numbers = stats.map((box) => box.querySelector('dd')).filter(Boolean);
    gsap.set(stats, { autoAlpha: 0, scale: 0.5, y: 40 });
    const tl = gsap.timeline({ scrollTrigger: once(stats[0].parentElement, 'top 88%') });
    tl.to(stats, { autoAlpha: 1, scale: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'back.out(2)', clearProps: CLEAR });
    numbers.forEach((dd, i) => {
      const end = Number(dd.dataset.count) || 0;
      const counter = { value: 0 };
      dd.textContent = '0';
      tl.to(counter, {
        value: end,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => { dd.textContent = String(Math.round(counter.value)); },
        onComplete: () => { dd.textContent = String(end); },
      }, 0.15 + i * 0.12);
    });
  }

  // Filters: search and country slide in from the sides, sector tabs pop in a row.
  const toolbar = own('.projects-toolbar')[0];
  if (toolbar) {
    const tabs = gsap.utils.toArray(toolbar.querySelectorAll('.projects-tabs button'));
    const sides = [toolbar.querySelector('.projects-search'), toolbar.querySelector('.projects-select')].filter(Boolean);
    gsap.set(sides, { autoAlpha: 0, x: (i) => (i ? 100 : -100) });
    gsap.set(tabs, { autoAlpha: 0, y: 30, scale: 0.6 });
    gsap
      .timeline({ defaults: { ease: 'expo.out' }, scrollTrigger: once(toolbar, 'top 90%') })
      .to(sides, { autoAlpha: 1, x: 0, duration: 1.1, clearProps: CLEAR })
      .to(tabs, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.06, ease: 'back.out(2.2)', clearProps: CLEAR }, 0.2);
  }

  // Project cards rise in 3D; inside, the icon spins, the badges slide in
  // from opposite sides, the details tick in and the button pops.
  const projectCards = own('.project-card');
  if (projectCards.length) {
    gsap.set(projectCards, { autoAlpha: 0, y: 160, rotationX: -30, scale: 0.85, filter: 'blur(12px)', transformPerspective: 1100, transformOrigin: '50% 0%' });
    ScrollTrigger.batch(projectCards, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => {
        const pick = (selector) => batch.flatMap((c) => [...c.querySelectorAll(selector)]);
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
        tl.to(batch, { autoAlpha: 1, y: 0, rotationX: 0, scale: 1, filter: 'blur(0px)', duration: 1.5, stagger: 0.18, clearProps: CLEAR });
        tl.from(pick('.project-cover-icon'), { scale: 0, rotation: 200, duration: 1.3, stagger: 0.18, ease: 'elastic.out(1, 0.5)', clearProps: CLEAR }, 0.3);
        tl.from(pick('.project-status'), { autoAlpha: 0, x: -60, duration: 0.9, stagger: 0.18, clearProps: CLEAR }, 0.45);
        tl.from(pick('.project-cover-place'), { autoAlpha: 0, x: 60, duration: 0.9, stagger: 0.18, clearProps: CLEAR }, 0.45);
        tl.from(pick('.project-meta > div'), { autoAlpha: 0, y: 24, duration: 0.7, stagger: 0.06, clearProps: CLEAR }, 0.6);
        tl.from(pick('.project-cta'), { autoAlpha: 0, scale: 0.7, duration: 0.8, stagger: 0.18, ease: 'back.out(2.5)', clearProps: CLEAR }, 0.8);
      },
    });
  }

  return owned;
}

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
      // Every page except Home gets the bold version of each effect.
      const strong = pathname !== '/';

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
                yPercent: strong ? 135 : 110,
                rotation: strong ? 7 : 0,
                transformOrigin: '0% 100%',
                duration: strong ? 1.4 : 1,
                stagger: strong ? 0.16 : 0.12,
                ease: strong ? 'expo.out' : 'power4.out',
                delay: inHero ? 0.25 : 0,
                scrollTrigger: inHero ? undefined : { trigger: el, start: 'top 90%', once: true },
              }),
          }),
        );
      });

      // Projects page has its own, stronger choreography (see projectsMotion).
      const owned = projectsMotion();

      const insideOwned = (el) => [...owned].some((o) => o.contains(el));

      // Inner-page banner: the photo settles from a deep zoom, the eyebrow
      // wipes in, the intro sharpens out of a blur and the sub-page tabs pop.
      if (strong) {
        const hero = document.querySelector('.page-hero');
        if (hero) {
          const photo = hero.querySelector('.page-hero-bg img');
          const eyebrow = hero.querySelector('.container > .eyebrow');
          const intro = hero.querySelector('.page-hero-intro');
          const tabs = gsap.utils.toArray(hero.querySelectorAll('.page-tabs a'));
          const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
          if (photo) tl.from(photo, { scale: 1.4, duration: 2.4, clearProps: 'scale' }, 0);
          if (eyebrow) tl.from(eyebrow, { clipPath: 'inset(0% 100% 0% 0%)', x: -30, duration: 1.2, clearProps: CLEAR }, 0.15);
          if (intro) tl.from(intro, { autoAlpha: 0, y: 50, filter: 'blur(12px)', duration: 1.4, clearProps: CLEAR }, 0.55);
          if (tabs.length) tl.from(tabs, { autoAlpha: 0, y: 40, scale: 0.7, duration: 0.9, stagger: 0.08, ease: 'back.out(2.2)', clearProps: CLEAR }, 0.7);
        }
      }

      // Blocks fade up in batches, staggered left to right. On inner pages
      // they swing up in 3D out of a blur, alternating from left and right.
      const blocks = gsap.utils.toArray(REVEAL).filter((el) => !owned.has(el));
      gsap.set(
        blocks,
        strong
          ? { autoAlpha: 0, y: 110, x: (i) => (i % 2 ? 50 : -50), rotationX: -28, scale: 0.9, filter: 'blur(10px)', transformPerspective: 1000, transformOrigin: '50% 0%' }
          : { autoAlpha: 0, y: 36 },
      );
      ScrollTrigger.batch(blocks, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            ...(strong && { x: 0, rotationX: 0, scale: 1, filter: 'blur(0px)' }),
            duration: strong ? 1.35 : 0.9,
            stagger: strong ? 0.14 : 0.09,
            ease: strong ? 'expo.out' : 'power3.out',
            overwrite: true,
            // Hand control back to CSS so hover effects keep working.
            clearProps: CLEAR,
          }),
      });

      // Inner pages: icons, numbers, flags and social buttons spin and spring in.
      if (strong) {
        gsap.utils
          .toArray('.icon-badge, .channel-icon, .step-number, .leader-social li, .office-card img, .team-card-email')
          .filter((el) => !insideOwned(el))
          .forEach((el) => {
            gsap.fromTo(
              el,
              { autoAlpha: 0, scale: 0, rotation: -200 },
              {
                autoAlpha: 1, scale: 1, rotation: 0, duration: 1.3, delay: 0.35, ease: 'elastic.out(1, 0.55)',
                scrollTrigger: { trigger: el, start: 'top 95%', once: true },
                clearProps: CLEAR,
              },
            );
          });
      }

      // Photos wipe up from the bottom, with a slow zoom on the image inside.
      // Inner pages: a deeper wipe from the corner and a bigger zoom.
      gsap.utils.toArray(WIPE).forEach((el) => {
        const trigger = { trigger: el.parentElement, start: 'top 88%', once: true };
        gsap.fromTo(
          el,
          { clipPath: strong ? 'inset(100% 100% 0% 0%)' : 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: strong ? 1.7 : 1.3, ease: strong ? 'expo.inOut' : 'power3.inOut', scrollTrigger: trigger, clearProps: 'clipPath' },
        );
        const inner = el.tagName === 'IMG' ? null : el.querySelector('img');
        if (inner) {
          gsap.fromTo(inner, { scale: strong ? 1.45 : 1.18 }, { scale: 1, duration: strong ? 2.3 : 1.8, ease: 'power3.out', scrollTrigger: trigger, clearProps: 'scale' });
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

      // Footer: a gold line sweeps across, the logo spins in, columns rise
      // out of a blur, headings type up letter by letter, icons spring in,
      // then the newsletter and bottom row (with the credit) follow.
      const footer = document.querySelector('.site-footer');
      if (footer) {
        const q = gsap.utils.selector(footer);
        const line = q('.footer-line');
        const logo = q('.footer-secret-logo');
        const columns = q('.footer-brand, .footer-col');
        const icons = q('.footer-flags li, .footer-social li');
        const rows = q('.footer-subscribe, .footer-bottom > *');
        const headings = q('.footer-col h3, .subscribe-text h3').map((h) =>
          SplitText.create(h, { type: 'words,chars' }),
        );
        splits.push(...headings);
        const chars = headings.flatMap((split) => split.chars);

        const clear = 'opacity,visibility,transform,filter';
        gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
        gsap.set(logo, { autoAlpha: 0, scale: 0.4, rotation: -120 });
        gsap.set([...columns, ...rows], { autoAlpha: 0, y: 90, filter: 'blur(12px)' });
        gsap.set(chars, { autoAlpha: 0, yPercent: 120, rotationX: -90 });
        gsap.set(icons, { autoAlpha: 0, scale: 0, rotation: -180 });

        gsap
          .timeline({
            defaults: { ease: 'expo.out' },
            scrollTrigger: { trigger: footer, start: 'top 85%', once: true },
          })
          .to(line, { scaleX: 1, duration: 1.4, ease: 'power4.inOut' })
          .to(columns, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.4, stagger: 0.14, clearProps: clear }, 0.2)
          .to(logo, { autoAlpha: 1, scale: 1, rotation: 0, duration: 1.6, ease: 'elastic.out(1, 0.6)', clearProps: clear }, 0.3)
          .to(chars, { autoAlpha: 1, yPercent: 0, rotationX: 0, duration: 0.8, stagger: 0.025, ease: 'back.out(2)', clearProps: clear }, 0.5)
          .to(icons, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.9, stagger: 0.06, ease: 'back.out(3)', clearProps: clear }, 0.7)
          .to(rows, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.2, stagger: 0.15, clearProps: clear }, 0.9);
      }

      // Recalculate positions once late images and fonts have settled.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh);
      const timer = setTimeout(refresh, 800);

      return () => {
        window.removeEventListener('load', refresh);
        clearTimeout(timer);
        splits.forEach((split) => split.revert());
        // Counters stopped part way (page change, safety net) show their real value.
        document.querySelectorAll('.projects-stats dd[data-count]').forEach((dd) => {
          dd.textContent = dd.dataset.count;
        });
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
