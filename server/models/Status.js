const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Status = sequelize.define('Status', {
  id: { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  status: DataTypes.STRING,
}, {
  tableName: 'status',
});

Status.associate = models => {
  Status.hasMany(models.SalesOrder, { foreignKey: 'current_status_id' });
  Status.hasMany(models.DeliveryReceipt, { foreignKey: 'current_status_id' });
  Status.hasMany(models.Transaction, { foreignKey: 'status_id' });
};

module.exports = Status;
