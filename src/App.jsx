
import { Routes, Route, Link } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import Portfolio from './pages/Portfolio.jsx';
import CSR from './pages/CSR.jsx';
import Contact from './pages/Contact.jsx';

import './App.css';

function NotFound() {
  return (
    <section className="not-found">
      <p className="eyebrow">404 — PAGE NOT FOUND</p>
      <h1>This page could not be found.</h1>
      <Link className="gold-button" to="/">
        Return Home
      </Link>
    </section>
  );
}

export default function App() {
  return (
    <div className="app">
      <Navbar />

      <main>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* About */}
          <Route path="/about" element={<About />} />
          <Route
            path="/about/company-snapshot"
            element={<About />}
          />
          <Route
            path="/about/who-we-are"
            element={<About />}
          />
          <Route
            path="/about/strategic-partners"
            element={<About />}
          />
          <Route
            path="/about/what-sets-us-apart"
            element={<About />}
          />

          {/* Services */}
          <Route path="/services" element={<Services />} />
          <Route
            path="/services/sectors"
            element={<Services />}
          />
          <Route
            path="/services/core-services"
            element={<Services />}
          />

          {/* Other pages */}
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/csr" element={<CSR />} />
          <Route path="/contact" element={<Contact />} />

          {/* Unknown URLs */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
