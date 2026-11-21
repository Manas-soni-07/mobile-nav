const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  const url = process.env.DATABASE_URL || process.env.DATABASEURL;
  if (!url) {
    console.error("Error: DATABASE_URL environment variable is required.");
    return;
  }

  console.log("Connecting to TiDB Cloud 'resortos' database...");

  try {
    const u = new URL(url);
    let dbName = u.pathname.replace(/^\//, '') || 'resortos';
    if (dbName === 'sys') dbName = 'resortos';

    const connection = await mysql.createConnection({
      host: u.hostname,
      port: parseInt(u.port, 10) || 4000,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: dbName,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      },
    });

    console.log("SUCCESS: Connected to 'resortos' database!");

    const [tables] = await connection.query("SHOW TABLES");
    console.log("Existing Tables in 'resortos':", tables.map(t => Object.values(t)[0]));

    for (const t of tables) {
      const tableName = Object.values(t)[0];
      const [countResult] = await connection.query(`SELECT COUNT(*) AS cnt FROM \`${tableName}\``);
      console.log(`Table '${tableName}' row count:`, countResult[0].cnt);
    }

    await connection.end();
  } catch (error) {
    console.error("Connection Error:", error.message);
  }
}

checkDatabase();
