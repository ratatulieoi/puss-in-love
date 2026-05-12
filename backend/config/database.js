const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    socketPath: process.env.DB_SOCKET || '/run/mysqld/mysqld.sock',
    user: process.env.DB_USER || 'glam',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'puss_in_love',
    connectionLimit: 10
});

module.exports = pool;
