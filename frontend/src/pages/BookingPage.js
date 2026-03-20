import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/DataContext';
import { useAuth } from '../hooks/AuthContext';
import { bookingAPI } from '../api/apiService';
import './BookingPage.css';

const TIME_SLOTS = [];
for (let h = 9; h <= 19; h++) {
    TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 19) TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

const BookingPage = () => {
    const { services, barbers, chairs } = useData();
    const { user } = useAuth();

    const [phone, setPhone] = useState('');
    const [fullName, setFullName] = useState('');
    const [guestCount, setGuestCount] = useState(1);
    const [selectedChair, setSelectedChair] = useState('');
    const [selectedBarber, setSelectedBarber] = useState('');
    const [serviceRows, setServiceRows] = useState([{ id: '', key: 1 }]);
    const [silentBarber, setSilentBarber] = useState(false);
    const [date, setDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setPhone(user.phone || '');
            setFullName(user.fullName || '');
        }
    }, [user]);

    const selectedServices = serviceRows
        .map(r => services.find(s => String(s.id) === String(r.id)))
        .filter(Boolean);

    const totalPrice = selectedServices.reduce((acc, s) => acc + Number(s.price), 0);
    const totalDuration = selectedServices.reduce((acc, s) => acc + Number(s.duration), 0);

    const addRow = () => setServiceRows(prev => [...prev, { id: '', key: Date.now() }]);
    const removeRow = (key) => setServiceRows(prev => prev.filter(r => r.key !== key));
    const updateRow = (key, id) => setServiceRows(prev => prev.map(r => r.key === key ? { ...r, id } : r));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (selectedServices.length === 0) {
            setError('Vui lòng chọn ít nhất 1 dịch vụ.');
            return;
        }
        if (!selectedChair) {
            setError('Vui lòng chọn ghế.');
            return;
        }
        if (!date) {
            setError('Vui lòng chọn ngày.');
            return;
        }
        if (!selectedTime) {
            setError('Vui lòng chọn khung giờ.');
            return;
        }
        setSubmitting(true);
        try {
            await bookingAPI.create({
                serviceIds: selectedServices.map(s => s.id),
                startTime: new Date(`${date}T${selectedTime}`).toISOString(),
                chairId: parseInt(selectedChair),
                barberId: selectedBarber ? parseInt(selectedBarber) : undefined,
                note: silentBarber ? 'Yêu cầu barber im lặng trong lúc phục vụ' : '',
            });
            setSuccess('Đặt lịch thành công! Chúng tôi sẽ liên hệ xác nhận sớm.');
            setSelectedChair('');
            setSelectedBarber('');
            setServiceRows([{ id: '', key: Date.now() }]);
            setDate('');
            setSelectedTime('');
            setSilentBarber(false);
            setGuestCount(1);
        } catch (err) {
            setError(err.message || 'Đặt lịch thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="bk-page">
            <form className="bk-form" onSubmit={handleSubmit}>
                <h2 className="bk-title">Đặt lịch</h2>
                <p className="bk-subtitle">Quý khách vui lòng cho biết thông tin</p>
                <p className="bk-required-note"><em>(*) Vui lòng nhập thông tin bắt buộc</em></p>

                <div className="bk-field">
                    <input className="bk-input" type="tel" placeholder="Số điện thoại *"
                        value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>
                <div className="bk-field">
                    <input className="bk-input" type="text" placeholder="Họ và tên *"
                        value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
                <div className="bk-field bk-guest-field">
                    <label className="bk-label">Tổng số khách</label>
                    <input className="bk-input bk-input-sm" type="number" min="1" max="10"
                        value={guestCount} onChange={e => setGuestCount(e.target.value)} />
                </div>

                <div className="bk-section-label">Thông tin dịch vụ</div>

                <label className="bk-label">Chọn ghế <span className="bk-req">*</span></label>
                <div className="bk-chairs">
                    {chairs.filter(c => c.isAvailable).length === 0 && (
                        <p className="bk-empty">Chưa có ghế khả dụng</p>
                    )}
                    {chairs.filter(c => c.isAvailable).map(chair => (
                        <label key={chair.id}
                            className={`bk-chair-item ${selectedChair === String(chair.id) ? 'active' : ''}`}>
                            <input type="radio" name="chair" value={chair.id}
                                checked={selectedChair === String(chair.id)}
                                onChange={() => setSelectedChair(String(chair.id))} />
                            <span className="bk-chair-name">
                                {chair.name}{chair.barber ? ` -- ${chair.barber.name}` : ''}
                            </span>
                            <span className="bk-pin">&#128205;</span>
                        </label>
                    ))}
                </div>

                <div className="bk-field">
                    <label className="bk-label">Yêu cầu kỹ thuật viên <span className="bk-req">*</span></label>
                    <div className="bk-select-wrap">
                        <select className="bk-select" value={selectedBarber}
                            onChange={e => setSelectedBarber(e.target.value)}>
                            <option value="">Chọn kỹ thuật viên</option>
                            {barbers.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                        <span className="bk-select-arrow">&#8250;</span>
                    </div>
                </div>

                <div className="bk-field">
                    <label className="bk-label">Dịch vụ <span className="bk-req">*</span></label>
                    {serviceRows.map((row) => (
                        <div key={row.key} className="bk-service-row">
                            <div className="bk-select-wrap" style={{ flex: 1 }}>
                                <select className="bk-select" value={row.id}
                                    onChange={e => updateRow(row.key, e.target.value)}>
                                    <option value="">Chọn dịch vụ</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} -- {Number(s.price).toLocaleString('vi-VN')}đ ({s.duration} phút)
                                        </option>
                                    ))}
                                </select>
                                <span className="bk-select-arrow">&#8250;</span>
                            </div>
                            {serviceRows.length > 1 && (
                                <button type="button" className="bk-remove-btn"
                                    onClick={() => removeRow(row.key)}>&#8854;</button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="bk-add-btn" onClick={addRow}>
                        + Thêm dịch vụ
                    </button>
                </div>

                <div className="bk-summary">
                    <div className="bk-summary-row">
                        <span>Tạm tính:</span>
                        <strong><em>{totalPrice.toLocaleString('vi-VN')}đ</em></strong>
                    </div>
                    <div className="bk-summary-row">
                        <span>Tổng tiền:</span>
                        <strong><em>{totalPrice.toLocaleString('vi-VN')}đ</em></strong>
                    </div>
                    <div className="bk-summary-row">
                        <span>Thời lượng dự kiến:</span>
                        <strong><em>{totalDuration} phút</em></strong>
                    </div>
                </div>

                <label className="bk-checkbox-label">
                    <input type="checkbox" checked={silentBarber}
                        onChange={e => setSilentBarber(e.target.checked)} />
                    <span>Yêu cầu barber im lặng trong lúc phục vụ</span>
                </label>

                <div className="bk-field">
                    <label className="bk-label">Ngày đặt lịch <span className="bk-req">*</span></label>
                    <input className="bk-input" type="date" min={today}
                        value={date} onChange={e => setDate(e.target.value)} required />
                </div>

                <div className="bk-field">
                    <label className="bk-label">Chọn khung giờ dịch vụ <span className="bk-req">*</span></label>
                    <div className="bk-time-grid">
                        {TIME_SLOTS.map(slot => (
                            <button key={slot} type="button"
                                className={`bk-time-btn ${selectedTime === slot ? 'active' : ''}`}
                                onClick={() => setSelectedTime(slot)}>
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>

                {error && <div className="bk-error">{error}</div>}
                {success && <div className="bk-success">{success}</div>}

                <button type="submit" className="bk-submit" disabled={submitting}>
                    {submitting ? 'Đang đặt...' : 'XÁC NHẬN ĐẶT LỊCH'}
                </button>
            </form>
        </div>
    );
};

export default BookingPage;