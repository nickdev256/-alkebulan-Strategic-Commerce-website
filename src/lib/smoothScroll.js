// Smooth scrolling with Lenis, driven by GSAP's clock so ScrollTrigger
// animations stay perfectly in step with the scroll position.
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let lenis = null;
let tick = null;

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Starts smooth scrolling (skipped for visitors who prefer reduced motion). */
export function startSmoothScroll() {
  if (lenis || reduceMotion()) return lenis;

  lenis = new Lenis({ autoRaf: false, lerp: 0.1, anchors: false });
  lenis.on('scroll', ScrollTrigger.update);
  tick = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // Safety net: Lenis takes over the mouse wheel, so if GSAP's clock never runs
  // (some hidden or background views) hand scrolling back to the browser.
  const startFrame = gsap.ticker.frame;
  setTimeout(() => {
    if (lenis && gsap.ticker.frame === startFrame) stopSmoothScroll();
  }, 2500);

  // Development only: lets the browser console reach Lenis for testing.
  if (import.meta.env.DEV) window.lenis = lenis;
  return lenis;
}

export function stopSmoothScroll() {
  if (tick) gsap.ticker.remove(tick);
  lenis?.destroy();
  lenis = null;
  tick = null;
}

/** Pause or resume smooth scrolling (e.g. while the phone menu is open). */
export function setScrollLocked(locked) {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

// Distance from the top of the page, ignoring any animation transforms
// (a section mid fade-in would otherwise be measured in the wrong place).
function layoutTop(el) {
  let y = 0;
  for (let node = el; node; node = node.offsetParent) y += node.offsetTop;
  return y;
}

/**
 * Scrolls to an element or position. Uses Lenis when it is running, otherwise
 * the browser's own scrolling. `offset` makes room for the fixed header.
 */
export function scrollToTarget(target, { offset = 0, immediate = false } = {}) {
  if (target == null) return;
  // Work out the exact position here so Lenis and the browser land in the same
  // place (Lenis would otherwise add the element's scroll-margin on top).
  const top = typeof target === 'number' ? target : layoutTop(target) + offset;

  if (lenis) {
    lenis.scrollTo(Math.max(0, top), { immediate, force: true });
    return;
  }
  window.scrollTo({ top: Math.max(0, top), behavior: immediate || reduceMotion() ? 'auto' : 'smooth' });
}
