import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { productOrderAPI } from '../../api/apiService';
import './AdminLayout.css';

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Shipped', 'Completed', 'Cancelled'];
const STATUS_LABELS = { 
    Pending: 'Chờ XN', 
    Confirmed: 'Đã XN', 
    Shipped: 'Đang Giao', 
    Completed: 'Hoàn thành', 
    Cancelled: 'Đã hủy' 
};

// CSS class mapping for the badges (reusing admin layout classes if possible, or using generic styles)
const STATUS_CLASSES = { 
    Pending: 'badge-pending', 
    Confirmed: 'badge-confirmed', 
    Shipped: 'badge-confirmed', // Reusing confirmed style for simplicity, or we can use custom inline
    Completed: 'badge-completed', 
    Cancelled: 'badge-cancelled' 
};

const AdminProductOrdersPage = () => {
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await productOrderAPI.getAll();
            setAllOrders(data || []);
        } catch (err) {
            console.error(err);
            alert('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleStatusChange = async (id, newStatus) => {
        if (!window.confirm(`Bạn có chắc chắn muốn cập nhật trạng thái đơn thành ${STATUS_LABELS[newStatus]}?`)) return;
        setUpdatingId(id);
        try {
            const data = await productOrderAPI.updateStatus(id, newStatus);
            setAllOrders(prev => prev.map(o => o.id === id ? { ...o, ...data.order } : o));
        } catch (err) {
            alert(err.message || 'Cập nhật thất bại');
        } finally {
            setUpdatingId(null);
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatDateTime = (dt) => {
        if (!dt) return '—';
        const d = new Date(dt);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + 
               d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const statusCount = STATUS_OPTIONS.reduce((acc, s) => {
        acc[s] = allOrders.filter(o => o.status === s).length;
        return acc;
    }, {});

    const totalRevenue = allOrders
        .filter(o => o.status === 'Completed')
        .reduce((sum, o) => sum + parseFloat(o.totalPrice || 0), 0);
        
    // Tính toán list hiển thị cuối cùng
    const displayedOrders = allOrders.filter(o => {
        const matchStatus = filterStatus ? o.status === filterStatus : true;
        const term = searchTerm.toLowerCase();
        const matchSearch = term === '' || 
                            o.id.toString().includes(term) ||
                            (o.customerName || '').toLowerCase().includes(term) ||
                            (o.customerPhone || '').includes(term) ||
                            (o.product?.name || '').toLowerCase().includes(term);
        return matchStatus && matchSearch;
    });

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <div>
                    <h1>Quản lý Đơn hàng</h1>
                    <p>{displayedOrders.length} đơn hàng được hiển thị</p>
                </div>
            </div>

            {/* Summary row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                    { label: 'Chờ XN', count: statusCount.Pending, color: '#856404', bg: '#fff3cd' },
                    { label: 'Đã XN', count: statusCount.Confirmed, color: '#0c5460', bg: '#d1ecf1' },
                    { label: 'Đang Giao', count: statusCount.Shipped, color: '#004085', bg: '#cce5ff' },
                    { label: 'Hoàn thành', count: statusCount.Completed, color: '#155724', bg: '#d4edda' },
                    { label: 'Đã hủy', count: statusCount.Cancelled, color: '#721c24', bg: '#f8d7da' },
                    { label: 'Doanh thu', count: formatCurrency(totalRevenue), color: '#5a3a00', bg: '#fff8e1', isText: true },
                ].map(item => (
                    <div key={item.label} className="admin-card" style={{ textAlign: 'center', padding: '14px', background: item.bg, boxShadow: 'none', margin: 0, borderRadius: 10 }}>
                        <div style={{ fontSize: item.isText ? '0.9rem' : '1.5rem', fontWeight: 800, color: item.color, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.count}</div>
                        <div style={{ fontSize: '0.75rem', color: item.color, fontWeight: 600, marginTop: 4 }}>{item.label}</div>
                    </div>
                ))}
            </div>

            <div className="admin-card">
                {/* Filters */}
                <div className="filter-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                        type="text" 
                        placeholder="Tìm mã ĐH, tên, SĐT, SP..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', flex: 1, maxWidth: '250px' }}
                    />
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}>
                        <option value="">Tất cả trạng thái</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="admin-loading">Đang tải dữ liệu...</div>
                ) : displayedOrders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🛒</div>
                        <p>Không có đơn hàng nào</p>
                    </div>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Mã ĐH</th>
                                    <th>Thời gian đặt</th>
                                    <th>Khách hàng</th>
                                    <th>Sản phẩm</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedOrders.map(o => {
                                    const isUpdating = updatingId === o.id;
                                    return (
                                        <tr key={o.id}>
                                            <td style={{ fontWeight: 600 }}>#{o.id}</td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>
                                                    {formatDateTime(o.createdAt || o.orderDate)}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                                                <div style={{ fontSize: '0.78rem', color: '#666' }}>{o.customerPhone}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{o.product?.name || 'Sản phẩm không rõ'}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#666' }}>SL: {o.quantity}</div>
                                            </td>
                                            <td style={{ fontWeight: 700, color: '#d4af37' }}>
                                                {formatCurrency(o.totalPrice)}
                                            </td>
                                            <td>
                                                <span className={`badge ${STATUS_CLASSES[o.status] || 'badge-pending'}`}
                                                    style={o.status === 'Shipped' ? {background: '#cce5ff', color: '#004085'} : {}}
                                                >
                                                    {STATUS_LABELS[o.status] || o.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                    <button
                                                        className="btn-icon-view"
                                                        onClick={() => setSelectedOrder(o)}
                                                        title="Xem chi tiết"
                                                    >
                                                        Chi tiết
                                                    </button>
                                                    <select
                                                        value={o.status}
                                                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                                        disabled={isUpdating}
                                                        style={{ 
                                                            padding: '4px 8px', 
                                                            borderRadius: '6px', 
                                                            border: '1px solid #ddd',
                                                            fontFamily: 'inherit',
                                                            fontSize: '0.85rem',
                                                            outline: 'none',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {STATUS_OPTIONS.map(s => (
                                                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-box modal-lg" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">Chi tiết Đơn hàng #{selectedOrder.id}</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
                            {[
                                { label: 'Khách hàng', value: selectedOrder.customerName },
                                { label: 'SĐT', value: selectedOrder.customerPhone },
                                { label: 'Địa chỉ giao hàng', value: selectedOrder.address },
                                { label: 'Ngày đặt', value: formatDateTime(selectedOrder.createdAt || selectedOrder.orderDate) },
                                { label: 'Sản phẩm', value: selectedOrder.product?.name || 'Sản phẩm không rõ' },
                                { label: 'Số lượng mua', value: selectedOrder.quantity },
                                { label: 'Tổng tiền', value: formatCurrency(selectedOrder.totalPrice) },
                                { label: 'Trạng thái', value: STATUS_LABELS[selectedOrder.status] },
                            ].map(item => (
                                <div key={item.label} style={{ gridColumn: item.label === 'Địa chỉ giao hàng' ? '1 / -1' : 'auto' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>{item.label}</div>
                                    <div style={{ fontWeight: 600, marginTop: 4 }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="modal-actions" style={{ marginTop: '20px' }}>
                            <button className="btn-cancel" onClick={() => setSelectedOrder(null)}>Đóng thông tin</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminProductOrdersPage;
