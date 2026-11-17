/**
 * ResortOS - TiDB Cloud Schema Migration & Indian Data Seeding Script
 * 
 * Configures the TiDB Cloud distributed SQL database with luxury Indian resort properties,
 * GST 18% tax regime, INR currency (₹), Indian guest personas, and Phase 5 & 6 operational tables.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupTiDBDatabase() {
  const rawUrl = process.env.DATABASEURL || process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error("Error: DATABASEURL environment variable is required.");
    return;
  }
  const targetDbUrl = rawUrl.replace(/\/sys$/, '/resortos');

  console.log("----------------------------------------------------------------");
  console.log("Connecting to TiDB Cloud 'resortos' database...");
  console.log("----------------------------------------------------------------");

  const connection = await mysql.createConnection({
    uri: targetDbUrl,
    ssl: { rejectUnauthorized: true },
  });

  console.log("✓ Connected to TiDB Cloud successfully!");

  // 1. CREATE PHASE 5 & PHASE 6 TABLES IF NOT EXIST
  console.log("\n[1/4] Creating Phase 5 & Phase 6 Operational Tables...");

  // Banquet Events (Phase 5)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS banquet_events (
      id VARCHAR(191) PRIMARY KEY,
      hotelId VARCHAR(191) NOT NULL,
      eventName VARCHAR(191) NOT NULL,
      eventType VARCHAR(100) NOT NULL,
      clientName VARCHAR(191) NOT NULL,
      clientPhone VARCHAR(50) NOT NULL,
      venueName VARCHAR(191) NOT NULL,
      eventDate DATE NOT NULL,
      guestCount INT NOT NULL,
      perPlateRate DECIMAL(10,2) NOT NULL,
      cateringType VARCHAR(100) NOT NULL,
      totalAmount DECIMAL(12,2) NOT NULL,
      depositPaid DECIMAL(12,2) NOT NULL,
      status ENUM('confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'confirmed',
      decorPackage TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ Table 'banquet_events' verified/created.");

  // Dining Orders & KOT (Phase 5)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS dining_orders (
      id VARCHAR(191) PRIMARY KEY,
      hotelId VARCHAR(191) NOT NULL,
      orderNumber VARCHAR(50) NOT NULL UNIQUE,
      roomNumber VARCHAR(20) NOT NULL,
      guestName VARCHAR(191) NOT NULL,
      itemsJson JSON NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      gstAmount DECIMAL(10,2) NOT NULL,
      totalAmount DECIMAL(10,2) NOT NULL,
      status ENUM('received', 'in_kitchen', 'out_for_delivery', 'delivered') DEFAULT 'received',
      dietaryNote TEXT,
      createdAt VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ Table 'dining_orders' verified/created.");

  // Housekeeping Tickets (Phase 5)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS housekeeping_tickets (
      id VARCHAR(191) PRIMARY KEY,
      hotelId VARCHAR(191) NOT NULL,
      roomNumber VARCHAR(20) NOT NULL,
      ticketType VARCHAR(100) NOT NULL,
      priority ENUM('urgent', 'high', 'normal') DEFAULT 'normal',
      assignedStaffName VARCHAR(191) NOT NULL,
      status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
      requestedTime VARCHAR(50) NOT NULL,
      notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ Table 'housekeeping_tickets' verified/created.");

  // Ayurvedic Spa Treatments Catalog (Phase 6)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS spa_treatments (
      id VARCHAR(191) PRIMARY KEY,
      name VARCHAR(191) NOT NULL,
      durationMinutes INT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      category VARCHAR(100) NOT NULL,
      description TEXT,
      herbalIngredients TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ Table 'spa_treatments' verified/created.");

  // Spa Bookings (Phase 6)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS spa_bookings (
      id VARCHAR(191) PRIMARY KEY,
      hotelId VARCHAR(191) NOT NULL,
      bookingRef VARCHAR(50) NOT NULL UNIQUE,
      roomNumber VARCHAR(20) NOT NULL,
      guestName VARCHAR(191) NOT NULL,
      treatmentName VARCHAR(191) NOT NULL,
      therapistName VARCHAR(191) NOT NULL,
      treatmentRoom VARCHAR(100) NOT NULL,
      timeSlot VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      gstAmount DECIMAL(10,2) NOT NULL,
      totalAmount DECIMAL(10,2) NOT NULL,
      status ENUM('scheduled', 'in_session', 'completed', 'cancelled') DEFAULT 'scheduled',
      healthNotes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ Table 'spa_bookings' verified/created.");

  // Excursion Packages Catalog (Phase 6)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS excursion_packages (
      id VARCHAR(191) PRIMARY KEY,
      title VARCHAR(191) NOT NULL,
      duration VARCHAR(50) NOT NULL,
      pricePerPerson DECIMAL(10,2) NOT NULL,
      category VARCHAR(100) NOT NULL,
      description TEXT,
      includedHighlights JSON
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ Table 'excursion_packages' verified/created.");

  // Concierge Bookings (Phase 6)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS concierge_bookings (
      id VARCHAR(191) PRIMARY KEY,
      hotelId VARCHAR(191) NOT NULL,
      bookingRef VARCHAR(50) NOT NULL UNIQUE,
      roomNumber VARCHAR(20) NOT NULL,
      guestName VARCHAR(191) NOT NULL,
      serviceTitle VARCHAR(191) NOT NULL,
      category VARCHAR(100) NOT NULL,
      driverOrGuideName VARCHAR(191) NOT NULL,
      vehicleOrVesselNumber VARCHAR(100) NOT NULL,
      pickupTime VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      numberOfGuests INT NOT NULL,
      totalAmount DECIMAL(10,2) NOT NULL,
      gstAmount DECIMAL(10,2) NOT NULL,
      status ENUM('scheduled', 'in_transit', 'completed', 'cancelled') DEFAULT 'scheduled',
      notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ Table 'concierge_bookings' verified/created.");

  // Shift Handovers & Night Audit (Phase 6)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS shift_handovers (
      id VARCHAR(191) PRIMARY KEY,
      hotelId VARCHAR(191) NOT NULL,
      outgoingManagerName VARCHAR(191) NOT NULL,
      incomingManagerName VARCHAR(191) NOT NULL,
      shiftFrom VARCHAR(50) NOT NULL,
      shiftTo VARCHAR(50) NOT NULL,
      timestamp VARCHAR(100) NOT NULL,
      frontDeskCashCollected DECIMAL(10,2) NOT NULL,
      upiSettlementsCount INT NOT NULL,
      upiSettlementsAmount DECIMAL(12,2) NOT NULL,
      pendingGuestRequestsCount INT NOT NULL,
      vipGuestsInHouse JSON,
      keyHandoversNotes TEXT,
      status VARCHAR(50) DEFAULT 'completed',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ Table 'shift_handovers' verified/created.");

  // 2. TRANSFORM ORGANIZATIONS & HOTELS TO INDIAN LUXURY PROPERTIES
  console.log("\n[2/4] Updating Organization and Hotels to Indian Properties...");

  // Update master organization
  await connection.query(`
    UPDATE organizations
    SET name = 'Taj & Oberoi Palace Resorts India',
        slug = 'taj-oberoi-palace-india',
        taxNumber = 'GSTIN-08AAACT2719M1ZV',
        contactEmail = 'reservations@taj-lakeview-horizon.in',
        contactPhone = '+91 294 242 8800'
    WHERE id = 'cmwgcs1sb0000bduot66tlphz';
  `);

  // Update existing hotel to Taj Lakeview Horizon Palace (Udaipur)
  await connection.query(`
    UPDATE hotels
    SET name = 'The Taj Lakeview Horizon Palace',
        slug = 'the-taj-lakeview-horizon-palace',
        code = 'TLH-01',
        starRating = 5,
        address = 'Lake Pichola Heritage Sanctuary, Haridas Ji Ki Magri',
        city = 'Udaipur',
        state = 'Rajasthan',
        country = 'India',
        postalCode = '313001',
        contactPhone = '+91 294 242 8800',
        contactEmail = 'concierge@taj-lakeview-horizon.in',
        receptionPhone = '+91 294 242 8801',
        currency = 'INR',
        timezone = 'Asia/Kolkata',
        checkInTime = '14:00',
        checkOutTime = '11:00'
    WHERE id = 'cmwgcs38h0002bduo6r8syp5s';
  `);
  console.log("✓ Primary hotel updated: The Taj Lakeview Horizon Palace (Udaipur, INR).");

  // Update Admin & Manager users with Indian identities
  await connection.query(`
    UPDATE users
    SET fullName = 'Vikramaditya Rathore',
        phone = '+91 98290 11440'
    WHERE email = 'admin@resortos.com';
  `);

  await connection.query(`
    UPDATE users
    SET fullName = 'Sunita Sharma',
        phone = '+91 98290 11441'
    WHERE email = 'manager@resortos.com';
  `);
  console.log("✓ Users updated: Vikramaditya Rathore (Admin) & Sunita Sharma (Manager).");

  // 3. SEED PHASE 5 & 6 MOCK DATA
  console.log("\n[3/4] Seeding Phase 5 & Phase 6 Data...");

  // Seed Banquets
  await connection.query(`DELETE FROM banquet_events WHERE hotelId = 'h-1' OR hotelId = 'cmwgcs38h0002bduo6r8syp5s'`);
  await connection.query(`
    INSERT INTO banquet_events 
    (id, hotelId, eventName, eventType, clientName, clientPhone, venueName, eventDate, guestCount, perPlateRate, cateringType, totalAmount, depositPaid, status, decorPackage)
    VALUES
    ('ev-101', 'cmwgcs38h0002bduo6r8syp5s', 'Royal Singhania Destination Wedding', 'Destination Wedding', 'Rajesh Singhania', '+91 98110 55432', 'Maharana Grand Ballroom & Royal Lawns', '2026-11-20', 450, 3200.00, 'Royal Mewari Buffet', 1440000.00, 500000.00, 'confirmed', 'Royal Marigold & Mandap Theme with Grand Shehnai Stage'),
    ('ev-102', 'cmwgcs38h0002bduo6r8syp5s', 'Mehta Sangeet & Mehendi Gala', 'Sangeet & Reception', 'Deepak Mehta', '+91 98200 44112', 'Lakeview Sunset Courtyard', '2026-11-22', 250, 2600.00, 'Pure Vegetarian Jain', 650000.00, 300000.00, 'confirmed', 'Fairy Lights, Brass Diya Lamps & Fragrant Mogra Theme'),
    ('ev-103', 'cmwgcs38h0002bduo6r8syp5s', 'Tata Tech Global Leadership Conclave', 'Corporate Conclave', 'Rohan Tata', '+91 98221 33445', 'Fateh Prakash Conference Pavilion', '2026-11-25', 120, 2200.00, 'Multi-Cuisine Grand Feast', 264000.00, 100000.00, 'confirmed', 'Corporate Minimalist Executive Setup with High-Speed Projection');
  `);
  console.log("✓ Banquet destination weddings seeded.");

  // Seed Dining Orders (KOT)
  await connection.query(`DELETE FROM dining_orders WHERE hotelId = 'h-1' OR hotelId = 'cmwgcs38h0002bduo6r8syp5s'`);
  await connection.query(`
    INSERT INTO dining_orders
    (id, hotelId, orderNumber, roomNumber, guestName, itemsJson, subtotal, gstAmount, totalAmount, status, dietaryNote, createdAt)
    VALUES
    ('ord-101', 'cmwgcs38h0002bduo6r8syp5s', 'KOT-2026-881', '201', 'Rajesh Singhania', 
     '[{"id": "menu-1", "name": "Paneer Tikka Angaar", "price": 650, "quantity": 2}, {"id": "menu-4", "name": "Dal Baati Churma Royal Platter", "price": 850, "quantity": 2}, {"id": "menu-8", "name": "Butter Garlic Naan", "price": 140, "quantity": 4}]',
     3560.00, 640.80, 4200.80, 'in_kitchen', 'Extra crispy naan, medium spice for children', '01:15 PM'),
    ('ord-102', 'cmwgcs38h0002bduo6r8syp5s', 'KOT-2026-882', '101', 'Aarav Sharma',
     '[{"id": "menu-6", "name": "Subz Dum Biryani", "price": 680, "quantity": 2}, {"id": "menu-11", "name": "Royal Saffron Kesar Lassi", "price": 280, "quantity": 2}]',
     1920.00, 345.60, 2265.60, 'received', 'Pure Jain preparation (no onion no garlic)', '01:30 PM');
  `);
  console.log("✓ Digital KOT in-room dining orders seeded with 18% GST.");

  // Seed Housekeeping Tickets
  await connection.query(`DELETE FROM housekeeping_tickets WHERE hotelId = 'h-1' OR hotelId = 'cmwgcs38h0002bduo6r8syp5s'`);
  await connection.query(`
    INSERT INTO housekeeping_tickets
    (id, hotelId, roomNumber, ticketType, priority, assignedStaffName, status, requestedTime, notes)
    VALUES
    ('tkt-101', 'cmwgcs38h0002bduo6r8syp5s', '104', 'Turnover Cleaning', 'urgent', 'Sunita Devi', 'in_progress', '11:30 AM', 'Guest arrival scheduled at 2:00 PM, VIP room inspection checklist required'),
    ('tkt-102', 'cmwgcs38h0002bduo6r8syp5s', '101', 'Turndown & Aroma Service', 'normal', 'Kavita Patil', 'pending', '05:00 PM', 'Evening jasmine essential oil diffuser and herbal sleep mist pillow spray'),
    ('tkt-103', 'cmwgcs38h0002bduo6r8syp5s', '302', 'AC & Chiller Maintenance', 'high', 'Sunil Gupta', 'in_progress', '10:00 AM', 'Thermostat sensor recalibration and chilled water coil cleaning');
  `);
  console.log("✓ Housekeeping dispatch tickets seeded.");

  // Seed Spa Treatments Catalog
  await connection.query(`DELETE FROM spa_treatments`);
  await connection.query(`
    INSERT INTO spa_treatments
    (id, name, durationMinutes, price, category, description, herbalIngredients)
    VALUES
    ('spa-1', 'Abhyanga Full-Body Herbal Therapy', 75, 4500.00, 'Ayurvedic Therapy', 'Traditional synchronous warm medicated herbal oil massage promoting lymphatic drainage.', 'Bala-Ashwagandha medicated sesame oil, Dhanwantharam thailam'),
    ('spa-2', 'Shirodhara Meditative Mind Therapy', 60, 5200.00, 'Ayurvedic Therapy', 'Continuous rhythmic stream of warm infused herbal oils poured over the third eye.', 'Brahmi & Ksheerabala herbal oils, infused cow milk'),
    ('spa-3', 'Royal Saffron & Sandalwood Body Polish', 90, 6500.00, 'Royal Body Polish', 'Exquisite royal Mewari body scrub utilizing crushed Kashmiri walnut shells and Chandan.', 'Kashmiri Mogra Saffron, Mysore Sandalwood paste, Raw Almond Oil'),
    ('spa-4', 'Kumkumadi Vedic Radiance Facial', 60, 3800.00, 'Facial & Glow', 'Ancient Ayurvedic brightening facial infused with 24K gold foil and Kumkumadi Tailam.', 'Pure Kumkumadi Tailam, Lotus stamens, Vetiver root mist');
  `);
  console.log("✓ Ayurvedic Spa treatments catalog seeded.");

  // Seed Spa Bookings
  await connection.query(`DELETE FROM spa_bookings WHERE hotelId = 'h-1' OR hotelId = 'cmwgcs38h0002bduo6r8syp5s'`);
  await connection.query(`
    INSERT INTO spa_bookings
    (id, hotelId, bookingRef, roomNumber, guestName, treatmentName, therapistName, treatmentRoom, timeSlot, date, price, gstAmount, totalAmount, status, healthNotes)
    VALUES
    ('sb-101', 'cmwgcs38h0002bduo6r8syp5s', 'SPA-2026-441', '101', 'Aarav Sharma', 'Abhyanga Full-Body Herbal Therapy', 'Meera Pillai (Senior Vaidya)', 'Ayurvedic Pavilion Lotus 1', '04:30 PM', '2026-11-16', 4500.00, 810.00, 5310.00, 'scheduled', 'Focus on lower back tension, prefers medium oil temperature'),
    ('sb-102', 'cmwgcs38h0002bduo6r8syp5s', 'SPA-2026-442', '201', 'Rajesh Singhania', 'Shirodhara Meditative Mind Therapy', 'Dr. Suresh Nair', 'Ayurvedic Pavilion Shanti 2', '06:00 PM', '2026-11-16', 5200.00, 936.00, 6136.00, 'in_session', 'Deep relaxation for international jet lag');
  `);
  console.log("✓ Spa bookings seeded with 18% GST.");

  // Seed Excursion Packages
  await connection.query(`DELETE FROM excursion_packages`);
  await connection.query(`
    INSERT INTO excursion_packages
    (id, title, duration, pricePerPerson, category, description, includedHighlights)
    VALUES
    ('exc-1', 'Maharana Pratap Airport Chauffeur Transfer', '60 mins', 3200.00, 'Airport Transfer', 'Chauffeured luxury BMW or Toyota Innova Crysta airport transfer with cool towels.', '["Private Chauffeur", "Flight Delay Tracking", "Cold Lemongrass Towels"]'),
    ('exc-2', 'Lake Pichola Royal Sunset Boat Charter', '2.5 hours', 4800.00, 'Heritage Excursion', 'Exclusive private teakwood motorboat cruise around Jag Mandir and Lake Palace.', '["Private Royal Boatman", "Saffron Cooler", "Historian Guide", "Sunset Photography"]'),
    ('exc-3', 'Munnar Organic Tea Plantation & Spice Walk', '3 hours', 2200.00, 'Nature & Safari', 'Guided trek through British-era tea estates, cardamom valleys, and cinnamon plantations.', '["Naturalist Guide", "Cardamom Tasting", "Fresh High-Grown Tea"]');
  `);
  console.log("✓ Excursion tour packages seeded.");

  // Seed Concierge Bookings
  await connection.query(`DELETE FROM concierge_bookings WHERE hotelId = 'h-1' OR hotelId = 'cmwgcs38h0002bduo6r8syp5s'`);
  await connection.query(`
    INSERT INTO concierge_bookings
    (id, hotelId, bookingRef, roomNumber, guestName, serviceTitle, category, driverOrGuideName, vehicleOrVesselNumber, pickupTime, date, numberOfGuests, totalAmount, gstAmount, status, notes)
    VALUES
    ('cb-101', 'cmwgcs38h0002bduo6r8syp5s', 'CON-2026-901', '102', 'Priya Venkatesh', 'Lake Pichola Royal Sunset Boat Charter', 'Heritage Excursion', 'Narayan Singh', 'Royal Boat: "Padmavati-04"', '05:15 PM', '2026-11-16', 2, 9600.00, 1728.00, 'scheduled', 'Anniversary photography on Jag Mandir island'),
    ('cb-102', 'cmwgcs38h0002bduo6r8syp5s', 'CON-2026-902', '201', 'Rajesh Singhania', 'Maharana Pratap Airport Chauffeur Transfer', 'Airport Transfer', 'Balwant Rathore', 'Innova Crysta (RJ-27-UB-4491)', '03:00 PM', '2026-11-17', 3, 3200.00, 576.00, 'scheduled', 'Flight UK-988 to Delhi T3, 4 large bags');
  `);
  console.log("✓ Concierge dispatches seeded.");

  // Seed Shift Handovers
  await connection.query(`DELETE FROM shift_handovers WHERE hotelId = 'h-1' OR hotelId = 'cmwgcs38h0002bduo6r8syp5s'`);
  await connection.query(`
    INSERT INTO shift_handovers
    (id, hotelId, outgoingManagerName, incomingManagerName, shiftFrom, shiftTo, timestamp, frontDeskCashCollected, upiSettlementsCount, upiSettlementsAmount, pendingGuestRequestsCount, vipGuestsInHouse, keyHandoversNotes, status)
    VALUES
    ('sh-101', 'cmwgcs38h0002bduo6r8syp5s', 'Vikramaditya Rathore', 'Sunita Sharma', 'Morning', 'Afternoon', '02:30 PM (16 Nov 2026)', 48500.00, 14, 284000.00, 3, '["Rajesh Singhania (Suite 201)", "Kavita Reddy (Villa 301)"]', 'Emergency keycard encoded for Room 104; Chiller inspection underway; VIP Singhania Shirodhara at 6:00 PM.', 'completed');
  `);
  console.log("✓ Shift handovers & night audit logs seeded.");

  // 4. VERIFICATION QUERY
  console.log("\n[4/4] Verifying Final Database State in TiDB Cloud...");
  const [tables] = await connection.query("SHOW TABLES");
  console.log("Total Tables in 'resortos':", tables.length);

  for (const t of tables) {
    const tableName = Object.values(t)[0];
    const [cnt] = await connection.query(`SELECT COUNT(*) AS c FROM \`${tableName}\``);
    console.log(`  • ${tableName.padEnd(25)} : ${cnt[0].c} records`);
  }

  await connection.end();
  console.log("\n----------------------------------------------------------------");
  console.log("✓ TiDB Cloud Database Setup & Indian Seeding Successfully Completed!");
  console.log("----------------------------------------------------------------");
}

setupTiDBDatabase().catch((err) => {
  console.error("FATAL ERROR setting up TiDB database:", err);
  process.exit(1);
});
