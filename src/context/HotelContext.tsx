/**
 * ResortOS - Hotel State Context & Provider
 * Global reactive state container managing multi-property resort data, lifecycle mutations, and KPIs.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  HotelSummary,
  Room,
  Booking,
  StaffMember,
  BillingFolio,
  ExpenseRecord,
  DashboardKPIs,
  DailySummaryData,
  AttendanceSummary,
  AdvanceBookingSummary,
  BillingSummary,
  DailyExpensesSummary,
  OperationalModule,
  RoomStatus,
  HousekeepingStatus,
  AttendanceStatus,
  ChargeCategory,
} from '../types/hotel';
import { hotelService } from '../services/hotelService';

export interface HotelContextType {
  // Active selection
  selectedHotelId: string;
  selectedHotel: HotelSummary;
  hotels: HotelSummary[];
  switchHotel: (hotelId: string) => void;

  // Real-time computed analytics
  kpis: DashboardKPIs;
  dailySummary: DailySummaryData;
  operationalModules: OperationalModule[];

  // Reactive collections for active property
  rooms: Room[];
  availableRooms: Room[];
  bookings: Booking[];
  todayArrivals: Booking[];
  advanceBookings: Booking[];
  staff: StaffMember[];
  folios: BillingFolio[];
  expenses: ExpenseRecord[];

  // Summaries
  attendanceSummary: AttendanceSummary;
  billingSummary: BillingSummary;
  advanceBookingSummary: AdvanceBookingSummary;
  expensesSummary: DailyExpensesSummary;

  // Actions & Mutations
  checkInGuest: (bookingId: string, roomId: string) => boolean;
  checkOutGuest: (bookingId: string) => boolean;
  updateRoomStatus: (roomId: string, status: RoomStatus, housekeeping?: HousekeepingStatus) => void;
  updateStaffAttendance: (staffId: string, status: AttendanceStatus, checkInTime?: string) => void;
  createBooking: (bookingData: Omit<Booking, 'id' | 'bookingReference' | 'createdAt'>) => Booking;
  cancelBooking: (bookingId: string) => void;
  settleFolio: (folioId: string, paymentMethod: string) => void;
  addFolioCharge: (folioId: string, item: { description: string; category: ChargeCategory; amount: number }) => void;
  addStaffMember: (staffData: Omit<StaffMember, 'id' | 'employeeCode'>) => StaffMember;
  recordExpense: (expenseData: Omit<ExpenseRecord, 'id' | 'date'>) => ExpenseRecord;
  resetData: () => void;
  refresh: () => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

interface HotelProviderProps {
  children: ReactNode;
  initialHotelId?: string;
}

export const HotelProvider: React.FC<HotelProviderProps> = ({
  children,
  initialHotelId = 'h-1',
}) => {
  const [selectedHotelId, setSelectedHotelId] = useState<string>(initialHotelId);
  const [revision, setRevision] = useState<number>(0);

  // Trigger reactive re-render across all subscribers
  const triggerUpdate = useCallback(() => {
    setRevision((prev) => prev + 1);
  }, []);

  const switchHotel = useCallback((hotelId: string) => {
    setSelectedHotelId(hotelId);
  }, []);

  // Compute reactive data based on selectedHotelId and revision
  const hotels = useMemo(() => hotelService.getAllHotels(), [revision]);
  const selectedHotel = useMemo(
    () => hotelService.getHotelById(selectedHotelId),
    [selectedHotelId, revision]
  );

  const rooms = useMemo(
    () => hotelService.getRooms(selectedHotelId),
    [selectedHotelId, revision]
  );
  const availableRooms = useMemo(
    () => hotelService.getAvailableRooms(selectedHotelId),
    [selectedHotelId, revision]
  );

  const bookings = useMemo(
    () => hotelService.getBookings(selectedHotelId),
    [selectedHotelId, revision]
  );
  const todayArrivals = useMemo(
    () => hotelService.getTodayArrivals(selectedHotelId),
    [selectedHotelId, revision]
  );
  const advanceBookings = useMemo(
    () => hotelService.getAdvanceBookings(selectedHotelId),
    [selectedHotelId, revision]
  );

  const staff = useMemo(
    () => hotelService.getStaff(selectedHotelId),
    [selectedHotelId, revision]
  );
  const folios = useMemo(
    () => hotelService.getFolios(selectedHotelId),
    [selectedHotelId, revision]
  );
  const expenses = useMemo(
    () => hotelService.getExpenses(selectedHotelId),
    [selectedHotelId, revision]
  );

  const kpis = useMemo(
    () => hotelService.calculateHotelKPIs(selectedHotelId),
    [selectedHotelId, revision]
  );
  const dailySummary = useMemo(
    () => hotelService.calculateDailySummary(selectedHotelId),
    [selectedHotelId, revision]
  );
  const operationalModules = useMemo(
    () => hotelService.getOperationalModules(selectedHotelId),
    [selectedHotelId, revision]
  );

  const attendanceSummary = useMemo(
    () => hotelService.getAttendanceSummary(selectedHotelId),
    [selectedHotelId, revision]
  );
  const billingSummary = useMemo(
    () => hotelService.getBillingSummary(selectedHotelId),
    [selectedHotelId, revision]
  );
  const advanceBookingSummary = useMemo(
    () => hotelService.getAdvanceBookingSummary(selectedHotelId),
    [selectedHotelId, revision]
  );
  const expensesSummary = useMemo(
    () => hotelService.getExpensesSummary(selectedHotelId),
    [selectedHotelId, revision]
  );

  // --- Actions ---
  const checkInGuest = useCallback(
    (bookingId: string, roomId: string): boolean => {
      const result = hotelService.checkInGuest(bookingId, roomId);
      if (result) {
        triggerUpdate();
        return true;
      }
      return false;
    },
    [triggerUpdate]
  );

  const checkOutGuest = useCallback(
    (bookingId: string): boolean => {
      const result = hotelService.checkOutGuest(bookingId);
      if (result) {
        triggerUpdate();
        return true;
      }
      return false;
    },
    [triggerUpdate]
  );

  const updateRoomStatus = useCallback(
    (roomId: string, status: RoomStatus, housekeeping?: HousekeepingStatus) => {
      hotelService.updateRoomStatus(roomId, status, housekeeping);
      triggerUpdate();
    },
    [triggerUpdate]
  );

  const updateStaffAttendance = useCallback(
    (staffId: string, status: AttendanceStatus, checkInTime?: string) => {
      hotelService.updateAttendance(staffId, status, checkInTime);
      triggerUpdate();
    },
    [triggerUpdate]
  );

  const createBooking = useCallback(
    (bookingData: Omit<Booking, 'id' | 'bookingReference' | 'createdAt'>): Booking => {
      const booking = hotelService.createBooking(bookingData);
      triggerUpdate();
      return booking;
    },
    [triggerUpdate]
  );

  const cancelBooking = useCallback(
    (bookingId: string) => {
      hotelService.cancelBooking(bookingId);
      triggerUpdate();
    },
    [triggerUpdate]
  );

  const settleFolio = useCallback(
    (folioId: string, paymentMethod: string) => {
      hotelService.settleFolio(folioId, paymentMethod);
      triggerUpdate();
    },
    [triggerUpdate]
  );

  const addFolioCharge = useCallback(
    (folioId: string, item: { description: string; category: ChargeCategory; amount: number }) => {
      hotelService.addFolioItem(folioId, item);
      triggerUpdate();
    },
    [triggerUpdate]
  );

  const addStaffMember = useCallback(
    (staffData: Omit<StaffMember, 'id' | 'employeeCode'>): StaffMember => {
      const staffMember = hotelService.addStaffMember(staffData);
      triggerUpdate();
      return staffMember;
    },
    [triggerUpdate]
  );

  const recordExpense = useCallback(
    (expenseData: Omit<ExpenseRecord, 'id' | 'date'>): ExpenseRecord => {
      const expense = hotelService.recordExpense(expenseData);
      triggerUpdate();
      return expense;
    },
    [triggerUpdate]
  );

  const resetData = useCallback(() => {
    hotelService.resetData();
    triggerUpdate();
  }, [triggerUpdate]);

  const value: HotelContextType = {
    selectedHotelId,
    selectedHotel,
    hotels,
    switchHotel,
    kpis,
    dailySummary,
    operationalModules,
    rooms,
    availableRooms,
    bookings,
    todayArrivals,
    advanceBookings,
    staff,
    folios,
    expenses,
    attendanceSummary,
    billingSummary,
    advanceBookingSummary,
    expensesSummary,
    checkInGuest,
    checkOutGuest,
    updateRoomStatus,
    updateStaffAttendance,
    createBooking,
    cancelBooking,
    settleFolio,
    addFolioCharge,
    addStaffMember,
    recordExpense,
    resetData,
    refresh: triggerUpdate,
  };

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
};

export const useHotel = (): HotelContextType => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
