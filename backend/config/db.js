const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Ajuste conforme sua configuração
  database: 'furiaapp',
  port: 3306
});

module.exports = pool;