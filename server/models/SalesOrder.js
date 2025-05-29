const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const SalesOrder = sequelize.define('SalesOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true 
  },
  customer: DataTypes.STRING,
  current_status_id: {
    type: DataTypes.INTEGER,
    defaultValue: 0,  
  }
}, {
  tableName: 'sales_order',
});

module.exports = SalesOrder;
