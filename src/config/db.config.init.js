const mysql = require('mysql2');
const { logger } = require('../utils/logger');
const { DB_HOST, DB_PORT, DB_USER, DB_PASS } = require('../utils/secrets');

const connection = mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS
});

connection.connect((err) => {
    if (err) logger.error(err.message);
});

module.exports = connection;