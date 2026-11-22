const mysql = require('mysql2/promise');
require('dotenv').config();

async function deepAudit() {
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

  console.log("==================================================");
  console.log("1. BOOKINGS BY HOTEL");
  console.log("==================================================");
  const [bkgCounts] = await connection.query(`
    SELECT hotelId, status, COUNT(*) as count 
    FROM bookings 
    GROUP BY hotelId, status
  `);
  console.table(bkgCounts);

  const [allBookings] = await connection.query(`
    SELECT id, hotelId, guestId, bookingReference, guestName, guestPhone, guestEmail, status, checkInDate, checkOutDate, roomNumber, totalAmount, createdAt
    FROM bookings
    ORDER BY hotelId, createdAt ASC
  `);
  console.log(`Total Bookings in DB: ${allBookings.length}`);
  console.table(allBookings);

  console.log("\n==================================================");
  console.log("2. GUESTS TABLE");
  console.log("==================================================");
  const [allGuests] = await connection.query(`SELECT * FROM guests`);
  console.log(`Total Guests in DB: ${allGuests.length}`);
  console.table(allGuests);

  console.log("\n==================================================");
  console.log("3. GUEST LINKAGE: bookings.guestId -> guests.id");
  console.log("==================================================");
  const [linked] = await connection.query(`
    SELECT b.id as bookingId, b.hotelId, b.guestName as bkgGuestName, b.guestPhone as bkgPhone,
           g.id as guestId, g.firstName, g.lastName, g.phone as guestPhone, g.idType, g.idNumber, g.city
    FROM bookings b
    LEFT JOIN guests g ON b.guestId = g.id
  `);
  console.table(linked);

  console.log("\n==================================================");
  console.log("4. ROOMS OCCUPIED / CURRENT GUESTS");
  console.log("==================================================");
  const [roomsWithGuests] = await connection.query(`
    SELECT r.id, r.hotelId, r.roomNumber, r.status, r.currentGuestName, r.currentBookingId,
           b.id as matchedBookingId, b.guestName as bkgGuestName
    FROM rooms r
    LEFT JOIN bookings b ON r.currentBookingId = b.id
    WHERE r.currentGuestName IS NOT NULL AND r.currentGuestName != ''
  `);
  console.table(roomsWithGuests);

  console.log("\n==================================================");
  console.log("5. INVOICES GUESTS");
  console.log("==================================================");
  const [invGuests] = await connection.query(`
    SELECT i.id, i.hotelId, i.invoiceNumber, i.bookingId, i.guestName, i.roomNumber, i.totalAmount, i.status,
           b.id as matchedBookingId
    FROM invoices i
    LEFT JOIN bookings b ON i.bookingId = b.id
  `);
  console.table(invGuests);

  console.log("\n==================================================");
  console.log("6. OTHER OPERATIONAL TABLES (Banquets, Spa, Dining, Concierge)");
  console.log("==================================================");
  const [banquets] = await connection.query(`SELECT id, hotelId, clientName, clientPhone, eventName, eventDate FROM banquet_events`);
  console.log("Banquet clients:", banquets);

  const [spa] = await connection.query(`SELECT id, hotelId, guestName, roomNumber, treatmentName, date FROM spa_bookings`);
  console.log("Spa guests:", spa);

  const [dining] = await connection.query(`SELECT id, hotelId, guestName, roomNumber, orderNumber FROM dining_orders`);
  console.log("Dining guests:", dining);

  const [concierge] = await connection.query(`SELECT id, hotelId, guestName, roomNumber, serviceTitle, date FROM concierge_bookings`);
  console.log("Concierge guests:", concierge);

  await connection.end();
}

deepAudit().catch(console.error);
