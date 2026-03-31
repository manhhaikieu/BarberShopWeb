import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CLAIMS } from '../data/mockData';
import '../styles/components/Layout.css';

const Layout = ({ children }) => {
    const { user, logout, hasClaim } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="layout-wrapper">
            {/* Top Bar for Slogan */}
            <div className="top-bar">
                HKT BARBER SHOP - FROM HEART TO HAIR!
            </div>

            <header className="main-header">
                <div className="logo-section">
                    {/* Placeholder for Logo Image, using Text for now but styled */}
                    <Link to="/" className="logo-text">
                        <span className="logo-icon">✂️</span>
                        <div className="brand-name">
                            <span>HKT</span>
                            <span className="sub">Barber Shop</span>
                        </div>
                    </Link>
                </div>

                <nav className="main-nav">
                    <Link to="/" className={isActive('/')}>Home</Link>
                    <Link to="/booking" className={isActive('/booking')}>Đặt Lịch</Link>

                    {/* Admin/Staff Links (Hidden for Customers) */}
                    {hasClaim(CLAIMS.MANAGE_PRODUCTS) && (
                        <Link to="/products" className={isActive('/products')}>Sản Phẩm</Link>
                    )}

                    {hasClaim(CLAIMS.MANAGE_STAFF) && (
                        <Link to="/staff" className={isActive('/staff')}>Thợ</Link>
                    )}

                    {/* User State */}
                    {user ? (
                        <span className="nav-user-action" onClick={handleLogout}>
                            Logout ({user.name})
                        </span>
                    ) : (
                        <Link to="/login" className="nav-user-action">Login</Link>
                    )}
                </nav>
            </header>

            <main className="main-content-wrapper">
                {children}
            </main>

            <footer className="main-footer">
                <div className="footer-content section-container">
                    <div className="footer-col">
                        <h3>GIỜ LÀM VIỆC</h3>
                        <p>Thứ 2: 9:00am – 5pm</p>
                        <p>Thứ 3 – CN: 9:00am – 8:00pm</p>
                        <p>hktbarbershopvn@gmail.com</p>
                    </div>
                    <div className="footer-col center">
                        <h2>FOLLOW US</h2>
                        <div className="social-links">
                            <span>FB</span>
                            <span>TK</span>
                            <span>YT</span>
                            <span>IG</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
