const mysql = require('mysql2/promise');
require('dotenv').config();

async function inspectGuests() {
  const url = process.env.DATABASE_URL || process.env.DATABASEURL;
  const u = new URL(url);
  let dbName = u.pathname.replace(/^\//, '') || 'resortos';
  if (dbName === 'sys') dbName = 'resortos';

  const connection = await mysql.createConnection({
    host: u.hostname,
    port: parseInt(u.port, 10) || 4000,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: dbName,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  });

  console.log("=== HOTELS ===");
  const [hotels] = await connection.query("SELECT id, name, code FROM hotels");
  console.table(hotels);

  console.log("\n=== GUESTS TABLE SCHEMA & DATA ===");
  const [guestCols] = await connection.query("DESCRIBE guests");
  console.log("Columns:", guestCols.map(c => `${c.Field} (${c.Type})`));
  const [guestRows] = await connection.query("SELECT * FROM guests");
  console.table(guestRows);

  console.log("\n=== BOOKINGS TABLE SCHEMA & DATA ===");
  const [bookingCols] = await connection.query("DESCRIBE bookings");
  console.log("Columns:", bookingCols.map(c => `${c.Field} (${c.Type})`));
  const [bookingRows] = await connection.query("SELECT id, hotelId, bookingReference, guestName, guestPhone, guestEmail, status, checkInDate, checkOutDate, roomNumber, totalAmount FROM bookings");
  console.table(bookingRows);

  console.log("\n=== ROOMS WITH GUEST INFO ===");
  const [roomRows] = await connection.query("SELECT id, hotelId, roomNumber, status, currentGuestName FROM rooms WHERE currentGuestName IS NOT NULL AND currentGuestName != ''");
  console.table(roomRows);

  console.log("\n=== INVOICES GUEST INFO ===");
  const [invoiceCols] = await connection.query("DESCRIBE invoices");
  console.log("Columns:", invoiceCols.map(c => `${c.Field} (${c.Type})`));
  const [invRows] = await connection.query("SELECT id, hotelId, invoiceNumber, guestName, guestPhone, roomNumber, totalAmount, status FROM invoices");
  console.table(invRows);

  await connection.end();
}

inspectGuests().catch(console.error);
