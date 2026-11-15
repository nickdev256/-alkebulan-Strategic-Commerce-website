
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
  // VERIFY ADMINISTRATOR ACCESS
  // ==========================================

  const verifyAdmin = useCallback(async (authUser) => {
    if (!authUser?.id) {
      setAdmin(null);
      return null;
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, full_name, role, created_at')
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

    setAdmin(data);
    return data;
  }, []);

  // ==========================================
  // HANDLE AUTHENTICATION STATE
  // ==========================================

  useEffect(() => {
    let mounted = true;

    const initialiseAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);

          try {
            await verifyAdmin(session.user);
          } catch (verificationError) {
            console.error(verificationError);
          }
        } else {
          setUser(null);
          setAdmin(null);
        }
      } catch (error) {
        console.error('Authentication initialisation error:', error);
        if (mounted) {
          setUser(null);
          setAdmin(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initialiseAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setAdmin(null);
        setLoading(false);
        return;
      }

      setUser(session.user);

      // Defer database verification to avoid running Supabase
      // queries inside the auth event callback.
      if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED' ||
        event === 'INITIAL_SESSION'
      ) {
        Promise.resolve().then(async () => {
          if (!mounted) return;

          try {
            await verifyAdmin(session.user);
          } catch (error) {
            console.error('Admin verification error:', error);
          } finally {
            if (mounted) setLoading(false);
          }
        });
      }
    });

    return () => {
      mounted = false;
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
      throw new Error('Unable to authenticate this account.');
    }

    setUser(data.user);

    try {
      const adminProfile = await verifyAdmin(data.user);

      if (!adminProfile) {
        await supabase.auth.signOut();
        setUser(null);
        setAdmin(null);

        throw new Error(
          'This account is not authorised to access the administration portal.'
        );
      }

      return {
        user: data.user,
        admin: adminProfile,
      };
    } catch (error) {
      if (!error.message.includes('not authorised')) {
        await supabase.auth.signOut();
        setUser(null);
        setAdmin(null);
      }

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
  // INVITATION REGISTRATION
  // ==========================================

  const completeInvitation = async (fullName, password) => {
    if (!fullName?.trim()) {
      throw new Error('Please enter your full name.');
    }

    if (!password || password.length < 8) {
      throw new Error('Your password must contain at least 8 characters.');
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (!session?.user) {
      throw new Error(
        'Your invitation session is invalid or has expired. Please open your invitation link again.'
      );
    }

    const { data, error } = await supabase.auth.updateUser({
      password,
      data: {
        full_name: fullName.trim(),
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    setUser(data.user);

    return data.user;
  };

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value = {
    user,
    admin,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: Boolean(admin),
    login,
    logout,
    resetPassword,
    updatePassword,
    completeInvitation,
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
