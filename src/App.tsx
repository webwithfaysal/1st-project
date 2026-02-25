/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import Home from './pages/Home';
import AdminLayout from './layouts/AdminLayout';
import ResellerLayout from './layouts/ResellerLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminResellers from './pages/admin/Resellers';
import AdminOrders from './pages/admin/Orders';
import AdminWithdrawals from './pages/admin/Withdrawals';
import AdminMessages from './pages/admin/Messages';
import AdminSettings from './pages/admin/Settings';
import ResellerDashboard from './pages/reseller/Dashboard';
import ResellerProducts from './pages/reseller/Products';
import ResellerOrders from './pages/reseller/Orders';
import ResellerWithdrawals from './pages/reseller/Withdrawals';
import ResellerMessages from './pages/reseller/Messages';
import ResellerAffiliate from './pages/reseller/Affiliate';
import ResellerPayment from './pages/reseller/Payment';

function ProtectedRoute({ children, role }: { children: React.ReactNode, role: 'admin' | 'reseller' }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user || user.role !== role) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="resellers" element={<AdminResellers />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Reseller Routes */}
          <Route path="/reseller" element={<ProtectedRoute role="reseller"><ResellerLayout /></ProtectedRoute>}>
            <Route index element={<ResellerDashboard />} />
            <Route path="products" element={<ResellerProducts />} />
            <Route path="orders" element={<ResellerOrders />} />
            <Route path="payment/:id" element={<ResellerPayment />} />
            <Route path="withdrawals" element={<ResellerWithdrawals />} />
            <Route path="messages" element={<ResellerMessages />} />
            <Route path="affiliate" element={<ResellerAffiliate />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
