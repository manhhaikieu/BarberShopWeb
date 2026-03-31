import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useData } from '../../hooks/DataContext';
import { bookingAPI } from '../../api/apiService';
import '../../styles/pages/admin/AdminLayout.css';

const AdminDashboard = () => {
    const { barbers, products, services, chairs } = useData();
    const [todayBookings, setTodayBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);

    useEffect(() => {
        const d = new Date();
        const p = n => n.toString().padStart(2, '0');
        const today = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
        bookingAPI.getAll({ date: today })
            .then(res => setTodayBookings(res.bookings || []))
            .catch(console.error)
            .finally(() => setLoadingBookings(false));
    }, []);

    const statusCount = {
        pending: todayBookings.filter(b => b.status === 'pending').length,
        confirmed: todayBookings.filter(b => b.status === 'confirmed').length,
        completed: todayBookings.filter(b => b.status === 'completed').length,
        cancelled: todayBookings.filter(b => b.status === 'cancelled').length,
    };

    const todayRevenue = todayBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + parseFloat(b.totalPrice || 0), 0);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatTime = (datetime) =>
        new Date(datetime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const now = new Date();
    const upcomingBookings = todayBookings
        .filter(b => b.status !== 'cancelled' && new Date(b.endTime) > now)
        .slice(0, 8);

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Tổng quan hoạt động ngày {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon green">📅</div>
                    <div className="stat-info">
                        <div className="stat-value">{todayBookings.length}</div>
                        <div className="stat-label">Lịch hẹn hôm nay</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon gold">💰</div>
                    <div className="stat-info">
                        <div className="stat-value">{formatCurrency(todayRevenue)}</div>
                        <div className="stat-label">Doanh thu hôm nay</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">👨‍💼</div>
                    <div className="stat-info">
                        <div className="stat-value">{barbers.length}</div>
                        <div className="stat-label">Thợ cắt tóc</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">📦</div>
                    <div className="stat-info">
                        <div className="stat-value">{products.length}</div>
                        <div className="stat-label">Sản phẩm</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">✂️</div>
                    <div className="stat-info">
                        <div className="stat-value">{services.length}</div>
                        <div className="stat-label">Dịch vụ</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">💺</div>
                    <div className="stat-info">
                        <div className="stat-value">{chairs.length}</div>
                        <div className="stat-label">Ghế hoạt động</div>
                    </div>
                </div>
            </div>

            {/* Booking status summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                {[
                    { label: 'Chờ xác nhận', count: statusCount.pending, color: '#856404', bg: '#fff3cd' },
                    { label: 'Đã xác nhận', count: statusCount.confirmed, color: '#0c5460', bg: '#d1ecf1' },
                    { label: 'Hoàn thành', count: statusCount.completed, color: '#155724', bg: '#d4edda' },
                    { label: 'Đã hủy', count: statusCount.cancelled, color: '#721c24', bg: '#f8d7da' },
                ].map(item => (
                    <div key={item.label} className="admin-card" style={{ textAlign: 'center', padding: '16px', background: item.bg, boxShadow: 'none', margin: 0 }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: item.color }}>{item.count}</div>
                        <div style={{ fontSize: '0.8rem', color: item.color, fontWeight: 600, marginTop: 4 }}>{item.label}</div>
                    </div>
                ))}
            </div>

            {/* Upcoming bookings today */}
            <div className="admin-card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e' }}>📋 Lịch hẹn hôm nay</h2>
                    <Link to="/admin/bookings" style={{ color: '#d4af37', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                        Xem tất cả →
                    </Link>
                </div>
                {loadingBookings ? (
                    <div className="admin-loading">Đang tải...</div>
                ) : upcomingBookings.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📅</div>
                        <p>Không có lịch hẹn nào hôm nay</p>
                    </div>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Giờ</th>
                                    <th>Khách hàng</th>
                                    <th>Thợ</th>
                                    <th>Ghế</th>
                                    <th>Dịch vụ</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingBookings.map(b => {
                                    const isNow = new Date(b.startTime) <= now && new Date(b.endTime) > now;
                                    return (
                                        <tr key={b.id} style={isNow ? { background: 'rgba(212,175,55,0.08)' } : {}}>
                                            <td>
                                                {isNow && <span style={{ color: '#d4af37', marginRight: '4px' }}>🔴</span>}
                                                {formatTime(b.startTime)}–{formatTime(b.endTime)}
                                            </td>
                                            <td>{b.user?.fullName || b.user?.username || '—'}</td>
                                            <td>{b.barber?.name || '—'}</td>
                                            <td>{b.chair?.name || '—'}</td>
                                            <td>{b.services?.map(s => s.name).join(', ') || '—'}</td>
                                            <td>{formatCurrency(b.totalPrice)}</td>
                                            <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick links */}
            <div className="admin-card">
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '16px' }}>⚡ Truy cập nhanh</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                    {[
                        { to: '/admin/revenue', label: 'Quản lý Doanh thu', icon: '💰' },
                        { to: '/admin/barbers', label: 'Quản lý Thợ', icon: '👨‍💼' },
                        { to: '/admin/products', label: 'Quản lý Sản phẩm', icon: '📦' },
                        { to: '/admin/product-orders', label: 'Quản lý Đơn hàng', icon: '🛒' },
                        { to: '/admin/services', label: 'Quản lý Dịch vụ', icon: '✂️' },
                        { to: '/admin/chairs', label: 'Quản lý Ghế', icon: '💺' },
                        { to: '/admin/bookings', label: 'Quản lý Lịch hẹn', icon: '📅' },
                    ].map(item => (
                        <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
                            <div style={{
                                padding: '16px',
                                background: '#f8f9fb',
                                borderRadius: '10px',
                                textAlign: 'center',
                                transition: 'all 0.2s',
                                border: '1px solid #e9ecef',
                                cursor: 'pointer',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = '#fff3cd'}
                                onMouseLeave={e => e.currentTarget.style.background = '#f8f9fb'}
                            >
                                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{item.icon}</div>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1a1a2e' }}>{item.label}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
