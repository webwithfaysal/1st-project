/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import ResellerLayout from './layouts/ResellerLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminWithdrawals from './pages/admin/Withdrawals';
import ResellerDashboard from './pages/reseller/Dashboard';
import ResellerProducts from './pages/reseller/Products';
import ResellerOrders from './pages/reseller/Orders';
import ResellerWithdrawals from './pages/reseller/Withdrawals';

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
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
          </Route>

          {/* Reseller Routes */}
          <Route path="/reseller" element={<ProtectedRoute role="reseller"><ResellerLayout /></ProtectedRoute>}>
            <Route index element={<ResellerDashboard />} />
            <Route path="products" element={<ResellerProducts />} />
            <Route path="orders" element={<ResellerOrders />} />
            <Route path="withdrawals" element={<ResellerWithdrawals />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
