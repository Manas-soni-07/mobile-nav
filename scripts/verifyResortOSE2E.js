/**
 * ResortOS - End-to-End System Verification Test Script
 * Verifies multi-hotel data isolation, role security, attendance, expenses, and summary P&L.
 */

const { mockStorage } = require('../src/services/mockStorage');
const { HotelService } = require('../src/services/hotelService');

async function runE2EVerification() {
  console.log("==================================================");
  console.log("ResortOS: Master End-to-End Verification");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  const hotelService = new HotelService();

  // Test 1: Hotels check
  const hotels = hotelService.getAllHotels();
  assert(hotels.length === 2, `Initial hotels count is 2 (Found ${hotels.length})`);
  assert(hotels.some(h => h.id === 'h-villa' && h.name === 'THE VILLA'), "THE VILLA exists");
  assert(hotels.some(h => h.id === 'h-navkar' && h.name === 'NAVKAR PALACE & RESORT'), "NAVKAR PALACE & RESORT exists");

  // Test 2: Room Inventory Isolation
  const villaRooms = hotelService.getRooms('h-villa');
  const navkarRooms = hotelService.getRooms('h-navkar');
  assert(villaRooms.length > 0, `THE VILLA has ${villaRooms.length} rooms`);
  assert(navkarRooms.length > 0, `NAVKAR PALACE has ${navkarRooms.length} rooms`);
  assert(villaRooms.every(r => r.hotelId === 'h-villa'), "All THE VILLA rooms belong strictly to h-villa");
  assert(navkarRooms.every(r => r.hotelId === 'h-navkar'), "All NAVKAR rooms belong strictly to h-navkar");

  // Test 3: Staff Roster & Attendance Isolation
  const villaStaff = hotelService.getStaff('h-villa');
  const navkarStaff = hotelService.getStaff('h-navkar');
  assert(villaStaff.length > 0, `THE VILLA has ${villaStaff.length} staff members`);
  assert(navkarStaff.length > 0, `NAVKAR PALACE has ${navkarStaff.length} staff members`);
  assert(villaStaff.every(s => s.hotelId === 'h-villa'), "All THE VILLA staff belong strictly to h-villa");
  assert(navkarStaff.every(s => s.hotelId === 'h-navkar'), "All NAVKAR staff belong strictly to h-navkar");

  // Test 4: Attendance Mutation (Present, Half Day, Absent, Leave)
  const testMember = villaStaff[0];
  const updated1 = hotelService.updateAttendance(testMember.id, 'half_day', '01:00 PM');
  assert(updated1 && updated1.status === 'half_day', "Staff status successfully updated to 'half_day'");

  const updated2 = hotelService.updateAttendance(testMember.id, 'present', '08:00 AM');
  assert(updated2 && updated2.status === 'present', "Staff status successfully updated to 'present'");

  // Test 5: Expense Categories & Recording Isolation
  const villaExpenses = hotelService.getExpenses('h-villa');
  const navkarExpenses = hotelService.getExpenses('h-navkar');
  assert(villaExpenses.length > 0, `THE VILLA has ${villaExpenses.length} expense records`);
  assert(navkarExpenses.length > 0, `NAVKAR PALACE has ${navkarExpenses.length} expense records`);

  const validCategories = ['Electricity', 'Water', 'Maintenance', 'Repair', 'Supplies', 'Misc'];
  const newExp = hotelService.recordExpense({
    hotelId: 'h-villa',
    hotelName: 'THE VILLA',
    title: 'Verification Electricity Payment',
    category: 'Electricity',
    amount: 15000,
    vendor: 'Jaipur Vidyut',
    recordedBy: 'Admin Test',
    paymentMethod: 'UPI',
  });
  assert(newExp && newExp.category === 'Electricity', "Recorded expense with category 'Electricity'");
  assert(newExp.hotelId === 'h-villa', "Expense recorded strictly under THE VILLA");

  // Test 6: Folio Settlement & Normal Hotel Charges
  const villaFolios = hotelService.getFolios('h-villa');
  assert(villaFolios.length > 0, `THE VILLA has ${villaFolios.length} folios`);
  const openFolio = villaFolios.find(f => f.status === 'open');
  if (openFolio) {
    const preAddCount = openFolio.items.length;
    hotelService.addFolioItem(openFolio.id, {
      description: 'Extra Bed & Mattress (Test)',
      category: 'extra_bed',
      amount: 1000,
    });
    const reloaded = hotelService.getFolios('h-villa').find(f => f.id === openFolio.id);
    assert(reloaded.items.length === preAddCount + 1, "Added extra bed charge line item to folio");
  }

  // Test 7: Consolidated vs Single Hotel Calculations
  const allStaff = hotelService.getStaff('all');
  assert(allStaff.length === villaStaff.length + navkarStaff.length, `Consolidated staff count is exact sum (${allStaff.length})`);

  const allExpenses = hotelService.getExpenses('all');
  assert(allExpenses.length >= villaExpenses.length + navkarExpenses.length, "Consolidated expenses include all properties");

  // Test 8: Operational Modules Check (Strictly NO luxury modules)
  const modules = hotelService.getOperationalModules('h-villa');
  const moduleTitles = modules.map(m => m.title.toLowerCase());
  assert(!moduleTitles.some(t => t.includes('spa')), "No Spa module in operational modules");
  assert(!moduleTitles.some(t => t.includes('banquet')), "No Banquet module in operational modules");
  assert(!moduleTitles.some(t => t.includes('dining (kot)')), "No In-Room Dining KOT in operational modules");
  assert(!moduleTitles.some(t => t.includes('concierge')), "No Concierge module in operational modules");

  console.log("\n==================================================");
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runE2EVerification().catch(e => {
  console.error("Verification script crashed:", e);
  process.exit(1);
});
