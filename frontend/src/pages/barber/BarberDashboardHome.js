import React, { useState, useEffect } from 'react';
import BarberLayout from './BarberLayout';
import { barberAPI, bookingAPI } from '../../api/apiService';
import './BarberLayout.css';

const BarberDashboardHome = () => {
    const [barberInfo, setBarberInfo] = useState(null);
    const [todaySchedule, setTodaySchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setLoading(true);
        barberAPI.getMySchedule(today)
            .then(data => {
                setBarberInfo(data.barber);
                setTodaySchedule(data.schedule || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const statusCount = {
        pending: todaySchedule.filter(b => b.status === 'pending').length,
        confirmed: todaySchedule.filter(b => b.status === 'confirmed').length,
        completed: todaySchedule.filter(b => b.status === 'completed').length,
        cancelled: todaySchedule.filter(b => b.status === 'cancelled').length,
    };

    const todayRevenue = todaySchedule
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + parseFloat(b.totalPrice || 0), 0);

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

    const upcoming = todaySchedule
        .filter(b => b.status !== 'cancelled' && new Date(b.endTime) > currentTime)
        .slice(0, 6);

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            await bookingAPI.updateStatus(bookingId, newStatus);
            const today = new Date().toISOString().split('T')[0];
            const data = await barberAPI.getMySchedule(today);
            setTodaySchedule(data.schedule || []);
        } catch (err) {
            alert('Cập nhật thất bại: ' + err.message);
        }
    };

    const today = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <BarberLayout>
            <div className="barber-page-header">
                <div>
                    <h1>Tổng quan</h1>
                    <p>{today}</p>
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
                    {/* Stats */}
                    <div className="barber-stat-grid">
                        <div className="barber-stat-card yellow">
                            <div className="barber-stat-label">Chờ xác nhận</div>
                            <div className="barber-stat-value">{statusCount.pending}</div>
                            <div className="barber-stat-sub">lịch hẹn hôm nay</div>
                        </div>
                        <div className="barber-stat-card blue">
                            <div className="barber-stat-label">Đã xác nhận</div>
                            <div className="barber-stat-value">{statusCount.confirmed}</div>
                            <div className="barber-stat-sub">lịch hẹn hôm nay</div>
                        </div>
                        <div className="barber-stat-card green">
                            <div className="barber-stat-label">Hoàn thành</div>
                            <div className="barber-stat-value">{statusCount.completed}</div>
                            <div className="barber-stat-sub">lịch hẹn hôm nay</div>
                        </div>
                        <div className="barber-stat-card green">
                            <div className="barber-stat-label">Doanh thu hôm nay</div>
                            <div className="barber-stat-value" style={{ fontSize: '1.2rem' }}>{formatCurrency(todayRevenue)}</div>
                            <div className="barber-stat-sub">từ {statusCount.completed} lịch hoàn thành</div>
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
