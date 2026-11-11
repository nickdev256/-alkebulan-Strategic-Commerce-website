import { useParams } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import CtaBand from '../components/CtaBand.jsx';
import PhotoBreak from '../components/PhotoBreak.jsx';
import Icon from '../components/Icon.jsx';
import { subPages } from '../navigation.js';
import { advantages } from '../content.js';
import './About.css';

const pages = {
  'company-snapshot': {
    title: 'Company Snapshot',
    intro: 'An overview of Alkebulan Global and our strategic purpose.',
  },
  'who-we-are': {
    title: 'Who We Are',
    intro: 'A strategic business firm focused on global sourcing, advisory, and business development.',
  },
  'strategic-partners': {
    title: 'Strategic Partners',
    intro: 'Building partnerships between African enterprises and international markets.',
  },
  'what-sets-us-apart': {
    title: 'What Sets Alkebulan Global Apart',
    intro: 'A considered approach to market access, compliance, and cross-border execution.',
  },
};

const tabs = subPages('About');

const foundation = [
  {
    icon: 'target',
    title: 'Our Mission',
    text: 'To connect African enterprises with global opportunities through strategic commerce, trusted partnerships, and practical execution.',
  },
  {
    icon: 'link',
    title: 'Our Approach',
    text: 'We bring together market intelligence, stakeholder coordination, partnership development, and transaction support.',
  },
  {
    icon: 'chart',
    title: 'Our Three-Pillar Strategy',
    text: 'Strategic thinking, business development, and organizational analysis underpin our approach to sustainable growth.',
  },
];

const partners = [
  {
    icon: 'factory',
    title: 'African Enterprises & Producers',
    text: 'Support market access and connections with qualified international buyers.',
  },
  {
    icon: 'handshake',
    title: 'Corporate & Commercial Partners',
    text: 'Explore sourcing, supplier relationships, investment opportunities, and cross-border collaboration.',
  },
  {
    icon: 'scale',
    title: 'Institutional & Development Partners',
    text: 'Coordinate with relevant institutions, agencies, and stakeholders where there is a shared objective.',
  },
  {
    icon: 'users',
    title: 'Professional Service Partners',
    text: 'Collaborate with qualified legal, compliance, financial, logistics, and sector specialists.',
  },
];

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

function CompanySnapshot() {
  return (
    <>
      <section className="section section--white">
        <div className="container split split--top">
          <div className="prose">
            <p className="eyebrow">Our Company</p>
            <h2>A trusted bridge between African capability and global opportunity</h2>
            <p>
              Alkebulan Global is a strategic business firm focused on
              global sourcing, strategic thinking, leadership consulting,
              business development, and organizational analysis.
            </p>
            <p>
              With a focus on Africa-linked trade and investment, our
              approach is to help connect African capabilities with
              relevant international buyers, partners, and opportunities.
            </p>
            <p>
              We aim to bridge policy, commerce, and execution through
              professional relationships, clear processes, and a
              commitment to integrity.
            </p>
          </div>

          <figure className="brand-card">
            <img
              src="/images/alkebulan-global-logo.jpg"
              alt="Alkebulan Global logo: a gold globe centered on Africa. Access, Partnerships, Investment, Impact."
              width="900"
              height="900"
              loading="lazy"
            />
          </figure>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Foundation</p>
            <h2>Our Strategic Foundation</h2>
          </div>
          <IconCards items={foundation} />
        </div>
      </section>
    </>
  );
}

// Who We Are: the four areas we work across, how an engagement runs,
// and the principles that guide it.
const workAreas = [
  { icon: 'globe', title: 'Commerce', text: 'Connecting African capabilities with international buyers and opportunities.' },
  { icon: 'chart', title: 'Strategic Advisory', text: 'Market intelligence and strategy that inform partnership and market-entry decisions.' },
  { icon: 'handshake', title: 'Partnership Development', text: 'Building relationships between enterprises, buyers, investors, and institutions.' },
  { icon: 'link', title: 'Market Access', text: 'Opening practical routes for African enterprises into global markets.' },
];

const workSteps = [
  { title: 'Understand', text: 'We begin by understanding the organization, opportunity, sector requirements, and intended outcome.' },
  { title: 'Identify', text: 'We help identify potential partners suited to the opportunity.' },
  { title: 'Coordinate', text: 'We coordinate the steps required to move the conversation forward.' },
  { title: 'Explore', text: 'Together we explore a commercially viable relationship.' },
];

const guidingPrinciples = [
  { icon: 'shield', title: 'Appropriate due diligence', text: 'Every engagement is grounded in the checks it needs before it moves ahead.' },
  { icon: 'mail', title: 'Clear communication', text: 'Stakeholders stay informed and aligned at each stage.' },
  { icon: 'target', title: 'Realistic expectations', text: 'Outcomes are framed honestly from the start.' },
];

function WhoWeAre() {
  return (
    <>
      <section className="section section--white">
        <div className="container split">
          <div className="prose">
            <p className="eyebrow">Our Identity</p>
            <h2>Commerce, advisory, and market access together</h2>
            <p className="lead">
              We work at the intersection of commerce, strategic advisory,
              partnership development, and market access.
            </p>
          </div>

          <div className="work-areas">
            {workAreas.map((area) => (
              <article className="card work-area" key={area.title}>
                <div className="icon-badge">
                  <Icon name={area.icon} />
                </div>
                <h3>{area.title}</h3>
                <p>{area.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <p className="eyebrow">How We Work</p>
            <h2>Understanding first, then coordinated action</h2>
          </div>

          <ol className="work-steps">
            {workSteps.map((step, index) => (
              <li className="work-step" key={step.title}>
                <span className="work-step-num">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Our Principles</p>
            <h2>Every engagement is guided by</h2>
          </div>

          <div className="grid grid--3">
            {guidingPrinciples.map((item) => (
              <article className="card card--dark" key={item.title}>
                <div className="icon-badge">
                  <Icon name={item.icon} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function StrategicPartners() {
  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Our Partnership Network</p>
            <h2>Reliable relationships across the value chain</h2>
            <p>
              Strong international commerce depends on reliable relationships
              across suppliers, buyers, institutions, and specialist advisers.
            </p>
          </div>
          <IconCards items={partners} columns={2} />
        </div>
      </section>

      <section className="section section--white">
        <div className="container split">
          <div className="prose">
            <p className="eyebrow">Partnership Benefits</p>
            <h2>What partners gain from working with Alkebulan Global</h2>
          </div>
          <ul className="checklist">
            <li>Explore new market and sourcing opportunities.</li>
            <li>Build relationships with relevant commercial partners.</li>
            <li>Coordinate due diligence and transaction readiness.</li>
            <li>Improve communication between stakeholders.</li>
            <li>Identify practical pathways from introductions to execution.</li>
          </ul>
        </div>
      </section>
    </>
  );
}

function WhatSetsUsApart() {
  return (
    <section className="section section--dark">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Our Competitive Advantages</p>
          <h2>More than introductions</h2>
          <p>
            We focus on practical collaboration, market access, and
            responsible execution rather than introductions alone.
          </p>
        </div>
        <div className="grid grid--3">
          {advantages.map((item, index) => (
            <article className="card card--dark" key={item.title}>
              <span className="card-number">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const content = {
  'company-snapshot': CompanySnapshot,
  'who-we-are': WhoWeAre,
  'strategic-partners': StrategicPartners,
  'what-sets-us-apart': WhatSetsUsApart,
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
        eyebrow="Our Purpose"
        title="Bridging policy, commerce, and execution."
      />

      <div className={['what-sets-us-apart', 'who-we-are'].includes(key) ? 'about-cta-dark' : ''}>
        <CtaBand
          title="Discuss a Partnership"
          text="Tell us about your organization and the opportunity you would like to explore."
          button="Discuss a Partnership"
        />
      </div>
    </>
  );
}
