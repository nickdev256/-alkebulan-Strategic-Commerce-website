import PageHero from '../components/PageHero.jsx';
import CtaBand from '../components/CtaBand.jsx';
import Icon from '../components/Icon.jsx';
import './CSR.css';

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
