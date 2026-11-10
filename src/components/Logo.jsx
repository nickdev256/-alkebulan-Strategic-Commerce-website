import { Link } from 'react-router-dom';

// Globe emblem plus the ALKEBULAN / GLOBAL wordmark, as in the brand logo.
export default function Logo({ size = 'md' }) {
  return (
    <Link to="/" className={`logo logo--${size}`} aria-label="Alkebulan Global home">
      <img
        className="logo-emblem"
        src="/images/alkebulan-emblem.jpg"
        alt=""
        width="48"
        height="48"
      />
      <span className="logo-text">
        <span className="logo-name">Alkebulan</span>
        <span className="logo-sub">Global</span>
      </span>
    </Link>
  );
}
