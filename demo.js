/**
 * Demo: Plus shift and Weekend shift pay calculation
 * Run: node demo.js
 */

const {
  calculateShiftPay,
  calculatePayForRange,
  BASE_RATE,
} = require('./shiftCalculator.js');

// --- 1. Plus shift (פלוס): 06:00 → next day 06:00 (28 hours, includes 6 rest) ---
const plusShift = {
  type: 'plus',
  date: '2025-02-17', // Monday 06:00 → Tuesday 06:00 (no weekend overlap)
};
const plusResult = calculateShiftPay(plusShift);
console.log('--- פלוס (Plus) - Monday 06:00 → Tuesday 06:00 ---');
console.log(JSON.stringify(plusResult, null, 2));
console.log('');

// --- 2. Plus shift that overlaps weekend (Fri 06:00 → Sat 06:00) ---
const plusWeekend = {
  type: 'plus',
  date: '2025-02-21', // Friday: 06:00 Fri → 06:00 Sat
};
const plusWeekendResult = calculateShiftPay(plusWeekend);
console.log('--- פלוס (Plus) - Friday 06:00 → Saturday 06:00 (weekend overlap) ---');
console.log(JSON.stringify(plusWeekendResult, null, 2));
console.log('');

// --- 3. Pure weekend shift: Friday 16:00 → Sunday 06:00 ---
const weekendShift = {
  type: 'minus',
  start: '2025-02-21T16:00:00',
  end: '2025-02-23T06:00:00',
};
const weekendResult = calculateShiftPay(weekendShift);
console.log('--- משמרת סוף שבוע (Weekend) - Fri 16:00 → Sun 06:00 ---');
console.log(JSON.stringify(weekendResult, null, 2));
console.log('');

// --- 4. Minus shift: simple weekday 08:00–16:00 ---
const minusShift = {
  type: 'minus',
  start: '2025-02-18T08:00:00',
  end: '2025-02-18T16:00:00',
};
const minusResult = calculateShiftPay(minusShift);
console.log('--- מינוס (Minus) - Tuesday 08:00–16:00 (8 hours regular) ---');
console.log(JSON.stringify(minusResult, null, 2));
console.log('Expected pay ≈ 8 * 75 = 600 NIS');
console.log('');

// --- 5. Vacation day ---
const vacationShift = { type: 'vacation', date: '2025-02-19' };
const vacationResult = calculateShiftPay(vacationShift);
console.log('--- חופש/מחלה (Vacation) - flat rate ---');
console.log(JSON.stringify(vacationResult, null, 2));
