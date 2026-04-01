// const mysql = require("mysql2");
const helperFunction = require("../helper/helperFunction");
// const { logger } = require('../utils/logger');
const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = require("../utils/secrets");

// const connection = mysql.createConnection({
//     host: DB_HOST,
//     user: DB_USER,
//     password: DB_PASS,
//     database: DB_NAME
// });

var db_config = {
  connectionLimit: 10,
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
};

var connection = helperFunction.handleDisconnect(db_config);

// connection.connect((err) => {
//     if (err) logger.error(err.message);
//     else logger.info('Database connected')
// });

module.exports = connection;