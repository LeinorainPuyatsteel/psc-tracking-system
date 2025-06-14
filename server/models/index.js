const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const SalesOrder = require('./SalesOrder');
const DeliveryReceipt = require('./DeliveryReceipt');
const Item = require('./Item');
const Transaction = require('./Transaction');
const Status = require('./Status');
const User = require('./User');
const StatusChangeRequest = require('./StatusChangeRequest');

const models = {
  SalesOrder,
  DeliveryReceipt,
  Item,
  Transaction,
  Status,
  User,
  StatusChangeRequest
};

// Run associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};
