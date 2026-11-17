/**
 * Navigation Types for ResortOS Application
 */

export type ScreenName =
  | 'splash'
  | 'role-selection'
  | 'login'
  | 'admin-dashboard'
  | 'manager-dashboard'
  | 'hotels'
  | 'managers'
  | 'rooms'
  | 'advance-booking'
  | 'checkin-rooms'
  | 'billing'
  | 'staff'
  | 'attendance'
  | 'salaries'
  | 'salary-advances'
  | 'daily-expenses'
  | 'daily-summary'
  | 'settings'
  | 'banquets-events'
  | 'in-room-dining'
  | 'housekeeping-dispatch'
  | 'ayurvedic-spa'
  | 'concierge-dispatch'
  | 'shift-handover'
  | 'cloud-sync';

export type UserRole = 'admin' | 'manager';

export interface NavigationParams {
  role?: UserRole;
  selectedHotelId?: string;
  initialTab?: string;
  filter?: string;
  [key: string]: unknown;
}

export interface NavigationContextType {
  currentScreen: ScreenName;
  params: NavigationParams;
  navigate: (screen: ScreenName, params?: NavigationParams) => void;
  goBack: () => void;
  canGoBack: boolean;
}
