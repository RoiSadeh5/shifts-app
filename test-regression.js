/**
 * Regression tests for the calculation engine.
 * Run: node test-regression.js
 */
const Calc = require('./shiftCalculator.js');

let passed = 0, failed = 0;

function assert(label, actual, expected, tolerance) {
  const tol = tolerance || 0.01;
  if (Math.abs(actual - expected) <= tol) {
    console.log(`  ✅ ${label}: ${actual}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}: got ${actual}, expected ${expected}`);
    failed++;
  }
}

// =============================
// TEST 1: Plus shift on a weekday (Wed 2026-03-04)
// 06:00 Wed → 06:00 Thu = 24 clock hours
// Hours: 06:00-00:00 = 18h regular @ 75 = 1350
//        00:00-06:00 = 6h rest @ 37.5 = 225
// Total = 1575
// =============================
console.log('\n--- Test 1: Plus (weekday, Wed 2026-03-04) ---');
const r1 = Calc.calculateShiftPay({ type: 'plus', date: '2026-03-04' });
assert('Total Hours', r1.totalHours, 24);
assert('Total Pay', r1.totalPay, 1575);
assert('Regular Pay', r1.breakdown.regular, 1350);
assert('Rest Pay', r1.breakdown.rest, 225);
assert('Weekend Pay', r1.breakdown.weekend, 0);

// =============================
// TEST 2: Plus shift starting Friday (2026-03-06 is a Friday)
// 06:00 Fri → 06:00 Sat
// 06:00-16:00 Fri = 10h regular @ 75 = 750
// 16:00-00:00 Fri = 8h weekend @ 112.5 = 900
// 00:00-06:00 Sat = 6h weekend+rest @ 56.25 = 337.5
// Total = 1987.5
// =============================
console.log('\n--- Test 2: Plus (Friday, 2026-03-06) ---');
const r2 = Calc.calculateShiftPay({ type: 'plus', date: '2026-03-06' });
assert('Total Hours', r2.totalHours, 24);
assert('Total Pay', r2.totalPay, 1987.5);
assert('Regular Pay', r2.breakdown.regular, 750);
assert('Weekend Pay', r2.breakdown.weekend, 900);
assert('Weekend+Rest Pay', r2.breakdown.weekendRest, 337.5);

// =============================
// TEST 3: Plus shift starting Saturday (2026-03-07 is a Saturday)
// 06:00 Sat → 06:00 Sun
// 06:00-06:00 all weekend
// 06:00-00:00 Sat = 18h weekend @ 112.5 = 2025
// 00:00-06:00 Sun = 6h weekend+rest @ 56.25 = 337.5
// Total = 2362.5
// =============================
console.log('\n--- Test 3: Plus (Saturday, 2026-03-07) ---');
const r3 = Calc.calculateShiftPay({ type: 'plus', date: '2026-03-07' });
assert('Total Hours', r3.totalHours, 24);
assert('Total Pay', r3.totalPay, 2362.5);
assert('Weekend Pay', r3.breakdown.weekend, 2025);
assert('Weekend+Rest Pay', r3.breakdown.weekendRest, 337.5);

// =============================
// TEST 4: Training shift
// 06:00-20:00 = 14 hours
// On a weekday: 14h @ 75 = 1050
// =============================
console.log('\n--- Test 4: Training (weekday) ---');
const r4 = Calc.calculateShiftPay({ type: 'training', date: '2026-03-04' });
assert('Total Hours', r4.totalHours, 14);
assert('Total Pay', r4.totalPay, 1050);

// =============================
// TEST 5: Vacation
// =============================
console.log('\n--- Test 5: Vacation ---');
const r5 = Calc.calculateShiftPay({ type: 'vacation', date: '2026-03-04' });
assert('Total Pay', r5.totalPay, 1750);
assert('Flat Rate', r5.flatRate ? 1 : 0, 1);

// =============================
// TEST 6: Deductions
// Gross = 10000
// Pension: 600, Study: 250, NI tier1: 328.91, NI tier2: 279.58 → NI total: 608.49 (approx)
// Total employee: 1458.49 (approx)
// Net: 8541.51 (approx)
// =============================
console.log('\n--- Test 6: Deductions (Gross=10000) ---');
const d1 = Calc.calcDeductions(10000, { pension: true, study: true, ni: true });
assert('Pension Emp', d1.employee.pension, 600);
assert('Study Emp', d1.employee.study, 250);
assert('NI Tier1', d1.employee.niTier1, 7703 * 0.0427, 0.1);
assert('NI Tier2', d1.employee.niTier2, (10000 - 7703) * 0.1217, 0.1);
assert('Net', d1.net, 10000 - d1.employee.total, 0.1);
assert('Employer Pension', d1.employer.pension, 1250);
assert('Employer Study', d1.employer.study, 750);

// =============================
// TEST 7: Deductions with study ceiling hit
// Gross = 20000
// Study capped at 15712 → employee: 15712*0.025 = 393.8
// =============================
console.log('\n--- Test 7: Deductions study cap (Gross=20000) ---');
const d2 = Calc.calcDeductions(20000, { pension: true, study: true, ni: true });
assert('Study Emp (capped)', d2.employee.study, 15712 * 0.025, 0.1);

// =============================
// TEST 8: Plus with bonus
// =============================
console.log('\n--- Test 8: Plus + Bonus ---');
const r8 = Calc.calculateShiftPay({ type: 'plus', date: '2026-03-04', hasBonus: true });
assert('Total Pay with Bonus', r8.totalPay, 1575 + 3500);
assert('Bonus Applied', r8.bonusApplied, 3500);

// =============================
// TEST 9: Income Tax - 15,000 gross, 2.25 credit points
// Tier 1 (10%): 7,010 × 0.10 = 701.00
// Tier 2 (14%): 3,050 × 0.14 = 427.00
// Tier 3 (20%): 4,940 × 0.20 = 988.00
// Gross Tax = 2,116.00
// Credits: 2.25 × 242 = 544.50
// Final: 2,116 - 544.50 = 1,571.50
// =============================
console.log('\n--- Test 9: Income Tax (15,000 gross, 2.25 cp) ---');
const t9 = Calc.calcIncomeTax(15000, 2.25);
assert('Gross Tax', t9.grossTax, 2116, 0.1);
assert('Credit Amount', t9.creditAmount, 544.5);
assert('Final Tax', t9.finalTax, 1571.5, 0.1);
assert('Effective Rate', t9.effectiveRate, 10.5, 0.1);
assert('Tier count', t9.tiers.length, 3);

// =============================
// TEST 10: Income Tax - low income (5,000 gross, 2.25 cp)
// Tier 1 (10%): 5,000 × 0.10 = 500.00
// Credits: 544.50
// Final: max(0, 500 - 544.50) = 0
// =============================
console.log('\n--- Test 10: Income Tax (5,000 gross - below credits) ---');
const t10 = Calc.calcIncomeTax(5000, 2.25);
assert('Final Tax (floored at 0)', t10.finalTax, 0);

// =============================
// TEST 11: Income Tax - high income (50,000 gross, 2.25 cp)
// =============================
console.log('\n--- Test 11: Income Tax (50,000 gross, 2.25 cp) ---');
const t11 = Calc.calcIncomeTax(50000, 2.25);
const expected_gross_tax = 7010*0.10 + 3050*0.14 + 6090*0.20 + 6290*0.31 + 24250*0.35 + 3310*0.47;
assert('Gross Tax (50K)', t11.grossTax, expected_gross_tax, 1);
assert('Final Tax (50K)', t11.finalTax, expected_gross_tax - 544.5, 1);

// =============================
// SUMMARY
// =============================
console.log(`\n============================`);
console.log(`Passed: ${passed}  |  Failed: ${failed}`);
console.log(`============================\n`);

process.exit(failed > 0 ? 1 : 0);
