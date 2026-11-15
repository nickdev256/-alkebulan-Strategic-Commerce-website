
import { supabase } from '../config/supabase.js';

const REGISTRATION_REDIRECT =
  'https://www.alkebulan-global.com/admin/register';

const allowedRoles = ['admin', 'editor'];

/**
 * Invite an administrator.
 * Only an existing CMS owner may use this endpoint.
 */
export async function inviteAdministrator(req, res) {
  try {
    const authorization = req.headers.authorization || '';

    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication is required.',
      });
    }

    const accessToken = authorization.slice(7);

    // Verify the caller's Supabase access token.
    const {
      data: { user: requestingUser },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !requestingUser) {
      return res.status(401).json({
        success: false,
        message: 'Your session is invalid or has expired. Please log in again.',
      });
    }

    // Check the caller's actual CMS role.
    const { data: requestingAdmin, error: profileError } = await supabase
      .from('admin_users')
      .select('id, email, role')
      .eq('id', requestingUser.id)
      .maybeSingle();

    if (profileError) {
      console.error('Admin permission lookup failed:', profileError);

      return res.status(500).json({
        success: false,
        message: 'Unable to verify your administrator permissions.',
      });
    }

    if (!requestingAdmin || requestingAdmin.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only the CMS owner can invite administrators.',
      });
    }

    // Validate request fields.
    const email = String(req.body.email || '').trim().toLowerCase();
    const fullName = String(req.body.fullName || '').trim();
    const role = String(req.body.role || 'admin').trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (fullName.length < 2 || fullName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a name between 2 and 100 characters.',
      });
    }

    // Do not allow an invitation request to create another owner.
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'The assigned role must be admin or editor.',
      });
    }

    // Prevent duplicate CMS profiles.
    const { data: existingProfile, error: existingError } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: 'This email already has CMS administrator access.',
      });
    }

    // Send the Supabase invitation to the live registration page.
    const { data: invitation, error: invitationError } =
      await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: REGISTRATION_REDIRECT,
        data: {
          full_name: fullName,
        },
      });

    if (invitationError) {
      console.error('Supabase invitation failed:', invitationError);

      return res.status(400).json({
        success: false,
        message: invitationError.message,
      });
    }

    if (!invitation.user) {
      throw new Error('Supabase did not return the invited user.');
    }

    // Assign the CMS role before the recipient accepts the invitation.
    const { error: profileInsertError } = await supabase
      .from('admin_users')
      .insert({
        id: invitation.user.id,
        email,
        full_name: fullName,
        role,
      });

    if (profileInsertError) {
      console.error(
        'Administrator profile creation failed:',
        profileInsertError
      );

      return res.status(500).json({
        success: false,
        message:
          'The invitation was created, but the CMS profile could not be assigned. Please contact the system owner.',
      });
    }

    return res.status(201).json({
      success: true,
      message: `An administrator invitation has been sent to ${email}.`,
      administrator: {
        id: invitation.user.id,
        email,
        fullName,
        role,
      },
    });
  } catch (error) {
    console.error('Administrator invitation error:', error);

    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while sending the invitation.',
    });
  }
}
