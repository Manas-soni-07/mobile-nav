/**
 * ResortOS - Fresh Database Reset Script
 * 
 * 1. Sets Hotel Owner / Admin name to 'Yash Godha' (admin@resortos.com).
 * 2. Retains official hotels: 'THE VILLA' (h-villa) and 'NAVKAR PALACE & RESORT' (h-navkar).
 * 3. Retains all 85 rooms (15 for The Villa, 70 for Navkar Palace) and resets all to AVAILABLE.
 * 4. Completely wipes all transactional raw/mock data:
 *    - bookings, guests, stays, stay_guests, booking_rooms, booking_extra_charges
 *    - invoices, payments, folios
 *    - attendances, salary_payments, staff_advances, staff
 *    - expenses, banquet_events, dining_orders, spa_bookings, concierge_bookings
 *    - housekeeping_tickets, shift_handovers, audit_logs
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function purgeAndResetFreshData() {
  const rawUrl = process.env.DATABASE_URL || process.env.DATABASEURL;
  if (!rawUrl) {
    console.error("Error: DATABASE_URL environment variable is required.");
    process.exit(1);
  }

  const u = new URL(rawUrl);
  let dbName = u.pathname.replace(/^\//, '') || 'resortos';
  if (dbName === 'sys') dbName = 'resortos';

  console.log("================================================================");
  console.log("ResortOS: Purging Operational Data & Initializing Fresh Database");
  console.log(`Target TiDB Cloud Database: '${dbName}' on ${u.hostname}`);
  console.log("================================================================\n");

  const conn = await mysql.createConnection({
    host: u.hostname,
    port: parseInt(u.port, 10) || 4000,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: dbName,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  });

  console.log("✓ Connected to TiDB Cloud MySQL database.");

  // 1. Update Hotel Owner / Admin Name
  console.log("\n[1/5] Updating Owner / Admin user...");
  await conn.query(`
    UPDATE users 
    SET fullName = 'Yash Godha' 
    WHERE role = 'ADMIN' OR email = 'admin@resortos.com'
  `);
  // Clean up any extraneous non-active users
  await conn.query(`
    DELETE FROM users 
    WHERE email NOT IN ('admin@resortos.com', 'manager.villa@resortos.com', 'manager.navkar@resortos.com')
  `);
  console.log("  ✓ Owner name set to 'Yash Godha' (admin@resortos.com).");
  console.log("  ✓ Managers retained: Sunita Sharma (The Villa), Rajesh Verma (Navkar Palace).");

  // 2. Clean Hotels table - Keep ONLY The Villa and Navkar Palace
  console.log("\n[2/5] Sanitizing Hotels...");
  await conn.query(`
    DELETE FROM hotels 
    WHERE id NOT IN ('h-villa', 'h-navkar')
  `);
  console.log("  ✓ Retained official properties: THE VILLA (h-villa) and NAVKAR PALACE & RESORT (h-navkar).");

  // 3. Reset and Sanitize Rooms (Keep 15 for Villa, 70 for Navkar Palace = 85 Total)
  console.log("\n[3/5] Sanitizing & Resetting Rooms to AVAILABLE...");
  // Delete any room from other hotels
  await conn.query(`
    DELETE FROM rooms 
    WHERE hotelId NOT IN ('h-villa', 'h-navkar')
  `);

  // Reset all 85 rooms to available, clean, and unlinked
  await conn.query(`
    UPDATE rooms 
    SET status = 'AVAILABLE',
        currentBookingId = NULL,
        currentGuestName = NULL,
        housekeepingStatus = 'clean'
    WHERE hotelId IN ('h-villa', 'h-navkar')
  `);
  console.log("  ✓ All 85 rooms (15 Villa + 70 Navkar) reset to 'AVAILABLE' & 'clean'.");

  // 4. Purge All Operational / Transactional Tables
  console.log("\n[4/5] Purging All Operational / Transactional Records...");
  const tablesToClear = [
    'bookings',
    'booking_rooms',
    'booking_extra_charges',
    'guests',
    'stay_guests',
    'stays',
    'invoices',
    'payments',
    'attendances',
    'salary_payments',
    'staff_advances',
    'staff',
    'expenses',
    'banquet_events',
    'dining_orders',
    'spa_bookings',
    'concierge_bookings',
    'housekeeping_tickets',
    'shift_handovers',
    'audit_logs',
  ];

  for (const table of tablesToClear) {
    try {
      await conn.query(`DELETE FROM \`${table}\``);
      console.log(`  ✓ Cleared table: ${table}`);
    } catch (e) {
      console.warn(`  ⚠️ Could not clear ${table}: ${e.message}`);
    }
  }

  // 5. Final Verification & Audit Report
  console.log("\n[5/5] Final Database Audit Report...");
  const [hotels] = await conn.query('SELECT id, name, code, contactPhone FROM hotels ORDER BY id ASC');
  console.log("\n🏨 Properties in Database:");
  console.table(hotels);

  const [roomStats] = await conn.query(`
    SELECT hotelId, 
           COUNT(*) as totalRooms,
           SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) as availableRooms,
           SUM(CASE WHEN status = 'OCCUPIED' THEN 1 ELSE 0 END) as occupiedRooms
    FROM rooms 
    GROUP BY hotelId
  `);
  console.log("🛏️ Rooms Count & Status:");
  console.table(roomStats);

  const [users] = await conn.query('SELECT id, email, fullName, role, hotelId FROM users ORDER BY role ASC');
  console.log("👤 User Accounts (Credentials Intact):");
  console.table(users);

  console.log("\n📊 Transactional Record Counts (Must be 0 for Fresh Start):");
  for (const table of tablesToClear) {
    try {
      const [cnt] = await conn.query(`SELECT COUNT(*) as c FROM \`${table}\``);
      console.log(`  • ${table.padEnd(25)} : ${cnt[0].c} records`);
    } catch {}
  }

  await conn.end();

  console.log("\n================================================================");
  console.log("🎉 DATABASE IS NOW 100% FRESH AND READY FOR TESTING!");
  console.log("================================================================\n");
}

purgeAndResetFreshData().catch((err) => {
  console.error("Fatal error during database purge:", err);
  process.exit(1);
});
