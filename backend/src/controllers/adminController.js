
import { supabase } from '../config/supabase.js';

const REGISTRATION_REDIRECT =
  'https://www.alkebulan-global.com/admin/register';

const ALLOWED_ROLES = ['admin', 'editor'];

// ==========================================
// SHARED HELPERS
// ==========================================

const sendError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

const getAuthenticatedUser = async (req) => {
  const authorization = req.headers.authorization || '';

  if (!authorization.startsWith('Bearer ')) {
    throw new Error('AUTH_REQUIRED');
  }

  const accessToken = authorization.slice(7).trim();

  if (!accessToken) {
    throw new Error('AUTH_REQUIRED');
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    throw new Error('INVALID_SESSION');
  }

  return user;
};

// Only an approved owner can manage administrator accounts.
const getOwner = async (req) => {
  const user = await getAuthenticatedUser(req);

  const { data: administrator, error } = await supabase
    .from('admin_users')
    .select('id, email, full_name, role, status')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Owner lookup failed:', error);
    throw new Error('ADMIN_LOOKUP_FAILED');
  }

  if (
    !administrator ||
    administrator.role !== 'owner' ||
    administrator.status !== 'approved'
  ) {
    throw new Error('OWNER_REQUIRED');
  }

  return { user, administrator };
};

const handleControllerError = (res, error, context) => {
  console.error(`${context}:`, error);

  switch (error.message) {
    case 'AUTH_REQUIRED':
      return sendError(
        res,
        401,
        'Authorization token is required.'
      );

    case 'INVALID_SESSION':
      return sendError(
        res,
        401,
        'Your session is invalid or expired.'
      );

    case 'OWNER_REQUIRED':
      return sendError(
        res,
        403,
        'Only the approved CMS owner can perform this action.'
      );

    case 'ADMIN_LOOKUP_FAILED':
      return sendError(
        res,
        500,
        'Unable to verify administrator permissions.'
      );

    default:
      return sendError(
        res,
        500,
        'An unexpected server error occurred.'
      );
  }
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ==========================================
// INVITE ADMINISTRATOR
// POST /api/admin/invitations
// ==========================================

// Retained for owner-issued invitations.
// Normal self-registration now happens through Supabase OTP.
export const inviteAdministrator = async (req, res) => {
  try {
    const { user: inviter } = await getOwner(req);

    const { email, fullName, role } = req.body || {};

    const normalizedEmail = String(email || '')
      .trim()
      .toLowerCase();

    const normalizedName = String(fullName || '').trim();

    if (!normalizedEmail || !normalizedName || !role) {
      return sendError(
        res,
        400,
        'Email, full name and administrator role are required.'
      );
    }

    if (!isValidEmail(normalizedEmail)) {
      return sendError(
        res,
        400,
        'Please provide a valid email address.'
      );
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return sendError(
        res,
        400,
        'The selected administrator role is not permitted.'
      );
    }

    const { data: existingAdministrator, error: lookupError } =
      await supabase
        .from('admin_users')
        .select('id, email, status')
        .eq('email', normalizedEmail)
        .maybeSingle();

    if (lookupError) throw lookupError;

    if (existingAdministrator) {
      return sendError(
        res,
        409,
        'This email already has an administrator record.'
      );
    }

    const {
      data: invitationData,
      error: invitationError,
    } = await supabase.auth.admin.inviteUserByEmail(
      normalizedEmail,
      {
        data: {
          full_name: normalizedName,
          invited_by: inviter.id,
        },
        redirectTo: REGISTRATION_REDIRECT,
      }
    );

    if (invitationError) {
      console.error('Supabase invitation error:', invitationError);

      return sendError(
        res,
        400,
        invitationError.message ||
          'Unable to send administrator invitation.'
      );
    }

    const invitedUser = invitationData?.user;

    if (!invitedUser?.id) {
      return sendError(
        res,
        500,
        'The invitation was sent but the user record was not returned.'
      );
    }

    const { data: administrator, error: insertError } =
      await supabase
        .from('admin_users')
        .insert({
          id: invitedUser.id,
          email: normalizedEmail,
          full_name: normalizedName,
          role,
          status: 'pending',
        })
        .select('id, email, full_name, role, status, created_at')
        .single();

    if (insertError) {
      console.error(
        'Administrator profile insert error:',
        insertError
      );

      const { error: cleanupError } =
        await supabase.auth.admin.deleteUser(invitedUser.id);

      if (cleanupError) {
        console.error(
          'Could not clean up invited Auth user:',
          cleanupError
        );
      }

      throw insertError;
    }

    return res.status(201).json({
      success: true,
      message: 'Administrator invitation sent successfully.',
      administrator,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      'Invite administrator error'
    );
  }
};

// ==========================================
// GET PENDING ADMINISTRATORS
// GET /api/admin/pending
// ==========================================

export const getPendingAdministrators = async (req, res) => {
  try {
    await getOwner(req);

    const { data: administrators, error } = await supabase
      .from('admin_users')
      .select('id, email, full_name, role, status, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      administrators: administrators || [],
      count: administrators?.length || 0,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      'Get pending administrators error'
    );
  }
};

// ==========================================
// APPROVE ADMINISTRATOR
// PATCH /api/admin/:id/approve
// ==========================================

export const approveAdministrator = async (req, res) => {
  try {
    await getOwner(req);

    const administratorId = String(req.params.id || '').trim();
    const { role } = req.body || {};

    if (!administratorId) {
      return sendError(
        res,
        400,
        'Administrator ID is required.'
      );
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return sendError(
        res,
        400,
        'Choose a valid administrator role: admin or editor.'
      );
    }

    const { data: existingAdministrator, error: lookupError } =
      await supabase
        .from('admin_users')
        .select('id, email, full_name, role, status')
        .eq('id', administratorId)
        .maybeSingle();

    if (lookupError) throw lookupError;

    if (!existingAdministrator) {
      return sendError(
        res,
        404,
        'Administrator record was not found.'
      );
    }

    if (existingAdministrator.status !== 'pending') {
      return sendError(
        res,
        409,
        'This administrator request is no longer pending.'
      );
    }

    const { data: administrator, error: updateError } =
      await supabase
        .from('admin_users')
        .update({
          role,
          status: 'approved',
        })
        .eq('id', administratorId)
        .eq('status', 'pending')
        .select('id, email, full_name, role, status, created_at')
        .maybeSingle();

    if (updateError) throw updateError;

    if (!administrator) {
      return sendError(
        res,
        409,
        'The request has already been processed.'
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Administrator approved successfully.',
      administrator,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      'Approve administrator error'
    );
  }
};

// ==========================================
// REJECT ADMINISTRATOR
// PATCH /api/admin/:id/reject
// ==========================================

// Keep the profile and Auth account.
// Recording status as rejected allows the login system
// to distinguish rejected applicants from unknown users.
export const rejectAdministrator = async (req, res) => {
  try {
    await getOwner(req);

    const administratorId = String(req.params.id || '').trim();

    if (!administratorId) {
      return sendError(
        res,
        400,
        'Administrator ID is required.'
      );
    }

    const { data: existingAdministrator, error: lookupError } =
      await supabase
        .from('admin_users')
        .select('id, email, full_name, role, status')
        .eq('id', administratorId)
        .maybeSingle();

    if (lookupError) throw lookupError;

    if (!existingAdministrator) {
      return sendError(
        res,
        404,
        'Administrator record was not found.'
      );
    }

    if (existingAdministrator.status !== 'pending') {
      return sendError(
        res,
        409,
        'This administrator request is no longer pending.'
      );
    }

    const { data: administrator, error: updateError } =
      await supabase
        .from('admin_users')
        .update({
          status: 'rejected',
        })
        .eq('id', administratorId)
        .eq('status', 'pending')
        .select('id, email, full_name, role, status, created_at')
        .maybeSingle();

    if (updateError) throw updateError;

    if (!administrator) {
      return sendError(
        res,
        409,
        'The request has already been processed.'
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Administrator request rejected successfully.',
      administrator,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      'Reject administrator error'
    );
  }
};
