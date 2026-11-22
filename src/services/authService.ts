/**
 * ResortOS - Authentication & Session Persistence Service
 * Manages token lifecycle, session storage (AsyncStorage), and user authentication.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CurrentUser } from '../types/hotel';
import { apiClient } from './apiClient';

const AUTH_TOKEN_KEY = '@resortos_auth_token';
const CURRENT_USER_KEY = '@resortos_current_user';
const SELECTED_HOTEL_ID_KEY = '@resortos_selected_hotel_id';

export interface StoredSession {
  token: string | null;
  user: CurrentUser | null;
  selectedHotelId: string | null;
}

export class AuthService {
  /**
   * Perform authentication against the backend /api/auth/login endpoint
   */
  public async login(
    email: string,
    password: string,
    role?: string
  ): Promise<{ success: boolean; token: string; user: CurrentUser }> {
    const result = await apiClient.login(email, password, role);

    if (result.success && result.token && result.user) {
      await this.saveSession(result.token, result.user);
    }

    return result;
  }

  /**
   * Persist active session token and user profile to AsyncStorage
   */
  public async saveSession(token: string, user: CurrentUser): Promise<void> {
    try {
      const tasks: Promise<void>[] = [
        AsyncStorage.setItem(AUTH_TOKEN_KEY, token),
        AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user)),
      ];
      if (user.hotelId) {
        tasks.push(AsyncStorage.setItem(SELECTED_HOTEL_ID_KEY, user.hotelId));
      }
      await Promise.all(tasks);
      apiClient.setAuth(token, user);
      if (__DEV__) {
        console.log(`[AUTH SERVICE] ✓ Session persisted for user "${user.email}" (${user.role})`);
      }
    } catch (err) {
      console.error('[AUTH SERVICE] ✗ Failed to persist session to AsyncStorage:', err);
    }
  }

  /**
   * Retrieve persisted session from AsyncStorage on app boot
   */
  public async getStoredSession(): Promise<StoredSession> {
    try {
      const [token, userJson, selectedHotelId] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(CURRENT_USER_KEY),
        AsyncStorage.getItem(SELECTED_HOTEL_ID_KEY),
      ]);

      let user: CurrentUser | null = null;
      if (userJson) {
        try {
          user = JSON.parse(userJson) as CurrentUser;
        } catch {
          user = null;
        }
      }

      if (token && user) {
        apiClient.setAuth(token, user);
        if (__DEV__) {
          console.log(`[AUTH SERVICE] ✓ Restored active session for "${user.email}" (${user.role})`);
        }
      }

      return { token, user, selectedHotelId };
    } catch (err) {
      console.error('[AUTH SERVICE] ✗ Failed to load session from AsyncStorage:', err);
      return { token: null, user: null, selectedHotelId: null };
    }
  }

  /**
   * Clear session on logout
   */
  public async clearSession(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        AsyncStorage.removeItem(CURRENT_USER_KEY),
        AsyncStorage.removeItem(SELECTED_HOTEL_ID_KEY),
      ]);
      apiClient.setAuth(null, null);
      if (__DEV__) {
        console.log('[AUTH SERVICE] ✓ Session cleared from AsyncStorage');
      }
    } catch (err) {
      console.error('[AUTH SERVICE] ✗ Failed to clear session from AsyncStorage:', err);
    }
  }

  /**
   * Update persisted selected hotel ID for Admin/Manager
   */
  public async saveSelectedHotelId(hotelId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(SELECTED_HOTEL_ID_KEY, hotelId);
    } catch (err) {
      console.error('[AUTH SERVICE] ✗ Failed to save selectedHotelId:', err);
    }
  }
}

export const authService = new AuthService();
