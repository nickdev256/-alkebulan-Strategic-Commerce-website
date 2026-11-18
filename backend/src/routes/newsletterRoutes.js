import express from 'express';
import rateLimit from 'express-rate-limit';

import {
  subscribeToNewsletter,
  showUnsubscribePage,
  unsubscribeFromNewsletter,
  getNewsletterSubscribers,
  unsubscribeSubscriber,
  getNewsletterCampaigns,
  getNewsletterCampaign,
  createNewsletterCampaign,
  updateNewsletterCampaign,
  publishNewsletterCampaign,
  resumeNewsletterCampaign,
  sendNewsletterCampaign,
  sendTestNewsletterCampaign,
  deleteNewsletterCampaign,
  previewNewsletterCampaign,
  uploadNewsletterImage,
} from '../controllers/newsletterController.js';

import { requireAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

// ==========================================
// PUBLIC RATE LIMITS
// ==========================================

const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many subscription attempts. Please try again later.',
  },
});

// Generous on purpose: Gmail/Yahoo one-click unsubscribes for many people
// arrive from the same few mail-server IPs. Every request still needs a
// valid signed token.
const unsubscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

// ==========================================
// PUBLIC NEWSLETTER ROUTES
// ==========================================
// JSON and urlencoded bodies are already parsed globally in server.js.

// Subscribe (both paths accepted so older frontends keep working)
router.post('/subscribe', subscribeLimiter, subscribeToNewsletter);
router.post('/', subscribeLimiter, subscribeToNewsletter);

// Unsubscribe confirmation page and confirmation / one-click POST
router.get('/unsubscribe', unsubscribeLimiter, showUnsubscribePage);
router.post('/unsubscribe', unsubscribeLimiter, unsubscribeFromNewsletter);

// ==========================================
// ADMIN ROUTES (approved administrators only)
// ==========================================

router.use('/admin', requireAdmin);

// Subscribers
router.get('/admin/subscribers', getNewsletterSubscribers);
router.post('/admin/subscribers/:id/unsubscribe', unsubscribeSubscriber);
router.patch('/admin/subscribers/:id/unsubscribe', unsubscribeSubscriber);

// Campaigns
router.get('/admin/campaigns', getNewsletterCampaigns);
router.get('/admin/campaigns/:id', getNewsletterCampaign);
router.post('/admin/campaigns', createNewsletterCampaign);
// Must stay above the "/admin/campaigns/:id" routes.
router.post('/admin/campaigns/preview', previewNewsletterCampaign);

// Images for campaigns (stored in Supabase Storage)
router.post('/admin/uploads/images', uploadNewsletterImage);
router.patch('/admin/campaigns/:id', updateNewsletterCampaign);
router.put('/admin/campaigns/:id', updateNewsletterCampaign);
router.post('/admin/campaigns/:id/publish', publishNewsletterCampaign);
router.post('/admin/campaigns/:id/send', sendNewsletterCampaign);
router.post('/admin/campaigns/:id/resume', resumeNewsletterCampaign);
router.post('/admin/campaigns/:id/test', sendTestNewsletterCampaign);
router.delete('/admin/campaigns/:id', deleteNewsletterCampaign);

export default router;