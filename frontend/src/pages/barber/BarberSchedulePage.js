import React, { useState, useEffect, useCallback } from 'react';
import BarberLayout from './BarberLayout';
import { barberAPI, bookingAPI } from '../../api/apiService';
import './BarberLayout.css';

const STATUS_LABELS = { pending: 'Chờ XN', confirmed: 'Đã XN', completed: 'Hoàn thành', cancelled: 'Đã hủy' };

const BarberSchedulePage = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [schedule, setSchedule] = useState([]);
    const [barberInfo, setBarberInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await barberAPI.getMySchedule(date);
            setBarberInfo(data.barber);
            setSchedule(data.schedule || []);
        } catch (err) {
            setError(err.message || 'Không thể tải lịch trình.');
        } finally {
            setLoading(false);
        }
    }, [date]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            await bookingAPI.updateStatus(bookingId, newStatus);
            fetchSchedule();
        } catch (err) {
            alert('Cập nhật thất bại: ' + err.message);
        }
    };

    const isCurrentBooking = (start, end) =>
        currentTime >= new Date(start) && currentTime <= new Date(end);

    const isComingSoon = (start) => {
        const diff = new Date(start) - currentTime;
        return diff > 0 && diff <= 10 * 60 * 1000;
    };

    const formatTime = (dt) =>
        new Date(dt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const totalRevenue = schedule
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + parseFloat(b.totalPrice || 0), 0);

    const goToday = () => setDate(new Date().toISOString().split('T')[0]);

    const changeDay = (offset) => {
        const d = new Date(date);
        d.setDate(d.getDate() + offset);
        setDate(d.toISOString().split('T')[0]);
    };

    return (
        <BarberLayout>
            <div className="barber-page-header">
                <div>
                    <h1>Lịch hẹn của tôi</h1>
                    <p>
                        {barberInfo?.name && <><strong>{barberInfo.name}</strong> &nbsp;·&nbsp; </>}
                        {new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Date navigation & Stats */}
            <div className="date-toolbar" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button className="btn-refresh" onClick={() => changeDay(-1)}>◀ Hôm trước</button>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                    />
                    <button className="btn-refresh" onClick={() => changeDay(1)}>Hôm sau ▶</button>
                    <button className="btn-refresh" onClick={goToday} style={{ background: '#4caf7d' }}>Hôm nay</button>
                    <button className="btn-refresh" onClick={fetchSchedule} style={{ background: '#6b7280' }}>↻ Làm mới</button>
                </div>
                
                <div style={{ fontSize: '0.95rem', color: '#4b5563', padding: '8px 16px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                    Tổng: <strong>{schedule.filter(b => b.status !== 'cancelled').length}</strong> lịch &nbsp;|&nbsp;
                    Hoàn thành: <strong style={{ color: '#10b981' }}>{schedule.filter(b => b.status === 'completed').length}</strong> &nbsp;|&nbsp;
                    Doanh thu: <strong style={{ color: '#1b3a2d', fontSize: '1.05rem' }}>{formatCurrency(totalRevenue)}</strong>
                </div>
            </div>

            {error && <div style={{ color: '#ef4444', marginBottom: 16 }}>{error}</div>}
            {loading ? (
                <p style={{ color: '#9ca3af' }}>Đang tải...</p>
            ) : (
                <div className="barber-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="barber-table">
                        <thead>
                            <tr>
                                <th>Giờ</th>
                                <th>Khách hàng</th>
                                <th>SĐT</th>
                                <th>Dịch vụ</th>
                                <th>Tổng tiền</th>
                                <th>Ghi chú</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedule.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }}>
                                        Không có lịch hẹn nào trong ngày này.
                                    </td>
                                </tr>
                            ) : (
                                schedule.map(b => {
                                    let rowClass = '';
                                    if (isCurrentBooking(b.startTime, b.endTime)) rowClass = 'row-active';
                                    else if (isComingSoon(b.startTime)) rowClass = 'row-soon';
                                    return (
                                        <tr key={b.id} className={rowClass}>
                                            <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                {formatTime(b.startTime)} – {formatTime(b.endTime)}
                                            </td>
                                            <td>{b.user?.fullName || 'Khách vãng lai'}</td>
                                            <td>{b.user?.phone || '—'}</td>
                                            <td>
                                                {b.services?.map(s => s.name).join(', ') || '—'}
                                            </td>
                                            <td style={{ whiteSpace: 'nowrap' }}>{formatCurrency(b.totalPrice)}</td>
                                            <td style={{ color: '#6b7280', fontStyle: 'italic' }}>{b.note || '—'}</td>
                                            <td>
                                                <span className={`status-badge ${b.status}`}>
                                                    {STATUS_LABELS[b.status]}
                                                </span>
                                            </td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                {b.status === 'pending' && (
                                                    <button className="btn-confirm" onClick={() => handleStatusUpdate(b.id, 'confirmed')}>Xác nhận</button>
                                                )}
                                                {(b.status === 'pending' || b.status === 'confirmed') && (
                                                    <button className="btn-complete" onClick={() => handleStatusUpdate(b.id, 'completed')}>✓ Xong</button>
                                                )}
                                                {b.status !== 'cancelled' && b.status !== 'completed' && (
                                                    <button className="btn-cancel-sm" onClick={() => handleStatusUpdate(b.id, 'cancelled')}>Hủy</button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </BarberLayout>
    );
};

export default BarberSchedulePage;
