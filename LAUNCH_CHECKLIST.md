# Alkebulan Global: pre-launch checklist

Tick each box before the site goes live. Items marked **(done)** were
handled during the November 2026 mobile, speed and SEO pass and only need a
final look.

---

## 1. Content and accuracy

- [ ] Read every page out loud once: names, titles, spelling, ™ marks, dates.
- [ ] Replace the 3 placeholder projects in `src/projects.js` with real,
      approved projects (or remove the Active Projects section until ready).
- [ ] Add Dave's and Nicholas's email addresses in `src/team.js`
      (`email: ''`), or remove the envelope icons.
- [ ] Add the company's social profile URLs in `src/content.js`
      (`socialLinks`); empty icons in the footer do nothing.
- [ ] Confirm the team bios, photos and titles with each person.
- [ ] Decide on the AI-generated office photos: keep, or swap for real or
      licensed photos.
- [ ] Phone numbers, WhatsApp number, email and the 1 World Trade Center
      address are correct everywhere (footer, contact page, structured data
      in `index.html`).
- [ ] Privacy Policy reviewed by whoever owns legal/compliance.
- [ ] Copyright year in the footer is right.

## 2. Forms and conversion

- [ ] `VITE_API_URL` is set in the hosting provider (e.g. Vercel → Settings →
      Environment Variables) to the live backend. If it is missing, the
      forms fall back to `http://localhost:5000` and **fail for every
      visitor**.
- [ ] Send a real test through the **contact form** on the live site: it
      arrives in the inbox, the success message shows, the form clears.
- [ ] Turn the backend off (or use a wrong URL on a preview) and check the
      error message shows the email fallback.
- [ ] Test the **newsletter** signup end to end, including a duplicate email.
- [ ] The backend allows the live domain in its CORS settings
      (`alkebulan-global.com` and `www.`).
- [ ] Someone is named to answer enquiries, with a target reply time.
- [ ] Tap-to-call, tap-to-email and WhatsApp links open the right apps on a
      real phone.
- [ ] Every "Engage" / "Contact" / "View active projects" button lands on
      the right page or section.
- [ ] Phone country picker defaults to the USA and the search works.
- [ ] (Recommended) Add analytics with goal tracking for form submissions,
      calls, emails and WhatsApp taps (e.g. Google Analytics 4 or Plausible),
      and update the Privacy Policy to mention it.

## 3. Mobile experience

- [x] **(done)** No sideways scrolling on any page from 320px to 2560px.
- [x] **(done)** All links and buttons are at least 44px tall on phones
      (footer links, sub-page tabs, newsletter box).
- [x] **(done)** Home hero: headline and buttons show on the first screen on
      phones; the emblem sits below them.
- [x] **(done)** Small labels raised to readable sizes; headings balance
      across lines and paragraphs avoid single-word last lines.
- [x] **(done)** Form fields are 16px, so iPhones don't zoom in when typing.
- [ ] Check on real devices: an iPhone (Safari), an Android phone (Chrome),
      and an iPad. Open the menu, every page, the profile pop-ups, the
      country picker and both forms.
- [ ] Check landscape on a phone.

## 4. Speed

- [x] **(done)** Photos recompressed (about 6.4 MB → 4.9 MB) and phones get
      960px versions of the wide photos.
- [x] **(done)** Code split into cacheable files (react, motion, site code,
      about 180 KB compressed in total).
- [x] **(done)** Removed unused Google Fonts connections. Inter is
      self-hosted.
- [ ] Run **PageSpeed Insights** (pagespeed.web.dev) on the live home,
      About and Contact pages, mobile and desktop. Aim for 90+ on
      Performance, Accessibility, Best Practices and SEO.
- [ ] Check Largest Contentful Paint is under 2.5 s on mobile.
- [ ] Hosting serves files compressed (gzip/brotli) and caches
      `/assets/*` long term (Vercel does both by default).
- [ ] Optional: convert photos to WebP/AVIF for another ~30–50% saving.
- [ ] Optional: shrink `public/icon-512.png` (500 KB) with an image
      optimiser.
- [ ] Leave the two unused PNGs in `public/images/photos/`
      (`03bb168b…png`, `fc6ad7b5…png`) out of the commit, or delete them.

## 5. SEO

- [x] **(done)** Every page has its own title, description, canonical URL
      and one H1. The 404 page is `noindex`.
- [x] **(done)** Duplicate addresses (`/about/company-snapshot`,
      `/services/core-services`) point search engines to `/about` and
      `/services`; the sitemap lists 12 clean URLs.
- [x] **(done)** New 1200×630 social sharing image (`/images/og-image.jpg`).
- [x] **(done)** Structured data now includes the full address, phone,
      email, founder and areas served.
- [ ] Confirm the final domain (with or without `www.`) and redirect the
      other one to it. Update `SITE_URL` in `src/App.jsx`, `index.html`,
      `robots.txt` and `sitemap.xml` if it changes.
- [ ] HTTPS works and `http://` redirects to `https://`.
- [ ] Refreshing any inner page (e.g. `/about/our-team`) loads it, with no 404.
- [ ] Submit `sitemap.xml` in **Google Search Console** and **Bing
      Webmaster Tools**; request indexing of the home page.
- [ ] Test the home page in Google's **Rich Results Test** (structured
      data) and preview a shared link with LinkedIn's **Post Inspector** and
      Facebook's **Sharing Debugger**.
- [ ] Note: this is a single-page app, so social networks show the home
      page's preview for every shared link. If page-specific previews matter,
      add prerendering (e.g. a static prerender step at build time).
- [ ] Create or claim the **Google Business Profile** for the New York office.

## 6. Accessibility

- [ ] Tab through each page with the keyboard only: the skip link, menu,
      dropdowns, tabs, profile pop-ups and forms are all reachable, with a
      visible gold focus ring.
- [ ] Run Lighthouse Accessibility or the axe browser extension on each page.
- [ ] Turn on "Reduce motion" on a phone or computer: animations calm down
      and nothing stays hidden.
- [ ] Zoom the browser to 200%: nothing overlaps or gets cut off.

## 7. Technical and security

- [ ] `npm run build` and `npm run lint` pass with no errors. (Today the
      website code is clean; the 18 lint errors are all in `backend/`,
      because the browser lint rules don't know Node's `process`. Give
      `backend/` Node globals in `eslint.config.js`, or ignore it there.)
- [ ] No errors in the browser console on any page.
- [ ] `.env` is currently **committed to git**. The Supabase anon key in it
      is designed to be public, but keep secrets out of git: move real
      values to the hosting provider's environment settings and add `.env`
      to `.gitignore`.
- [ ] The backend's Supabase service key (if any) lives only on the server.
- [ ] Contact form is rate-limited or spam-protected on the server side (the
      hidden `_gotcha` field only stops basic bots).
- [ ] Favicon and home-screen icon show the emblem (browser tab, iPhone
      "Add to Home Screen").
- [ ] Old `.html` links (e.g. `/about.html`) redirect to the new pages.

## 8. Cross-browser check

- [ ] Chrome, Safari, Firefox and Edge on desktop.
- [ ] Safari on iPhone, Chrome on Android.
- [ ] Hero globe spin, page transitions, smooth scrolling and ribbons run
      smoothly with no flicker.

## 9. Launch day

- [ ] Merge `dave` into `main` and confirm the hosting provider deployed the
      latest commit.
- [ ] Repeat a quick pass of sections 2 and 5 on the live URL.
- [ ] Back up the previous site (if replacing one).
- [ ] Announce on social channels with the new share image.
- [ ] Re-check Search Console a week later for crawl or indexing errors.
