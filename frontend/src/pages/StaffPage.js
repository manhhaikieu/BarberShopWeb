import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/DataContext';
import { authAPI } from '../api/apiService';
import '../styles/pages/AdminPages.css';

const StaffPage = () => {
    const { barbers, addBarber, updateBarber, deleteBarber, chairs } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBarber, setCurrentBarber] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [staffUsers, setStaffUsers] = useState([]);

    useEffect(() => {
        authAPI.getStaffUsers().then(res => setStaffUsers(res.staff || [])).catch(console.error);
    }, []);

    const handleEdit = (barber) => {
        setCurrentBarber({ ...barber });
        setIsModalOpen(true);
        setError('');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa thợ này?')) {
            try {
                await deleteBarber(id);
            } catch (err) {
                alert(err.message || 'Xóa thất bại');
            }
        }
    };

    const handleAddNew = () => {
        setCurrentBarber({ name: '', experienceYears: 0, phone: '', chairId: '' });
        setIsModalOpen(true);
        setError('');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                name: currentBarber.name,
                experienceYears: parseInt(currentBarber.experienceYears),
                phone: currentBarber.phone,
                chairId: currentBarber.chairId ? parseInt(currentBarber.chairId) : null,
                userId: currentBarber.userId ? parseInt(currentBarber.userId) : null,
            };
            if (currentBarber.id) {
                await updateBarber(currentBarber.id, payload);
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
        .filter(b => b.chairId && (!currentBarber || b.id !== currentBarber.id))
        .map(b => b.chairId);

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h2>Quản Lý Thợ Cắt Tóc</h2>
                <button className="btn-add" onClick={handleAddNew}>+ Thêm Thợ</button>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Kinh nghiệm</th>
                        <th>SĐT</th>
                        <th>Ghế</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {barbers.map(barber => (
                        <tr key={barber.id}>
                            <td>{barber.name}</td>
                            <td>{barber.experienceYears} năm</td>
                            <td>{barber.phone}</td>
                            <td>{barber.chair?.name || '—'}</td>
                            <td>
                                <button className="btn-edit" onClick={() => handleEdit(barber)}>Sửa</button>
                                <button className="btn-delete" onClick={() => handleDelete(barber.id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{currentBarber.id ? 'Sửa Thợ' : 'Thêm Thợ'}</h3>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Tên</label>
                                <input
                                    value={currentBarber.name}
                                    onChange={e => setCurrentBarber({ ...currentBarber, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Kinh nghiệm (năm)</label>
                                <input
                                    type="number"
                                    value={currentBarber.experienceYears}
                                    onChange={e => setCurrentBarber({ ...currentBarber, experienceYears: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input
                                    value={currentBarber.phone}
                                    onChange={e => setCurrentBarber({ ...currentBarber, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Ghế</label>
                                <select
                                    value={currentBarber.chairId || ''}
                                    onChange={e => setCurrentBarber({ ...currentBarber, chairId: e.target.value })}
                                >
                                    <option value="">-- Chưa gán ghế --</option>
                                    {chairs
                                        .filter(c => !assignedChairIds.includes(c.id))
                                        .map(chair => (
                                            <option key={chair.id} value={chair.id}>{chair.name}</option>
                                        ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tài khoản liên kết (User)</label>
                                <select
                                    value={currentBarber.userId || ''}
                                    onChange={e => setCurrentBarber({ ...currentBarber, userId: e.target.value })}
                                >
                                    <option value="">-- Không liên kết --</option>
                                    {staffUsers.map(u => (
                                        <option key={u.id} value={u.id}>{u.fullName || u.username} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy</button>
                                <button type="submit" className="btn-save" disabled={saving}>
                                    {saving ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffPage;
