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

module.exports = Status;
