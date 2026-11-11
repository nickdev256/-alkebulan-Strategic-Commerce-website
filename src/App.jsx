
import { useEffect } from 'react';
import {
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import Portfolio from './pages/Portfolio.jsx';
import CSR from './pages/CSR.jsx';
import Contact from './pages/Contact.jsx';

import './App.css';

// ==========================================
// ALKEBULAN GLOBAL WEBSITE SEO CONFIGURATION
// ==========================================

const SITE_NAME = 'Alkebulan Global LLC';
const SITE_URL = 'https://alkebulan-global.com';

const DEFAULT_DESCRIPTION =
  'Alkebulan Global is a New York-based international strategic advisory, market access and business development firm connecting Africa, the United States, the Caribbean and the global African Diaspora.';

// SEO information for individual pages
const seoConfig = {
  '/': {
    title:
      'Alkebulan Global LLC | Global Partners. Real Impact.',
    description:
      'Connecting Africa, the United States, the Caribbean and the global African Diaspora through strategic advisory, international trade, investment, partnerships and project development.',
    keywords:
      'Alkebulan Global LLC, international strategic advisory, Africa trade, global partnerships, African investment, market access, business development',
  },

  '/about': {
    title:
      'About Alkebulan Global | Our Vision, Mission & Leadership',
    description:
      'Discover Alkebulan Global LLC, a New York-based international strategic advisory and business development firm founded by Ambassador Dr. Karen L. Booker.',
    keywords:
      'About Alkebulan Global, Ambassador Dr Karen L Booker, African business leadership, strategic advisory, international business development',
  },

  '/about/company-snapshot': {
    title:
      'Company Overview | Alkebulan Global LLC',
    description:
      'Learn about Alkebulan Global LLC, our international business focus, strategic advisory services, global partnerships and commitment to Africa-centered development.',
    keywords:
      'Alkebulan Global company overview, international strategic advisory, global business development',
  },

  '/about/who-we-are': {
    title:
      'Who We Are | Alkebulan Global LLC',
    description:
      'Meet Alkebulan Global, an international strategic connector and market access partner linking African opportunities with global business networks.',
    keywords:
      'Who we are Alkebulan Global, Africa global business connections, strategic partnerships',
  },

  '/about/strategic-partners': {
    title:
      'Strategic Partners | Alkebulan Global',
    description:
      'Explore Alkebulan Global’s approach to connecting governments, corporations, investors, project developers and local partners.',
    keywords:
      'Alkebulan Global strategic partners, international joint ventures, business partnerships, Africa investment partners',
  },

  '/about/what-sets-us-apart': {
    title:
      'What Sets Us Apart | Alkebulan Global',
    description:
      'Discover how Alkebulan Global combines international access, trusted local relationships, strategic intelligence and commercial networks to enable projects and partnerships.',
    keywords:
      'Alkebulan Global difference, project enablement, international market access, strategic business advisory',
  },

  '/services': {
    title:
      'Strategic Advisory & Business Development Services | Alkebulan Global',
    description:
      'Explore Alkebulan Global’s six strategic focus areas: Mines-to-Market, strategic partnerships, market access, project enablement, leadership and investment advisory.',
    keywords:
      'strategic advisory services, Mines-to-Market, market access, project enablement, financial advisory, business development Africa',
  },

  '/services/sectors': {
    title:
      'Strategic Sectors | Mining, Energy, Infrastructure & More',
    description:
      'Explore Alkebulan Global’s priority sectors, including critical minerals, mining, oil and gas, energy, infrastructure, manufacturing, agriculture, technology and logistics.',
    keywords:
      'African mining sector, critical minerals, oil and gas, infrastructure development, African manufacturing, energy investment',
  },

  '/services/core-services': {
    title:
      'Core Services | Alkebulan Global LLC',
    description:
      'Discover Alkebulan Global’s core services in strategic partnerships, joint ventures, market access, project development and investment advisory.',
    keywords:
      'Alkebulan Global core services, international business advisory, market entry, joint ventures, investment readiness',
  },

  '/portfolio': {
    title:
      'Projects & Portfolio | Alkebulan Global LLC',
    description:
      'Explore Alkebulan Global’s project interests, development initiatives and strategic opportunities across African and international markets.',
    keywords:
      'Alkebulan Global projects, African development projects, international investment opportunities, project development',
  },

  '/csr': {
    title:
      'Corporate Social Responsibility | Alkebulan Global',
    description:
      'Learn about Alkebulan Global’s commitment to responsible business, integrity, sustainable development and responsible international partnerships.',
    keywords:
      'Alkebulan Global corporate responsibility, responsible business, sustainable development, ethical international trade',
  },

  '/contact': {
    title:
      'Contact Alkebulan Global | Global Business Partnerships',
    description:
      'Connect with Alkebulan Global LLC for strategic advisory, market access, international partnerships, trade, investment and project development enquiries.',
    keywords:
      'Contact Alkebulan Global, international business enquiries, African investment partnerships, strategic advisory contact',
  },

  '/404': {
    title: 'Page Not Found | Alkebulan Global LLC',
    description:
      'The requested page could not be found on the Alkebulan Global website.',
    keywords: 'Alkebulan Global',
  },
};

// ==========================================
// DYNAMIC SEO COMPONENT
// ==========================================

function SEO() {
  const location = useLocation();

  useEffect(() => {
    const pathname =
      location.pathname.replace(/\/+$/, '') || '/';

    const pageSEO =
      seoConfig[pathname] || seoConfig['/404'];

    const canonicalPath =
      seoConfig[pathname] ? pathname : '/404';

    const canonicalURL =
      `${SITE_URL}${canonicalPath === '/' ? '/' : canonicalPath}`;

    // Update browser title
    document.title = pageSEO.title;

    // Create or update meta tags
    const updateMeta = (attribute, key, content) => {
      let element = document.head.querySelector(
        `meta[${attribute}="${key}"]`
      );

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // Standard SEO metadata
    updateMeta(
      'name',
      'description',
      pageSEO.description || DEFAULT_DESCRIPTION
    );

    updateMeta(
      'name',
      'keywords',
      pageSEO.keywords || ''
    );

    updateMeta('name', 'author', SITE_NAME);

    updateMeta(
      'name',
      'robots',
      pathname === '/404'
        ? 'noindex, follow'
        : 'index, follow, max-image-preview:large'
    );

    // Canonical URL
    let canonical = document.head.querySelector(
      'link[rel="canonical"]'
    );

    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }

    canonical.href = canonicalURL;

    // Open Graph metadata
    updateMeta('property', 'og:type', 'website');
    updateMeta('property', 'og:site_name', SITE_NAME);
    updateMeta('property', 'og:title', pageSEO.title);
    updateMeta(
      'property',
      'og:description',
      pageSEO.description || DEFAULT_DESCRIPTION
    );
    updateMeta('property', 'og:url', canonicalURL);
    updateMeta(
      'property',
      'og:image',
      `${SITE_URL}/og-image.jpg`
    );
    updateMeta('property', 'og:locale', 'en_US');

    // Twitter metadata
    updateMeta(
      'name',
      'twitter:card',
      'summary_large_image'
    );

    updateMeta(
      'name',
      'twitter:title',
      pageSEO.title
    );

    updateMeta(
      'name',
      'twitter:description',
      pageSEO.description || DEFAULT_DESCRIPTION
    );

    updateMeta(
      'name',
      'twitter:image',
      `${SITE_URL}/og-image.jpg`
    );

  }, [location.pathname]);

  return null;
}

// ==========================================
// NOT FOUND PAGE
// ==========================================

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

// ==========================================
// MAIN APPLICATION
// ==========================================

export default function App() {
  return (
    <div className="app">

      <SEO />

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
          <Route
            path="/services"
            element={<Services />}
          />

          <Route
            path="/services/sectors"
            element={<Services />}
          />

          <Route
            path="/services/core-services"
            element={<Services />}
          />

          {/* Portfolio */}
          <Route
            path="/portfolio"
            element={<Portfolio />}
          />

          {/* Corporate Social Responsibility */}
          <Route
            path="/csr"
            element={<CSR />}
          />

          {/* Contact */}
          <Route
            path="/contact"
            element={<Contact />}
          />

          {/* Unknown URLs */}
          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </main>

      <Footer />

    </div>
  );
}
