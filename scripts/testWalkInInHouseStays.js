/**
 * ResortOS - Walk-In Check-In & In-House Stays Complete Verification Suite
 * Tests:
 * 1. Walk-In check-in to Room 104 in The Villa appears in In-House Stays
 * 2. Walk-In check-in in Navkar Palace appears only in Navkar (strict hotel isolation)
 * 3. Refresh simulation keeps guest visible
 * 4. Room occupancy transitions to OCCUPIED with guest name
 * 5. Guest disappears from In-House Stays after checkout
 * 6. Advance bookings scheduled for today appear as arrivals and can check in
 * 7. Payment validation: Total ₹2500, Advance ₹2500, Payment Status PAID
 * 8. All 9 fields (Name, Phone, Room, Type, Check-in Date/Time, Check-out, Total, Advance, Payment Status)
 */

const http = require('http');
const jwt = require('../server/utils/jwt');
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

// Indian standard date helpers (replicating frontend HotelContext/CheckInRooms logic)
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

// In-House & Arrivals filter logic (exact logic from HotelContext.todayArrivals)
function filterInHouseAndArrivals(bookings, todayStr) {
  return bookings.filter((b) => {
    if (b.status === 'cancelled' || b.status === 'checked_out') return false;
    // 1. Any currently in-house checked-in guest
    if (b.status === 'checked_in') return true;
    // 2. Any arrival scheduled for today
    if (b.checkInDate === todayStr) return true;
    return false;
  });
}

async function run() {
  console.log('================================================================');
  console.log('🏨 ResortOS Walk-In Check-In & In-House Stays Verification Suite');
  console.log('================================================================\n');

  const adminToken = createToken('ADMIN', 'h-villa');
  const pool = require('../server/db');
  const todayStr = getTodayISTString();
  const tomorrowStr = getTomorrowISTString();

  console.log(`ℹ Environment Date (Asia/Kolkata): Today = ${todayStr}, Tomorrow = ${tomorrowStr}\n`);

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

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Create Walk-In Booking in The Villa -> Check into Room 104
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Walk-In Check-In to Room 104 in The Villa ---');

    const walkInVillaPayload = {
      hotelId: 'h-villa',
      guestName: 'Rohit Khandelwal',
      guestPhone: '+91 9829012345',
      guestEmail: 'rohit.k@gmail.com',
      roomCategory: 'Deluxe Room',
      roomId: 'rm-v-104',
      roomNumber: '104',
      checkInDate: todayStr,
      checkOutDate: tomorrowStr,
      nightsCount: 1,
      numberOfGuests: 2,
      status: 'checked_in',
      totalAmount: 2500,
      depositPaid: 2500,
      paymentStatus: 'paid',
      specialRequests: 'Walk-in Guest. ID: Aadhaar Card (4821 9920 1120). Near pool',
      guestKyc: {
        idType: 'Aadhaar Card',
        idNumber: '4821 9920 1120',
        cityOfOrigin: 'Jaipur',
        verificationStatus: 'verified',
      },
      idType: 'Aadhaar Card',
      idNumber: '4821 9920 1120',
      city: 'Jaipur',
    };

    const b1Res = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, walkInVillaPayload);

    assert(b1Res.status === 201, `Walk-in booking created with HTTP 201 (ID: ${b1Res.data?.id})`);
    const b1Id = b1Res.data?.id;
    createdBookingIds.push(b1Id);

    // Fetch /bookings for The Villa and evaluate in-house listing
    const villaBookingsRes = await request('/bookings?hotelId=h-villa', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(villaBookingsRes.status === 200, 'GET /bookings?hotelId=h-villa returns HTTP 200');

    const inHouseVilla = filterInHouseAndArrivals(villaBookingsRes.data, todayStr);
    const guest104 = inHouseVilla.find((b) => b.id === b1Id);

    assert(!!guest104, 'Guest Rohit Khandelwal immediately appears in In-House Stays & Arrivals');
    assert(guest104?.guestName === 'Rohit Khandelwal', `Guest Name matches: "${guest104?.guestName}"`);
    assert(guest104?.guestPhone === '+91 9829012345', `Mobile Number matches: "${guest104?.guestPhone}"`);
    assert(guest104?.roomNumber === '104', `Room Number matches: "${guest104?.roomNumber}"`);
    assert(guest104?.roomCategory === 'Deluxe Room', `Room Type matches: "${guest104?.roomCategory}"`);
    assert(guest104?.checkInDate === todayStr, `Check-In Date matches today: "${guest104?.checkInDate}"`);
    assert(guest104?.checkOutDate === tomorrowStr, `Check-Out Date matches tomorrow: "${guest104?.checkOutDate}"`);
    assert(guest104?.totalAmount === 2500, `Total Amount is ₹2500: "${guest104?.totalAmount}"`);
    assert(guest104?.depositPaid === 2500, `Advance Payment is ₹2500: "${guest104?.depositPaid}"`);
    assert(guest104?.paymentStatus === 'paid', `Payment Status is "paid": "${guest104?.paymentStatus}"`);
    assert(guest104?.status === 'checked_in', `Booking Status is "checked_in" (In-House)`);

    // -------------------------------------------------------------------------
    // TEST 2: Create Walk-In Booking in Navkar Palace & Strict Isolation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Walk-In in Navkar Palace & Strict Hotel Isolation ---');

    const walkInNavkarPayload = {
      hotelId: 'h-navkar',
      guestName: 'Vikramaditya Rathore',
      guestPhone: '+91 9829099888',
      guestEmail: 'vikram.rathore@gmail.com',
      roomCategory: 'Deluxe AC Room',
      roomId: 'rm-n-102',
      roomNumber: '2',
      checkInDate: todayStr,
      checkOutDate: tomorrowStr,
      nightsCount: 1,
      numberOfGuests: 2,
      status: 'checked_in',
      totalAmount: 3200,
      depositPaid: 3200,
      paymentStatus: 'paid',
      specialRequests: 'Walk-in Guest. ID: Passport (J8877665). Palace view',
      guestKyc: {
        idType: 'Passport',
        idNumber: 'J8877665',
        cityOfOrigin: 'Udaipur',
        verificationStatus: 'verified',
      },
    };

    const b2Res = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, walkInNavkarPayload);

    assert(b2Res.status === 201, `Walk-in booking in Navkar created with HTTP 201 (ID: ${b2Res.data?.id})`);
    const b2Id = b2Res.data?.id;
    createdBookingIds.push(b2Id);

    // Fetch /bookings for Navkar Palace
    const navkarBookingsRes = await request('/bookings?hotelId=h-navkar', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const inHouseNavkar = filterInHouseAndArrivals(navkarBookingsRes.data, todayStr);
    const guestNavkar = inHouseNavkar.find((b) => b.id === b2Id);

    assert(!!guestNavkar, 'Guest Vikramaditya Rathore appears in Navkar Palace In-House Stays');
    assert(guestNavkar?.hotelId === 'h-navkar', 'Guest hotelId is strictly h-navkar');

    // ISOLATION CHECKS
    const villaHasNavkarGuest = inHouseVilla.some((b) => b.id === b2Id || b.guestName === 'Vikramaditya Rathore');
    assert(!villaHasNavkarGuest, 'The Villa does NOT contain Navkar Palace guests (Zero Leakage)');

    const navkarHasVillaGuest = inHouseNavkar.some((b) => b.id === b1Id || b.guestName === 'Rohit Khandelwal');
    assert(!navkarHasVillaGuest, 'Navkar Palace does NOT contain The Villa guests (Zero Leakage)');

    // -------------------------------------------------------------------------
    // TEST 3: Refresh Screen Simulation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Refresh Screen Simulation ---');

    // Simulate 3 consecutive refresh fetches for The Villa
    for (let i = 1; i <= 3; i++) {
      const refreshed = await request('/bookings?hotelId=h-villa', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const inHouseRefreshed = filterInHouseAndArrivals(refreshed.data, todayStr);
      const exists = inHouseRefreshed.some((b) => b.id === b1Id && b.roomNumber === '104');
      assert(exists, `Refresh #${i}: Room 104 guest remains reliably visible in In-House Stays`);
    }

    // -------------------------------------------------------------------------
    // TEST 4: Room Occupancy Status Verification
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Room Occupancy Status Verification ---');

    const [rmVilla] = await pool.query('SELECT status, currentGuestName, currentBookingId FROM rooms WHERE id = ?', ['rm-v-104']);
    assert(rmVilla[0]?.status === 'OCCUPIED', `Room 104 status in database is OCCUPIED (Actual: "${rmVilla[0]?.status}")`);
    assert(rmVilla[0]?.currentGuestName === 'Rohit Khandelwal', `Room 104 currentGuestName matches guest: "${rmVilla[0]?.currentGuestName}"`);
    assert(rmVilla[0]?.currentBookingId === b1Id, `Room 104 currentBookingId matches booking ID: "${rmVilla[0]?.currentBookingId}"`);

    // Verify via GET /rooms API endpoint
    const roomsApiRes = await request('/rooms?hotelId=h-villa', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const rm104Api = roomsApiRes.data.find((r) => r.roomNumber === '104' || r.id === 'rm-v-104');
    assert(rm104Api?.status === 'occupied', `GET /rooms reports Room 104 status as "occupied"`);
    assert(rm104Api?.currentGuestName === 'Rohit Khandelwal', `GET /rooms reports currentGuestName as "Rohit Khandelwal"`);

    // -------------------------------------------------------------------------
    // TEST 5: Checkout Removes Guest from In-House Stays
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Guest Disappears from In-House Stays After Checkout ---');

    const checkoutRes = await request(`/bookings/${b1Id}/checkout`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(checkoutRes.status === 200, 'Guest checkout succeeds with HTTP 200');

    // Re-query /bookings after checkout
    const postCheckoutBookings = await request('/bookings?hotelId=h-villa', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const inHousePostCheckout = filterInHouseAndArrivals(postCheckoutBookings.data, todayStr);
    const guestStillInHouse = inHousePostCheckout.some((b) => b.id === b1Id);
    assert(!guestStillInHouse, 'Guest Rohit Khandelwal NO LONGER appears in In-House Stays after checkout');

    // Verify room transitioned out of occupied
    const [rmAfterCheckout] = await pool.query('SELECT status, currentGuestName FROM rooms WHERE id = ?', ['rm-v-104']);
    assert(rmAfterCheckout[0]?.status !== 'OCCUPIED', `Room 104 is no longer OCCUPIED after checkout (Actual: "${rmAfterCheckout[0]?.status}")`);
    assert(rmAfterCheckout[0]?.currentGuestName === null, 'Room 104 currentGuestName cleared to NULL');

    // -------------------------------------------------------------------------
    // TEST 6: Existing Advance Bookings Functionality Preserved
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Existing Advance Bookings Preserved & Can Check-In ---');

    const advanceBookingPayload = {
      hotelId: 'h-villa',
      guestName: 'Devendra Parashar',
      guestPhone: '+91 9772012345',
      guestEmail: 'devendra@advance.test',
      roomNumber: '105',
      roomType: 'Deluxe Room',
      checkInDate: todayStr,
      checkOutDate: tomorrowStr,
      adults: 2,
      children: 0,
      roomPrice: 2500,
      advanceAmount: 1000,
      notes: 'Advance booking test',
    };

    const advanceRes = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, advanceBookingPayload);

    assert(advanceRes.status === 201, `Advance booking created with HTTP 201 (ID: ${advanceRes.data?.id})`);
    const advId = advanceRes.data?.id;
    createdBookingIds.push(advId);

    // Verify it appears in In-House Stays & Arrivals as an ARRIVAL DUE (not yet checked in)
    const bookingsWithAdvance = await request('/bookings?hotelId=h-villa', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const inHouseAndArrivals = filterInHouseAndArrivals(bookingsWithAdvance.data, todayStr);
    const advanceArrival = inHouseAndArrivals.find((b) => b.id === advId);
    assert(!!advanceArrival, 'Advance booking arriving today appears in In-House Stays & Arrivals');
    assert(advanceArrival?.status === 'confirmed', 'Advance booking has status "confirmed" (ARRIVAL DUE)');

    // Now check in the advance arrival
    const checkInAdvanceRes = await request(`/bookings/${advId}/checkin`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, {
      roomId: 'rm-v-105',
      roomNumber: '105',
    });
    assert(checkInAdvanceRes.status === 200, 'Advance booking checked in successfully with HTTP 200');

    // Verify status updated to checked_in (IN HOUSE)
    const bookingsAfterCheckIn = await request('/bookings?hotelId=h-villa', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const inHouseAfterCheckIn = filterInHouseAndArrivals(bookingsAfterCheckIn.data, todayStr);
    const checkedInAdvance = inHouseAfterCheckIn.find((b) => b.id === advId);
    assert(checkedInAdvance?.status === 'checked_in', 'Booking status transitioned to "checked_in" (IN HOUSE)');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    console.log('\n--- CLEANUP: Removing Test Fixtures ---');
    try {
      if (createdBookingIds.length > 0) {
        const placeholders = createdBookingIds.map(() => '?').join(',');
        await pool.query(`DELETE FROM invoices WHERE bookingId IN (${placeholders})`, createdBookingIds);
        await pool.query(`DELETE FROM bookings WHERE id IN (${placeholders})`, createdBookingIds);
        console.log(`  ✓ Purged ${createdBookingIds.length} test bookings and associated invoices`);
      }
      await pool.query('DELETE FROM guests WHERE phone IN (?, ?, ?)', ['+91 9829012345', '+91 9829099888', '+91 9772012345']);
      await pool.query('UPDATE rooms SET status = "AVAILABLE", housekeepingStatus = "clean", currentGuestName = NULL, currentBookingId = NULL WHERE id IN ("rm-v-104", "rm-v-105", "rm-n-102")');
      console.log('  ✓ Restored rooms 104, 105, 102 to AVAILABLE');
    } catch (cleanErr) {
      console.error('Cleanup warning:', cleanErr.message);
    }

    console.log('\n================================================================');
    console.log(`WALK-IN & IN-HOUSE VERIFICATION SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  }
}

run();
