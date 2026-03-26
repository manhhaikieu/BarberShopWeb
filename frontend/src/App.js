import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/AuthContext';
import { DataProvider } from './hooks/DataContext';
import Layout from './templates/Layout';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookingPage from './pages/BookingPage';
import ProductPage from './pages/ProductPage';
import StaffPage from './pages/StaffPage';
import BarberDashboard from './pages/BarberDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBarbersPage from './pages/admin/AdminBarbersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminChairsPage from './pages/admin/AdminChairsPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import './themes/theme.css';

// Permissions khớp với backend (Claim-based)
const PERMISSIONS = {
  CREATE_BOOKING: 'CreateBooking',
  MANAGE_PRODUCTS: 'ManageProduct',
  MANAGE_BARBER: 'ManageBarber',
  VIEW_BOOKING: 'ViewBooking',
  MANAGE_BOOKING: 'ManageBooking',
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            {/* Public + customer routes - có Layout header/footer */}
            <Route path="/login" element={<Layout><LoginPage /></Layout>} />
            <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route
              path="/booking"
              element={
                <Layout>
                  <PrivateRoute requiredClaim={PERMISSIONS.CREATE_BOOKING}>
                    <BookingPage />
                  </PrivateRoute>
                </Layout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <PrivateRoute requiredClaim={PERMISSIONS.VIEW_BOOKING}>
                    <BarberDashboard />
                  </PrivateRoute>
                </Layout>
              }
            />
            {/* Legacy routes */}
            <Route
              path="/products"
              element={
                <Layout>
                  <PrivateRoute requiredClaim={PERMISSIONS.MANAGE_PRODUCTS}>
                    <ProductPage />
                  </PrivateRoute>
                </Layout>
              }
            />
            <Route
              path="/staff"
              element={
                <Layout>
                  <PrivateRoute requiredClaim={PERMISSIONS.MANAGE_BARBER}>
                    <StaffPage />
                  </PrivateRoute>
                </Layout>
              }
            />

            {/* ── Admin routes - không có Layout, dùng AdminLayout riêng ── */}
            <Route
              path="/admin"
              element={
                <PrivateRoute requiredClaim={PERMISSIONS.MANAGE_BOOKING}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/barbers"
              element={
                <PrivateRoute requiredClaim={PERMISSIONS.MANAGE_BARBER}>
                  <AdminBarbersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <PrivateRoute requiredClaim={PERMISSIONS.MANAGE_PRODUCTS}>
                  <AdminProductsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/services"
              element={
                <PrivateRoute requiredClaim={PERMISSIONS.MANAGE_BOOKING}>
                  <AdminServicesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/chairs"
              element={
                <PrivateRoute requiredClaim={PERMISSIONS.MANAGE_BARBER}>
                  <AdminChairsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <PrivateRoute requiredClaim={PERMISSIONS.MANAGE_BOOKING}>
                  <AdminBookingsPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
