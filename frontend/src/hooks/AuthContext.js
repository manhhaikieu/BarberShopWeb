import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/apiService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('barber_user');
        const storedToken = localStorage.getItem('barber_token');
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const data = await authAPI.login(email, password);
        setUser(data.user);
        localStorage.setItem('barber_user', JSON.stringify(data.user));
        localStorage.setItem('barber_token', data.token);
        return data.user;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('barber_user');
        localStorage.removeItem('barber_token');
    };

    const hasClaim = (claim) => {
        if (!user || !user.permissions) return false;
        return user.permissions.includes(claim);
    };

    const hasRole = (role) => {
        if (!user) return false;
        return user.role === role.toLowerCase();
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, hasClaim, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};