const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sales_order_id: {
    type: DataTypes.INTEGER,
  },
  delivery_receipt_id: {
    type: DataTypes.INTEGER,
  },
  status_id: {
    type: DataTypes.INTEGER,
    defaultValue: 0,  
  },
  image_url: {
  type: DataTypes.STRING,
  allowNull: true,
  }
}, {
  tableName: 'transaction',
});

Transaction.associate = models => {
  Transaction.belongsTo(models.SalesOrder, { foreignKey: 'sales_order_id' });
  Transaction.belongsTo(models.DeliveryReceipt, { foreignKey: 'delivery_receipt_id' });
  Transaction.belongsTo(models.Status, {
    foreignKey: "status_id",
    as: "status",
  });
};

module.exports = Transaction;
