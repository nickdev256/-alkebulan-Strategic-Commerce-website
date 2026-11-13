import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { ceo, advisors, techLeads } from '../team.js';
import './OrgChart.css';

const organizations = [
  {
    key: 'continental-founders',
    name: 'Continental Founders™',
    logo: '/images/team/continental-founders-logo.jpg',
    logoSize: [580, 470],
    logoAlt: 'Continental Founders: Connecting talent, building across continents',
    text: 'A nonprofit organization advancing entrepreneurship, leadership development, research, and economic empowerment across Africa and the global diaspora.',
    listTitle: 'Key Programs',
    list: [
      'Genesis: Early Stage Support',
      'Ascend: Growth & Expansion',
      'Horizon: Global Readiness & Investment',
      'Research & Policy',
      'Partnerships & International Collaboration',
    ],
    roles: [
      'Program & Fellowship Coordination',
      'Institutional Partnerships',
      'Research & Thought Leadership Support',
      'Technology Coordination with Eth-Tech Solutions (web platform, applications, learning systems)',
      'Strategic Communication with Eth-Tech Outreach',
      'Global Ecosystem & Market Access Facilitation',
    ],
  },
  {
    key: 'alkebulan-global',
    name: 'Alkebulan Global LLC',
    tagline: 'Global Partners. Real Impact.',
    featured: true,
    text: 'International business development, diplomatic procurement, joint ventures, market access, and project enablement across Africa, the Americas, and global markets.',
    listTitle: 'Key Focus Areas',
    list: [
      'Energy & Natural Resources',
      'Infrastructure & Manufacturing',
      'Housing & Real Estate',
      'Trade & Market Access',
      'Strategic Partnerships',
    ],
    roles: [
      'Global Business Development & Market Access',
      'Diplomacy & Recruitment Support',
      'Joint Ventures & Strategic Alliances',
      'Investor & Government Relations',
      'Project Enablement (Energy, Mining, Infrastructure, Housing)',
      'Technology Coordination with Eth-Tech Solutions',
      'Strategic Communications & Stakeholder Engagement',
    ],
  },
  {
    key: 'eth-tech',
    name: 'Eth-Tech Solutions',
    logo: '/images/team/eth-tech-logo.jpg',
    logoSize: [860, 290],
    logoAlt: 'Eth-Tech Solutions: Building the future with technology',
    text: 'Technology solutions, digital infrastructure, and innovation services supporting business, education, and development initiatives across global markets.',
    leads: techLeads,
    listTitle: 'Key Services',
    list: [
      'Software & Web Development',
      'Digital Platforms & Systems',
      'IT Infrastructure & Support',
      'Data & Technology Solutions',
      'Marketing Support & Digital Strategy',
    ],
    roles: [
      'Technology Development & Digital Solutions',
      'Marketing Advisory Services (Jackie Namusisi)',
      'Technology Coordination with Alkebulan Global',
      'Technology Coordination for Continental Founders',
      'Business Development & Client Engagement',
      'Innovation & Technical Support',
    ],
  },
];

const sharedSupport = [
  { icon: 'users', title: 'Executive Coordination' },
  { icon: 'chat', title: 'Strategic Communications' },
  { icon: 'chip', title: 'Technology Integration' },
  { icon: 'chart', title: 'Marketing & Visibility' },
  { icon: 'handshake', title: 'Stakeholder Engagement' },
  { icon: 'file', title: 'Project Implementation' },
];

/* Horizontal centre of column i in an n-column row (matches the CSS grid gap). */
const col = (i, n) =>
  `calc((100% - ${n - 1} * var(--org-col-gap)) / ${n} * ${i + 0.5} + ${i} * var(--org-col-gap))`;

/*
 * Connector row between two tiers: stems hang from the tier above, a bar joins
 * them, and stems drop into the tier below. Arrowheads mark the direction.
 * On stacked (phone/tablet) layouts only the single centre arrow is shown.
 */
function Connector({ from, to, barStart, arrowUp = false, arrowDown = true, variant }) {
  return (
    <div className={`org-link org-link--${variant}`} aria-hidden="true">
      {from.map((left) => (
        <span key={`f${left}`} className={`org-stem org-stem--top${arrowUp ? ' has-arrow' : ''}`} style={{ left }} />
      ))}
      <span className="org-bar" style={{ left: barStart, right: barStart }} />
      {to.map((left) => (
        <span key={`t${left}`} className={`org-stem org-stem--bottom${arrowDown ? ' has-arrow' : ''}`} style={{ left }} />
      ))}
      <span className={`org-solo${arrowUp ? ' org-solo--both' : ''}`} />
    </div>
  );
}

// Opens a person's profile from anywhere in the chart.
const ProfileContext = createContext(() => {});

export function ProfileDialog({ person, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (person && !dialog.open) dialog.showModal();
    if (!person && dialog.open) dialog.close();
  }, [person]);

  return (
    <dialog
      ref={ref}
      className="org-dialog"
      aria-labelledby="org-dialog-name"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      {person && (
        <div className="org-dialog-inner">
          <button type="button" className="org-dialog-close" aria-label="Close profile" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
          <img src={person.photo} alt={person.name} width="800" height="800" />
          <div className="org-dialog-text">
            {person.org && <p className="eyebrow">{person.org}</p>}
            <h3 id="org-dialog-name">{person.name}</h3>
            <p className="org-dialog-role">{person.role}</p>
            {person.bio && <p className="org-dialog-bio">{person.bio}</p>}
            {person.remit && (
              <ul>
                {person.remit.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

function Person({ person, size = 'md' }) {
  const openProfile = useContext(ProfileContext);
  return (
    <article className={`org-person org-person--${size}`}>
      <button
        type="button"
        className="org-open"
        aria-label={`View profile: ${person.name}`}
        onClick={() => openProfile(person)}
      />
      <img className="org-photo" src={person.photo} alt={person.name} width="800" height="800" loading="lazy" decoding="async" />
      <div className="org-person-text">
        <h3>{person.name}</h3>
        <p className="org-role">{person.role}</p>
        <ul className="org-remit">
          {person.remit.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function Organization({ org, last }) {
  const openProfile = useContext(ProfileContext);
  return (
    <article className={`org-unit${org.featured ? ' org-unit--featured' : ''}`}>
      <header className="org-unit-head">
        {org.logo ? (
          <img src={org.logo} alt={org.logoAlt} width={org.logoSize[0]} height={org.logoSize[1]} loading="lazy" />
        ) : (
          <div className="org-unit-brand">
            <img src="/images/alkebulan-emblem.jpg" alt="" width="480" height="480" loading="lazy" />
            <div>
              <h3>{org.name}</h3>
              <p>{org.tagline}</p>
            </div>
          </div>
        )}

        {org.leads && (
          <div className="org-leads-wrap">
            <h4 className="org-leads-title">Leadership</h4>
            <ul className="org-leads">
              {org.leads.map((lead) => (
                <li key={lead.name}>
                  <button
                    type="button"
                    className="org-open"
                    aria-label={`View profile: ${lead.name}`}
                    onClick={() => openProfile(lead)}
                  />
                  <img src={lead.photo} alt={lead.name} width="800" height="800" loading="lazy" decoding="async" />
                  <strong>{lead.name}</strong>
                  <span>{lead.role}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <p className="org-unit-text">{org.text}</p>

      <div className="org-block org-block--grow">
          <h4 className="org-block-title">{org.listTitle}</h4>
          <ul className="org-tags">
            {org.list.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
      </div>

      <div className="org-block org-block--roles">
        <h4 className="org-block-title org-block-title--gold">Key Roles &amp; Functions</h4>
        <ul className="org-roles">
          {org.roles.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {!last && <span className="org-peer" aria-hidden="true" />}
    </article>
  );
}

export default function OrgChart() {
  const [profile, setProfile] = useState(null);
  const units = organizations.length;
  const unitCols = organizations.map((_, i) => col(i, units));
  const advisorCols = advisors.map((_, i) => col(i, advisors.length));

  return (
    <ProfileContext.Provider value={setProfile}>
    <section className="section org-chart-section" aria-labelledby="org-chart-title">
      <div className="container">
        <div className="section-head section-head--center">
          <p className="eyebrow">Organizational Chart</p>
          <h2 id="org-chart-title">Global Strategic Partnerships &amp; Technology Coordination</h2>
          <p>
            Continental Founders, Alkebulan Global LLC, and Eth-Tech Solutions
            work as one coordinated ecosystem under a single executive
            leadership. Select anyone in the chart to view their profile.
          </p>
          <ul className="org-values" aria-label="Our values">
            <li>People</li>
            <li>Partnerships</li>
            <li>Technology</li>
            <li>Prosperity</li>
          </ul>
        </div>

        <div className="org-chart">
          <div className="org-tier org-tier--ceo">
            <Person person={ceo} size="lg" />
          </div>

          <Connector variant="advisors" from={['50%']} to={advisorCols} barStart={advisorCols[0]} />

          <div className="org-tier org-tier--advisors">
            <span className="org-trunk" aria-hidden="true" />
            {advisors.map((person) => (
              <Person key={person.name} person={person} />
            ))}
          </div>

          <Connector
            variant="units"
            from={['50%', ...advisorCols]}
            to={unitCols}
            barStart={unitCols[0]}
          />

          <div className="org-tier org-tier--units">
            {organizations.map((org, i) => (
              <Organization key={org.key} org={org} last={i === units - 1} />
            ))}
          </div>

          <Connector variant="shared" from={unitCols} to={['50%']} barStart={unitCols[0]} arrowUp />

          <div className="org-shared">
            <h3>Shared Support &amp; Collaboration</h3>
            <ul>
              {sharedSupport.map((item) => (
                <li key={item.title}>
                  <Icon name={item.icon} size={26} />
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>

    <ProfileDialog person={profile} onClose={() => setProfile(null)} />
    </ProfileContext.Provider>
  );
}
