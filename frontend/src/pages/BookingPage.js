import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/DataContext';
import { useAuth } from '../hooks/AuthContext';
import { SEATS } from '../api/mockData';
import './BookingPage.css';

const BookingPage = () => {
    const { services, bookings, addBooking } = useData();
    const { user } = useAuth();

    // State
    const [selectedServices, setSelectedServices] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('09:00');
    const [selectedSeat, setSelectedSeat] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Derived State
    const totalDuration = selectedServices.reduce((acc, currId) => {
        const service = services.find(s => s.id === currId);
        return acc + (service ? service.duration : 0);
    }, 0);

    const totalPrice = selectedServices.reduce((acc, currId) => {
        const service = services.find(s => s.id === currId);
        return acc + (service ? service.price : 0);
    }, 0);

    const handleServiceToggle = (id) => {
        if (selectedServices.includes(id)) {
            setSelectedServices(selectedServices.filter(s => s !== id));
        } else {
            setSelectedServices([...selectedServices, id]);
        }
    };

    const handleBook = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (selectedServices.length === 0) {
            setError('Please select at least one service.');
            return;
        }
        if (!selectedSeat) {
            setError('Please select a seat.');
            return;
        }

        // Calculate Time Ranges
        const startDateTime = new Date(`${date}T${time}`);
        const endDateTime = new Date(startDateTime.getTime() + totalDuration * 60000);

        // Check Availability
        const isConflict = bookings.some(booking => {
            if (booking.seatId !== parseInt(selectedSeat) || booking.date !== date) return false;

            const bStart = new Date(booking.startTime);
            const bEnd = new Date(booking.endTime);

            // Overlap check
            return (startDateTime < bEnd && endDateTime > bStart);
        });

        if (isConflict) {
            setError('This seat is already booked for the selected time range.');
            return;
        }

        // Create Booking
        const newBooking = {
            userId: user.id,
            userName: user.name,
            serviceIds: selectedServices,
            seatId: parseInt(selectedSeat),
            date: date,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            totalPrice: totalPrice,
            status: 'Confirmed'
        };

        addBooking(newBooking);
        setSuccess('Booking successfully confirmed!');
        // Reset form slightly
        setSelectedServices([]);
    };

    return (
        <div className="booking-container">
            <h2>Book a Service</h2>

            <div className="booking-grid">
                {/* Left Column: Form */}
                <div className="booking-form-section">
                    <form onSubmit={handleBook}>
                        <div className="section-title">1. Choose Services</div>
                        <div className="services-list">
                            {services.map(service => (
                                <div
                                    key={service.id}
                                    className={`service-item ${selectedServices.includes(service.id) ? 'selected' : ''}`}
                                    onClick={() => handleServiceToggle(service.id)}
                                >
                                    <div className="service-info">
                                        <div className="service-name">{service.name}</div>
                                        <div className="service-meta">{service.duration} mins • {service.price.toLocaleString()} đ</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedServices.includes(service.id)}
                                        readOnly
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="section-title">2. Choose Date & Time</div>
                        <div className="datetime-controls">
                            <div className="form-group half">
                                <label>Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                            </div>
                            <div className="form-group half">
                                <label>Start Time</label>
                                <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
                            </div>
                        </div>

                        <div className="section-title">3. Choose Seat</div>
                        <div className="form-group">
                            <label>Seat Selection</label>
                            <select value={selectedSeat} onChange={e => setSelectedSeat(e.target.value)} required>
                                <option value="">-- Select a Seat --</option>
                                {SEATS.map(seat => (
                                    <option key={seat.id} value={seat.id}>{seat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="booking-summary">
                            <div className="summary-row">
                                <span>Total Duration:</span>
                                <strong>{totalDuration} mins</strong>
                            </div>
                            <div className="summary-row">
                                <span>Total Price:</span>
                                <strong>{totalPrice.toLocaleString()} đ</strong>
                            </div>
                        </div>

                        {error && <div className="error-msg">{error}</div>}
                        {success && <div className="success-msg">{success}</div>}

                        <button type="submit" className="btn-book">Confirm Booking</button>
                    </form>
                </div>

                {/* Right Column: Existing Bookings (For visibility) */}
                <div className="booking-info-section">
                    <h3>Today's Schedule ({date})</h3>
                    {bookings.filter(b => b.date === date).length === 0 ? (
                        <p className="no-bookings">No bookings for this date yet.</p>
                    ) : (
                        <div className="bookings-list">
                            {bookings
                                .filter(b => b.date === date)
                                .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                                .map(b => (
                                    <div key={b.id} className="booking-card">
                                        <div className="booking-time">
                                            {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                            {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="booking-details">
                                            <strong>{SEATS.find(s => s.id === b.seatId)?.name}</strong>
                                            <div>{b.userName}</div>
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
