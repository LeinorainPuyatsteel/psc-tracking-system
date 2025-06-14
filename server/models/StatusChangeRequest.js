const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const StatusChangeRequest = sequelize.define(
  "StatusChangeRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    delivery_receipt_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    from_status: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    to_status: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    requested_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    }
  },
  {
    tableName: "status_change_request",
  }
);

StatusChangeRequest.associate = (models) => {
    StatusChangeRequest.belongsTo(models.DeliveryReceipt, {
        foreignKey: 'delivery_receipt_id'
    });

    StatusChangeRequest.belongsTo(models.Status, {
        foreignKey: 'from_status',
        as: 'fromStatus'
    });

    StatusChangeRequest.belongsTo(models.Status, {
        foreignKey: 'to_status',
        as: 'toStatus'
    });

    StatusChangeRequest.belongsTo(models.User, {
      foreignKey: 'requested_by',
        as: 'requestedBy'
    });

    StatusChangeRequest.belongsTo(models.User, {
      foreignKey: 'approved_by',
        as: 'approvedBy'
    });
};

module.exports = StatusChangeRequest;
