
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import contactRoutes from './routes/contactRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed frontend domains
const allowedOrigins = [
  'https://www.alkebulan-global.com',
  'https://alkebulan-global.com',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(helmet());

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error('Blocked CORS origin:', origin);

    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10kb' }));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
}));

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Alkebulan Global API is running.',
  });
});

// API routes
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found.',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);

  if (err.message.startsWith('Origin not allowed by CORS:')) {
    return res.status(403).json({
      success: false,
      message: 'This website is not authorised to access the API.',
    });
  }

  res.status(500).json({
    success: false,
    message: 'An internal server error occurred.',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Alkebulan Global API is running on port ${PORT}`);
});
