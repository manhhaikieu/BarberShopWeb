const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Service = sequelize.define('Service', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false }, // phút
    description: { type: DataTypes.TEXT },
  });
  return Service;
};
