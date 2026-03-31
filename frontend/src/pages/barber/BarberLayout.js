import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import '../../styles/pages/barber/BarberLayout.css';

const BarberLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="barber-layout">
            <aside className="barber-sidebar">
                <div className="barber-sidebar-header">
                    <span className="barber-sidebar-icon">✂️</span>
                    <div>
                        <div className="barber-sidebar-title">HKT Barber</div>
                        <div className="barber-sidebar-subtitle">Barber Panel</div>
                    </div>
                </div>

                <nav className="barber-nav">
                    <NavLink to="/barber" end className={({ isActive }) => isActive ? 'barber-nav-item active' : 'barber-nav-item'}>
                        <span className="barber-nav-icon">📊</span> Tổng quan
                    </NavLink>
                    <NavLink to="/barber/schedule" className={({ isActive }) => isActive ? 'barber-nav-item active' : 'barber-nav-item'}>
                        <span className="barber-nav-icon">📅</span> Lịch hẹn của tôi
                    </NavLink>
                    <NavLink to="/barber/profile" className={({ isActive }) => isActive ? 'barber-nav-item active' : 'barber-nav-item'}>
                        <span className="barber-nav-icon">👤</span> Hồ sơ của tôi
                    </NavLink>
                </nav>

                <div className="barber-sidebar-footer">
                    <div className="barber-user-info">
                        <div className="barber-user-avatar">
                            {user?.fullName?.[0] || user?.username?.[0] || 'B'}
                        </div>
                        <div>
                            <div className="barber-user-name">{user?.fullName || user?.username}</div>
                            <div className="barber-user-role">{user?.role}</div>
                        </div>
                    </div>
                    <button className="barber-logout-btn" onClick={handleLogout}>Đăng xuất</button>
                </div>
            </aside>

            <main className="barber-main">
                {children}
            </main>
        </div>
    );
};

export default BarberLayout;
