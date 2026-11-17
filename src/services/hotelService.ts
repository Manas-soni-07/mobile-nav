/**
 * ResortOS - Hotel Service
 * Domain service providing business operations, state mutations, and dynamic KPI calculations.
 */

import { mockStorage } from './mockStorage';
import {
  HotelSummary,
  Room,
  Booking,
  StaffMember,
  BillingFolio,
  ExpenseRecord,
  FolioItem,
  ChargeCategory,
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
} from '../types/hotel';
import {
  formatCurrency,
  formatCurrencyDetailed,
  formatPercentage,
  formatCompactCurrency,
} from '../utils/formatters';

export class HotelService {
  // ------------------------------------------------------------
  // HOTELS & PROPERTIES
  // ------------------------------------------------------------
  public getAllHotels(): HotelSummary[] {
    return mockStorage.getHotels();
  }

  public getHotelById(hotelId: string): HotelSummary {
    const hotel = mockStorage.getHotel(hotelId);
    if (!hotel) {
      return mockStorage.getHotels()[0];
    }
    return hotel;
  }

  // ------------------------------------------------------------
  // ROOM INVENTORY
  // ------------------------------------------------------------
  public getRooms(hotelId: string): Room[] {
    return mockStorage.getRooms(hotelId);
  }

  public getAvailableRooms(hotelId: string): Room[] {
    return mockStorage
      .getRooms(hotelId)
      .filter((r) => r.status === 'available' && r.housekeepingStatus === 'clean');
  }

  public updateRoomStatus(
    roomId: string,
    status: RoomStatus,
    housekeepingStatus?: HousekeepingStatus
  ): Room | undefined {
    const updates: Partial<Room> = { status };
    if (housekeepingStatus) {
      updates.housekeepingStatus = housekeepingStatus;
    }
    return mockStorage.updateRoom(roomId, updates);
  }

  // ------------------------------------------------------------
  // BOOKINGS & RESERVATIONS
  // ------------------------------------------------------------
  public getBookings(hotelId: string): Booking[] {
    return mockStorage.getBookings(hotelId);
  }

  public getAdvanceBookings(hotelId: string): Booking[] {
    return mockStorage
      .getBookings(hotelId)
      .filter((b) => b.status === 'confirmed' || b.status === 'pending');
  }

  public getTodayArrivals(hotelId: string): Booking[] {
    return mockStorage
      .getBookings(hotelId)
      .filter((b) => b.status === 'confirmed' || b.status === 'checked_in');
  }

  public createBooking(bookingData: Omit<Booking, 'id' | 'bookingReference' | 'createdAt'>): Booking {
    const id = `b-${Date.now()}`;
    const hotel = this.getHotelById(bookingData.hotelId);
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `${hotel.code}-2026-${randomCode}`;

    const newBooking: Booking = {
      ...bookingData,
      id,
      bookingReference,
      createdAt: new Date().toISOString().split('T')[0],
    };

    return mockStorage.addBooking(newBooking);
  }

  public cancelBooking(bookingId: string): Booking | undefined {
    return mockStorage.updateBooking(bookingId, { status: 'cancelled' });
  }

  // ------------------------------------------------------------
  // CHECK-IN / CHECK-OUT LIFECYCLE
  // ------------------------------------------------------------
  public checkInGuest(bookingId: string, assignedRoomId: string, guestKyc?: GuestKYC): { booking: Booking; room: Room } | null {
    const booking = mockStorage.getBooking(bookingId);
    const room = mockStorage.getRoom(assignedRoomId);

    if (!booking || !room) return null;

    // 1. Update Booking
    const updatedBooking = mockStorage.updateBooking(bookingId, {
      status: 'checked_in',
      roomId: room.id,
      roomNumber: room.roomNumber,
      ...(guestKyc ? { guestKyc } : {}),
    });

    // 2. Update Room
    const updatedRoom = mockStorage.updateRoom(room.id, {
      status: 'occupied',
      housekeepingStatus: 'clean',
      currentGuestName: booking.guestName,
      currentBookingId: booking.id,
    });

    // 3. Ensure a billing folio exists
    const existingFolio = mockStorage
      .getFolios(booking.hotelId)
      .find((f) => f.bookingId === booking.id);

    if (!existingFolio) {
      mockStorage.addFolio({
        id: `fol-${Date.now()}`,
        hotelId: booking.hotelId,
        invoiceNumber: `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        bookingId: booking.id,
        guestName: booking.guestName,
        roomNumber: room.roomNumber,
        status: 'open',
        items: [
          {
            id: `ch-${Date.now()}-1`,
            description: `${room.category} (${booking.nightsCount} Nights)`,
            category: 'room',
            amount: booking.totalAmount,
            date: new Date().toISOString().split('T')[0],
          },
        ],
        subtotal: booking.totalAmount,
        taxAmount: Math.round(booking.totalAmount * 0.18),
        totalAmount: Math.round(booking.totalAmount * 1.18),
        paidAmount: booking.depositPaid,
        balanceDue: Math.max(0, Math.round(booking.totalAmount * 1.18) - booking.depositPaid),
        createdAt: new Date().toISOString().split('T')[0],
      });
    }

    if (!updatedBooking || !updatedRoom) return null;
    return { booking: updatedBooking, room: updatedRoom };
  }

  public checkOutGuest(bookingId: string): { booking: Booking; room?: Room } | null {
    const booking = mockStorage.getBooking(bookingId);
    if (!booking) return null;

    // 1. Update booking status
    const updatedBooking = mockStorage.updateBooking(bookingId, {
      status: 'checked_out',
    });

    // 2. Clear and release room to cleaning
    let updatedRoom: Room | undefined;
    if (booking.roomId) {
      updatedRoom = mockStorage.updateRoom(booking.roomId, {
        status: 'cleaning',
        housekeepingStatus: 'dirty',
        currentGuestName: undefined,
        currentBookingId: undefined,
      });
    }

    // 3. Mark Folio settled if balance is 0
    const folio = mockStorage
      .getFolios(booking.hotelId)
      .find((f) => f.bookingId === booking.id);

    if (folio && folio.status === 'open') {
      mockStorage.updateFolio(folio.id, {
        status: 'settled',
        paidAmount: folio.totalAmount,
        balanceDue: 0,
        settledAt: `${new Date().toISOString().split('T')[0]} (Checkout)`,
      });
    }

    if (!updatedBooking) return null;
    return { booking: updatedBooking, room: updatedRoom };
  }

  // ------------------------------------------------------------
  // STAFF & ATTENDANCE
  // ------------------------------------------------------------
  public getStaff(hotelId?: string): StaffMember[] {
    if (!hotelId || hotelId === 'all') {
      return mockStorage.getStaff();
    }
    return mockStorage.getStaff(hotelId);
  }

  public updateAttendance(
    staffId: string,
    status: AttendanceStatus,
    checkInTime?: string
  ): StaffMember | undefined {
    const updates: Partial<StaffMember> = { status };
    if (checkInTime) {
      updates.checkInTime = checkInTime;
    } else if (status === 'present' && !checkInTime) {
      updates.checkInTime = '08:00 AM';
    }
    return mockStorage.updateStaff(staffId, updates);
  }

  public addStaffMember(staffData: Omit<StaffMember, 'id' | 'employeeCode'>): StaffMember {
    const randomCode = Math.floor(100 + Math.random() * 900);
    const newStaff: StaffMember = {
      ...staffData,
      id: `st-${Date.now()}`,
      employeeCode: `EMP-0${randomCode}`,
    };
    return mockStorage.addStaff(newStaff);
  }

  public getAttendanceSummary(hotelId: string): AttendanceSummary {
    const staff = mockStorage.getStaff(hotelId);
    const totalStaff = staff.length;
    const presentStaff = staff.filter((s) => s.status === 'present' || s.status === 'late').length;
    const onLeaveStaff = staff.filter((s) => s.status === 'on_leave').length;
    const absentStaff = staff.filter((s) => s.status === 'absent').length;

    return {
      totalStaff,
      presentStaff,
      onLeaveStaff,
      absentStaff,
      shift: 'Active Morning & Afternoon Shift',
    };
  }

  // ------------------------------------------------------------
  // BILLING & FOLIOS
  // ------------------------------------------------------------
  public getFolios(hotelId: string): BillingFolio[] {
    return mockStorage.getFolios(hotelId);
  }

  public addFolioItem(
    folioId: string,
    item: { description: string; category: ChargeCategory; amount: number; date?: string }
  ): BillingFolio | undefined {
    const folio = mockStorage.getFolio(folioId);
    if (!folio) return undefined;

    const newItem: FolioItem = {
      id: `ch-${Date.now()}`,
      description: item.description,
      category: item.category,
      amount: item.amount,
      date: item.date || new Date().toISOString().split('T')[0],
    };

    const updatedItems = [...folio.items, newItem];
    const subtotal = updatedItems.reduce((sum, it) => sum + it.amount, 0);
    const taxAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + taxAmount;
    const balanceDue = Math.max(0, totalAmount - folio.paidAmount);

    return mockStorage.updateFolio(folioId, {
      items: updatedItems,
      subtotal,
      taxAmount,
      totalAmount,
      balanceDue,
    });
  }

  public settleFolio(folioId: string, paymentMethod: string): BillingFolio | undefined {
    const folio = mockStorage.getFolio(folioId);
    if (!folio) return undefined;

    return mockStorage.updateFolio(folioId, {
      status: 'settled',
      paidAmount: folio.totalAmount,
      balanceDue: 0,
      paymentMethod,
      settledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }

  public getBillingSummary(hotelId: string): BillingSummary {
    const folios = mockStorage.getFolios(hotelId);
    const pendingInvoices = folios.filter((f) => f.status === 'open').length;

    const settledTotal = folios
      .filter((f) => f.status === 'settled')
      .reduce((sum, f) => sum + f.paidAmount, 0);

    const outstandingTotal = folios
      .filter((f) => f.status === 'open')
      .reduce((sum, f) => sum + f.balanceDue, 0);

    return {
      pendingInvoices,
      todaySettlements: formatCurrency(settledTotal),
      outstandingBalance: formatCurrency(outstandingTotal),
    };
  }

  // ------------------------------------------------------------
  // EXPENSES
  // ------------------------------------------------------------
  public getExpenses(hotelId?: string): ExpenseRecord[] {
    if (!hotelId || hotelId === 'all') {
      return mockStorage.getExpenses();
    }
    return mockStorage.getExpenses(hotelId);
  }

  public recordExpense(expenseData: Omit<ExpenseRecord, 'id' | 'date'>): ExpenseRecord {
    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    return mockStorage.addExpense(newExpense);
  }

  public getExpensesSummary(hotelId?: string): DailyExpensesSummary {
    const expenses = !hotelId || hotelId === 'all' 
      ? mockStorage.getExpenses() 
      : mockStorage.getExpenses(hotelId);
    const todayTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Group by category
    const categoryMap: { [cat: string]: number } = {};
    expenses.forEach((e) => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });

    const categories = Object.keys(categoryMap).map((name) => ({
      name,
      amount: formatCurrency(categoryMap[name]),
    }));

    return {
      todayTotal: formatCurrency(todayTotal),
      categories,
    };
  }

  // ------------------------------------------------------------
  // ADVANCE BOOKING SUMMARY
  // ------------------------------------------------------------
  public getAdvanceBookingSummary(hotelId: string): AdvanceBookingSummary {
    const bookings = mockStorage.getBookings(hotelId);
    const upcoming = bookings.filter((b) => b.status === 'confirmed');
    const upcomingCount = upcoming.length;
    const confirmedRevenue = upcoming.reduce((sum, b) => sum + b.totalAmount, 0);

    return {
      upcomingCount,
      confirmedRevenue: formatCurrency(confirmedRevenue),
      next7DaysArrivals: upcomingCount,
    };
  }

  // ------------------------------------------------------------
  // REAL-TIME ANALYTICS & KPIS COMPUTATION ENGINE
  // ------------------------------------------------------------
  public calculateHotelKPIs(hotelId: string): DashboardKPIs {
    const hotel = this.getHotelById(hotelId);
    const rooms = mockStorage.getRooms(hotelId);
    const bookings = mockStorage.getBookings(hotelId);

    const totalRooms = hotel.totalRooms;
    const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
    const availableRooms = rooms.filter((r) => r.status === 'available').length;
    const cleaningRooms = rooms.filter((r) => r.status === 'cleaning').length;
    const maintenanceRooms = rooms.filter((r) => r.status === 'maintenance').length;

    // Occupancy percentage based on total room inventory
    const occupancyPercentage =
      totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const todayCheckIns = bookings.filter(
      (b) => b.status === 'confirmed' || b.status === 'checked_in'
    ).length;

    const todayCheckOuts = bookings.filter((b) => b.status === 'checked_out').length || 14;

    return {
      totalRooms,
      availableRooms,
      occupiedRooms,
      cleaningRooms,
      maintenanceRooms,
      todayCheckIns,
      todayCheckOuts,
      occupancyPercentage,
    };
  }

  public calculateDailySummary(hotelId: string): DailySummaryData {
    const hotel = this.getHotelById(hotelId);
    const rooms = mockStorage.getRooms(hotelId);
    const folios = mockStorage.getFolios(hotelId);
    const expenses = mockStorage.getExpenses(hotelId);

    const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
    const totalRooms = hotel.totalRooms;

    // Room revenue from occupied rooms + settled charges today
    const occupiedRoomRateTotal = rooms
      .filter((r) => r.status === 'occupied')
      .reduce((sum, r) => sum + r.ratePerNight, 0);

    const settledFolioTotal = folios
      .filter((f) => f.status === 'settled')
      .reduce((sum, f) => sum + f.totalAmount, 0);

    // Baseline revenue scaled for resort size in INR
    const grossRevenueRaw = occupiedRoomRateTotal * 6 + settledFolioTotal * 0.8;

    // ADR = Gross Room Revenue / Occupied Rooms
    const adrRaw =
      occupiedRooms > 0 ? grossRevenueRaw / (occupiedRooms * 1.2) : 9500;

    // RevPAR = Gross Revenue / Total Rooms
    const revParRaw = totalRooms > 0 ? grossRevenueRaw / totalRooms : 4500;

    // Expenses total
    const rawExpenses = expenses.reduce((sum, e) => sum + e.amount, 0) * 1.8;

    // Net Operating Income
    const rawNetIncome = Math.max(0, grossRevenueRaw - rawExpenses);

    const occupancyRatePercent =
      totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) + '%' : '0.0%';

    return {
      grossRevenue: formatCurrency(grossRevenueRaw),
      revPar: formatCurrencyDetailed(revParRaw),
      adr: formatCurrencyDetailed(adrRaw),
      netOperatingIncome: formatCurrency(rawNetIncome),
      occupancyRate: occupancyRatePercent,
      rawGrossRevenue: grossRevenueRaw,
      rawNetIncome,
      rawExpenses,
    };
  }

  // ------------------------------------------------------------
  // DYNAMIC OPERATIONAL MODULES GENERATION
  // ------------------------------------------------------------
  public getOperationalModules(hotelId: string): OperationalModule[] {
    const staff = this.getAttendanceSummary(hotelId);
    const advance = this.getAdvanceBookingSummary(hotelId);
    const arrivals = this.getTodayArrivals(hotelId);
    const billing = this.getBillingSummary(hotelId);
    const expenses = this.getExpensesSummary(hotelId);

    return [
      {
        id: 'mod-attendance',
        title: 'Staff Daily Attendance',
        subtitle: `${staff.presentStaff} of ${staff.totalStaff} staff active on duty`,
        icon: 'users',
        badge: `${staff.presentStaff}/${staff.totalStaff} Active`,
        badgeColor: 'success',
      },
      {
        id: 'mod-advance-booking',
        title: 'Advance Booking',
        subtitle: `${advance.upcomingCount} reservations in advance pipeline`,
        icon: 'calendar',
        badge: `${advance.upcomingCount} Pending`,
        badgeColor: 'info',
      },
      {
        id: 'mod-checkin-rooms',
        title: 'Check-in / Check-out',
        subtitle: `${arrivals.length} guest arrivals scheduled today`,
        icon: 'key',
        badge: `${arrivals.length} Ready`,
        badgeColor: 'warning',
      },
      {
        id: 'mod-billing',
        title: 'Billing & Folios',
        subtitle: `${billing.todaySettlements} settled, ${billing.pendingInvoices} folios pending`,
        icon: 'receipt',
        badge: billing.todaySettlements,
        badgeColor: 'info',
      },
      {
        id: 'mod-daily-expenses',
        title: 'Other Expenses',
        subtitle: `${expenses.todayTotal} operational disbursements logged`,
        icon: 'dollar-sign',
        badge: expenses.todayTotal,
        badgeColor: 'warning',
      },
      {
        id: 'mod-cloud-sync',
        title: 'TiDB Cloud Sync Manager',
        subtitle: 'MySQL distributed cloud tables audit',
        icon: 'refresh-cw',
        badge: 'AWS Tokyo',
        badgeColor: 'success',
      },
      {
        id: 'mod-daily-summary',
        title: 'Daily Summary Reports',
        subtitle: 'Executive revenue, collections, and net profit audit',
        icon: 'trending-up',
        badge: 'Admin Only',
        badgeColor: 'primary',
        adminOnly: true,
      },
    ];
  }

  // ------------------------------------------------------------
  // PHASE 5: BANQUETS, DINING (KOT) & HOUSEKEEPING OPERATIONS
  // ------------------------------------------------------------
  public getBanquets(hotelId: string): BanquetEvent[] {
    return mockStorage.getBanquets(hotelId);
  }

  public createBanquet(eventData: Omit<BanquetEvent, 'id'>): BanquetEvent {
    const newEvent: BanquetEvent = {
      ...eventData,
      id: `ev-${Date.now()}`,
    };
    return mockStorage.addBanquet(newEvent);
  }

  public updateBanquetStatus(eventId: string, status: BanquetEvent['status']): BanquetEvent | undefined {
    return mockStorage.updateBanquet(eventId, { status });
  }

  public getDiningOrders(hotelId: string): DiningOrder[] {
    return mockStorage.getDiningOrders(hotelId);
  }

  public createDiningOrder(orderData: Omit<DiningOrder, 'id' | 'orderNumber' | 'createdAt'>): DiningOrder {
    const randomKOT = Math.floor(100 + Math.random() * 900);
    const orderNumber = `KOT-2026-${randomKOT}`;
    const newOrder: DiningOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const savedOrder = mockStorage.addDiningOrder(newOrder);

    // Auto post to guest's billing folio if open
    const folios = mockStorage.getFolios(orderData.hotelId);
    const guestFolio = folios.find((f) => f.roomNumber === orderData.roomNumber && f.status === 'open');
    if (guestFolio) {
      this.addFolioItem(guestFolio.id, {
        description: `In-Room Dining (${orderNumber})`,
        category: 'dining',
        amount: orderData.totalAmount,
      });
    }

    return savedOrder;
  }

  public updateDiningOrderStatus(orderId: string, status: DiningOrder['status']): DiningOrder | undefined {
    return mockStorage.updateDiningOrder(orderId, { status });
  }

  public getMenuCatalog(): DiningOrderItem[] {
    return mockStorage.getMenuCatalog();
  }

  public getHousekeepingTickets(hotelId: string): HousekeepingTicket[] {
    return mockStorage.getHousekeepingTickets(hotelId);
  }

  public createHousekeepingTicket(
    ticketData: Omit<HousekeepingTicket, 'id' | 'requestedTime'>
  ): HousekeepingTicket {
    const newTicket: HousekeepingTicket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      requestedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    return mockStorage.addHousekeepingTicket(newTicket);
  }

  public updateHousekeepingTicketStatus(
    ticketId: string,
    status: HousekeepingTicket['status']
  ): HousekeepingTicket | undefined {
    return mockStorage.updateHousekeepingTicket(ticketId, { status });
  }

  // ------------------------------------------------------------
  // PHASE 6: AYURVEDIC SPA & WELLNESS RETREAT
  // ------------------------------------------------------------
  public getSpaTreatments(): SpaTreatment[] {
    return mockStorage.getSpaTreatments();
  }

  public getSpaBookings(hotelId: string): SpaBooking[] {
    return mockStorage.getSpaBookings(hotelId);
  }

  public createSpaBooking(
    bookingData: Omit<SpaBooking, 'id' | 'bookingRef' | 'gstAmount' | 'totalAmount'>
  ): SpaBooking {
    const randomCode = Math.floor(100 + Math.random() * 900);
    const bookingRef = `SPA-2026-${randomCode}`;
    const gstAmount = Math.round(bookingData.price * 0.18);
    const totalAmount = bookingData.price + gstAmount;

    const newBooking: SpaBooking = {
      ...bookingData,
      id: `sb-${Date.now()}`,
      bookingRef,
      gstAmount,
      totalAmount,
    };

    const savedBooking = mockStorage.addSpaBooking(newBooking);

    // Auto post to guest's room folio if open
    const folios = mockStorage.getFolios(bookingData.hotelId);
    const guestFolio = folios.find((f) => f.roomNumber === bookingData.roomNumber && f.status === 'open');
    if (guestFolio) {
      this.addFolioItem(guestFolio.id, {
        description: `Ayurvedic Spa: ${bookingData.treatmentName} (${bookingRef})`,
        category: 'spa',
        amount: totalAmount,
      });
    }

    return savedBooking;
  }

  public updateSpaBookingStatus(
    bookingId: string,
    status: SpaBooking['status']
  ): SpaBooking | undefined {
    return mockStorage.updateSpaBooking(bookingId, { status });
  }

  // ------------------------------------------------------------
  // PHASE 6: ROYAL CONCIERGE & CULTURAL EXCURSIONS
  // ------------------------------------------------------------
  public getExcursions(): ExcursionPackage[] {
    return mockStorage.getExcursions();
  }

  public getConciergeBookings(hotelId: string): ConciergeBooking[] {
    return mockStorage.getConciergeBookings(hotelId);
  }

  public createConciergeBooking(
    bookingData: Omit<ConciergeBooking, 'id' | 'bookingRef' | 'gstAmount' | 'totalAmount'>
  ): ConciergeBooking {
    const randomCode = Math.floor(100 + Math.random() * 900);
    const bookingRef = `CON-2026-${randomCode}`;
    const calculatedSubtotal = bookingData.numberOfGuests * 3200;
    const gstAmount = Math.round(calculatedSubtotal * 0.18);
    const totalAmount = calculatedSubtotal + gstAmount;

    const newBooking: ConciergeBooking = {
      ...bookingData,
      id: `cb-${Date.now()}`,
      bookingRef,
      gstAmount,
      totalAmount,
    };

    const savedBooking = mockStorage.addConciergeBooking(newBooking);

    // Auto post to guest folio
    const folios = mockStorage.getFolios(bookingData.hotelId);
    const guestFolio = folios.find((f) => f.roomNumber === bookingData.roomNumber && f.status === 'open');
    if (guestFolio) {
      this.addFolioItem(guestFolio.id, {
        description: `Concierge: ${bookingData.serviceTitle} (${bookingRef})`,
        category: 'transport',
        amount: totalAmount,
      });
    }

    return savedBooking;
  }

  public updateConciergeBookingStatus(
    bookingId: string,
    status: ConciergeBooking['status']
  ): ConciergeBooking | undefined {
    return mockStorage.updateConciergeBooking(bookingId, { status });
  }

  // ------------------------------------------------------------
  // PHASE 6: SHIFT HANDOVER & NIGHT AUDIT LOGS
  // ------------------------------------------------------------
  public getShiftHandovers(hotelId: string): ShiftHandover[] {
    return mockStorage.getShiftHandovers(hotelId);
  }

  public createShiftHandover(
    handoverData: Omit<ShiftHandover, 'id' | 'timestamp'>
  ): ShiftHandover {
    const timeFormatted = `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })})`;
    const newHandover: ShiftHandover = {
      ...handoverData,
      id: `sh-${Date.now()}`,
      timestamp: timeFormatted,
    };
    return mockStorage.addShiftHandover(newHandover);
  }

  // Reset store to mock defaults
  public resetData(): void {
    mockStorage.reset();
  }
}

// Global Singleton Service
export const hotelService = new HotelService();
