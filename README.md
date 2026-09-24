# שכ״ש – Shift Pay Calculator

Hebrew (RTL) PWA for tracking work shifts and calculating gross and net salary. Data stays on the device. The iOS app is a Capacitor wrapper. See [docs/APP_STORE.md](docs/APP_STORE.md).

```bash
npm run dev      # http://localhost:8000
npm test         # salary engine regression tests
npm run cap:sync # copy the web app into www/ and sync iOS
npm run ios      # open Xcode
```

## Layout

| Path | What it is |
|---|---|
| `index.html` | Screens, tab bar, script tags |
| `css/` | Tokens, base, components, pages |
| `src/logic/salaryEngine.js` | Shift pay, tax, deductions. No DOM. |
| `src/app.js` | State, navigation, startup |
| `src/store.js` | IndexedDB and localStorage |
| `src/utils.js` | Count-up, payment date, notifications |
| `src/components/` | Dashboard, shift form, calendar, savings, annual, settings, charts, PDF, share |
| `src/admin.js` | Local admin list on this device |
| `config.example.js` | Admin password placeholder. A real `config.js` is gitignored. |
| `shiftCalculator.js` | Node wrapper around the salary engine |
| `test/regression.js` | Engine tests |
| `sw.js` | Service worker, network first |
| `manifest.json` | PWA manifest |
| `privacy.html` | Privacy policy |
| `scripts/copy-to-www.js` | Copies the web app into `www/` for Capacitor |
| `ios/` | Xcode project |
| `docs/` | App Store guide and the original upgrade plan |

The app does not talk to Firebase or any other backend.

## Tabs

בית, משמרת, לוח, עוד. Savings, the annual summary, and settings open from עוד.

## Storage

IndexedDB database `sachash-db` holds shifts, payslip history, templates, and the local user list. Settings, name, leave balances, and savings stay in `localStorage`, keyed per device user (`shifter_shifts_<userId>` and the same pattern for settings, history, leave, username, and savings). A save writes both IndexedDB and `localStorage`. Export from settings writes a JSON backup.
