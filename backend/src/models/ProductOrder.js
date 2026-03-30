const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductOrder = sequelize.define('ProductOrder', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customerName: { type: DataTypes.STRING, allowNull: false },
    customerPhone: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { 
      type: DataTypes.ENUM('Pending', 'Confirmed', 'Shipped', 'Completed', 'Cancelled'), 
      defaultValue: 'Pending' 
    },
    orderDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  });
  return ProductOrder;
};
