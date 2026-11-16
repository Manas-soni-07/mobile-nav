/**
 * ResortOS - Hotel Data Constants & Defaults
 * Preserves legacy mock fixtures while exposing the primary initial datasets.
 */

import {
  INITIAL_HOTELS,
  INITIAL_ROOMS,
  INITIAL_BOOKINGS,
  INITIAL_STAFF,
  INITIAL_FOLIOS,
  INITIAL_EXPENSES,
} from './mockDatabase';
import {
  HotelSummary,
  DashboardKPIs,
  AttendanceSummary,
  AdvanceBookingSummary,
  BillingSummary,
  DailyExpensesSummary,
  DailySummaryData,
  OperationalModule,
} from '../types/hotel';

export {
  INITIAL_HOTELS,
  INITIAL_ROOMS,
  INITIAL_BOOKINGS,
  INITIAL_STAFF,
  INITIAL_FOLIOS,
  INITIAL_EXPENSES,
};

// Aliased exports for Phase 1 backwards compatibility
export const HOTELS: HotelSummary[] = INITIAL_HOTELS;

export const MOCK_KPIS: DashboardKPIs = {
  totalRooms: 120,
  availableRooms: 42,
  occupiedRooms: 78,
  cleaningRooms: 8,
  maintenanceRooms: 4,
  todayCheckIns: 18,
  todayCheckOuts: 14,
  occupancyPercentage: 65,
};

export const MOCK_ATTENDANCE: AttendanceSummary = {
  totalStaff: 10,
  presentStaff: 8,
  onLeaveStaff: 1,
  absentStaff: 1,
  shift: 'Morning & Afternoon Shift',
};

export const MOCK_ADVANCE_BOOKING: AdvanceBookingSummary = {
  upcomingCount: 34,
  confirmedRevenue: '$48,250',
  next7DaysArrivals: 22,
};

export const MOCK_BILLING: BillingSummary = {
  pendingInvoices: 9,
  todaySettlements: '$14,890',
  outstandingBalance: '$3,420',
};

export const MOCK_EXPENSES: DailyExpensesSummary = {
  todayTotal: '$4,120',
  categories: [
    { name: 'F&B Provisions', amount: '$1,850' },
    { name: 'Housekeeping Supplies', amount: '$920' },
    { name: 'Utilities & Maintenance', amount: '$1,350' },
  ],
};

export const MOCK_DAILY_SUMMARY: DailySummaryData = {
  grossRevenue: '$38,650',
  revPar: '$242.00',
  adr: '$372.50',
  netOperatingIncome: '$22,480',
  occupancyRate: '65.0%',
  rawGrossRevenue: 38650,
  rawNetIncome: 22480,
  rawExpenses: 16170,
};

export const OPERATIONAL_MODULES: OperationalModule[] = [
  {
    id: 'mod-attendance',
    title: 'Staff Attendance',
    subtitle: '8 of 10 staff active on duty',
    icon: 'users',
    badge: '8/10 Active',
    badgeColor: 'success',
  },
  {
    id: 'mod-advance-booking',
    title: 'Advance Booking',
    subtitle: '34 upcoming reservation requests',
    icon: 'calendar',
    badge: '34 Pending',
    badgeColor: 'info',
  },
  {
    id: 'mod-checkin-rooms',
    title: 'Check-in Rooms',
    subtitle: '18 arrivals scheduled for today',
    icon: 'key',
    badge: '18 Ready',
    badgeColor: 'warning',
  },
  {
    id: 'mod-billing',
    title: 'Billing & Folios',
    subtitle: '$14,890 settled today across 28 folios',
    icon: 'receipt',
    badge: '$14.8k',
    badgeColor: 'info',
  },
  {
    id: 'mod-daily-expenses',
    title: 'Daily Expenses',
    subtitle: '3 operational expense batches logged',
    icon: 'dollar-sign',
    badge: '$4,120',
    badgeColor: 'warning',
  },
  {
    id: 'mod-daily-summary',
    title: 'Daily Summary',
    subtitle: 'Executive RevPAR, ADR, and P&L breakdown',
    icon: 'trending-up',
    badge: 'Admin Only',
    badgeColor: 'primary',
    adminOnly: true,
  },
];
