const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const DeliveryReceipt = sequelize.define('DeliveryReceipt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true 
  },
  sales_order_id: {
    type: DataTypes.INTEGER,
  },
  current_status_id: {
    type: DataTypes.INTEGER,
    defaultValue: 0,  
  },
  item_name: DataTypes.STRING,
  item_quantity: DataTypes.STRING,
  item_mt: DataTypes.STRING,
  item_length: DataTypes.STRING,
}, {
  tableName: 'delivery_receipt',
});

module.exports = DeliveryReceipt;
