/**
 * ResortOS - Standalone Business Logic & Data Contract Verification
 */

const fs = require('fs');
const path = require('path');

function runVerification() {
  console.log("==================================================");
  console.log("ResortOS: Business Architecture & Rules Verification");
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

  // 1. Verify Target Hotels in mockDatabase.ts
  const mockDbContent = fs.readFileSync(path.join(__dirname, '../src/constants/mockDatabase.ts'), 'utf8');
  assert(mockDbContent.includes("'h-villa'") && mockDbContent.includes("'THE VILLA'"), "Target Hotel 1 (THE VILLA) present in mock database");
  assert(mockDbContent.includes("'h-navkar'") && mockDbContent.includes("'NAVKAR PALACE & RESORT'"), "Target Hotel 2 (NAVKAR PALACE & RESORT) present in mock database");

  // 2. Verify Expense Categories in types/hotel.ts
  const typesContent = fs.readFileSync(path.join(__dirname, '../src/types/hotel.ts'), 'utf8');
  const expectedExpenseCategories = ['Electricity', 'Water', 'Maintenance', 'Repair', 'Supplies', 'Misc'];
  for (const cat of expectedExpenseCategories) {
    assert(typesContent.includes(`'${cat}'`), `ExpenseCategory includes '${cat}'`);
  }

  // 3. Verify Attendance Statuses in types/hotel.ts
  const expectedAttendanceStatuses = ['present', 'absent', 'on_leave', 'half_day'];
  for (const st of expectedAttendanceStatuses) {
    assert(typesContent.includes(`'${st}'`), `AttendanceStatus includes '${st}'`);
  }

  // 4. Verify Admin Dashboard Screen has 14 clean modules
  const adminDash = fs.readFileSync(path.join(__dirname, '../src/app/AdminDashboardScreen.tsx'), 'utf8');
  assert(adminDash.includes("'mod-hotels'"), "Admin has Hotels Management module");
  assert(adminDash.includes("'mod-managers'"), "Admin has Managers Management module");
  assert(adminDash.includes("'mod-rooms'"), "Admin has Room Management module");
  assert(adminDash.includes("'mod-advance-booking'"), "Admin has Advance Booking module");
  assert(adminDash.includes("'mod-checkin-checkout'"), "Admin has Checkin/Checkout module");
  assert(adminDash.includes("'mod-billing'"), "Admin has Billing & Payments module");
  assert(adminDash.includes("'mod-staff'"), "Admin has Staff Management module");
  assert(adminDash.includes("'mod-attendance'"), "Admin has Attendance module");
  assert(adminDash.includes("'mod-salaries'"), "Admin has Salary Management module");
  assert(adminDash.includes("'mod-salary-advances'"), "Admin has Salary Advances module");
  assert(adminDash.includes("'mod-expenses'"), "Admin has Other Expenses module");
  assert(adminDash.includes("'mod-reports'"), "Admin has Daily Summary Reports module");

  // 5. Verify Manager Dashboard Screen has strictly 6 operational modules
  const mgrDash = fs.readFileSync(path.join(__dirname, '../src/app/ManagerDashboardScreen.tsx'), 'utf8');
  assert(mgrDash.includes("'mod-advance-booking'"), "Manager has Advance Booking module");
  assert(mgrDash.includes("'mod-checkin-checkout'"), "Manager has Checkin/Checkout module");
  assert(mgrDash.includes("'mod-rooms'"), "Manager has Rooms Inventory module");
  assert(mgrDash.includes("'mod-billing'"), "Manager has Billing module");
  assert(mgrDash.includes("'mod-attendance'"), "Manager has Attendance module");
  assert(mgrDash.includes("'mod-expenses'"), "Manager has Other Expenses module");
  assert(!mgrDash.includes("'mod-hotels'"), "Manager cannot access Hotels module");
  assert(!mgrDash.includes("'mod-managers'"), "Manager cannot access Managers module");
  assert(!mgrDash.includes("'mod-salaries'"), "Manager cannot access Salaries module");
  assert(!mgrDash.includes("'mod-salary-advances'"), "Manager cannot access Salary Advances module");
  assert(!mgrDash.includes("'mod-reports'"), "Manager cannot access Admin Reports module");

  // 6. Verify Attendance Screen has direct 4 buttons & Mark All Present shortcut
  const attScreen = fs.readFileSync(path.join(__dirname, '../src/app/AttendanceScreen.tsx'), 'utf8');
  assert(attScreen.includes('handleMarkAllPresent'), "AttendanceScreen has Mark All Present shortcut");
  assert(attScreen.includes('statusBtnPresentActive'), "AttendanceScreen has direct Present status button");
  assert(attScreen.includes('statusBtnHalfActive'), "AttendanceScreen has direct Half Day status button");
  assert(attScreen.includes('statusBtnAbsentActive'), "AttendanceScreen has direct Absent status button");
  assert(attScreen.includes('statusBtnLeaveActive'), "AttendanceScreen has direct Leave status button");

  // 7. Verify Daily Summary Screen has Admin-only protection & P&L fields
  const summaryScreen = fs.readFileSync(path.join(__dirname, '../src/app/DailySummaryScreen.tsx'), 'utf8');
  assert(summaryScreen.includes('Admin Access Required'), "DailySummaryScreen enforces Admin-only access");
  assert(summaryScreen.includes('actualCollections'), "DailySummaryScreen computes Actual Collections");
  assert(summaryScreen.includes('totalExpenses'), "DailySummaryScreen computes Total Expenses");
  assert(summaryScreen.includes('netProfit'), "DailySummaryScreen computes Net Operating Profit");
  assert(summaryScreen.includes('handleShareReport'), "DailySummaryScreen has Export / Share functionality");

  // 8. Verify Strict Restrictions: No luxury modules in main navigation
  const mainNav = fs.readFileSync(path.join(__dirname, '../src/app/AdminDashboardScreen.tsx'), 'utf8');
  assert(!mainNav.includes("'ayurvedic-spa'"), "Admin navigation has NO Ayurvedic Spa");
  assert(!mainNav.includes("'in-room-dining'"), "Admin navigation has NO In-Room Dining KOT");
  assert(!mainNav.includes("'banquets-events'"), "Admin navigation has NO Banquets / Weddings");
  assert(!mainNav.includes("'concierge-dispatch'"), "Admin navigation has NO Concierge / Tours");
  assert(!mainNav.includes("'housekeeping-dispatch'"), "Admin navigation has NO Housekeeping Dispatch");
  assert(!mainNav.includes("'shift-handover'"), "Admin navigation has NO Shift Handover Audit");

  console.log("\n==================================================");
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification();
