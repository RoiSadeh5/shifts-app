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

function haptic(light) {
  try {
    if (navigator.vibrate) navigator.vibrate(light ? 10 : 20);
  } catch (e) {}
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function showConfirm(title, message, onConfirm, okLabel) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-box">
      <div class="confirm-title">${title}</div>
      <div class="confirm-msg">${message}</div>
      <div class="confirm-btns">
        <button class="confirm-cancel">ביטול</button>
        <button class="confirm-ok">${okLabel || 'מחק הכל'}</button>
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

// ===== Greeting & Onboarding =====
function updateGreeting() {
  const name = (loadUserName() || '').trim();
  const titleEl = document.getElementById('pageTitle');
  if (!titleEl) return;
  if (name) {
    titleEl.textContent = '';
    titleEl.innerHTML = `שלום, ${name} 👋`;
    titleEl.classList.add('greeting-animated');
  } else {
    titleEl.textContent = 'שכ״ש';
    titleEl.classList.remove('greeting-animated');
  }
}

function completeOnboarding() {
  const input = document.getElementById('onboardingName');
  const name = (input.value || '').trim();
  if (!name) { input.focus(); return; }
  saveUserName(name);
  const nameInput = document.getElementById('settingUserName');
  if (nameInput) nameInput.value = name;
  const overlay = document.getElementById('onboardingOverlay');
  overlay.classList.remove('visible');
  setTimeout(function() {
    overlay.style.display = 'none';
    maybeShowInstallHint();
  }, 350);
  updateGreeting();
}

function saveUserNameSetting() {
  const input = document.getElementById('settingUserName');
  const name = (input.value || '').trim();
  saveUserName(name);
  updateGreeting();
  showToast('השם עודכן');
}

// ===== Tab Navigation =====
function switchTab(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page' + name).classList.add('active');
  document.getElementById('tab' + name).classList.add('active');
  if (name === 'Dashboard') {
    updateGreeting();
  } else {
    const titles = { Add: 'הוספת משמרת', Calendar: 'לוח שנה', Annual: 'סיכום שנתי', Settings: 'הגדרות' };
    const titleEl = document.getElementById('pageTitle');
    titleEl.classList.remove('greeting-animated');
    titleEl.textContent = titles[name];
  }
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

// ===== Service worker update prompt =====
var swRegistrationForUpdate = null;
function applyUpdate() {
  if (swRegistrationForUpdate && swRegistrationForUpdate.waiting) {
    swRegistrationForUpdate.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}
function initServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js').then(function(reg) {
    swRegistrationForUpdate = reg;
    if (reg.waiting) {
      document.getElementById('updateBanner')?.classList.add('visible');
    }
    reg.addEventListener('updatefound', function() {
      var w = reg.installing;
      if (!w) return;
      w.addEventListener('statechange', function() {
        if (w.state === 'installed' && navigator.serviceWorker.controller) {
          document.getElementById('updateBanner')?.classList.add('visible');
        }
      });
    });
  });
  navigator.serviceWorker.addEventListener('controllerchange', function() {
    document.getElementById('updateBanner')?.classList.remove('visible');
    location.reload();
  });
}

// ===== Install hint (Add to Home Screen) =====
var INSTALL_HINT_KEY = 'shifter_hide_install_hint';
function dismissInstallHint() {
  try { localStorage.setItem(INSTALL_HINT_KEY, '1'); } catch (e) {}
  document.getElementById('installHint')?.classList.remove('visible');
}
function maybeShowInstallHint() {
  const el = document.getElementById('installHint');
  if (!el) return;
  try {
    if (localStorage.getItem(INSTALL_HINT_KEY)) return;
  } catch (e) { return; }
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    (typeof navigator !== 'undefined' && navigator.standalone === true);
  if (isStandalone) return;
  el.classList.add('visible');
}
function initInstallHint() {
  setTimeout(function() {
    if (!document.getElementById('onboardingOverlay')?.classList?.contains('visible')) {
      maybeShowInstallHint();
    }
  }, 1500);
}

// ===== Offline indicator =====
function initOfflineIndicator() {
  const banner = document.getElementById('offlineBanner');
  if (!banner) return;
  function update() {
    banner.classList.toggle('visible', !navigator.onLine);
  }
  update();
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
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

  // Profile (wrapped to prevent blocking init if localStorage is unavailable)
  var savedName = null;
  try { savedName = loadUserName(); } catch (e) {}
  const nameInput = document.getElementById('settingUserName');
  if (nameInput && savedName) nameInput.value = savedName;

  updateMonthLabels();
  recalcAll();
  updateBackupDisplay();
  initOfflineIndicator();
  initServiceWorker();
  initInstallHint();

  // Onboarding: show if no name saved or empty
  if (!savedName || savedName.trim() === '') {
    const overlay = document.getElementById('onboardingOverlay');
    if (overlay) {
      overlay.style.display = 'flex';
      requestAnimationFrame(() => overlay.classList.add('visible'));
      const nameField = document.getElementById('onboardingName');
      if (nameField) {
        nameField.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') completeOnboarding();
        });
      }
    }
  } else {
    updateGreeting();
  }
}
