const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_STORAGE || './barbershop.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

module.exports = sequelize;
