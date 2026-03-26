import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/AuthContext';
import { DataProvider } from './hooks/DataContext';
import { useAuth } from './hooks/AuthContext';
import Layout from './templates/Layout';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookingPage from './pages/BookingPage';
import ProductPage from './pages/ProductPage';
import StaffPage from './pages/StaffPage';
import BarberDashboardHome from './pages/barber/BarberDashboardHome';
import BarberSchedulePage from './pages/barber/BarberSchedulePage';
import BarberProfilePage from './pages/barber/BarberProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBarbersPage from './pages/admin/AdminBarbersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminChairsPage from './pages/admin/AdminChairsPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import './themes/theme.css';

// Redirect admin/staff ra khỏi trang public
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user && user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user && user.role === 'staff') return <Navigate to="/barber" replace />;
  return children;
};

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
            {/* ── Public routes (admin bị redirect về /admin) ── */}
            <Route path="/login" element={<PublicRoute><Layout><LoginPage /></Layout></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Layout><RegisterPage /></Layout></PublicRoute>} />
            <Route path="/" element={<PublicRoute><Layout><HomePage /></Layout></PublicRoute>} />

            {/* ── Customer routes (customerOnly – staff/admin bị redirect ra) ── */}
            <Route
              path="/booking"
              element={
                <Layout>
                  <PrivateRoute requiredClaim={PERMISSIONS.CREATE_BOOKING} customerOnly>
                    <BookingPage />
                  </PrivateRoute>
                </Layout>
              }
            />

            {/* ── Barber Panel routes (staffOnly – giống admin panel nhưng cho thợ) ── */}
            <Route
              path="/barber"
              element={
                <PrivateRoute requiredClaim={PERMISSIONS.VIEW_BOOKING} staffOnly>
                  <BarberDashboardHome />
                </PrivateRoute>
              }
            />
            <Route
              path="/barber/schedule"
              element={
                <PrivateRoute requiredClaim={PERMISSIONS.VIEW_BOOKING} staffOnly>
                  <BarberSchedulePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/barber/profile"
              element={
                <PrivateRoute requiredClaim={PERMISSIONS.VIEW_BOOKING} staffOnly>
                  <BarberProfilePage />
                </PrivateRoute>
              }
            />

            {/* ── Admin routes (adminOnly – không có Layout, dùng AdminLayout riêng) ── */}
            <Route
              path="/admin"
              element={
                <PrivateRoute requiredClaim={PERMISSIONS.MANAGE_BOOKING} adminOnly>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/barbers"
              element={
                <PrivateRoute requiredClaim={PERMISSIONS.MANAGE_BARBER} adminOnly>
                  <AdminBarbersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <PrivateRoute requiredClaim={PERMISSIONS.MANAGE_PRODUCTS} adminOnly>
                  <AdminProductsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/services"
              element={
                <PrivateRoute requiredClaim={PERMISSIONS.MANAGE_BOOKING} adminOnly>
                  <AdminServicesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/chairs"
              element={
                <PrivateRoute requiredClaim={PERMISSIONS.MANAGE_BARBER} adminOnly>
                  <AdminChairsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <PrivateRoute requiredClaim={PERMISSIONS.MANAGE_BOOKING} adminOnly>
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
