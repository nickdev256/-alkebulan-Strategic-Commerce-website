
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import './ProtectedRoute.css';

export default function ProtectedRoute() {
  const { user, admin, loading } = useAuth();
  const location = useLocation();

  // Wait until Supabase finishes checking the session.
  if (loading) {
    return (
      <div className="admin-auth-loading">
        <div className="admin-auth-loading__content">
          <div className="admin-auth-spinner" />

          <h2>ALKEBULAN GLOBAL</h2>

          <p>Verifying administrator access...</p>
        </div>
      </div>
    );
  }

  // Redirect users who are not logged in.
  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Redirect authenticated users without an admin profile.
  if (!admin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location,
          error: 'Your account is not authorised to access the CMS.',
        }}
      />
    );
  }

  // Administrator is verified.
  return <Outlet />;
}
