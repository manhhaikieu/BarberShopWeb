import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <span className="admin-sidebar-icon">✂️</span>
                    <div>
                        <div className="admin-sidebar-title">HKT Barber</div>
                        <div className="admin-sidebar-subtitle">Admin Panel</div>
                    </div>
                </div>

                <nav className="admin-nav">
                    <NavLink to="/admin" end className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="nav-icon">📊</span> Dashboard
                    </NavLink>
                    <NavLink to="/admin/barbers" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="nav-icon">👨‍💼</span> Quản lý Thợ
                    </NavLink>
                    <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="nav-icon">📦</span> Quản lý Sản phẩm
                    </NavLink>
                    <NavLink to="/admin/services" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="nav-icon">✂️</span> Quản lý Dịch vụ
                    </NavLink>
                    <NavLink to="/admin/chairs" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="nav-icon">💺</span> Quản lý Ghế
                    </NavLink>
                    <NavLink to="/admin/bookings" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="nav-icon">📅</span> Quản lý Lịch hẹn
                    </NavLink>

                    <div className="admin-nav-divider" />

                    <NavLink to="/" className="admin-nav-item">
                        <span className="nav-icon">🏠</span> Trang chủ
                    </NavLink>
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-user-info">
                        <div className="admin-user-avatar">{user?.fullName?.[0] || user?.username?.[0] || 'A'}</div>
                        <div>
                            <div className="admin-user-name">{user?.fullName || user?.username}</div>
                            <div className="admin-user-role">{user?.role}</div>
                        </div>
                    </div>
                    <button className="admin-logout-btn" onClick={handleLogout}>Đăng xuất</button>
                </div>
            </aside>

            <main className="admin-main">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
