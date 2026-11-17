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
  BanquetEvent,
  DiningOrder,
  DiningOrderItem,
  HousekeepingTicket,
  GuestKYC,
  SpaTreatment,
  SpaBooking,
  ExcursionPackage,
  ConciergeBooking,
  ShiftHandover,
  CurrentUser,
  StaffAdvance,
  SalaryPayment,
  ManagerUser,
} from '../types/hotel';
import { hotelService } from '../services/hotelService';

export interface HotelContextType {
  // Authentication & Session
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  login: (email: string, password: string, role?: string) => Promise<{ success: boolean; user?: CurrentUser; error?: string }>;
  logout: () => void;

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
  banquets: BanquetEvent[];
  diningOrders: DiningOrder[];
  housekeepingTickets: HousekeepingTicket[];
  menuCatalog: DiningOrderItem[];
  spaTreatments: SpaTreatment[];
  spaBookings: SpaBooking[];
  excursions: ExcursionPackage[];
  conciergeBookings: ConciergeBooking[];
  shiftHandovers: ShiftHandover[];

  // Summaries
  attendanceSummary: AttendanceSummary;
  billingSummary: BillingSummary;
  advanceBookingSummary: AdvanceBookingSummary;
  expensesSummary: DailyExpensesSummary;

  // Actions & Mutations
  checkInGuest: (bookingId: string, roomId: string, guestKyc?: GuestKYC) => boolean;
  checkOutGuest: (bookingId: string) => boolean;
  updateRoomStatus: (roomId: string, status: RoomStatus, housekeeping?: HousekeepingStatus) => void;
  updateStaffAttendance: (staffId: string, status: AttendanceStatus, checkInTime?: string) => void;
  createBooking: (bookingData: Omit<Booking, 'id' | 'bookingReference' | 'createdAt'>) => Booking;
  cancelBooking: (bookingId: string) => void;
  settleFolio: (folioId: string, paymentMethod: string) => void;
  addFolioCharge: (folioId: string, item: { description: string; category: ChargeCategory; amount: number }) => void;
  addStaffMember: (staffData: Omit<StaffMember, 'id' | 'employeeCode'>) => StaffMember;
  recordExpense: (expenseData: Omit<ExpenseRecord, 'id' | 'date'>) => ExpenseRecord;
  createBanquet: (eventData: Omit<BanquetEvent, 'id'>) => BanquetEvent;
  updateBanquetStatus: (eventId: string, status: BanquetEvent['status']) => void;
  createDiningOrder: (orderData: Omit<DiningOrder, 'id' | 'orderNumber' | 'createdAt'>) => DiningOrder;
  updateDiningOrderStatus: (orderId: string, status: DiningOrder['status']) => void;
  createHousekeepingTicket: (ticketData: Omit<HousekeepingTicket, 'id' | 'requestedTime'>) => HousekeepingTicket;
  updateHousekeepingTicketStatus: (ticketId: string, status: HousekeepingTicket['status']) => void;
  createSpaBooking: (bookingData: Omit<SpaBooking, 'id' | 'bookingRef' | 'gstAmount' | 'totalAmount'>) => SpaBooking;
  updateSpaBookingStatus: (bookingId: string, status: SpaBooking['status']) => void;
  createConciergeBooking: (bookingData: Omit<ConciergeBooking, 'id' | 'bookingRef' | 'gstAmount' | 'totalAmount'>) => ConciergeBooking;
  updateConciergeBookingStatus: (bookingId: string, status: ConciergeBooking['status']) => void;
  createShiftHandover: (handoverData: Omit<ShiftHandover, 'id' | 'timestamp'>) => ShiftHandover;
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
  initialHotelId = 'h-villa',
}) => {
  const [selectedHotelId, setSelectedHotelId] = useState<string>(initialHotelId);
  const [revision, setRevision] = useState<number>(0);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>({
    id: 'usr-admin-1',
    email: 'admin@resortos.com',
    fullName: 'Vikramaditya Rathore (Admin Owner)',
    role: 'ADMIN',
    hotelId: null,
  });

  // Trigger reactive re-render across all subscribers
  const triggerUpdate = useCallback(() => {
    setRevision((prev) => prev + 1);
  }, []);

  const switchHotel = useCallback(
    (hotelId: string) => {
      // Manager cannot switch away from their assigned hotel
      if (currentUser?.role === 'MANAGER' && currentUser.hotelId && hotelId !== currentUser.hotelId) {
        console.warn('Unauthorized hotel switch attempt blocked for manager.');
        return;
      }
      setSelectedHotelId(hotelId);
    },
    [currentUser]
  );

  const login = useCallback(
    async (
      email: string,
      password: string,
      requestedRole?: string
    ): Promise<{ success: boolean; user?: CurrentUser; error?: string }> => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role: requestedRole }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setCurrentUser(data.user);
          if (data.user.role === 'MANAGER' && data.user.hotelId) {
            setSelectedHotelId(data.user.hotelId);
          }
          return { success: true, user: data.user };
        } else {
          return { success: false, error: data.error || 'Authentication failed' };
        }
      } catch (_netErr) {
        // Offline / in-app fallback
        const cleanEmail = email.trim().toLowerCase();
        const reqRoleUpper = requestedRole ? requestedRole.toUpperCase() : 'ADMIN';

        if (cleanEmail === 'admin@resortos.com' || cleanEmail === 'admin') {
          if (password !== 'Password123!' && password !== 'admin123') {
            return { success: false, error: 'Invalid password. Please verify and try again.' };
          }
          const user: CurrentUser = {
            id: 'usr-admin-1',
            email: 'admin@resortos.com',
            fullName: 'Vikramaditya Rathore (Admin Owner)',
            role: 'ADMIN',
            hotelId: null,
          };
          setCurrentUser(user);
          return { success: true, user };
        }

        if (cleanEmail === 'manager.villa@resortos.com' || cleanEmail === 'manager@resortos.com' || cleanEmail === 'villa') {
          if (password !== 'Password123!' && password !== 'villa123' && password !== 'Password123!') {
            return { success: false, error: 'Invalid password. Please verify and try again.' };
          }
          if (reqRoleUpper === 'ADMIN') {
            return {
              success: false,
              error: 'Access Denied: This account does not possess Administrator privileges. Please select Manager role.',
            };
          }
          const user: CurrentUser = {
            id: 'usr-mgr-villa',
            email: 'manager.villa@resortos.com',
            fullName: 'Sunita Sharma (Manager - THE VILLA)',
            role: 'MANAGER',
            hotelId: 'h-villa',
            assignedHotel: {
              id: 'h-villa',
              name: 'THE VILLA',
              code: 'TV-01',
            },
          };
          setCurrentUser(user);
          setSelectedHotelId('h-villa');
          return { success: true, user };
        }

        if (cleanEmail === 'manager.navkar@resortos.com' || cleanEmail === 'navkar') {
          if (password !== 'Password123!' && password !== 'navkar123') {
            return { success: false, error: 'Invalid password. Please verify and try again.' };
          }
          if (reqRoleUpper === 'ADMIN') {
            return {
              success: false,
              error: 'Access Denied: This account does not possess Administrator privileges. Please select Manager role.',
            };
          }
          const user: CurrentUser = {
            id: 'usr-mgr-navkar',
            email: 'manager.navkar@resortos.com',
            fullName: 'Rajesh Verma (Manager - NAVKAR PALACE)',
            role: 'MANAGER',
            hotelId: 'h-navkar',
            assignedHotel: {
              id: 'h-navkar',
              name: 'NAVKAR PALACE & RESORT',
              code: 'NPR-02',
            },
          };
          setCurrentUser(user);
          setSelectedHotelId('h-navkar');
          return { success: true, user };
        }

        return { success: false, error: 'Account not found. Please verify your email or username.' };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    setSelectedHotelId('h-villa');
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
  const banquets = useMemo(
    () => hotelService.getBanquets(selectedHotelId),
    [selectedHotelId, revision]
  );
  const diningOrders = useMemo(
    () => hotelService.getDiningOrders(selectedHotelId),
    [selectedHotelId, revision]
  );
  const housekeepingTickets = useMemo(
    () => hotelService.getHousekeepingTickets(selectedHotelId),
    [selectedHotelId, revision]
  );
  const menuCatalog = useMemo(
    () => hotelService.getMenuCatalog(),
    [revision]
  );
  const spaTreatments = useMemo(
    () => hotelService.getSpaTreatments(),
    [revision]
  );
  const spaBookings = useMemo(
    () => hotelService.getSpaBookings(selectedHotelId),
    [selectedHotelId, revision]
  );
  const excursions = useMemo(
    () => hotelService.getExcursions(),
    [revision]
  );
  const conciergeBookings = useMemo(
    () => hotelService.getConciergeBookings(selectedHotelId),
    [selectedHotelId, revision]
  );
  const shiftHandovers = useMemo(
    () => hotelService.getShiftHandovers(selectedHotelId),
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
    (bookingId: string, roomId: string, guestKyc?: GuestKYC): boolean => {
      const result = hotelService.checkInGuest(bookingId, roomId, guestKyc);
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

  const createBanquet = useCallback(
    (eventData: Omit<BanquetEvent, 'id'>): BanquetEvent => {
      const event = hotelService.createBanquet(eventData);
      triggerUpdate();
      return event;
    },
    [triggerUpdate]
  );

  const updateBanquetStatus = useCallback(
    (eventId: string, status: BanquetEvent['status']) => {
      hotelService.updateBanquetStatus(eventId, status);
      triggerUpdate();
    },
    [triggerUpdate]
  );

  const createDiningOrder = useCallback(
    (orderData: Omit<DiningOrder, 'id' | 'orderNumber' | 'createdAt'>): DiningOrder => {
      const order = hotelService.createDiningOrder(orderData);
      triggerUpdate();
      return order;
    },
    [triggerUpdate]
  );

  const updateDiningOrderStatus = useCallback(
    (orderId: string, status: DiningOrder['status']) => {
      hotelService.updateDiningOrderStatus(orderId, status);
      triggerUpdate();
    },
    [triggerUpdate]
  );

  const createHousekeepingTicket = useCallback(
    (ticketData: Omit<HousekeepingTicket, 'id' | 'requestedTime'>): HousekeepingTicket => {
      const ticket = hotelService.createHousekeepingTicket(ticketData);
      triggerUpdate();
      return ticket;
    },
    [triggerUpdate]
  );

  const updateHousekeepingTicketStatus = useCallback(
    (ticketId: string, status: HousekeepingTicket['status']) => {
      hotelService.updateHousekeepingTicketStatus(ticketId, status);
      triggerUpdate();
    },
    [triggerUpdate]
  );

  const createSpaBooking = useCallback(
    (bookingData: Omit<SpaBooking, 'id' | 'bookingRef' | 'gstAmount' | 'totalAmount'>): SpaBooking => {
      const booking = hotelService.createSpaBooking(bookingData);
      triggerUpdate();
      return booking;
    },
    [triggerUpdate]
  );

  const updateSpaBookingStatus = useCallback(
    (bookingId: string, status: SpaBooking['status']) => {
      hotelService.updateSpaBookingStatus(bookingId, status);
      triggerUpdate();
    },
    [triggerUpdate]
  );

  const createConciergeBooking = useCallback(
    (bookingData: Omit<ConciergeBooking, 'id' | 'bookingRef' | 'gstAmount' | 'totalAmount'>): ConciergeBooking => {
      const booking = hotelService.createConciergeBooking(bookingData);
      triggerUpdate();
      return booking;
    },
    [triggerUpdate]
  );

  const updateConciergeBookingStatus = useCallback(
    (bookingId: string, status: ConciergeBooking['status']) => {
      hotelService.updateConciergeBookingStatus(bookingId, status);
      triggerUpdate();
    },
    [triggerUpdate]
  );

  const createShiftHandover = useCallback(
    (handoverData: Omit<ShiftHandover, 'id' | 'timestamp'>): ShiftHandover => {
      const handover = hotelService.createShiftHandover(handoverData);
      triggerUpdate();
      return handover;
    },
    [triggerUpdate]
  );

  const resetData = useCallback(() => {
    hotelService.resetData();
    triggerUpdate();
  }, [triggerUpdate]);

  const value: HotelContextType = {
    currentUser,
    setCurrentUser,
    login,
    logout,
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
    banquets,
    diningOrders,
    housekeepingTickets,
    menuCatalog,
    spaTreatments,
    spaBookings,
    excursions,
    conciergeBookings,
    shiftHandovers,
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
    createBanquet,
    updateBanquetStatus,
    createDiningOrder,
    updateDiningOrderStatus,
    createHousekeepingTicket,
    updateHousekeepingTicketStatus,
    createSpaBooking,
    updateSpaBookingStatus,
    createConciergeBooking,
    updateConciergeBookingStatus,
    createShiftHandover,
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
