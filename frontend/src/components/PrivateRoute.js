import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

/**
 * Claim-based Route Guard
 * - Chua dang nhap              → redirect /login
 * - adminOnly=true & role!=admin → redirect /
 * - staffOnly=true & role!=staff → admin→/admin, customer→/
 * - customerOnly=true & role!=customer → admin→/admin, staff→/barber
 * - Dang nhap nhung thieu claim → hien 403 Access Denied
 * - Co claim                    → render children
 */
const PrivateRoute = ({ children, requiredClaim, adminOnly = false, staffOnly = false, customerOnly = false }) => {
    const { user, loading, hasClaim } = useAuth();

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '80px', color: '#7f8c8d' }}>
                <p>Dang kiem tra quyen truy cap...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Chi admin moi vao duoc
    if (adminOnly && user.role !== 'admin') {
        return user.role === 'staff'
            ? <Navigate to="/barber" replace />
            : <Navigate to="/" replace />;
    }

    // Chi staff moi vao duoc
    if (staffOnly && user.role !== 'staff') {
        return user.role === 'admin'
            ? <Navigate to="/admin" replace />
            : <Navigate to="/" replace />;
    }

    // Chi customer moi vao duoc
    if (customerOnly && user.role !== 'customer') {
        return user.role === 'admin'
            ? <Navigate to="/admin" replace />
            : <Navigate to="/barber" replace />;
    }

    // Da dang nhap nhung thieu claim can thiet
    if (requiredClaim && !hasClaim(requiredClaim)) {
        return (
            <div style={{
                textAlign: 'center',
                marginTop: '80px',
                padding: '40px',
                background: '#fff5f5',
                borderRadius: '8px',
                maxWidth: '500px',
                margin: '80px auto',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
                <h2 style={{ color: '#c0392b', marginBottom: '12px' }}>Khong co quyen truy cap</h2>
                <p style={{ color: '#7f8c8d', marginBottom: '8px' }}>
                    Tai khoan cua ban (<strong>{user.role}</strong>) khong co quyen:
                </p>
                <code style={{
                    display: 'inline-block',
                    background: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    padding: '4px 12px',
                    color: '#e74c3c',
                    marginBottom: '24px'
                }}>
                    {requiredClaim}
                </code>
                <br />
                <Link to="/" style={{ color: '#3498db', textDecoration: 'none' }}>
                    ← Ve trang chu
                </Link>
            </div>
        );
    }

    return children;
};

export default PrivateRoute;
