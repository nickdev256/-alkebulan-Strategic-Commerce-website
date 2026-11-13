
import { supabase } from '../config/supabase.js';
import { sendNewsletterWelcomeEmail } from '../services/emailService.js';

export async function subscribeToNewsletter(req, res) {
  try {
    const { email, _gotcha } = req.body || {};

    // Honeypot protection
    if (typeof _gotcha === 'string' && _gotcha.trim()) {
      return res.status(200).json({
        success: true,
        message: 'Thank you for subscribing.',
      });
    }

    // Validate email
    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your email address.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail) || cleanEmail.length > 254) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      });
    }

    // Check whether the email already exists.
    const { data: existing, error: lookupError } = await supabase
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    // Avoid duplicate subscriptions and duplicate notifications.
    if (existing?.status === 'subscribed') {
      return res.status(200).json({
        success: true,
        message: 'This email is already subscribed.',
      });
    }

    let data;

    if (existing) {
      // Reactivate a previously unsubscribed email.
      const { data: updated, error } = await supabase
        .from('newsletter_subscribers')
        .update({
          status: 'subscribed',
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
        })
        .eq('id', existing.id)
        .select('id')
        .single();

      if (error) throw error;

      data = updated;
    } else {
      // Save a new subscriber.
      const { data: inserted, error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: cleanEmail,
          status: 'subscribed',
        })
        .select('id')
        .single();

      if (error) throw error;

      data = inserted;
    }

    // Send notification to Alkebulan Global and welcome email
    // to the subscriber.
    let emailStatus = {
      notificationSent: false,
      acknowledgementSent: false,
    };

    try {
      emailStatus = await sendNewsletterWelcomeEmail(cleanEmail);
    } catch (emailError) {
      console.error('Newsletter email error:', emailError);
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you for subscribing to Alkebulan Global updates.',
      notificationSent: emailStatus.notificationSent,
      welcomeEmailSent: emailStatus.acknowledgementSent,
      subscriberId: data.id,
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to complete your subscription. Please try again.',
    });
  }
}
