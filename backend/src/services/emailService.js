
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const escapeHtml = (value = '') => {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[char];
  });
};

// ==========================================
// CONTACT FORM EMAILS
// ==========================================

export async function sendContactEmails(enquiry) {
  const {
    name,
    email,
    phone,
    company,
    interest,
    sector,
    message,
  } = enquiry;

  if (!process.env.RESEND_API_KEY) {
    throw new Error('Resend API key is missing.');
  }

  if (!process.env.CONTACT_EMAIL || !process.env.EMAIL_FROM) {
    throw new Error('Email configuration is incomplete.');
  }

  // 1. Notify the Alkebulan Global team.
  const notification = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [process.env.CONTACT_EMAIL],
    replyTo: email,
    subject: `New Website Enquiry from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; color: #263247; line-height: 1.7;">
        <h2 style="color: #183b65;">New Website Enquiry</h2>

        <p>You have received a new enquiry through the Alkebulan Global website.</p>

        <hr style="border: 0; border-top: 1px solid #ddd;" />

        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
        <p><strong>Company:</strong> ${escapeHtml(company || 'Not provided')}</p>
        <p><strong>Area of Interest:</strong> ${escapeHtml(interest)}</p>
        <p><strong>Sector:</strong> ${escapeHtml(sector)}</p>

        <h3>Message</h3>
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>

        <hr style="border: 0; border-top: 1px solid #ddd;" />

        <p>Alkebulan Global LLC</p>
        <p><strong>Global Partners. Real Impact.</strong></p>
      </div>
    `,
  });

  if (notification.error) {
    throw new Error(
      `Internal notification failed: ${notification.error.message}`
    );
  }

  // 2. Acknowledge receipt to the visitor.
  const acknowledgement = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [email],
    subject: 'We Have Received Your Enquiry | Alkebulan Global',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; color: #263247; line-height: 1.7;">
        <h2 style="color: #183b65;">Thank You for Contacting Alkebulan Global</h2>

        <p>Dear ${escapeHtml(name)},</p>

        <p>
          Thank you for reaching out to Alkebulan Global LLC.
          We have successfully received your enquiry.
        </p>

        <p>
          Our team will review your message and get back to you
          as soon as possible.
        </p>

        <p>We appreciate your interest in working with us.</p>

        <br />

        <p>Kind regards,</p>
        <p><strong>Alkebulan Global LLC</strong></p>
        <p>Global Partners. Real Impact.</p>

        <p>
          <a href="https://alkebulan-global.com">
            www.alkebulan-global.com
          </a>
        </p>
      </div>
    `,
  });

  if (acknowledgement.error) {
    throw new Error(
      `Visitor acknowledgement failed: ${acknowledgement.error.message}`
    );
  }

  return {
    notificationSent: true,
    acknowledgementSent: true,
  };
}

// ==========================================
// NEWSLETTER SUBSCRIPTION EMAILS
// ==========================================

export async function sendNewsletterWelcomeEmail(email) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Resend API key is missing.');
  }

  if (!process.env.EMAIL_FROM || !process.env.CONTACT_EMAIL) {
    throw new Error('Email configuration is incomplete.');
  }

  const cleanEmail = email.trim().toLowerCase();

  const subscribedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Africa/Kampala',
  });

  const safeEmail = escapeHtml(cleanEmail);
  const safeDate = escapeHtml(subscribedAt);

  // Send both emails independently.
  const results = await Promise.allSettled([
    // 1. Notify Alkebulan Global about the new subscriber.
    resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [process.env.CONTACT_EMAIL],
      subject: 'New Newsletter Subscriber | Alkebulan Global',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; color: #263247; line-height: 1.7;">

          <h2 style="color: #183b65;">
            New Newsletter Subscription
          </h2>

          <p>
            A new person has subscribed to Alkebulan Global updates
            through the website.
          </p>

          <div style="background: #f5f7fa; padding: 20px; border-radius: 8px;">
            <p><strong>Subscriber Email:</strong> ${safeEmail}</p>
            <p><strong>Subscription Date:</strong> ${safeDate}</p>
          </div>

          <p>
            The subscriber's information has been recorded
            in your newsletter database.
          </p>

          <br />

          <p><strong>Alkebulan Global LLC</strong></p>
          <p>Global Partners. Real Impact.</p>

          <p>
            <a href="https://alkebulan-global.com">
              www.alkebulan-global.com
            </a>
          </p>

        </div>
      `,
    }),

    // 2. Send a welcome email to the subscriber.
    resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [cleanEmail],
      subject: 'Welcome to Alkebulan Global Updates',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; color: #263247; line-height: 1.7;">

          <h2 style="color: #183b65;">
            Stay Connected with Alkebulan Global
          </h2>

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

          <br />

          <p>Kind regards,</p>

          <p><strong>Alkebulan Global LLC</strong></p>

          <p>Global Partners. Real Impact.</p>

          <p>
            <a href="https://alkebulan-global.com">
              www.alkebulan-global.com
            </a>
          </p>

        </div>
      `,
    }),
  ]);

  const notificationSent =
    results[0].status === 'fulfilled' && !results[0].value.error;

  const acknowledgementSent =
    results[1].status === 'fulfilled' && !results[1].value.error;

  if (!notificationSent) {
    console.error(
      'Newsletter admin notification failed:',
      results[0].status === 'rejected'
        ? results[0].reason
        : results[0].value.error
    );
  }

  if (!acknowledgementSent) {
    console.error(
      'Newsletter welcome email failed:',
      results[1].status === 'rejected'
        ? results[1].reason
        : results[1].value.error
    );
  }

  return {
    notificationSent,
    acknowledgementSent,
  };
}
