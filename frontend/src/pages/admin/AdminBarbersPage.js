import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { useData } from '../../hooks/DataContext';
import { authAPI, uploadAPI } from '../../api/apiService';
import './AdminLayout.css';

const AdminBarbersPage = () => {
    const { barbers, chairs, addBarber, updateBarber, deleteBarber } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [current, setCurrent] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [staffUsers, setStaffUsers] = useState([]);
    const [search, setSearch] = useState('');
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        authAPI.getStaffUsers().then(res => setStaffUsers(res.staff || [])).catch(console.error);
    }, []);

    const openAdd = () => {
        setCurrent({ name: '', experienceYears: 0, phone: '', chairId: '', userId: '', avatar: '' });
        setIsModalOpen(true);
        setError('');
    };

    const openEdit = (barber) => {
        setCurrent({ ...barber, chairId: barber.chairId || '', userId: barber.userId || '' });
        setIsModalOpen(true);
        setError('');
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Bạn có chắc muốn xóa thợ "${name}"?`)) return;
        try {
            await deleteBarber(id);
        } catch (err) {
            alert(err.message || 'Xóa thất bại');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const data = await uploadAPI.uploadProductImage(file);
            setCurrent(prev => ({ ...prev, avatar: `http://localhost:5000${data.imageUrl}` }));
        } catch (err) {
            setError('Upload ảnh thất bại: ' + (err.message || ''));
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                name: current.name,
                experienceYears: parseInt(current.experienceYears) || 0,
                phone: current.phone,
                chairId: current.chairId ? parseInt(current.chairId) : null,
                userId: current.userId ? parseInt(current.userId) : null,
                avatar: current.avatar || null,
            };
            if (current.id) {
                await updateBarber(current.id, payload);
            } else {
                await addBarber(payload);
            }
            setIsModalOpen(false);
        } catch (err) {
            setError(err.message || 'Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const assignedChairIds = barbers
        .filter(b => b.chairId && (!current || b.id !== current.id))
        .map(b => b.chairId);

    const filtered = barbers.filter(b =>
        b.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.phone?.includes(search)
    );

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <div>
                    <h1>Quản lý Thợ cắt tóc</h1>
                    <p>Tổng cộng {barbers.length} thợ</p>
                </div>
                <button className="btn-primary" onClick={openAdd}>+ Thêm Thợ</button>
            </div>

            <div className="admin-card">
                <div className="filter-bar">
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc SĐT..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ flex: 1 }}
                    />
                </div>

                <div className="admin-table-wrap">
                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">👨‍💼</div>
                            <p>Chưa có thợ nào</p>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Tên thợ</th>
                                    <th>Kinh nghiệm</th>
                                    <th>SĐT</th>
                                    <th>Ghế</th>
                                    <th>Tài khoản</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((barber, idx) => (
                                    <tr key={barber.id}>
                                        <td style={{ color: '#aaa', fontSize: '0.82rem' }}>{idx + 1}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {barber.avatar ? (
                                                    <img src={barber.avatar} alt={barber.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{
                                                        width: 36, height: 36, background: '#1a1a2e',
                                                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', color: '#d4af37', fontWeight: 800, fontSize: '1rem'
                                                    }}>
                                                        {barber.name?.[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                                <span style={{ fontWeight: 600 }}>{barber.name}</span>
                                            </div>
                                        </td>
                                        <td>{barber.experienceYears} năm</td>
                                        <td>{barber.phone || '—'}</td>
                                        <td>
                                            {barber.chair
                                                ? <span className="badge badge-active">{barber.chair.name}</span>
                                                : <span style={{ color: '#aaa' }}>—</span>}
                                        </td>
                                        <td>{barber.user?.username || <span style={{ color: '#aaa' }}>—</span>}</td>
                                        <td>
                                            <button className="btn-icon-edit" onClick={() => openEdit(barber)}>Sửa</button>
                                            <button className="btn-icon-delete" onClick={() => handleDelete(barber.id, barber.name)}>Xóa</button>
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
                        <h2 className="modal-title">{current?.id ? 'Sửa Thợ' : 'Thêm Thợ Mới'}</h2>
                        {error && <div className="alert-error">{error}</div>}
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Tên thợ *</label>
                                <input
                                    type="text"
                                    value={current.name}
                                    onChange={e => setCurrent({ ...current, name: e.target.value })}
                                    placeholder="Nhập tên thợ"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Kinh nghiệm (năm)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={current.experienceYears}
                                        onChange={e => setCurrent({ ...current, experienceYears: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="text"
                                        value={current.phone}
                                        onChange={e => setCurrent({ ...current, phone: e.target.value })}
                                        placeholder="Nhập SĐT"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ghế</label>
                                    <select
                                        value={current.chairId}
                                        onChange={e => setCurrent({ ...current, chairId: e.target.value })}
                                    >
                                        <option value="">— Không có ghế —</option>
                                        {chairs
                                            .filter(c => c.isAvailable && !assignedChairIds.includes(c.id))
                                            .map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Tài khoản nhân viên</label>
                                    <select
                                        value={current.userId}
                                        onChange={e => setCurrent({ ...current, userId: e.target.value })}
                                    >
                                        <option value="">— Không liên kết —</option>
                                        {staffUsers.map(u => (
                                            <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Ảnh đại diện (Avatar)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    style={{ padding: '6px 0' }}
                                />
                                {uploading && <small style={{ color: '#888' }}>Đang upload...</small>}
                            </div>
                            {current.avatar && (
                                <div className="form-group">
                                    <img src={current.avatar} alt="preview" className="img-upload-preview" />
                                </div>
                            )}
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy</button>
                                <button type="submit" className="btn-save" disabled={saving || uploading}>
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

export default AdminBarbersPage;
