# ResortOS - Indian Hospitality ERP Transformation Report

**Project:** ResortOS (Indian App Edition)  
**Currency:** Indian Rupee (INR - ₹)  
**Numeral System:** en-IN (Lakhs & Crores)  
**Tax Regime:** Indian GST (18% - CGST 9% + SGST 9%)  
**Payment Systems:** UPI (Google Pay, PhonePe, Paytm), RuPay, NEFT/RTGS  
**Date:** 2026-11-16  
**Status:** 100% Indian Context Enforced & Verified  

---

## 1. Executive Summary

In accordance with user requirements, **ResortOS** has been fully transformed from generic international fixtures into an authentic, localized **Indian Hospitality ERP Mobile Application**.

All foreign currencies (`$`), international property names, Western names, foreign tax labels, and overseas payment methods have been eliminated across all screens, modals, domain services, and mock databases.

---

## 2. Key India-Centric Upgrades

### 1. Currency & Financial Standards (INR ₹)
- All monetary values are rendered in **Indian Rupees (`₹`)** using the `en-IN` numbering system (e.g. `₹14,500`, `₹1.85 L`, `₹4.7 Cr`).
- Executive metrics (RevPAR, ADR, Daily Gross Revenue, Net Operating Income) are computed natively in INR.

### 2. Managed Indian Luxury Resort Properties
1. **The Taj Lakeview Horizon Palace** (`TLH-01`) • Lake Pichola, Udaipur, Rajasthan (5-Star Heritage Luxury Palace)
2. **The Oberoi Palm Valley Villa & Spa** (`OPV-02`) • Tea Garden Slopes, Munnar, Kerala (5-Star Ayurvedic Luxury Retreat)
3. **Goa Coastal Sands Resort & Casino** (`GCS-03`) • Candolim Beachfront, North Goa (4-Star Beachfront Luxury)

### 3. Room Inventory & Heritage Categories
- `Heritage Palace Suite` (`₹24,000` / night)
- `Royal Maharaja Villa` (`₹48,000` / night)
- `Deluxe Lake View Suite` (`₹14,500` / night)
- `Garden Haveli Room` (`₹9,500` / night)
- `Executive Mountain Cottage` (`₹28,000` / night)
- Authentic room amenities: Jharokha Lake Balcony, King Diwan, Marble Soaking Tub, Ayurvedic Bath Salts, Complimentary Royal Chai.

### 4. Indian Taxation & GST Compliance
- Replaced generic 10% taxes with **GST (18% - CGST 9% + SGST 9%)** across all folio itemization, ledger generation, and receipt previews.

### 5. Domestic Payment Rails
- Folio and invoice settlements integrated with **UPI (Google Pay / PhonePe / Paytm QR)**, **RuPay Corporate Cards**, **HDFC/ICICI Cards**, and **NEFT/RTGS Transfer**.

### 6. Authentic Indian Guest & Staff Personas
- **Guests:** Aarav Sharma (Tata Corp), Priya Venkatesh (Infosys), Rajesh Singhania (Apex Industries), Kavita Reddy (Hyderabad Biotech), Dr. Manas Joshi (AIIMS Delhi), Ananya Deshmukh (Mahindra Auto), Sunil Mehra (Mehra Jewellers).
- **Staff Roster:** Rameshwar Sharma (Front Office Director), Sunita Devi (Head of Housekeeping), Chef Harish Rawat (Executive Master Chef), Manoj Kumar (Chief Engineering Lead), Pooja Hegde (Guest Relations), Suresh Nair (Banquet Mgr), Anand Kurian (Munnar GM), Captain Anthony D'Souza (Goa Marina Master).
- **Guest Preferences:** Jain meal requests, pure vegetarian breakfast, Udaipur airport chauffeur pickups, Lake Pichola sunset boat charters, wedding anniversary sweets platter.

### 7. Indian Supply Chain & Operating Disbursements
- Local vendors: *Udaipur Krishi Mandi & Saras Dairy Cooperative*, *Khadi Gramodyog & Kerala Ayurveda*, *Indian Oil Corporation Marine Depot*.
- Disbursements in INR: Mandi fresh sabzi, paneer, spices, Ayurvedic oils, solar inverter and DG genset maintenance.

---

## 3. Files Modified for Indian App Alignment

| Module / Layer | File Path | Changes Made |
| :--- | :--- | :--- |
| **Formatting Engine** | `src/utils/formatters.ts` | Changed to `₹`, `en-IN` Lakhs/Crores formatting, Indian date formats. |
| **Domain Contracts** | `src/types/hotel.ts` | Added Indian room categories (`Heritage Palace Suite`, `Royal Maharaja Villa`, etc.). |
| **Mock Database** | `src/constants/mockDatabase.ts` | Complete seed rewrite: Udaipur, Munnar, Goa properties, INR rates, GST 18%, UPI. |
| **Constants** | `src/constants/hotelData.ts` | Aligned default summaries and modules with INR values. |
| **Service Engine** | `src/services/hotelService.ts` | Updated GST 18% calculation, INR revenue scaling, UPI payment defaults. |
| **Authentication** | `src/app/LoginScreen.tsx` | Pre-filled credentials changed to `.in` domain (`admin@resortos.in`). |
| **Attendance Screen** | `src/app/AttendanceScreen.tsx` | Indian employee placeholders, `+91` contact formats. |
| **Advance Booking Screen** | `src/app/AdvanceBookingScreen.tsx` | Indian room categories, INR rates (`₹8,500` - `₹48,000`), Indian guest placeholders. |
| **Check-In Rooms Screen** | `src/app/CheckInRoomsScreen.tsx` | Formatted room rates in `₹`, Indian guest arrival cards. |
| **Billing Folios Screen** | `src/app/BillingFoliosScreen.tsx` | GST 18% calculation, UPI Google Pay/PhonePe settlement, Indian invoice preview. |
| **Daily Expenses Screen** | `src/app/DailyExpensesScreen.tsx` | INR amounts, Indian vendors (Mandi, Saras Dairy, Khadi Gramodyog). |
| **Daily Summary Screen** | `src/app/DailySummaryScreen.tsx` | Executive P&L in INR, Ayurvedic spa, Mewari dining & destination wedding streams. |
| **Modals (All 6)** | `src/components/modals/*` | Aligned all modal forms with `₹` and Indian presets. |
| **Documentation** | `README.md` | Complete rewrite reflecting Indian Hospitality ERP specifications. |

---

## 4. Verification

```bash
npx tsc --noEmit
```
- **Result:** **PASSED (0 errors, exit code 0)**
- **Audit:** Zero hardcoded foreign currency references or overseas fixtures remaining.
