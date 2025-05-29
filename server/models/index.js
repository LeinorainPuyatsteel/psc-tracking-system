// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database');

// Import model definitions
const SalesOrder = require('./SalesOrder');
const Status = require('./Status');
const Transaction = require('./Transaction');
const User = require('./User');

// Define associations
SalesOrder.hasMany(Transaction, { foreignKey: 'sales_order_id' });
Transaction.belongsTo(SalesOrder, { foreignKey: 'sales_order_id' });

SalesOrder.belongsTo(Status, { foreignKey: 'current_status_id', as: 'status' });
Transaction.belongsTo(Status, { foreignKey: 'status_id', as: 'status' });

// Export everything
module.exports = {
  sequelize,
  SalesOrder,
  Transaction,
  Status,
  User
};
