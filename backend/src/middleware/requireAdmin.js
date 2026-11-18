
import { supabase } from '../config/supabase.js';

// ==========================================
// VERIFY APPROVED ADMINISTRATOR
// ==========================================

export const requireAdmin = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is missing.',
      });
    }

    // Verify the access token with Supabase.
    const {
      data: authData,
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session.',
      });
    }

    const authenticatedUser = authData.user;

    // Find the corresponding administrator record.
    const {
      data: admin,
      error: adminError,
    } = await supabase
      .from('admin_users')
      .select('id, email, full_name, role, status')
      .eq('id', authenticatedUser.id)
      .maybeSingle();

    if (adminError) {
      console.error('Admin lookup failed:', adminError);

      return res.status(500).json({
        success: false,
        message: 'Could not verify administrator access.',
      });
    }

    // Confirm that the account exists and is approved.
    if (!admin || admin.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your administrator account is not approved.',
      });
    }

    // Ensure the administrator record matches the authenticated email.
    if (
      !authenticatedUser.email ||
      !admin.email ||
      authenticatedUser.email.trim().toLowerCase() !==
        admin.email.trim().toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Administrator account verification failed.',
      });
    }

    // Allow only recognised administrator roles.
    if (!['owner', 'admin', 'editor'].includes(admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource.',
      });
    }

    // Attach verified identity and administrator permissions.
    req.user = authenticatedUser;
    req.admin = admin;

    return next();
  } catch (error) {
    console.error('Administrator authentication error:', error);

    return res.status(500).json({
      success: false,
      message: 'Administrator authentication failed.',
    });
  }
};

// ==========================================
// REQUIRE OWNER OR ADMIN
// ==========================================

export const requireAdminOrOwner = (req, res, next) => {
  if (!req.admin || !['owner', 'admin'].includes(req.admin.role)) {
    return res.status(403).json({
      success: false,
      message: 'Owner or administrator permission required.',
    });
  }

  return next();
};

// ==========================================
// REQUIRE OWNER
// ==========================================

export const requireOwner = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Owner permission required.',
    });
  }

  return next();
};
