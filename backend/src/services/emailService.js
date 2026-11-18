import { Resend } from 'resend';

// ==========================================
// RESEND CLIENT
// ==========================================

let resendClient;

const getEmailConfiguration = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const emailFrom = process.env.EMAIL_FROM?.trim();

  if (!apiKey) {
    throw new Error('Resend API key is missing.');
  }

  if (!emailFrom) {
    throw new Error('EMAIL_FROM is missing.');
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return { resend: resendClient, emailFrom };
};

// ==========================================
// SHARED EMAIL UTILITIES
// ==========================================

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const WEBSITE_URL = 'https://www.alkebulan-global.com';
const WEBSITE_LINK_HTML = `<p><a href="${WEBSITE_URL}">www.alkebulan-global.com</a></p>`;

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHtml = (value = '') =>
  String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);

const validateEmail = (email) => {
  if (typeof email !== 'string') return false;

  const cleanEmail = email.trim();

  return (
    cleanEmail.length > 0 &&
    cleanEmail.length <= 254 &&
    EMAIL_PATTERN.test(cleanEmail)
  );
};

const getContactEmail = () => {
  const contactEmail = process.env.CONTACT_EMAIL?.trim();

  if (!contactEmail || !validateEmail(contactEmail)) {
    throw new Error('A valid CONTACT_EMAIL is required.');
  }

  return contactEmail;
};

const cleanEmailAddress = (email) => email.trim().toLowerCase();

const EMAIL_WRAPPER_STYLE =
  'font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#263247;line-height:1.7;';

// ==========================================
// SEND EMAIL
// ==========================================

const sendEmail = async (options, label = 'Email') => {
  const { resend, emailFrom } = getEmailConfiguration();

  const result = await resend.emails.send({
    ...options,
    from: options.from || emailFrom,
  });

  if (result.error) {
    throw new Error(`${label} failed: ${result.error.message}`);
  }

  const emailId = result.data?.id;

  if (!emailId) {
    throw new Error(`${label} was not confirmed by Resend.`);
  }

  return { success: true, id: emailId };
};

// ==========================================
// CONTACT FORM EMAILS
// ==========================================

export async function sendContactEmails(enquiry) {
  getEmailConfiguration();

  const contactEmail = getContactEmail();

  if (!enquiry || typeof enquiry !== 'object') {
    throw new Error('Contact enquiry information is required.');
  }

  const { name, email, phone, company, interest, sector, message } = enquiry;

  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? cleanEmailAddress(email) : '';
  const cleanMessage = typeof message === 'string' ? message.trim() : '';

  if (!cleanName || !validateEmail(cleanEmail) || !cleanMessage) {
    throw new Error('Valid contact name, email and message are required.');
  }

  const safeName = escapeHtml(cleanName);
  const safeEmail = escapeHtml(cleanEmail);
  const safePhone = escapeHtml(phone || 'Not provided');
  const safeCompany = escapeHtml(company || 'Not provided');
  const safeInterest = escapeHtml(interest || 'Not provided');
  const safeSector = escapeHtml(sector || 'Not provided');
  const safeMessage = escapeHtml(cleanMessage);

  // 1. Notify the Alkebulan Global team.
  const notification = await sendEmail(
    {
      to: [contactEmail],
      replyTo: cleanEmail,
      subject: `New Website Enquiry from ${cleanName}`,
      html: `
        <div style="${EMAIL_WRAPPER_STYLE}">
          <h2 style="color:#183b65;">New Website Enquiry</h2>
          <p>You have received a new enquiry through the Alkebulan Global website.</p>
          <hr style="border:0;border-top:1px solid #ddd;" />
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Phone:</strong> ${safePhone}</p>
          <p><strong>Company:</strong> ${safeCompany}</p>
          <p><strong>Area of Interest:</strong> ${safeInterest}</p>
          <p><strong>Sector:</strong> ${safeSector}</p>
          <h3>Message</h3>
          <p style="white-space:pre-wrap;">${safeMessage}</p>
          <hr style="border:0;border-top:1px solid #ddd;" />
          <p>Alkebulan Global LLC</p>
          <p><strong>Global Partners. Real Impact.</strong></p>
        </div>
      `,
      text: [
        'New Website Enquiry',
        '',
        `Name: ${cleanName}`,
        `Email: ${cleanEmail}`,
        `Phone: ${phone || 'Not provided'}`,
        `Company: ${company || 'Not provided'}`,
        `Area of Interest: ${interest || 'Not provided'}`,
        `Sector: ${sector || 'Not provided'}`,
        '',
        'Message:',
        cleanMessage,
      ].join('\n'),
    },
    'Internal contact notification'
  );

  // 2. Acknowledge receipt to the visitor.
  const acknowledgement = await sendEmail(
    {
      to: [cleanEmail],
      subject: 'We Have Received Your Enquiry | Alkebulan Global',
      html: `
        <div style="${EMAIL_WRAPPER_STYLE}">
          <h2 style="color:#183b65;">Thank You for Contacting Alkebulan Global</h2>
          <p>Dear ${safeName},</p>
          <p>
            Thank you for reaching out to Alkebulan Global LLC.
            We have successfully received your enquiry.
          </p>
          <p>Our team will review your message and get back to you as soon as possible.</p>
          <p>We appreciate your interest in working with us.</p>
          <p>Kind regards,</p>
          <p><strong>Alkebulan Global LLC</strong></p>
          <p>Global Partners. Real Impact.</p>
          ${WEBSITE_LINK_HTML}
        </div>
      `,
      text: [
        `Dear ${cleanName},`,
        '',
        'Thank you for reaching out to Alkebulan Global LLC.',
        'We have successfully received your enquiry.',
        '',
        'Our team will review your message and get back to you as soon as possible.',
        '',
        'Kind regards,',
        'Alkebulan Global LLC',
        'Global Partners. Real Impact.',
        WEBSITE_URL,
      ].join('\n'),
    },
    'Visitor acknowledgement'
  );

  return {
    notificationSent: true,
    acknowledgementSent: true,
    notificationId: notification.id,
    acknowledgementId: acknowledgement.id,
  };
}

// ==========================================
// NEWSLETTER SUBSCRIPTION EMAILS
// ==========================================

export async function sendNewsletterWelcomeEmail(email) {
  getEmailConfiguration();

  const contactEmail = getContactEmail();

  if (!validateEmail(email)) {
    throw new Error('A valid subscriber email is required.');
  }

  const cleanEmail = cleanEmailAddress(email);

  const subscribedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Africa/Kampala',
  });

  const safeEmail = escapeHtml(cleanEmail);
  const safeDate = escapeHtml(subscribedAt);

  // Send both emails independently; one failing does not block the other.
  const results = await Promise.allSettled([
    // 1. Notify Alkebulan Global about the new subscriber.
    sendEmail(
      {
        to: [contactEmail],
        subject: 'New Newsletter Subscriber | Alkebulan Global',
        html: `
          <div style="${EMAIL_WRAPPER_STYLE}">
            <h2 style="color:#183b65;">New Newsletter Subscription</h2>
            <p>A new person has subscribed to Alkebulan Global updates through the website.</p>
            <div style="background:#f5f7fa;padding:20px;border-radius:8px;">
              <p><strong>Subscriber Email:</strong> ${safeEmail}</p>
              <p><strong>Subscription Date:</strong> ${safeDate}</p>
            </div>
            <p>The subscriber's information has been recorded in your newsletter database.</p>
            <p><strong>Alkebulan Global LLC</strong></p>
            <p>Global Partners. Real Impact.</p>
            ${WEBSITE_LINK_HTML}
          </div>
        `,
        text: [
          'New Newsletter Subscription',
          '',
          `Subscriber Email: ${cleanEmail}`,
          `Subscription Date: ${subscribedAt}`,
          '',
          'The subscriber has been recorded in your newsletter database.',
          '',
          'Alkebulan Global LLC',
          'Global Partners. Real Impact.',
          WEBSITE_URL,
        ].join('\n'),
      },
      'Newsletter admin notification'
    ),

    // 2. Send a welcome email to the subscriber.
    sendEmail(
      {
        to: [cleanEmail],
        subject: 'Welcome to Alkebulan Global Updates',
        html: `
          <div style="${EMAIL_WRAPPER_STYLE}">
            <h2 style="color:#183b65;">Stay Connected with Alkebulan Global</h2>
            <p>Thank you for subscribing to Alkebulan Global updates.</p>
            <p>
              We are pleased to have you as part of our growing network.
              Through our updates, you will receive information about:
            </p>
            <ul>
              <li>Our sectors and strategic initiatives</li>
              <li>Trade and investment opportunities</li>
              <li>Projects and partnerships</li>
              <li>Business developments across Africa and global markets</li>
            </ul>
            <p>
              We look forward to keeping you informed about our work
              and opportunities for engagement.
            </p>
            <p>Kind regards,</p>
            <p><strong>Alkebulan Global LLC</strong></p>
            <p>Global Partners. Real Impact.</p>
            ${WEBSITE_LINK_HTML}
          </div>
        `,
        text: [
          'Stay Connected with Alkebulan Global',
          '',
          'Thank you for subscribing to Alkebulan Global updates.',
          '',
          'Through our updates, you will receive information about:',
          '- Our sectors and strategic initiatives',
          '- Trade and investment opportunities',
          '- Projects and partnerships',
          '- Business developments across Africa and global markets',
          '',
          'We look forward to keeping you informed about our work and opportunities for engagement.',
          '',
          'Kind regards,',
          'Alkebulan Global LLC',
          'Global Partners. Real Impact.',
          WEBSITE_URL,
        ].join('\n'),
      },
      'Newsletter welcome email'
    ),
  ]);

  const [notificationResult, welcomeResult] = results;
  const notificationSent = notificationResult.status === 'fulfilled';
  const acknowledgementSent = welcomeResult.status === 'fulfilled';

  if (!notificationSent) {
    console.error('Newsletter admin notification failed:', notificationResult.reason);
  }

  if (!acknowledgementSent) {
    console.error('Newsletter welcome email failed:', welcomeResult.reason);
  }

  return {
    notificationSent,
    acknowledgementSent,
    notificationId: notificationSent ? notificationResult.value.id : null,
    welcomeEmailId: acknowledgementSent ? welcomeResult.value.id : null,
  };
}

// ==========================================
// NEWSLETTER CAMPAIGN EMAILS
// ==========================================

export async function sendCampaignEmail({ to, subject, html, text, unsubscribeUrl }) {
  getEmailConfiguration();

  if (!to || !subject || !html) {
    throw new Error('Recipient, subject and email content are required.');
  }

  const recipients = Array.isArray(to) ? to : [to];

  if (recipients.length === 0 || !recipients.every(validateEmail)) {
    throw new Error('One or more campaign recipient emails are invalid.');
  }

  const cleanSubject = String(subject).trim();
  const cleanHtml = String(html);
  const cleanText = typeof text === 'string' ? text.trim() : '';

  if (!cleanSubject || !cleanHtml.trim()) {
    throw new Error('Campaign subject and email content cannot be empty.');
  }

  const emailOptions = {
    to: recipients.map(cleanEmailAddress),
    subject: cleanSubject,
    html: cleanHtml,
  };

  if (cleanText) {
    emailOptions.text = cleanText;
  }

  // Gmail and Yahoo require one-click unsubscribe headers for bulk mail
  // (RFC 8058). The POST /api/newsletter/unsubscribe route handles the click.
  if (typeof unsubscribeUrl === 'string' && /^https?:\/\//i.test(unsubscribeUrl)) {
    emailOptions.headers = {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    };
  }

  const result = await sendEmail(emailOptions, 'Newsletter campaign email');

  return { success: true, id: result.id };
}