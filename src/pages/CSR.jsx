
import { Link } from 'react-router-dom';
import './CSR.css';

const initiatives = [
  {
    title: 'Vocational Training & Skills Development',
    text: 'Support skills development aligned with employment, entrepreneurship, and relevant industry requirements.',
  },
  {
    title: 'Women in Enterprise',
    text: 'Encourage opportunities for women-owned enterprises through business development, training, and access to commercial networks.',
  },
  {
    title: 'Community Benefit',
    text: 'Promote consideration of local employment, community engagement, and long-term social value in relevant projects.',
  },
  {
    title: 'Responsible Supply Chains',
    text: 'Encourage transparency, appropriate due diligence, responsible sourcing, and respect for applicable standards.',
  },
  {
    title: 'Environmental Stewardship',
    text: 'Support consideration of environmental impacts, sustainable resource use, and circular-economy opportunities.',
  },
  {
    title: 'Measuring Impact',
    text: 'Work toward tracking outcomes using transparent measures, verified information, and appropriate reporting.',
  },
];

export default function CSR() {
  return (
    <div className="csr-page">
      <section className="csr-hero">
        <p className="eyebrow">Responsibility</p>
        <h1>Corporate Social Responsibility</h1>
        <p>
          Encouraging responsible commerce, inclusive opportunity,
          and sustainable economic development.
        </p>
      </section>

      <section className="csr-intro">
        <div className="csr-intro-inner">
          <h2>Responsible Growth</h2>
          <p>
            We believe that international commerce should consider
            more than commercial outcomes. Environmental responsibility,
            ethical sourcing, skills development, and community
            participation can contribute to stronger and more
            sustainable business relationships.
          </p>
          <p>
            Our approach is to encourage responsible practices
            throughout the partnerships and opportunities we support.
          </p>
        </div>
      </section>

      <section className="csr-content">
        <div className="csr-heading">
          <h2>Our Focus Areas</h2>
          <p>
            Areas in which responsible business practices can create
            lasting value.
          </p>
        </div>

        <div className="csr-grid">
          {initiatives.map((item) => (
            <article className="csr-card" key={item.title}>
              <span className="csr-mark" aria-hidden="true">◆</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="csr-cta">
        <h2>Partner for Sustainable Impact</h2>
        <p>
          Discuss how responsible sourcing, skills development,
          or inclusive growth could fit into your project.
        </p>
        <Link to="/contact" className="gold-button">
          Contact Us
        </Link>
      </section>
    </div>
  );
}
