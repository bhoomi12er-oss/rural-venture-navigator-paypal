import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const CustomerRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user?.role !== 'customer') {
    // If shopkeeper tries to access customer portal, redirect to entrepreneur dashboard
    return <Navigate to="/entrepreneur/dashboard" replace />;
  }

  return <Outlet />;
};

export const EntrepreneurRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user?.role !== 'entrepreneur') {
    // If customer tries to access entrepreneur studio, redirect to marketplace
    return <Navigate to="/customer/marketplace" replace />;
  }

  return <Outlet />;
};

export const PublicOnlyRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === 'customer') {
      return <Navigate to="/customer/marketplace" replace />;
    }
    return <Navigate to="/entrepreneur/dashboard" replace />;
  }

  return <Outlet />;
};

