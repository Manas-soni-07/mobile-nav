/**
 * Navigation Types for ResortOS Application
 */

export type ScreenName =
  | 'splash'
  | 'role-selection'
  | 'login'
  | 'admin-dashboard'
  | 'manager-dashboard'
  | 'attendance'
  | 'advance-booking'
  | 'checkin-rooms'
  | 'billing'
  | 'daily-expenses'
  | 'daily-summary';

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
