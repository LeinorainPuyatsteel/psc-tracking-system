const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const DeliveryReceipt = sequelize.define('DeliveryReceipt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  sales_order_id: {
    type: DataTypes.INTEGER,
  },
  current_status_id: {
    type: DataTypes.INTEGER,
    defaultValue: 0,  
  },
  trucking_name: {
    type: DataTypes.STRING,
  },
  plate_number: {
    type: DataTypes.STRING,
    defaultValue: 0,  
  },
  truck_type: {
    type: DataTypes.STRING,
    defaultValue: 0,  
  },
}, {
  tableName: 'delivery_receipt',
});

DeliveryReceipt.associate = models => {
    DeliveryReceipt.belongsTo(models.SalesOrder, { foreignKey: 'sales_order_id' });
    DeliveryReceipt.hasMany(models.Transaction, { foreignKey: 'delivery_receipt_id' });
    DeliveryReceipt.belongsTo(models.Status, {
      foreignKey: "current_status_id",
      as: "status",
    });
    DeliveryReceipt.hasMany(models.Item, { foreignKey: 'delivery_receipt_id' });
};

module.exports = DeliveryReceipt;
