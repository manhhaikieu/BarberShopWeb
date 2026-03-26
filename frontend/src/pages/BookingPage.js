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
    const { services, chairs, addBooking, fetchBookings } = useData();
    const { user } = useAuth();

    const [selectedServices, setSelectedServices] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedChair, setSelectedChair] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [dailyBookings, setDailyBookings] = useState([]);

    useEffect(() => {
        if (!date) return;
        bookingAPI.getBusySlots(date)
            .then(res => setDailyBookings(res.bookings || []))
            .catch(err => console.error('Lỗi lấy lịch bận:', err));
    }, [date, success]);

    const handleServiceToggle = (id) => {
        setSelectedServices(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const totalDuration = selectedServices.reduce((acc, id) => {
        const s = services.find(sv => sv.id === id);
        return acc + (s ? s.duration : 0);
    }, 0);

    const totalPrice = selectedServices.reduce((acc, id) => {
        const s = services.find(sv => sv.id === id);
        return acc + (s ? Number(s.price) : 0);
    }, 0);

    const handleBook = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (selectedServices.length === 0) { setError('Vui lòng chọn ít nhất 1 dịch vụ.'); return; }
        if (!selectedTime) { setError('Vui lòng chọn giờ.'); return; }
        if (!selectedChair) { setError('Vui lòng chọn ghế.'); return; }

        const startDateTime = new Date(`${date}T${selectedTime}`);
        setSubmitting(true);
        try {
            await addBooking({
                serviceIds: selectedServices,
                startTime: startDateTime.toISOString(),
                chairId: parseInt(selectedChair),
                note: notes,
            });
            setSuccess('Đặt lịch thành công!');
            setSelectedServices([]);
            setSelectedTime('');
            setSelectedChair('');
            setNotes('');
            await fetchBookings();
        } catch (err) {
            setError(err.message || 'Đặt lịch thất bại.');
        } finally {
            setSubmitting(false);
        }
    };

    const activeChairs = chairs.filter(c => c.isAvailable !== false);

    const isTimeSlotValid = (timeStr) => {
        const dur = totalDuration || 30;
        const startObj = new Date(`${date}T${timeStr}`);
        const endObj = new Date(startObj.getTime() + dur * 60000);
        if (startObj <= new Date()) return false;
        const busyChairIds = dailyBookings.filter(b => {
            const bStart = new Date(b.startTime);
            const bEnd = new Date(b.endTime);
            return bStart < endObj && bEnd > startObj;
        }).map(b => b.chairId);
        return activeChairs.filter(c => !busyChairIds.includes(c.id)).length > 0;
    };

    const busyChairIdsAtSelectedTime = selectedTime ? dailyBookings.filter(b => {
        const startObj = new Date(`${date}T${selectedTime}`);
        const endObj = new Date(startObj.getTime() + (totalDuration || 30) * 60000);
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        return bStart < endObj && bEnd > startObj;
    }).map(b => b.chairId) : [];

    const dynamicallyAvailableChairs = activeChairs.filter(c => !busyChairIdsAtSelectedTime.includes(c.id));

    return (
        <div className="bk-page">
            <div className="bk-wrapper">
                <div className="bk-header">
                    <h1 className="bk-title">Đặt lịch <span>cắt tóc</span></h1>
                    <p className="bk-subtitle">Chọn dịch vụ, ngày giờ và ghế phù hợp — chúng tôi sẽ lo phần còn lại.</p>
                </div>

                <form onSubmit={handleBook}>
                    <div className="bk-body">
                        <div className="bk-col-left">
                            <div className="bk-card">
                                <div className="bk-card-title">👤 Thông tin khách hàng</div>
                                <div className="bk-field">
                                    <label className="bk-label">Họ và tên</label>
                                    <input className="bk-input" type="text" defaultValue={user?.fullName || ''} placeholder="Nhập họ và tên" readOnly={!!user?.fullName} />
                                </div>
                                <div className="bk-field">
                                    <label className="bk-label">Số điện thoại</label>
                                    <input className="bk-input" type="tel" defaultValue={user?.phone || ''} placeholder="Nhập số điện thoại" />
                                </div>
                            </div>

                            <div className="bk-card">
                                <div className="bk-card-title">✂️ Dịch vụ</div>
                                <div className="bk-service-list">
                                    {services.map(sv => (
                                        <div key={sv.id} className={`bk-service-item${selectedServices.includes(sv.id) ? ' active' : ''}`} onClick={() => handleServiceToggle(sv.id)}>
                                            <input className="bk-service-check" type="checkbox" checked={selectedServices.includes(sv.id)} onChange={() => handleServiceToggle(sv.id)} />
                                            <span className="bk-service-name">{sv.name}</span>
                                            <span className="bk-service-meta">{sv.duration} phút · {Number(sv.price).toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    ))}
                                </div>
                                {selectedServices.length > 0 && (
                                    <div className="bk-summary">
                                        <div className="bk-summary-row"><span>Tổng thời gian</span><strong>{totalDuration} phút</strong></div>
                                        <div className="bk-summary-row"><span>Tổng tiền</span><strong>{totalPrice.toLocaleString('vi-VN')}đ</strong></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bk-col-right">
                            <div className="bk-card">
                                <div className="bk-card-title">📅 Ngày & Giờ hẹn</div>
                                <div className="bk-field">
                                    <label className="bk-label">Ngày hẹn</label>
                                    <input className="bk-input" type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={e => { setDate(e.target.value); setSelectedTime(''); setSelectedChair(''); }} required />
                                </div>
                                <div className="bk-field">
                                    <label className="bk-label">Khung giờ</label>
                                    <div className="bk-time-grid">
                                        {TIME_SLOTS.map(t => {
                                            const valid = isTimeSlotValid(t);
                                            return (
                                                <button key={t} type="button" disabled={!valid} className={`bk-time-btn${selectedTime === t ? ' active' : ''}${!valid ? ' disabled' : ''}`} onClick={() => { if (valid) { setSelectedTime(t); setSelectedChair(''); } }}>{t}</button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="bk-card">
                                <div className="bk-card-title">💺 Chọn ghế</div>
                                {!selectedTime ? (
                                    <p className="bk-hint">Vui lòng chọn giờ hẹn trước để xem trạng thái ghế.</p>
                                ) : dynamicallyAvailableChairs.length === 0 ? (
                                    <p className="bk-no-slots">Hết ghế trống lúc {selectedTime}. Vui lòng chọn giờ khác.</p>
                                ) : (
                                    <div className="bk-chair-list">
                                        {activeChairs.map(chair => {
                                            const isBusy = busyChairIdsAtSelectedTime.includes(chair.id);
                                            return (
                                                <label key={chair.id} className={`bk-chair-item${selectedChair === String(chair.id) ? ' active' : ''}${isBusy ? ' disabled' : ''}`}>
                                                    <input className="bk-chair-radio" type="radio" name="chair" value={chair.id} checked={selectedChair === String(chair.id)} disabled={isBusy} onChange={() => !isBusy && setSelectedChair(String(chair.id))} />
                                                    <span className="bk-chair-name">{chair.name}</span>
                                                    {chair.barber && <span className="bk-chair-barber">{chair.barber.name}</span>}
                                                    {isBusy && <span className="bk-busy-badge">Đã có khách</span>}
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="bk-card">
                                <div className="bk-card-title">📝 Ghi chú</div>
                                <div className="bk-field">
                                    <input className="bk-input" type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Yêu cầu đặc biệt (không bắt buộc)" />
                                </div>
                            </div>

                            {error && <div className="bk-error">{error}</div>}
                            {success && <div className="bk-success">{success}</div>}

                            <button type="submit" className="bk-submit" disabled={submitting}>
                                {submitting ? 'Đang đặt lịch...' : 'Xác nhận đặt lịch'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingPage;
