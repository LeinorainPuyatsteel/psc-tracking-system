const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const SalesOrder = sequelize.define('SalesOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true 
  },
  current_status_id: {
    type: DataTypes.INTEGER,
    defaultValue: 0,  
  },
  customer_name: DataTypes.STRING,
  customer_address: DataTypes.STRING,
  customer_contact_number: DataTypes.STRING,
}, {
  tableName: 'sales_order',
});

SalesOrder.associate = models => {
  SalesOrder.hasMany(models.DeliveryReceipt, { foreignKey: 'sales_order_id' });
  SalesOrder.hasMany(models.Transaction, { foreignKey: 'sales_order_id' });
  SalesOrder.hasMany(models.Item, { foreignKey: 'sales_order_id' });
  SalesOrder.belongsTo(models.Status, { foreignKey: 'current_status_id', as: 'status' });
};

module.exports = SalesOrder;
