# ResortOS - Indian Hospitality Management Mobile App

[![Expo SDK 58](https://img.shields.io/badge/Expo-SDK%2058-000000.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.88.1-61DAFB.svg)](https://reactnative.dev)
[![React 19](https://img.shields.io/badge/React-19.3.0-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0%20Strict-3178C6.svg)](https://www.typescriptlang.org)
[![Indian Rupee](https://img.shields.io/badge/Currency-INR%20(%E2%82%B9)-059669.svg)](https://www.rbi.org.in)

**ResortOS India** is a luxury mobile hospitality management ERP built specifically for Indian resorts, heritage palaces, backwater sanctuaries, and luxury coastal properties. Engineered with Expo SDK 58, React Native 0.88, and strict TypeScript, the application provides an enterprise operational suite customized for Indian hospitality standards, GST compliance, and domestic payment rails (UPI, RuPay, Net Banking).

---

## 🏨 Managed Indian Resort Properties

ResortOS natively models and manages premier Indian luxury properties:
1. **The Taj Lakeview Horizon Palace** (`TLH-01`) • 120 Rooms • Lake Pichola, Udaipur, Rajasthan (5-Star Heritage Luxury)
2. **The Oberoi Palm Valley Villa & Spa** (`OPV-02`) • 80 Rooms • Tea Garden Slopes, Munnar, Kerala (5-Star Ayurvedic Luxury)
3. **Goa Coastal Sands Resort & Casino** (`GCS-03`) • 60 Rooms • Candolim Beachfront, North Goa (4-Star Coastal Luxury)

---

## 🇮🇳 India-Specific App Features

1. **Indian Currency & Numeral Scale (INR ₹):**
   - Full formatting in Indian Rupees (`₹`), with the `en-IN` numbering system (Thousands, Lakhs `L`, and Crores `Cr`).
   - Dynamic Average Daily Rate (ADR) and Revenue Per Available Room (RevPAR) calculated in INR.
2. **Indian Taxation & Compliance:**
   - Automated Goods & Services Tax (**GST 18% - CGST 9% + SGST 9%**) calculation on luxury accommodations, royal dining, and wellness folios.
3. **Domestic Payment Rails & Invoicing:**
   - One-tap folio settlement via **UPI (Google Pay, PhonePe, Paytm QR)**, **RuPay Corporate Cards**, **HDFC/ICICI Cards**, and **NEFT/RTGS**.
4. **Indian Guest & Staff Personas:**
   - Curated rosters, department heads, and guest stays reflecting authentic Indian hospitality traditions (Jharokha lakefront balconies, Ayurvedic wellness therapies, royal Mewari feasts, and pure vegetarian / Jain culinary preferences).

---

## 🌟 Core Modules & Capabilities

### 1. Role-Based Access Architecture
- **Administrator Portal:** Multi-property switching across Udaipur, Munnar, and Goa, consolidated real-time KPI grids, executive P&L statement, RevPAR & ADR financial tracking in INR, and full organizational controls.
- **Hotel Manager Portal:** Assigned single-resort console, room occupancy status, front-desk operational queue, shift handover notices, and active operational modules.

### 2. Dedicated Operational Modules & Screens
- **Staff Attendance (`AttendanceScreen`):** Searchable roster across 7 departments and 4 shifts with Indian contact details (`+91`). Tap-to-cycle attendance status (`present`, `on_leave`, `absent`, `late`) and *Add Employee* modal form.
- **Advance Booking (`AdvanceBookingScreen`):** Advance reservation pipeline with status filtering (`confirmed`, `checked_in`, `checked_out`, `cancelled`). Complete reservation creation engine with dynamic room rate calculation (`₹8,500` to `₹48,000` / night) and deposit tracking.
- **Check-In, Rooms & Guest KYC (`CheckInRoomsScreen`):** Dual-tab operations:
  - *Today's Arrivals & KYC Verification:* Real-time guest arrivals queue, clean room assignment, and official **Indian Ministry / Local Police Guest KYC Portal** supporting Aadhaar Card, Passport, Driving License, and Voter ID verification with domicile city logging.
  - *Room Inventory Grid:* Status filters (`available`, `occupied`, `cleaning`, `maintenance`), room details with Indian categories (`Heritage Palace Suite`, `Deluxe Lake View Suite`, `Royal Maharaja Villa`, `Garden Haveli Room`), and tap-to-cycle housekeeping state.
- **Banquets & Destination Weddings (`BanquetEventsScreen` - Phase 5):**
  - High-value destination wedding management for Udaipur royal palace lawns, lakefront courtyards, and luxury ballrooms.
  - Per-plate catering calculators (`₹2,200` to `₹3,500`/plate), guest pack forecasting (100–500+ Pax), Mandap and Marigold decor package tracking, advance deposit accounting, and live setup/gala workflow transitions.
- **In-Room Dining & Digital KOT (`InRoomDiningScreen` - Phase 5):**
  - Real-time Kitchen Order Ticket (KOT) workflow: `received` ➔ `in_kitchen` ➔ `out_for_delivery` ➔ `delivered`.
  - Rich Indian culinary catalog: Paneer Tikka Angaar (`₹650`), Dal Baati Churma Thali (`₹850`), Hyderabadi Dum Biryani (`₹750`), Royal Shahi Tukda (`₹420`), Masala Chai & Onion Pakoras (`₹320`), and specialty dietary instructions (Jain, non-spicy).
  - Automated 18% GST calculation (CGST 9% + SGST 9%) and direct synchronization into the active guest's room folio invoice.
- **Housekeeping & Maintenance Dispatch (`HousekeepingDispatchScreen` - Phase 5):**
  - Rapid service request dispatch across Turnover Cleaning, Deep Sanitization, Turndown & Aroma Service, Extra Towels, Ayurvedic Lemongrass Restock, and AC Chiller Maintenance.
  - Urgency priority triage (`urgent`, `high`, `normal`), duty attendant allocation, and inspection sign-offs.
- **Ayurvedic Spa & Wellness Retreat (`AyurvedicSpaScreen` - Phase 6):**
  - Traditional Indian therapies: Abhyanga Full-Body Herbal Therapy (`₹4,500`), Shirodhara Mind Therapy (`₹5,200`), Royal Saffron & Sandalwood Body Polish (`₹6,500`), Kumkumadi Vedic Facial (`₹3,800`), Sunrise Lakefront Yoga (`₹1,500`).
  - Vaidya & therapist pavilion assignment, Dosha health care notes, and automatic 18% GST folio posting.
- **Royal Concierge & Heritage Tours (`ConciergeDispatchScreen` - Phase 6):**
  - Airport chauffeur dispatch (Maharana Pratap Airport / Dabolim / Cochin) with vehicle number and flight tracking.
  - Signature Indian experiences: Lake Pichola Royal Sunset Boat Charter, Munnar Organic Tea & Spice Plantation Walk, Old Goa Catamaran Cruise.
  - Chauffeur and guide tracking with automatic folio charges under transport.
- **Shift Handover & Manager Night Audit (`ShiftHandoverScreen` - Phase 6):**
  - Formal managerial handover log between shifts (Morning, Afternoon, Night).
  - Physical front-desk cash drawer count, real-time UPI settlements reconciliation (Google Pay / PhonePe), and VIP guest alert briefings.
- **TiDB Cloud Database & Synchronization Manager (`CloudSyncScreen` - Phase 7):**
  - Live distributed MySQL database synchronization with **TiDB Cloud Serverless** cluster in AWS Tokyo (`ap-northeast-1`).
  - Real-time audit of **28 Cloud Database Tables** with ping latency monitor (`~42ms`), TLS/SSL encryption verification, and one-tap manual sync triggers.
  - Accompanied by a lightweight Node.js Express REST API server (`server/`) with connection pooling.
- **Billing & Folios (`BillingFoliosScreen`):** Guest folio ledger, open vs. settled filters, expandable itemized line-item charges (Dining, Ayurvedic Spa, Minibar, Airport Transfer), GST 18% calculation, UPI settlement, and official folio receipt view.
- **Daily Expenses (`DailyExpensesScreen`):** Categorized operational disbursements audit (Mandi Produce & Dairy, Khadi Linens & Ayurvedic Oils, Solar & Genset Maintenance, Staff Payroll) and immediate Net Operating Income (NOI) recalculation.
- **Daily Financial Summary (`DailySummaryScreen` - Admin Only):** Executive P&L statement in INR, RevPAR, ADR, Gross Revenue, department revenue center contributions (Palace Accommodations, Royal Dining, Ayurvedic Spa, Banquets & Destination Weddings), and state reset utility.

---

## 📁 Project Structure

```
F:\mobile-ap\
├── assets/                     # App icons, splash screens, and adaptive assets
├── server/                     # TiDB Cloud Express REST API Server (Phase 7)
│   ├── routes/
│   │   └── api.js              # REST endpoints for mobile app sync
│   ├── db.js                   # TiDB Cloud MySQL connection pool with SSL
│   └── index.js                # Express app listener (Port 5000)
├── scripts/                    # Database migrations & verification test probes
│   ├── setupTiDBIndianSchema.js# Schema creator & Indian data seed script
│   └── testServerEndpoints.js  # Automated endpoint verification probe
├── src/
│   ├── app/                    # 18 Application Screens & Main Navigation Router
│   │   ├── SplashScreen.tsx
│   │   ├── RoleSelectionScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── AdminDashboardScreen.tsx
│   │   ├── ManagerDashboardScreen.tsx
│   │   ├── AttendanceScreen.tsx
│   │   ├── AdvanceBookingScreen.tsx
│   │   ├── CheckInRoomsScreen.tsx      # Check-In & Govt KYC Portal
│   │   ├── BanquetEventsScreen.tsx     # Destination Weddings & Banquets (Phase 5)
│   │   ├── InRoomDiningScreen.tsx      # Digital KOT & Folio Sync (Phase 5)
│   │   ├── HousekeepingDispatchScreen.tsx # Housekeeping & Maintenance (Phase 5)
│   │   ├── AyurvedicSpaScreen.tsx      # Ayurvedic Wellness & Therapies (Phase 6)
│   │   ├── ConciergeDispatchScreen.tsx # Royal Concierge & Chauffeur (Phase 6)
│   │   ├── ShiftHandoverScreen.tsx     # Manager Shift Handover & Audit (Phase 6)
│   │   ├── CloudSyncScreen.tsx         # TiDB Cloud Database & Sync (Phase 7)
│   │   ├── BillingFoliosScreen.tsx
│   │   ├── DailyExpensesScreen.tsx
│   │   ├── DailySummaryScreen.tsx
│   │   └── index.tsx           # MainAppNavigator
│   ├── components/             # Reusable UI & Dashboard Components
│   │   ├── common/             # Icon, Badge, Button, Input, Card, Header, Loading, EmptyState
│   │   ├── dashboard/          # KPICard, ModuleItem
│   │   └── modals/             # Quick-action modal sheets
│   ├── constants/              # Multi-property Indian mock database seeds & fixtures
│   ├── context/                # HotelContext reactive state management container
│   ├── hooks/                  # useNavigation & useHotel hooks
│   ├── services/               # hotelService business logic & mockStorage repository
│   ├── theme/                  # Design tokens (colors, typography, spacing, shadows)
│   ├── types/                  # TypeScript domain models and navigation types
│   └── utils/                  # Currency (₹ INR), percentage, and date formatting utilities
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

### 3. Running on Android Expo Go
- Scan the QR code displayed in the terminal with the **Expo Go** app on your Android device (ensure both devices are on the same local Wi-Fi or run with `--tunnel`).
- Alternatively, launch directly on an Android emulator:
  ```bash
  npx expo start --android
  ```

---

## 🧪 Type Checking & Verification

Run strict TypeScript verification:
```bash
npx tsc --noEmit
```
**Current Status:** `0 errors` (Strict mode fully enforced).

---

## 📦 Building with EAS

To create production Android APK / AAB or iOS builds via EAS:
```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo
eas login

# Build for Android (APK)
eas build --platform android --profile preview
```

---

## 📄 License
This project is licensed under the MIT License.
