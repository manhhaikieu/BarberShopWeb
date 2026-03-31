const { Booking, Barber } = require('./src/models');
(async () => {
    try {
        console.log('Starting DB fix...');
        const bookings = await Booking.findAll({ where: { barberId: null } });
        console.log(`Found ${bookings.length} bookings with null barberId.`);
        for(let booking of bookings) {
            const chairId = booking.chairId;
            const barber = await Barber.findOne({ where: { chairId } });
            if (barber) {
                await booking.update({ barberId: barber.id });
                console.log(`Updated booking ${booking.id} to barberId ${barber.id}`);
            }
        }
        console.log('Finished updating.');
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
})();
