import React, { useState, useEffect } from 'react';
import { barberAPI, bookingAPI } from '../api/apiService';
import '../styles/pages/AdminPages.css';

const BarberDashboard = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [schedule, setSchedule] = useState([]);
    const [barberInfo, setBarberInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Cập nhật thời gian thực mỗi phút để logic highlight hoạt động liên tục
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // 1. Hàm kiểm tra booking đang diễn ra
    const isCurrentBooking = (startTime, endTime) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        return currentTime >= start && currentTime <= end;
    };

    // 2. Hàm kiểm tra booking sắp tới (trong vòng 10 phút)
    const isComingSoon = (startTime) => {
        const start = new Date(startTime);
        const diffMs = start.getTime() - currentTime.getTime();
        return diffMs > 0 && diffMs <= 10 * 60 * 1000;
    };

    const fetchSchedule = async () => {
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
    };

    useEffect(() => {
        fetchSchedule();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date]);

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            await bookingAPI.updateStatus(bookingId, newStatus);
            fetchSchedule();
        } catch (err) {
            alert('Cập nhật trạng thái thất bại: ' + err.message);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h2>Trang Của Thợ (Dashboard)</h2>
                {barberInfo && (
                    <div style={{ fontSize: '1.1rem', color: '#555' }}>
                        Thợ: <strong>{barberInfo.name}</strong> 
                    </div>
                )}
            </div>

            <div style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 600, marginRight: 10 }}>Chọn ngày: </label>
                <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button className="btn-save" style={{ marginLeft: 10 }} onClick={fetchSchedule}>Làm mới</button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {loading && <p>Đang tải dữ liệu...</p>}

            {!loading && !error && (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Giờ</th>
                            <th>Khách hàng</th>
                            <th>SĐT</th>
                            <th>Dịch vụ</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedule.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>Không có lịch hẹn nào trong ngày này.</td></tr>
                        ) : (
                            schedule.map(booking => {
                                const startTime = new Date(booking.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                                const endTime = new Date(booking.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

                                // Xác định màu nền (background logic)
                                let rowStyle = {};
                                if (isCurrentBooking(booking.startTime, booking.endTime)) {
                                    rowStyle = { backgroundColor: '#e2f0d9' }; // Màu xanh nhạt
                                } else if (isComingSoon(booking.startTime)) {
                                    rowStyle = { backgroundColor: '#fff2cc' }; // Màu vàng nhạt
                                }
                                
                                return (
                                    <tr key={booking.id} style={rowStyle}>
                                        <td>{startTime} - {endTime}</td>
                                        <td>{booking.user?.fullName || 'Khách vãng lai'}</td>
                                        <td>{booking.user?.phone || '—'}</td>
                                        <td>
                                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                                {booking.services?.map(s => <li key={s.id}>{s.name}</li>)}
                                            </ul>
                                        </td>
                                        <td>{Number(booking.totalPrice).toLocaleString('vi-VN')} đ</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: 4, fontSize: '0.85rem',
                                                backgroundColor: booking.status === 'completed' ? '#d4edda' :
                                                                 booking.status === 'pending' ? '#fff3cd' : 
                                                                 booking.status === 'confirmed' ? '#cce5ff' : '#f8d7da',
                                                color: booking.status === 'completed' ? '#155724' :
                                                       booking.status === 'pending' ? '#856404' : 
                                                       booking.status === 'confirmed' ? '#004085' : '#721c24'
                                            }}>
                                                {booking.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            {booking.status === 'pending' && (
                                                <button className="btn-edit" onClick={() => handleStatusUpdate(booking.id, 'confirmed')}>Xác nhận</button>
                                            )}
                                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                                <button className="btn-save" style={{ marginLeft: 5 }} onClick={() => handleStatusUpdate(booking.id, 'completed')}>Hoàn thành</button>
                                            )}
                                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                <button className="btn-delete" style={{ marginLeft: 5 }} onClick={() => handleStatusUpdate(booking.id, 'cancelled')}>Hủy</button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default BarberDashboard;
