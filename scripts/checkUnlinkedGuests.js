const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
  const u = new URL(process.env.DATABASE_URL);
  const conn = await mysql.createConnection({
    host: u.hostname, port: u.port || 4000, user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password), database: 'resortos',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  const [missingFromBookings] = await conn.query(`
    SELECT r.id as roomId, r.hotelId, r.roomNumber, r.status, r.currentGuestName, r.currentBookingId, r.category, r.ratePerNight
    FROM rooms r
    WHERE r.currentGuestName IS NOT NULL 
      AND r.currentGuestName != ''
      AND r.currentGuestName NOT IN (SELECT guestName FROM bookings WHERE hotelId = r.hotelId)
  `);
  console.log('Occupied Rooms with guests NOT in bookings table:');
  console.table(missingFromBookings);

  const [allVillaBookings] = await conn.query(`SELECT COUNT(*) as c FROM bookings WHERE hotelId = 'h-villa'`);
  const [allNavkarBookings] = await conn.query(`SELECT COUNT(*) as c FROM bookings WHERE hotelId = 'h-navkar'`);
  console.log(`Bookings in DB - The Villa: ${allVillaBookings[0].c}, Navkar Palace: ${allNavkarBookings[0].c}`);

  await conn.end();
}
test().catch(console.error);
