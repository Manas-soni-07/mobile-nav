/**
 * ResortOS - TiDB Cloud Database Connection Pool
 * Configured with SSL/TLS for TiDB Cloud Serverless Cluster (AWS Tokyo)
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const rawUrl = process.env.DATABASEURL || process.env.DATABASE_URL || "";
if (!rawUrl) {
  console.warn("⚠️ Warning: DATABASEURL environment variable is not defined.");
}
const targetDbUrl = rawUrl.replace(/\/sys$/, '/resortos');

const pool = mysql.createPool({
  uri: targetDbUrl,
  ssl: {
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Database query duration logging wrapper (Zero passwords/secrets logged)
const originalQuery = pool.query.bind(pool);
pool.query = async function (sql, values) {
  const start = Date.now();
  try {
    const result = await originalQuery(sql, values);
    const duration = Date.now() - start;
    const sqlPreview = typeof sql === 'string' 
      ? sql.trim().replace(/\s+/g, ' ').substring(0, 75) 
      : 'query';
    console.log(`  [DB QUERY] duration=${duration}ms | ${sqlPreview}...`);
    return result;
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`  [DB ERROR] duration=${duration}ms | ${err.message}`);
    if (err.stack) {
      console.error(err.stack);
    }
    throw err;
  }
};

pool.getConnection()
  .then((conn) => {
    console.log("✓ TiDB Cloud MySQL pool initialized and connected to 'resortos' database!");
    conn.release();
  })
  .catch((err) => {
    console.error("✗ Error connecting to TiDB Cloud pool:", err.message);
  });

module.exports = pool;
