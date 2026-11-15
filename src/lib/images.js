// Wide photos also come in a 960px-wide copy (name-960.jpg) so phones download
// a much smaller file. Returns the srcSet for a photo, or undefined when the
// photo has no smaller copy.
const WIDE_PHOTOS = new Set([
  '/images/photos/csr-hero.jpg',
  '/images/photos/home-hero.jpg',
  '/images/photos/home-hero-2.jpg',
  '/images/photos/home-hero-3.jpg',
  '/images/photos/home-hero-4.jpg',
  '/images/photos/library-wide.jpg',
  '/images/photos/reception-wide.jpg',
  '/images/photos/trade-briefing-wide.jpg',
]);

export function photoSrcSet(src) {
  if (!WIDE_PHOTOS.has(src)) return undefined;
  return `${src.replace(/\.jpg$/, '-960.jpg')} 960w, ${src} 1672w`;
}
