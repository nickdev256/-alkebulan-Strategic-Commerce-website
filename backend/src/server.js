
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// ==========================================
// ROUTE IMPORTS
// ==========================================

import contactRoutes from './routes/contactRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import newsletterAdminRoutes from './routes/newsletterAdminRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// ==========================================
// APP CONFIGURATION
// ==========================================

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// ==========================================
// TRUST PROXY
// ==========================================

if (isProduction) {
  app.set('trust proxy', 1);
}

// ==========================================
// SECURITY HEADERS
// ==========================================

app.use(helmet());

// ==========================================
// CORS CONFIGURATION
// ==========================================

const normalizeOrigin = (origin) => {
  if (!origin) return null;

  return origin.trim().replace(/\/+$/, '');
};

const allowedOrigins = [
  'https://www.alkebulan-global.com',
  'https://alkebulan-global.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.FRONTEND_URL || '').split(','),
  ...(process.env.FRONTEND_URLS || '').split(','),
]
  .map(normalizeOrigin)
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header.
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = normalizeOrigin(origin);

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error('Blocked CORS origin:', origin);

      return callback(
        new Error(`Origin not allowed by CORS: ${origin}`)
      );
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],

    optionsSuccessStatus: 204,
  })
);

// ==========================================
// REQUEST PARSING
// ==========================================

// Campaigns may contain HTML, images and multiple sections.
app.use(
  express.json({
    limit: '5mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '5mb',
  })
);

// ==========================================
// GLOBAL API RATE LIMITING
// ==========================================

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

app.use('/api', globalLimiter);

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Alkebulan Global API is running.',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// CONTACT ROUTES
// ==========================================

app.use(
  '/api/contact',
  contactRoutes
);

// ==========================================
// PROTECTED NEWSLETTER ADMIN ROUTES
// ==========================================

// Authentication is enforced inside newsletterAdminRoutes.js.
//
// GET    /api/newsletter/admin/subscribers
// PATCH  /api/newsletter/admin/subscribers/:id/unsubscribe
// GET    /api/newsletter/admin/campaigns
// GET    /api/newsletter/admin/campaigns/:id
// POST   /api/newsletter/admin/campaigns
// PUT    /api/newsletter/admin/campaigns/:id
// POST   /api/newsletter/admin/campaigns/:id/publish
// DELETE /api/newsletter/admin/campaigns/:id
// POST   /api/newsletter/admin/campaigns/:id/test
// POST   /api/newsletter/admin/campaigns/:id/send

app.use(
  '/api/newsletter/admin',
  newsletterAdminRoutes
);

// ==========================================
// PUBLIC NEWSLETTER ROUTES
// ==========================================

// POST /api/newsletter
// GET  /api/newsletter/unsubscribe
// POST /api/newsletter/unsubscribe
//
// The subscription-specific rate limiter is already
// applied inside newsletterRoutes.js.

app.use(
  '/api/newsletter',
  newsletterRoutes
);

// ==========================================
// ADMINISTRATOR MANAGEMENT
// ==========================================

app.use(
  '/api/admin',
  adminRoutes
);

// ==========================================
// UNKNOWN API ROUTES
// ==========================================

app.use('/api', (req, res) => {
  return res.status(404).json({
    success: false,
    message: 'API endpoint not found.',
    path: req.originalUrl,
    method: req.method,
  });
});

// ==========================================
// CENTRAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error('Server error:', {
    message: err.message,
    path: req.originalUrl,
    method: req.method,
  });

  if (err.message?.startsWith('Origin not allowed by CORS:')) {
    return res.status(403).json({
      success: false,
      message: 'This website is not authorised to access the API.',
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'The submitted request is too large.',
    });
  }

  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    'body' in err
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON request body.',
    });
  }

  return res.status(500).json({
    success: false,
    message: 'An internal server error occurred.',
  });
});

// ==========================================
// START SERVER
// ==========================================

const server = app.listen(PORT, () => {
  console.log('==========================================');
  console.log('ALK E B U L A N GLOBAL API');
  console.log('==========================================');
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log('Contact routes: registered');
  console.log('Newsletter admin routes: registered');
  console.log('Public newsletter routes: registered');
  console.log('Administrator routes: registered');
  console.log('==========================================');
});

// ==========================================
// SERVER ERROR HANDLING
// ==========================================

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
  } else {
    console.error('Server startup error:', error);
  }

  process.exit(1);
});

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

const shutdown = (signal) => {
  console.log(`${signal} received. Closing server...`);

  server.close(() => {
    console.log('Server closed successfully.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced server shutdown.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
