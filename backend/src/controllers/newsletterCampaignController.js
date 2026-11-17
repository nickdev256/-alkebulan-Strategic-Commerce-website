
import { supabase } from '../config/supabase.js';
import { sendCampaignEmail } from '../services/emailService.js';
import { buildCampaignEmail } from '../services/newsletterTemplate.js';
import {
  buildUnsubscribeUrl,
  getPublicApiUrl,
} from '../services/unsubscribeToken.js';

// ==========================================
// CONFIGURATION
// ==========================================

const SENDABLE_STATUSES = ['subscribed', 'active'];
const SEND_DELAY_MS = 600;
const SUBSCRIBER_PAGE_SIZE = 1000;
const TRACKING_INTERVAL = 10;

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getAdminId = (req) =>
  req.admin?.id || req.user?.id || null;

const getAdminEmail = (req) =>
  req.admin?.email || req.user?.email || null;

const sendError = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });

// ==========================================
// VALIDATION HELPERS
// ==========================================

const hasSendableContent = (campaign) => {
  const hasText =
    typeof campaign?.content === 'string' &&
    campaign.content.trim().length > 0;

  const hasImages =
    Array.isArray(campaign?.images) &&
    campaign.images.length > 0;

  const hasSections =
    Array.isArray(campaign?.sections) &&
    campaign.sections.some((section) =>
      [
        section?.title,
        section?.content,
        section?.text,
        section?.html,
      ].some(
        (value) =>
          typeof value === 'string' &&
          value.trim().length > 0
      )
    );

  return Boolean(hasText || hasImages || hasSections);
};

const validateCampaignInput = (
  body,
  { partial = false } = {}
) => {
  const errors = [];

  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body)
  ) {
    return ['Invalid campaign information.'];
  }

  if (!partial || Object.hasOwn(body, 'name')) {
    if (
      typeof body.name !== 'string' ||
      !body.name.trim()
    ) {
      errors.push('Campaign name is required.');
    }
  }

  if (!partial || Object.hasOwn(body, 'subject')) {
    if (
      typeof body.subject !== 'string' ||
      !body.subject.trim()
    ) {
      errors.push('Email subject is required.');
    }
  }

  if (!partial || Object.hasOwn(body, 'content')) {
    if (typeof body.content !== 'string') {
      errors.push('Campaign content must be text.');
    }
  }

  if (
    Object.hasOwn(body, 'images') &&
    !Array.isArray(body.images)
  ) {
    errors.push('Campaign images must be an array.');
  }

  if (
    Object.hasOwn(body, 'sections') &&
    !Array.isArray(body.sections)
  ) {
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

// ==========================================
// DATABASE HELPERS
// ==========================================

const getCampaignById = async (id) => {
  const { data, error } = await supabase
    .from('newsletter_campaigns')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;

  return data;
};

// Retrieve all sendable subscribers in batches.

const getAllSendableSubscribers = async () => {
  const allSubscribers = [];
  let from = 0;

  while (true) {
    const to = from + SUBSCRIBER_PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, token_version')
      .in('status', SENDABLE_STATUSES)
      .order('created_at', { ascending: true })
      .range(from, to);

    if (error) throw error;

    const page = data || [];

    allSubscribers.push(...page);

    if (page.length < SUBSCRIBER_PAGE_SIZE) {
      break;
    }

    from += SUBSCRIBER_PAGE_SIZE;
  }

  return allSubscribers;
};

// ==========================================
// EMAIL CONFIGURATION
// ==========================================

const assertSendingConfigured = () => {
  const requiredVariables = [
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'PUBLIC_API_URL',
    'UNSUBSCRIBE_TOKEN_SECRET',
  ];

  const missing = requiredVariables.filter(
    (key) => !process.env[key]?.trim()
  );

  if (missing.length) {
    throw new Error(
      `Newsletter sending is not configured. Missing: ${missing.join(', ')}.`
    );
  }

  getPublicApiUrl();

  if (
    Buffer.byteLength(
      process.env.UNSUBSCRIBE_TOKEN_SECRET.trim(),
      'utf8'
    ) < 32
  ) {
    throw new Error(
      'UNSUBSCRIBE_TOKEN_SECRET must contain at least 32 bytes.'
    );
  }
};

// ==========================================
// CAMPAIGN TRACKING
// ==========================================

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

  console.error(
    'Campaign tracking update failed:',
    error
  );

  if (fields.status) {
    const { error: statusError } = await supabase
      .from('newsletter_campaigns')
      .update({
        status: fields.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (statusError) {
      console.error(
        'Campaign status fallback failed:',
        statusError
      );

      return false;
    }

    return true;
  }

  return false;
};

// ==========================================
// CAMPAIGN EMAIL BUILDER
// ==========================================

const createCampaignEmail = (
  campaign,
  unsubscribeUrl
) => {
  return buildCampaignEmail({
    ...campaign,
    unsubscribeUrl,
  });
};

// ==========================================
// SUBSCRIBER MANAGEMENT
// ==========================================

export const getNewsletterSubscribers = async (
  req,
  res
) => {
  try {
    const subscribers = [];
    let from = 0;
    let total = 0;

    while (true) {
      const to = from + SUBSCRIBER_PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from('newsletter_subscribers')
        .select('*', {
          count: from === 0 ? 'exact' : undefined,
        })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const page = data || [];

      if (from === 0) {
        total = count ?? page.length;
      }

      subscribers.push(...page);

      if (page.length < SUBSCRIBER_PAGE_SIZE) {
        break;
      }

      from += SUBSCRIBER_PAGE_SIZE;
    }

    return res.json({
      success: true,
      subscribers,
      total,
    });
  } catch (error) {
    console.error(
      'Get newsletter subscribers error:',
      error
    );

    return sendError(
      res,
      500,
      'Failed to retrieve newsletter subscribers.'
    );
  }
};

// ==========================================
// ADMIN UNSUBSCRIBE
// ==========================================

export const unsubscribeSubscriber = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendError(
        res,
        400,
        'A subscriber ID is required.'
      );
    }

    const {
      data: subscriber,
      error: lookupError,
    } = await supabase
      .from('newsletter_subscribers')
      .select('id, token_version')
      .eq('id', id)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (!subscriber) {
      return sendError(
        res,
        404,
        'Subscriber not found.'
      );
    }

    const currentVersion = Number(
      subscriber.token_version ?? 0
    );

    const nextTokenVersion = currentVersion + 1;

    const {
      data,
      error,
    } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
        token_version: nextTokenVersion,
      })
      .eq('id', id)
      .eq('token_version', currentVersion)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return sendError(
        res,
        409,
        'The subscriber status changed. Refresh the page and try again.'
      );
    }

    return res.json({
      success: true,
      subscriber: data,
      message: 'Subscriber successfully unsubscribed.',
    });
  } catch (error) {
    console.error(
      'Unsubscribe newsletter subscriber error:',
      error
    );

    return sendError(
      res,
      500,
      'Failed to unsubscribe this subscriber.'
    );
  }
};

// ==========================================
// CAMPAIGN CRUD
// ==========================================

export const getNewsletterCampaigns = async (
  req,
  res
) => {
  try {
    const { data, error } = await supabase
      .from('newsletter_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({
      success: true,
      campaigns: data || [],
    });
  } catch (error) {
    console.error(
      'Get newsletter campaigns error:',
      error
    );

    return sendError(
      res,
      500,
      'Failed to retrieve newsletter campaigns.'
    );
  }
};

export const getNewsletterCampaign = async (
  req,
  res
) => {
  try {
    const campaign = await getCampaignById(
      req.params.id
    );

    if (!campaign) {
      return sendError(
        res,
        404,
        'Campaign not found.'
      );
    }

    return res.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error(
      'Get newsletter campaign error:',
      error
    );

    return sendError(
      res,
      500,
      'Failed to retrieve this campaign.'
    );
  }
};

export const createNewsletterCampaign = async (
  req,
  res
) => {
  try {
    const body = req.body || {};

    const validationErrors = validateCampaignInput(body);

    if (validationErrors.length) {
      return sendError(
        res,
        400,
        validationErrors.join(' ')
      );
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

    return res.status(201).json({
      success: true,
      campaign: data,
    });
  } catch (error) {
    console.error(
      'Create newsletter campaign error:',
      error
    );

    return sendError(
      res,
      500,
      'Failed to create the newsletter campaign.'
    );
  }
};

export const updateNewsletterCampaign = async (
  req,
  res
) => {
  try {
    const body = req.body || {};

    const validationErrors = validateCampaignInput(
      body,
      { partial: true }
    );

    if (validationErrors.length) {
      return sendError(
        res,
        400,
        validationErrors.join(' ')
      );
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
      return sendError(
        res,
        400,
        'There are no campaign changes to save.'
      );
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
      const existing = await getCampaignById(
        req.params.id
      );

      if (!existing) {
        return sendError(
          res,
          404,
          'Campaign not found.'
        );
      }

      return sendError(
        res,
        409,
        'Only draft campaigns can be edited.'
      );
    }

    return res.json({
      success: true,
      campaign: data,
    });
  } catch (error) {
    console.error(
      'Update newsletter campaign error:',
      error
    );

    return sendError(
      res,
      500,
      'Failed to update the newsletter campaign.'
    );
  }
};

// ==========================================
// PUBLISH CAMPAIGN
// ==========================================

export const publishNewsletterCampaign = async (
  req,
  res
) => {
  try {
    const campaign = await getCampaignById(
      req.params.id
    );

    if (!campaign) {
      return sendError(
        res,
        404,
        'Campaign not found.'
      );
    }

    if (
      !campaign.subject?.trim() ||
      !hasSendableContent(campaign)
    ) {
      return sendError(
        res,
        400,
        'Add an email subject and campaign content before publishing.'
      );
    }

    if (campaign.status !== 'draft') {
      return sendError(
        res,
        409,
        'Only draft campaigns can be published.'
      );
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
    console.error(
      'Publish newsletter campaign error:',
      error
    );

    if (
      error?.code === '42703' ||
      /is_published|published_at|published_by/i.test(
        error?.message || ''
      )
    ) {
      return sendError(
        res,
        500,
        'Publishing fields are missing from newsletter_campaigns. Apply the newsletter publishing SQL migration, then try again.'
      );
    }

    return sendError(
      res,
      500,
      'Failed to publish the newsletter campaign.'
    );
  }
};

// ==========================================
// DELETE CAMPAIGN
// ==========================================

export const deleteNewsletterCampaign = async (
  req,
  res
) => {
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
      const existing = await getCampaignById(
        req.params.id
      );

      if (!existing) {
        return sendError(
          res,
          404,
          'Campaign not found.'
        );
      }

      return sendError(
        res,
        409,
        'Only draft campaigns can be deleted.'
      );
    }

    return res.json({
      success: true,
      message: 'Campaign deleted successfully.',
    });
  } catch (error) {
    console.error(
      'Delete newsletter campaign error:',
      error
    );

    return sendError(
      res,
      500,
      'Failed to delete the newsletter campaign.'
    );
  }
};

// ==========================================
// INDIVIDUAL DELIVERY TRACKING
// ==========================================

const createDeliveryRecord = async (
  campaignId,
  subscriber
) => {
  const { data, error } = await supabase
    .from('newsletter_campaign_deliveries')
    .insert({
      campaign_id: campaignId,
      subscriber_id: subscriber.id,
      email: subscriber.email,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) throw error;

  return data;
};

const updateDeliveryRecord = async (
  deliveryId,
  fields
) => {
  const { error } = await supabase
    .from('newsletter_campaign_deliveries')
    .update(fields)
    .eq('id', deliveryId);

  if (error) throw error;
};

// ==========================================
// CAMPAIGN DELIVERY
// ==========================================

const deliverCampaign = async (
  campaign,
  subscribers
) => {
  let sentCount = 0;
  let failedCount = 0;
  let lastError = null;

  for (const subscriber of subscribers) {
    let deliveryId = null;
    let resendAccepted = false;

    try {
      if (!subscriber.id || !subscriber.email) {
        throw new Error(
          'Subscriber ID or email address is missing.'
        );
      }

      // Create delivery record before sending.

      const delivery = await createDeliveryRecord(
        campaign.id,
        subscriber
      );

      deliveryId = delivery.id;

      // IMPORTANT:
      // The database only permits pending, sent, failed.
      // Do not use "sending" here.

      await updateDeliveryRecord(deliveryId, {
        status: 'pending',
        attempted_at: new Date().toISOString(),
        error_message: null,
      });

      // Build individual unsubscribe link.

      const unsubscribeUrl = buildUnsubscribeUrl(
        subscriber.id,
        subscriber.email,
        subscriber.token_version ?? 0
      );

      // Build campaign email.

      const email = createCampaignEmail(
        campaign,
        unsubscribeUrl
      );

      if (!email?.html || !email?.subject) {
        throw new Error(
          'The campaign template did not return a valid email.'
        );
      }

      // Send through Resend.

      const result = await sendCampaignEmail({
        to: subscriber.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });

      // Resend has accepted the message.

      resendAccepted = true;
      sentCount += 1;

      const resendEmailId =
        result?.id ||
        result?.data?.id ||
        null;

      try {
        await updateDeliveryRecord(deliveryId, {
          status: 'sent',
          resend_email_id: resendEmailId,
          delivered_at: new Date().toISOString(),
          error_message: null,
        });
      } catch (trackingError) {
        // Do not mark an accepted email as failed
        // because its tracking update failed.

        console.error(
          `Email accepted by Resend but delivery tracking failed for ${subscriber.email}:`,
          trackingError
        );

        lastError = trackingError.message;
      }
    } catch (error) {
      lastError =
        error?.message || 'Unknown email delivery error';

      console.error(
        `Campaign ${campaign.id} failed for subscriber ${subscriber.id}:`,
        lastError
      );

      if (!resendAccepted) {
        failedCount += 1;

        if (deliveryId) {
          try {
            await updateDeliveryRecord(deliveryId, {
              status: 'failed',
              error_message: lastError,
            });
          } catch (trackingError) {
            console.error(
              'Failed to update individual delivery record:',
              trackingError
            );
          }
        }
      }
    }

    const processedCount = sentCount + failedCount;

    if (
      processedCount > 0 &&
      processedCount % TRACKING_INTERVAL === 0
    ) {
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
    `Campaign ${campaign.id} finished: ${sentCount} accepted by Resend, ${failedCount} failed.`
  );
};

// ==========================================
// TEST EMAIL
// ==========================================

export const sendTestNewsletterCampaign = async (
  req,
  res
) => {
  try {
    assertSendingConfigured();

    const campaign = await getCampaignById(
      req.params.id
    );

    if (!campaign) {
      return sendError(
        res,
        404,
        'Campaign not found.'
      );
    }

    if (
      !campaign.subject?.trim() ||
      !hasSendableContent(campaign)
    ) {
      return sendError(
        res,
        400,
        'Add a subject and some content before sending a test.'
      );
    }

    const recipient = getAdminEmail(req);

    if (!recipient) {
      return sendError(
        res,
        400,
        'Your administrator account has no email address.'
      );
    }

    const email = createCampaignEmail(campaign, '');

    if (!email?.html || !email?.subject) {
      return sendError(
        res,
        400,
        'The campaign template could not generate a valid email.'
      );
    }

    await sendCampaignEmail({
      to: recipient,
      subject: `[Test] ${email.subject}`,
      html: email.html,
      text: email.text,
    });

    return res.json({
      success: true,
      message: `Test email sent to ${recipient}.`,
    });
  } catch (error) {
    console.error(
      'Test newsletter campaign error:',
      error
    );

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

export const sendNewsletterCampaign = async (
  req,
  res
) => {
  try {
    assertSendingConfigured();
  } catch (error) {
    return sendError(res, 500, error.message);
  }

  const campaignId = req.params.id;

  try {
    const draft = await getCampaignById(campaignId);

    if (!draft) {
      return sendError(
        res,
        404,
        'Campaign not found.'
      );
    }

    if (draft.status !== 'draft') {
      return sendError(
        res,
        409,
        `This campaign cannot be sent because its status is "${draft.status}".`
      );
    }

    if (
      !draft.subject?.trim() ||
      !hasSendableContent(draft)
    ) {
      return sendError(
        res,
        400,
        'Add a subject and some content before sending.'
      );
    }

    if (!draft.is_published) {
      return sendError(
        res,
        409,
        'Publish this campaign before sending it to subscribers.'
      );
    }

    const subscribers = await getAllSendableSubscribers();

    if (!subscribers.length) {
      return sendError(
        res,
        400,
        'There are no active subscribers to send to.'
      );
    }

    // Atomically claim the campaign to prevent duplicate sending.

    const { data: claimed, error: claimError } = await supabase
      .from('newsletter_campaigns')
      .update({
        status: 'sending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)
      .eq('status', 'draft')
      .eq('is_published', true)
      .select('*')
      .maybeSingle();

    if (claimError) throw claimError;

    if (!claimed) {
      return sendError(
        res,
        409,
        'This campaign is already being sent or is no longer available for delivery.'
      );
    }

    const trackingInitialized = await updateCampaignTracking(
      campaignId,
      {
        recipient_count: subscribers.length,
        sent_count: 0,
        failed_count: 0,
        sent_by: getAdminId(req),
        last_error: null,
      }
    );

    if (!trackingInitialized) {
      await updateCampaignTracking(campaignId, {
        status: 'failed',
        last_error:
          'Campaign tracking could not be initialized.',
      });

      return sendError(
        res,
        500,
        'Campaign tracking could not be initialized. No emails were sent.'
      );
    }

    // Respond before starting background delivery.

    res.status(202).json({
      success: true,
      message: `Sending to ${subscribers.length} subscriber${
        subscribers.length === 1 ? '' : 's'
      }. Delivery is continuing in the background.`,
      recipientCount: subscribers.length,
    });

    // Start campaign delivery.

    deliverCampaign(claimed, subscribers).catch(
      async (error) => {
        console.error(
          `Campaign ${campaignId} delivery crashed:`,
          error
        );

        try {
          await updateCampaignTracking(campaignId, {
            status: 'failed',
            last_error:
              error?.message || 'Campaign delivery crashed.',
          });
        } catch (trackingError) {
          console.error(
            'Could not record campaign delivery failure:',
            trackingError
          );
        }
      }
    );
  } catch (error) {
    console.error(
      'Send newsletter campaign error:',
      error
    );

    if (!res.headersSent) {
      return sendError(
        res,
        500,
        error.message ||
          'Failed to start sending this campaign.'
      );
    }
  }
};
