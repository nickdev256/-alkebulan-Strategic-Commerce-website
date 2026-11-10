import { NavLink } from 'react-router-dom';
import './PageHero.css';

// Banner at the top of every inner page. `tabs` adds sub-page links.
export default function PageHero({ eyebrow, title, intro, tabs }) {
  return (
    <section className="page-hero">
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {intro && <p className="page-hero-intro">{intro}</p>}
      </div>

      {tabs && (
        <div className="page-tabs">
          <div className="container">
            <nav aria-label={`${eyebrow} pages`}>
              {tabs.map((tab) => (
                <NavLink key={tab.path} to={tab.path}>
                  {tab.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </section>
  );
}
