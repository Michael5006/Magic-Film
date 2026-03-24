const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT || 3306,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
  decimalNumbers: true,
  supportBigNumbers: true,
  bigNumberStrings: true
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL exitosa');
    connection.release();
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection };