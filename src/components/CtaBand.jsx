import { Link } from 'react-router-dom';
import './CtaBand.css';

// Closing call-to-action panel used at the bottom of pages.
export default function CtaBand({ title, text, button = 'Start a Conversation' }) {
  return (
    <section className="section cta-section">
      <div className="container">
        <div className="cta-band">
          <div>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
          <Link to="/contact" className="btn btn--primary">
            {button}
          </Link>
        </div>
      </div>
    </section>
  );
}
