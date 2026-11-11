import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { subPages } from '../navigation.js';
import { contactEmail as email } from '../content.js';
import Icon from './Icon.jsx';
import './Footer.css';

const expertise = subPages('Expertise');

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo size="lg" />
            <p>
              Bridging policy, commerce, and execution to expand
              Africa's participation in global trade.
            </p>
          </div>

          <div className="footer-col">
            <h3>Company</h3>
            <Link to="/about">About Us</Link>
            <Link to="/portfolio">Opportunities</Link>
            <Link to="/csr">Insights</Link>
            <Link to="/contact">Engage</Link>
          </div>

          <div className="footer-col">
            <h3>Expertise</h3>
            {expertise.map((item) => (
              <Link key={item.path} to={item.path}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="footer-col">
            <h3>Contact</h3>
            <a href={`mailto:${email}`} className="footer-email">
              <Icon name="mail" size={18} /> {email}
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Alkebulan Global. All rights reserved.</p>
          <p className="footer-slogan">Connecting Opportunity. Building Legacy.</p>
        </div>
      </div>
    </footer>
  );
}
