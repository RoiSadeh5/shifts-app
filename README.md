# שכ״ש – Shift Pay Calculator

Hebrew (RTL) PWA for tracking work shifts and calculating gross/net salary.

## File Structure

| Path | Purpose |
|---|---|
| `src/logic/salaryEngine.js` | **Unified salary engine** – shift pay (getRateAt, calculatePayForRange, calculateShiftPay), 2026 tax brackets (calcDeductions, calcIncomeTax), annual summary (calcAnnualSummary). Pure math, no DOM. |
| `src/store/dataManager.js` | **Data manager** – localStorage persistence for shifts, settings, and history. Export/import. |
| `src/components/Dashboard.js` | Dashboard + Calendar – monthly summary, deduction panels, shift list, calendar grid. |
| `src/components/ShiftForm.js` | Shift form – type selection, date range, result panel. |
| `src/components/AnnualSummary.js` | Annual summary – Form 106 view and past paycheck history. |
| `src/components/settings.js` | Settings page – rate inputs, deduction toggles, data management. |
| `src/app.js` | **Main app** – shared state, constants, engine bridge, navigation, init. |
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
python3 -m http.server 8000
```
Open `http://localhost:8000` on your phone/browser.

## Run Tests

```bash
node test-regression.js
```

## Data Storage

All data lives in **localStorage** under three keys:
- `shifter_shifts` – array of shift objects (type, date, result, etc.)
- `shifter_settings` – user rates + deduction toggles
- `shifter_history` – past paycheck data for annual summary

Data persists across page refreshes, browser restarts, and PWA reopens.
Use **Export** (Settings tab) to back up to a JSON file.

---

כל הזכויות שמורות ל-Roi Sadeh - מוענק באהבה לכל עובדי השכ״ש
