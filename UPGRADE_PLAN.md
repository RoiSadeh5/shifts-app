# שכ״ש Upgrade Plan

PWA salary calculator for Israeli government shift workers. Pay is "shotef+30" (January salary on March 1st).

**Status: All phases implemented ✓**

---

## Phase 0: CSS Modularization (Foundation)

**Why first:** Every subsequent phase adds CSS. Splitting now prevents conflicts.

**New files (5):**
- `css/variables.css` – Custom properties (colors, radius, safe-area, font)
- `css/base.css` – Reset, body, header, tab-bar, page containers, typography, scrollbar
- `css/components.css` – Cards, buttons, forms, toggles, badges, shift-items, modals, toasts
- `css/pages.css` – Dashboard hero/stats/deductions, calendar, annual/F106, payslip modal, settings
- `css/animations.css` – @keyframes, transitions, collapse/expand

**Changes:**
- `index.html` – Remove `<style>` block, add 5 `<link rel="stylesheet">` tags
- `sw.js` – Add 5 CSS files to STATIC_ASSETS, bump cache version

**Verify:** All 5 tabs identical. RTL intact. Offline works.

---

## Phase 1: IndexedDB Migration (Data Foundation)

**Why:** Charts need historical queries. localStorage capped at 5MB.

**New file:**
- `src/store/db.js` – IndexedDB wrapper (stores: shifts, history, templates)

**Changes:**
- `src/store/dataManager.js` – Migration: localStorage → IDB, backward compat
- `src/app.js` – init() awaits dbReady before recalcAll()
- `sw.js` – Cache db.js, bump version

**Verify:** Data migrates. Export/import works. Regression tests pass.

---

## Phase 2: Animations & Micro-interactions

**New file:**
- `src/utils/animate.js` – countUp, staggerEntrance, haptic, transitionPage

**Changes:**
- `css/animations.css` – New keyframes
- `Dashboard.js` – countUp on hero, stagger on shift-items
- `app.js` – switchTab uses transitionPage, haptic on buttons

**Verify:** Tab transitions smooth. Numbers count up. No jank.

---

## Phase 3: Visual Charts

**Library:** Chart.js 4.4.7 (~70KB) via CDN

**New file:**
- `src/components/Charts.js` – Monthly bar, shift-type donut, net trend line

**Changes:**
- `index.html` – Chart.js CDN, 3 `<canvas>`, "Show charts" toggle in Settings
- `Dashboard.js` – Call chart functions if toggle enabled
- `sw.js` – Cache Chart.js + Charts.js, bump version

**Verify:** Charts with 0/1/6/12 months. RTL labels. Offline.

---

## Phase 4: Enhanced Calendar

**New file:**
- `src/components/Calendar.js` – Extracted from Dashboard + swipe, week view, tap empty day → form

**Changes:**
- `Dashboard.js` – Remove renderCalendar/showDayDetail
- `index.html` – Month/Week toggle, Calendar.js script
- `css/pages.css` – Calendar styles

**Verify:** Tap empty day opens form. Swipe works. Month/Week toggle.

---

## Phase 5: Shift Templates

**New file:**
- `src/components/Templates.js` – CRUD templates, apply to week/month, capture current week

**Changes:**
- `index.html` – Templates section in Add page, edit modal
- `css/components.css` – Template card styles

**Verify:** CRUD templates. Apply to week/month. Persists in IDB.

---

## Phase 6: Shotef+30 Display + Smart Reminders

**New file:**
- `src/utils/notifications.js` – requestPermission, checkAndNotify (end-of-month, decree, payslip, vacation), schedulePeriodicCheck

**Changes:**
- `Dashboard.js` – "Payment date: 1 [month+2]" label
- `AnnualSummary.js` – Payment dates aligned to shotef+30
- `index.html` – Notifications toggle in Settings
- `app.js` – init calls schedulePeriodicCheck if enabled

**Verify:** Payment date correct. Reminders (when app open; iOS has limited push).

---

## Phase 7: PDF Export

**Libraries:** jsPDF + AutoTable via CDN

**New files:**
- `src/assets/heebo-font.js` – Heebo subset for Hebrew RTL in PDF
- `src/components/PdfExport.js` – generateMonthlyPdf, downloadMonthlyPdf

**Changes:**
- `index.html` – jsPDF/AutoTable CDN, "Export PDF" button
- `sw.js` – Cache CDN + new files, bump version

**Verify:** PDF with shifts. Hebrew RTL. Offline generation.

---

## Phase 8: Image Share (Story Card)

**New file:**
- `src/components/ShareImage.js` – generateSummaryImage (Canvas 1080×1920), shareImage (Web Share / download fallback)

**Changes:**
- `index.html` – Share menu: WhatsApp text / Image / PDF

**Verify:** Image generates. Hebrew RTL. Web Share on Android, download on iOS.

---

## Dependency Order

```
Phase 0 (CSS) → Phase 1 (IDB) → Phase 2 (Animations)
                                       │
         ┌─────────┬───────────────────┼─────────┐
         ▼         ▼                   ▼         ▼
      Phase 3   Phase 4             Phase 5   Phase 6
      (Charts)  (Calendar)         (Templates) (Reminders + Shotef+30)
         │         │                   │              │
         └─────────┴───────────────────┘              │
                          │                           │
                    Phase 7 (PDF Export)               │
                          │                           │
                    Phase 8 (Image Share) ←────────────┘
```

---

## New Files Summary (14 total)

| File | Phase |
|------|-------|
| css/variables.css | 0 |
| css/base.css | 0 |
| css/components.css | 0 |
| css/pages.css | 0 |
| css/animations.css | 0 |
| src/store/db.js | 1 |
| src/utils/animate.js | 2 |
| src/components/Charts.js | 3 |
| src/components/Calendar.js | 4 |
| src/components/Templates.js | 5 |
| src/utils/notifications.js | 6 |
| src/components/PdfExport.js | 7 |
| src/assets/heebo-font.js | 7 |
| src/components/ShareImage.js | 8 |

---

## Verification After Each Phase

- [ ] All 5 tabs on Xcode iPhone simulator
- [ ] Offline: disconnect → reload → works
- [ ] `node test-regression.js` passes (after salaryEngine changes)
- [ ] RTL aligned
- [ ] Export → clear → import → data preserved
