import React, { useState, useEffect } from 'react';
import { productOrderAPI } from '../api/apiService';
import { useAuth } from '../hooks/AuthContext';
import '../styles/pages/MyOrdersPage.css';

const STATUS_LABELS = { 
    Pending: 'Chờ Xác Nhận', 
    Confirmed: 'Đã Xác Nhận', 
    Shipped: 'Đang Giao Hàng', 
    Completed: 'Hoàn Thành', 
    Cancelled: 'Đã Hủy' 
};

const STATUS_STYLES = { 
    Pending: { color: '#856404', bg: '#fff3cd' },
    Confirmed: { color: '#0c5460', bg: '#d1ecf1' },
    Shipped: { color: '#004085', bg: '#cce5ff' },
    Completed: { color: '#155724', bg: '#d4edda' },
    Cancelled: { color: '#721c24', bg: '#f8d7da' },
};

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDateTime = (dt) => {
    if (!dt) return '—';
    const d = new Date(dt);
    return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
};

const MyOrdersPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await productOrderAPI.getMyOrders();
                setOrders(data || []);
            } catch (err) {
                console.error("Lỗi khi tải lịch sử đơn hàng:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    if (!user) {
        return (
            <div className="my-orders-container">
                <div className="my-orders-content">
                    Vui lòng đăng nhập để xem đơn hàng.
                </div>
            </div>
        );
    }

    return (
        <div className="section-container my-orders-container">
            <h1 className="section-title">ĐƠN HÀNG CỦA TÔI</h1>
            <p className="section-subtitle">QUẢN LÝ LỊCH SỬ MUA SẮM TẠI HKT BARBER</p>

            <div className="my-orders-content">
                {loading ? (
                    <div className="loading-state">Đang tải dữ liệu...</div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🛒</div>
                        <h3>Chưa có đơn hàng nào!</h3>
                        <p>Bạn chưa đặt mua sản phẩm nào từ cửa hàng.</p>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {orders.map(order => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div className="order-id">Đơn hàng #{order.id}</div>
                                    <div 
                                        className="order-status badge" 
                                        style={{ 
                                            backgroundColor: STATUS_STYLES[order.status]?.bg || '#eee', 
                                            color: STATUS_STYLES[order.status]?.color || '#333' 
                                        }}
                                    >
                                        {STATUS_LABELS[order.status] || order.status}
                                    </div>
                                </div>
                                <div className="order-body">
                                    <div className="order-info-row">
                                        <span className="info-label">Sản phẩm:</span>
                                        <span className="info-value product-name">{order.product?.name || 'Sản phẩm không rõ'}</span>
                                    </div>
                                    <div className="order-info-row">
                                        <span className="info-label">Số lượng:</span>
                                        <span className="info-value">{order.quantity}</span>
                                    </div>
                                    <div className="order-info-row">
                                        <span className="info-label">Tổng tiền:</span>
                                        <span className="info-value amount">{formatCurrency(order.totalPrice)}</span>
                                    </div>
                                    <div className="order-info-row">
                                        <span className="info-label">Ngày đặt:</span>
                                        <span className="info-value">{formatDateTime(order.createdAt)}</span>
                                    </div>
                                    <div className="order-info-row">
                                        <span className="info-label">Địa chỉ nhận:</span>
                                        <span className="info-value address-text">{order.address}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrdersPage;
