const Sequelize = require('sequelize');
const sequelize = require('../database');

const SalesOrder = require('./SalesOrder');
const DeliveryReceipt = require('./DeliveryReceipt');
const Item = require('./Item');
const Transaction = require('./Transaction');
const Status = require('./Status');
const User = require('./User');

const models = {
  SalesOrder,
  DeliveryReceipt,
  Item,
  Transaction,
  Status,
  User
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
