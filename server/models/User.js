const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  user_type: DataTypes.STRING,
}, {
  tableName: 'user',
});

module.exports = User;
