import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import CtaBand from '../components/CtaBand.jsx';
import PhotoBreak from '../components/PhotoBreak.jsx';
import Icon from '../components/Icon.jsx';
import OrgChart, { ProfileDialog } from '../components/OrgChart.jsx';
import { ceo, advisors, techLeads } from '../team.js';
import { subPages } from '../navigation.js';
import { advantages } from '../content.js';
import './About.css';

const pages = {
  'company-snapshot': {
    title: 'Company Snapshot',
    intro: 'Our company, our purpose, and what drives us.',
  },
  'who-we-are': {
    title: 'Who We Are',
    intro: 'Africa-Centered. Globally Connected.',
  },
  'strategic-partners': {
    title: 'Strategic Partners',
    intro: 'Working with governments, corporations, institutional buyers, investors, project developers, and qualified suppliers.',
  },
  'what-sets-us-apart': {
    title: 'What Sets Alkebulan Global Apart',
    intro: 'Access • Credibility • Discretion • Execution • Exceptional Opportunity',
  },
  'our-team': {
    title: 'Our Team',
    intro: 'The people who lead Alkebulan Global and support our partners.',
  },
};

const tabs = subPages('About');

function IconCards({ items, columns = 3 }) {
  return (
    <div className={`grid grid--${columns}`}>
      {items.map((item) => (
        <article className="card" key={item.title}>
          <div className="icon-badge">
            <Icon name={item.icon} />
          </div>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

/* ---------- Company Snapshot: overview, mission, vision, leadership ---------- */

const missionVision = [
  {
    icon: 'target',
    title: 'Our Mission',
    text: 'To connect credible partners, facilitate responsible international commerce, expand market access, and enable strategic investments and projects that generate sustainable economic value across Africa and global markets.',
  },
  {
    icon: 'globe',
    title: 'Our Vision',
    text: 'To become a globally respected strategic advisory and commercial engagement enterprise recognized for excellence, institutional credibility, trusted relationships, and the ability to translate exceptional opportunities into lasting economic impact.',
  },
];

// What Alkebulan Global does beyond making introductions.
const approach = [
  'Origination',
  'Strategic alignment',
  'Partner identification',
  'Due diligence coordination',
  'Market-entry support',
  'Project enablement',
  'Long-term relationship development',
];

function CompanySnapshot() {
  return (
    <>
      <section className="section section--white">
        <div className="container split split--top">
          <div className="prose">
            <p className="eyebrow">Company Overview</p>
            <h2>Global Partners. Real Impact.</h2>
            <p>
              Alkebulan Global LLC is a U.S.-based international strategic
              advisory, diplomatic procurement, and market-access enterprise
              connecting Africa with the United States, the Caribbean, and
              global markets.
            </p>
            <p>
              Alkebulan Global operates at the intersection of international
              commerce,
              institutional relationships, strategic investment, and
              sustainable economic development.
            </p>
            <p>
              We work with governments, corporations, institutional buyers,
              investors, project developers, and qualified suppliers to
              identify commercially viable opportunities, establish credible
              partnerships, navigate complex markets, and advance initiatives
              toward execution.
            </p>
            <p>
              Our approach extends beyond introductions. We focus on:
            </p>
            <ul className="approach-chips">
              {approach.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <figure className="brand-card">
            <img
              src="/images/alkebulan-global-logo.jpg"
              alt="Alkebulan Global logo: a gold globe centered on Africa. Access, Partnerships, Investment, Impact."
              width="900"
              height="900"
              loading="lazy"
            />
            <figcaption className="brand-card-caption">
              Headquarters: One World Trade Center, New York, USA
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Mission &amp; Vision</p>
            <h2>What drives Alkebulan Global</h2>
          </div>
          <IconCards items={missionVision} columns={2} />
        </div>
      </section>

      <section className="section section--white team-teaser">
        <div className="container team-teaser-inner">
          <div className="team-teaser-faces" aria-hidden="true">
            {[ceo, ...advisors, ...techLeads].map((person) => (
              <img key={person.name} src={person.photo} alt="" width="800" height="800" loading="lazy" />
            ))}
          </div>
          <div>
            <h2>Meet the people behind Alkebulan Global</h2>
            <p>Our leadership, our team, and how we are organized.</p>
          </div>
          <Link to="/about/our-team" className="btn btn--dark">
            Meet our team
          </Link>
        </div>
      </section>
    </>
  );
}

/* ---------- Who We Are: philosophy and geographic reach ---------- */

const priorityMarkets = [
  { country: 'United States', code: 'us' },
  { country: 'Namibia', code: 'na' },
  { country: 'Mozambique', code: 'mz' },
  { country: 'Nigeria', code: 'ng' },
  { country: 'Uganda', code: 'ug' },
  { country: 'Zambia', code: 'zm' },
];

const globalReach = ['United States', 'Caribbean', 'Europe', 'Gulf region', 'Asia'];

function WhoWeAre() {
  return (
    <>
      <section className="section section--white">
        <div className="container split split--top">
          <div className="prose">
            <p className="eyebrow">Our Philosophy</p>
            <h2>From exporting opportunity to building African value</h2>
            <p>
              Alkebulan Global believes Africa&rsquo;s next phase of economic
              growth must move beyond exporting opportunity toward building
              African value, capacity, ownership, industrialization, and
              long-term wealth.
            </p>
            <p>
              Our work is therefore guided by a Mines-to-Market and
              Resources-to-Value philosophy: connecting natural resources,
              infrastructure, technology, capital, skills, local enterprise,
              and global markets so that more economic value is created and
              retained within African economies.
            </p>
          </div>

          <div className="markets-card">
            <p className="eyebrow">Priority Markets</p>
            <p>
              Headquartered in the United States, with strategic engagement
              and opportunity development across Southern, Eastern, Central,
              and Western Africa.
            </p>
            <ul className="market-list">
              {priorityMarkets.map((market) => (
                <li key={market.code}>
                  <img src={`https://flagcdn.com/${market.code}.svg`} alt="" width="22" height="15" loading="lazy" />
                  {market.country}
                </li>
              ))}
              <li className="market-list-more">and other African economies</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split split--top">
          <div className="prose">
            <p className="eyebrow">Our Geographic Reach</p>
            <h2>Africa-centered, with international engagement worldwide</h2>
            <p>
              Alkebulan Global maintains an Africa-centered international
              business approach. Our international engagement extends
              through commercial relationships and strategic collaboration
              to:
            </p>
            <ul className="reach-list">
              {globalReach.map((region) => (
                <li key={region}>{region}</li>
              ))}
            </ul>
          </div>

          <div className="diaspora-card">
            <p className="eyebrow">The African Diaspora</p>
            <p>
              The African Diaspora represents an essential component of our
              value chain, contributing professional expertise, investment
              networks, entrepreneurship, technology, and international
              market connectivity.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- Strategic Partners: who we work with and our business model ---------- */

const partnerTypes = [
  { icon: 'scale', title: 'Governments' },
  { icon: 'factory', title: 'Corporations' },
  { icon: 'box', title: 'Institutional Buyers' },
  { icon: 'coins', title: 'Investors' },
  { icon: 'bolt', title: 'Project Developers' },
  { icon: 'shield', title: 'Qualified Suppliers' },
];

const businessModel = [
  'Strategic intelligence',
  'Institutional access',
  'Commercial due diligence',
  'Cross-border procurement',
  'Partnership development',
  'Project enablement',
];

// Partner organizations in the Alkebulan Global ecosystem.
const partnerOrgs = [
  {
    name: 'Continental Founders™',
    type: 'Nonprofit Partner',
    logo: '/images/team/continental-founders-logo.jpg',
    logoSize: [580, 470],
    url: 'https://www.continentalfounders.org',
    domain: 'continentalfounders.org',
    text: 'A nonprofit organization advancing entrepreneurship, leadership development, research, and economic empowerment across Africa and the global diaspora.',
    focus: ['Genesis: Early Stage Support', 'Ascend: Growth & Expansion', 'Horizon: Global Readiness & Investment', 'Research & Policy'],
  },
  {
    name: 'Eth-Tech Solutions',
    type: 'Technology Partner',
    logo: '/images/team/eth-tech-logo.jpg',
    logoSize: [860, 290],
    url: 'https://www.ethtechsolutions.com',
    domain: 'ethtechsolutions.com',
    text: 'Technology solutions, digital infrastructure, and innovation services supporting business, education, and development initiatives across global markets.',
    focus: ['Software & Web Development', 'Digital Platforms & Systems', 'IT Infrastructure & Support', 'Data & Technology Solutions'],
  },
];

function StrategicPartners() {
  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Who We Work With</p>
            <h2>Credible partners, commercially viable opportunities</h2>
            <p>
              Each brings a different strength. Our role is to align them
              around opportunities that are commercially viable and ready to
              move forward.
            </p>
          </div>
          <ul className="partner-types">
            {partnerTypes.map((item) => (
              <li key={item.title} className="card">
                <span className="icon-badge">
                  <Icon name={item.icon} />
                </span>
                <h3>{item.title}</h3>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--white">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Partner Organizations</p>
            <h2>Working together across our ecosystem</h2>
            <p>
              Alkebulan Global works alongside two partner organizations that
              extend what we offer: one develops entrepreneurs and leaders, the
              other delivers technology.
            </p>
          </div>

          <ul className="partner-orgs">
            {partnerOrgs.map((org) => (
              <li key={org.name}>
                <a className="partner-org" href={org.url} target="_blank" rel="noopener noreferrer">
                  <span className="partner-org-logo">
                    <img src={org.logo} alt={org.name} width={org.logoSize[0]} height={org.logoSize[1]} loading="lazy" />
                  </span>
                  <span className="partner-org-body">
                    <span className="partner-org-type">{org.type}</span>
                    <span className="partner-org-name">{org.name}</span>
                    <span className="partner-org-text">{org.text}</span>
                    <span className="partner-org-focus">
                      {org.focus.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </span>
                    <span className="partner-org-link">
                      Visit {org.domain}
                      <span className="visually-hidden"> (opens in a new tab)</span>
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div className="prose">
            <p className="eyebrow">Our Business Model</p>
            <h2>Relationships, structures, and pathways to value</h2>
            <p>
              Our business model integrates six capabilities that help
              transform opportunity into sustainable commercial value.
            </p>
          </div>
          <ul className="checklist">
            {businessModel.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

/* ---------- What Sets Us Apart: strategic advantage and our difference ---------- */

const keyQuestions = [
  'Who are the right partners?',
  'Where is the market?',
  'What does government require?',
  'How should the opportunity be structured?',
  'What risks must be addressed?',
  'Where can capital come from?',
  'What must happen next to move toward execution?',
];

// The roles Alkebulan Global plays for its partners.
const roles = [
  { icon: 'link', title: 'Strategic connector' },
  { icon: 'target', title: 'Opportunity originator' },
  { icon: 'globe', title: 'Market-access partner' },
  { icon: 'bolt', title: 'Project-enablement platform' },
];

function WhatSetsUsApart() {
  return (
    <>
      <section className="section section--white">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Our Strategic Advantage</p>
            <h2>Excellence is the foundation of every relationship</h2>
            <p>
              At Alkebulan Global, excellence is not simply a standard of
              service. It is the foundation upon which we establish
              relationships, evaluate opportunities, and pursue long-term
              commercial value.
            </p>
          </div>
          <ol className="advantage-list">
            {advantages.map((item, index) => (
              <li key={item.title} className="card">
                <span className="card-number">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Our Difference</p>
            <h2>A bridge between opportunity and execution</h2>
            <p>
              We bring together international access, trusted local
              relationships, strategic intelligence, commercial networks, and
              cross-sector expertise to help partners answer the questions
              that determine whether an opportunity can become a viable
              business.
            </p>
          </div>
          <ol className="question-grid">
            {keyQuestions.map((question, index) => (
              <li key={question} className="card card--dark">
                <span className="card-number">0{index + 1}</span>
                <h3>{question}</h3>
              </li>
            ))}
            <li className="question-cta">
              <Link to="/contact">
                <h3>Let&rsquo;s answer them together</h3>
                <span>Start a conversation</span>
              </Link>
            </li>
          </ol>

          <div className="roles">
            <p className="roles-lead">
              This practical, relationship-driven approach makes Alkebulan
              Global more than a traditional consultancy. We operate as a:
            </p>
            <ul className="roles-list">
              {roles.map((role) => (
                <li key={role.title}>
                  <span className="icon-badge">
                    <Icon name={role.icon} />
                  </span>
                  {role.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- Our Team: leadership, team cards, organizational chart ---------- */

function TeamCard({ person, onOpen }) {
  return (
    <li className="team-card">
      <button type="button" onClick={() => onOpen(person)} aria-label={`View profile: ${person.name}`}>
        <span className="team-card-photo">
          <img src={person.photo} alt="" width="800" height="800" loading="lazy" />
        </span>
        <span className="team-card-body">
          <span className="team-card-org">{person.org}</span>
          <span className="team-card-name">{person.name}</span>
          <span className="team-card-role">{person.role}</span>
          <span className="team-card-link">View profile</span>
        </span>
      </button>
    </li>
  );
}

function OurTeam() {
  const [profile, setProfile] = useState(null);

  return (
    <>
      <section className="section">
        <div className="container leader">
          <div className="leader-badge leader-badge--photo">
            <img src={ceo.photo} alt={ceo.name} width="800" height="800" loading="lazy" />
          </div>
          <div className="prose">
            <p className="eyebrow">Leadership</p>
            <h2>Ambassador Dr. Karen L. Booker</h2>
            <p className="leader-role">Founder &amp; Chief Executive Officer</p>
            <p>
              Ambassador Dr. Karen L. Booker brings more than four decades of
              leadership experience in public administration, organizational
              transformation, strategic management, and international
              business development.
            </p>
            <p>
              Her experience informs Alkebulan Global&rsquo;s commitment to
              institutional excellence, responsible economic development,
              strategic partnerships, and the creation of sustainable
              opportunities between Africa and global markets.
            </p>
            <p>
              Under her leadership, the company continues to strengthen its
              position as a strategic bridge connecting people, institutions,
              resources, markets, and commercial opportunity.
            </p>
          </div>
        </div>
      </section>


      <section className="section section--white">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Our Team</p>
            <h2>The people you will work with</h2>
            <p>Select a team member to view their profile.</p>
          </div>

          <h3 className="team-group-title">Advisory &amp; Executive Team</h3>
          <ul className="team-grid">
            {advisors.map((person) => (
              <TeamCard key={person.name} person={person} onOpen={setProfile} />
            ))}
          </ul>

          <h3 className="team-group-title">Technology Partner: Eth-Tech Solutions</h3>
          <ul className="team-grid">
            {techLeads.map((person) => (
              <TeamCard key={person.name} person={person} onOpen={setProfile} />
            ))}
          </ul>
        </div>
      </section>

      <OrgChart />

      <ProfileDialog person={profile} onClose={() => setProfile(null)} />
    </>
  );
}

const content = {
  'company-snapshot': CompanySnapshot,
  'who-we-are': WhoWeAre,
  'strategic-partners': StrategicPartners,
  'what-sets-us-apart': WhatSetsUsApart,
  'our-team': OurTeam,
};

export default function About() {
  const { slug } = useParams();
  const key = pages[slug] ? slug : 'company-snapshot';
  const page = pages[key];
  const Content = content[key];

  return (
    <>
      <PageHero
        image="/images/photos/reception.jpg"
        imageAlt="Alkebulan Global reception desk with the company emblem"
        focus="center 32%"
        eyebrow="About Alkebulan Global"
        title={page.title}
        intro={page.intro}
        tabs={tabs}
      />

      <Content />

      <PhotoBreak
        image="/images/photos/library-wide.jpg"
        alt="Alkebulan Global library with an armchair, city views and shelves beneath the company emblem"
        focus="center 18%"
        eyebrow="Africa • United States • Caribbean • Global African Diaspora"
        title="Transforming relationships into investment, resources into value, and partnerships into generational prosperity."
      />

      <CtaBand
        title="Discuss a Partnership"
        text="Tell us about your organization and the opportunity you would like to explore."
        button="Discuss a Partnership"
      />
    </>
  );
}
