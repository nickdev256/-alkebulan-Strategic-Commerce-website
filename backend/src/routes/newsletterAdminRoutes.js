
import express from 'express';

import {
  requireAdmin,
  requireAdminOrOwner,
} from '../middleware/requireAdmin.js';

import {
  getNewsletterSubscribers,
  unsubscribeSubscriber,
  getNewsletterCampaigns,
  getNewsletterCampaign,
  createNewsletterCampaign,
  updateNewsletterCampaign,
  deleteNewsletterCampaign,
  publishNewsletterCampaign,
  sendNewsletterCampaign,
  sendTestNewsletterCampaign,
} from '../controllers/newsletterCampaignController.js';

const router = express.Router();

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

// Every route in this router requires an approved administrator.
router.use(requireAdmin);

// ==========================================
// NEWSLETTER SUBSCRIBERS
// ==========================================

// GET /api/newsletter/admin/subscribers
router.get('/subscribers', getNewsletterSubscribers);

// PATCH /api/newsletter/admin/subscribers/:id/unsubscribe
router.patch(
  '/subscribers/:id/unsubscribe',
  requireAdminOrOwner,
  unsubscribeSubscriber
);

// ==========================================
// NEWSLETTER CAMPAIGNS
// ==========================================

// GET /api/newsletter/admin/campaigns
router.get('/campaigns', getNewsletterCampaigns);

// GET /api/newsletter/admin/campaigns/:id
router.get('/campaigns/:id', getNewsletterCampaign);

// POST /api/newsletter/admin/campaigns
router.post('/campaigns', createNewsletterCampaign);

// PUT /api/newsletter/admin/campaigns/:id
router.put('/campaigns/:id', updateNewsletterCampaign);

// POST /api/newsletter/admin/campaigns/:id/publish
router.post(
  '/campaigns/:id/publish',
  publishNewsletterCampaign
);

// DELETE /api/newsletter/admin/campaigns/:id
router.delete(
  '/campaigns/:id',
  deleteNewsletterCampaign
);

// ==========================================
// CAMPAIGN EMAIL DELIVERY
// ==========================================

// POST /api/newsletter/admin/campaigns/:id/test
router.post(
  '/campaigns/:id/test',
  sendTestNewsletterCampaign
);

// POST /api/newsletter/admin/campaigns/:id/send
router.post(
  '/campaigns/:id/send',
  requireAdminOrOwner,
  sendNewsletterCampaign
);

export default router;
