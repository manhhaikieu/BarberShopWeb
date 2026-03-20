import React, { useState } from 'react';
import { useData } from '../hooks/DataContext';
import { useAuth } from '../hooks/AuthContext';
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

        if (selectedServices.length === 0) {
            setError('Vui lòng chọn ít nhất 1 dịch vụ.');
            return;
        }
        if (!selectedTime) {
            setError('Vui lòng chọn giờ.');
            return;
        }
        if (!selectedChair) {
            setError('Vui lòng chọn ghế.');
            return;
        }

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

    const availableChairs = chairs.filter(c => c.isAvailable !== false);

    return (
        <div className="bk-page">
            <form className="bk-form" onSubmit={handleBook}>
                <div className="bk-title">Đặt lịch cắt tóc</div>
                <div className="bk-subtitle">Vui lòng điền thông tin để đặt lịch</div>
                <div className="bk-required-note">* Thông tin bắt buộc</div>

                {/* THÔNG TIN */}
                <div className="bk-section-label">Thông tin khách hàng</div>

                <label className="bk-label">Họ và tên <span className="bk-req">*</span></label>
                <div className="bk-field">
                    <input
                        className="bk-input"
                        type="text"
                        defaultValue={user?.fullName || ''}
                        placeholder="Nhập họ và tên"
                        readOnly={!!user?.fullName}
                    />
                </div>

                <label className="bk-label">Số điện thoại <span className="bk-req">*</span></label>
                <div className="bk-field">
                    <input
                        className="bk-input"
                        type="tel"
                        defaultValue={user?.phone || ''}
                        placeholder="Nhập số điện thoại"
                    />
                </div>

                {/* DỊCH VỤ */}
                <div className="bk-section-label">Dịch vụ <span className="bk-req">*</span></div>

                {services.map(sv => (
                    <div
                        key={sv.id}
                        className={`bk-chair-item${selectedServices.includes(sv.id) ? ' active' : ''}`}
                        onClick={() => handleServiceToggle(sv.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <input
                            type="checkbox"
                            checked={selectedServices.includes(sv.id)}
                            onChange={() => handleServiceToggle(sv.id)}
                        />
                        <span className="bk-chair-name">{sv.name}</span>
                        <span className="bk-pin">{sv.duration} phút • {Number(sv.price).toLocaleString('vi-VN')}đ</span>
                    </div>
                ))}

                {selectedServices.length > 0 && (
                    <div className="bk-summary" style={{ marginTop: 14 }}>
                        <div className="bk-summary-row">
                            <span>Tổng thời gian:</span>
                            <strong>{totalDuration} phút</strong>
                        </div>
                        <div className="bk-summary-row">
                            <span>Tổng tiền:</span>
                            <strong>{totalPrice.toLocaleString('vi-VN')}đ</strong>
                        </div>
                    </div>
                )}

                {/* NGÀY */}
                <div className="bk-section-label">Ngày hẹn <span className="bk-req">*</span></div>
                <div className="bk-field">
                    <input
                        className="bk-input"
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        required
                    />
                </div>

                {/* GIỜ */}
                <div className="bk-section-label">Giờ hẹn <span className="bk-req">*</span></div>
                <div className="bk-time-grid">
                    {TIME_SLOTS.map(t => (
                        <button
                            key={t}
                            type="button"
                            className={`bk-time-btn${selectedTime === t ? ' active' : ''}`}
                            onClick={() => setSelectedTime(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* GHẾ */}
                <div className="bk-section-label">Chọn ghế <span className="bk-req">*</span></div>
                {availableChairs.length === 0 ? (
                    <div className="bk-empty">Hiện không có ghế trống.</div>
                ) : (
                    <div className="bk-chairs">
                        {availableChairs.map(chair => (
                            <label
                                key={chair.id}
                                className={`bk-chair-item${selectedChair === String(chair.id) ? ' active' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="chair"
                                    value={chair.id}
                                    checked={selectedChair === String(chair.id)}
                                    onChange={() => setSelectedChair(String(chair.id))}
                                />
                                <span className="bk-chair-name">{chair.name}</span>
                                {chair.barber && (
                                    <span className="bk-pin">📍 {chair.barber.name}</span>
                                )}
                            </label>
                        ))}
                    </div>
                )}

                {/* GHI CHÚ */}
                <div className="bk-section-label">Ghi chú</div>
                <div className="bk-field">
                    <input
                        className="bk-input"
                        type="text"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Yêu cầu đặc biệt (không bắt buộc)"
                    />
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
