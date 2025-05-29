const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('psc_db', 'root', 'rootpass', {
  host: 'localhost',
  port: '3307',
  dialect: 'mysql',
  logging: false
});

module.exports = sequelize;
