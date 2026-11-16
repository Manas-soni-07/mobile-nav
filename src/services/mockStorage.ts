/**
 * ResortOS - Mock Storage Repository
 * In-memory reactive state holding all managed resort entities.
 */

import {
  HotelSummary,
  Room,
  Booking,
  StaffMember,
  BillingFolio,
  ExpenseRecord,
} from '../types/hotel';
import {
  INITIAL_HOTELS,
  INITIAL_ROOMS,
  INITIAL_BOOKINGS,
  INITIAL_STAFF,
  INITIAL_FOLIOS,
  INITIAL_EXPENSES,
} from '../constants/mockDatabase';

class MockStorage {
  private hotels: HotelSummary[] = [];
  private rooms: Room[] = [];
  private bookings: Booking[] = [];
  private staff: StaffMember[] = [];
  private folios: BillingFolio[] = [];
  private expenses: ExpenseRecord[] = [];

  constructor() {
    this.reset();
  }

  public reset(): void {
    // Deep clone to ensure mutation safety across tests and resets
    this.hotels = JSON.parse(JSON.stringify(INITIAL_HOTELS));
    this.rooms = JSON.parse(JSON.stringify(INITIAL_ROOMS));
    this.bookings = JSON.parse(JSON.stringify(INITIAL_BOOKINGS));
    this.staff = JSON.parse(JSON.stringify(INITIAL_STAFF));
    this.folios = JSON.parse(JSON.stringify(INITIAL_FOLIOS));
    this.expenses = JSON.parse(JSON.stringify(INITIAL_EXPENSES));
  }

  // --- Hotels ---
  public getHotels(): HotelSummary[] {
    return [...this.hotels];
  }

  public getHotel(id: string): HotelSummary | undefined {
    return this.hotels.find((h) => h.id === id);
  }

  // --- Rooms ---
  public getRooms(hotelId?: string): Room[] {
    if (hotelId) {
      return this.rooms.filter((r) => r.hotelId === hotelId);
    }
    return [...this.rooms];
  }

  public getRoom(id: string): Room | undefined {
    return this.rooms.find((r) => r.id === id);
  }

  public updateRoom(id: string, updates: Partial<Room>): Room | undefined {
    const index = this.rooms.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.rooms[index] = { ...this.rooms[index], ...updates };
      return this.rooms[index];
    }
    return undefined;
  }

  // --- Bookings ---
  public getBookings(hotelId?: string): Booking[] {
    if (hotelId) {
      return this.bookings.filter((b) => b.hotelId === hotelId);
    }
    return [...this.bookings];
  }

  public getBooking(id: string): Booking | undefined {
    return this.bookings.find((b) => b.id === id);
  }

  public addBooking(booking: Booking): Booking {
    this.bookings.unshift(booking);
    return booking;
  }

  public updateBooking(id: string, updates: Partial<Booking>): Booking | undefined {
    const index = this.bookings.findIndex((b) => b.id === id);
    if (index !== -1) {
      this.bookings[index] = { ...this.bookings[index], ...updates };
      return this.bookings[index];
    }
    return undefined;
  }

  // --- Staff ---
  public getStaff(hotelId?: string): StaffMember[] {
    if (hotelId) {
      return this.staff.filter((s) => s.hotelId === hotelId);
    }
    return [...this.staff];
  }

  public addStaff(staffMember: StaffMember): StaffMember {
    this.staff.unshift(staffMember);
    return staffMember;
  }

  public updateStaff(id: string, updates: Partial<StaffMember>): StaffMember | undefined {
    const index = this.staff.findIndex((s) => s.id === id);
    if (index !== -1) {
      this.staff[index] = { ...this.staff[index], ...updates };
      return this.staff[index];
    }
    return undefined;
  }

  // --- Folios ---
  public getFolios(hotelId?: string): BillingFolio[] {
    if (hotelId) {
      return this.folios.filter((f) => f.hotelId === hotelId);
    }
    return [...this.folios];
  }

  public getFolio(id: string): BillingFolio | undefined {
    return this.folios.find((f) => f.id === id);
  }

  public addFolio(folio: BillingFolio): BillingFolio {
    this.folios.unshift(folio);
    return folio;
  }

  public updateFolio(id: string, updates: Partial<BillingFolio>): BillingFolio | undefined {
    const index = this.folios.findIndex((f) => f.id === id);
    if (index !== -1) {
      this.folios[index] = { ...this.folios[index], ...updates };
      return this.folios[index];
    }
    return undefined;
  }

  // --- Expenses ---
  public getExpenses(hotelId?: string): ExpenseRecord[] {
    if (hotelId) {
      return this.expenses.filter((e) => e.hotelId === hotelId);
    }
    return [...this.expenses];
  }

  public addExpense(expense: ExpenseRecord): ExpenseRecord {
    this.expenses.unshift(expense);
    return expense;
  }
}

// Global Singleton Instance
export const mockStorage = new MockStorage();
