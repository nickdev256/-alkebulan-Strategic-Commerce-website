
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-content">
        <div className="footer-brand">
          <h2>Alkebulan Global</h2>
          <p>
            Bridging policy, commerce, and execution to expand
            Africa's participation in global trade.
          </p>
        </div>

        <div className="footer-links">
          <h3>Explore</h3>
          <Link to="/about">About Us</Link>
          <Link to="/services">Expertise</Link>
          <Link to="/portfolio">Opportunities</Link>
          <Link to="/csr">Insights</Link>
          <Link to="/contact">Engage</Link>
        </div>

        <div className="footer-links">
          <h3>Contact</h3>
          <Link to="/contact">Business Inquiries</Link>
          <a href="mailto:info@alkebulanglobal.com">
            Email Us
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Alkebulan Global.
          All rights reserved.
        </p>
        <p>Empowering Africa's Role in Global Commerce</p>
      </div>
    </footer>
  );
}
