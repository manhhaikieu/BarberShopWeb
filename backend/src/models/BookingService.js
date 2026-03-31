const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BookingService = sequelize.define('BookingService', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    priceAtBooking: { type: DataTypes.DECIMAL(10, 2) },
  });
  return BookingService;
};
