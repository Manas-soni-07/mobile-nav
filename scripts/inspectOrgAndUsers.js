const mysql = require('mysql2/promise');
require('dotenv').config();

async function inspectUsers() {
  const url = process.env.DATABASEURL.replace(/\/sys$/, '/resortos');
  const connection = await mysql.createConnection({
    uri: url,
    ssl: { rejectUnauthorized: true },
  });

  const [cols] = await connection.query("DESCRIBE users");
  console.log("users columns:", cols.map(c => c.Field));

  const [users] = await connection.query("SELECT * FROM users");
  console.log("users rows:", users);

  await connection.end();
}

inspectUsers().catch(console.error);
