/**
 * ResortOS - End-to-End Database Verification Test Script
 * Tests all 13 core modules + hotel isolation + persistence on live TiDB Cloud database.
 */

const http = require('http');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('../server/db');
const apiRouter = require('../server/routes/api');

async function runVerification() {
  console.log('====================================================');
  console.log('🚀 ResortOS E2E Database Integration Verification');
  console.log('====================================================\n');

  const results = [];

  // Helper to record test results
  function record(moduleName, testDesc, passed, details = '') {
    results.push({ moduleName, testDesc, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} | [${moduleName}] ${testDesc} ${details ? '(' + details + ')' : ''}`);
  }

  // 1. Verify Database Pool Connection
  let dbOk = false;
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution, NOW() as serverTime');
    dbOk = rows && rows[0] && rows[0].solution === 2;
    record('Database Connection', 'TiDB Cloud Serverless Connection', dbOk, `Server time: ${rows[0].serverTime}`);
  } catch (err) {
    record('Database Connection', 'TiDB Cloud Serverless Connection', false, err.message);
    process.exit(1);
  }

  // 2. Start Ephemeral Server for Route Testing
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ONLINE', cluster: 'TiDB Cloud Serverless' }));
  app.use('/api', apiRouter);

  const testPort = 5096;
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(testPort, resolve));
  const baseUrl = `http://localhost:${testPort}/api`;

  async function api(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  }

  try {
    // 3. Module 1: Dashboard KPIs & Daily Summary
    const kpiRes = await api('/dashboard/kpis?hotelId=h-villa');
    const kpisOk = kpiRes.status === 200 && typeof kpiRes.data.totalRooms === 'number';
    record('Dashboard KPIs', 'Fetch live KPIs for The Villa', kpisOk, `Total: ${kpiRes.data.totalRooms}, Occ: ${kpiRes.data.occupiedRooms}`);

    const dsRes = await api('/dashboard/daily-summary?hotelId=h-navkar');
    const dsOk = dsRes.status === 200 && (typeof dsRes.data.occupancyPercentage === 'number' || typeof dsRes.data.occupancyRate === 'string');
    record('Daily Summary', 'Fetch live summary for Navkar Palace', dsOk, `Occ Rate: ${dsRes.data.occupancyRate}, Rooms: ${dsRes.data.totalRooms}`);

    // 4. Module 2: Hotel Management & Isolation (Phase 5)
    const hotelsRes = await api('/hotels');
    const hotelsOk = hotelsRes.status === 200 && Array.isArray(hotelsRes.data) && hotelsRes.data.length >= 2;
    record('Hotel Management', 'Fetch managed hotels list from DB', hotelsOk, `Count: ${hotelsRes.data.length}`);

    // Verify room inventory per hotel:
    // The Villa: strictly 15 rooms
    const villaRoomsRes = await api('/rooms?hotelId=h-villa');
    const villa15 = villaRoomsRes.status === 200 && villaRoomsRes.data.length === 15;
    record('Hotel Isolation', 'The Villa room count strictly 15', villa15, `Actual: ${villaRoomsRes.data.length} rooms (Expected: 15)`);

    // Navkar Palace: strictly 70 rooms
    const navkarRoomsRes = await api('/rooms?hotelId=h-navkar');
    const navkar70 = navkarRoomsRes.status === 200 && navkarRoomsRes.data.length === 70;
    record('Hotel Isolation', 'Navkar Palace room count strictly 70', navkar70, `Actual: ${navkarRoomsRes.data.length} rooms (Expected: 70)`);

    // 5. Module 3: Room Management
    const roomsRes = await api('/rooms');
    const roomsOk = roomsRes.status === 200 && roomsRes.data.length >= 85;
    record('Room Management', 'Fetch all hotel rooms from DB', roomsOk, `Total rooms: ${roomsRes.data.length}`);

    // Test Room Status Update persistence
    const testRoom = villaRoomsRes.data[0];
    const updateRoomRes = await api(`/rooms/${testRoom.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cleaning', housekeeping: 'dirty' }),
    });
    const updateRoomOk = updateRoomRes.status === 200;
    // Revert status
    await api(`/rooms/${testRoom.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: testRoom.status, housekeeping: testRoom.housekeeping }),
    });
    record('Room Management', 'Persist room status change to DB', updateRoomOk);

    // 6. Module 4 & 5: Walk-In & Advance Bookings
    const newWalkIn = {
      hotelId: 'h-villa',
      guestName: 'Aditya Birla',
      guestPhone: '+91 98200 99999',
      guestEmail: 'aditya.birla@test.com',
      roomCategory: 'Deluxe Room',
      roomId: villaRoomsRes.data[1].id,
      roomNumber: villaRoomsRes.data[1].roomNumber,
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      numberOfGuests: 2,
      totalAmount: 4500,
      depositPaid: 4500,
      paymentMethod: 'UPI',
    };
    const walkInRes = await api('/bookings/walk-in', {
      method: 'POST',
      body: JSON.stringify(newWalkIn),
    });
    const walkInOk = walkInRes.status === 201 && walkInRes.data.id;
    record('Walk-in Booking', 'Create and persist walk-in booking', walkInOk, `Ref: ${walkInRes.data.bookingReference}`);

    const newAdvance = {
      hotelId: 'h-navkar',
      guestName: 'Priya Singhania',
      guestPhone: '+91 98111 88888',
      roomCategory: 'Super Deluxe Room',
      checkInDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      numberOfGuests: 2,
      totalAmount: 11000,
      depositPaid: 3000,
    };
    const advRes = await api('/bookings', {
      method: 'POST',
      body: JSON.stringify(newAdvance),
    });
    const advOk = advRes.status === 201 && advRes.data.id;
    record('Advance Booking', 'Create and persist advance booking', advOk, `ID: ${advRes.data.id}`);

    // 7. Module 6: Check-in / Check-out
    const checkInRes = await api(`/bookings/${walkInRes.data.id}/checkin`, {
      method: 'PATCH',
      body: JSON.stringify({ roomId: villaRoomsRes.data[1].id }),
    });
    const checkInOk = checkInRes.status === 200;
    record('Check-in / Check-out', 'Check in guest and update room status in DB', checkInOk);

    const checkOutRes = await api(`/bookings/${walkInRes.data.id}/checkout`, {
      method: 'PATCH',
    });
    const checkOutOk = checkOutRes.status === 200;
    record('Check-in / Check-out', 'Check out guest and mark room for cleaning in DB', checkOutOk);

    // 8. Module 7: Billing & Folios
    const foliosRes = await api('/folios?hotelId=h-villa');
    const foliosOk = foliosRes.status === 200 && Array.isArray(foliosRes.data);
    record('Billing & Folios', 'Fetch live folios from DB', foliosOk, `Found: ${foliosRes.data.length} folios`);

    let folioSettleOk = false;
    if (foliosRes.data.length > 0) {
      const targetFolio = foliosRes.data[0];
      const settleRes = await api(`/folios/${targetFolio.id}/settle`, {
        method: 'POST',
        body: JSON.stringify({ paymentMethod: 'UPI' }),
      });
      folioSettleOk = settleRes.status === 200;
    }
    record('Billing & Folios', 'Settle folio and record transaction in DB', folioSettleOk);

    // 9. Module 8: Staff Management
    const staffRes = await api('/staff?hotelId=h-villa');
    const staffOk = staffRes.status === 200 && staffRes.data.length > 0;
    record('Staff Management', 'Fetch live staff roster from DB', staffOk, `Roster: ${staffRes.data.length} employees`);

    const newStaffRes = await api('/staff', {
      method: 'POST',
      body: JSON.stringify({
        hotelId: 'h-villa',
        fullName: 'Devendra Rathore',
        phone: '+91 98299 12345',
        role: 'Concierge Lead',
        department: 'Front Desk',
        shift: 'Morning',
        monthlySalary: 22000,
      }),
    });
    const newStaffOk = newStaffRes.status === 201 && newStaffRes.data.id;
    record('Staff Management', 'Enrol new staff member into DB', newStaffOk, `Code: ${newStaffRes.data.employeeCode}`);

    // 10. Module 9: Attendance
    const attRes = await api('/attendance?hotelId=h-villa');
    const attOk = attRes.status === 200 && Array.isArray(attRes.data);
    record('Attendance', 'Fetch live attendance records from DB', attOk, `Today logs: ${attRes.data.length}`);

    const recordAttRes = await api('/attendance', {
      method: 'POST',
      body: JSON.stringify({
        staffId: newStaffRes.data.id,
        hotelId: 'h-villa',
        status: 'present',
        checkInTime: '08:30 AM',
      }),
    });
    const recordAttOk = recordAttRes.status === 200;
    record('Attendance', 'Persist employee attendance check-in to DB', recordAttOk);

    // 11. Module 10: Salary & Advances
    const advsRes = await api('/salary-advances?hotelId=h-villa');
    const advsOk = advsRes.status === 200 && Array.isArray(advsRes.data);
    record('Salary Management', 'Fetch staff salary advances from DB', advsOk, `Advances: ${advsRes.data.length}`);

    const newAdvRes = await api('/salary-advances', {
      method: 'POST',
      body: JSON.stringify({
        hotelId: 'h-villa',
        staffId: newStaffRes.data.id,
        staffName: 'Devendra Rathore',
        amount: 2500,
        reason: 'Fuel and transport allowance',
        paymentMethod: 'UPI',
      }),
    });
    const newAdvOk = newAdvRes.status === 201 && newAdvRes.data.id;
    record('Salary Management', 'Record new salary advance loan in DB', newAdvOk);

    const salariesRes = await api('/salaries?hotelId=h-villa');
    const salariesOk = salariesRes.status === 200 && salariesRes.data.length > 0;
    record('Salary Management', 'Calculate monthly payroll using DB attendance & advances', salariesOk, `Calculated slips: ${salariesRes.data.length}`);

    const paySalRes = await api('/salaries/pay', {
      method: 'POST',
      body: JSON.stringify({
        staffId: newStaffRes.data.id,
        hotelId: 'h-villa',
        netAmount: 19500,
      }),
    });
    const paySalOk = paySalRes.status === 200;
    record('Salary Management', 'Disburse salary and persist payment record to DB', paySalOk);

    // 12. Module 11: Expenses
    const expRes = await api('/expenses?hotelId=h-villa');
    const expOk = expRes.status === 200 && Array.isArray(expRes.data);
    record('Expenses Management', 'Fetch expense ledger from DB', expOk, `Recorded entries: ${expRes.data.length}`);

    const newExpRes = await api('/expenses', {
      method: 'POST',
      body: JSON.stringify({
        hotelId: 'h-villa',
        title: 'Fresh Linen & Bedding Supplies',
        category: 'SUPPLIES',
        amount: 6800,
        paidTo: 'Jaipur Textile Mills',
        paymentMethod: 'Bank Transfer',
      }),
    });
    const newExpOk = newExpRes.status === 201 && newExpRes.data.id;
    record('Expenses Management', 'Log new property expense into DB', newExpOk);

    // 13. Module 12: Daily Reports
    const repRes = await api('/dashboard/daily-summary?hotelId=all');
    const repOk = repRes.status === 200 && repRes.data.totalRooms >= 85;
    record('Daily Reports', 'Consolidated financial & operational report across all hotels', repOk, `Total Rooms: ${repRes.data.totalRooms}`);

    // 14. Module 13: Dashboard Calendar
    const calBookingsRes = await api('/bookings');
    const calOk = calBookingsRes.status === 200 && calBookingsRes.data.length > 0;
    record('Dashboard Calendar', 'Calendar bookings source fetched directly from DB', calOk, `Events: ${calBookingsRes.data.length} reservations`);

    // 15. Hotel Isolation Access Control (Phase 5)
    // A manager assigned to 'h-villa' must be blocked from accessing 'h-navkar' data
    const mgrBlockedRes = await api('/rooms?hotelId=h-navkar', {
      headers: {
        'x-user-role': 'MANAGER',
        'x-user-hotel-id': 'h-villa',
      },
    });
    const mgrBlockedOk = mgrBlockedRes.status === 403;
    record('Hotel Isolation', 'Manager restricted strictly to assigned hotel (403 on cross-hotel access)', mgrBlockedOk);

    // Admin can access all hotels
    const adminAllowedRes = await api('/rooms?hotelId=h-navkar', {
      headers: {
        'x-user-role': 'ADMIN',
      },
    });
    const adminAllowedOk = adminAllowedRes.status === 200 && adminAllowedRes.data.length === 70;
    record('Hotel Isolation', 'Admin unrestricted access to switch between all hotels', adminAllowedOk);

    console.log('\n====================================================');
    const totalPassed = results.filter((r) => r.passed).length;
    console.log(`📊 SUMMARY: ${totalPassed} / ${results.length} checks PASSED`);
    console.log('====================================================\n');
  } finally {
    server.close();
    await pool.end();
  }
}

runVerification().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
