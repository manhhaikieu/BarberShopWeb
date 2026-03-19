const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Barber = sequelize.define('Barber', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    experienceYears: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    phone: { type: DataTypes.STRING(20) },
    avatar: { type: DataTypes.STRING },
  });
  return Barber;
};
