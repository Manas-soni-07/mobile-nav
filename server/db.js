/**
 * ResortOS - TiDB Cloud Database Connection Pool
 * Configured with SSL/TLS for TiDB Cloud Serverless Cluster (AWS Tokyo)
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const rawUrl = process.env.DATABASE_URL || process.env.DATABASEURL || "";
if (!rawUrl) {
  console.warn("⚠️ Warning: DATABASE_URL / DATABASEURL environment variable is not defined.");
}

let poolConfig;
try {
  const u = new URL(rawUrl);
  let dbName = u.pathname.replace(/^\//, '') || 'resortos';
  if (dbName === 'sys') dbName = 'resortos';

  poolConfig = {
    host: u.hostname,
    port: parseInt(u.port, 10) || 4000,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: dbName,
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 15000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  };
} catch {
  const targetDbUrl = rawUrl.replace(/\/sys(?=[/?#]|$)/, '/resortos');
  poolConfig = {
    uri: targetDbUrl,
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
}

const pool = mysql.createPool(poolConfig);

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
