
import { supabase } from '../config/supabase.js';
import { sendContactEmails } from '../services/emailService.js';

export async function submitContactEnquiry(req, res) {
  try {
    const {
      name,
      email,
      phone,
      company,
      interest,
      sector,
      message,
      _gotcha,
    } = req.body || {};

    // Reject automated submissions.
    if (typeof _gotcha === 'string' && _gotcha.trim()) {
      return res.status(200).json({
        success: true,
        message: 'Your enquiry has been received.',
      });
    }

    // Validate required fields.
    const requiredFields = [name, email, interest, sector, message];

    if (
      requiredFields.some(
        (value) => typeof value !== 'string' || !value.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required fields.',
      });
    }

    // Normalise information.
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone =
      typeof phone === 'string' ? phone.trim() || null : null;
    const cleanCompany =
      typeof company === 'string' ? company.trim() || null : null;
    const cleanInterest = interest.trim();
    const cleanSector = sector.trim();
    const cleanMessage = message.trim();

    // Validate email.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      });
    }

    // Enforce length limits.
    if (
      cleanName.length > 120 ||
      cleanEmail.length > 254 ||
      (cleanPhone && cleanPhone.length > 50) ||
      (cleanCompany && cleanCompany.length > 200) ||
      cleanInterest.length > 100 ||
      cleanSector.length > 100 ||
      cleanMessage.length > 5000
    ) {
      return res.status(400).json({
        success: false,
        message: 'Some submitted information exceeds the allowed length.',
      });
    }

    // Save enquiry to Supabase first.
    const { data, error } = await supabase
      .from('contact_enquiries')
      .insert({
        full_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        company: cleanCompany,
        interest: cleanInterest,
        sector: cleanSector,
        message: cleanMessage,
      })
      .select('id, created_at')
      .single();

    if (error) {
      console.error('Supabase contact enquiry error:', error);

      return res.status(500).json({
        success: false,
        message: 'Unable to submit your enquiry at this time. Please try again.',
      });
    }

    // Send notification and acknowledgement emails.
    let notificationSent = false;
    let acknowledgementSent = false;

    try {
      const emailResults = await sendContactEmails({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        company: cleanCompany,
        interest: cleanInterest,
        sector: cleanSector,
        message: cleanMessage,
      });

      notificationSent = emailResults.notificationSent;
      acknowledgementSent = emailResults.acknowledgementSent;
    } catch (emailError) {
      console.error('Resend email delivery error:', emailError);
    }

    return res.status(201).json({
      success: true,
      message: 'Your enquiry has been received successfully.',
      emailStatus: {
        notificationSent,
        acknowledgementSent,
      },
      enquiry: {
        id: data.id,
        created_at: data.created_at,
      },
    });
  } catch (error) {
    console.error('Contact enquiry error:', error);

    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    });
  }
}
