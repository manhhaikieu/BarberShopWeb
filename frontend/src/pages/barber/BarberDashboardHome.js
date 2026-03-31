import React, { useState, useEffect } from 'react';
import BarberLayout from './BarberLayout';
import { barberAPI, bookingAPI } from '../../api/apiService';
import '../../styles/pages/barber/BarberLayout.css';

const BarberDashboardHome = () => {
    const [barberInfo, setBarberInfo] = useState(null);
    const [todaySchedule, setTodaySchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    const getLocalToday = () => {
        const d = new Date();
        const p = n => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    };

    const [selectedDate, setSelectedDate] = useState(getLocalToday());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        setLoading(true);
        barberAPI.getMySchedule('')
            .then(data => {
                setBarberInfo(data.barber);
                setTodaySchedule(data.schedule || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Filter today's schedule for the tables and daily stats
    const todayStr = getLocalToday();
    const todaysBookings = todaySchedule.filter(b => b.startTime.startsWith(todayStr));

    const statusCount = {
        pending: todaysBookings.filter(b => b.status === 'pending').length,
        confirmed: todaysBookings.filter(b => b.status === 'confirmed').length,
        completed: todaysBookings.filter(b => b.status === 'completed').length,
        cancelled: todaysBookings.filter(b => b.status === 'cancelled').length,
    };

    // Revenue calculations
    const revenueDate = new Date(selectedDate);
    const startOfDay = new Date(revenueDate.getFullYear(), revenueDate.getMonth(), revenueDate.getDate());
    
    // Start of week (Monday)
    const dayOfWeek = revenueDate.getDay() || 7; 
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - dayOfWeek + 1);
    
    // Start of month
    const startOfMonth = new Date(revenueDate.getFullYear(), revenueDate.getMonth(), 1);
    
    // Start of year
    const startOfYear = new Date(revenueDate.getFullYear(), 0, 1);

    const completedBookings = todaySchedule.filter(b => b.status === 'completed');

    const revenues = {
        day: completedBookings
            .filter(b => new Date(b.startTime) >= startOfDay && new Date(b.startTime) < new Date(startOfDay.getTime() + 86400000))
            .reduce((sum, b) => sum + parseFloat(b.totalPrice || 0), 0),
        week: completedBookings
            .filter(b => new Date(b.startTime) >= startOfWeek && new Date(b.startTime) < new Date(startOfWeek.getTime() + 7 * 86400000))
            .reduce((sum, b) => sum + parseFloat(b.totalPrice || 0), 0),
        month: completedBookings
            .filter(b => new Date(b.startTime).getMonth() === revenueDate.getMonth() && new Date(b.startTime).getFullYear() === revenueDate.getFullYear())
            .reduce((sum, b) => sum + parseFloat(b.totalPrice || 0), 0),
        year: completedBookings
            .filter(b => new Date(b.startTime).getFullYear() === revenueDate.getFullYear())
            .reduce((sum, b) => sum + parseFloat(b.totalPrice || 0), 0)
    };

    const isToday = selectedDate === todayStr;
    const labelDay = isToday ? 'Hôm nay' : `Ngày ${selectedDate.split('-').reverse().join('/')}`;
    const labelWeek = isToday ? 'Tuần này' : 'Tuần chọn';
    const labelMonth = isToday ? 'Tháng này' : `Tháng ${revenueDate.getMonth() + 1}`;
    const labelYear = isToday ? 'Năm nay' : `Năm ${revenueDate.getFullYear()}`;

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatTime = (dt) =>
        new Date(dt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const isCurrentBooking = (start, end) =>
        currentTime >= new Date(start) && currentTime <= new Date(end);

    const isComingSoon = (start) => {
        const diff = new Date(start) - currentTime;
        return diff > 0 && diff <= 10 * 60 * 1000;
    };

    const upcoming = todaysBookings
        .filter(b => b.status !== 'cancelled' && new Date(b.endTime) > currentTime)
        .slice(0, 6);

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            await bookingAPI.updateStatus(bookingId, newStatus);
            const data = await barberAPI.getMySchedule('');
            setTodaySchedule(data.schedule || []);
        } catch (err) {
            alert('Cập nhật thất bại: ' + err.message);
        }
    };

    const todayDateFormatted = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <BarberLayout>
            <div className="barber-page-header">
                <div>
                    <h1>Tổng quan</h1>
                    <p>{todayDateFormatted}</p>
                </div>
                {barberInfo && (
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                        Thợ: <strong style={{ color: '#1b3a2d' }}>{barberInfo.name}</strong>
                        {barberInfo.chair && <> &nbsp;·&nbsp; Ghế: <strong style={{ color: '#1b3a2d' }}>{barberInfo.chair.name}</strong></>}
                    </div>
                )}
            </div>

            {loading ? (
                <p style={{ color: '#9ca3af' }}>Đang tải dữ liệu...</p>
            ) : (
                <>
                    {/* Status Stats (Today) */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h2 style={{ fontSize: '1.05rem', margin: 0, color: '#1b3a2d' }}>Lịch hẹn hôm nay</h2>
                    </div>
                    <div className="barber-stat-grid" style={{ marginBottom: '24px' }}>
                        <div className="barber-stat-card yellow">
                            <div className="barber-stat-label">Chờ xác nhận</div>
                            <div className="barber-stat-value">{statusCount.pending}</div>
                        </div>
                        <div className="barber-stat-card blue">
                            <div className="barber-stat-label">Đã xác nhận</div>
                            <div className="barber-stat-value">{statusCount.confirmed}</div>
                        </div>
                        <div className="barber-stat-card green">
                            <div className="barber-stat-label">Hoàn thành</div>
                            <div className="barber-stat-value">{statusCount.completed}</div>
                        </div>
                        <div className="barber-stat-card red">
                            <div className="barber-stat-label">Đã hủy</div>
                            <div className="barber-stat-value">{statusCount.cancelled}</div>
                        </div>
                    </div>

                    {/* Revenue Stats */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                        <h2 style={{ fontSize: '1.05rem', margin: 0, color: '#1b3a2d' }}>Doanh thu</h2>
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={e => setSelectedDate(e.target.value)}
                            style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                        />
                    </div>
                    <div className="barber-stat-grid" style={{ marginBottom: '28px' }}>
                        <div className="barber-stat-card" style={{ borderLeftColor: '#4caf7d' }}>
                            <div className="barber-stat-label">{labelDay}</div>
                            <div className="barber-stat-value" style={{ fontSize: '1.25rem', color: '#10b981' }}>{formatCurrency(revenues.day)}</div>
                        </div>
                        <div className="barber-stat-card" style={{ borderLeftColor: '#4caf7d' }}>
                            <div className="barber-stat-label">{labelWeek}</div>
                            <div className="barber-stat-value" style={{ fontSize: '1.25rem', color: '#10b981' }}>{formatCurrency(revenues.week)}</div>
                        </div>
                        <div className="barber-stat-card" style={{ borderLeftColor: '#4caf7d' }}>
                            <div className="barber-stat-label">{labelMonth}</div>
                            <div className="barber-stat-value" style={{ fontSize: '1.25rem', color: '#10b981' }}>{formatCurrency(revenues.month)}</div>
                        </div>
                        <div className="barber-stat-card" style={{ borderLeftColor: '#4caf7d' }}>
                            <div className="barber-stat-label">{labelYear}</div>
                            <div className="barber-stat-value" style={{ fontSize: '1.25rem', color: '#10b981' }}>{formatCurrency(revenues.year)}</div>
                        </div>
                    </div>

                    {/* Upcoming bookings */}
                    <div className="barber-card">
                        <h2>📋 Lịch sắp tới hôm nay</h2>
                        {upcoming.length === 0 ? (
                            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>
                                Không có lịch hẹn nào sắp tới.
                            </p>
                        ) : (
                            <table className="barber-table">
                                <thead>
                                    <tr>
                                        <th>Giờ</th>
                                        <th>Khách hàng</th>
                                        <th>Dịch vụ</th>
                                        <th>Trạng thái</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcoming.map(b => {
                                        let rowClass = '';
                                        if (isCurrentBooking(b.startTime, b.endTime)) rowClass = 'row-active';
                                        else if (isComingSoon(b.startTime)) rowClass = 'row-soon';
                                        return (
                                            <tr key={b.id} className={rowClass}>
                                                <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                    {formatTime(b.startTime)} – {formatTime(b.endTime)}
                                                </td>
                                                <td>{b.user?.fullName || 'Khách vãng lai'}</td>
                                                <td>
                                                    {b.services?.map(s => s.name).join(', ') || '—'}
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${b.status}`}>
                                                        {{ pending: 'Chờ XN', confirmed: 'Đã XN', completed: 'Hoàn thành', cancelled: 'Đã hủy' }[b.status]}
                                                    </span>
                                                </td>
                                                <td>
                                                    {b.status === 'pending' && (
                                                        <button className="btn-confirm" onClick={() => handleStatusUpdate(b.id, 'confirmed')}>Xác nhận</button>
                                                    )}
                                                    {(b.status === 'pending' || b.status === 'confirmed') && (
                                                        <button className="btn-complete" onClick={() => handleStatusUpdate(b.id, 'completed')}>Hoàn thành</button>
                                                    )}
                                                    {b.status !== 'cancelled' && b.status !== 'completed' && (
                                                        <button className="btn-cancel-sm" onClick={() => handleStatusUpdate(b.id, 'cancelled')}>Hủy</button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </BarberLayout>
    );
};

export default BarberDashboardHome;
