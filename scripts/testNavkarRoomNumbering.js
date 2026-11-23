/**
 * ResortOS - Navkar Palace Room Number Correction Verification Suite
 *
 * Verifies:
 * 1. Navkar Palace rooms are strictly numbered 1 to 70 (no 101-170).
 * 2. Zero duplicate room numbers within Navkar Palace (70 distinct numbers).
 * 3. Floor distribution: Floor 1 (1-25), Floor 2 (26-50), Floor 3 (51-70).
 * 4. Room IDs preserved as 'rm-n-101' through 'rm-n-170'.
 * 5. The Villa's 15 rooms (101-115) remain 100% untouched.
 * 6. Existing booking for Manas soni (b-1795364249260) links to Room 1 (rm-n-101).
 * 7. GET /rooms API returns Navkar rooms sorted in numeric order (1, 2, ..., 70).
 * 8. Walk-in check-in to Room 2 in Navkar Palace works and displays '2'.
 * 9. Advance booking to Room 3 in Navkar Palace works and displays '3'.
 * 10. Room availability properly reflects occupancy for rooms 1-70.
 */

const http = require('http');
const jwt = require('../server/utils/jwt');
const pool = require('../server/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

function createToken(role = 'ADMIN', hotelId = 'h-navkar') {
  return jwt.sign({
    sub: 'u-audit-admin',
    role,
    hotelId,
    email: 'admin@resortos.com',
  });
}

function request(path, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/api${path}`,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            resolve({ status: res.statusCode, headers: res.headers, data: json });
          } catch {
            resolve({ status: res.statusCode, headers: res.headers, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

function getTodayISTString() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function getTomorrowISTString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

async function runTests() {
  console.log('================================================================');
  console.log('🏨 ResortOS - Navkar Palace Room Number Correction Verification');
  console.log('================================================================\n');

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

  const adminToken = createToken('ADMIN', 'h-navkar');
  const todayStr = getTodayISTString();
  const tomorrowStr = getTomorrowISTString();
  const testBookingIds = [];

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Database Room Numbering for Navkar Palace
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Database Room Numbers in Navkar Palace (1 to 70) ---');
    const [navkarRoomsDb] = await pool.query(
      'SELECT id, hotelId, roomNumber, floor, category, status FROM rooms WHERE hotelId = "h-navkar" ORDER BY CAST(roomNumber AS UNSIGNED)'
    );

    assert(navkarRoomsDb.length === 70, `Navkar Palace has exactly 70 rooms in DB (Actual: ${navkarRoomsDb.length})`);

    const roomNums = navkarRoomsDb.map((r) => r.roomNumber);
    const expectedNums = Array.from({ length: 70 }, (_, i) => (i + 1).toString());
    const matchesExpected = JSON.stringify(roomNums) === JSON.stringify(expectedNums);
    assert(matchesExpected, 'Navkar room numbers are exactly sequential "1" through "70"');

    // -------------------------------------------------------------------------
    // TEST 2: Check for Duplicate Room Numbers in Navkar Palace
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Duplicate Room Number Audit in Navkar Palace ---');
    const distinctSet = new Set(roomNums);
    assert(distinctSet.size === 70, `All 70 room numbers are completely distinct (No duplicates: ${distinctSet.size}/70)`);

    const [dupQuery] = await pool.query(
      'SELECT roomNumber, COUNT(*) as c FROM rooms WHERE hotelId = "h-navkar" GROUP BY roomNumber HAVING c > 1'
    );
    assert(dupQuery.length === 0, `Database duplicate query returned ZERO duplicate room numbers`);

    // -------------------------------------------------------------------------
    // TEST 3: Floor and Category Distribution
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Floor Distribution Audit ---');
    const floor1 = navkarRoomsDb.filter((r) => r.floor === 1);
    const floor2 = navkarRoomsDb.filter((r) => r.floor === 2);
    const floor3 = navkarRoomsDb.filter((r) => r.floor === 3);

    assert(floor1.length === 25, `Floor 1 contains exactly 25 rooms (Actual: ${floor1.length})`);
    assert(floor1[0].roomNumber === '1' && floor1[floor1.length - 1].roomNumber === '25', 'Floor 1 covers Rooms 1 to 25');

    assert(floor2.length === 25, `Floor 2 contains exactly 25 rooms (Actual: ${floor2.length})`);
    assert(floor2[0].roomNumber === '26' && floor2[floor2.length - 1].roomNumber === '50', 'Floor 2 covers Rooms 26 to 50');

    assert(floor3.length === 20, `Floor 3 contains exactly 20 rooms (Actual: ${floor3.length})`);
    assert(floor3[0].roomNumber === '51' && floor3[floor3.length - 1].roomNumber === '70', 'Floor 3 covers Rooms 51 to 70');

    // -------------------------------------------------------------------------
    // TEST 4: Preservation of Room IDs
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Preservation of Room IDs ---');
    const rm1 = navkarRoomsDb.find((r) => r.roomNumber === '1');
    assert(rm1?.id === 'rm-n-101', `Room 1 preserves original ID 'rm-n-101' (Actual: "${rm1?.id}")`);

    const rm70 = navkarRoomsDb.find((r) => r.roomNumber === '70');
    assert(rm70?.id === 'rm-n-170', `Room 70 preserves original ID 'rm-n-170' (Actual: "${rm70?.id}")`);

    // -------------------------------------------------------------------------
    // TEST 5: The Villa's Rooms are 100% Untouched
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: The Villa Untouched Isolation Audit ---');
    const [villaRoomsDb] = await pool.query(
      'SELECT id, hotelId, roomNumber FROM rooms WHERE hotelId = "h-villa" ORDER BY CAST(roomNumber AS UNSIGNED)'
    );
    assert(villaRoomsDb.length === 15, `The Villa has exactly 15 rooms (Actual: ${villaRoomsDb.length})`);

    const villaNums = villaRoomsDb.map((r) => r.roomNumber);
    const expectedVillaNums = ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115'];
    assert(JSON.stringify(villaNums) === JSON.stringify(expectedVillaNums), 'The Villa room numbers strictly remain 101 to 115');

    // -------------------------------------------------------------------------
    // TEST 6: Existing Booking Preservation (Manas Soni)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Existing Booking Relationships ---');
    const [manasBkg] = await pool.query('SELECT * FROM bookings WHERE id = "b-1795364249260"');
    assert(manasBkg.length === 1, 'Existing booking for Manas soni exists in DB');
    assert(manasBkg[0]?.roomNumber === '1', `Booking roomNumber updated to '1' (Actual: "${manasBkg[0]?.roomNumber}")`);
    assert(manasBkg[0]?.roomId === 'rm-n-101', `Booking roomId preserved as 'rm-n-101' (Actual: "${manasBkg[0]?.roomId}")`);
    assert(manasBkg[0]?.guestName === 'Manas soni', `Booking guest name preserved as 'Manas soni'`);

    // -------------------------------------------------------------------------
    // TEST 7: GET /rooms API Endpoint Behavior
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 7: GET /rooms API Response Verification ---');
    const apiRoomsRes = await request('/rooms?hotelId=h-navkar', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(apiRoomsRes.status === 200, 'GET /rooms?hotelId=h-navkar returns HTTP 200');
    assert(apiRoomsRes.data.length === 70, `API returns 70 rooms for Navkar Palace`);

    const apiRoomNums = apiRoomsRes.data.map((r) => r.roomNumber);
    assert(apiRoomNums[0] === '1', `First room in API response is "1"`);
    assert(apiRoomNums[69] === '70', `Last room in API response is "70"`);
    assert(JSON.stringify(apiRoomNums) === JSON.stringify(expectedNums), 'API returns rooms in strictly sorted numeric order 1 to 70');

    // -------------------------------------------------------------------------
    // TEST 8: Walk-In Check-In to Room 2 in Navkar Palace
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 8: Walk-In Check-In to Room 2 in Navkar Palace ---');
    const walkInPayload = {
      hotelId: 'h-navkar',
      guestName: 'Anushka Sharma',
      guestPhone: '+91 98290 88771',
      guestEmail: 'anushka.s@test.com',
      roomCategory: 'Deluxe AC Room',
      roomId: 'rm-n-102',
      roomNumber: '2',
      checkInDate: todayStr,
      checkOutDate: tomorrowStr,
      nightsCount: 1,
      numberOfGuests: 2,
      status: 'checked_in',
      totalAmount: 2800,
      depositPaid: 2800,
      paymentStatus: 'paid',
    };

    const walkInRes = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, walkInPayload);

    assert(walkInRes.status === 201, `Walk-in booking created (HTTP 201, ID: ${walkInRes.data?.id})`);
    const bId = walkInRes.data?.id;
    testBookingIds.push(bId);

    // Verify booking record in DB
    const [bkgDb] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bId]);
    assert(bkgDb[0]?.roomNumber === '2', `DB booking roomNumber is '2' (Actual: "${bkgDb[0]?.roomNumber}")`);
    assert(bkgDb[0]?.roomId === 'rm-n-102', `DB booking roomId is 'rm-n-102'`);

    // Verify room occupancy in DB
    const [rm2Db] = await pool.query('SELECT status, currentGuestName FROM rooms WHERE id = "rm-n-102"');
    assert(rm2Db[0]?.status === 'OCCUPIED', `Room 2 (rm-n-102) transitioned to OCCUPIED`);
    assert(rm2Db[0]?.currentGuestName === 'Anushka Sharma', `Room 2 currentGuestName is "Anushka Sharma"`);

    // Verify In-House listing reflects Room 2
    const navkarBookings = await request('/bookings?hotelId=h-navkar', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const guestCard = navkarBookings.data.find((b) => b.id === bId);
    assert(!!guestCard, 'Guest Anushka Sharma appears in Navkar bookings listing');
    assert(guestCard?.roomNumber === '2', `Guest card displays Room Number '2' (Actual: "${guestCard?.roomNumber}")`);

    // -------------------------------------------------------------------------
    // TEST 9: Advance Booking to Room 3 in Navkar Palace
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 9: Advance Booking to Room 3 in Navkar Palace ---');
    const advancePayload = {
      hotelId: 'h-navkar',
      guestName: 'Karan Johar',
      guestPhone: '+91 98290 55443',
      guestEmail: 'karan.j@test.com',
      roomNumber: '3',
      roomType: 'Deluxe AC Room',
      checkInDate: tomorrowStr,
      checkOutDate: '2026-11-26',
      adults: 2,
      children: 0,
      roomPrice: 2800,
      advanceAmount: 1400,
      notes: 'Navkar Room 3 advance booking test',
    };

    const advanceRes = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, advancePayload);

    assert(advanceRes.status === 201, `Advance booking created (HTTP 201, ID: ${advanceRes.data?.id})`);
    const advId = advanceRes.data?.id;
    testBookingIds.push(advId);

    const [advDb] = await pool.query('SELECT * FROM bookings WHERE id = ?', [advId]);
    assert(advDb[0]?.roomNumber === '3', `Advance booking roomNumber is '3' (Actual: "${advDb[0]?.roomNumber}")`);

    // -------------------------------------------------------------------------
    // TEST 10: Checkout of Room 2 Restores Room Status
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 10: Checkout of Room 2 ---');
    const checkoutRes = await request(`/bookings/${bId}/checkout`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(checkoutRes.status === 200, 'Checkout of Room 2 succeeds (HTTP 200)');

    const [rm2After] = await pool.query('SELECT status, currentGuestName FROM rooms WHERE id = "rm-n-102"');
    assert(rm2After[0]?.status === 'AVAILABLE', `Room 2 status restored to AVAILABLE (Actual: "${rm2After[0]?.status}")`);
    assert(rm2After[0]?.currentGuestName === null, 'Room 2 currentGuestName cleared to NULL');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    // Clean up test bookings
    console.log('\n--- CLEANUP ---');
    try {
      if (testBookingIds.length > 0) {
        const placeholders = testBookingIds.map(() => '?').join(',');
        await pool.query(`DELETE FROM invoices WHERE bookingId IN (${placeholders})`, testBookingIds);
        await pool.query(`DELETE FROM bookings WHERE id IN (${placeholders})`, testBookingIds);
        console.log(`  ✓ Purged ${testBookingIds.length} test bookings and invoices`);
      }
      await pool.query('DELETE FROM guests WHERE phone IN (?, ?)', ['+91 98290 88771', '+91 98290 55443']);
      await pool.query('UPDATE rooms SET status = "AVAILABLE", currentGuestName = NULL, currentBookingId = NULL WHERE id IN ("rm-n-102", "rm-n-103")');
      console.log('  ✓ Restored rooms rm-n-102 and rm-n-103');
    } catch (cleanErr) {
      console.error('Cleanup error:', cleanErr.message);
    }

    console.log('\n================================================================');
    console.log(`NAVKAR ROOM NUMBER VERIFICATION SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
