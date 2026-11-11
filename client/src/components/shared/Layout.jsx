import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export const Layout = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Define public paths that shouldn't show sidebar navigation
  const publicPaths = ['/', '/login', '/register', '/customer-home'];
  const isFeedbackPage = location.pathname.startsWith('/feedback/');
  const isPublic = publicPaths.includes(location.pathname) || isFeedbackPage;
  const isCustomerHome = location.pathname === '/customer-home';

  // Protect customer home
  if (isCustomerHome) {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
    if (user?.role !== 'customer') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Protect private routes
  if (!isPublic && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If customer attempts to access seller routes, redirect to customer home
  const sellerRoutes = ['/dashboard', '/calculator', '/demand-test', '/analytics', '/decision', '/onboarding', '/profile'];
  if (sellerRoutes.includes(location.pathname) && isAuthenticated && user?.role === 'customer') {
    return <Navigate to="/customer-home" replace />;
  }

  // Render Public Layout (No Sidebar)
  if (isPublic) {
    return (
      <div className="min-h-screen bg-brand-light flex flex-col justify-between">
        {/* Render standard header only if it's not the customer feedback submission screen */}
        {!isFeedbackPage && <Navbar onMenuClick={() => {}} />}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
        {!isFeedbackPage && (
          <footer className="bg-white border-t border-brand-neutralGray py-6 text-center text-xs font-semibold text-brand-dark opacity-60">
            © {new Date().getFullYear()} Rural Venture Navigator • ग्रामीण महिला उद्यमिता सशक्तिकरण
          </footer>
        )}
      </div>
    );
  }

  // Render Authenticated Dashboard Layout
  return (
    <div className="min-h-screen bg-brand-light flex flex-col">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
