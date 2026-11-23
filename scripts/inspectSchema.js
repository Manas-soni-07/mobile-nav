const mysql = require('mysql2/promise');
require('dotenv').config();

async function inspectSchema() {
  const url = process.env.DATABASEURL.replace(/\/sys$/, '/resortos');
  const connection = await mysql.createConnection({
    uri: url,
    ssl: { rejectUnauthorized: true },
  });

  const [hotels] = await connection.query("SELECT * FROM hotels");
  console.log("Current hotels in DB:", hotels);

  const [rooms] = await connection.query("SELECT * FROM rooms LIMIT 3");
  console.log("Sample rooms in DB:", rooms);

  const [hotelCols] = await connection.query("DESCRIBE hotels");
  console.log("hotels schema:", hotelCols.map(c => `${c.Field} (${c.Type})`));

  const [roomCols] = await connection.query("DESCRIBE rooms");
  console.log("rooms schema:", roomCols.map(c => `${c.Field} (${c.Type})`));

  const [bookingCols] = await connection.query("DESCRIBE bookings");
  console.log("bookings schema:", bookingCols.map(c => `${c.Field} (${c.Type})`));

  const [tables] = await connection.query("SHOW TABLES");
  console.log("All tables:", tables.map(t => Object.values(t)[0]));

  await connection.end();
}

inspectSchema().catch(console.error);
