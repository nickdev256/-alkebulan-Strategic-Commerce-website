
import './Sectors.css';

const sectors = [
  {
    title: 'Energy',
    description:
      'Strategic energy infrastructure and project development connecting African resources to global demand.',
  },
  {
    title: 'Waste Management & Circular Economy',
    description:
      'Innovative solutions transforming waste into resources and building sustainable circular systems.',
  },
  {
    title: 'Raw & Critical Minerals',
    description:
      'Connecting African mineral assets to global supply chains with compliance and integrity.',
  },
  {
    title: 'Precious Metals & Gemstones',
    description:
      'High-value commodity expertise connecting producers to premium markets responsibly.',
  },
  {
    title: 'Global Product Sourcing',
    description:
      'Comprehensive sourcing solutions leveraging African production capabilities for global buyers.',
  },
];

function Sectors() {
  return (
    <section className="sectors-section" id="sectors">
      <div className="section-header">
        <h2>Core Sectors</h2>
      </div>

      <div className="sectors-grid">
        {sectors.map((sector) => (
          <article className="sector-card" key={sector.title}>
            <h3>{sector.title}</h3>
            <p>{sector.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Sectors;
