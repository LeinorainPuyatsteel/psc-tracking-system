// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database');

// Import model definitions
const SalesOrder = require('./SalesOrder');
const DeliveryReceipt = require('./DeliveryReceipt');
const Status = require('./Status');
const Transaction = require('./Transaction');
const User = require('./User');

// Define associations

// Sales Order to Delivery Receipt
SalesOrder.hasMany(DeliveryReceipt, { foreignKey: 'sales_order_id' });
DeliveryReceipt.belongsTo(SalesOrder, { foreignKey: 'sales_order_id' });

// Sales Order to Transaction
SalesOrder.hasMany(Transaction, { foreignKey: 'sales_order_id' });
Transaction.belongsTo(SalesOrder, { foreignKey: 'sales_order_id' });

// Delivery Receipt to Transaction
DeliveryReceipt.hasMany(Transaction, { foreignKey: 'delivery_receipt_id' });
Transaction.belongsTo(DeliveryReceipt, { foreignKey: 'delivery_receipt_id' });

// Status
SalesOrder.belongsTo(Status, { foreignKey: 'current_status_id', as: 'status' });
DeliveryReceipt.belongsTo(Status, { foreignKey: 'current_status_id', as: 'status' });
Transaction.belongsTo(Status, { foreignKey: 'status_id', as: 'status' });



// Export everything
module.exports = {
  sequelize,
  SalesOrder,
  DeliveryReceipt,
  Transaction,
  Status,
  User
};
