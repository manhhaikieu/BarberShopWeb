import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

const PrivateRoute = ({ children, requiredClaim }) => {
    const { user, hasClaim } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredClaim && !hasClaim(requiredClaim)) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Access Denied</h2>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    return children;
};

export default PrivateRoute;
