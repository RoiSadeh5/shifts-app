/**
 * Salary Calculation Engine – שכ״ש
 * All pure functions: shift pay, deductions, income tax, annual summary.
 * No DOM, no localStorage.
 *
 * Browser: <script src="src/logic/salaryEngine.js"></script> → window.SalaryEngine
 * Node.js: const Engine = require('./src/logic/salaryEngine.js');
 */
(function (exports) {
  'use strict';

  // ===== Configurable Rates =====
  const DEFAULTS = {
    baseRate: 75,
    weekendMultiplier: 1.5,
    restMultiplier: 0.5,
    vacationDayRate: 1750,
    bonusQuarterly: 3500,
  };

  // ===== 2026 Israel Deduction Constants =====
  const DEDUCTION_CONSTANTS = {
    NI_LOWER_CEILING: 7703,
    NI_UPPER_CEILING: 51910,
    NI_LOWER_RATE: 0.004,      // NI: 0.4%
    NI_UPPER_RATE: 0.07,       // NI: 7%
    HEALTH_LOWER_RATE: 0.031,  // Health: 3.1%
    HEALTH_UPPER_RATE: 0.05,   // Health: 5%
    PENSION_EMPLOYEE: 0.06,
    PENSION_EMPLOYER: 0.125,
    STUDY_EMPLOYEE: 0.025,
    STUDY_EMPLOYER: 0.075,
    STUDY_CEILING: 15712,
  };

  // ===== 2025 Israel Deduction Constants =====
  const DEDUCTION_CONSTANTS_2025 = {
    NI_LOWER_CEILING: 7522,
    NI_UPPER_CEILING: 50695,
    NI_LOWER_RATE: 0.004,
    NI_UPPER_RATE: 0.07,
    HEALTH_LOWER_RATE: 0.031,
    HEALTH_UPPER_RATE: 0.05,
    PENSION_EMPLOYEE: 0.06,
    PENSION_EMPLOYER: 0.125,
    STUDY_EMPLOYEE: 0.025,
    STUDY_EMPLOYER: 0.075,
    STUDY_CEILING: 15712,
  };

  // ===== Meal Allowance & Fixed Monthly Additions =====
  const MEAL_ALLOWANCE_PER_6H = 30;

  const FIXED_MONTHLY_ADDITIONS = {
    clothing: 148.08,
    convalescence: 313,
    telephone: 48.60,
  };

  // ================================================================
  //  SHIFT PAY
  // ================================================================

  /**
   * Hourly rate at a given moment.
   * Weekend: Fri 16:00 → Sun 06:00 (150%)
   * Rest:    00:00 → 06:00 daily (50% of applicable rate)
   */
  function getRateAt(date, rates) {
    const r = { ...DEFAULTS, ...rates };
    const day = date.getDay();
    const hour = date.getHours() + date.getMinutes() / 60;

    const isWeekend = (day === 5 && hour >= 16) || (day === 6) || (day === 0 && hour < 6);
    const isRest = hour >= 0 && hour < 6;

    let rate = isWeekend ? r.baseRate * r.weekendMultiplier : r.baseRate;
    if (isRest) rate *= r.restMultiplier;

    return { rate, isWeekend, isRest };
  }

  /**
   * Sum pay minute-by-minute over a time range.
   */
  function calculatePayForRange(start, end, rates) {
    const breakdown = { regular: 0, weekend: 0, rest: 0, weekendRest: 0 };
    let totalPay = 0, minutes = 0;

    for (let t = start.getTime(); t < end.getTime(); t += 60000) {
      const d = new Date(t);
      const { rate, isWeekend, isRest } = getRateAt(d, rates);
      const ppm = rate / 60;
      totalPay += ppm;
      minutes++;

      if (isRest && isWeekend) breakdown.weekendRest += ppm;
      else if (isRest) breakdown.rest += ppm;
      else if (isWeekend) breakdown.weekend += ppm;
      else breakdown.regular += ppm;
    }

    const round = v => Math.round(v * 100) / 100;
    return {
      totalPay: round(totalPay),
      totalMinutes: minutes,
      totalHours: round(minutes / 60),
      breakdown: {
        regular: round(breakdown.regular),
        weekend: round(breakdown.weekend),
        rest: round(breakdown.rest),
        weekendRest: round(breakdown.weekendRest),
      },
    };
  }

  /**
   * Calculate pay for a single shift.
   * @param {object} shift – { type, date, startTime?, endTime?, hasBonus? }
   * @param {object} [rates] – optional rate overrides
   */
  function calculateShiftPay(shift, rates) {
    const r = { ...DEFAULTS, ...rates };
    const type = shift.type;

    if (type === 'vacation' || type === 'sick') {
      return { shiftType: type, totalPay: r.vacationDayRate, totalHours: 0, flatRate: true, mealAllowance: 0 };
    }

    const parts = shift.date.split('-');
    const year = parseInt(parts[0]), month = parseInt(parts[1]) - 1, day = parseInt(parts[2]);
    let start, end;

    if (type === 'plus') {
      start = new Date(year, month, day, 6, 0, 0);
      end = new Date(year, month, day + 1, 6, 0, 0);
    } else if (type === 'training') {
      start = new Date(year, month, day, 6, 0, 0);
      end = new Date(year, month, day, 20, 0, 0);
    } else if (type === 'minus') {
      const [sh, sm] = shift.startTime.split(':').map(Number);
      const [eh, em] = shift.endTime.split(':').map(Number);
      start = new Date(year, month, day, sh, sm, 0);
      end = new Date(year, month, day, eh, em, 0);
      if (end <= start) end.setDate(end.getDate() + 1);
    } else {
      return { shiftType: type, error: true, totalPay: 0, totalHours: 0, mealAllowance: 0 };
    }

    const result = calculatePayForRange(start, end, rates);
    const bonus = shift.hasBonus ? r.bonusQuarterly : 0;
    const mealAllowance = Math.floor(result.totalHours / 6) * MEAL_ALLOWANCE_PER_6H;

    return {
      shiftType: type,
      totalPay: Math.round((result.totalPay + bonus + mealAllowance) * 100) / 100,
      totalHours: result.totalHours,
      breakdown: result.breakdown,
      bonusApplied: bonus,
      mealAllowance: mealAllowance,
    };
  }

  // ================================================================
  //  2026 INCOME TAX & DEDUCTIONS
  // ================================================================

  /**
   * Monthly deductions (2026 Israel).
   * @param {number} grossMonthly
   * @param {{ pension: boolean, study: boolean, ni: boolean }} toggles
   */
  function calcDeductions(grossMonthly, toggles) {
    const C = (toggles && toggles.taxYear2025) ? DEDUCTION_CONSTANTS_2025 : DEDUCTION_CONSTANTS;
    const t = { pension: true, study: true, ni: true, ...toggles };
    const ded = { pension: 0, study: 0, ni: 0, nationalInsurance: 0, healthInsurance: 0 };
    const emp = { pension: 0, study: 0 };
    let niTier1 = 0, niTier2 = 0, healthTier1 = 0, healthTier2 = 0;

    if (t.pension) {
      ded.pension = grossMonthly * C.PENSION_EMPLOYEE;
      emp.pension = grossMonthly * C.PENSION_EMPLOYER;
    }

    if (t.study) {
      const studyBase = t.studyFullSalary ? grossMonthly : Math.min(grossMonthly, C.STUDY_CEILING);
      ded.study = studyBase * C.STUDY_EMPLOYEE;
      emp.study = studyBase * C.STUDY_EMPLOYER;
    }

    if (t.ni) {
      if (grossMonthly <= C.NI_LOWER_CEILING) {
        niTier1 = grossMonthly * C.NI_LOWER_RATE;
        healthTier1 = grossMonthly * (C.HEALTH_LOWER_RATE || 0.031);
      } else {
        niTier1 = C.NI_LOWER_CEILING * C.NI_LOWER_RATE;
        healthTier1 = C.NI_LOWER_CEILING * (C.HEALTH_LOWER_RATE || 0.031);
        const upper = Math.min(grossMonthly, C.NI_UPPER_CEILING) - C.NI_LOWER_CEILING;
        if (upper > 0) {
          niTier2 = upper * C.NI_UPPER_RATE;
          healthTier2 = upper * (C.HEALTH_UPPER_RATE || 0.05);
        }
      }
      ded.nationalInsurance = niTier1 + niTier2;
      ded.healthInsurance = healthTier1 + healthTier2;
      ded.ni = ded.nationalInsurance + ded.healthInsurance;
    }

    const totalEmployee = ded.pension + ded.study + ded.ni;
    const totalEmployer = emp.pension + emp.study;
    const round = v => Math.round(v * 100) / 100;

    return {
      employee: {
        pension: round(ded.pension),
        study: round(ded.study),
        ni: round(ded.ni),
        nationalInsurance: round(ded.nationalInsurance),
        healthInsurance: round(ded.healthInsurance),
        niTier1: round(niTier1),
        niTier2: round(niTier2),
        total: round(totalEmployee),
      },
      employer: {
        pension: round(emp.pension),
        study: round(emp.study),
        total: round(totalEmployer),
      },
      net: round(grossMonthly - totalEmployee),
    };
  }

  // ===== 2026 Income Tax (Mas Hachnasa) =====
  const TAX_BRACKETS_MONTHLY = [
    { ceiling:  7010, rate: 0.10 },
    { ceiling: 10060, rate: 0.14 },
    { ceiling: 16150, rate: 0.20 },
    { ceiling: 22440, rate: 0.31 },
    { ceiling: 46690, rate: 0.35 },
    { ceiling: 60130, rate: 0.47 },
    { ceiling: Infinity, rate: 0.50 },
  ];

  // ===== 2025 Income Tax (same structure, slightly lower ceilings) =====
  const TAX_BRACKETS_MONTHLY_2025 = [
    { ceiling:  6860, rate: 0.10 },
    { ceiling:  9850, rate: 0.14 },
    { ceiling: 15820, rate: 0.20 },
    { ceiling: 21990, rate: 0.31 },
    { ceiling: 45780, rate: 0.35 },
    { ceiling: 58920, rate: 0.47 },
    { ceiling: Infinity, rate: 0.50 },
  ];

  const CREDIT_POINT_VALUE = 242;
  const CREDIT_POINT_VALUE_2025 = 242;

  // Annual brackets (monthly * 12) for tax prediction
  const TAX_BRACKETS_ANNUAL = TAX_BRACKETS_MONTHLY.map(b => ({
    ceiling: b.ceiling === Infinity ? Infinity : b.ceiling * 12,
    rate: b.rate,
  }));
  const TAX_BRACKETS_ANNUAL_2025 = TAX_BRACKETS_MONTHLY_2025.map(b => ({
    ceiling: b.ceiling === Infinity ? Infinity : b.ceiling * 12,
    rate: b.rate,
  }));

  /**
   * Progressive income tax on monthly gross.
   * @param {number} monthlyGross - taxable monthly income
   * @param {number} creditPoints - number of credit points (e.g. 2.25)
   * @param {boolean} [use2025] - use 2025 tax brackets and credit point
   * @returns {{ grossTax, creditAmount, finalTax, tiers[] }}
   */
  function calcIncomeTax(monthlyGross, creditPoints, use2025) {
    const brackets = use2025 ? TAX_BRACKETS_MONTHLY_2025 : TAX_BRACKETS_MONTHLY;
    const creditValue = use2025 ? CREDIT_POINT_VALUE_2025 : CREDIT_POINT_VALUE;
    let remaining = monthlyGross;
    let grossTax = 0;
    let prev = 0;
    const tiers = [];

    for (const bracket of brackets) {
      if (remaining <= 0) break;
      const width = bracket.ceiling === Infinity ? remaining : Math.min(remaining, bracket.ceiling - prev);
      const tax = width * bracket.rate;
      tiers.push({
        from: prev,
        to: prev + width,
        rate: bracket.rate,
        taxable: Math.round(width * 100) / 100,
        tax: Math.round(tax * 100) / 100,
      });
      grossTax += tax;
      remaining -= width;
      prev = bracket.ceiling;
    }

    const creditAmount = creditPoints * creditValue;
    const finalTax = Math.max(0, grossTax - creditAmount);
    const round = v => Math.round(v * 100) / 100;

    return {
      grossTax: round(grossTax),
      creditAmount: round(creditAmount),
      finalTax: round(finalTax),
      effectiveRate: monthlyGross > 0 ? round(finalTax / monthlyGross * 100) : 0,
      tiers,
    };
  }

  /**
   * Predict annual tax based on YTD actual gross + projected for remaining months.
   * @param {{ month: number, gross: number }[]} monthlyData - array of 12 months with gross (0 = no data)
   * @param {number} projectedMonthlyGross - projected gross per remaining month
   * @param {number} creditPoints
   * @param {boolean} use2025
   * @param {{ ytdGross?: number, monthsWithData?: number }} [options] - optional YTD from latest payslip for baseline
   * @returns {{ estimatedAnnualGross, predictedAnnualTax, monthsWithData }}
   */
  function predictAnnualTax(monthlyData, projectedMonthlyGross, creditPoints, use2025, options) {
    const brackets = use2025 ? TAX_BRACKETS_ANNUAL_2025 : TAX_BRACKETS_ANNUAL;
    const creditValue = use2025 ? CREDIT_POINT_VALUE_2025 : CREDIT_POINT_VALUE;

    let totalYTD = 0;
    let monthsWithData = 0;

    if (options && options.ytdGross > 0 && options.monthsWithData != null) {
      totalYTD = options.ytdGross;
      monthsWithData = options.monthsWithData;
    } else {
      for (let m = 0; m < 12; m++) {
        const gross = (monthlyData[m] && monthlyData[m].gross) ? monthlyData[m].gross : 0;
        if (gross > 0) {
          totalYTD += gross;
          monthsWithData++;
        }
      }
    }

    const remainingMonths = 12 - monthsWithData;
    const estimatedAnnualGross = totalYTD + projectedMonthlyGross * Math.max(0, remainingMonths);

    let remaining = estimatedAnnualGross;
    let grossTax = 0;
    let prev = 0;
    for (const bracket of brackets) {
      if (remaining <= 0) break;
      const width = bracket.ceiling === Infinity ? remaining : Math.min(remaining, bracket.ceiling - prev);
      grossTax += width * bracket.rate;
      remaining -= width;
      prev = bracket.ceiling;
    }

    const annualCredit = creditPoints * 12 * creditValue;
    const predictedAnnualTax = Math.max(0, grossTax - annualCredit);
    const round = v => Math.round(v * 100) / 100;

    return {
      estimatedAnnualGross: round(estimatedAnnualGross),
      predictedAnnualTax: round(predictedAnnualTax),
      monthsWithData,
    };
  }

  /**
   * Full annual Form 106 summary.
   * @param {{ month, gross, incomeTax, ni, pension, study }[]} monthlyData - 12 entries
   * @param {number} creditPoints
   * @param {{ pension: boolean, study: boolean, ni: boolean }} toggles
   * @returns {object} annual summary
   */
  function calcAnnualSummary(monthlyData, creditPoints, toggles) {
    let totalGross = 0, totalIncomeTax = 0, totalNI = 0, totalPension = 0, totalStudy = 0;
    let totalEmpPension = 0, totalEmpStudy = 0;

    monthlyData.forEach(m => {
      totalGross += m.gross || 0;
      totalIncomeTax += m.incomeTax || 0;
      totalNI += m.ni || 0;
      totalPension += m.pension || 0;
      totalStudy += m.study || 0;
      totalEmpPension += m.empPension || 0;
      totalEmpStudy += m.empStudy || 0;
    });

    const round = v => Math.round(v * 100) / 100;
    const totalDeductions = totalIncomeTax + totalNI + totalPension + totalStudy;

    return {
      totalGross: round(totalGross),
      totalIncomeTax: round(totalIncomeTax),
      totalNI: round(totalNI),
      totalPension: round(totalPension),
      totalStudy: round(totalStudy),
      totalDeductions: round(totalDeductions),
      totalNet: round(totalGross - totalDeductions),
      totalEmpPension: round(totalEmpPension),
      totalEmpStudy: round(totalEmpStudy),
      totalEmpContributions: round(totalEmpPension + totalEmpStudy),
      months: monthlyData,
    };
  }

  // ================================================================
  //  FIXED MONTHLY ADDITIONS
  // ================================================================

  function calculateFixedMonthlyAdditions() {
    const a = FIXED_MONTHLY_ADDITIONS;
    const round = v => Math.round(v * 100) / 100;
    return {
      clothing: a.clothing,
      convalescence: a.convalescence,
      telephone: a.telephone,
      total: round(a.clothing + a.convalescence + a.telephone),
    };
  }

  // ================================================================
  //  WHATSAPP SHARE TEXT
  // ================================================================

  const HEBREW_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני',
                         'יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

  /**
   * Generate a formatted Hebrew summary for WhatsApp sharing.
   * @param {{ month, year, shifts, hours, gross, net, mealAllowance?, fixedAdditions? }} data
   * @returns {string} RTL-safe plain text message
   */
  function generateShareText(data) {
    const monthName = HEBREW_MONTHS[data.month] + ' ' + data.year;
    const fmt = n => '₪' + Math.round(n).toLocaleString();

    const lines = [
      'סיכום שכר חודשי - אפליקציית שכ״ש 💰',
      'חודש: ' + monthName,
      'סה״כ שעות: ' + Math.round(data.hours),
    ];
    if (data.mealAllowance > 0) lines.push('אש״ל: ' + fmt(data.mealAllowance));
    if (data.fixedAdditions > 0) lines.push('תוספות קבועות: ' + fmt(data.fixedAdditions));
    lines.push('ברוטו: ' + fmt(data.gross));
    if (data.healthInsurance > 0) lines.push('ביטוח בריאות: ' + fmt(data.healthInsurance));
    lines.push('נטו משוער: ' + fmt(data.net));
    lines.push('נוצר באהבה על ידי Roi Sadeh');
    return lines.join('\n');
  }

  // ===== Export =====
  exports.DEFAULTS = DEFAULTS;
  exports.DEDUCTION_CONSTANTS = DEDUCTION_CONSTANTS;
  exports.TAX_BRACKETS_MONTHLY = TAX_BRACKETS_MONTHLY;
  exports.CREDIT_POINT_VALUE = CREDIT_POINT_VALUE;
  exports.MEAL_ALLOWANCE_PER_6H = MEAL_ALLOWANCE_PER_6H;
  exports.FIXED_MONTHLY_ADDITIONS = FIXED_MONTHLY_ADDITIONS;
  exports.getRateAt = getRateAt;
  exports.calculatePayForRange = calculatePayForRange;
  exports.calculateShiftPay = calculateShiftPay;
  exports.calcDeductions = calcDeductions;
  exports.calcIncomeTax = calcIncomeTax;
  exports.calcAnnualSummary = calcAnnualSummary;
  exports.predictAnnualTax = predictAnnualTax;
  exports.calculateFixedMonthlyAdditions = calculateFixedMonthlyAdditions;
  exports.generateShareText = generateShareText;

})(typeof module !== 'undefined' && module.exports ? module.exports : (window.SalaryEngine = {}));
