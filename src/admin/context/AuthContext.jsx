
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { supabase } from '../../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // VERIFY ADMINISTRATOR PROFILE
  // ==========================================

  const verifyAdmin = useCallback(async (authUser) => {
    if (!authUser?.id) {
      setAdmin(null);
      return null;
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, full_name, role, status, created_at')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) {
      console.error('Admin verification failed:', error);
      setAdmin(null);
      throw new Error('Unable to verify administrator access.');
    }

    if (!data) {
      setAdmin(null);
      return null;
    }

    // Only approved administrators are granted dashboard access.
    // Pending and rejected profiles are returned for status checks,
    // but they are never stored as authenticated administrators.
    if (data.status !== 'approved') {
      setAdmin(null);
      return data;
    }

    setAdmin(data);
    return data;
  }, []);

  // ==========================================
  // AUTHENTICATION STATE LISTENER
  // ==========================================

  useEffect(() => {
    let mounted = true;
    let verificationRequest = 0;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        verificationRequest += 1;

        setUser(null);
        setAdmin(null);
        setLoading(false);
        return;
      }

      const currentRequest = ++verificationRequest;

      setUser(session.user);

      // Run Supabase database requests outside the auth callback.
      Promise.resolve().then(async () => {
        if (!mounted || currentRequest !== verificationRequest) return;

        try {
          const adminProfile = await verifyAdmin(session.user);

          if (!mounted || currentRequest !== verificationRequest) return;

          // IMPORTANT:
          // Do not sign out pending users here.
          // OTP verification may trigger SIGNED_IN before the
          // AdminRegister component inserts their pending profile.
          //
          // Pending and rejected users remain blocked because
          // isAuthenticated requires an approved admin profile.

          if (!adminProfile || adminProfile.status !== 'approved') {
            setAdmin(null);
          }
        } catch (error) {
          console.error('Administrator authentication error:', error);

          if (mounted && currentRequest === verificationRequest) {
            setAdmin(null);
          }
        } finally {
          if (mounted && currentRequest === verificationRequest) {
            setLoading(false);
          }
        }
      });
    });

    return () => {
      mounted = false;
      verificationRequest += 1;
      subscription.unsubscribe();
    };
  }, [verifyAdmin]);

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      await supabase.auth.signOut();
      throw new Error('Unable to authenticate this account.');
    }

    setUser(data.user);

    try {
      const adminProfile = await verifyAdmin(data.user);

      if (!adminProfile) {
        throw new Error(
          'This account is not authorised to access the administration portal.'
        );
      }

      if (adminProfile.status === 'pending') {
        throw new Error(
          'Your email is verified, but your administrator account is awaiting approval from the CMS owner.'
        );
      }

      if (adminProfile.status === 'rejected') {
        throw new Error(
          'Your administrator access request has been rejected. Please contact the website owner.'
        );
      }

      if (adminProfile.status !== 'approved') {
        throw new Error(
          'Your administrator account is not currently authorised.'
        );
      }

      setUser(data.user);
      setAdmin(adminProfile);

      return {
        user: data.user,
        admin: adminProfile,
      };
    } catch (error) {
      await supabase.auth.signOut();

      setUser(null);
      setAdmin(null);

      throw error;
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    setUser(null);
    setAdmin(null);
  };

  // ==========================================
  // REQUEST PASSWORD RESET
  // ==========================================

  const resetPassword = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();

    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: `${window.location.origin}/admin/forgot-password`,
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    return true;
  };

  // ==========================================
  // UPDATE PASSWORD
  // ==========================================

  const updatePassword = async (password) => {
    if (!password || password.length < 8) {
      throw new Error('Your password must contain at least 8 characters.');
    }

    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      setUser(data.user);
    }

    return data.user;
  };

  // ==========================================
  // AUTHENTICATION STATUS
  // ==========================================

  const isAdmin = Boolean(
    user &&
    admin &&
    admin.id === user.id &&
    admin.status === 'approved'
  );

  const isOwner = Boolean(
    isAdmin && admin.role === 'owner'
  );

  const value = {
    user,
    admin,
    loading,

    isAuthenticated: isAdmin,
    isAdmin,
    isOwner,

    login,
    logout,
    resetPassword,
    updatePassword,
    verifyAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// CUSTOM AUTHENTICATION HOOK
// ==========================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider.'
    );
  }

  return context;
}
