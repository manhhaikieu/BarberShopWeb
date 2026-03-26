import React, { useState, useEffect } from 'react';
import BarberLayout from './BarberLayout';
import { barberAPI } from '../../api/apiService';
import { useAuth } from '../../hooks/AuthContext';
import './BarberLayout.css';

const BarberProfilePage = () => {
    const { user } = useAuth();
    const [barberInfo, setBarberInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        barberAPI.getMySchedule(new Date().toISOString().split('T')[0])
            .then(data => setBarberInfo(data.barber))
            .catch(err => setError(err.message || 'Không tải được hồ sơ'))
            .finally(() => setLoading(false));
    }, []);

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
                    <div className="barber-card">
                        <h2>👤 Tài khoản đăng nhập</h2>
                        <div className="profile-row">
                            <span className="profile-label">Họ tên</span>
                            <span className="profile-value">{user?.fullName || '—'}</span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Email</span>
                            <span className="profile-value">{user?.email || '—'}</span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Username</span>
                            <span className="profile-value">{user?.username || '—'}</span>
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

                    {/* Quyền hạn */}
                    <div className="barber-card" style={{ gridColumn: '1 / -1' }}>
                        <h2>🔑 Quyền truy cập</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {(user?.permissions || []).map(p => (
                                <span key={p} style={{
                                    background: '#d1fae5', color: '#065f46',
                                    padding: '4px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600
                                }}>
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </BarberLayout>
    );
};

export default BarberProfilePage;
