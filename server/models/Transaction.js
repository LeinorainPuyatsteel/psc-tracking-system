const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sales_order_id: {
    type: DataTypes.INTEGER,
  },
  status_id: {
    type: DataTypes.INTEGER,
    defaultValue: 0,  
  }
}, {
  tableName: 'transaction',
});

module.exports = Transaction;
