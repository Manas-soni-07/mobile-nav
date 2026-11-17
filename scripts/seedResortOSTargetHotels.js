/**
 * ResortOS - Seed Script for Target Properties
 * Properties: 1. THE VILLA (h-villa)
 *             2. NAVKAR PALACE & RESORT (h-navkar)
 * 
 * Sets up clean multi-tenant data for Admin and Managers with strict isolation.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedResortOS() {
  const rawUrl = process.env.DATABASEURL || process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error("Error: DATABASEURL environment variable is required.");
    return;
  }
  const targetDbUrl = rawUrl.replace(/\/sys$/, '/resortos');

  console.log("Connecting to TiDB Cloud 'resortos'...");
  const conn = await mysql.createConnection({
    uri: targetDbUrl,
    ssl: { rejectUnauthorized: true },
  });

  console.log("✓ Connected to TiDB Cloud.");

  // Helper for safe column addition
  async function safeAddColumn(table, columnDef) {
    try {
      await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN ${columnDef}`);
    } catch (e) {
      // Column likely already exists
    }
  }

  // Ensure organization exists
  await conn.query(`
    INSERT INTO organizations (id, name, slug, taxNumber, contactEmail, contactPhone, createdAt, updatedAt)
    VALUES ('org-resortos', 'ResortOS Hospitality', 'resortos-hospitality', 'GSTIN-08AAACR1234M1Z5', 'owner@resortos.com', '+91 98290 12345', NOW(), NOW())
    ON DUPLICATE KEY UPDATE name = 'ResortOS Hospitality';
  `);

  // Ensure salary_payments table exists
  await conn.query(`
    CREATE TABLE IF NOT EXISTS salary_payments (
      id VARCHAR(191) PRIMARY KEY,
      hotelId VARCHAR(191) NOT NULL,
      staffId VARCHAR(191) NOT NULL,
      month INT NOT NULL,
      year INT NOT NULL,
      baseSalary DECIMAL(10,2) NOT NULL,
      presentDays INT NOT NULL DEFAULT 0,
      halfDays INT NOT NULL DEFAULT 0,
      absentDays INT NOT NULL DEFAULT 0,
      grossSalary DECIMAL(10,2) NOT NULL,
      advanceDeductions DECIMAL(10,2) NOT NULL DEFAULT 0,
      netSalary DECIMAL(10,2) NOT NULL,
      paymentStatus VARCHAR(50) DEFAULT 'PAID',
      paidAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Schema enhancements
  await safeAddColumn('rooms', 'category VARCHAR(100) DEFAULT NULL');
  await safeAddColumn('rooms', 'defaultPrice DECIMAL(10,2) DEFAULT NULL');
  await safeAddColumn('rooms', 'housekeepingStatus VARCHAR(50) DEFAULT "clean"');
  await safeAddColumn('rooms', 'capacity INT DEFAULT 2');

  try {
    await conn.query(`ALTER TABLE bookings MODIFY COLUMN guestId VARCHAR(191) NULL`);
  } catch (e) {}

  await safeAddColumn('bookings', 'guestName VARCHAR(191) DEFAULT NULL');
  await safeAddColumn('bookings', 'guestPhone VARCHAR(50) DEFAULT NULL');
  await safeAddColumn('bookings', 'guestEmail VARCHAR(191) DEFAULT NULL');
  await safeAddColumn('bookings', 'bookingType VARCHAR(50) DEFAULT "normal"');
  await safeAddColumn('bookings', 'eventName VARCHAR(191) DEFAULT NULL');
  await safeAddColumn('bookings', 'requiredRooms INT DEFAULT 0');
  await safeAddColumn('bookings', 'allocatedRooms INT DEFAULT 0');
  await safeAddColumn('bookings', 'remainingRooms INT DEFAULT 0');
  await safeAddColumn('bookings', 'roomType VARCHAR(100) DEFAULT NULL');
  await safeAddColumn('bookings', 'roomPrice DECIMAL(10,2) DEFAULT 0');
  await safeAddColumn('bookings', 'advanceAmount DECIMAL(10,2) DEFAULT 0');
  await safeAddColumn('bookings', 'paymentMethod VARCHAR(50) DEFAULT "UPI"');

  await safeAddColumn('staff', 'fullName VARCHAR(191) DEFAULT NULL');
  await safeAddColumn('staff', 'role VARCHAR(100) DEFAULT NULL');
  await safeAddColumn('staff', 'monthlySalary DECIMAL(10,2) DEFAULT 0');
  await safeAddColumn('staff', 'joinDate DATE DEFAULT NULL');
  await safeAddColumn('staff', 'status VARCHAR(50) DEFAULT "ACTIVE"');

  await safeAddColumn('staff_advances', 'advanceDate DATE DEFAULT NULL');
  await safeAddColumn('staff_advances', 'reason VARCHAR(255) DEFAULT NULL');
  await safeAddColumn('staff_advances', 'paymentMethod VARCHAR(50) DEFAULT "CASH"');
  await safeAddColumn('staff_advances', 'isDeducted BOOLEAN DEFAULT FALSE');
  await safeAddColumn('staff_advances', 'deductedMonth VARCHAR(20) DEFAULT NULL');
  await safeAddColumn('staff_advances', 'createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

  await safeAddColumn('expenses', 'expenseDate DATE DEFAULT NULL');
  await safeAddColumn('expenses', 'paidTo VARCHAR(191) DEFAULT NULL');
  await safeAddColumn('expenses', 'description TEXT DEFAULT NULL');

  console.log("✓ Core tables verified & schema synchronized.");

  // 1. SEED HOTELS: THE VILLA & NAVKAR PALACE & RESORT
  console.log("\n[1/5] Seeding Hotels: THE VILLA & NAVKAR PALACE & RESORT...");
  
  await conn.query(`
    INSERT INTO hotels (id, organizationId, name, slug, code, address, city, state, country, postalCode, contactPhone, contactEmail, receptionPhone, currency, timezone, checkInTime, checkOutTime, status, createdAt, updatedAt)
    VALUES 
    ('h-villa', 'org-resortos', 'THE VILLA', 'the-villa', 'TV-01', 'Civil Lines, Near Circuit House', 'Jaipur', 'Rajasthan', 'India', '302006', '+91 98290 55110', 'villa@resortos.com', '+91 141 222 3344', 'INR', 'Asia/Kolkata', '12:00', '11:00', 'active', NOW(), NOW())
    ON DUPLICATE KEY UPDATE name = 'THE VILLA', code = 'TV-01', contactPhone = '+91 98290 55110', status = 'active';
  `);

  await conn.query(`
    INSERT INTO hotels (id, organizationId, name, slug, code, address, city, state, country, postalCode, contactPhone, contactEmail, receptionPhone, currency, timezone, checkInTime, checkOutTime, status, createdAt, updatedAt)
    VALUES 
    ('h-navkar', 'org-resortos', 'NAVKAR PALACE & RESORT', 'navkar-palace-resort', 'NPR-02', 'Udaipur-Ahmedabad National Highway 48', 'Udaipur', 'Rajasthan', 'India', '313002', '+91 98290 66220', 'navkar@resortos.com', '+91 294 255 6677', 'INR', 'Asia/Kolkata', '12:00', '11:00', 'active', NOW(), NOW())
    ON DUPLICATE KEY UPDATE name = 'NAVKAR PALACE & RESORT', code = 'NPR-02', contactPhone = '+91 98290 66220', status = 'active';
  `);

  console.log("✓ Hotels seeded: THE VILLA & NAVKAR PALACE & RESORT");

  // 2. SEED USERS: ADMIN & MANAGERS
  console.log("\n[2/5] Seeding Users: Admin & Hotel Managers...");

  await conn.query(`
    INSERT INTO users (id, organizationId, hotelId, email, passwordHash, fullName, phone, role, status, createdAt, updatedAt)
    VALUES
    ('usr-admin-1', 'org-resortos', NULL, 'admin@resortos.com', '$2b$10$ib5QZoaUT9E2lMYH6dQlweP/BrlS7ka/q.PScGwLy9/5v8Yg87sHG', 'Vikramaditya Rathore (Admin Owner)', '+91 98290 11440', 'ADMIN', 'ACTIVE', NOW(), NOW())
    ON DUPLICATE KEY UPDATE fullName = 'Vikramaditya Rathore (Admin Owner)', role = 'ADMIN', hotelId = NULL, status = 'ACTIVE';
  `);

  await conn.query(`
    INSERT INTO users (id, organizationId, hotelId, email, passwordHash, fullName, phone, role, status, createdAt, updatedAt)
    VALUES
    ('usr-mgr-villa', 'org-resortos', 'h-villa', 'manager.villa@resortos.com', '$2b$10$qdmnMiTrBc9KagwQOut/jORB6v9pGU7GGNWrfOYc4gUhXObrZoEYa', 'Sunita Sharma (Manager - THE VILLA)', '+91 98290 11441', 'MANAGER', 'ACTIVE', NOW(), NOW())
    ON DUPLICATE KEY UPDATE fullName = 'Sunita Sharma (Manager - THE VILLA)', role = 'MANAGER', hotelId = 'h-villa', status = 'ACTIVE';
  `);

  await conn.query(`
    INSERT INTO users (id, organizationId, hotelId, email, passwordHash, fullName, phone, role, status, createdAt, updatedAt)
    VALUES
    ('usr-mgr-navkar', 'org-resortos', 'h-navkar', 'manager.navkar@resortos.com', '$2b$10$qdmnMiTrBc9KagwQOut/jORB6v9pGU7GGNWrfOYc4gUhXObrZoEYa', 'Rajesh Verma (Manager - NAVKAR PALACE)', '+91 98290 11442', 'MANAGER', 'ACTIVE', NOW(), NOW())
    ON DUPLICATE KEY UPDATE fullName = 'Rajesh Verma (Manager - NAVKAR PALACE)', role = 'MANAGER', hotelId = 'h-navkar', status = 'ACTIVE';
  `);

  await conn.query(`
    INSERT INTO users (id, organizationId, hotelId, email, passwordHash, fullName, phone, role, status, createdAt, updatedAt)
    VALUES
    ('usr-mgr-default', 'org-resortos', 'h-villa', 'manager@resortos.com', '$2b$10$qdmnMiTrBc9KagwQOut/jORB6v9pGU7GGNWrfOYc4gUhXObrZoEYa', 'Sunita Sharma (Manager)', '+91 98290 11441', 'MANAGER', 'ACTIVE', NOW(), NOW())
    ON DUPLICATE KEY UPDATE role = 'MANAGER', hotelId = 'h-villa', status = 'ACTIVE';
  `);

  console.log("✓ Users seeded with role-based hotel binding.");

  // 3. SEED ROOMS FOR BOTH PROPERTIES
  console.log("\n[3/5] Seeding Rooms for THE VILLA and NAVKAR PALACE...");
  await conn.query(`DELETE FROM rooms WHERE hotelId IN ('h-villa', 'h-navkar')`);

  const villaRooms = [
    ['rm-v-101', 'h-villa', '101', 1, 'DELUXE', 'Deluxe Room', 2500.00, 2500.00, 'OCCUPIED', 'clean', 2],
    ['rm-v-102', 'h-villa', '102', 1, 'DELUXE', 'Deluxe Room', 2500.00, 2500.00, 'AVAILABLE', 'clean', 2],
    ['rm-v-103', 'h-villa', '103', 1, 'DELUXE', 'Deluxe Room', 2500.00, 2500.00, 'CLEANING', 'dirty', 2],
    ['rm-v-104', 'h-villa', '104', 1, 'DELUXE', 'Super Deluxe Room', 3500.00, 3500.00, 'AVAILABLE', 'clean', 3],
    ['rm-v-105', 'h-villa', '105', 1, 'DELUXE', 'Super Deluxe Room', 3500.00, 3500.00, 'AVAILABLE', 'clean', 3],
    ['rm-v-201', 'h-villa', '201', 2, 'EXECUTIVE_SUITE', 'Executive Suite', 4500.00, 4500.00, 'OCCUPIED', 'clean', 4],
    ['rm-v-202', 'h-villa', '202', 2, 'EXECUTIVE_SUITE', 'Executive Suite', 4500.00, 4500.00, 'AVAILABLE', 'clean', 4],
    ['rm-v-203', 'h-villa', '203', 2, 'VILLA', 'Family Suite', 5500.00, 5500.00, 'MAINTENANCE', 'dirty', 6],
    ['rm-v-204', 'h-villa', '204', 2, 'VILLA', 'Family Suite', 5500.00, 5500.00, 'AVAILABLE', 'clean', 6],
    ['rm-v-205', 'h-villa', '205', 2, 'STANDARD', 'Standard Room', 1800.00, 1800.00, 'AVAILABLE', 'clean', 2],
  ];

  for (const r of villaRooms) {
    await conn.query(`
      INSERT INTO rooms (id, hotelId, roomNumber, floor, type, category, basePricePerNight, defaultPrice, status, housekeepingStatus, capacity, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, r);
  }

  const navkarRooms = [
    ['rm-n-101', 'h-navkar', '101', 1, 'DELUXE', 'Deluxe AC Room', 2800.00, 2800.00, 'OCCUPIED', 'clean', 2],
    ['rm-n-102', 'h-navkar', '102', 1, 'DELUXE', 'Deluxe AC Room', 2800.00, 2800.00, 'AVAILABLE', 'clean', 2],
    ['rm-n-103', 'h-navkar', '103', 1, 'DELUXE', 'Deluxe AC Room', 2800.00, 2800.00, 'AVAILABLE', 'clean', 2],
    ['rm-n-104', 'h-navkar', '104', 1, 'DELUXE', 'Super Deluxe Room', 3800.00, 3800.00, 'CLEANING', 'dirty', 3],
    ['rm-n-105', 'h-navkar', '105', 1, 'DELUXE', 'Super Deluxe Room', 3800.00, 3800.00, 'AVAILABLE', 'clean', 3],
    ['rm-n-201', 'h-navkar', '201', 2, 'EXECUTIVE_SUITE', 'Palace Suite', 5000.00, 5000.00, 'OCCUPIED', 'clean', 4],
    ['rm-n-202', 'h-navkar', '202', 2, 'EXECUTIVE_SUITE', 'Palace Suite', 5000.00, 5000.00, 'AVAILABLE', 'clean', 4],
    ['rm-n-203', 'h-navkar', '203', 2, 'VILLA', 'Royal Family Villa', 6500.00, 6500.00, 'AVAILABLE', 'clean', 6],
    ['rm-n-204', 'h-navkar', '204', 2, 'VILLA', 'Royal Family Villa', 6500.00, 6500.00, 'MAINTENANCE', 'dirty', 6],
    ['rm-n-205', 'h-navkar', '205', 2, 'STANDARD', 'Standard Non-AC Room', 1600.00, 1600.00, 'AVAILABLE', 'clean', 2],
  ];

  for (const r of navkarRooms) {
    await conn.query(`
      INSERT INTO rooms (id, hotelId, roomNumber, floor, type, category, basePricePerNight, defaultPrice, status, housekeepingStatus, capacity, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, r);
  }

  console.log(`✓ Seeded ${villaRooms.length} rooms for THE VILLA and ${navkarRooms.length} rooms for NAVKAR PALACE.`);

  // 4. SEED GUESTS & BOOKINGS
  console.log("\n[4/5] Seeding Guests & Bookings (Normal + Event Room Booking)...");
  
  await conn.query(`
    INSERT INTO guests (id, organizationId, firstName, lastName, email, phone, nationality, address, city, country, createdAt, updatedAt)
    VALUES
    ('gst-001', 'org-resortos', 'Amitabh', 'Sengupta', 'amitabh@gmail.com', '+91 98101 22334', 'Indian', 'Park Street', 'Kolkata', 'India', NOW(), NOW()),
    ('gst-002', 'org-resortos', 'Pooja', 'Agarwal', 'pooja@gmail.com', '+91 98290 88776', 'Indian', 'Vaishali Nagar', 'Jaipur', 'India', NOW(), NOW()),
    ('gst-003', 'org-resortos', 'Sunil', 'Mittal', 'mittal.wedding@gmail.com', '+91 98201 99887', 'Indian', 'Nariman Point', 'Mumbai', 'India', NOW(), NOW())
    ON DUPLICATE KEY UPDATE firstName = VALUES(firstName);
  `);

  await conn.query(`DELETE FROM bookings WHERE hotelId IN ('h-villa', 'h-navkar')`);

  // Sample Normal Booking for THE VILLA
  await conn.query(`
    INSERT INTO bookings 
    (id, hotelId, guestId, bookingReference, bookingType, guestName, guestPhone, guestEmail, checkInDate, checkOutDate, totalGuests, totalRooms, roomType, roomPrice, advanceAmount, totalAmount, paymentMethod, status, notes, createdAt, updatedAt)
    VALUES
    ('bk-v-001', 'h-villa', 'gst-001', 'BKG-TV-101', 'normal', 'Amitabh Sengupta', '+91 98101 22334', 'amitabh@gmail.com', '2026-11-20', '2026-11-23', 3, 1, 'Super Deluxe Room', 3500.00, 3500.00, 10500.00, 'UPI', 'CONFIRMED', 'Arriving by train at 2 PM', NOW(), NOW()),
    ('bk-v-002', 'h-villa', 'gst-002', 'BKG-TV-102', 'normal', 'Pooja Agarwal', '+91 98290 88776', 'pooja@gmail.com', '2026-11-18', '2026-11-19', 2, 1, 'Executive Suite', 4500.00, 2000.00, 4500.00, 'Cash', 'CONFIRMED', 'Late checkout requested', NOW(), NOW());
  `);

  // Sample Event Room Booking for NAVKAR PALACE & RESORT (Required: 15, Allocated: 10, Remaining: 5)
  await conn.query(`
    INSERT INTO bookings 
    (id, hotelId, guestId, bookingReference, bookingType, guestName, guestPhone, guestEmail, checkInDate, checkOutDate, totalGuests, totalRooms, roomType, roomPrice, advanceAmount, totalAmount, paymentMethod, status, notes, eventName, requiredRooms, allocatedRooms, remainingRooms, createdAt, updatedAt)
    VALUES
    ('bk-n-ev-001', 'h-navkar', 'gst-003', 'EVT-NPR-201', 'event', 'Sunil Mittal (Mittal Wedding)', '+91 98201 99887', 'mittal.wedding@gmail.com', '2026-12-05', '2026-12-08', 38, 10, 'Deluxe AC Room', 2800.00, 50000.00, 84000.00, 'UPI', 'CONFIRMED', 'Rooms for groom family guests', 'Mittal Wedding Reception', 15, 10, 5, NOW(), NOW());
  `);

  // 5. SEED STAFF & SALARIES
  console.log("\n[5/5] Seeding Staff, Advances, and Expenses...");
  await conn.query(`DELETE FROM staff WHERE hotelId IN ('h-villa', 'h-navkar')`);

  const staffMembers = [
    // THE VILLA
    ['stf-v-1', 'h-villa', 'EMP-TV-01', 'Manoj', 'Kumar', 'Manoj Kumar', '+91 98291 00111', 'Reception', 'Receptionist', 'Receptionist', 18000.00, 18000.00, '2025-01-15', '2025-01-15', 'ACTIVE'],
    ['stf-v-2', 'h-villa', 'EMP-TV-02', 'Ramesh', 'Meena', 'Ramesh Meena', '+91 98291 00112', 'Housekeeping', 'Housekeeping Lead', 'Housekeeping Lead', 15000.00, 15000.00, '2025-03-01', '2025-03-01', 'ACTIVE'],
    ['stf-v-3', 'h-villa', 'EMP-TV-03', 'Sohan', 'Lal', 'Sohan Lal', '+91 98291 00113', 'Security', 'Security Guard', 'Security Guard', 14000.00, 14000.00, '2025-02-10', '2025-02-10', 'ACTIVE'],
    ['stf-v-4', 'h-villa', 'EMP-TV-04', 'Gopal', 'Sharma', 'Gopal Sharma', '+91 98291 00114', 'Maintenance', 'Maintenance Electrician', 'Maintenance Electrician', 16000.00, 16000.00, '2025-04-01', '2025-04-01', 'ACTIVE'],

    // NAVKAR PALACE & RESORT
    ['stf-n-1', 'h-navkar', 'EMP-NP-01', 'Bhupendra', 'Singh', 'Bhupendra Singh', '+91 98292 00221', 'Front Office', 'Front Office Executive', 'Front Office Executive', 20000.00, 20000.00, '2025-01-01', '2025-01-01', 'ACTIVE'],
    ['stf-n-2', 'h-navkar', 'EMP-NP-02', 'Kamla', 'Devi', 'Kamla Devi', '+91 98292 00222', 'Housekeeping', 'Housekeeping Incharge', 'Housekeeping Incharge', 16000.00, 16000.00, '2025-02-15', '2025-02-15', 'ACTIVE'],
    ['stf-n-3', 'h-navkar', 'EMP-NP-03', 'Pappu', 'Rawat', 'Pappu Rawat', '+91 98292 00223', 'Security', 'Night Security', 'Night Security', 14000.00, 14000.00, '2025-03-20', '2025-03-20', 'ACTIVE'],
    ['stf-n-4', 'h-navkar', 'EMP-NP-04', 'Dinesh', 'Soni', 'Dinesh Soni', '+91 98292 00224', 'Maintenance', 'Plumber & Maintenance', 'Plumber & Maintenance', 16500.00, 16500.00, '2025-05-01', '2025-05-01', 'ACTIVE'],
  ];

  for (const s of staffMembers) {
    await conn.query(`
      INSERT INTO staff (id, hotelId, employeeCode, firstName, lastName, fullName, phone, department, designation, role, baseSalary, monthlySalary, joiningDate, joinDate, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, s);
  }
  console.log(`✓ Seeded ${staffMembers.length} staff members with designated salaries.`);

  // Seed Staff Advance Sample
  await conn.query(`DELETE FROM staff_advances WHERE hotelId IN ('h-villa', 'h-navkar')`);
  await conn.query(`
    INSERT INTO staff_advances (id, hotelId, staffId, requestDate, approvedDate, advanceDate, amount, repaidAmount, reason, paymentMethod, status, isDeducted, notes)
    VALUES
    ('adv-v-01', 'h-villa', 'stf-v-1', '2026-11-05', '2026-11-05', '2026-11-05', 3000.00, 0.00, 'Medical emergency for mother', 'CASH', 'APPROVED', FALSE, 'To be deducted from November 2026 salary');
  `);

  // Seed Property Expenses
  await conn.query(`DELETE FROM expenses WHERE hotelId IN ('h-villa', 'h-navkar')`);
  await conn.query(`
    INSERT INTO expenses (id, hotelId, category, title, amount, paymentMethod, expenseDate, incurredAt, paidTo, description)
    VALUES
    ('exp-v-01', 'h-villa', 'UTILITIES', 'October Electricity Bill', 8500.00, 'UPI', '2026-11-10', '2026-11-10 10:00:00', 'Jaipur Vidyut Vitran Nigam Ltd', 'October electricity bill for villa premises'),
    ('exp-v-02', 'h-villa', 'SUPPLIES', 'Linen & Toiletries', 3200.00, 'CASH', '2026-11-12', '2026-11-12 14:30:00', 'Shree Krishna Traders', 'Hotel guest toiletries & linen laundry detergent'),
    ('exp-n-01', 'h-navkar', 'MAINTENANCE', 'Pressure Pump Repair', 4500.00, 'UPI', '2026-11-11', '2026-11-11 11:15:00', 'Udaipur Pipe & Hardware', 'Repair of pressure pump and replacement of CP valves');
  `);

  console.log("✓ Sample Event Bookings, Staff Advances, and Expenses seeded successfully!");

  await conn.end();
  console.log("\n==================================================================");
  console.log("SUCCESS: TiDB Cloud Database fully configured for ResortOS!");
  console.log("Properties: 1. THE VILLA (h-villa) | 2. NAVKAR PALACE & RESORT (h-navkar)");
  console.log("==================================================================");
}

seedResortOS().catch(err => {
  console.error("Migration Error:", err);
  process.exit(1);
});
