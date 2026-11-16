/**
 * ResortOS - Domain Models & Data Types
 * Comprehensive data contracts for multi-resort hospitality management
 */

// ==========================================
// 1. HOTEL & PROPERTY TYPES
// ==========================================

export interface HotelSummary {
  id: string;
  name: string;
  code: string;
  location: string;
  starRating: number;
  totalRooms: number;
  contactPhone: string;
  managerName: string;
  currency: string;
  tagline: string;
}

// ==========================================
// 2. ROOM & INVENTORY TYPES
// ==========================================

export type RoomCategory =
  | 'Deluxe Ocean Suite'
  | 'Royal Penthouse'
  | 'Executive Villa'
  | 'Garden View Villa'
  | 'Classic King Suite';

export type RoomStatus =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'cleaning'
  | 'maintenance';

export type HousekeepingStatus =
  | 'clean'
  | 'dirty'
  | 'inspecting'
  | 'in_progress';

export interface Room {
  id: string;
  hotelId: string;
  roomNumber: string;
  floor: number;
  category: RoomCategory;
  ratePerNight: number;
  status: RoomStatus;
  housekeepingStatus: HousekeepingStatus;
  currentGuestName?: string;
  currentBookingId?: string;
  maxOccupancy: number;
  amenities: string[];
}

// ==========================================
// 3. BOOKING & RESERVATION TYPES
// ==========================================

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled';

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface Booking {
  id: string;
  hotelId: string;
  bookingReference: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  roomCategory: RoomCategory;
  roomId?: string;
  roomNumber?: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nightsCount: number;
  numberOfGuests: number;
  status: BookingStatus;
  totalAmount: number;
  depositPaid: number;
  paymentStatus: PaymentStatus;
  specialRequests?: string;
  createdAt: string;
}

// ==========================================
// 4. STAFF & ATTENDANCE TYPES
// ==========================================

export type StaffDepartment =
  | 'Front Desk'
  | 'Housekeeping'
  | 'Food & Beverage'
  | 'Maintenance'
  | 'Security'
  | 'Management';

export type StaffShift = 'Morning' | 'Afternoon' | 'Night' | 'Full Day';

export type AttendanceStatus = 'present' | 'absent' | 'on_leave' | 'late';

export interface StaffMember {
  id: string;
  hotelId: string;
  employeeCode: string;
  fullName: string;
  role: string;
  department: StaffDepartment;
  shift: StaffShift;
  status: AttendanceStatus;
  checkInTime?: string;
  phone: string;
}

export interface AttendanceSummary {
  totalStaff: number;
  presentStaff: number;
  onLeaveStaff: number;
  absentStaff: number;
  shift: string;
}

// ==========================================
// 5. BILLING & FOLIO TYPES
// ==========================================

export type FolioStatus = 'open' | 'settled' | 'overdue';

export type ChargeCategory =
  | 'room'
  | 'dining'
  | 'spa'
  | 'minibar'
  | 'service'
  | 'tax';

export interface FolioItem {
  id: string;
  description: string;
  category: ChargeCategory;
  amount: number;
  date: string;
}

export interface BillingFolio {
  id: string;
  hotelId: string;
  invoiceNumber: string;
  bookingId?: string;
  guestName: string;
  roomNumber: string;
  status: FolioStatus;
  items: FolioItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentMethod?: string;
  createdAt: string;
  settledAt?: string;
}

export interface BillingSummary {
  pendingInvoices: number;
  todaySettlements: string;
  outstandingBalance: string;
}

// ==========================================
// 6. EXPENSES TYPES
// ==========================================

export type ExpenseCategory =
  | 'F&B Provisions'
  | 'Housekeeping Supplies'
  | 'Utilities & Maintenance'
  | 'Staff Payroll'
  | 'Marketing'
  | 'Operations';

export interface ExpenseRecord {
  id: string;
  hotelId: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  vendor: string;
  recordedBy: string;
  paymentMethod: string;
}

export interface DailyExpensesSummary {
  todayTotal: string;
  categories: {
    name: string;
    amount: string;
  }[];
}

// ==========================================
// 7. EXECUTIVE & OPERATIONAL ANALYTICS
// ==========================================

export interface DashboardKPIs {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  cleaningRooms: number;
  maintenanceRooms: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  occupancyPercentage: number;
}

export interface DailySummaryData {
  grossRevenue: string;
  revPar: string;
  adr: string;
  netOperatingIncome: string;
  occupancyRate: string;
  rawGrossRevenue: number;
  rawNetIncome: number;
  rawExpenses: number;
}

export interface AdvanceBookingSummary {
  upcomingCount: number;
  confirmedRevenue: string;
  next7DaysArrivals: number;
}

export interface OperationalModule {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
  badgeColor?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gold' | 'neutral';
  adminOnly?: boolean;
}
