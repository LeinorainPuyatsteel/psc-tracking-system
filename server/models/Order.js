const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  customer: DataTypes.STRING,
  status: DataTypes.STRING,
});

module.exports = Order;
