const mysql = require('mysql2/promise');
require('dotenv').config();

async function testExportQuery() {
  const u = new URL(process.env.DATABASE_URL);
  const conn = await mysql.createConnection({
    host: u.hostname, port: u.port || 4000, user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password), database: 'resortos',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  for (const hotelId of ['h-villa', 'h-navkar']) {
    console.log(`\n======================================================`);
    console.log(`QUERYING GUESTS FOR: ${hotelId}`);
    console.log(`======================================================`);

    const query = `
      SELECT 
        b.id AS bookingId,
        b.hotelId,
        h.name AS hotelName,
        COALESCE(b.bookingReference, b.id) AS bookingReference,
        b.guestName,
        COALESCE(b.guestPhone, g.phone, '') AS guestPhone,
        COALESCE(b.guestEmail, g.email, '') AS guestEmail,
        COALESCE(b.roomNumber, r.roomNumber, '') AS roomNumber,
        COALESCE(b.roomCategory, b.roomType, r.category, '') AS roomCategory,
        DATE_FORMAT(b.checkInDate, '%Y-%m-%d') AS checkInDate,
        DATE_FORMAT(b.checkOutDate, '%Y-%m-%d') AS checkOutDate,
        COALESCE(b.nightsCount, DATEDIFF(b.checkOutDate, b.checkInDate), 1) AS nightsCount,
        COALESCE(b.totalGuests, 1) AS numberOfGuests,
        b.status AS bookingStatus,
        CAST(COALESCE(b.totalAmount, 0) AS DECIMAL(12,2)) AS totalAmount,
        CAST(COALESCE(b.depositPaid, b.advanceAmount, 0) AS DECIMAL(12,2)) AS depositPaid,
        COALESCE(b.paymentStatus, CASE WHEN b.depositPaid >= b.totalAmount THEN 'paid' ELSE 'partial' END) AS paymentStatus,
        COALESCE(b.paymentMethod, 'UPI') AS paymentMethod,
        COALESCE(b.bookingType, 'normal') AS bookingType,
        COALESCE(g.idType, '') AS idType,
        COALESCE(g.idNumber, '') AS idNumber,
        COALESCE(g.city, '') AS cityOfOrigin,
        COALESCE(b.notes, g.specialRequests, '') AS notes,
        DATE_FORMAT(b.createdAt, '%Y-%m-%d %H:%i') AS createdAt
      FROM bookings b
      JOIN hotels h ON b.hotelId = h.id
      LEFT JOIN guests g ON b.guestId = g.id
      LEFT JOIN rooms r ON b.roomId = r.id
      WHERE b.hotelId = ?

      UNION ALL

      SELECT 
        COALESCE(r.currentBookingId, CONCAT('rm-stay-', r.roomNumber)) AS bookingId,
        r.hotelId,
        h.name AS hotelName,
        CONCAT(h.code, '-ROOM-', r.roomNumber) AS bookingReference,
        r.currentGuestName AS guestName,
        '' AS guestPhone,
        '' AS guestEmail,
        r.roomNumber,
        r.category AS roomCategory,
        DATE_FORMAT(r.updatedAt, '%Y-%m-%d') AS checkInDate,
        DATE_FORMAT(DATE_ADD(r.updatedAt, INTERVAL 3 DAY), '%Y-%m-%d') AS checkOutDate,
        3 AS nightsCount,
        2 AS numberOfGuests,
        'CHECKED_IN' AS bookingStatus,
        CAST(COALESCE(r.ratePerNight * 3, 0) AS DECIMAL(12,2)) AS totalAmount,
        CAST(COALESCE(r.ratePerNight * 3, 0) AS DECIMAL(12,2)) AS depositPaid,
        'paid' AS paymentStatus,
        'UPI' AS paymentMethod,
        'normal' AS bookingType,
        '' AS idType,
        '' AS idNumber,
        '' AS cityOfOrigin,
        'In-house occupied room check-in' AS notes,
        DATE_FORMAT(r.updatedAt, '%Y-%m-%d %H:%i') AS createdAt
      FROM rooms r
      JOIN hotels h ON r.hotelId = h.id
      WHERE r.hotelId = ?
        AND r.status IN ('OCCUPIED', 'CLEANING')
        AND r.currentGuestName IS NOT NULL 
        AND r.currentGuestName != ''
        AND r.currentGuestName NOT IN (SELECT guestName FROM bookings WHERE hotelId = r.hotelId)
        AND (r.currentBookingId IS NULL OR r.currentBookingId NOT IN (SELECT id FROM bookings WHERE hotelId = r.hotelId))

      ORDER BY createdAt ASC, checkInDate ASC
    `;

    const [rows] = await conn.query(query, [hotelId, hotelId]);
    console.log(`Total Rows for ${hotelId}: ${rows.length}`);
    console.table(rows.map(r => ({
      bookingReference: r.bookingReference,
      guestName: r.guestName,
      roomNumber: r.roomNumber,
      status: r.bookingStatus,
      checkIn: r.checkInDate,
      checkOut: r.checkOutDate,
      total: r.totalAmount
    })));
  }

  await conn.end();
}

testExportQuery().catch(console.error);
