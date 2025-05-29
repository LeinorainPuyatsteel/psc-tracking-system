const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('psc_db', 'root', 'rootpass', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

module.exports = sequelize;
