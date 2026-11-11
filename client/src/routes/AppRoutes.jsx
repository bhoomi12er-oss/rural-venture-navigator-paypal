import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerRoute, EntrepreneurRoute, PublicOnlyRoute } from './RoleRoute';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { EntrepreneurLayout } from '../components/layout/EntrepreneurLayout';

// Public Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import CustomerFeedbackForm from '../pages/CustomerFeedbackForm';

// Customer Portal Pages
import CustomerMarketplace from '../pages/CustomerMarketplace';

// Entrepreneur Studio Pages
import Dashboard from '../pages/Dashboard';
import EntrepreneurProducts from '../pages/EntrepreneurProducts';
import EntrepreneurOrders from '../pages/EntrepreneurOrders';
import CostCalculator from '../pages/CostCalculator';
import DemandTest from '../pages/DemandTest';
import FeedbackDashboard from '../pages/FeedbackDashboard';
import DecisionCard from '../pages/DecisionCard';
import Profile from '../pages/Profile';
import Onboarding from '../pages/Onboarding';

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Gateway & Feedback Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/feedback/:testId" element={<CustomerFeedbackForm />} />

      {/* 2. Public-only Auth Routes (Redirect to respective portal if already authenticated) */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* 3. Dedicated Customer Portal Routes (Strictly Customer Role Only) */}
      <Route element={<CustomerRoute />}>
        <Route element={<CustomerLayout />}>
          <Route path="/customer/marketplace" element={<CustomerMarketplace />} />
          <Route path="/customer-home" element={<CustomerMarketplace />} />
          <Route path="/customer/orders" element={<CustomerMarketplace />} />
        </Route>
      </Route>

      {/* 4. Dedicated Entrepreneur Studio Routes (Strictly Entrepreneur Role Only) */}
      <Route element={<EntrepreneurRoute />}>
        <Route element={<EntrepreneurLayout />}>
          <Route path="/entrepreneur/dashboard" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/entrepreneur/products" element={<EntrepreneurProducts />} />
          <Route path="/entrepreneur/orders" element={<EntrepreneurOrders />} />
          <Route path="/entrepreneur/feedback" element={<FeedbackDashboard />} />
          <Route path="/analytics" element={<FeedbackDashboard />} />
          <Route path="/entrepreneur/calculator" element={<CostCalculator />} />
          <Route path="/calculator" element={<CostCalculator />} />
          <Route path="/entrepreneur/demand-test" element={<DemandTest />} />
          <Route path="/demand-test" element={<DemandTest />} />
          <Route path="/entrepreneur/decision" element={<DecisionCard />} />
          <Route path="/decision" element={<DecisionCard />} />
          <Route path="/entrepreneur/profile" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Route>
      </Route>

      {/* Fallback Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
