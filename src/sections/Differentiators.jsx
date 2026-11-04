
import './Differentiators.css';

const differentiators = [
  {
    title: 'Diplomatic Procurement Approach',
    description:
      'We operate as a bridge between policy, commerce, and execution—supporting complex cross-border engagements where credibility, compliance, and stakeholder alignment matter.',
  },
  {
    title: 'Africa-to-U.S. Market Access',
    description:
      'Connect African enterprises and projects to U.S. buyer ecosystems, institutional relationships, diaspora networks, and strategic partners—while enabling routes to the Middle East and global markets.',
  },
  {
    title: 'Execution-Ready Partnering',
    description:
      'We prioritize real-world deliverability: qualified partners, clear roles, defined documentation flow, and practical commercial pathways from concept to completion.',
  },
  {
    title: 'High-Integrity Transaction Support',
    description:
      'Support due diligence coordination, KYC/KYB readiness, and risk-managed structuring—helping deals move from introductions to implementable transactions.',
  },
];

function Differentiators() {
  return (
    <section
      className="differentiators-section"
      id="differentiators"
    >
      <h2>What Sets AG Apart</h2>

      <div className="differentiators-grid">
        {differentiators.map((item) => (
          <article
            className="differentiator-card"
            key={item.title}
          >
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Differentiators;
