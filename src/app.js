/**
 * שכ״ש – Main Application
 * Shared state, constants, engine bridge, navigation, utilities, and init.
 * Loaded after src/logic/salaryEngine.js, before store and component scripts.
 */

// ===== Bridge to Salary Engine =====
var SalaryEngine = window.SalaryEngine;

var userRates = { ...SalaryEngine.DEFAULTS };
var creditPoints = 2.25;
var dedSettings = { pension: true, study: true, ni: true, incomeTax: true, studyFullSalary: false, taxYear2025: false, simpleMode: false };
var STUDY_CEILING = SalaryEngine.DEDUCTION_CONSTANTS.STUDY_CEILING;

function calculateShiftPay(shift) {
  return SalaryEngine.calculateShiftPay(shift, userRates);
}

function calcDeductions(grossMonthly) {
  return SalaryEngine.calcDeductions(grossMonthly, dedSettings);
}

function calcIncomeTax(grossMonthly) {
  return SalaryEngine.calcIncomeTax(grossMonthly, creditPoints, dedSettings.taxYear2025);
}

// ===== UI State =====
var selectedType = 'plus';
var bonusOn = false;
var rangeOn = false;
var currentMonth = new Date().getMonth();
var currentYear = new Date().getFullYear();
var annualYear = new Date().getFullYear();

// ===== Constants =====
var hebrewMonths = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני',
                    'יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
var dayNames = ['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'];
var dayNamesFull = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
var typeNames = { plus: 'פלוס', training: 'אימון', vacation: 'חופש', sick: 'מחלה', minus: 'ידני' };
var badgeCls = { plus: 'badge-plus', training: 'badge-training', vacation: 'badge-vacation', sick: 'badge-sick', minus: 'badge-minus' };
var dotCls = { plus: 'dot-plus', training: 'dot-training', vacation: 'dot-vacation', sick: 'dot-sick', minus: 'dot-minus' };
var dotColors = { plus: 'var(--accent-light)', training: 'var(--orange)', vacation: 'var(--green)', sick: 'var(--red)', minus: 'var(--blue)' };

// ===== Utilities =====
function fmtNIS(n) { return `₪${Math.round(n).toLocaleString()}`; }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function showConfirm(title, message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-box">
      <div class="confirm-title">${title}</div>
      <div class="confirm-msg">${message}</div>
      <div class="confirm-btns">
        <button class="confirm-cancel">ביטול</button>
        <button class="confirm-ok">מחק הכל</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));
  overlay.querySelector('.confirm-cancel').onclick = () => {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.remove(), 200);
  };
  overlay.querySelector('.confirm-ok').onclick = () => {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.remove(), 200);
    onConfirm();
  };
}

// ===== Tab Navigation =====
function switchTab(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page' + name).classList.add('active');
  document.getElementById('tab' + name).classList.add('active');
  const titles = { Dashboard: 'שכ״ש', Add: 'הוספת משמרת', Calendar: 'לוח שנה', Annual: 'סיכום שנתי', Settings: 'הגדרות' };
  document.getElementById('pageTitle').textContent = titles[name];
  if (name === 'Calendar') renderCalendar();
  if (name === 'Dashboard') render();
  if (name === 'Annual') renderAnnual();
}

// ===== Month Navigation =====
function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  updateMonthLabels();
  render();
  renderCalendar();
}

function updateMonthLabels() {
  const lbl = `${hebrewMonths[currentMonth]} ${currentYear}`;
  document.getElementById('monthLabel').textContent = lbl;
  document.getElementById('calMonthLabel').textContent = lbl;
}

// ===== Recalculate All Shifts =====
function recalcAll() {
  const shifts = loadShifts();
  shifts.forEach(s => { s.result = calculateShiftPay(s); });
  saveShifts(shifts);
  render();
}

// ===== Initialization =====
function init() {
  loadSettings();
  document.getElementById('settingBase').value = userRates.baseRate;
  document.getElementById('settingWeekend').value = userRates.weekendMultiplier;
  document.getElementById('settingVacation').value = userRates.vacationDayRate;
  document.getElementById('settingBonus').value = userRates.bonusQuarterly;
  document.getElementById('settingCreditPts').value = creditPoints;

  document.getElementById('togglePension').classList.toggle('on', dedSettings.pension);
  document.getElementById('toggleStudy').classList.toggle('on', dedSettings.study);
  document.getElementById('toggleNI').classList.toggle('on', dedSettings.ni);
  document.getElementById('toggleIncomeTax').classList.toggle('on', dedSettings.incomeTax);
  document.getElementById('toggleStudyFullSalary').classList.toggle('on', dedSettings.studyFullSalary);
  const t2025 = document.getElementById('toggleTaxYear2025');
  if (t2025) t2025.classList.toggle('on', dedSettings.taxYear2025);
  const tSimple = document.getElementById('toggleSimpleMode');
  if (tSimple) tSimple.classList.toggle('on', dedSettings.simpleMode);

  const leave = loadLeaveBalances();
  document.getElementById('settingVacBal').value = leave.vacation;
  document.getElementById('settingSickBal').value = leave.sick;

  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;
  document.getElementById('shiftDate').value = todayStr;
  document.getElementById('rangeStart').value = todayStr;
  document.getElementById('rangeEnd').value = todayStr;

  updateMonthLabels();
  recalcAll();
  updateBackupDisplay();
}
