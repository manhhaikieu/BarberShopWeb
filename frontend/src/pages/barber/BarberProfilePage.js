import React, { useState, useEffect } from 'react';
import BarberLayout from './BarberLayout';
import { barberAPI, authAPI } from '../../api/apiService';
import { useAuth } from '../../hooks/AuthContext';
import '../../styles/pages/barber/BarberLayout.css';

const BarberProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [barberInfo, setBarberInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', email: '', username: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const getLocalToday = () => {
            const d = new Date();
            const p = n => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
        };

        if (user) {
            setFormData({ fullName: user.fullName || '', email: user.email || '', username: user.username || '' });
        }
        barberAPI.getMySchedule(getLocalToday())
            .then(data => setBarberInfo(data.barber))
            .catch(err => setError(err.message || 'Không tải được hồ sơ'))
            .finally(() => setLoading(false));
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const data = await authAPI.updateProfile(formData);
            updateUser(data.user);
            setIsEditing(false);
            alert('Cập nhật thành công!');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <BarberLayout>
            <div className="barber-page-header">
                <div>
                    <h1>Hồ sơ của tôi</h1>
                    <p>Thông tin tài khoản và hồ sơ thợ</p>
                </div>
            </div>

            {loading && <p style={{ color: '#9ca3af' }}>Đang tải...</p>}
            {error && <p style={{ color: '#ef4444' }}>{error}</p>}

            {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900 }}>
                    {/* Thông tin tài khoản */}
                    <div className="barber-card" style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>👤 Tài khoản đăng nhập</h2>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer', fontWeight: 'bold' }}>✏️ Sửa</button>
                            ) : (
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => setIsEditing(false)} style={{ background: '#333', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Hủy</button>
                                    <button onClick={handleSave} disabled={saving} style={{ background: '#d4af37', color: 'black', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>{saving ? '...' : 'Lưu'}</button>
                                </div>
                            )}
                        </div>

                        <div className="profile-row">
                            <span className="profile-label">Họ tên</span>
                            {isEditing ? (
                                <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} style={{ flex: 1, padding: '4px 8px' }} />
                            ) : (
                                <span className="profile-value">{user?.fullName || '—'}</span>
                            )}
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Email</span>
                            {isEditing ? (
                                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ flex: 1, padding: '4px 8px' }} />
                            ) : (
                                <span className="profile-value">{user?.email || '—'}</span>
                            )}
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Username</span>
                            {isEditing ? (
                                <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} style={{ flex: 1, padding: '4px 8px' }} />
                            ) : (
                                <span className="profile-value">{user?.username || '—'}</span>
                            )}
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Vai trò</span>
                            <span className="profile-value" style={{ textTransform: 'capitalize' }}>{user?.role || '—'}</span>
                        </div>
                    </div>

                    {/* Hồ sơ thợ */}
                    <div className="barber-card">
                        <h2>✂️ Hồ sơ thợ</h2>
                        {!barberInfo ? (
                            <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                                Tài khoản chưa được liên kết với hồ sơ thợ nào.
                            </p>
                        ) : (
                            <>
                                <div className="profile-row">
                                    <span className="profile-label">Tên thợ</span>
                                    <span className="profile-value">{barberInfo.name}</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">Kinh nghiệm</span>
                                    <span className="profile-value">{barberInfo.experienceYears} năm</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">SĐT</span>
                                    <span className="profile-value">{barberInfo.phone || '—'}</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">Ghế phụ trách</span>
                                    <span className="profile-value">
                                        {barberInfo.chair ? (
                                            <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 10px', borderRadius: 20, fontSize: '0.85rem' }}>
                                                {barberInfo.chair.name}
                                            </span>
                                        ) : '—'}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>


                </div>
            )}
        </BarberLayout>
    );
};

export default BarberProfilePage;
