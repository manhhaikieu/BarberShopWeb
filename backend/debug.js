const { Booking, Barber } = require('./src/models');
(async () => {
    try {
        const bookings = await Booking.findAll({ raw: true });
        console.log('Bookings:', bookings);
        const barbers = await Barber.findAll({ raw: true });
        console.log('Barbers:', barbers);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
