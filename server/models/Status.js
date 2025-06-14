const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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

  Status.hasMany(models.StatusChangeRequest, {
    foreignKey: 'from_status',
    as: 'fromRequests'
  });

  Status.hasMany(models.StatusChangeRequest, {
    foreignKey: 'to_status',
    as: 'toRequests'
  });
};

module.exports = Status;
