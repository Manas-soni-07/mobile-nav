/**
 * ResortOS - Centralized API & Networking Configuration
 *
 * Dynamically resolves the backend API URL for:
 * 1. Physical Android/iOS mobile devices over local Wi-Fi.
 * 2. Android Emulator (10.0.2.2).
 * 3. iOS Simulator / Web (localhost).
 * 4. Production HTTPS deployments.
 *
 * No duplicate hardcoded URLs across the codebase.
 */

import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

export type NetworkSource = 'EXPO_PUBLIC' | 'METRO_AUTO_DETECT' | 'LAN_FALLBACK' | 'EMULATOR' | 'PRODUCTION';

export interface NetworkConfig {
  baseUrl: string;
  host: string;
  port: number;
  isProduction: boolean;
  source: NetworkSource;
}

// Default development configuration
export const DEFAULT_PORT = 5000;
export const DEFAULT_DEV_LAN_IP = '192.168.1.5'; // Current development machine local IPv4 address
export const PRODUCTION_API_URL = 'https://api.resortos.com/api';

class ApiConfigurationManager {
  private runtimeBaseUrlOverride: string | null = null;

  /**
   * Automatically resolve the development machine's IP address dynamically.
   * Priority:
   * 1. Expo Constants hostUri (most reliable on physical Android/iOS devices running Expo Go / Dev Client).
   * 2. React Native SourceCode TurboModule scriptURL.
   * 3. Legacy NativeModules SourceCode scriptURL.
   */
  private getMetroHost(): string | null {
    try {
      // 1. Expo Constants hostUri (e.g., "192.168.1.5:8081")
      const expoHostUri =
        Constants?.expoConfig?.hostUri ||
        (Constants as any)?.manifest?.debuggerHost ||
        (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

      if (expoHostUri && typeof expoHostUri === 'string') {
        const host = expoHostUri.split(':')[0];
        if (host && host !== 'localhost' && host !== '127.0.0.1') {
          return host;
        }
      }

      // 2. React Native TurboModules & NativeModules SourceCode
      const sourceCodeModule = (NativeModules as any)?.SourceCode;
      const scriptURL: string | undefined =
        sourceCodeModule?.getConstants?.()?.scriptURL ||
        sourceCodeModule?.scriptURL;

      if (scriptURL && typeof scriptURL === 'string') {
        const afterProtocol = scriptURL.split('://')[1];
        if (afterProtocol) {
          const hostPort = afterProtocol.split('/')[0];
          const host = hostPort.split(':')[0];
          if (host && host !== 'localhost' && host !== '127.0.0.1') {
            return host;
          }
        }
      }
    } catch {
      // Fall through to fallback mechanisms
    }
    return null;
  }

  /**
   * Resolve full configuration based on environment and runtime device
   */
  public getConfig(): NetworkConfig {
    const isProd = !__DEV__;

    // 1. Runtime override (e.g. user manually changed URL in CloudSync screen)
    if (this.runtimeBaseUrlOverride) {
      return {
        baseUrl: this.runtimeBaseUrlOverride,
        host: 'custom',
        port: DEFAULT_PORT,
        isProduction: isProd,
        source: 'EXPO_PUBLIC',
      };
    }

    // 2. Production environment
    if (isProd) {
      const prodUrl = process.env.EXPO_PUBLIC_API_URL || PRODUCTION_API_URL;
      return {
        baseUrl: prodUrl.replace(/\/+$/, ''),
        host: 'production',
        port: 443,
        isProduction: true,
        source: 'PRODUCTION',
      };
    }

    // 3. Dynamic Metro host detection in development on native physical devices
    // On physical mobile devices, the Metro host is guaranteed to match the host PC's current local Wi-Fi IP.
    if (__DEV__ && Platform.OS !== 'web') {
      const metroHost = this.getMetroHost();
      if (metroHost) {
        return {
          baseUrl: `http://${metroHost}:${DEFAULT_PORT}/api`,
          host: metroHost,
          port: DEFAULT_PORT,
          isProduction: false,
          source: 'METRO_AUTO_DETECT',
        };
      }
    }

    // 4. Explicit environment variable (EXPO_PUBLIC_API_URL in .env)
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl && envUrl.trim().length > 0) {
      let cleanUrl = envUrl.trim().replace(/\/+$/, '');
      if (!cleanUrl.endsWith('/api')) {
        cleanUrl = `${cleanUrl}/api`;
      }
      return {
        baseUrl: cleanUrl,
        host: 'env',
        port: DEFAULT_PORT,
        isProduction: false,
        source: 'EXPO_PUBLIC',
      };
    }

    // 5. Web Browser host detection
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
      const webHost = window.location.hostname || 'localhost';
      return {
        baseUrl: `http://${webHost}:${DEFAULT_PORT}/api`,
        host: webHost,
        port: DEFAULT_PORT,
        isProduction: false,
        source: 'METRO_AUTO_DETECT',
      };
    }

    // 6. Physical Android Device & Local LAN fallback
    if (Platform.OS === 'android') {
      return {
        baseUrl: `http://${DEFAULT_DEV_LAN_IP}:${DEFAULT_PORT}/api`,
        host: DEFAULT_DEV_LAN_IP,
        port: DEFAULT_PORT,
        isProduction: false,
        source: 'LAN_FALLBACK',
      };
    }

    // 7. General fallback
    return {
      baseUrl: `http://localhost:${DEFAULT_PORT}/api`,
      host: 'localhost',
      port: DEFAULT_PORT,
      isProduction: false,
      source: 'LAN_FALLBACK',
    };
  }

  /**
   * Returns the resolved API Base URL (e.g., http://192.168.1.3:5000/api)
   */
  public getBaseUrl(): string {
    return this.getConfig().baseUrl;
  }

  /**
   * Set a runtime override URL
   */
  public setBaseUrl(newUrl: string): void {
    this.runtimeBaseUrlOverride = newUrl.trim().replace(/\/+$/, '');
  }

  /**
   * Reset runtime override to auto-detected default
   */
  public resetToDefault(): void {
    this.runtimeBaseUrlOverride = null;
  }
}

export const apiConfig = new ApiConfigurationManager();
export const API_BASE_URL = apiConfig.getBaseUrl();
