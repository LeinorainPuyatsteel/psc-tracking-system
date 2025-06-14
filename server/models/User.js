const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  role: DataTypes.STRING,
}, {
  tableName: 'user',
});

User.associate = models => {
  User.hasMany(models.StatusChangeRequest, { foreignKey: 'approved_by' });
};

module.exports = User;
