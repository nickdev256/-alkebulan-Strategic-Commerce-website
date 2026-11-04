
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

const navigation = [
  { label: 'Home', path: '/' },
  {
    label: 'About',
    path: '/about',
    children: [
      { label: 'Company Snapshot', path: '/about/company-snapshot' },
      { label: 'Who We Are', path: '/about/who-we-are' },
      { label: 'Strategic Partners', path: '/about/strategic-partners' },
      { label: 'What Sets AG Apart', path: '/about/what-sets-us-apart' },
    ],
  },
  {
    label: 'Expertise',
    path: '/services',
    children: [
      { label: 'Core Sectors', path: '/services/sectors' },
      { label: 'Core Services', path: '/services/core-services' },
    ],
  },
  { label: 'Opportunities', path: '/portfolio' },
  { label: 'Insights', path: '/csr' },
  { label: 'Engage', path: '/contact' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <Link to="/" className="logo" onClick={closeMenu}>
        <span className="logo-mark">A</span>
        <span>Alkebulan Global</span>
      </Link>

      <button
        className="menu-toggle"
        type="button"
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      <nav
        className={`main-nav ${menuOpen ? 'nav-open' : ''}`}
        aria-label="Main navigation"
      >
        {navigation.map((item) => (
          <div className="nav-item" key={item.label}>
            <NavLink
              to={item.path}
              end={item.path === '/'}
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              {item.label}
            </NavLink>

            {item.children && (
              <div className="dropdown">
                {item.children.map((child) => (
                  <Link
                    key={child.path}
                    to={child.path}
                    onClick={closeMenu}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </header>
  );
}
