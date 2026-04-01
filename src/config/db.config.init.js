const mysql = require("mysql2");
const { logger } = require("../utils/logger");
const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = require("../utils/secrets");

const connection = mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
});

connection.connect((err) => {
    if (err) logger.error(err.message);
});

module.exports = connection;