import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import Icon from './Icon.jsx';
import { navigation } from '../navigation.js';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null); // expanded group in the phone menu
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const { pathname } = useLocation();

  function closeMenu() {
    setMenuOpen(false);
    setOpenSection(null);
  }

  // Close the menu after any link inside it is clicked.
  function handleNavClick(event) {
    if (event.target.closest('a')) closeMenu();
  }

  // Header shadow and the gold reading-progress bar.
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 8);
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // While the phone menu is open: stop the page behind it scrolling, close on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      setOpenSection(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-inner">
        <Logo />

        <nav
          id="main-nav"
          className={`main-nav ${menuOpen ? 'nav-open' : ''}`}
          aria-label="Main navigation"
          onClick={handleNavClick}
        >
          <div className="nav-panel-head">
            <span className="nav-panel-title">Menu</span>
          </div>

          <ul className="nav-list">
            {navigation.map((item, index) => {
              const inSection = item.path !== '/' && pathname.startsWith(item.path);
              const expanded = openSection === item.label;

              return (
                <li
                  className={`nav-item ${item.children ? 'has-dropdown' : ''} ${expanded ? 'is-expanded' : ''}`}
                  key={item.label}
                  style={{ '--i': index }}
                >
                  <div className="nav-row">
                    <NavLink
                      to={item.children ? item.children[0].path : item.path}
                      end={item.path === '/'}
                      className={`nav-link ${inSection ? 'active' : ''}`}
                    >
                      {item.label}
                      {item.children && <span className="caret" aria-hidden="true" />}
                    </NavLink>

                    {item.children && (
                      <button
                        type="button"
                        className="nav-expand"
                        aria-label={`Show ${item.label} pages`}
                        aria-expanded={expanded}
                        onClick={() => setOpenSection(expanded ? null : item.label)}
                      >
                        <span className="caret" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  {item.children && (
                    <div className="dropdown">
                      <div className="dropdown-inner">
                        {item.children.map((child) => (
                          <NavLink key={child.path} to={child.path} className="dropdown-link">
                            <span className="dropdown-icon">
                              <Icon name={child.icon} size={20} />
                            </span>
                            <span>
                              <strong>{child.label}</strong>
                              <small>{child.note}</small>
                            </span>
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <Link to="/contact" className="nav-cta">
            <Icon name="mail" size={18} />
            Engage
          </Link>
        </nav>

        <button
          className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
        >
          <span className="bars" />
        </button>
      </div>

      {/* Dimmed backdrop behind the phone menu */}
      <div
        className={`nav-backdrop ${menuOpen ? 'is-visible' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />
    </header>
  );
}
