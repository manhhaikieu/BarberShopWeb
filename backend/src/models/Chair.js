const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Chair = sequelize.define('Chair', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
  });
  return Chair;
};
