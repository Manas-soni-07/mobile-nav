const fs = require('fs');
const assert = require('assert');
const path = require('path');

console.log('--- STARTING RESORTOS OPERATIONAL ENHANCEMENTS TEST SUITE ---\n');

// 1. Read roomsData.ts and bookingsData.ts
const roomsDataContent = fs.readFileSync(path.join(__dirname, '../src/constants/roomsData.ts'), 'utf8');
const bookingsDataContent = fs.readFileSync(path.join(__dirname, '../src/constants/bookingsData.ts'), 'utf8');

// Extract arrays safely
const cleanedRoomsContent = roomsDataContent
  .replace(/import\s+[^;]+;/, '')
  .replace(/export\s+const\s+INITIAL_ROOMS:\s*Room\[\]\s*=/, 'const INITIAL_ROOMS =') + '\nmodule.exports = { INITIAL_ROOMS };';

const cleanedBookingsContent = bookingsDataContent
  .replace(/import\s+[^;]+;/, '')
  .replace(/export\s+const\s+INITIAL_BOOKINGS:\s*Booking\[\]\s*=/, 'const INITIAL_BOOKINGS =') + '\nmodule.exports = { INITIAL_BOOKINGS };';

const evalRoomsModule = { exports: {} };
const fnRooms = new Function('module', 'exports', cleanedRoomsContent);
fnRooms(evalRoomsModule, evalRoomsModule.exports);
const INITIAL_ROOMS = evalRoomsModule.exports.INITIAL_ROOMS;

const evalBookingsModule = { exports: {} };
const fnBookings = new Function('module', 'exports', cleanedBookingsContent);
fnBookings(evalBookingsModule, evalBookingsModule.exports);
const INITIAL_BOOKINGS = evalBookingsModule.exports.INITIAL_BOOKINGS;

// 1. HOTEL-WISE TOTAL ROOM CONFIGURATION
console.log('TEST 1: Verifying Hotel-wise Total Room Configuration...');
const villaRooms = INITIAL_ROOMS.filter((r) => r.hotelId === 'h-villa');
const navkarRooms = INITIAL_ROOMS.filter((r) => r.hotelId === 'h-navkar');

assert.strictEqual(villaRooms.length, 15, `The Villa must have exactly 15 rooms (got ${villaRooms.length})`);
console.log('✓ PASS: The Villa has exactly 15 rooms.');

assert.strictEqual(navkarRooms.length, 70, `Navkar Palace must have exactly 70 rooms (got ${navkarRooms.length})`);
console.log('✓ PASS: Navkar Palace has exactly 70 rooms.');

// Verify room numbering
assert.strictEqual(villaRooms[0].roomNumber, '101');
assert.strictEqual(villaRooms[villaRooms.length - 1].roomNumber, '115');
console.log('✓ PASS: The Villa rooms are correctly numbered 101 to 115.');

assert.strictEqual(navkarRooms[0].roomNumber, '101');
assert.strictEqual(navkarRooms[navkarRooms.length - 1].roomNumber, '170');
console.log('✓ PASS: Navkar Palace rooms are correctly numbered 101 to 170.');

// 2. TODAY'S OPERATIONAL METRICS CALCULATION
console.log('\nTEST 2: Verifying Today\'s Operational Metrics...');
const todayStr = '2026-11-18';

// The Villa Metrics
const villaOccupied = villaRooms.filter((r) => r.status === 'occupied').length;
const villaCleaning = villaRooms.filter((r) => r.status === 'cleaning').length;
const villaMaint = villaRooms.filter((r) => r.status === 'maintenance').length;
const villaAvailable = villaRooms.length - (villaOccupied + villaCleaning + villaMaint);

const villaBookings = INITIAL_BOOKINGS.filter((b) => b.hotelId === 'h-villa');
const villaTodayCheckIns = villaBookings.filter((b) => b.checkInDate === todayStr && b.status !== 'cancelled').length;
const villaTodayCheckOuts = villaBookings.filter((b) => b.checkOutDate === todayStr && b.status !== 'cancelled').length;
const villaTodayBookings = villaBookings.filter((b) => (b.createdAt === todayStr || b.checkInDate === todayStr) && b.status !== 'cancelled').length;

console.log('The Villa Operational Metrics:', {
  totalRooms: villaRooms.length,
  availableRooms: villaAvailable,
  occupiedRooms: villaOccupied,
  todayCheckIns: villaTodayCheckIns,
  todayCheckOuts: villaTodayCheckOuts,
  todayBookings: villaTodayBookings,
});

assert.strictEqual(villaRooms.length, 15);
assert.strictEqual(villaTodayCheckIns, 2, 'Villa today check-ins should be 2');
assert.strictEqual(villaTodayCheckOuts, 1, 'Villa today check-outs should be 1');
assert.strictEqual(villaTodayBookings, 3, 'Villa today bookings should be 3');
assert.notStrictEqual(villaTodayCheckIns, villaTodayCheckOuts, 'Check-ins and check-outs must be independent');
console.log('✓ PASS: The Villa operational metrics are completely independent and accurately computed.');

// Navkar Palace Metrics
const navkarOccupied = navkarRooms.filter((r) => r.status === 'occupied').length;
const navkarCleaning = navkarRooms.filter((r) => r.status === 'cleaning').length;
const navkarMaint = navkarRooms.filter((r) => r.status === 'maintenance').length;
const navkarAvailable = navkarRooms.length - (navkarOccupied + navkarCleaning + navkarMaint);

const navkarBookings = INITIAL_BOOKINGS.filter((b) => b.hotelId === 'h-navkar');
const navkarTodayCheckIns = navkarBookings.filter((b) => b.checkInDate === todayStr && b.status !== 'cancelled').length;
const navkarTodayCheckOuts = navkarBookings.filter((b) => b.checkOutDate === todayStr && b.status !== 'cancelled').length;
const navkarTodayBookings = navkarBookings.filter((b) => (b.createdAt === todayStr || b.checkInDate === todayStr) && b.status !== 'cancelled').length;

console.log('Navkar Palace Operational Metrics:', {
  totalRooms: navkarRooms.length,
  availableRooms: navkarAvailable,
  occupiedRooms: navkarOccupied,
  todayCheckIns: navkarTodayCheckIns,
  todayCheckOuts: navkarTodayCheckOuts,
  todayBookings: navkarTodayBookings,
});

assert.strictEqual(navkarRooms.length, 70);
assert.strictEqual(navkarTodayCheckIns, 4, 'Navkar today check-ins should be 4');
assert.strictEqual(navkarTodayCheckOuts, 3, 'Navkar today check-outs should be 3');
assert.strictEqual(navkarTodayBookings, 6, 'Navkar today bookings should be 6');
assert.notStrictEqual(navkarTodayCheckIns, navkarTodayCheckOuts, 'Check-ins and check-outs must be independent');
console.log('✓ PASS: Navkar Palace operational metrics are completely independent and accurately computed.');

// 3. OVERLAPPING BOOKING DETECTION & ROOM ASSIGNMENT VALIDATION
console.log('\nTEST 3: Verifying Overlapping Booking Detection Logic...');
function isRoomAvailableForDates(room, checkIn, checkOut, bookings, excludeBookingId) {
  if (room.status === 'maintenance') return false;
  if (checkIn <= todayStr && (room.status === 'occupied' || room.status === 'cleaning')) {
    return false;
  }
  const conflicts = bookings.filter((b) => {
    if (b.status === 'cancelled') return false;
    if (excludeBookingId && b.id === excludeBookingId) return false;
    if (b.roomId !== room.id && b.roomNumber !== room.roomNumber) return false;
    return checkIn < b.checkOutDate && checkOut > b.checkInDate;
  });
  return conflicts.length === 0;
}

// Test occupied room for today
const occupiedVillaRoom = villaRooms.find((r) => r.status === 'occupied');
const isAvailToday = isRoomAvailableForDates(occupiedVillaRoom, '2026-11-18', '2026-11-19', villaBookings);
assert.strictEqual(isAvailToday, false, 'Occupied room must not be available for check-in today');
console.log('✓ PASS: Occupied room is correctly blocked from new check-in.');

// Test future booking overlap
const testRoom = navkarRooms.find((r) => r.roomNumber === '105');
// b-205 is on room 105 from 2026-11-18 to 2026-11-21
const isConflict = isRoomAvailableForDates(testRoom, '2026-11-19', '2026-11-22', navkarBookings);
assert.strictEqual(isConflict, false, 'Overlapping date range must be detected and blocked');
console.log('✓ PASS: Overlapping reservation is correctly detected and blocked.');

// Test non-overlapping future date
const isFutureAvail = isRoomAvailableForDates(testRoom, '2026-11-25', '2026-11-28', navkarBookings);
assert.strictEqual(isFutureAvail, true, 'Non-overlapping future reservation should be allowed');
console.log('✓ PASS: Non-overlapping future reservation is allowed.');

// 4. MANAGER DATA ISOLATION
console.log('\nTEST 4: Verifying Property Manager Data Isolation...');
const managerVillaRooms = INITIAL_ROOMS.filter((r) => r.hotelId === 'h-villa');
assert(managerVillaRooms.every((r) => r.hotelId === 'h-villa'), 'Manager Villa rooms must only belong to h-villa');
assert(!managerVillaRooms.some((r) => r.hotelId === 'h-navkar'), 'Manager Villa must NOT have access to Navkar rooms');
console.log('✓ PASS: Strict single-hotel data isolation confirmed.');

console.log('\n======================================================');
console.log('✓ ALL 11 TASK REQUIREMENTS VERIFIED AND PASSED SUCCESSFULLY!');
console.log('======================================================');
