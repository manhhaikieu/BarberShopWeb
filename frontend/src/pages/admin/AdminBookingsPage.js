import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { bookingAPI } from '../../api/apiService';
import '../../styles/pages/admin/AdminLayout.css';

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'];
const STATUS_LABELS = { pending: 'Chờ XN', confirmed: 'Đã XN', completed: 'Hoàn thành', cancelled: 'Đã hủy' };

const AdminBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const getLocalToday = () => {
        const d = new Date();
        const p = n => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    };
    const [filterDate, setFilterDate] = useState(getLocalToday());
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterDate) params.date = filterDate;
            if (filterStatus) params.status = filterStatus;
            const data = await bookingAPI.getAll(params);
            setBookings(data.bookings || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filterDate, filterStatus]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleStatusChange = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            const data = await bookingAPI.updateStatus(id, newStatus);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, ...data.booking } : b));
        } catch (err) {
            alert(err.message || 'Cập nhật thất bại');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
        setUpdatingId(id);
        try {
            await bookingAPI.cancel(id);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
        } catch (err) {
            alert(err.message || 'Hủy thất bại');
        } finally {
            setUpdatingId(null);
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatDateTime = (dt) => {
        const d = new Date(dt);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dt) => {
        const d = new Date(dt);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const now = new Date();

    const statusCount = STATUS_OPTIONS.reduce((acc, s) => {
        acc[s] = bookings.filter(b => b.status === s).length;
        return acc;
    }, {});

    const totalRevenue = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + parseFloat(b.totalPrice || 0), 0);

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <div>
                    <h1>Quản lý Lịch hẹn</h1>
                    <p>{bookings.length} lịch hẹn {filterDate ? `ngày ${formatDate(filterDate + 'T00:00:00')}` : ''}</p>
                </div>
            </div>

            {/* Summary row */}
            {filterDate && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
                    {[
                        { label: 'Chờ xác nhận', count: statusCount.pending, color: '#856404', bg: '#fff3cd' },
                        { label: 'Đã xác nhận', count: statusCount.confirmed, color: '#0c5460', bg: '#d1ecf1' },
                        { label: 'Hoàn thành', count: statusCount.completed, color: '#155724', bg: '#d4edda' },
                        { label: 'Đã hủy', count: statusCount.cancelled, color: '#721c24', bg: '#f8d7da' },
                        { label: 'Doanh thu', count: formatCurrency(totalRevenue), color: '#5a3a00', bg: '#fff8e1', isText: true },
                    ].map(item => (
                        <div key={item.label} className="admin-card" style={{ textAlign: 'center', padding: '14px', background: item.bg, boxShadow: 'none', margin: 0, borderRadius: 10 }}>
                            <div style={{ fontSize: item.isText ? '1rem' : '1.5rem', fontWeight: 800, color: item.color }}>{item.count}</div>
                            <div style={{ fontSize: '0.75rem', color: item.color, fontWeight: 600, marginTop: 4 }}>{item.label}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="admin-card">
                {/* Filters */}
                <div className="filter-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#555' }}>Ngày:</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}
                        />
                        <button
                            onClick={() => setFilterDate('')}
                            style={{ background: 'none', border: '1px solid #ddd', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem', color: '#777' }}
                        >
                            Tất cả ngày
                        </button>
                    </div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">Tất cả trạng thái</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="admin-loading">Đang tải dữ liệu...</div>
                ) : bookings.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📅</div>
                        <p>Không có lịch hẹn nào</p>
                    </div>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Thời gian</th>
                                    <th>Khách hàng</th>
                                    <th>Thợ / Ghế</th>
                                    <th>Dịch vụ</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(b => {
                                    const isNow = new Date(b.startTime) <= now && new Date(b.endTime) > now;
                                    const isUpdating = updatingId === b.id;
                                    return (
                                        <tr key={b.id} style={isNow ? { background: 'rgba(212,175,55,0.06)' } : {}}>
                                            <td>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                                    {isNow && <span style={{ color: '#d4af37' }}>🔴 </span>}
                                                    {formatDateTime(b.startTime)}–{formatDateTime(b.endTime)}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{formatDate(b.startTime)}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{b.user?.fullName || b.user?.username || '—'}</div>
                                                <div style={{ fontSize: '0.78rem', color: '#aaa' }}>{b.user?.phone || ''}</div>
                                            </td>
                                            <td>
                                                <div>{b.barber?.name || '—'}</div>
                                                <div style={{ fontSize: '0.78rem', color: '#aaa' }}>{b.chair?.name || ''}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>
                                                    {b.services?.map(s => s.name).join(', ') || '—'}
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 700, color: '#d4af37', whiteSpace: 'nowrap' }}>
                                                {formatCurrency(b.totalPrice)}
                                            </td>
                                            <td>
                                                <span className={`badge badge-${b.status}`}>{STATUS_LABELS[b.status] || b.status}</span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                    <button
                                                        className="btn-icon-view"
                                                        onClick={() => setSelectedBooking(b)}
                                                        title="Xem chi tiết"
                                                    >
                                                        Chi tiết
                                                    </button>
                                                    {b.status === 'pending' && (
                                                        <button
                                                            className="btn-icon-edit"
                                                            onClick={() => handleStatusChange(b.id, 'confirmed')}
                                                            disabled={isUpdating}
                                                        >
                                                            Xác nhận
                                                        </button>
                                                    )}
                                                    {b.status === 'confirmed' && (
                                                        <button
                                                            className="btn-icon-edit"
                                                            onClick={() => handleStatusChange(b.id, 'completed')}
                                                            disabled={isUpdating}
                                                        >
                                                            Hoàn thành
                                                        </button>
                                                    )}
                                                    {(b.status === 'pending' || b.status === 'confirmed') && (
                                                        <button
                                                            className="btn-icon-delete"
                                                            onClick={() => handleCancel(b.id)}
                                                            disabled={isUpdating}
                                                        >
                                                            Hủy
                                                        </button>
                                                    )}
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
            {selectedBooking && (
                <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
                    <div className="modal-box modal-lg" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">Chi tiết Lịch hẹn #{selectedBooking.id}</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
                            {[
                                { label: 'Khách hàng', value: selectedBooking.user?.fullName || selectedBooking.user?.username },
                                { label: 'SĐT', value: selectedBooking.user?.phone || '—' },
                                { label: 'Thợ', value: selectedBooking.barber?.name || '—' },
                                { label: 'Ghế', value: selectedBooking.chair?.name || '—' },
                                { label: 'Bắt đầu', value: new Date(selectedBooking.startTime).toLocaleString('vi-VN') },
                                { label: 'Kết thúc', value: new Date(selectedBooking.endTime).toLocaleString('vi-VN') },
                                { label: 'Tổng tiền', value: formatCurrency(selectedBooking.totalPrice) },
                                { label: 'Trạng thái', value: STATUS_LABELS[selectedBooking.status] },
                            ].map(item => (
                                <div key={item.label}>
                                    <div style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>{item.label}</div>
                                    <div style={{ fontWeight: 600, marginTop: 4 }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Dịch vụ</div>
                            {selectedBooking.services?.map(s => (
                                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f3f5' }}>
                                    <span>{s.name}</span>
                                    <span style={{ fontWeight: 700 }}>{formatCurrency(s.BookingService?.priceAtBooking || s.price)}</span>
                                </div>
                            ))}
                        </div>
                        {selectedBooking.note && (
                            <div style={{ marginTop: '16px', background: '#f8f9fb', padding: '12px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Ghi chú</div>
                                <div style={{ fontSize: '0.9rem' }}>{selectedBooking.note}</div>
                            </div>
                        )}
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setSelectedBooking(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminBookingsPage;
