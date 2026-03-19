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
import { CLAIMS } from './api/mockData';
import './themes/theme.css';

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
                  <PrivateRoute requiredClaim={CLAIMS.CREATE_BOOKING}>
                    <BookingPage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/products"
                element={
                  <PrivateRoute requiredClaim={CLAIMS.MANAGE_PRODUCTS}>
                    <ProductPage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/staff"
                element={
                  <PrivateRoute requiredClaim={CLAIMS.MANAGE_STAFF}>
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
