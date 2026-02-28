/**
 * Shift Pay Calculator – Standalone Engine (Node.js compatibility wrapper)
 * Re-exports all functions from the unified salary engine.
 *
 * Usage (Node): const Calc = require('./shiftCalculator.js');
 */
const SalaryEngine = require('./src/logic/salaryEngine.js');

module.exports = {
  DEFAULTS: SalaryEngine.DEFAULTS,
  DEDUCTION_CONSTANTS: SalaryEngine.DEDUCTION_CONSTANTS,
  TAX_BRACKETS_MONTHLY: SalaryEngine.TAX_BRACKETS_MONTHLY,
  CREDIT_POINT_VALUE: SalaryEngine.CREDIT_POINT_VALUE,
  getRateAt: SalaryEngine.getRateAt,
  calculatePayForRange: SalaryEngine.calculatePayForRange,
  calculateShiftPay: SalaryEngine.calculateShiftPay,
  calcDeductions: SalaryEngine.calcDeductions,
  calcIncomeTax: SalaryEngine.calcIncomeTax,
  calcAnnualSummary: SalaryEngine.calcAnnualSummary,
};
