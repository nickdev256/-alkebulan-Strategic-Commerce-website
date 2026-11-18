import { supabase } from '../config/supabase.js';
import {
  sendCampaignEmail,
  sendNewsletterWelcomeEmail,
} from '../services/emailService.js';
import { buildCampaignEmail } from '../services/newsletterTemplate.js';
import {
  buildUnsubscribeUrl,
  getPublicApiUrl,
  verifyUnsubscribeToken,
} from '../services/unsubscribeToken.js';

const SENDABLE_STATUSES = ['subscribed', 'active'];
const PAGE_SIZE = 1000;
const SEND_DELAY_MS = 600;

// A campaign stuck in "sending" with no progress for this long is treated as
// abandoned (for example, the server restarted mid-send) and can be resumed.
export const STALE_SENDING_MS = 10 * 60 * 1000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ==========================================
// GENERAL HELPERS
// ==========================================

const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

const adminId = (req) => req.admin?.id || req.user?.id || null;

const adminEmail = (req) => req.admin?.email || req.user?.email || null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const plainText = (value = '') =>
  String(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isStaleSending = (campaign) =>
  campaign?.status === 'sending' &&
  (!campaign.updated_at ||
    Date.now() - new Date(campaign.updated_at).getTime() > STALE_SENDING_MS);

const isResumable = (campaign) =>
  Boolean(campaign?.is_published) &&
  (campaign.status === 'failed' || isStaleSending(campaign));

// ==========================================
// HTML RESPONSE
// ==========================================

const htmlResponse = (res, status, title, message, form = '') =>
  res
    .status(status)
    .type('html')
    .send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)}</title>
<style>
body {
  font-family: Arial, sans-serif;
  background: #f5f6f8;
  color: #18212f;
  display: grid;
  min-height: 100vh;
  place-items: center;
  margin: 0;
  padding: 24px;
  box-sizing: border-box;
}
.card {
  max-width: 520px;
  background: #fff;
  padding: 36px;
  border-radius: 16px;
  box-shadow: 0 8px 32px #10182814;
  text-align: center;
}
h1 { font-size: 24px; }
p { line-height: 1.6; color: #526071; }
button {
  border: 0;
  border-radius: 8px;
  padding: 13px 22px;
  background: #142b45;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}
</style>
</head>
<body>
<main class="card">
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(message)}</p>
${form}
</main>
</body>
</html>`);

// ==========================================
// PUBLIC NEWSLETTER SUBSCRIPTION
// ==========================================

// Welcome + admin-notification emails are sent after the response so a
// Resend outage never makes the subscription itself fail.
const sendWelcomeInBackground = (email) => {
  sendNewsletterWelcomeEmail(email).catch((error) => {
    console.error('Newsletter welcome emails failed:', error?.message || error);
  });
};

export const subscribeToNewsletter = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
      return sendError(res, 400, 'Please provide a valid email address.');
    }

    const { data: existing, error: lookupError } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, status, token_version')
      .eq('email', email)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (existing && SENDABLE_STATUSES.includes(existing.status)) {
      return res.status(200).json({
        success: true,
        alreadySubscribed: true,
        message: 'This email is already subscribed.',
      });
    }

    // Reactivate an existing unsubscribed record. Bumping token_version
    // invalidates any unsubscribe links issued before.
    if (existing) {
      const version = Number(existing.token_version ?? 0);

      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .update({
          status: 'subscribed',
          token_version: version + 1,
          unsubscribed_at: null,
        })
        .eq('id', existing.id)
        .eq('token_version', version)
        .select('id')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return sendError(
          res,
          409,
          'Your subscription status changed. Please try again.'
        );
      }

      res.status(200).json({
        success: true,
        message: 'You have successfully subscribed to our newsletter.',
      });

      sendWelcomeInBackground(email);
      return undefined;
    }

    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, status: 'subscribed', token_version: 0 });

    if (insertError) {
      // Unique violation: another request inserted the same email first.
      if (insertError.code === '23505') {
        const { data: duplicate, error: duplicateError } = await supabase
          .from('newsletter_subscribers')
          .select('status')
          .eq('email', email)
          .maybeSingle();

        if (duplicateError) throw duplicateError;

        if (duplicate && SENDABLE_STATUSES.includes(duplicate.status)) {
          return res.status(200).json({
            success: true,
            alreadySubscribed: true,
            message: 'This email is already subscribed.',
          });
        }

        return sendError(
          res,
          409,
          'Your subscription status changed. Please try again.'
        );
      }

      throw insertError;
    }

    res.status(201).json({
      success: true,
      message: 'You have successfully subscribed to our newsletter.',
    });

    sendWelcomeInBackground(email);
    return undefined;
  } catch (error) {
    console.error('Public newsletter subscription error:', error);
    if (res.headersSent) return undefined;
    return sendError(
      res,
      500,
      'We could not process your subscription. Please try again later.'
    );
  }
};

// ==========================================
// UNSUBSCRIBE TOKEN
// ==========================================

const getValidUnsubscribeSubscriber = async (token) => {
  const payload = verifyUnsubscribeToken(token);

  if (!payload?.id || !payload?.email) {
    return { invalid: true };
  }

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, status, token_version')
    .eq('id', payload.id)
    .eq('email', payload.email)
    .maybeSingle();

  if (error) throw error;

  if (
    !data ||
    Number(data.token_version ?? 0) !== Number(payload.version ?? 0)
  ) {
    return { invalid: true };
  }

  return { subscriber: data };
};

// ==========================================
// DISPLAY UNSUBSCRIBE PAGE (GET)
// ==========================================

// GET only shows a confirmation button so that email link scanners which
// prefetch URLs cannot unsubscribe people by accident.
export const showUnsubscribePage = async (req, res) => {
  try {
    const token = String(req.query?.token || '');

    if (!token) {
      return htmlResponse(
        res,
        400,
        'Invalid unsubscribe link',
        'This unsubscribe link is missing or invalid.'
      );
    }

    const result = await getValidUnsubscribeSubscriber(token);

    if (result.invalid) {
      return htmlResponse(
        res,
        400,
        'Invalid or expired link',
        'This unsubscribe link is invalid or has expired.'
      );
    }

    if (!SENDABLE_STATUSES.includes(result.subscriber.status)) {
      return htmlResponse(
        res,
        200,
        'Already unsubscribed',
        'This email address is already unsubscribed.'
      );
    }

    // No "action" attribute: the form posts back to this exact URL, so it keeps
    // working behind proxies or path prefixes.
    const form = `
<form method="post">
  <input type="hidden" name="token" value="${escapeHtml(token)}">
  <button type="submit">Confirm unsubscribe</button>
</form>`;

    return htmlResponse(
      res,
      200,
      'Unsubscribe from our newsletter',
      'Click below to stop receiving newsletter emails.',
      form
    );
  } catch (error) {
    console.error('Show unsubscribe page error:', error);
    return htmlResponse(
      res,
      500,
      'Something went wrong',
      'We could not verify this unsubscribe link. Please try again later.'
    );
  }
};

// ==========================================
// PROCESS PUBLIC UNSUBSCRIBE (POST)
// ==========================================

// Also serves RFC 8058 one-click unsubscribe (mail clients POST to the link,
// token in the query string).
export const unsubscribeFromNewsletter = async (req, res) => {
  try {
    const token = String(req.body?.token || req.query?.token || '');

    if (!token) {
      return htmlResponse(
        res,
        400,
        'Invalid unsubscribe link',
        'This unsubscribe link is missing or invalid.'
      );
    }

    const result = await getValidUnsubscribeSubscriber(token);

    if (result.invalid) {
      return htmlResponse(
        res,
        400,
        'Invalid or expired link',
        'This unsubscribe link is invalid or has expired.'
      );
    }

    const { subscriber } = result;

    if (!SENDABLE_STATUSES.includes(subscriber.status)) {
      return htmlResponse(
        res,
        200,
        'You are unsubscribed',
        'This email address is already unsubscribed.'
      );
    }

    const version = Number(subscriber.token_version ?? 0);

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
        token_version: version + 1,
      })
      .eq('id', subscriber.id)
      .eq('token_version', version)
      .select('id')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return htmlResponse(
        res,
        409,
        'Please try again',
        'Your subscription changed while processing this request. Please reopen the link.'
      );
    }

    return htmlResponse(
      res,
      200,
      'You are unsubscribed',
      'You have successfully unsubscribed and will no longer receive our newsletter.'
    );
  } catch (error) {
    console.error('Public newsletter unsubscribe error:', error);
    return htmlResponse(
      res,
      500,
      'Something went wrong',
      'We could not complete your unsubscribe request. Please try again later.'
    );
  }
};

// ==========================================
// CAMPAIGN VALIDATION
// ==========================================

const hasSendableContent = (campaign) =>
  Boolean(
    (typeof campaign?.content === 'string' && campaign.content.trim()) ||
      (Array.isArray(campaign?.images) && campaign.images.length) ||
      (Array.isArray(campaign?.sections) &&
        campaign.sections.some((section) =>
          [section?.title, section?.content, section?.text, section?.html].some(
            (value) => typeof value === 'string' && value.trim()
          )
        ))
  );

const validateCampaignInput = (body, { partial = false } = {}) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['Invalid campaign information.'];
  }

  const errors = [];
  const has = (field) => Object.prototype.hasOwnProperty.call(body, field);

  if (!partial || has('name')) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      errors.push('Campaign name is required.');
    }
  }

  if (!partial || has('subject')) {
    if (typeof body.subject !== 'string' || !body.subject.trim()) {
      errors.push('Email subject is required.');
    }
  }

  if (!partial || has('content')) {
    if (typeof body.content !== 'string') {
      errors.push('Campaign content must be text.');
    }
  }

  if (has('images') && !Array.isArray(body.images)) {
    errors.push('Campaign images must be an array.');
  }

  if (has('sections') && !Array.isArray(body.sections)) {
    errors.push('Campaign sections must be an array.');
  }

  if (has('preview_text') && typeof body.preview_text !== 'string') {
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

const getAllSendableSubscribers = async () => {
  const subscribers = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, token_version')
      .in('status', SENDABLE_STATUSES)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    subscribers.push(...(data || []));

    if (!data || data.length < PAGE_SIZE) break;
  }

  return subscribers.filter((subscriber) => subscriber.id && subscriber.email);
};

const getCurrentSubscriber = async (id) => {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, status, token_version')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const updateCampaign = async (id, fields) => {
  const { error } = await supabase
    .from('newsletter_campaigns')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
};

// Progress tracking must never abort a send that is otherwise working.
const recordProgress = async (id, fields) => {
  try {
    await updateCampaign(id, fields);
  } catch (error) {
    console.error(
      `Could not update progress for campaign ${id}:`,
      error?.message || error
    );
  }
};

// ==========================================
// EMAIL CONFIGURATION
// ==========================================

const assertSendingConfigured = () => {
  const required = [
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'PUBLIC_API_URL',
    'UNSUBSCRIBE_TOKEN_SECRET',
  ];

  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length) {
    throw new Error(
      `Newsletter sending is not configured. Missing: ${missing.join(', ')}.`
    );
  }

  // Throws if PUBLIC_API_URL is malformed.
  getPublicApiUrl();

  if (Buffer.byteLength(process.env.UNSUBSCRIBE_TOKEN_SECRET.trim(), 'utf8') < 32) {
    throw new Error('UNSUBSCRIBE_TOKEN_SECRET must contain at least 32 bytes.');
  }
};

// ==========================================
// CAMPAIGN EMAIL BUILDER
// ==========================================

const imageUrl = (image) =>
  typeof image === 'string'
    ? image
    : image?.url || image?.src || image?.publicUrl || '';

const createCampaignEmail = (campaign, unsubscribeUrl = '') => {
  let rendered;

  try {
    rendered = buildCampaignEmail({ ...campaign, unsubscribeUrl });
  } catch (error) {
    console.error(
      'Newsletter template failed; using fallback renderer:',
      error?.message
    );
  }

  if (
    rendered &&
    typeof rendered === 'object' &&
    typeof rendered.subject === 'string' &&
    rendered.subject.trim() &&
    typeof rendered.html === 'string' &&
    rendered.html.trim()
  ) {
    return {
      subject: rendered.subject.trim(),
      html: rendered.html,
      text:
        typeof rendered.text === 'string' && rendered.text.trim()
          ? rendered.text
          : plainText(rendered.html),
    };
  }

  // Fallback renderer.
  const sections = Array.isArray(campaign.sections) ? campaign.sections : [];
  const images = Array.isArray(campaign.images) ? campaign.images : [];
  const paragraphStyle = 'font-size:16px;line-height:1.7;white-space:pre-line';

  const sectionHtml = sections
    .map((section) => {
      const title = section?.title
        ? `<h2 style="font-size:20px;margin:24px 0 8px">${escapeHtml(section.title)}</h2>`
        : '';
      const body = section?.content || section?.text || section?.html || '';
      const bodyHtml = body
        ? `<p style="${paragraphStyle}">${escapeHtml(plainText(body))}</p>`
        : '';
      return `${title}${bodyHtml}`;
    })
    .join('');

  const imageHtml = images
    .map((image) => {
      const url = imageUrl(image);
      if (!url || !/^https:\/\//i.test(url)) return '';
      const alt = typeof image === 'object' && image ? image.alt || '' : '';
      return `<p style="margin:20px 0"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" style="display:block;max-width:100%;height:auto;border:0"></p>`;
    })
    .join('');

  const content = campaign.content
    ? `<p style="${paragraphStyle}">${escapeHtml(plainText(campaign.content))}</p>`
    : '';

  const preview = campaign.preview_text
    ? `<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(campaign.preview_text)}</div>`
    : '';

  const unsubscribe = unsubscribeUrl
    ? `<p style="font-size:12px;color:#777;margin-top:32px">You are receiving this email because you subscribed to our newsletter. <a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe</a></p>`
    : '';

  const heading = campaign.title || campaign.name || campaign.subject || '';

  const html = `<!doctype html>
<html>
<body style="margin:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#222">
<div style="max-width:640px;margin:24px auto;background:#fff;padding:32px">
${preview}
<h1 style="font-size:26px;line-height:1.3">${escapeHtml(heading)}</h1>
${content}
${sectionHtml}
${imageHtml}
${unsubscribe}
</div>
</body>
</html>`;

  const text =
    [
      heading,
      campaign.content,
      ...sections.flatMap((section) => [
        section?.title,
        section?.content || section?.text || section?.html,
      ]),
    ]
      .filter(Boolean)
      .map(plainText)
      .join('\n\n') + (unsubscribeUrl ? `\n\nUnsubscribe: ${unsubscribeUrl}` : '');

  return {
    subject: String(campaign.subject || '').trim(),
    html,
    text,
  };
};

// ==========================================
// GET ALL SUBSCRIBERS
// ==========================================

export const getNewsletterSubscribers = async (_req, res) => {
  try {
    const subscribers = [];

    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false })
        .order('id', { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (error) throw error;

      subscribers.push(...(data || []));

      if (!data || data.length < PAGE_SIZE) break;
    }

    return res.json({
      success: true,
      subscribers,
      total: subscribers.length,
    });
  } catch (error) {
    console.error('Get newsletter subscribers error:', error);
    return sendError(res, 500, 'Failed to retrieve newsletter subscribers.');
  }
};

// ==========================================
// ADMIN UNSUBSCRIBE
// ==========================================

export const unsubscribeSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendError(res, 400, 'A subscriber ID is required.');
    }

    const { data: subscriber, error: lookupError } = await supabase
      .from('newsletter_subscribers')
      .select('id, status, token_version')
      .eq('id', id)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (!subscriber) {
      return sendError(res, 404, 'Subscriber not found.');
    }

    if (!SENDABLE_STATUSES.includes(subscriber.status)) {
      return sendError(res, 409, 'This subscriber is already unsubscribed.');
    }

    const version = Number(subscriber.token_version ?? 0);

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
        token_version: version + 1,
      })
      .eq('id', id)
      .eq('token_version', version)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return sendError(
        res,
        409,
        'Subscriber status changed. Refresh and try again.'
      );
    }

    return res.json({
      success: true,
      subscriber: data,
      message: 'Subscriber successfully unsubscribed.',
    });
  } catch (error) {
    console.error('Admin unsubscribe error:', error);
    return sendError(res, 500, 'Failed to unsubscribe this subscriber.');
  }
};

// ==========================================
// GET ALL CAMPAIGNS
// ==========================================

export const getNewsletterCampaigns = async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('newsletter_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, campaigns: data || [] });
  } catch (error) {
    console.error('Get campaigns error:', error);
    return sendError(res, 500, 'Failed to retrieve newsletter campaigns.');
  }
};

// ==========================================
// GET SINGLE CAMPAIGN
// ==========================================

export const getNewsletterCampaign = async (req, res) => {
  try {
    const campaign = await getCampaignById(req.params.id);

    if (!campaign) {
      return sendError(res, 404, 'Campaign not found.');
    }

    return res.json({ success: true, campaign });
  } catch (error) {
    console.error('Get campaign error:', error);
    return sendError(res, 500, 'Failed to retrieve this campaign.');
  }
};

// ==========================================
// CREATE CAMPAIGN
// ==========================================

export const createNewsletterCampaign = async (req, res) => {
  try {
    const body = req.body || {};
    const errors = validateCampaignInput(body);

    if (errors.length) {
      return sendError(res, 400, errors.join(' '));
    }

    const payload = {
      name: body.name.trim(),
      subject: body.subject.trim(),
      preview_text: body.preview_text?.trim() || '',
      content: body.content,
      images: body.images || [],
      sections: body.sections || [],
      status: 'draft',
      is_published: false,
      created_by: adminId(req),
    };

    const { data, error } = await supabase
      .from('newsletter_campaigns')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, campaign: data });
  } catch (error) {
    console.error('Create campaign error:', error);
    return sendError(res, 500, 'Failed to create the newsletter campaign.');
  }
};

// ==========================================
// UPDATE CAMPAIGN
// ==========================================

const EDITABLE_FIELDS = [
  'name',
  'subject',
  'preview_text',
  'content',
  'images',
  'sections',
];
const TRIMMED_FIELDS = ['name', 'subject', 'preview_text'];

export const updateNewsletterCampaign = async (req, res) => {
  try {
    const body = req.body || {};
    const errors = validateCampaignInput(body, { partial: true });

    if (errors.length) {
      return sendError(res, 400, errors.join(' '));
    }

    const updates = {};

    for (const field of EDITABLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] =
          TRIMMED_FIELDS.includes(field) && typeof body[field] === 'string'
            ? body[field].trim()
            : body[field];
      }
    }

    if (!Object.keys(updates).length) {
      return sendError(res, 400, 'There are no campaign changes to save.');
    }

    const { data, error } = await supabase
      .from('newsletter_campaigns')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('status', 'draft')
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const existing = await getCampaignById(req.params.id);

      return existing
        ? sendError(res, 409, 'Only draft campaigns can be edited.')
        : sendError(res, 404, 'Campaign not found.');
    }

    return res.json({ success: true, campaign: data });
  } catch (error) {
    console.error('Update campaign error:', error);
    return sendError(res, 500, 'Failed to update the newsletter campaign.');
  }
};

// ==========================================
// NEWSLETTER DELIVERY WORKER
// ==========================================

// Delivers one campaign email to one subscriber.
// Returns 'sent' | 'already_sent' | 'skipped'; throws on failure.
const deliverToSubscriber = async (campaign, listedSubscriber) => {
  const { data: existing, error: lookupError } = await supabase
    .from('newsletter_campaign_deliveries')
    .select('id, status')
    .eq('campaign_id', campaign.id)
    .eq('subscriber_id', listedSubscriber.id)
    .maybeSingle();

  if (lookupError) throw lookupError;

  // Never resend an email the provider already accepted (makes resume safe).
  if (existing?.status === 'sent') return 'already_sent';

  // Re-read the subscriber: they may have unsubscribed (or re-subscribed with a
  // new token version) since the recipient list was loaded.
  const subscriber = await getCurrentSubscriber(listedSubscriber.id);

  if (!subscriber || !SENDABLE_STATUSES.includes(subscriber.status)) {
    return 'skipped';
  }

  let deliveryId = existing?.id || null;

  try {
    const attemptedAt = new Date().toISOString();

    if (deliveryId) {
      const { error } = await supabase
        .from('newsletter_campaign_deliveries')
        .update({
          email: subscriber.email,
          status: 'pending',
          attempted_at: attemptedAt,
          error_message: null,
        })
        .eq('id', deliveryId);

      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from('newsletter_campaign_deliveries')
        .insert({
          campaign_id: campaign.id,
          subscriber_id: subscriber.id,
          email: subscriber.email,
          status: 'pending',
          attempted_at: attemptedAt,
        })
        .select('id')
        .single();

      // Another worker already claimed this delivery.
      if (error?.code === '23505') return 'skipped';
      if (error) throw error;

      deliveryId = data.id;
    }

    const unsubscribeUrl = buildUnsubscribeUrl(
      subscriber.id,
      subscriber.email,
      subscriber.token_version ?? 0
    );

    const email = createCampaignEmail(campaign, unsubscribeUrl);

    if (!email.subject || !email.html) {
      throw new Error(
        'Newsletter email could not be rendered. Check campaign subject and content.'
      );
    }

    const result = await sendCampaignEmail({
      to: subscriber.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      unsubscribeUrl,
    });

    // The Resend SDK returns { data, error } instead of throwing.
    if (result?.error) {
      throw new Error(
        result.error.message || 'The email provider rejected this message.'
      );
    }

    const { error: markSentError } = await supabase
      .from('newsletter_campaign_deliveries')
      .update({
        status: 'sent',
        resend_email_id: result?.id || result?.data?.id || null,
        delivered_at: new Date().toISOString(),
        error_message: null,
      })
      .eq('id', deliveryId);

    if (markSentError) {
      console.error(
        'Email accepted but delivery record update failed:',
        markSentError
      );
    }

    return 'sent';
  } catch (error) {
    if (deliveryId) {
      const { error: updateError } = await supabase
        .from('newsletter_campaign_deliveries')
        .update({
          status: 'failed',
          error_message: error?.message || 'Unknown delivery error',
        })
        .eq('id', deliveryId);

      if (updateError) {
        console.error('Could not update failed delivery record:', updateError);
      }
    }

    throw error;
  }
};

const deliverCampaign = async (campaign, subscribers) => {
  let sent = 0;
  let failed = 0;
  let lastError = null;

  for (let index = 0; index < subscribers.length; index += 1) {
    const subscriber = subscribers[index];
    let outcome;

    try {
      outcome = await deliverToSubscriber(campaign, subscriber);
    } catch (error) {
      outcome = 'failed';
      lastError = error?.message || 'Unknown delivery error';
      console.error(
        `Newsletter delivery failed for subscriber ${subscriber.id}:`,
        lastError
      );
    }

    if (outcome === 'sent' || outcome === 'already_sent') sent += 1;
    if (outcome === 'failed') failed += 1;

    // Also acts as a heartbeat (updated_at) for stale-send detection.
    await recordProgress(campaign.id, {
      sent_count: sent,
      failed_count: failed,
      last_error: lastError,
    });

    const attemptedSend = outcome === 'sent' || outcome === 'failed';
    const isLast = index === subscribers.length - 1;

    if (attemptedSend && !isLast) {
      await sleep(SEND_DELAY_MS);
    }
  }

  await recordProgress(campaign.id, {
    status: failed > 0 && sent === 0 ? 'failed' : 'sent',
    sent_count: sent,
    failed_count: failed,
    sent_at: new Date().toISOString(),
    last_error: failed
      ? `${failed} delivery(s) failed. ${lastError || ''}`.trim()
      : null,
  });
};

const startDeliveryWorker = (campaign, subscribers) => {
  deliverCampaign(campaign, subscribers).catch(async (workerError) => {
    console.error(`Campaign ${campaign.id} worker crashed:`, workerError);

    await recordProgress(campaign.id, {
      status: 'failed',
      last_error: workerError?.message || 'Campaign delivery crashed.',
    });
  });
};

// Shared pre-flight checks for publish and resume.
const loadRecipientsOrFail = async (res, campaign) => {
  if (!campaign.subject?.trim() || !hasSendableContent(campaign)) {
    sendError(
      res,
      400,
      'Add an email subject and campaign content before publishing.'
    );
    return null;
  }

  const testEmail = createCampaignEmail(
    campaign,
    'https://example.invalid/unsubscribe-preview'
  );

  if (!testEmail.subject || !testEmail.html) {
    sendError(res, 400, 'The campaign email could not be generated.');
    return null;
  }

  const subscribers = await getAllSendableSubscribers();

  if (!subscribers.length) {
    sendError(
      res,
      400,
      'There are no active subscribers to receive this newsletter.'
    );
    return null;
  }

  return subscribers;
};

// ==========================================
// PUBLISH CAMPAIGN AND SEND NEWSLETTER
// ==========================================

export const publishNewsletterCampaign = async (req, res) => {
  try {
    assertSendingConfigured();

    const { id } = req.params;
    const campaign = await getCampaignById(id);

    if (!campaign) {
      return sendError(res, 404, 'Campaign not found.');
    }

    if (campaign.status !== 'draft' || campaign.is_published) {
      return sendError(
        res,
        409,
        'This campaign has already been published or is being processed.'
      );
    }

    const subscribers = await loadRecipientsOrFail(res, campaign);
    if (!subscribers) return undefined;

    const now = new Date().toISOString();

    // Atomically claim the campaign so only one worker can ever start.
    const { data: claimed, error } = await supabase
      .from('newsletter_campaigns')
      .update({
        is_published: true,
        published_at: now,
        published_by: adminId(req),
        sent_by: adminId(req),
        status: 'sending',
        recipient_count: subscribers.length,
        sent_count: 0,
        failed_count: 0,
        last_error: null,
        updated_at: now,
      })
      .eq('id', id)
      .eq('status', 'draft')
      .eq('is_published', false)
      .select('*')
      .maybeSingle();

    if (error) throw error;

    if (!claimed) {
      return sendError(
        res,
        409,
        'Another request has already published or started this campaign.'
      );
    }

    res.status(202).json({
      success: true,
      message: `Newsletter published. Sending to ${subscribers.length} subscriber(s).`,
      recipientCount: subscribers.length,
      campaign: claimed,
    });

    startDeliveryWorker(claimed, subscribers);
    return undefined;
  } catch (error) {
    console.error('Publish newsletter campaign error:', error);

    if (!res.headersSent) {
      return sendError(
        res,
        500,
        error.message || 'Failed to publish and send the newsletter.'
      );
    }
    return undefined;
  }
};

// ==========================================
// RESUME AN INTERRUPTED / FAILED CAMPAIGN
// ==========================================

// Subscribers who already received the campaign are skipped automatically.
export const resumeNewsletterCampaign = async (req, res) => {
  try {
    assertSendingConfigured();

    const { id } = req.params;
    const campaign = await getCampaignById(id);

    if (!campaign) {
      return sendError(res, 404, 'Campaign not found.');
    }

    if (!isResumable(campaign)) {
      return sendError(
        res,
        409,
        'Only failed campaigns, or campaigns stuck in sending for more than 10 minutes, can be resumed.'
      );
    }

    const subscribers = await loadRecipientsOrFail(res, campaign);
    if (!subscribers) return undefined;

    const now = new Date().toISOString();

    let claim = supabase
      .from('newsletter_campaigns')
      .update({
        status: 'sending',
        recipient_count: subscribers.length,
        last_error: null,
        updated_at: now,
      })
      .eq('id', id)
      .eq('status', campaign.status);

    // Guard against two admins resuming at the same moment.
    claim = campaign.updated_at
      ? claim.eq('updated_at', campaign.updated_at)
      : claim.is('updated_at', null);

    const { data: claimed, error } = await claim.select('*').maybeSingle();

    if (error) throw error;

    if (!claimed) {
      return sendError(
        res,
        409,
        'The campaign status changed. Refresh and try again.'
      );
    }

    res.status(202).json({
      success: true,
      message: `Resuming delivery. Checking ${subscribers.length} subscriber(s); people who already received it are skipped.`,
      recipientCount: subscribers.length,
      campaign: claimed,
    });

    startDeliveryWorker(claimed, subscribers);
    return undefined;
  } catch (error) {
    console.error('Resume newsletter campaign error:', error);

    if (!res.headersSent) {
      return sendError(
        res,
        500,
        error.message || 'Failed to resume the newsletter.'
      );
    }
    return undefined;
  }
};

// ==========================================
// LEGACY SEND ENDPOINT
// ==========================================

// Publishing already starts delivery; this alias stops a separate send
// handler from creating a second delivery worker.
export const sendNewsletterCampaign = publishNewsletterCampaign;

// ==========================================
// SEND TEST EMAIL
// ==========================================

export const sendTestNewsletterCampaign = async (req, res) => {
  try {
    assertSendingConfigured();

    const campaign = await getCampaignById(req.params.id);

    if (!campaign) {
      return sendError(res, 404, 'Campaign not found.');
    }

    if (!campaign.subject?.trim() || !hasSendableContent(campaign)) {
      return sendError(
        res,
        400,
        'Add a subject and some content before sending a test.'
      );
    }

    const recipient = adminEmail(req);

    if (!recipient) {
      return sendError(
        res,
        400,
        'Your administrator account has no email address.'
      );
    }

    const email = createCampaignEmail(campaign, '');

    if (!email.subject || !email.html) {
      return sendError(res, 400, 'The campaign email could not be generated.');
    }

    const result = await sendCampaignEmail({
      to: recipient,
      subject: `[Test] ${email.subject}`,
      html: email.html,
      text: email.text,
    });

    if (result?.error) {
      throw new Error(
        result.error.message || 'The email provider rejected the test email.'
      );
    }

    return res.json({
      success: true,
      message: `Test email sent to ${recipient}.`,
    });
  } catch (error) {
    console.error('Test newsletter email error:', error);
    return sendError(
      res,
      500,
      error.message || 'Failed to send the test email.'
    );
  }
};

// ==========================================
// DELETE CAMPAIGN
// ==========================================

export const deleteNewsletterCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await getCampaignById(id);

    if (!campaign) {
      return sendError(res, 404, 'Campaign not found.');
    }

    const stale = isStaleSending(campaign);

    if (campaign.status === 'sending' && !stale) {
      return sendError(
        res,
        409,
        'This newsletter is currently being sent. Wait until delivery finishes before deleting it.'
      );
    }

    const { error: deliveryError } = await supabase
      .from('newsletter_campaign_deliveries')
      .delete()
      .eq('campaign_id', id);

    if (deliveryError) throw deliveryError;

    let removal = supabase.from('newsletter_campaigns').delete().eq('id', id);

    removal = stale
      ? removal.eq('status', 'sending').eq('updated_at', campaign.updated_at)
      : removal.neq('status', 'sending');

    const { data, error } = await removal.select('id').maybeSingle();

    if (error) throw error;

    if (!data) {
      return sendError(
        res,
        409,
        'The campaign status changed. Refresh and try again.'
      );
    }

    return res.json({
      success: true,
      message: 'Newsletter campaign deleted successfully.',
      deletedCampaignId: data.id,
    });
  } catch (error) {
    console.error('Delete newsletter campaign error:', error);
    return sendError(res, 500, 'Failed to delete the newsletter campaign.');
  }
};