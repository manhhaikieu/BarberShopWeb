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
          <Layout>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<HomePage />} />

              <Route
                path="/booking"
                element={
                  <PrivateRoute requiredClaim={PERMISSIONS.CREATE_BOOKING}>
                    <BookingPage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute requiredClaim={PERMISSIONS.VIEW_BOOKING}>
                    <BarberDashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/products"
                element={
                  <PrivateRoute requiredClaim={PERMISSIONS.MANAGE_PRODUCTS}>
                    <ProductPage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/staff"
                element={
                  <PrivateRoute requiredClaim={PERMISSIONS.MANAGE_BARBER}>
                    <StaffPage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
