import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { useData } from '../../hooks/DataContext';
import './AdminLayout.css';

const AdminServicesPage = () => {
    const { services, addService, updateService, deleteService } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [current, setCurrent] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const openAdd = () => {
        setCurrent({ name: '', price: 0, duration: 30, description: '' });
        setIsModalOpen(true);
        setError('');
    };

    const openEdit = (service) => {
        setCurrent({ ...service });
        setIsModalOpen(true);
        setError('');
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Bạn có chắc muốn xóa dịch vụ "${name}"?`)) return;
        try {
            await deleteService(id);
        } catch (err) {
            alert(err.message || 'Xóa thất bại');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                name: current.name,
                price: parseFloat(current.price),
                duration: parseInt(current.duration),
                description: current.description,
            };
            if (current.id) {
                await updateService(current.id, payload);
            } else {
                await addService(payload);
            }
            setIsModalOpen(false);
        } catch (err) {
            setError(err.message || 'Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const filtered = services.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <div>
                    <h1>Quản lý Dịch vụ</h1>
                    <p>Tổng {services.length} dịch vụ</p>
                </div>
                <button className="btn-primary" onClick={openAdd}>+ Thêm Dịch vụ</button>
            </div>

            <div className="admin-card">
                <div className="filter-bar">
                    <input
                        type="text"
                        placeholder="Tìm theo tên dịch vụ..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ flex: 1 }}
                    />
                </div>

                <div className="admin-table-wrap">
                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">✂️</div>
                            <p>Chưa có dịch vụ nào</p>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Tên dịch vụ</th>
                                    <th>Giá</th>
                                    <th>Thời gian</th>
                                    <th>Mô tả</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((service, idx) => (
                                    <tr key={service.id}>
                                        <td style={{ color: '#aaa', fontSize: '0.82rem' }}>{idx + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{service.name}</td>
                                        <td style={{ fontWeight: 700, color: '#d4af37' }}>{formatCurrency(service.price)}</td>
                                        <td>
                                            <span className="badge badge-confirmed">{service.duration} phút</span>
                                        </td>
                                        <td style={{ color: '#777', fontSize: '0.85rem', maxWidth: 200 }}>
                                            {service.description
                                                ? service.description.substring(0, 60) + (service.description.length > 60 ? '...' : '')
                                                : '—'}
                                        </td>
                                        <td>
                                            <button className="btn-icon-edit" onClick={() => openEdit(service)}>Sửa</button>
                                            <button className="btn-icon-delete" onClick={() => handleDelete(service.id, service.name)}>Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
                    <div className="modal-box">
                        <h2 className="modal-title">{current?.id ? 'Sửa Dịch vụ' : 'Thêm Dịch vụ Mới'}</h2>
                        {error && <div className="alert-error">{error}</div>}
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Tên dịch vụ *</label>
                                <input
                                    type="text"
                                    value={current.name}
                                    onChange={e => setCurrent({ ...current, name: e.target.value })}
                                    placeholder="Vd: Cắt tóc nam"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Giá (VNĐ) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={current.price}
                                        onChange={e => setCurrent({ ...current, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Thời gian (phút) *</label>
                                    <input
                                        type="number"
                                        min="5"
                                        step="5"
                                        value={current.duration}
                                        onChange={e => setCurrent({ ...current, duration: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    value={current.description}
                                    onChange={e => setCurrent({ ...current, description: e.target.value })}
                                    placeholder="Nhập mô tả dịch vụ..."
                                    rows={3}
                                />
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

export default AdminServicesPage;
