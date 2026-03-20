import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

/**
 * Claim-based Route Guard
 * - Chua dang nhap      → redirect /login
 * - Dang nhap nhung thieu claim → hien 403 Access Denied
 * - Co claim            → render children
 */
const PrivateRoute = ({ children, requiredClaim }) => {
    const { user, loading, hasClaim } = useAuth();

    // Doi AuthContext kiem tra localStorage xong moi quyet dinh
    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '80px', color: '#7f8c8d' }}>
                <p>Dang kiem tra quyen truy cap...</p>
            </div>
        );
    }

    // Chua dang nhap
    if (!user) {
        return <Navigate to="/login" replace />;
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
