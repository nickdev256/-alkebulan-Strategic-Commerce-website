import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './PageHero.css';

// Banner at the top of every inner page. `tabs` adds sub-page links.
// `image` fills the right of the banner with a photo; `focus` sets which part
// of the photo stays in view (CSS object-position, e.g. "70% 40%").
export default function PageHero({ eyebrow, title, intro, tabs, image, imageAlt = '', focus = 'center' }) {
  const tabsRef = useRef(null);
  const { pathname } = useLocation();

  // On narrow screens the tabs scroll sideways: bring the current one into view.
  useEffect(() => {
    const nav = tabsRef.current;
    const active = nav?.querySelector('a.active');
    if (!nav || !active) return;
    nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
  }, [pathname]);

  return (
    <section className={image ? 'page-hero page-hero--photo' : 'page-hero'}>
      {image && (
        <div className="page-hero-bg">
          <img
            src={image}
            alt={imageAlt}
            width="1100"
            height="1560"
            fetchPriority="high"
            style={{ objectPosition: focus }}
          />
        </div>
      )}

      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {intro && <p className="page-hero-intro">{intro}</p>}
      </div>

      {tabs && (
        <div className="page-tabs">
          <div className="container">
            <nav aria-label={`${eyebrow} pages`} ref={tabsRef}>
              {tabs.map((tab) => (
                <NavLink key={tab.path} to={tab.path}>
                  {tab.short ? (
                    <>
                      <span className="tab-full">{tab.label}</span>
                      <span className="tab-short">{tab.short}</span>
                    </>
                  ) : (
                    tab.label
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </section>
  );
}
