const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  const url = process.env.DATABASEURL || process.env.DATABASE_URL;
  if (!url) {
    console.error("Error: DATABASEURL environment variable is required.");
    return;
  }
  // Switch URL to resortos database
  const resortOsUrl = url.replace(/\/sys$/, '/resortos');

  console.log("Connecting to TiDB Cloud 'resortos' database...");

  try {
    const connection = await mysql.createConnection({
      uri: resortOsUrl,
      ssl: {
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
