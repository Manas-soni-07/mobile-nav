# ResortOS - Mobile Application

[![Expo SDK 58](https://img.shields.io/badge/Expo-SDK%2058-000000.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.88.1-61DAFB.svg)](https://reactnative.dev)
[![React 19](https://img.shields.io/badge/React-19.3.0-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0%20Strict-3178C6.svg)](https://www.typescriptlang.org)

**ResortOS** is an executive-grade mobile hospitality management ERP built for multi-property luxury resorts. Engineered with Expo SDK 58, React Native 0.88, and strict TypeScript, the application provides an operational suite for corporate resort directors and on-property general managers.

---

## 🏨 Managed Resort Properties

ResortOS natively models and manages multi-resort portfolios:
1. **Grand Azure Horizon Resort** (`AZR-01`) • 120 Rooms • Emerald Bay, Coastal Shore • 5-Star Luxury
2. **The Royal Palm Villa** (`RPV-02`) • 80 Rooms • Palm Valley Highlands • 5-Star Luxury
3. **Seaside Palace Resort** (`SPR-03`) • 60 Rooms • Azure Cove Marina • 4-Star Luxury

---

## 🌟 Key Features

### 1. Role-Based Access Architecture
- **Administrator Portal:** Multi-property switching, consolidated real-time KPI grids, executive P&L statement, RevPAR & ADR financial tracking, and full organizational controls.
- **Hotel Manager Portal:** Assigned single-property console, room occupancy status, front-desk operational queue, shift handover notices, and operational modules.

### 2. Six Dedicated Operational Modules & Screens
- **Staff Attendance (`AttendanceScreen`):** Searchable roster across 7 departments and 4 shifts. Tap-to-cycle attendance status (`present`, `on_leave`, `absent`, `late`) and add new employees.
- **Advance Booking (`AdvanceBookingScreen`):** Reservation pipeline ledger with status filtering (`confirmed`, `checked_in`, `checked_out`, `cancelled`). Complete reservation creation engine with dynamic room rate calculation and deposit tracking.
- **Check-In & Room Inventory (`CheckInRoomsScreen`):** Dual-tab operations:
  - *Today's Arrivals:* Real-time guest arrivals queue, clean room assignment, and one-tap Check-In / Checkout.
  - *Room Inventory Grid:* Status filters (`available`, `occupied`, `cleaning`, `maintenance`), room details, and tap-to-cycle housekeeping state.
- **Billing & Folios (`BillingFoliosScreen`):** Guest folio ledger, open vs. settled filters, expandable itemized line-item charge addition (Dining, Spa, Minibar, Service), card/cash settlement, and official folio receipt view.
- **Daily Expenses (`DailyExpensesScreen`):** Categorized operational disbursements audit (F&B Provisions, Housekeeping, Utilities, Payroll, Operations) and immediate Net Operating Income (NOI) recalculation.
- **Daily Financial Summary (`DailySummaryScreen` - Admin Only):** Executive P&L statement, RevPAR, ADR, Gross Revenue, department revenue center contributions, and state reset utility.

### 3. Design System & Iconography
- Executive white/smoke palette with luxury navy (`#0F2942`) and accent blue (`#2563EB`).
- Pure React Native Lucide-style vector iconography with zero external dependency overhead.
- Fluid responsive 2-column KPI grids and horizontal filter pill carousels.

---

## 📁 Project Structure

```
F:\mobile-ap\
├── assets/                     # App icons, splash screens, and adaptive assets
├── src/
│   ├── app/                    # 11 Application Screens & Main Navigation Router
│   │   ├── SplashScreen.tsx
│   │   ├── RoleSelectionScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── AdminDashboardScreen.tsx
│   │   ├── ManagerDashboardScreen.tsx
│   │   ├── AttendanceScreen.tsx
│   │   ├── AdvanceBookingScreen.tsx
│   │   ├── CheckInRoomsScreen.tsx
│   │   ├── BillingFoliosScreen.tsx
│   │   ├── DailyExpensesScreen.tsx
│   │   ├── DailySummaryScreen.tsx
│   │   └── index.tsx           # MainAppNavigator
│   ├── components/             # Reusable UI & Dashboard Components
│   │   ├── common/             # Icon, Badge, Button, Input, Card, Header, Loading, EmptyState
│   │   ├── dashboard/          # KPICard, ModuleItem
│   │   └── modals/             # Quick-action modal sheets
│   ├── constants/              # Multi-property mock database seeds & fixtures
│   ├── context/                # HotelContext reactive state management container
│   ├── hooks/                  # useNavigation & useHotel hooks
│   ├── services/               # hotelService business logic & mockStorage repository
│   ├── theme/                  # Design tokens (colors, typography, spacing, shadows)
│   ├── types/                  # TypeScript domain models and navigation types
│   └── utils/                  # Currency, percentage, and date formatting utilities
├── app.json                    # Expo SDK 58 application manifest
├── App.tsx                     # Root component wrapping HotelProvider & NavigationProvider
├── package.json
└── tsconfig.json               # TypeScript strict configuration with @/* path aliases
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- Android device with **Expo Go** installed (available on Google Play Store) or an Android Emulator / iOS Simulator.

### 1. Installation
```bash
npm install
```

### 2. Starting the Development Server
To launch the Expo bundler on Windows:
```powershell
$env:EXPO_NO_TELEMETRY=1; npx expo start
```
*Or standard command:*
```bash
npx expo start
```

### 3. Running on Android Expo Go
- Scan the QR code displayed in the terminal with the **Expo Go** app on your Android device (ensure both devices are on the same local Wi-Fi or run with `--tunnel`).
- Alternatively, launch directly on an Android emulator:
  ```bash
  npx expo start --android
  ```

---

## 🧪 Type Checking & Verification

Run strict TypeScript verification before submitting code:
```bash
npx tsc --noEmit
```
**Current Status:** `0 errors` (Strict mode fully enforced).

---

## 📦 Building with EAS

To create production binaries via Expo Application Services (EAS):
```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo
eas login

# Build for Android (APK or AAB)
eas build --platform android --profile preview

# Build for iOS
eas build --platform ios --profile preview
```

---

## 📄 License
This project is licensed under the MIT License.
