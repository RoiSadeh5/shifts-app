/**
 * Regression tests for the calculation engine.
 * Run: npm test
 *
 * Engine includes: meal allowance (30 ₪ per 6h), NI+Health split (2026 rates).
 */
const Calc = require('../shiftCalculator.js');

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

const MEAL = 30;  // per 6 hours
const meal24 = Math.floor(24 / 6) * MEAL;   // 120
const meal14 = Math.floor(14 / 6) * MEAL;   // 60

// =============================
// TEST 1: Plus shift on a weekday (Wed 2026-03-04)
// 06:00 Wed → 06:00 Thu = 24h | Pay: 1350+225 = 1575, + meal 120 = 1695
// =============================
console.log('\n--- Test 1: Plus (weekday, Wed 2026-03-04) ---');
const r1 = Calc.calculateShiftPay({ type: 'plus', date: '2026-03-04' });
assert('Total Hours', r1.totalHours, 24);
assert('Total Pay', r1.totalPay, 1575 + meal24);
assert('Regular Pay', r1.breakdown.regular, 1350);
assert('Rest Pay', r1.breakdown.rest, 225);
assert('Weekend Pay', r1.breakdown.weekend, 0);

// =============================
// TEST 2: Plus shift starting Friday (2026-03-06)
// Pay: 750+900+337.5 = 1987.5, + meal 120 = 2107.5
// =============================
console.log('\n--- Test 2: Plus (Friday, 2026-03-06) ---');
const r2 = Calc.calculateShiftPay({ type: 'plus', date: '2026-03-06' });
assert('Total Hours', r2.totalHours, 24);
assert('Total Pay', r2.totalPay, 1987.5 + meal24);
assert('Regular Pay', r2.breakdown.regular, 750);
assert('Weekend Pay', r2.breakdown.weekend, 900);
assert('Weekend+Rest Pay', r2.breakdown.weekendRest, 337.5);

// =============================
// TEST 3: Plus shift starting Saturday (2026-03-07)
// Pay: 2025+337.5 = 2362.5, + meal 120 = 2482.5
// =============================
console.log('\n--- Test 3: Plus (Saturday, 2026-03-07) ---');
const r3 = Calc.calculateShiftPay({ type: 'plus', date: '2026-03-07' });
assert('Total Hours', r3.totalHours, 24);
assert('Total Pay', r3.totalPay, 2362.5 + meal24);
assert('Weekend Pay', r3.breakdown.weekend, 2025);
assert('Weekend+Rest Pay', r3.breakdown.weekendRest, 337.5);

// =============================
// TEST 4: Training shift – 14h @ 75 = 1050, + meal 60 = 1110
// =============================
console.log('\n--- Test 4: Training (weekday) ---');
const r4 = Calc.calculateShiftPay({ type: 'training', date: '2026-03-04' });
assert('Total Hours', r4.totalHours, 14);
assert('Total Pay', r4.totalPay, 1050 + meal14);

// =============================
// TEST 5: Vacation – flat 1750, no meal
// =============================
console.log('\n--- Test 5: Vacation ---');
const r5 = Calc.calculateShiftPay({ type: 'vacation', date: '2026-03-04' });
assert('Total Pay', r5.totalPay, 1750);
assert('Flat Rate', r5.flatRate ? 1 : 0, 1);

// Sick pay is Sunday–Thursday only. A 3-week range is 15 paid days.
console.log('\n--- Test 5b: Sick weekdays paid, Friday/Saturday unpaid ---');
const sickWed = Calc.calculateShiftPay({ type: 'sick', date: '2026-03-04' });
const sickFri = Calc.calculateShiftPay({ type: 'sick', date: '2026-03-06' });
const sickSat = Calc.calculateShiftPay({ type: 'sick', date: '2026-03-07' });
const vacSat = Calc.calculateShiftPay({ type: 'vacation', date: '2026-03-07' });
assert('Sick weekday flat', sickWed.totalPay, 1750);
assert('Sick Friday unpaid', sickFri.totalPay, 0);
assert('Sick Saturday unpaid', sickSat.totalPay, 0);
assert('Vacation Saturday stays flat', vacSat.totalPay, 1750);
let sickPaidDays = 0;
let sickPaidSum = 0;
for (let day = 1; day <= 21; day++) {
  const date = '2026-03-' + String(day).padStart(2, '0');
  const pay = Calc.calculateShiftPay({ type: 'sick', date: date }).totalPay;
  if (pay > 0) sickPaidDays++;
  sickPaidSum += pay;
}
assert('Three sick weeks paid days', sickPaidDays, 15);
assert('Three sick weeks total', sickPaidSum, 15 * 1750);

// =============================
// TEST 6: Deductions (2026 NI+Health split)
// NI: 0.4% on 7703, 7% on rest | Health: 3.1% on 7703, 5% on rest
// NI tier1: 7703*0.004=30.81, tier2: 2297*0.07=160.79
// =============================
console.log('\n--- Test 6: Deductions (Gross=10000) ---');
const d1 = Calc.calcDeductions(10000, { pension: true, study: true, ni: true });
assert('Pension Emp', d1.employee.pension, 600);
assert('Study Emp', d1.employee.study, 250);
assert('NI Tier1', d1.employee.niTier1, 7703 * 0.004, 0.1);
assert('NI Tier2', d1.employee.niTier2, (10000 - 7703) * 0.07, 0.1);
assert('Net', d1.net, 10000 - d1.employee.total, 0.1);
assert('Employer Pension', d1.employer.pension, 1250);
assert('Employer Study', d1.employer.study, 750);

// =============================
// TEST 7: Deductions – no cap on Keren Hishtalmut
// =============================
console.log('\n--- Test 7: Deductions (Gross=20000, study wage ceiling 15712) ---');
const d2 = Calc.calcDeductions(20000, { pension: true, study: true, ni: true });
assert('Study Emp (capped)', d2.employee.study, 15712 * 0.025, 0.1);
assert('Study Employer (capped)', d2.employer.study, 15712 * 0.075, 0.1);
const h25 = Calc.getHolidayForDate('2025-04-13');
assert('Pesach 2025 flagged', h25 && h25.type === 'chag' ? 1 : 0, 1);
const h27 = Calc.getHolidayForDate('2027-10-11');
assert('Yom Kippur 2027 flagged', h27 && h27.type === 'chag' ? 1 : 0, 1);

// =============================
// TEST 8: Plus with bonus – base+meal+3500
// =============================
console.log('\n--- Test 8: Plus + Bonus ---');
const r8 = Calc.calculateShiftPay({ type: 'plus', date: '2026-03-04', hasBonus: true });
assert('Total Pay with Bonus', r8.totalPay, 1575 + meal24 + 3500);
assert('Bonus Applied', r8.bonusApplied, 3500);

// =============================
// TEST 9: Income Tax – 15,000 gross, 2.25 cp
// =============================
console.log('\n--- Test 9: Income Tax (15,000 gross, 2.25 cp) ---');
const t9 = Calc.calcIncomeTax(15000, 2.25);
assert('Gross Tax', t9.grossTax, 2116, 0.1);
assert('Credit Amount', t9.creditAmount, 544.5);
assert('Final Tax', t9.finalTax, 1571.5, 0.1);
assert('Effective Rate', t9.effectiveRate, 10.5, 0.1);
assert('Tier count', t9.tiers.length, 3);

// =============================
// TEST 10: Income Tax – low income
// =============================
console.log('\n--- Test 10: Income Tax (5,000 gross - below credits) ---');
const t10 = Calc.calcIncomeTax(5000, 2.25);
assert('Final Tax (floored at 0)', t10.finalTax, 0);

// =============================
// TEST 11: Income Tax – high income
// =============================
console.log('\n--- Test 11: Income Tax (50,000 gross, 2.25 cp) ---');
const t11 = Calc.calcIncomeTax(50000, 2.25);
const expected_gross_tax = 7010*0.10 + 3050*0.14 + 6090*0.20 + 6290*0.31 + 24250*0.35 + 3310*0.47;
assert('Gross Tax (50K)', t11.grossTax, expected_gross_tax, 1);
assert('Final Tax (50K)', t11.finalTax, expected_gross_tax - 544.5, 1);

// =============================
// TEST 12: Savings ledger
// Opening balance stays put. A month replaces only itself.
// Study fund stops at the wage ceiling. Retirement uses birth year.
// =============================
console.log('\n--- Test 12: Savings ledger ---');
let fund = Calc.migrateSavingsFund({ balance: 10000, returnRate: 7, contributions: { '2026-1': 1800 } });
assert('Opening excludes baked-in deposit', fund.openingBalance, 8200);
assert('Display keeps the old balance', Calc.fundDisplayBalance(fund), 10000);

const pension10 = Calc.buildFundDeposit('pension', 10000, null, { pension: true, study: true });
assert('Pension employee 6%', pension10.employee, 600);
assert('Pension employer 12.5%', pension10.employer, 1250);
assert('Pension deposit', pension10.total, 1850);
assert('Pension has no ceiling', pension10.ceilingApplied ? 1 : 0, 0);

fund = Calc.replaceMonthContribution(fund, 2026, 2, pension10);
assert('March deposit added once', Calc.fundDisplayBalance(fund), 11850);
fund = Calc.replaceMonthContribution(fund, 2026, 2, pension10);
assert('Same month does not stack', Calc.fundDisplayBalance(fund), 11850);
fund = Calc.replaceMonthContribution(fund, 2026, 2, { employee: 400, employer: 600, total: 1000, source: 'payslip' });
assert('Replacing March leaves February', Calc.fundDisplayBalance(fund), 11000);
assert('February still saved', Calc.sumContributionLedger(fund.contributions) - 1000, 1800);

const study20 = Calc.buildFundDeposit('study', 20000, null, { pension: true, study: true });
assert('Study employee on ceiling', study20.employee, 392.8);
assert('Study employer on ceiling', study20.employer, 1178.4);
assert('Study wage base', study20.wageBase, 15712);
assert('Study ceiling flagged', study20.ceilingApplied ? 1 : 0, 1);

const study10 = Calc.buildFundDeposit('study', 10000, null, { pension: true, study: true });
assert('Study below ceiling', study10.employee, 250);
assert('Study ceiling not flagged', study10.ceilingApplied ? 1 : 0, 0);

const slipped = Calc.buildFundDeposit('pension', 10000, 500, { pension: true, study: true });
assert('Payslip employee used', slipped.employee, 500);
assert('Employer stays calculated', slipped.employer, 1250);
assert('Mismatch flagged', slipped.mismatch ? 1 : 0, 1);
assert('Slip deposit total', slipped.total, 1750);

const off = Calc.buildFundDeposit('pension', 10000, null, { pension: false, study: true });
assert('Pension toggle off', off.total, 0);

assert('Years to 67 from 1994 in 2026', Calc.yearsUntilRetirement(1994, 2026), 35);
assert('Already 67', Calc.yearsUntilRetirement(1959, 2026), 0);
assert('Missing birth year', Calc.yearsUntilRetirement(null, 2026) == null ? 1 : 0, 1);
assert('Flat projection 12 deposits', Calc.projectSavingsBalance(0, 100, 0, 12), 1200);
assert('Zero months keeps balance', Calc.projectSavingsBalance(5000, 100, 7, 0), 5000);

const kept = Calc.migrateSavingsFund({ openingBalance: 8200, contributions: { '2026-1': { total: 1800, employee: 600, employer: 1200 } } });
assert('Saved opening is not reduced again', kept.openingBalance, 8200);
assert('Saved opening display', Calc.fundDisplayBalance(kept), 10000);

// =============================
// SUMMARY
// =============================
console.log(`\n============================`);
console.log(`Passed: ${passed}  |  Failed: ${failed}`);
console.log(`============================\n`);

process.exit(failed > 0 ? 1 : 0);
