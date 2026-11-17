
import { supabase } from '../config/supabase.js';
import { sendCampaignEmail } from '../services/emailService.js';
import { buildCampaignEmail } from '../services/newsletterTemplate.js';
import {
  buildUnsubscribeUrl,
  getPublicApiUrl,
} from '../services/unsubscribeToken.js';

// Website sign-ups use "subscribed". Older records may use "active".
const SENDABLE_STATUSES = ['subscribed', 'active'];
const SEND_DELAY_MS = 600;
const SUBSCRIBER_PAGE_SIZE = 1000;
const TRACKING_INTERVAL = 10;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getAdminId = (req) => req.admin?.id || req.user?.id || null;

const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

const hasSendableContent = (campaign) =>
  Boolean(
    campaign?.content?.trim() ||
      (Array.isArray(campaign?.images) && campaign.images.length > 0) ||
      (Array.isArray(campaign?.sections) &&
        campaign.sections.some(
          (section) =>
            section?.title?.trim() ||
            section?.content?.trim() ||
            section?.html?.trim()
        ))
  );

const validateCampaignInput = (body, { partial = false } = {}) => {
  const errors = [];

  if (!partial || Object.hasOwn(body, 'name')) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      errors.push('Campaign name is required.');
    }
  }

  if (!partial || Object.hasOwn(body, 'subject')) {
    if (typeof body.subject !== 'string' || !body.subject.trim()) {
      errors.push('Email subject is required.');
    }
  }

  if (!partial || Object.hasOwn(body, 'content')) {
    if (typeof body.content !== 'string') {
      errors.push('Campaign content must be text.');
    }
  }

  if (Object.hasOwn(body, 'images') && !Array.isArray(body.images)) {
    errors.push('Campaign images must be an array.');
  }

  if (Object.hasOwn(body, 'sections') && !Array.isArray(body.sections)) {
    errors.push('Campaign sections must be an array.');
  }

  if (
    Object.hasOwn(body, 'preview_text') &&
    typeof body.preview_text !== 'string'
  ) {
    errors.push('Preview text must be text.');
  }

  return errors;
};

const getCampaignById = async (id) => {
  const { data, error } = await supabase
    .from('newsletter_campaigns')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Load subscribers in pages to avoid Supabase's default response limit.
const getAllSendableSubscribers = async () => {
  const allSubscribers = [];
  let from = 0;

  while (true) {
    const to = from + SUBSCRIBER_PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('id, email')
      .in('status', SENDABLE_STATUSES)
      .order('created_at', { ascending: true })
      .range(from, to);

    if (error) throw error;

    const page = data || [];
    allSubscribers.push(...page);

    if (page.length < SUBSCRIBER_PAGE_SIZE) break;
    from += SUBSCRIBER_PAGE_SIZE;
  }

  return allSubscribers;
};

// Check email configuration before sending.
const assertSendingConfigured = () => {
  const missing = [
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'PUBLIC_API_URL',
    'NEWSLETTER_UNSUBSCRIBE_SECRET',
  ].filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(
      `Newsletter sending is not configured. Missing: ${missing.join(', ')}.`
    );
  }

  getPublicApiUrl();
  buildUnsubscribeUrl('configuration-check');
};

// Update campaign tracking information.
const updateCampaignTracking = async (id, fields) => {
  const update = {
    ...fields,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('newsletter_campaigns')
    .update(update)
    .eq('id', id);

  if (!error) return true;

  console.error('Campaign tracking update failed:', error);

  // Fall back to updating status if an optional tracking column is missing.
  if (fields.status) {
    const { error: statusError } = await supabase
      .from('newsletter_campaigns')
      .update({
        status: fields.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (statusError) {
      console.error('Campaign status fallback failed:', statusError);
      return false;
    }
  }

  return false;
};

// ==========================================
// SUBSCRIBER MANAGEMENT
// ==========================================

// GET /api/newsletter/admin/subscribers
export const getNewsletterSubscribers = async (req, res) => {
  try {
    const { data, error, count } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({
      success: true,
      subscribers: data || [],
      total: count ?? (data || []).length,
    });
  } catch (error) {
    console.error('Get newsletter subscribers error:', error);
    return sendError(res, 500, 'Failed to retrieve newsletter subscribers.');
  }
};

// PATCH /api/newsletter/admin/subscribers/:id/unsubscribe
export const unsubscribeSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendError(res, 400, 'A subscriber ID is required.');
    }

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return sendError(res, 404, 'Subscriber not found.');

    return res.json({ success: true, subscriber: data });
  } catch (error) {
    console.error('Unsubscribe newsletter subscriber error:', error);
    return sendError(res, 500, 'Failed to unsubscribe this subscriber.');
  }
};

// ==========================================
// CAMPAIGN CRUD
// ==========================================

// GET /api/newsletter/admin/campaigns
export const getNewsletterCampaigns = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('newsletter_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, campaigns: data || [] });
  } catch (error) {
    console.error('Get newsletter campaigns error:', error);
    return sendError(res, 500, 'Failed to retrieve newsletter campaigns.');
  }
};

// GET /api/newsletter/admin/campaigns/:id
export const getNewsletterCampaign = async (req, res) => {
  try {
    const campaign = await getCampaignById(req.params.id);

    if (!campaign) return sendError(res, 404, 'Campaign not found.');

    return res.json({ success: true, campaign });
  } catch (error) {
    console.error('Get newsletter campaign error:', error);
    return sendError(res, 500, 'Failed to retrieve this campaign.');
  }
};

// POST /api/newsletter/admin/campaigns
export const createNewsletterCampaign = async (req, res) => {
  try {
    const body = req.body || {};
    const validationErrors = validateCampaignInput(body);

    if (validationErrors.length) {
      return sendError(res, 400, validationErrors.join(' '));
    }

    const payload = {
      name: body.name.trim(),
      subject: body.subject.trim(),
      preview_text: body.preview_text?.trim() || '',
      content: body.content,
      images: body.images || [],
      sections: body.sections || [],
      status: 'draft',
      created_by: getAdminId(req),
    };

    const { data, error } = await supabase
      .from('newsletter_campaigns')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, campaign: data });
  } catch (error) {
    console.error('Create newsletter campaign error:', error);
    return sendError(res, 500, 'Failed to create the newsletter campaign.');
  }
};

// PUT /api/newsletter/admin/campaigns/:id
// Only draft campaigns can be edited.
export const updateNewsletterCampaign = async (req, res) => {
  try {
    const body = req.body || {};
    const validationErrors = validateCampaignInput(body, { partial: true });

    if (validationErrors.length) {
      return sendError(res, 400, validationErrors.join(' '));
    }

    const allowedFields = [
      'name',
      'subject',
      'preview_text',
      'content',
      'images',
      'sections',
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.hasOwn(body, field)) {
        updates[field] =
          typeof body[field] === 'string' &&
          ['name', 'subject', 'preview_text'].includes(field)
            ? body[field].trim()
            : body[field];
      }
    }

    if (!Object.keys(updates).length) {
      return sendError(res, 400, 'There are no campaign changes to save.');
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('newsletter_campaigns')
      .update(updates)
      .eq('id', req.params.id)
      .eq('status', 'draft')
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const existing = await getCampaignById(req.params.id);

      if (!existing) return sendError(res, 404, 'Campaign not found.');

      return sendError(res, 409, 'Only draft campaigns can be edited.');
    }

    return res.json({ success: true, campaign: data });
  } catch (error) {
    console.error('Update newsletter campaign error:', error);
    return sendError(res, 500, 'Failed to update the newsletter campaign.');
  }
};

// POST /api/newsletter/admin/campaigns/:id/publish
// Publishing does not send the email. It remains a draft for delivery.
export const publishNewsletterCampaign = async (req, res) => {
  try {
    const campaign = await getCampaignById(req.params.id);

    if (!campaign) return sendError(res, 404, 'Campaign not found.');

    if (!campaign.subject?.trim() || !hasSendableContent(campaign)) {
      return sendError(
        res,
        400,
        'Add an email subject and campaign content before publishing.'
      );
    }

    if (campaign.status !== 'draft') {
      return sendError(res, 409, 'Only draft campaigns can be published.');
    }

    if (campaign.is_published) {
      return res.json({
        success: true,
        message: 'This campaign is already published.',
        campaign,
      });
    }

    const publishedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('newsletter_campaigns')
      .update({
        is_published: true,
        published_at: publishedAt,
        published_by: getAdminId(req),
        updated_at: publishedAt,
      })
      .eq('id', req.params.id)
      .eq('status', 'draft')
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return sendError(
        res,
        409,
        'The campaign changed while it was being published. Refresh and try again.'
      );
    }

    return res.json({
      success: true,
      message: 'Campaign published successfully.',
      campaign: data,
    });
  } catch (error) {
    console.error('Publish newsletter campaign error:', error);

    if (
      error?.code === '42703' ||
      /is_published|published_at|published_by/i.test(error?.message || '')
    ) {
      return sendError(
        res,
        500,
        'Publishing fields are missing from newsletter_campaigns. Apply the newsletter publishing SQL migration, then try again.'
      );
    }

    return sendError(res, 500, 'Failed to publish the newsletter campaign.');
  }
};

// DELETE /api/newsletter/admin/campaigns/:id
// Only draft campaigns can be deleted.
export const deleteNewsletterCampaign = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('newsletter_campaigns')
      .delete()
      .eq('id', req.params.id)
      .eq('status', 'draft')
      .select('id')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const existing = await getCampaignById(req.params.id);

      if (!existing) return sendError(res, 404, 'Campaign not found.');

      return sendError(res, 409, 'Only draft campaigns can be deleted.');
    }

    return res.json({
      success: true,
      message: 'Campaign deleted successfully.',
    });
  } catch (error) {
    console.error('Delete newsletter campaign error:', error);
    return sendError(res, 500, 'Failed to delete the newsletter campaign.');
  }
};

// ==========================================
// CAMPAIGN DELIVERY
// ==========================================

const deliverCampaign = async (campaign, subscribers) => {
  let sentCount = 0;
  let failedCount = 0;
  let lastError = null;

  for (const subscriber of subscribers) {
    try {
      if (!subscriber.email) {
        throw new Error('Subscriber has no email address.');
      }

      const unsubscribeUrl = buildUnsubscribeUrl(subscriber.id);
      const email = buildCampaignEmail(campaign, { unsubscribeUrl });

      await sendCampaignEmail({
        to: subscriber.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
        unsubscribeUrl,
      });

      sentCount += 1;
    } catch (error) {
      failedCount += 1;
      lastError = error.message || 'Unknown email delivery error';

      console.error(
        `Campaign ${campaign.id} failed for subscriber ${subscriber.id}:`,
        lastError
      );
    }

    const processedCount = sentCount + failedCount;

    if (processedCount % TRACKING_INTERVAL === 0) {
      await updateCampaignTracking(campaign.id, {
        sent_count: sentCount,
        failed_count: failedCount,
        last_error: lastError,
      });
    }

    if (processedCount < subscribers.length) {
      await sleep(SEND_DELAY_MS);
    }
  }

  const finalStatus =
    sentCount === 0
      ? 'failed'
      : failedCount > 0
        ? 'partially_sent'
        : 'sent';

  await updateCampaignTracking(campaign.id, {
    status: finalStatus,
    sent_at: new Date().toISOString(),
    sent_count: sentCount,
    failed_count: failedCount,
    last_error: lastError,
  });

  console.log(
    `Campaign ${campaign.id} finished: ${sentCount} sent, ${failedCount} failed.`
  );
};

// ==========================================
// TEST EMAIL
// ==========================================

// POST /api/newsletter/admin/campaigns/:id/test
export const sendTestNewsletterCampaign = async (req, res) => {
  try {
    assertSendingConfigured();

    const campaign = await getCampaignById(req.params.id);

    if (!campaign) return sendError(res, 404, 'Campaign not found.');

    if (!campaign.subject?.trim() || !hasSendableContent(campaign)) {
      return sendError(
        res,
        400,
        'Add a subject and some content before sending a test.'
      );
    }

    const recipient = req.admin?.email || req.user?.email;

    if (!recipient) {
      return sendError(
        res,
        400,
        'Your administrator account has no email address.'
      );
    }

    const unsubscribeUrl = buildUnsubscribeUrl('test');
    const email = buildCampaignEmail(campaign, { unsubscribeUrl });

    await sendCampaignEmail({
      to: recipient,
      subject: `[Test] ${email.subject}`,
      html: email.html,
      text: email.text,
      unsubscribeUrl,
    });

    return res.json({
      success: true,
      message: `Test email sent to ${recipient}.`,
    });
  } catch (error) {
    console.error('Test newsletter campaign error:', error);

    return sendError(
      res,
      500,
      error.message || 'Failed to send the test email.'
    );
  }
};

// ==========================================
// SEND CAMPAIGN TO SUBSCRIBERS
// ==========================================

// POST /api/newsletter/admin/campaigns/:id/send
export const sendNewsletterCampaign = async (req, res) => {
  try {
    assertSendingConfigured();
  } catch (error) {
    return sendError(res, 500, error.message);
  }

  const campaignId = req.params.id;

  try {
    const draft = await getCampaignById(campaignId);

    if (!draft) return sendError(res, 404, 'Campaign not found.');

    if (draft.status !== 'draft') {
      return sendError(
        res,
        409,
        `This campaign cannot be sent because its status is "${draft.status}".`
      );
    }

    if (!draft.subject?.trim() || !hasSendableContent(draft)) {
      return sendError(
        res,
        400,
        'Add a subject and some content before sending.'
      );
    }

    const subscribers = await getAllSendableSubscribers();

    if (!subscribers.length) {
      return sendError(res, 400, 'There are no active subscribers to send to.');
    }

    // Only one request can claim the campaign from draft to sending.
    const { data: claimed, error: claimError } = await supabase
      .from('newsletter_campaigns')
      .update({
        status: 'sending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)
      .eq('status', 'draft')
      .select('*')
      .maybeSingle();

    if (claimError) throw claimError;

    if (!claimed) {
      return sendError(
        res,
        409,
        'This campaign is already being sent or is no longer a draft.'
      );
    }

    await updateCampaignTracking(campaignId, {
      recipient_count: subscribers.length,
      sent_count: 0,
      failed_count: 0,
      sent_by: getAdminId(req),
      last_error: null,
    });

    res.status(202).json({
      success: true,
      message: `Sending to ${subscribers.length} subscriber${
        subscribers.length === 1 ? '' : 's'
      }. Delivery is continuing in the background.`,
      recipientCount: subscribers.length,
    });

    deliverCampaign(claimed, subscribers).catch(async (error) => {
      console.error(`Campaign ${campaignId} delivery crashed:`, error);

      await updateCampaignTracking(campaignId, {
        status: 'failed',
        last_error: error.message || 'Campaign delivery crashed.',
      });
    });
  } catch (error) {
    console.error('Send newsletter campaign error:', error);

    if (!res.headersSent) {
      return sendError(
        res,
        500,
        error.message || 'Failed to start sending this campaign.'
      );
    }
  }
};
