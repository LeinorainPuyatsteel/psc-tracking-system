require('dotenv').config();
console.log("Loaded env DB:", process.env.MYSQL_DB, process.env.MYSQL_USER);

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.MYSQL_DB,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASS,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;
