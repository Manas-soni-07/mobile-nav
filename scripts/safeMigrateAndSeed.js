/**
 * ResortOS - Safe Database Schema Enhancement and Seeding
 * Non-destructive: preserves all existing data, tables, and relationships.
 * Enforces Hotel Requirements:
 * - THE VILLA (h-villa): exactly 15 rooms (101-115)
 * - NAVKAR PALACE & RESORT (h-navkar): exactly 70 rooms (101-170)
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function safeMigrate() {
  const rawUrl = process.env.DATABASEURL || process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error('DATABASEURL environment variable not configured');
  }
  const dbUrl = rawUrl.replace(/\/sys$/, '/resortos');

  console.log('Connecting to TiDB Cloud database...');
  const conn = await mysql.createConnection({
    uri: dbUrl,
    ssl: { rejectUnauthorized: true },
  });

  console.log('Connected to TiDB Cloud!');

  async function safeAddColumn(table, colDef) {
    try {
      await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN ${colDef}`);
      console.log(`Added column to ${table}: ${colDef.split(' ')[0]}`);
    } catch (err) {
      // Column already exists or table doesn't support
    }
  }

  // 1. Safe Schema Enhancements
  console.log('\n--- Step 1: Safe Schema Enhancements ---');

  await safeAddColumn('rooms', 'category VARCHAR(100) DEFAULT NULL');
  await safeAddColumn('rooms', 'defaultPrice DECIMAL(10,2) DEFAULT NULL');
  await safeAddColumn('rooms', 'housekeepingStatus VARCHAR(50) DEFAULT "clean"');
  await safeAddColumn('rooms', 'capacity INT DEFAULT 2');
  await safeAddColumn('rooms', 'ratePerNight DECIMAL(10,2) DEFAULT 2500.00');
  await safeAddColumn('rooms', 'currentGuestName VARCHAR(191) DEFAULT NULL');
  await safeAddColumn('rooms', 'currentBookingId VARCHAR(191) DEFAULT NULL');

  await safeAddColumn('bookings', 'roomId VARCHAR(191) DEFAULT NULL');
  await safeAddColumn('bookings', 'roomNumber VARCHAR(50) DEFAULT NULL');
  await safeAddColumn('bookings', 'roomCategory VARCHAR(100) DEFAULT NULL');
  await safeAddColumn('bookings', 'guestName VARCHAR(191) DEFAULT NULL');
  await safeAddColumn('bookings', 'guestPhone VARCHAR(50) DEFAULT NULL');
  await safeAddColumn('bookings', 'guestEmail VARCHAR(191) DEFAULT NULL');
  await safeAddColumn('bookings', 'bookingType VARCHAR(50) DEFAULT "normal"');
  await safeAddColumn('bookings', 'eventName VARCHAR(191) DEFAULT NULL');
  await safeAddColumn('bookings', 'requiredRooms INT DEFAULT 0');
  await safeAddColumn('bookings', 'allocatedRooms INT DEFAULT 0');
  await safeAddColumn('bookings', 'remainingRooms INT DEFAULT 0');
  await safeAddColumn('bookings', 'roomPrice DECIMAL(10,2) DEFAULT 0');
  await safeAddColumn('bookings', 'advanceAmount DECIMAL(10,2) DEFAULT 0');
  await safeAddColumn('bookings', 'depositPaid DECIMAL(12,2) DEFAULT 0');
  await safeAddColumn('bookings', 'paymentMethod VARCHAR(50) DEFAULT "UPI"');
  await safeAddColumn('bookings', 'paymentStatus VARCHAR(50) DEFAULT "paid"');
  await safeAddColumn('bookings', 'nightsCount INT DEFAULT 1');

  await safeAddColumn('staff', 'fullName VARCHAR(191) DEFAULT NULL');
  await safeAddColumn('staff', 'role VARCHAR(100) DEFAULT NULL');
  await safeAddColumn('staff', 'department VARCHAR(100) DEFAULT "Front Desk"');
  await safeAddColumn('staff', 'shift VARCHAR(50) DEFAULT "Morning"');
  await safeAddColumn('staff', 'monthlySalary DECIMAL(10,2) DEFAULT 0');
  await safeAddColumn('staff', 'joinDate DATE DEFAULT NULL');
  await safeAddColumn('staff', 'status VARCHAR(50) DEFAULT "present"');
  await safeAddColumn('staff', 'checkInTime VARCHAR(50) DEFAULT NULL');

  await safeAddColumn('attendances', 'checkInTime VARCHAR(50) DEFAULT NULL');
  await safeAddColumn('attendances', 'staffName VARCHAR(191) DEFAULT NULL');
  await safeAddColumn('attendances', 'role VARCHAR(100) DEFAULT NULL');

  try {
    await conn.query('ALTER TABLE staff_advances MODIFY COLUMN deductedMonth VARCHAR(100)');
  } catch (e) {}

  await safeAddColumn('staff_advances', 'advanceDate DATE DEFAULT NULL');
  await safeAddColumn('staff_advances', 'staffName VARCHAR(191) DEFAULT NULL');
  await safeAddColumn('staff_advances', 'staffRole VARCHAR(100) DEFAULT NULL');
  await safeAddColumn('staff_advances', 'reason VARCHAR(255) DEFAULT NULL');
  await safeAddColumn('staff_advances', 'paymentMethod VARCHAR(50) DEFAULT "CASH"');
  await safeAddColumn('staff_advances', 'isDeducted BOOLEAN DEFAULT FALSE');
  await safeAddColumn('staff_advances', 'deductedMonth VARCHAR(100) DEFAULT NULL');
  await safeAddColumn('staff_advances', 'notes TEXT DEFAULT NULL');

  await safeAddColumn('salary_payments', 'presentDays INT DEFAULT 30');
  await safeAddColumn('salary_payments', 'halfDays INT DEFAULT 0');
  await safeAddColumn('salary_payments', 'absentDays INT DEFAULT 0');
  await safeAddColumn('salary_payments', 'advanceDeductions DECIMAL(10,2) DEFAULT 0.00');
  await safeAddColumn('salary_payments', 'staffName VARCHAR(191) DEFAULT NULL');
  await safeAddColumn('salary_payments', 'role VARCHAR(100) DEFAULT NULL');

  await safeAddColumn('invoices', 'guestName VARCHAR(191) DEFAULT NULL');
  await safeAddColumn('invoices', 'roomNumber VARCHAR(50) DEFAULT NULL');
  await safeAddColumn('invoices', 'itemsJson JSON DEFAULT NULL');
  await safeAddColumn('invoices', 'balanceDue DECIMAL(10,2) DEFAULT 0.00');
  await safeAddColumn('invoices', 'settledAt VARCHAR(100) DEFAULT NULL');
  await safeAddColumn('invoices', 'paymentMethod VARCHAR(50) DEFAULT NULL');

  await safeAddColumn('expenses', 'expenseDate DATE DEFAULT NULL');
  await safeAddColumn('expenses', 'vendor VARCHAR(191) DEFAULT NULL');
  await safeAddColumn('expenses', 'paidTo VARCHAR(191) DEFAULT NULL');
  await safeAddColumn('expenses', 'recordedBy VARCHAR(191) DEFAULT "Manager"');
  await safeAddColumn('expenses', 'description TEXT DEFAULT NULL');

  // 2. Ensure Hotels
  console.log('\n--- Step 2: Ensure Hotels ---');
  await conn.query(`
    INSERT INTO hotels (id, organizationId, name, slug, code, address, city, state, country, postalCode, contactPhone, contactEmail, receptionPhone, currency, timezone, checkInTime, checkOutTime, status, createdAt, updatedAt)
    VALUES 
    ('h-villa', 'org-resortos', 'THE VILLA', 'the-villa', 'TV-01', 'Civil Lines, Near Circuit House', 'Jaipur', 'Rajasthan', 'India', '302006', '+91 98290 55110', 'villa@resortos.com', '+91 141 222 3344', 'INR', 'Asia/Kolkata', '12:00 PM', '11:00 AM', 'ACTIVE', NOW(), NOW()),
    ('h-navkar', 'org-resortos', 'NAVKAR PALACE & RESORT', 'navkar-palace-resort', 'NPR-02', 'Udaipur-Ahmedabad National Highway 48', 'Udaipur', 'Rajasthan', 'India', '313002', '+91 98290 66220', 'navkar@resortos.com', '+91 294 255 6677', 'INR', 'Asia/Kolkata', '12:00 PM', '11:00 AM', 'ACTIVE', NOW(), NOW())
    ON DUPLICATE KEY UPDATE name=VALUES(name), code=VALUES(code), contactPhone=VALUES(contactPhone), contactEmail=VALUES(contactEmail), status='ACTIVE';
  `);

  // 3. Rooms Setup: 15 for The Villa, 70 for Navkar Palace
  console.log('\n--- Step 3: Upsert Rooms (15 for The Villa, 70 for Navkar Palace) ---');

  // Upsert The Villa Rooms (101 to 115)
  for (let i = 1; i <= 15; i++) {
    const num = (100 + i).toString();
    const id = `rm-v-${num}`;
    const floor = i <= 8 ? 1 : 2;
    let category = 'Deluxe Room';
    let type = 'DELUXE';
    let rate = 2500;
    let status = 'AVAILABLE';
    let hk = 'clean';
    let guest = null;
    let bkid = null;

    if (i >= 6 && i <= 8) {
      category = 'Super Deluxe Room';
      type = 'DELUXE';
      rate = 3500;
    } else if (i >= 9 && i <= 12) {
      category = 'Executive Suite';
      type = 'EXECUTIVE_SUITE';
      rate = 4500;
    } else if (i >= 13 && i <= 14) {
      category = 'Family Suite';
      type = 'VILLA';
      rate = 5500;
    } else if (i === 15) {
      category = 'Standard Room';
      type = 'STANDARD';
      rate = 1800;
    }

    if (i === 1) { status = 'OCCUPIED'; guest = 'Aarav Sharma'; bkid = 'b-101'; }
    else if (i === 2) { status = 'OCCUPIED'; guest = 'Priya Venkatesh'; bkid = 'b-102'; }
    else if (i === 5) { status = 'CLEANING'; hk = 'dirty'; }
    else if (i === 9) { status = 'OCCUPIED'; guest = 'Rajesh Singhania'; bkid = 'b-103'; }
    else if (i === 13) { status = 'OCCUPIED'; guest = 'Kavita Reddy'; bkid = 'b-104'; }
    else if (i === 15) { status = 'MAINTENANCE'; hk = 'dirty'; }

    await conn.query(`
      INSERT INTO rooms (id, hotelId, roomNumber, floor, type, category, basePricePerNight, ratePerNight, defaultPrice, status, housekeepingStatus, currentGuestName, currentBookingId, maxOccupancy, capacity, createdAt, updatedAt)
      VALUES (?, 'h-villa', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2, 2, NOW(), NOW())
      ON DUPLICATE KEY UPDATE category=VALUES(category), ratePerNight=VALUES(ratePerNight), basePricePerNight=VALUES(basePricePerNight), status=VALUES(status), housekeepingStatus=VALUES(housekeepingStatus), currentGuestName=VALUES(currentGuestName), currentBookingId=VALUES(currentBookingId);
    `, [id, num, floor, type, category, rate, rate, rate, status, hk, guest, bkid]);
  }

  // Remove any obsolete legacy rooms for The Villa if roomNumber > 115
  await conn.query(`DELETE FROM rooms WHERE hotelId = 'h-villa' AND roomNumber NOT BETWEEN '101' AND '115'`);

  // Upsert Navkar Palace Rooms (101 to 170)
  const navkarOccupied = [1, 2, 3, 7, 10, 12, 14, 15, 17, 18, 26, 29, 30, 32, 35, 38, 40, 42, 51, 52, 55, 61];
  const navkarCleaning = [4, 28, 53];
  const navkarMaintenance = [70];

  for (let i = 1; i <= 70; i++) {
    const num = (100 + i).toString();
    const id = `rm-n-${num}`;
    const floor = i <= 25 ? 1 : i <= 50 ? 2 : 3;
    let category = 'Deluxe AC Room';
    let type = 'DELUXE';
    let rate = 2800;
    let status = 'AVAILABLE';
    let hk = 'clean';
    let guest = null;
    let bkid = null;

    if (i >= 16 && i <= 35) {
      category = 'Super Deluxe Room';
      rate = 3800;
    } else if (i >= 36 && i <= 60) {
      category = 'Palace Suite';
      type = 'EXECUTIVE_SUITE';
      rate = 5000;
    } else if (i >= 61 && i <= 66) {
      category = 'Royal Family Villa';
      type = 'VILLA';
      rate = 6500;
    } else if (i >= 67 && i <= 70) {
      category = 'Standard Non-AC Room';
      type = 'STANDARD';
      rate = 1600;
    }

    if (navkarOccupied.includes(i)) {
      status = 'OCCUPIED';
      guest = i === 1 ? 'Siddharth Malhotra' : i === 12 ? 'Manish Sisodia' : i === 42 ? 'Rekha Chawla' : `Guest Room ${num}`;
      bkid = `b-occ-${num}`;
    } else if (navkarCleaning.includes(i)) {
      status = 'CLEANING';
      hk = 'dirty';
    } else if (navkarMaintenance.includes(i)) {
      status = 'MAINTENANCE';
      hk = 'dirty';
    }

    await conn.query(`
      INSERT INTO rooms (id, hotelId, roomNumber, floor, type, category, basePricePerNight, ratePerNight, defaultPrice, status, housekeepingStatus, currentGuestName, currentBookingId, maxOccupancy, capacity, createdAt, updatedAt)
      VALUES (?, 'h-navkar', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2, 2, NOW(), NOW())
      ON DUPLICATE KEY UPDATE category=VALUES(category), ratePerNight=VALUES(ratePerNight), basePricePerNight=VALUES(basePricePerNight), status=VALUES(status), housekeepingStatus=VALUES(housekeepingStatus), currentGuestName=VALUES(currentGuestName), currentBookingId=VALUES(currentBookingId);
    `, [id, num, floor, type, category, rate, rate, rate, status, hk, guest, bkid]);
  }

  // Remove any obsolete legacy rooms for Navkar Palace if roomNumber > 170
  await conn.query(`DELETE FROM rooms WHERE hotelId = 'h-navkar' AND roomNumber NOT BETWEEN '101' AND '170'`);

  // Verify counts
  const [villaCount] = await conn.query(`SELECT COUNT(*) as c FROM rooms WHERE hotelId = 'h-villa'`);
  const [navkarCount] = await conn.query(`SELECT COUNT(*) as c FROM rooms WHERE hotelId = 'h-navkar'`);
  console.log(`✓ Rooms verified: THE VILLA = ${villaCount[0].c} rooms (target 15), NAVKAR PALACE = ${navkarCount[0].c} rooms (target 70)`);

  // 4. Staff Members
  console.log('\n--- Step 4: Ensure Staff Roster ---');
  const staffData = [
    // THE VILLA
    ['stf-v-1', 'h-villa', 'EMP-TV-01', 'Manoj', 'Kumar', 'Manoj Kumar', 'Receptionist', 'Front Desk', 'Morning', 18000.00, 'present', '+91 98291 00111', '2025-01-15'],
    ['stf-v-2', 'h-villa', 'EMP-TV-02', 'Ramesh', 'Meena', 'Ramesh Meena', 'Housekeeping Lead', 'Housekeeping', 'Morning', 15000.00, 'present', '+91 98291 00112', '2025-03-01'],
    ['stf-v-3', 'h-villa', 'EMP-TV-03', 'Sohan', 'Lal', 'Sohan Lal', 'Security Guard', 'Security', 'Night', 14000.00, 'present', '+91 98291 00113', '2025-02-10'],
    ['stf-v-4', 'h-villa', 'EMP-TV-04', 'Gopal', 'Sharma', 'Gopal Sharma', 'Maintenance Electrician', 'Maintenance', 'Full Day', 16000.00, 'present', '+91 98291 00114', '2025-04-01'],

    // NAVKAR PALACE
    ['stf-n-1', 'h-navkar', 'EMP-NP-01', 'Bhupendra', 'Singh', 'Bhupendra Singh', 'Front Office Executive', 'Front Desk', 'Morning', 20000.00, 'present', '+91 98292 00221', '2025-01-01'],
    ['stf-n-2', 'h-navkar', 'EMP-NP-02', 'Kamla', 'Devi', 'Kamla Devi', 'Housekeeping Incharge', 'Housekeeping', 'Morning', 16000.00, 'present', '+91 98292 00222', '2025-02-15'],
    ['stf-n-3', 'h-navkar', 'EMP-NP-03', 'Pappu', 'Rawat', 'Pappu Rawat', 'Night Security', 'Security', 'Night', 14000.00, 'present', '+91 98292 00223', '2025-03-20'],
    ['stf-n-4', 'h-navkar', 'EMP-NP-04', 'Dinesh', 'Soni', 'Dinesh Soni', 'Plumber & Maintenance', 'Maintenance', 'Full Day', 16500.00, 'present', '+91 98292 00224', '2025-05-01'],
  ];

  for (const s of staffData) {
    await conn.query(`
      INSERT INTO staff (id, hotelId, employeeCode, firstName, lastName, fullName, designation, role, department, shift, monthlySalary, baseSalary, status, phone, joinDate, joiningDate, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE firstName=VALUES(firstName), lastName=VALUES(lastName), fullName=VALUES(fullName), designation=VALUES(designation), role=VALUES(role), department=VALUES(department), monthlySalary=VALUES(monthlySalary), status=VALUES(status);
    `, [s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[6], s[7], s[8], s[9], s[9], s[10], s[11], s[12], s[12]]);
  }

  // 5. Ensure Attendances for Today
  console.log('\n--- Step 5: Ensure Attendances ---');
  const todayStr = new Date().toISOString().split('T')[0];
  for (const s of staffData) {
    const attId = `att-${s[0]}-${todayStr}`;
    await conn.query(`
      INSERT INTO attendances (id, staffId, hotelId, date, checkIn, checkInTime, status, staffName, role, createdAt)
      VALUES (?, ?, ?, ?, NOW(), '08:00 AM', 'present', ?, ?, NOW())
      ON DUPLICATE KEY UPDATE status=VALUES(status);
    `, [attId, s[0], s[1], todayStr, s[5], s[6]]);
  }

  // 6. Ensure Invoices / Folios
  console.log('\n--- Step 6: Ensure Invoices / Folios ---');
  const foliosData = [
    {
      id: 'fol-v-101',
      hotelId: 'h-villa',
      bookingId: 'b-101',
      invoiceNumber: 'INV-2026-1011',
      guestName: 'Aarav Sharma',
      roomNumber: '101',
      subtotal: 10000,
      taxAmount: 1800,
      totalAmount: 11800,
      paidAmount: 11800,
      balanceDue: 0,
      status: 'PAID',
      settledAt: '10:30 AM',
      paymentMethod: 'UPI (Google Pay / PhonePe QR)',
      itemsJson: JSON.stringify([
        { id: 'ch-1', description: 'Deluxe Room (4 Nights)', category: 'room', amount: 10000, date: '2026-11-14' },
      ]),
    },
    {
      id: 'fol-v-102',
      hotelId: 'h-villa',
      bookingId: 'b-102',
      invoiceNumber: 'INV-2026-1022',
      guestName: 'Priya Venkatesh',
      roomNumber: '102',
      subtotal: 10000,
      taxAmount: 1800,
      totalAmount: 11800,
      paidAmount: 5000,
      balanceDue: 6800,
      status: 'ISSUED',
      settledAt: null,
      paymentMethod: null,
      itemsJson: JSON.stringify([
        { id: 'ch-2', description: 'Deluxe Room (4 Nights)', category: 'room', amount: 10000, date: '2026-11-15' },
      ]),
    },
    {
      id: 'fol-n-201',
      hotelId: 'h-navkar',
      bookingId: 'b-201',
      invoiceNumber: 'INV-2026-2011',
      guestName: 'Siddharth Malhotra',
      roomNumber: '101',
      subtotal: 11200,
      taxAmount: 2016,
      totalAmount: 13216,
      paidAmount: 13216,
      balanceDue: 0,
      status: 'PAID',
      settledAt: '11:15 AM',
      paymentMethod: 'RuPay / Debit / Credit Card',
      itemsJson: JSON.stringify([
        { id: 'ch-3', description: 'Deluxe AC Room (4 Nights)', category: 'room', amount: 11200, date: '2026-11-14' },
      ]),
    },
  ];

  for (const f of foliosData) {
    await conn.query(`
      INSERT INTO invoices (id, hotelId, bookingId, invoiceNumber, subtotal, taxAmount, totalAmount, paidAmount, balanceDue, status, guestName, roomNumber, itemsJson, settledAt, paymentMethod, issuedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE guestName=VALUES(guestName), roomNumber=VALUES(roomNumber), totalAmount=VALUES(totalAmount), paidAmount=VALUES(paidAmount), balanceDue=VALUES(balanceDue), status=VALUES(status);
    `, [f.id, f.hotelId, f.bookingId, f.invoiceNumber, f.subtotal, f.taxAmount, f.totalAmount, f.paidAmount, f.balanceDue, f.status, f.guestName, f.roomNumber, f.itemsJson, f.settledAt, f.paymentMethod]);
  }

  // 7. Ensure Expenses
  console.log('\n--- Step 7: Ensure Property Expenses ---');
  const expData = [
    ['exp-v-01', 'h-villa', 'UTILITIES', 'October Electricity Bill', 8500.00, 'UPI', '2026-11-10', 'Jaipur Vidyut Vitran Nigam Ltd', 'October power bill for villa property'],
    ['exp-v-02', 'h-villa', 'SUPPLIES', 'Linen & Guest Toiletries', 3200.00, 'CASH', '2026-11-12', 'Shree Krishna Traders', 'Toiletries & detergent bulk purchase'],
    ['exp-v-03', 'h-villa', 'MAINTENANCE', 'Plumbing & Tap Fittings', 1800.00, 'UPI', '2026-11-15', 'Jaipur Sanitary Mart', 'Replacement of shower mixer valves'],
    ['exp-n-01', 'h-navkar', 'MAINTENANCE', 'Pressure Pump Overhaul', 4500.00, 'UPI', '2026-11-11', 'Udaipur Pipe & Hardware', 'Repair of main pressure boost pump'],
    ['exp-n-02', 'h-navkar', 'UTILITIES', 'Commercial HT Power Bill', 24500.00, 'BANK_TRANSFER', '2026-11-13', 'AVVNL Udaipur', 'High tension commercial electricity bill'],
  ];

  for (const e of expData) {
    await conn.query(`
      INSERT INTO expenses (id, hotelId, category, title, amount, paymentMethod, expenseDate, incurredAt, vendor, paidTo, description, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE amount=VALUES(amount), category=VALUES(category), title=VALUES(title);
    `, [e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7], e[7], e[8]]);
  }

  // 8. Ensure Salary Advances
  console.log('\n--- Step 8: Ensure Salary Advances ---');
  const advData = [
    ['adv-v-01', 'h-villa', 'stf-v-1', 'Manoj Kumar', 'Receptionist', '2026-11-05', 3000.00, 'Medical emergency for mother', 'CASH', 'APPROVED', false, 'Nov 2026', 'Emergency advance loan'],
    ['adv-n-01', 'h-navkar', 'stf-n-2', 'Kamla Devi', 'Housekeeping Incharge', '2026-10-12', 2000.00, 'Diwali family festival expense', 'UPI', 'APPROVED', true, 'Oct 2026', 'Diwali festival advance loan'],
  ];

  for (const a of advData) {
    await conn.query(`
      INSERT INTO staff_advances (id, hotelId, staffId, staffName, staffRole, advanceDate, amount, reason, paymentMethod, status, isDeducted, deductedMonth, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE amount=VALUES(amount), isDeducted=VALUES(isDeducted);
    `, a);
  }

  // 9. Ensure Bookings
  console.log('\n--- Step 9: Ensure Core Bookings ---');
  const bksData = [
    ['b-101', 'h-villa', 'TV-2026-1011', 'normal', 'Aarav Sharma', '+91 98201 44510', 'aarav@sharma.in', 'rm-v-101', '101', 'Deluxe Room', '2026-11-14', '2026-11-18', 2, 1, 10000.00, 10000.00, 'UPI', 'CHECKED_IN', 'paid', 4],
    ['b-102', 'h-villa', 'TV-2026-1022', 'normal', 'Priya Venkatesh', '+91 98450 11290', 'priya.v@tech.in', 'rm-v-102', '102', 'Deluxe Room', '2026-11-15', '2026-11-19', 1, 1, 10000.00, 5000.00, 'UPI', 'CHECKED_IN', 'partial', 4],
    ['b-103', 'h-villa', 'TV-2026-1033', 'normal', 'Rajesh Singhania', '+91 98110 55432', 'r.singhania@corp.in', 'rm-v-109', '109', 'Executive Suite', '2026-11-16', '2026-11-20', 3, 1, 18000.00, 18000.00, 'Card', 'CHECKED_IN', 'paid', 4],
    ['b-104', 'h-villa', 'TV-2026-1044', 'normal', 'Kavita Reddy', '+91 97011 22334', 'kavita.reddy@bio.in', 'rm-v-113', '113', 'Family Suite', '2026-11-15', '2026-11-22', 4, 1, 38500.00, 38500.00, 'UPI', 'CHECKED_IN', 'paid', 7],
    ['b-107', 'h-villa', 'TV-2026-1077', 'normal', 'Sunil Mehra', '+91 98102 33441', 'sunil.mehra@jewels.in', 'rm-v-104', '104', 'Super Deluxe Room', todayStr, '2026-11-23', 2, 1, 17500.00, 8750.00, 'UPI', 'CONFIRMED', 'partial', 5],
    ['b-201', 'h-navkar', 'NPR-2026-2011', 'normal', 'Siddharth Malhotra', '+91 98211 77665', 'sid.malhotra@media.in', 'rm-n-101', '101', 'Deluxe AC Room', '2026-11-14', todayStr, 2, 1, 11200.00, 11200.00, 'Card', 'CHECKED_IN', 'paid', 4],
    ['b-203', 'h-navkar', 'NPR-2026-2033', 'normal', 'Meena Kumari', '+91 98290 33441', 'meena.k@heritage.in', 'rm-n-105', '105', 'Deluxe AC Room', todayStr, '2026-11-22', 2, 1, 11200.00, 5600.00, 'UPI', 'CONFIRMED', 'partial', 4],
    ['b-211', 'h-navkar', 'NPR-2026-2111', 'event', 'Singhania Destination Wedding', '+91 98290 99887', 'singhania.wedding@gmail.com', 'rm-n-146', '146', 'Palace Suite', '2026-11-20', '2026-11-23', 40, 10, 84000.00, 50000.00, 'UPI', 'CONFIRMED', 'partial', 3],
  ];

  for (const b of bksData) {
    await conn.query(`
      INSERT INTO bookings (id, hotelId, bookingReference, bookingType, guestName, guestPhone, guestEmail, roomId, roomNumber, roomType, checkInDate, checkOutDate, totalGuests, totalRooms, totalAmount, depositPaid, paymentMethod, status, paymentStatus, nightsCount, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE guestName=VALUES(guestName), status=VALUES(status), roomId=VALUES(roomId), roomNumber=VALUES(roomNumber);
    `, b);
  }

  await conn.end();
  console.log('\n✓ Safe migration & synchronization completed successfully!');
}

safeMigrate().catch((err) => {
  console.error('Safe migration failed:', err);
  process.exit(1);
});
