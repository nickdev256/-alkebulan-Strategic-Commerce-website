import { Routes, Route, Link } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import Portfolio from './pages/Portfolio.jsx';
import CSR from './pages/CSR.jsx';
import Contact from './pages/Contact.jsx';

function NotFound() {
  return (
    <section className="section">
      <div className="container section-head section-head--center">
        <p className="eyebrow">404 — Page not found</p>
        <h1 className="not-found-title">This page could not be found.</h1>
        <p>The page may have moved, or the address may be incorrect.</p>
        <Link className="btn btn--dark" to="/" style={{ marginTop: 28 }}>
          Return Home
        </Link>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScrollToTop />
      <Navbar />

      <main id="main" tabIndex="-1">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/about" element={<About />} />
          <Route path="/about/:slug" element={<About />} />

          <Route path="/services" element={<Services />} />
          <Route path="/services/sectors" element={<Services />} />
          <Route path="/services/core-services" element={<Services />} />

          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/csr" element={<CSR />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
