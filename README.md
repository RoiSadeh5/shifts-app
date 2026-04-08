# שכ״ש – Shift Pay Calculator

Hebrew (RTL) PWA for tracking work shifts and calculating gross/net salary.

## App Store (iOS)

The app is wrapped with **Capacitor** for native iOS distribution. See [APP_STORE.md](APP_STORE.md) for the full submission guide.

```bash
npm run cap:sync   # Build + sync to iOS
npm run ios       # Open in Xcode
```

## File Structure

| Path | Purpose |
|---|---|
| `src/logic/salaryEngine.js` | **Salary engine** – shift pay, tax brackets, deductions, annual summary. Pure math. |
| `src/store.js` | **Data store** – IndexedDB + localStorage for shifts, history, settings, savings. Export/import. |
| `src/utils.js` | **Utils** – animations (countUp, staggerEntrance), notifications, payment date helpers. |
| `src/app.js` | **Main app** – shared state, navigation, init. |
| `src/components/Dashboard.js` | Dashboard – monthly summary, deductions, shift list, payslip. |
| `src/components/Charts.js` | Charts – monthly bar, donut, trend (Chart.js). |
| `src/components/Savings.js` | Savings – pension, study fund, general savings, projections. |
| `src/components/Calendar.js` | Calendar – month grid, swipe, day detail. |
| `src/components/ShiftForm.js` | Add shift form – type, date range, result. |
| `src/components/Templates.js` | Shift templates – apply to week/month. |
| `src/components/AnnualSummary.js` | Annual – Form 106, history. |
| `src/components/settings.js` | Settings – rates, toggles, backup. |
| `src/components/PdfExport.js` | PDF export. |
| `src/components/ShareImage.js` | Share image (Web Share). |
| `shiftCalculator.js` | Node.js compatibility wrapper – re-exports from `src/logic/salaryEngine.js` for tests & demo. |
| `index.html` | UI layout + CSS + script imports. |
| `sw.js` | Service worker – network-first with offline fallback. |
| `manifest.json` | PWA manifest for "Add to Home Screen". |
| `icon-192.png` / `icon-512.png` | App icons. |
| `test-regression.js` | Node.js regression tests (36 assertions across 11 test groups). |
| `demo.js` | Demo script for quick shift calculations. |

## Run Locally

```bash
cd shifts-app
npm run dev
# or: python3 -m http.server 8000
```
Open `http://localhost:8000` on your phone/browser.

## Run Tests

```bash
npm test
# or: node test-regression.js
```

## Data Storage

The app is **local-only** (no cloud account or sync). Shifts and settings are stored on the device via **localStorage** and **IndexedDB**. Use **Export** in Settings for a JSON backup.

Core keys in **localStorage** include:
- `shifter_shifts` – array of shift objects (type, date, result, etc.)
- `shifter_settings` – user rates + deduction toggles
- `shifter_history` – past paycheck data for annual summary

Data persists across page refreshes, browser restarts, and PWA reopens.
Use **Export** (Settings tab) to back up to a JSON file.

---

כל הזכויות שמורות ל-Roi Sadeh - מוענק באהבה לכל עובדי השכ״ש
