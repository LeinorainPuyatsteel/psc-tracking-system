require("dotenv").config();
const sql = require("mssql");

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_HOST,
  port: parseInt(process.env.MSSQL_PORT || "1433"),
  database: process.env.MSSQL_DB,
  options: {
    encrypt: false,
    enableArithAbort: true,
  },
};

module.exports = { sql, config };
