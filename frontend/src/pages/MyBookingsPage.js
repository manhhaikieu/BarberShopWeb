import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../api/apiService';
import { useAuth } from '../hooks/AuthContext';
import './MyOrdersPage.css'; // Reusing styles from order history

const STATUS_LABELS = { 
    pending: 'Chờ Xác Nhận', 
    confirmed: 'Đã Xác Nhận', 
    completed: 'Hoàn Thành', 
    cancelled: 'Đã Hủy' 
};

// Use similar stylish badges
const STATUS_STYLES = { 
    pending: { color: '#856404', bg: '#fff3cd' },
    confirmed: { color: '#0c5460', bg: '#d1ecf1' },
    completed: { color: '#155724', bg: '#d4edda' },
    cancelled: { color: '#721c24', bg: '#f8d7da' },
};

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDateTime = (dt) => {
    if (!dt) return '—';
    const d = new Date(dt);
    return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
};

const MyBookingsPage = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await bookingAPI.getMy();
                setBookings(data.bookings || []);
            } catch (err) {
                console.error("Lỗi khi tải lịch hẹn:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchBookings();
        }
    }, [user]);

    if (!user) {
        return (
            <div className="my-orders-container">
                <div className="my-orders-content">
                    Vui lòng đăng nhập để xem lịch hẹn.
                </div>
            </div>
        );
    }

    return (
        <div className="section-container my-orders-container">
            <h1 className="section-title">LỊCH HẸN CỦA TÔI</h1>
            <p className="section-subtitle">QUẢN LÝ LỊCH CẮT TÓC TẠI HKT BARBER</p>

            <div className="my-orders-content">
                {loading ? (
                    <div className="loading-state">Đang tải dữ liệu...</div>
                ) : bookings.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">✂️</div>
                        <h3>Chưa có lịch hẹn nào!</h3>
                        <p>Bạn chưa đặt lịch cắt tóc nào tại cửa hàng.</p>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {bookings.map(booking => {
                            const barberName = booking.barber?.name || 'Chưa phân công';
                            const chairName = booking.chair?.name || '—';
                            const serviceNames = (booking.services || []).map(s => s.name).join(', ');

                            return (
                                <div key={booking.id} className="order-card">
                                    <div className="order-header">
                                        <div className="order-id">💈 Lịch Hẹn</div>
                                        <div 
                                            className="order-status badge" 
                                            style={{ 
                                                backgroundColor: STATUS_STYLES[booking.status]?.bg || '#eee', 
                                                color: STATUS_STYLES[booking.status]?.color || '#333' 
                                            }}
                                        >
                                            {STATUS_LABELS[booking.status] || booking.status}
                                        </div>
                                    </div>
                                    <div className="order-body">
                                        <div className="order-info-row">
                                            <span className="info-label">Thời gian:</span>
                                            <span className="info-value amount">{formatDateTime(booking.startTime)}</span>
                                        </div>
                                        <div className="order-info-row">
                                            <span className="info-label">Thợ Barber:</span>
                                            <span className="info-value product-name">{barberName}</span>
                                        </div>
                                        <div className="order-info-row">
                                            <span className="info-label">Ghế phục vụ:</span>
                                            <span className="info-value">{chairName}</span>
                                        </div>
                                        <div className="order-info-row">
                                            <span className="info-label">Dịch vụ:</span>
                                            <span className="info-value">{serviceNames || '—'}</span>
                                        </div>
                                        <div className="order-info-row">
                                            <span className="info-label">Chi phí:</span>
                                            <span className="info-value amount">{formatCurrency(booking.totalPrice)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookingsPage;
