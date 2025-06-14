const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Item = sequelize.define('Item', {
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
  product_name: DataTypes.STRING,
  quantity: DataTypes.FLOAT,
  length: DataTypes.FLOAT,
  linear_meter: DataTypes.FLOAT
}, {
  tableName: 'item',
});

Item.associate = models => {
  Item.belongsTo(models.SalesOrder, { foreignKey: 'sales_order_id' });
  Item.belongsTo(models.DeliveryReceipt, { foreignKey: 'delivery_receipt_id' });
};

module.exports = Item;
