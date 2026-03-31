const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductSale = sequelize.define('ProductSale', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    saleDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  });
  return ProductSale;
};
