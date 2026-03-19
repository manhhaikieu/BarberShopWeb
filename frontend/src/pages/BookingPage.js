import React, { useState } from 'react';
import { useData } from '../hooks/DataContext';
import { useAuth } from '../hooks/AuthContext';
import './BookingPage.css';

const BookingPage = () => {
    const { services, chairs, bookings, addBooking, fetchBookings } = useData();
    const { user } = useAuth();

    const [selectedServices, setSelectedServices] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('09:00');
    const [selectedChair, setSelectedChair] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const totalDuration = selectedServices.reduce((acc, currId) => {
        const service = services.find(s => s.id === currId);
        return acc + (service ? service.duration : 0);
    }, 0);

    const totalPrice = selectedServices.reduce((acc, currId) => {
        const service = services.find(s => s.id === currId);
        return acc + (service ? Number(service.price) : 0);
    }, 0);

    const handleServiceToggle = (id) => {
        if (selectedServices.includes(id)) {
            setSelectedServices(selectedServices.filter(s => s !== id));
        } else {
            setSelectedServices([...selectedServices, id]);
        }
    };

    const handleBook = async (e) => {
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

        const startDateTime = new Date(`${date}T${time}`);

        setSubmitting(true);
        try {
            await addBooking({
                serviceIds: selectedServices,
                startTime: startDateTime.toISOString(),
                chairId: parseInt(selectedChair),
            });
            setSuccess('Đặt lịch thành công!');
            setSelectedServices([]);
            setSelectedChair('');
            await fetchBookings();
        } catch (err) {
            setError(err.message || 'Đặt lịch thất bại.');
        } finally {
            setSubmitting(false);
        }
    };

    const todayBookings = bookings.filter(b => {
        if (!b.startTime) return false;
        const bDate = new Date(b.startTime).toISOString().split('T')[0];
        return bDate === date && b.status !== 'cancelled';
    });

    return (
        <div className="booking-container">
            <h2>Đặt Lịch</h2>

            <div className="booking-grid">
                <div className="booking-form-section">
                    <form onSubmit={handleBook}>
                        <div className="section-title">1. Chọn Dịch Vụ</div>
                        <div className="services-list">
                            {services.map(service => (
                                <div
                                    key={service.id}
                                    className={`service-item ${selectedServices.includes(service.id) ? 'selected' : ''}`}
                                    onClick={() => handleServiceToggle(service.id)}
                                >
                                    <div className="service-info">
                                        <div className="service-name">{service.name}</div>
                                        <div className="service-meta">{service.duration} phút • {Number(service.price).toLocaleString()} đ</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedServices.includes(service.id)}
                                        readOnly
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="section-title">2. Chọn Ngày & Giờ</div>
                        <div className="datetime-controls">
                            <div className="form-group half">
                                <label>Ngày</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                            </div>
                            <div className="form-group half">
                                <label>Giờ bắt đầu</label>
                                <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
                            </div>
                        </div>

                        <div className="section-title">3. Chọn Ghế</div>
                        <div className="form-group">
                            <label>Ghế</label>
                            <select value={selectedChair} onChange={e => setSelectedChair(e.target.value)} required>
                                <option value="">-- Chọn ghế --</option>
                                {chairs.filter(c => c.isAvailable).map(chair => (
                                    <option key={chair.id} value={chair.id}>
                                        {chair.name} {chair.barber ? `(${chair.barber.name})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="booking-summary">
                            <div className="summary-row">
                                <span>Tổng thời gian:</span>
                                <strong>{totalDuration} phút</strong>
                            </div>
                            <div className="summary-row">
                                <span>Tổng tiền:</span>
                                <strong>{totalPrice.toLocaleString()} đ</strong>
                            </div>
                        </div>

                        {error && <div className="error-msg">{error}</div>}
                        {success && <div className="success-msg">{success}</div>}

                        <button type="submit" className="btn-book" disabled={submitting}>
                            {submitting ? 'Đang đặt...' : 'Xác Nhận Đặt Lịch'}
                        </button>
                    </form>
                </div>

                <div className="booking-info-section">
                    <h3>Lịch hẹn ngày {date}</h3>
                    {todayBookings.length === 0 ? (
                        <p className="no-bookings">Chưa có lịch hẹn nào.</p>
                    ) : (
                        <div className="bookings-list">
                            {todayBookings
                                .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                                .map(b => (
                                    <div key={b.id} className="booking-card">
                                        <div className="booking-time">
                                            {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                            {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="booking-details">
                                            <strong>{b.chair?.name || `Ghế ${b.chairId}`}</strong>
                                            <div>{b.user?.fullName || 'Khách hàng'}</div>
                                            <div className={`status-badge status-${b.status}`}>{b.status}</div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
