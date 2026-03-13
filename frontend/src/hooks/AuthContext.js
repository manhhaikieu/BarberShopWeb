import React, { createContext, useContext, useState, useEffect } from 'react';
import { USERS } from '../api/mockData';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check local storage for persisted session
        const storedUser = localStorage.getItem('barber_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (username, password) => {
        const foundUser = USERS.find(
            (u) => u.username === username && u.password === password
        );

        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('barber_user', JSON.stringify(foundUser));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('barber_user');
    };

    const hasClaim = (claim) => {
        if (!user || !user.claims) return false;
        return user.claims.includes(claim);
    };

    const hasRole = (role) => {
        if (!user) return false;
        return user.role === role;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, hasClaim, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};
