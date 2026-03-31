import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { bookingAPI, productOrderAPI } from '../../api/apiService';
import '../../styles/pages/admin/AdminLayout.css';

const AdminRevenuePage = () => {
    const [bookings, setBookings] = useState([]);
    const [productOrders, setProductOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const getLocalToday = () => {
        const d = new Date();
        const p = n => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    };
    const [selectedDate, setSelectedDate] = useState(getLocalToday());

    useEffect(() => {
        setLoading(true);
        Promise.all([
            bookingAPI.getAll({}),
            productOrderAPI.getAll()
        ])
        .then(([resBookings, resOrders]) => {
            setBookings(resBookings.bookings || []);
            setProductOrders(resOrders.orders || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, []);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatTime = (datetime) => 
        new Date(datetime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

    // Revenue calculations
    const revenueDate = new Date(selectedDate);
    const startOfDay = new Date(revenueDate.getFullYear(), revenueDate.getMonth(), revenueDate.getDate());
    
    // Start of week (Monday)
    const dayOfWeek = revenueDate.getDay() || 7; 
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - dayOfWeek + 1);
    
    // Start of month
    const startOfMonth = new Date(revenueDate.getFullYear(), revenueDate.getMonth(), 1);

    // Get completed bookings and orders
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const completedOrders = productOrders.filter(o => o.status === 'Completed');

    // Combine them into a single timeline mapped to standardized fields for easy math
    const allTransactions = [
        ...completedBookings.map(b => ({
            id: `booking-${b.id}`,
            type: 'Service',
            title: `Cắt tóc - ${b.user?.fullName || 'Khách vãng lai'}`,
            amount: parseFloat(b.totalPrice || 0),
            date: new Date(b.startTime)
        })),
        ...completedOrders.map(o => ({
            id: `order-${o.id}`,
            type: 'Product',
            title: `Mua SP - ${o.customerName}`,
            amount: parseFloat(o.totalPrice || 0),
            date: new Date(o.createdAt || o.orderDate)
        }))
    ].sort((a, b) => b.date - a.date);

    // Compute metrics
    const calculateSum = (dataArray, start, end) => {
        return dataArray
            .filter(t => t.date >= start && t.date < end)
            .reduce((sum, t) => sum + t.amount, 0);
    };

    const nextDay = new Date(startOfDay.getTime() + 86400000);
    const nextWeek = new Date(startOfWeek.getTime() + 7 * 86400000);
    const nextMonth = new Date(revenueDate.getFullYear(), revenueDate.getMonth() + 1, 1);
    const startOfYear = new Date(revenueDate.getFullYear(), 0, 1);
    const nextYear = new Date(revenueDate.getFullYear() + 1, 0, 1);

    const revenues = {
        day: calculateSum(allTransactions, startOfDay, nextDay),
        week: calculateSum(allTransactions, startOfWeek, nextWeek),
        month: calculateSum(allTransactions, startOfMonth, nextMonth),
        year: calculateSum(allTransactions, startOfYear, nextYear)
    };

    const isToday = selectedDate === getLocalToday();
    const labelDay = isToday ? 'Hôm nay' : `Ngày ${selectedDate.split('-').reverse().join('/')}`;
    const labelWeek = isToday ? 'Tuần này' : 'Tuần đã chọn';
    const labelMonth = isToday ? 'Tháng này' : `Tháng ${revenueDate.getMonth() + 1}`;
    const labelYear = isToday ? 'Năm nay' : `Năm ${revenueDate.getFullYear()}`;

    // Get transactions just for the selected day
    const dailyTransactions = allTransactions.filter(t => t.date >= startOfDay && t.date < nextDay);

    // Revenue by Barber across all periods (Day/Week/Month/Year)
    const allBarberNames = [...new Set(completedBookings.map(b => b.barber?.name || 'Không xác định'))];
    const barberRevenueTable = allBarberNames.map(name => {
        const barberBookings = completedBookings.filter(b => (b.barber?.name || 'Không xác định') === name);
        return {
            name,
            day:   barberBookings.filter(b => new Date(b.startTime) >= startOfDay  && new Date(b.startTime) < nextDay)  .reduce((s, b) => s + parseFloat(b.totalPrice || 0), 0),
            week:  barberBookings.filter(b => new Date(b.startTime) >= startOfWeek && new Date(b.startTime) < nextWeek) .reduce((s, b) => s + parseFloat(b.totalPrice || 0), 0),
            month: barberBookings.filter(b => new Date(b.startTime) >= startOfMonth && new Date(b.startTime) < nextMonth).reduce((s, b) => s + parseFloat(b.totalPrice || 0), 0),
            year:  barberBookings.filter(b => new Date(b.startTime) >= startOfYear && new Date(b.startTime) < nextYear) .reduce((s, b) => s + parseFloat(b.totalPrice || 0), 0),
        };
    }).sort((a, b) => b.month - a.month);

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <div>
                    <h1>Quản lý Doanh Thu</h1>
                    <p>Theo dõi tổng doanh thu từ Dịch vụ và Sản phẩm</p>
                </div>
            </div>

            {loading ? (
                <div className="admin-loading">Đang tải dữ liệu...</div>
            ) : (
                <>
                    <div className="admin-card" style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>Thống Kê Tổng Quan</h2>
                            <input 
                                type="date" 
                                value={selectedDate} 
                                onChange={e => setSelectedDate(e.target.value)}
                                style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', background: '#f8f9fb' }}
                            />
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card" style={{ borderLeft: '4px solid #4caf50' }}>
                                <div className="stat-info" style={{ width: '100%' }}>
                                    <div className="stat-label" style={{ marginBottom: '8px' }}>{labelDay}</div>
                                    <div className="stat-value" style={{ color: '#4caf50', fontSize: '1.6rem' }}>{formatCurrency(revenues.day)}</div>
                                </div>
                            </div>
                            <div className="stat-card" style={{ borderLeft: '4px solid #00acc1' }}>
                                <div className="stat-info" style={{ width: '100%' }}>
                                    <div className="stat-label" style={{ marginBottom: '8px' }}>{labelWeek}</div>
                                    <div className="stat-value" style={{ color: '#00acc1', fontSize: '1.6rem' }}>{formatCurrency(revenues.week)}</div>
                                </div>
                            </div>
                            <div className="stat-card" style={{ borderLeft: '4px solid #3f51b5' }}>
                                <div className="stat-info" style={{ width: '100%' }}>
                                    <div className="stat-label" style={{ marginBottom: '8px' }}>{labelMonth}</div>
                                    <div className="stat-value" style={{ color: '#3f51b5', fontSize: '1.6rem' }}>{formatCurrency(revenues.month)}</div>
                                </div>
                            </div>
                            <div className="stat-card" style={{ borderLeft: '4px solid #9c27b0' }}>
                                <div className="stat-info" style={{ width: '100%' }}>
                                    <div className="stat-label" style={{ marginBottom: '8px' }}>{labelYear}</div>
                                    <div className="stat-value" style={{ color: '#9c27b0', fontSize: '1.6rem' }}>{formatCurrency(revenues.year)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card">
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '16px' }}>
                            🧾 Giao dịch chi tiết ({labelDay})
                        </h2>
                        {dailyTransactions.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📄</div>
                                <p>Không có giao dịch thành công nào trong ngày này.</p>
                            </div>
                        ) : (
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Thời gian</th>
                                            <th>Loại</th>
                                            <th>Khách hàng / Mô tả</th>
                                            <th>Số tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dailyTransactions.map(t => (
                                            <tr key={t.id}>
                                                <td style={{ fontWeight: 600 }}>{formatTime(t.date)}</td>
                                                <td>
                                                    <span className={`badge ${t.type === 'Service' ? 'badge-confirmed' : 'badge-pending'}`} style={{ backgroundColor: t.type === 'Service' ? '#e3f2fd' : '#fce4ec', color: t.type === 'Service' ? '#1565c0' : '#c2185b' }}>
                                                        {t.type === 'Service' ? 'DỊCH VỤ' : 'SẢN PHẨM'}
                                                    </span>
                                                </td>
                                                <td>{t.title}</td>
                                                <td style={{ fontWeight: 800, color: '#2e7d32' }}>+{formatCurrency(t.amount)}</td>
                                            </tr>
                                        ))}
                                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                                            <td colSpan="3" style={{ textAlign: 'right', fontWeight: 800 }}>TỔNG CỘNG ({dailyTransactions.length} giao dịch):</td>
                                            <td style={{ fontWeight: 900, fontSize: '1.1rem', color: '#1b3a2d' }}>{formatCurrency(revenues.day)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Doanh thu theo Thợ */}
                    <div className="admin-card" style={{ marginTop: '24px' }}>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '16px' }}>
                            👨‍💼 Doanh thu theo Thợ
                        </h2>
                        {barberRevenueTable.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">👨‍💼</div>
                                <p>Chưa có dữ liệu lịch hẹn đã hoàn thành.</p>
                            </div>
                        ) : (
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Tên thợ</th>
                                            <th style={{ textAlign: 'right', color: '#4caf50' }}>{labelDay}</th>
                                            <th style={{ textAlign: 'right', color: '#00acc1' }}>{labelWeek}</th>
                                            <th style={{ textAlign: 'right', color: '#3f51b5' }}>{labelMonth}</th>
                                            <th style={{ textAlign: 'right', color: '#9c27b0' }}>{labelYear}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {barberRevenueTable.map((row, idx) => (
                                            <tr key={row.name}>
                                                <td>
                                                    <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>
                                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}
                                                    </span>
                                                    <strong>{row.name}</strong>
                                                </td>
                                                <td style={{ textAlign: 'right', color: row.day > 0 ? '#4caf50' : '#aaa', fontWeight: row.day > 0 ? 700 : 400 }}>
                                                    {row.day > 0 ? formatCurrency(row.day) : '—'}
                                                </td>
                                                <td style={{ textAlign: 'right', color: row.week > 0 ? '#00acc1' : '#aaa', fontWeight: row.week > 0 ? 700 : 400 }}>
                                                    {row.week > 0 ? formatCurrency(row.week) : '—'}
                                                </td>
                                                <td style={{ textAlign: 'right', color: row.month > 0 ? '#3f51b5' : '#aaa', fontWeight: row.month > 0 ? 700 : 400 }}>
                                                    {row.month > 0 ? formatCurrency(row.month) : '—'}
                                                </td>
                                                <td style={{ textAlign: 'right', color: row.year > 0 ? '#9c27b0' : '#aaa', fontWeight: row.year > 0 ? 700 : 400 }}>
                                                    {row.year > 0 ? formatCurrency(row.year) : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </AdminLayout>
    );
};

export default AdminRevenuePage;
