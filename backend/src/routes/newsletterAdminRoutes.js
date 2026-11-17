
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

// Every route requires an approved administrator.
router.use(requireAdmin);

// ==========================================
// NEWSLETTER SUBSCRIBERS
// ==========================================

router.get('/subscribers', getNewsletterSubscribers);

router.patch(
  '/subscribers/:id/unsubscribe',
  requireAdminOrOwner,
  unsubscribeSubscriber
);

// ==========================================
// NEWSLETTER CAMPAIGNS
// ==========================================

router.get('/campaigns', getNewsletterCampaigns);

router.get('/campaigns/:id', getNewsletterCampaign);

router.post('/campaigns', createNewsletterCampaign);

router.put('/campaigns/:id', updateNewsletterCampaign);

router.post(
  '/campaigns/:id/publish',
  publishNewsletterCampaign
);

router.delete('/campaigns/:id', deleteNewsletterCampaign);

// ==========================================
// CAMPAIGN EMAIL DELIVERY
// ==========================================

router.post(
  '/campaigns/:id/test',
  sendTestNewsletterCampaign
);

router.post(
  '/campaigns/:id/send',
  requireAdminOrOwner,
  sendNewsletterCampaign
);

export default router;
