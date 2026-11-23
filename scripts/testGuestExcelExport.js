/**
 * ResortOS - Guest Excel Export Complete Audit & Verification Test Suite
 * Tests Aadhaar, Passport, Driving License, Voter ID, null fields, historical notes extraction,
 * Excel binary generation (.xlsx), column mapping, row count integrity, and strict hotel isolation.
 */

const http = require('http');
const jwt = require('../server/utils/jwt');
const XLSX = require('xlsx');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

function createToken(role = 'ADMIN', hotelId = 'h-villa') {
  return jwt.sign({
    sub: 'u-audit-admin',
    role,
    hotelId,
    email: 'admin@resortos.com',
  });
}

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          buffer,
          text: buffer.toString('utf8'),
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function run() {
  console.log('================================================================');
  console.log('🧪 ResortOS Guest Excel Export - End-to-End Verification Suite');
  console.log('================================================================\n');

  const adminToken = createToken('ADMIN', 'h-villa');
  const managerToken = createToken('MANAGER', 'h-villa');
  const pool = require('../server/db');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  const createdBookingIds = [];
  const createdGuestIds = [];

  try {
    // -------------------------------------------------------------
    // Test 1: Security & RBAC Enforcement on Export Endpoint
    // -------------------------------------------------------------
    console.log('--- TEST 1: Security & RBAC Enforcement ---');

    // 1a. Unauthenticated request
    const unauthRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/reports/guests/export?hotelId=h-villa',
      method: 'GET',
    });
    assert(unauthRes.statusCode === 401, 'Unauthenticated request returns 401 Unauthorized');

    // 1b. Manager role request (export is admin-only)
    const managerRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/reports/guests/export?hotelId=h-villa',
      method: 'GET',
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert(managerRes.statusCode === 403, 'Manager role returns 403 Forbidden for historical guest export');

    // 1c. Invalid hotelId
    const invalidHotelRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/reports/guests/export?hotelId=invalid-hotel',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(invalidHotelRes.statusCode === 400, 'Invalid hotelId returns 400 Bad Request');

    // -------------------------------------------------------------
    // Test 2: Baseline Historical Records Verification
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Baseline Historical Records Export (JSON & Structure) ---');

    const baselineVillaRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/reports/guests/export?hotelId=h-villa&format=json',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(baselineVillaRes.statusCode === 200, 'Admin can fetch baseline The Villa records (200 OK)');
    const baselineVillaJson = JSON.parse(baselineVillaRes.text);
    assert(baselineVillaJson.success === true, 'JSON response has success: true');
    assert(baselineVillaJson.hotelId === 'h-villa', 'JSON response hotelId is h-villa');
    assert(Array.isArray(baselineVillaJson.records), 'Records is an array');
    console.log(`  ℹ Found ${baselineVillaJson.totalRecords} baseline historical records for The Villa.`);

    const baselineNavkarRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/reports/guests/export?hotelId=h-navkar&format=json',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(baselineNavkarRes.statusCode === 200, 'Admin can fetch baseline Navkar Palace records (200 OK)');
    const baselineNavkarJson = JSON.parse(baselineNavkarRes.text);
    console.log(`  ℹ Found ${baselineNavkarJson.totalRecords} baseline historical records for Navkar Palace.`);

    // -------------------------------------------------------------
    // Test 3: Create Test Fixtures Across All ID Proof Types
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Creation & Persistence Across Supported ID Proof Types ---');

    // Fixture 1: Aadhaar Card via POST /bookings for The Villa
    const b1Res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/bookings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      {
        hotelId: 'h-villa',
        guestName: 'Audit Test Aadhaar Guest',
        guestPhone: '+91 9100000001',
        guestEmail: 'aadhaar@audit.test',
        roomNumber: '103',
        roomType: 'Deluxe Room',
        checkInDate: '2026-11-25',
        checkOutDate: '2026-11-27',
        adults: 2,
        children: 0,
        roomPrice: 3000,
        advanceAmount: 3000,
        notes: 'Aadhaar test fixture',
        guestKyc: {
          idType: 'Aadhaar Card',
          idNumber: '4821 9920 1120',
          cityOfOrigin: 'Jaipur',
          verificationStatus: 'verified',
        },
      }
    );
    assert(b1Res.statusCode === 201, 'Booking 1 (Aadhaar Card) created successfully');
    const b1Json = JSON.parse(b1Res.text);
    createdBookingIds.push(b1Json.id);

    // Fixture 2: Passport via POST /bookings/walk-in for The Villa
    const b2Res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/bookings/walk-in',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      {
        hotelId: 'h-villa',
        guestName: 'Audit Test Passport Guest',
        guestPhone: '+91 9100000002',
        guestEmail: 'passport@audit.test',
        roomNumber: '104',
        roomCategory: 'Super Deluxe Room',
        checkInDate: '2026-11-23',
        checkOutDate: '2026-11-25',
        numberOfGuests: 1,
        totalAmount: 6000,
        depositPaid: 6000,
        paymentMethod: 'UPI',
        guestKyc: {
          idType: 'Passport',
          idNumber: 'Z9876543',
          cityOfOrigin: 'Delhi',
          verificationStatus: 'verified',
        },
        notes: 'Passport walk-in test fixture',
      }
    );
    assert(b2Res.statusCode === 201, 'Booking 2 (Passport walk-in) created successfully');
    const b2Json = JSON.parse(b2Res.text);
    createdBookingIds.push(b2Json.id);

    // Fixture 3: Driving License via Check-In KYC update for The Villa
    const b3Create = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/bookings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      {
        hotelId: 'h-villa',
        guestName: 'Audit Test Driving License Guest',
        guestPhone: '+91 9100000003',
        guestEmail: 'driving@audit.test',
        roomNumber: '105',
        roomType: 'Suite',
        checkInDate: '2026-11-24',
        checkOutDate: '2026-11-26',
        adults: 2,
        roomPrice: 4500,
        advanceAmount: 2000,
        notes: 'Pre-booking before checkin KYC',
      }
    );
    const b3Json = JSON.parse(b3Create.text);
    createdBookingIds.push(b3Json.id);

    const b3CheckIn = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/api/bookings/${b3Json.id}/checkin`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      {
        roomNumber: '105',
        guestKyc: {
          idType: 'Driving License',
          idNumber: 'DL-04-2022-1234567',
          cityOfOrigin: 'Mumbai',
          verificationStatus: 'verified',
        },
      }
    );
    assert(b3CheckIn.statusCode === 200, 'Booking 3 checked in with Driving License KYC update');

    // Fixture 4: Voter ID for Navkar Palace (Strict Isolation Test)
    const b4Res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/bookings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      {
        hotelId: 'h-navkar',
        guestName: 'Audit Test Voter ID Guest',
        guestPhone: '+91 9100000004',
        guestEmail: 'voter@audit.test',
        roomNumber: '201',
        roomType: 'Deluxe AC Room',
        checkInDate: '2026-11-26',
        checkOutDate: '2026-11-28',
        adults: 1,
        roomPrice: 2800,
        advanceAmount: 2800,
        guestKyc: {
          idType: 'Voter ID',
          idNumber: 'ABC1234567',
          cityOfOrigin: 'Kolkata',
          verificationStatus: 'verified',
        },
      }
    );
    assert(b4Res.statusCode === 201, 'Booking 4 (Voter ID for Navkar Palace) created successfully');
    const b4Json = JSON.parse(b4Res.text);
    createdBookingIds.push(b4Json.id);

    // Fixture 5: Null / Unprovided ID Proof for Navkar Palace
    const b5Res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/bookings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      {
        hotelId: 'h-navkar',
        guestName: 'Audit Test Null ID Guest',
        guestPhone: '+91 9100000005',
        guestEmail: 'nullid@audit.test',
        roomNumber: '202',
        roomType: 'Executive Room',
        checkInDate: '2026-11-27',
        checkOutDate: '2026-11-29',
        adults: 2,
        roomPrice: 3200,
        advanceAmount: 0,
        notes: 'No ID proof submitted',
      }
    );
    assert(b5Res.statusCode === 201, 'Booking 5 (Null ID Proof) created successfully');
    const b5Json = JSON.parse(b5Res.text);
    createdBookingIds.push(b5Json.id);

    // Fixture 6: Historical Free-Text Notes with ID Proof
    const b6Res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/bookings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      {
        hotelId: 'h-villa',
        guestName: 'Audit Test Historical Notes Guest',
        guestPhone: '+91 9100000006',
        guestEmail: 'historical@audit.test',
        roomNumber: '106',
        roomType: 'Deluxe Room',
        checkInDate: '2026-11-20',
        checkOutDate: '2026-11-22',
        adults: 2,
        roomPrice: 2500,
        advanceAmount: 2500,
        notes: 'Walk-in Guest. ID: Aadhaar Card (9999 8888 7777). From: Udaipur. Late checkout requested.',
      }
    );
    assert(b6Res.statusCode === 201, 'Booking 6 (Historical notes with ID proof) created successfully');
    const b6Json = JSON.parse(b6Res.text);
    createdBookingIds.push(b6Json.id);

    // -------------------------------------------------------------
    // Test 4: Verify JSON API Export Output
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Verification of JSON Export Output ---');

    const villaExportRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/reports/guests/export?hotelId=h-villa&format=json',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const villaJson = JSON.parse(villaExportRes.text);

    // Check Guest 1: Aadhaar Card
    const g1 = villaJson.records.find((r) => r.bookingId === b1Json.id);
    assert(!!g1, 'Guest 1 (Aadhaar) present in The Villa export');
    assert(g1.idType === 'Aadhaar Card', `Guest 1 idType matches: "${g1.idType}"`);
    assert(g1.idNumber === '4821 9920 1120', `Guest 1 idNumber matches: "${g1.idNumber}"`);
    assert(g1.cityOfOrigin === 'Jaipur', `Guest 1 cityOfOrigin matches: "${g1.cityOfOrigin}"`);

    // Check Guest 2: Passport
    const g2 = villaJson.records.find((r) => r.bookingId === b2Json.id);
    assert(!!g2, 'Guest 2 (Passport) present in The Villa export');
    assert(g2.idType === 'Passport', `Guest 2 idType matches: "${g2.idType}"`);
    assert(g2.idNumber === 'Z9876543', `Guest 2 idNumber matches: "${g2.idNumber}"`);
    assert(g2.cityOfOrigin === 'Delhi', `Guest 2 cityOfOrigin matches: "${g2.cityOfOrigin}"`);

    // Check Guest 3: Driving License
    const g3 = villaJson.records.find((r) => r.bookingId === b3Json.id);
    assert(!!g3, 'Guest 3 (Driving License) present in The Villa export');
    assert(g3.idType === 'Driving License', `Guest 3 idType matches: "${g3.idType}"`);
    assert(g3.idNumber === 'DL-04-2022-1234567', `Guest 3 idNumber matches: "${g3.idNumber}"`);
    assert(g3.cityOfOrigin === 'Mumbai', `Guest 3 cityOfOrigin matches: "${g3.cityOfOrigin}"`);

    // Check Guest 6: Historical Notes ID Extraction
    const g6 = villaJson.records.find((r) => r.bookingId === b6Json.id);
    assert(!!g6, 'Guest 6 (Historical Notes) present in The Villa export');
    assert(g6.idType === 'Aadhaar Card', `Guest 6 parsed idType from notes: "${g6.idType}"`);
    assert(g6.idNumber === '9999 8888 7777', `Guest 6 parsed idNumber from notes: "${g6.idNumber}"`);
    assert(g6.cityOfOrigin === 'Udaipur', `Guest 6 parsed cityOfOrigin from notes: "${g6.cityOfOrigin}"`);

    // -------------------------------------------------------------
    // Test 5: Verify Navkar Palace Export & Strict Isolation
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Strict Hotel-Wise Data Isolation ---');

    const navkarExportRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/reports/guests/export?hotelId=h-navkar&format=json',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const navkarJson = JSON.parse(navkarExportRes.text);

    // Check Guest 4: Voter ID in Navkar Palace
    const g4 = navkarJson.records.find((r) => r.bookingId === b4Json.id);
    assert(!!g4, 'Guest 4 (Voter ID) present in Navkar Palace export');
    assert(g4.idType === 'Voter ID', `Guest 4 idType matches: "${g4.idType}"`);
    assert(g4.idNumber === 'ABC1234567', `Guest 4 idNumber matches: "${g4.idNumber}"`);
    assert(g4.cityOfOrigin === 'Kolkata', `Guest 4 cityOfOrigin matches: "${g4.cityOfOrigin}"`);

    // Check Guest 5: Null ID in Navkar Palace
    const g5 = navkarJson.records.find((r) => r.bookingId === b5Json.id);
    assert(!!g5, 'Guest 5 (Null ID) present in Navkar Palace export');
    assert(g5.idType === 'N/A', `Guest 5 idType defaults gracefully to "N/A": "${g5.idType}"`);
    assert(g5.idNumber === 'N/A', `Guest 5 idNumber defaults gracefully to "N/A": "${g5.idNumber}"`);

    // Isolation Check 1: NONE of The Villa test guests appear in Navkar Palace
    const villaInNavkar = navkarJson.records.some((r) =>
      [b1Json.id, b2Json.id, b3Json.id, b6Json.id].includes(r.bookingId)
    );
    assert(!villaInNavkar, 'ZERO The Villa guests leaked into Navkar Palace export');

    // Isolation Check 2: NONE of Navkar Palace test guests appear in The Villa
    const navkarInVilla = villaJson.records.some((r) =>
      [b4Json.id, b5Json.id].includes(r.bookingId)
    );
    assert(!navkarInVilla, 'ZERO Navkar Palace guests leaked into The Villa export');

    // -------------------------------------------------------------
    // Test 6: Excel Workbook (.xlsx) Generation & Parsing
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Excel (.xlsx) Binary Download & Worksheet Structure ---');

    const excelVillaRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/reports/guests/export?hotelId=h-villa',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(excelVillaRes.statusCode === 200, 'Excel .xlsx endpoint returns HTTP 200');
    assert(
      excelVillaRes.headers['content-type'].includes('spreadsheetml'),
      'Content-Type is valid OpenXML spreadsheetml'
    );
    assert(
      excelVillaRes.headers['content-disposition'].includes('.xlsx'),
      'Content-Disposition header includes .xlsx filename'
    );

    // Parse the binary Excel workbook
    const wb = XLSX.read(excelVillaRes.buffer, { type: 'buffer' });
    assert(wb.SheetNames.length >= 1, `Workbook contains sheet: "${wb.SheetNames[0]}"`);
    assert(wb.SheetNames[0] === 'The Villa - Guests', 'Sheet name correctly identifies The Villa');

    const ws = wb.Sheets[wb.SheetNames[0]];
    const sheetData = XLSX.utils.sheet_to_json(ws);
    assert(sheetData.length === villaJson.totalRecords, `Excel row count (${sheetData.length}) exactly matches API count (${villaJson.totalRecords})`);

    // Validate expected columns
    const firstRow = sheetData[0];
    const expectedHeaders = [
      'S.No',
      'Booking Reference',
      'Guest Name',
      'Phone Number',
      'Email Address',
      'Property',
      'Room Number',
      'Room Category',
      'Check-In Date',
      'Check-Out Date',
      'Nights',
      'Guests',
      'Status',
      'Total Amount (₹)',
      'Deposit Paid (₹)',
      'Balance Due (₹)',
      'Payment Status',
      'Payment Method',
      'Booking Type',
      'Govt ID Type',
      'Govt ID Number',
      'City of Origin',
      'Special Notes',
      'Created At',
    ];

    let allHeadersPresent = true;
    for (const h of expectedHeaders) {
      if (!(h in firstRow)) {
        console.error(`    Missing header: ${h}`);
        allHeadersPresent = false;
      }
    }
    assert(allHeadersPresent, 'All 24 required Excel column headers are present');

    // Find our test rows inside the parsed Excel data
    const xlG1 = sheetData.find((r) => r['Guest Name'] === 'Audit Test Aadhaar Guest');
    assert(!!xlG1, 'Aadhaar guest row found in parsed Excel sheet');
    assert(xlG1['Govt ID Type'] === 'Aadhaar Card', `Excel Govt ID Type is "Aadhaar Card"`);
    assert(xlG1['Govt ID Number'] === '4821 9920 1120', `Excel Govt ID Number is "4821 9920 1120"`);
    assert(xlG1['City of Origin'] === 'Jaipur', `Excel City of Origin is "Jaipur"`);
    assert(xlG1['Property'] === 'THE VILLA', `Excel Property is "THE VILLA"`);

    const xlG2 = sheetData.find((r) => r['Guest Name'] === 'Audit Test Passport Guest');
    assert(!!xlG2, 'Passport guest row found in parsed Excel sheet');
    assert(xlG2['Govt ID Type'] === 'Passport', `Excel Govt ID Type is "Passport"`);
    assert(xlG2['Govt ID Number'] === 'Z9876543', `Excel Govt ID Number is "Z9876543"`);
    assert(xlG2['City of Origin'] === 'Delhi', `Excel City of Origin is "Delhi"`);

    const xlG3 = sheetData.find((r) => r['Guest Name'] === 'Audit Test Driving License Guest');
    assert(!!xlG3, 'Driving License guest row found in parsed Excel sheet');
    assert(xlG3['Govt ID Type'] === 'Driving License', `Excel Govt ID Type is "Driving License"`);
    assert(xlG3['Govt ID Number'] === 'DL-04-2022-1234567', `Excel Govt ID Number is "DL-04-2022-1234567"`);

    const xlG6 = sheetData.find((r) => r['Guest Name'] === 'Audit Test Historical Notes Guest');
    assert(!!xlG6, 'Historical notes guest row found in parsed Excel sheet');
    assert(xlG6['Govt ID Type'] === 'Aadhaar Card', `Excel Govt ID Type parsed from notes is "Aadhaar Card"`);
    assert(xlG6['Govt ID Number'] === '9999 8888 7777', `Excel Govt ID Number parsed from notes is "9999 8888 7777"`);
    assert(xlG6['City of Origin'] === 'Udaipur', `Excel City of Origin parsed from notes is "Udaipur"`);

    // Verify Navkar Palace Excel Download
    const excelNavkarRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/reports/guests/export?hotelId=h-navkar',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const wbNavkar = XLSX.read(excelNavkarRes.buffer, { type: 'buffer' });
    assert(wbNavkar.SheetNames[0] === 'Navkar Palace - Guests', 'Navkar Palace sheet name correctly identified');
    const sheetNavkar = XLSX.utils.sheet_to_json(wbNavkar.Sheets[wbNavkar.SheetNames[0]]);
    const xlG4 = sheetNavkar.find((r) => r['Guest Name'] === 'Audit Test Voter ID Guest');
    assert(!!xlG4, 'Voter ID guest found in Navkar Palace Excel sheet');
    assert(xlG4['Govt ID Type'] === 'Voter ID', `Navkar Excel Govt ID Type is "Voter ID"`);
    assert(xlG4['Govt ID Number'] === 'ABC1234567', `Navkar Excel Govt ID Number is "ABC1234567"`);

  } catch (err) {
    console.error('Test run error:', err);
    failed++;
  } finally {
    // -------------------------------------------------------------
    // Clean Up Only Test Fixtures
    // -------------------------------------------------------------
    console.log('\n--- CLEANUP: Safely Purging Only Disposable Test Fixtures ---');
    try {
      if (createdBookingIds.length > 0) {
        const placeholders = createdBookingIds.map(() => '?').join(',');
        await pool.query(`DELETE FROM invoices WHERE bookingId IN (${placeholders})`, createdBookingIds);
        await pool.query(`DELETE FROM bookings WHERE id IN (${placeholders})`, createdBookingIds);
        console.log(`  ✓ Safely deleted ${createdBookingIds.length} test bookings`);
      }
      // Also clean up any test guests created with phone numbers starting with +91 910000000
      await pool.query(`DELETE FROM guests WHERE phone LIKE '%910000000%'`);
      console.log('  ✓ Safely cleaned up disposable test guests');
    } catch (cleanupErr) {
      console.error('Cleanup warning:', cleanupErr.message);
    }

    console.log('\n================================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  }
}

run();
