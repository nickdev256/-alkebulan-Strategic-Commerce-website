import { useEffect, useState } from 'react';
import PageHero from '../components/PageHero.jsx';
import Icon from '../components/Icon.jsx';
import { contactEmail as email, contactPhone as phone } from '../content.js';
import './Privacy.css';

// DRAFT: to be reviewed by Alkebulan Global (and legal counsel if needed)
// before the site goes live.
const lastUpdated = 'November 13, 2026';

const phoneHref = `tel:${phone.replace(/[^+\d]/g, '')}`;

// Short summary shown before the full policy.
const highlights = [
  { icon: 'file', title: 'What we collect', text: 'Only the details you send us through a form, email, phone call, or WhatsApp.' },
  { icon: 'shield', title: 'No selling', text: 'We do not sell or rent personal information to anyone.' },
  { icon: 'target', title: 'Cookies', text: 'This website does not use advertising or analytics cookies.' },
  { icon: 'check', title: 'Your requests', text: 'Email us to see, correct, or delete the information we hold about you.' },
];

// What we collect, why, and for how long.
const dataCollected = [
  {
    source: 'Inquiry form',
    details: 'Name, email, and (if provided) phone, company, area of interest, sector, and message.',
    purpose: 'To reply to your inquiry.',
  },
  {
    source: 'Stay Connected sign-up',
    details: 'Your email address.',
    purpose: 'To send you company updates.',
  },
  {
    source: 'Email, phone & WhatsApp',
    details: 'Anything you include when you contact us.',
    purpose: 'To reply and keep a record of the conversation.',
  },
];

// Services that may receive technical information when you use the site.
const thirdParties = [
  { name: 'Formspree', role: 'Sends the contact form and sign-up form to our inbox.', url: 'https://formspree.io/legal/privacy-policy' },
  { name: 'Google Maps', role: 'Map of our New York office on the Contact page.', url: 'https://policies.google.com/privacy' },
  { name: 'flagcdn.com', role: 'Country flag images.', url: 'https://flagcdn.com' },
  { name: 'WhatsApp', role: 'Used only if you message us on WhatsApp.', url: 'https://www.whatsapp.com/legal/privacy-policy' },
];

const rights = [
  'See the personal information we hold about you',
  'Correct information that is wrong',
  'Have your information deleted',
  'Stop receiving updates from us',
];

const sections = [
  {
    id: 'who-we-are',
    icon: 'users',
    title: 'Who we are',
    body: (
      <p>
        This website is operated by Alkebulan Global LLC, 1 World Trade Center,
        Suite 8500, New York, NY 10007, United States (&ldquo;Alkebulan
        Global&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). This policy explains
        what personal information we receive through this website and what we
        do with it.
      </p>
    ),
  },
  {
    id: 'information-we-collect',
    icon: 'file',
    title: 'Information we collect',
    body: (
      <>
        <p>We only receive information that you send us yourself.</p>
        <div className="privacy-table" role="table" aria-label="Information we collect">
          <div className="privacy-table-row privacy-table-head" role="row">
            <span role="columnheader">Where</span>
            <span role="columnheader">What we receive</span>
            <span role="columnheader">Why</span>
          </div>
          {dataCollected.map((row) => (
            <div className="privacy-table-row" role="row" key={row.source}>
              <strong role="cell" data-label="Where">{row.source}</strong>
              <span role="cell" data-label="What we receive">{row.details}</span>
              <span role="cell" data-label="Why">{row.purpose}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'how-we-use-it',
    icon: 'target',
    title: 'How we use information',
    body: (
      <>
        <ul className="privacy-checks">
          <li>To reply to your inquiry and discuss a possible partnership or service.</li>
          <li>To send you updates, if you signed up for them.</li>
          <li>To keep records of our business correspondence.</li>
          <li>To comply with the law.</li>
        </ul>
        <p className="privacy-callout">
          <Icon name="shield" size={20} />
          We do not sell or rent personal information, and we do not use it for
          advertising.
        </p>
      </>
    ),
  },
  {
    id: 'sharing',
    icon: 'handshake',
    title: 'Sharing information',
    body: (
      <p>
        We may share your information with a partner or adviser when that is
        needed to deal with your inquiry. We also use a few outside services to
        run this website (listed below). Otherwise, we only share information
        when the law requires it.
      </p>
    ),
  },
  {
    id: 'third-parties',
    icon: 'link',
    title: 'Third-party services',
    body: (
      <>
        <p>
          The services below may receive basic technical information, such as
          your IP address, when you use the parts of the site they support. Each
          one has its own privacy policy.
        </p>
        <ul className="privacy-services">
          {thirdParties.map((service) => (
            <li key={service.name}>
              <a href={service.url} target="_blank" rel="noopener noreferrer">
                <strong>{service.name}</strong>
                <span>{service.role}</span>
              </a>
            </li>
          ))}
        </ul>
        <p>This website does not use advertising or analytics cookies.</p>
      </>
    ),
  },
  {
    id: 'international',
    icon: 'globe',
    title: 'International transfers',
    body: (
      <p>
        Our headquarters is in the United States and we have offices in Uganda,
        Namibia, Mozambique, and Nigeria. Your information is held in the United
        States and may be shared with one of these offices if they are handling
        your inquiry.
      </p>
    ),
  },
  {
    id: 'security',
    icon: 'shield',
    title: 'Security',
    body: (
      <p>
        This website uses an encrypted connection (HTTPS). Only staff who work
        on your inquiry can see it. No system is completely secure, but we take
        reasonable care to protect the information we hold.
      </p>
    ),
  },
  {
    id: 'retention',
    icon: 'chart',
    title: 'How long we keep information',
    body: (
      <p>
        We keep your information for as long as we need it for the purposes
        above, or for as long as the law requires. If you ask to stop receiving
        updates, we will remove you from our list.
      </p>
    ),
  },
  {
    id: 'your-rights',
    icon: 'check',
    title: 'Your rights',
    body: (
      <>
        <p>You can contact us to:</p>
        <ul className="privacy-checks">
          {rights.map((right) => (
            <li key={right}>{right}</li>
          ))}
        </ul>
        <p>
          You may have other rights under the law where you live.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    icon: 'users',
    title: 'Children',
    body: (
      <p>
        This website is for businesses and professionals. We do not knowingly
        collect information from anyone under 16.
      </p>
    ),
  },
  {
    id: 'changes',
    icon: 'file',
    title: 'Changes to this policy',
    body: (
      <p>
        We may change this policy. The date at the top of the page shows when it
        was last updated.
      </p>
    ),
  },
];

// Highlights the section currently being read in the contents list.
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -65% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

const sectionIds = sections.map((section) => section.id);

export default function Privacy() {
  const active = useActiveSection(sectionIds);
  const activeIndex = sectionIds.indexOf(active);

  function jumpTo(event, id) {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  }

  const contents = (
    <ol className="privacy-toc-list">
      {sections.map((section, index) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            className={section.id === active ? 'is-active' : undefined}
            aria-current={section.id === active ? 'true' : undefined}
            onClick={(event) => jumpTo(event, section.id)}
          >
            <span className="privacy-toc-num">{String(index + 1).padStart(2, '0')}</span>
            {section.title}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <PageHero
        image="/images/photos/workspace.jpg"
        imageAlt="Alkebulan Global open-plan office with city views"
        focus="center 36%"
        eyebrow="Legal"
        title="Privacy Policy"
        intro="How Alkebulan Global LLC collects and uses information on this website."
      />

      {/* At a glance */}
      <section className="section section--white privacy-glance">
        <div className="container">
          <div className="privacy-glance-head">
            <div>
              <p className="eyebrow">Summary</p>
              <h2>Our privacy practices in brief</h2>
            </div>
            <div className="privacy-meta">
              <span className="privacy-updated">
                <Icon name="check" size={16} />
                Last updated {lastUpdated}
              </span>
              <button type="button" className="privacy-print" onClick={() => window.print()}>
                <Icon name="file" size={16} />
                Print / Save as PDF
              </button>
            </div>
          </div>

          <ul className="privacy-highlights">
            {highlights.map((item) => (
              <li key={item.title} className="card">
                <span className="icon-badge">
                  <Icon name={item.icon} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Full policy with a contents list */}
      <section className="section privacy-body">
        <div className="container privacy-layout">
          <aside className="privacy-toc" aria-label="On this page">
            <details className="privacy-toc-mobile">
              <summary>
                <span>On this page</span>
                <span className="privacy-toc-current">{sections[activeIndex]?.title}</span>
              </summary>
              {contents}
            </details>

            <div className="privacy-toc-desktop">
              <p className="privacy-toc-title">On this page</p>
              <div className="privacy-toc-progress" aria-hidden="true">
                <span style={{ transform: `scaleY(${(activeIndex + 1) / sections.length})` }} />
              </div>
              {contents}
            </div>
          </aside>

          <div className="privacy-content">
            {sections.map((section, index) => (
              <article id={section.id} key={section.id} className="privacy-section">
                <header>
                  <span className="icon-badge">
                    <Icon name={section.icon} />
                  </span>
                  <div>
                    <span className="privacy-section-num">{String(index + 1).padStart(2, '0')}</span>
                    <h2>{section.title}</h2>
                  </div>
                </header>
                {section.body}
              </article>
            ))}

            <div className="privacy-contact" id="contact-privacy">
              <div>
                <p className="eyebrow">Privacy requests</p>
                <h2>Contact us</h2>
                <p>
                  For questions about this policy, or to see, correct, or delete
                  your information, email or call us.
                </p>
              </div>
              <div className="privacy-contact-actions">
                <a className="btn btn--primary" href={`mailto:${email}?subject=${encodeURIComponent('Privacy request')}`}>
                  <Icon name="mail" size={18} />
                  {email}
                </a>
                <a className="btn btn--ghost" href={phoneHref}>
                  <Icon name="phone" size={18} />
                  {phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
