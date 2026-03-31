import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { useData } from '../../hooks/DataContext';
import '../../styles/pages/admin/AdminLayout.css';

const AdminChairsPage = () => {
    const { chairs, barbers, addChair, updateChair, deleteChair } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [current, setCurrent] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const openAdd = () => {
        setCurrent({ name: '', isAvailable: true });
        setIsModalOpen(true);
        setError('');
    };

    const openEdit = (chair) => {
        setCurrent({ ...chair });
        setIsModalOpen(true);
        setError('');
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Bạn có chắc muốn xóa ghế "${name}"?`)) return;
        try {
            await deleteChair(id);
        } catch (err) {
            alert(err.message || 'Xóa thất bại');
        }
    };

    const handleToggleAvailable = async (chair) => {
        try {
            await updateChair(chair.id, { name: chair.name, isAvailable: !chair.isAvailable });
        } catch (err) {
            alert(err.message || 'Cập nhật thất bại');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                name: current.name,
                isAvailable: current.isAvailable !== false,
            };
            if (current.id) {
                await updateChair(current.id, payload);
            } else {
                await addChair(payload);
            }
            setIsModalOpen(false);
        } catch (err) {
            setError(err.message || 'Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const getBarberForChair = (chairId) => barbers.find(b => b.chairId === chairId);

    const activeChairs = chairs.filter(c => c.isAvailable).length;

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <div>
                    <h1>Quản lý Ghế</h1>
                    <p>Tổng {chairs.length} ghế &mdash; {activeChairs} đang mở</p>
                </div>
                <button className="btn-primary" onClick={openAdd}>+ Thêm Ghế</button>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div className="stat-card">
                    <div className="stat-icon blue">💺</div>
                    <div className="stat-info">
                        <div className="stat-value">{chairs.length}</div>
                        <div className="stat-label">Tổng ghế</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">✅</div>
                    <div className="stat-info">
                        <div className="stat-value">{activeChairs}</div>
                        <div className="stat-label">Đang mở</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon red">🔒</div>
                    <div className="stat-info">
                        <div className="stat-value">{chairs.length - activeChairs}</div>
                        <div className="stat-label">Đang đóng</div>
                    </div>
                </div>
            </div>

            <div className="admin-card">
                <div className="admin-table-wrap">
                    {chairs.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">💺</div>
                            <p>Chưa có ghế nào</p>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Tên ghế</th>
                                    <th>Thợ phụ trách</th>
                                    <th>Trạng thái</th>
                                    <th>Bật/Tắt</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chairs.map((chair, idx) => {
                                    const assignedBarber = getBarberForChair(chair.id);
                                    return (
                                        <tr key={chair.id}>
                                            <td style={{ color: '#aaa', fontSize: '0.82rem' }}>{idx + 1}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '1.4rem' }}>💺</span>
                                                    <span style={{ fontWeight: 600 }}>{chair.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {assignedBarber
                                                    ? <span style={{ fontWeight: 600, color: '#1a1a2e' }}>👨‍💼 {assignedBarber.name}</span>
                                                    : <span style={{ color: '#aaa' }}>— Chưa có thợ —</span>}
                                            </td>
                                            <td>
                                                <span className={`badge ${chair.isAvailable ? 'badge-active' : 'badge-inactive'}`}>
                                                    {chair.isAvailable ? 'Đang mở' : 'Đóng'}
                                                </span>
                                            </td>
                                            <td>
                                                <label className="toggle-switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={chair.isAvailable}
                                                        onChange={() => handleToggleAvailable(chair)}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </td>
                                            <td>
                                                <button className="btn-icon-edit" onClick={() => openEdit(chair)}>Sửa</button>
                                                <button className="btn-icon-delete" onClick={() => handleDelete(chair.id, chair.name)}>Xóa</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
                    <div className="modal-box">
                        <h2 className="modal-title">{current?.id ? 'Sửa Ghế' : 'Thêm Ghế Mới'}</h2>
                        {error && <div className="alert-error">{error}</div>}
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Tên ghế *</label>
                                <input
                                    type="text"
                                    value={current.name}
                                    onChange={e => setCurrent({ ...current, name: e.target.value })}
                                    placeholder="Vd: Ghế 1, Ghế VIP..."
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <label style={{ marginBottom: 0 }}>Trạng thái mở</label>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={current.isAvailable !== false}
                                        onChange={e => setCurrent({ ...current, isAvailable: e.target.checked })}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                                <span style={{ fontSize: '0.85rem', color: '#777' }}>
                                    {current.isAvailable !== false ? 'Đang mở' : 'Đóng'}
                                </span>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy</button>
                                <button type="submit" className="btn-save" disabled={saving}>
                                    {saving ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminChairsPage;
