import PageHero from '../components/PageHero.jsx';
import CtaBand from '../components/CtaBand.jsx';
import PhotoBreak from '../components/PhotoBreak.jsx';
import Icon from '../components/Icon.jsx';
import './CSR.css';

// Policies and practices from the 2027 Corporate Profile and the About Us text.
const governance = [
  'Anti-bribery and anti-corruption',
  'Due diligence and counterparty verification',
  'Sanctions compliance and screening',
  'Conflict-of-interest management',
  'Human rights',
  'Anti-slavery',
  'Whistleblower protection',
  'Diversity and inclusion',
  'Responsible sourcing',
  'Responsible partner engagement',
  'Confidentiality',
  'Applicable international trade requirements',
];

const initiatives = [
  { icon: 'graduation', title: 'Vocational Training & Skills Development', text: 'Support skills development aligned with employment, entrepreneurship, and relevant industry requirements.' },
  { icon: 'users', title: 'Women in Enterprise', text: 'Encourage opportunities for women-owned enterprises through business development, training, and access to commercial networks.' },
  { icon: 'handshake', title: 'Community Benefit', text: 'Promote consideration of local employment, community engagement, and long-term social value in relevant projects.' },
  { icon: 'shield', title: 'Responsible Supply Chains', text: 'Encourage transparency, appropriate due diligence, responsible sourcing, and respect for applicable standards.' },
  { icon: 'leaf', title: 'Environmental Stewardship', text: 'Support consideration of environmental impacts, sustainable resource use, and circular-economy opportunities.' },
  { icon: 'chart', title: 'Measuring Impact', text: 'Work toward tracking outcomes using transparent measures, verified information, and appropriate reporting.' },
];

export default function CSR() {
  return (
    <>
      <PageHero
        image="/images/photos/csr-hero.jpg"
        imageAlt="Alkebulan Global presenter leading a briefing on Africa–U.S. trade and investment opportunities"
        focus="center 40%"
        eyebrow="Responsibility"
        title="Corporate Social Responsibility"
        intro="Encouraging responsible commerce, inclusive opportunity, and sustainable economic development."
      />

      <section className="section section--white">
        <div className="container split">
          <div className="prose">
            <p className="eyebrow">Responsible Growth</p>
            <h2>Commerce that considers more than the bottom line</h2>
            <p>
              We believe that international commerce should consider more
              than commercial outcomes. Environmental responsibility,
              ethical sourcing, skills development, and community
              participation can contribute to stronger and more sustainable
              business relationships.
            </p>
            <p>
              Our approach is to encourage responsible practices throughout
              the partnerships and opportunities we support.
            </p>
          </div>

          <blockquote className="csr-quote">
            <p>
              International commerce should consider more than commercial
              outcomes.
            </p>
            <footer>Alkebulan Global</footer>
          </blockquote>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container split split--top">
          <div className="prose">
            <p className="eyebrow">Governance, Ethics &amp; Responsible Commerce</p>
            <h2>Trust, accountability, and compliance</h2>
            <p>
              Alkebulan Global is committed to ethical business conduct,
              responsible procurement, transparent commercial practices, and
              appropriate due diligence.
            </p>
            <p>
              We recognize that sustainable partnerships depend upon trust,
              accountability, compliance, and the responsible management of
              commercial and institutional relationships.
            </p>
          </div>
          <div>
            <p className="governance-intro">Our policies and practices address:</p>
            <ul className="checklist checklist--light">
              {governance.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <PhotoBreak
        image="/images/photos/lounge-view.jpg"
        alt="Alkebulan Global client lounge overlooking the city"
        focus="center 50%"
        eyebrow="Access · Partnerships · Investment · Impact"
        title="Commerce that builds stronger communities and lasting relationships."
      />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Our Focus Areas</p>
            <h2>Where responsible practice creates value</h2>
            <p>
              Areas in which responsible business practices can create
              lasting value.
            </p>
          </div>

          <div className="grid grid--3">
            {initiatives.map((item) => (
              <article className="card" key={item.title}>
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

      <CtaBand
        title="Partner for Sustainable Impact"
        text="Discuss how responsible sourcing, skills development, or inclusive growth could fit into your project."
        button="Contact Us"
      />
    </>
  );
}
