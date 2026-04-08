/**
 * שכ״ש – Main Application
 * Shared state, constants, engine bridge, navigation, utilities, and init.
 * Loaded after src/logic/salaryEngine.js, before store and component scripts.
 */
// ===== Bridge to Salary Engine =====
var SalaryEngine = window.SalaryEngine || { DEFAULTS: { baseRate: 75, weekendMultiplier: 1.5, vacationDayRate: 1750, bonusQuarterly: 3500 }, calculateShiftPay: function() { return {}; }, calcDeductions: function() { return { employee: {}, employer: {} }; }, calcIncomeTax: function() { return { finalTax: 0, tiers: [] }; }, calculateFixedMonthlyAdditions: function() { return { total: 0 }; } };

var userRates = Object.assign({}, SalaryEngine.DEFAULTS || { baseRate: 75, weekendMultiplier: 1.5, vacationDayRate: 1750, bonusQuarterly: 3500 });
var creditPoints = 2.25;
var dedSettings = { pension: true, study: true, ni: true, incomeTax: true, taxYear2025: false, simpleMode: false };
var showCharts = false;
var notificationsEnabled = false;

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

// ===== Lazy-load heavy libs (Chart.js, jsPDF) =====
var _chartJsReady = null;
function loadChartJs() {
  if (typeof Chart !== 'undefined') return Promise.resolve();
  if (_chartJsReady) return _chartJsReady;
  _chartJsReady = new Promise(function(resolve, reject) {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js';
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return _chartJsReady;
}

var _jspdfReady = null;
function loadJspdf() {
  if (window.jspdf && typeof window.jspdf.jsPDF !== 'undefined') return Promise.resolve();
  if (_jspdfReady) return _jspdfReady;
  _jspdfReady = new Promise(function(resolve, reject) {
    var s1 = document.createElement('script');
    s1.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js';
    s1.async = true;
    s1.onload = function() {
      var s2 = document.createElement('script');
      s2.src = 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js';
      s2.async = true;
      s2.onload = resolve;
      s2.onerror = reject;
      document.head.appendChild(s2);
    };
    s1.onerror = reject;
    document.head.appendChild(s1);
  });
  return _jspdfReady;
}

// ===== Utilities =====
function fmtNIS(n) { return `₪${Math.round(n).toLocaleString()}`; }

function haptic(light) {
  try {
    if (navigator.vibrate) navigator.vibrate(light ? 10 : 20);
  } catch (e) {}
}

function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2500);
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

// ===== Tutorial (5 slides, first-time) =====
var TUTORIAL_KEY = 'shifter_tutorial_complete';
function isTutorialComplete() {
  try { return localStorage.getItem(TUTORIAL_KEY) === '1'; } catch (e) { return false; }
}
function setTutorialComplete() {
  try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch (e) {}
}

var tutorialSlide = 0;
var TUTORIAL_TOTAL = 5;

function initTutorialDots() {
  var container = document.getElementById('tutorialDots');
  if (!container) return;
  container.innerHTML = '';
  for (var i = 0; i < TUTORIAL_TOTAL; i++) {
    var dot = document.createElement('span');
    dot.className = 'tutorial-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-hidden', 'true');
    container.appendChild(dot);
  }
}

function updateTutorialUI() {
  var slides = document.querySelectorAll('.tutorial-slide');
  var dots = document.querySelectorAll('.tutorial-dot');
  var backBtn = document.getElementById('tutorialBack');
  var nextBtn = document.getElementById('tutorialNext');
  var startBtn = document.getElementById('tutorialStart');
  slides.forEach(function(s, i) { s.classList.toggle('active', i === tutorialSlide); });
  dots.forEach(function(d, i) { d.classList.toggle('active', i === tutorialSlide); });
  if (backBtn) backBtn.style.display = tutorialSlide === 0 ? 'none' : '';
  if (nextBtn) nextBtn.style.display = tutorialSlide === TUTORIAL_TOTAL - 1 ? 'none' : '';
  if (startBtn) startBtn.style.display = tutorialSlide === TUTORIAL_TOTAL - 1 ? '' : 'none';
}

function showTutorial() {
  var overlay = document.getElementById('tutorialOverlay');
  if (!overlay) return;
  tutorialSlide = 0;
  initTutorialDots();
  updateTutorialUI();
  overlay.style.display = 'flex';
  overlay.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(function() { overlay.classList.add('visible'); });
}

function hideTutorial() {
  var overlay = document.getElementById('tutorialOverlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  setTimeout(function() {
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
  }, 250);
}

function skipTutorial() {
  if (typeof haptic === 'function') haptic(true);
  setTutorialComplete();
  hideTutorial();
  maybeShowNameOnboarding();
}

function tutorialNext() {
  if (typeof haptic === 'function') haptic(true);
  if (tutorialSlide < TUTORIAL_TOTAL - 1) {
    tutorialSlide++;
    updateTutorialUI();
  }
}

function tutorialPrev() {
  if (typeof haptic === 'function') haptic(true);
  if (tutorialSlide > 0) {
    tutorialSlide--;
    updateTutorialUI();
  }
}

function completeTutorial() {
  if (typeof haptic === 'function') haptic(true);
  setTutorialComplete();
  hideTutorial();
  maybeShowNameOnboarding();
}

function maybeShowNameOnboarding() {
  var savedName = null;
  try { savedName = typeof loadUserName === 'function' ? loadUserName() : null; } catch (e) {}
  if (!savedName || String(savedName).trim() === '') {
    var overlay = document.getElementById('onboardingOverlay');
    if (overlay) {
      overlay.style.display = 'flex';
      requestAnimationFrame(function() { overlay.classList.add('visible'); });
      var nameField = document.getElementById('onboardingName');
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

function updateAdminButtonLabel() {
  var btn = document.getElementById('adminPanelBtn');
  if (!btn) return;
  var admin = typeof isAdminLoggedIn === 'function' && isAdminLoggedIn();
  btn.textContent = admin ? 'לוח מנהל' : 'כניסה כמנהל';
}

function saveUserNameSetting() {
  const input = document.getElementById('settingUserName');
  const name = (input.value || '').trim();
  saveUserName(name);
  updateGreeting();
  showToast('השם עודכן');
}

// ===== Tab Navigation (SPA View Switcher) =====
function switchTab(name) {
  var targetPage = document.getElementById('page' + name);
  var targetTab = document.getElementById('tab' + name);
  if (!targetPage || !targetTab) return;
  if (targetPage.classList.contains('active') && !targetPage.classList.contains('hidden')) return;
  haptic(true);
  try { localStorage.setItem('shifter_current_tab', name); } catch (e) {}
  document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
  targetTab.classList.add('active');
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.remove('active');
    p.classList.add('hidden');
    p.removeAttribute('style');
  });
  targetPage.classList.remove('hidden');
  targetPage.classList.add('active');
  window.scrollTo(0, 0);
  if (name === 'Dashboard') {
    updateGreeting();
    requestAnimationFrame(function() { requestAnimationFrame(render); });
  } else if (name === 'Calendar') {
    requestAnimationFrame(function() { requestAnimationFrame(renderCalendar); });
  } else if (name === 'Annual') {
    requestAnimationFrame(function() { requestAnimationFrame(renderAnnual); });
  } else if (name === 'Add' && typeof renderTemplates === 'function') {
    requestAnimationFrame(function() { requestAnimationFrame(renderTemplates); });
  } else if (name === 'Savings' && typeof renderSavings === 'function') {
    requestAnimationFrame(function() { requestAnimationFrame(renderSavings); });
  } else if (name === 'Settings') {
    updateAdminButtonLabel();
    if (typeof initSettingsView === 'function') initSettingsView();
  }
  if (name !== 'Dashboard') {
    var titles = { Add: 'הוספת משמרת', Calendar: 'לוח שנה', Annual: 'סיכום שנתי', Settings: 'הגדרות', Savings: 'חסכון פנסיוני' };
    var titleEl = document.getElementById('pageTitle');
    if (titleEl) {
      titleEl.classList.remove('greeting-animated');
      titleEl.textContent = titles[name] || 'שכ״ש';
    }
  }
}

// ===== Month Navigation =====
var changeMonthPending = false;
function changeMonth(delta) {
  if (changeMonthPending) return;
  changeMonthPending = true;
  currentMonth += delta;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  updateMonthLabels();
  render();
  renderCalendar();
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { changeMonthPending = false; });
  });
}

function updateMonthLabels() {
  var lbl = hebrewMonths[currentMonth] + ' ' + currentYear;
  var ml = document.getElementById('monthLabel');
  if (ml) ml.textContent = lbl;
  var cml = document.getElementById('calMonthLabel');
  if (cml) cml.textContent = lbl;
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
var deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  deferredInstallPrompt = e;
  maybeShowInstallHint();
});

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function dismissInstallHint() {
  try { localStorage.setItem(INSTALL_HINT_KEY, '1'); } catch (e) {}
  document.getElementById('installHint')?.classList.remove('visible');
}

function triggerAddToHomeScreen() {
  haptic(true);
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(function(choice) {
      if (choice.outcome === 'accepted') {
        showToast('נוסף למסך הבית ✓');
        dismissInstallHint();
      }
      deferredInstallPrompt = null;
    });
  } else if (isIOS()) {
    showToast('הקש על כפתור השיתוף בתחתית ← הוסף למסך הבית');
  } else {
    showToast('בתפריט הדפדפן: הוסף למסך הבית או התקן');
  }
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
  try {
    var shifts = typeof loadShifts === 'function' ? loadShifts() : [];
    if (!Array.isArray(shifts)) return;
    for (var i = 0; i < shifts.length; i++) {
      shifts[i].result = calculateShiftPay(shifts[i]);
    }
    if (typeof saveShifts === 'function') saveShifts(shifts);
    if (typeof render === 'function') render();
  } catch (e) {
    console.error('recalcAll error:', e);
  }
}

// ===== Refresh Current View (no tab switch) =====
function refreshCurrentView() {
  var active = document.querySelector('.page.active');
  if (!active) return;
  var id = active.id || '';
  if (id === 'pageDashboard') {
    if (typeof render === 'function') render();
    if (typeof renderCalendar === 'function') renderCalendar();
  } else if (id === 'pageCalendar') {
    if (typeof renderCalendar === 'function') renderCalendar();
  } else if (id === 'pageAnnual') {
    if (typeof renderAnnual === 'function') renderAnnual();
  } else if (id === 'pageAdd') {
    if (typeof renderTemplates === 'function') renderTemplates();
  } else if (id === 'pageSavings') {
    if (typeof renderSavings === 'function') renderSavings();
  } else if (id === 'pageSettings') {
    if (typeof initSettingsView === 'function') initSettingsView();
  }
}

// ===== Initialization (local-only storage) =====

function showMainUIImmediately() {
  var tabBar = document.querySelector('.tab-bar');
  var header = document.querySelector('.header');
  if (tabBar) tabBar.removeAttribute('style');
  if (header) header.removeAttribute('style');
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.remove('active');
    p.classList.add('hidden');
    p.removeAttribute('style');
  });
  document.querySelectorAll('.tab').forEach(function(t) {
    t.classList.remove('active');
    t.removeAttribute('style');
  });
  var currentTab = '';
  try { currentTab = localStorage.getItem('shifter_current_tab') || 'Dashboard'; } catch (e) { currentTab = 'Dashboard'; }
  var validTabs = ['Dashboard', 'Calendar', 'Savings', 'Settings', 'Add', 'Annual'];
  if (validTabs.indexOf(currentTab) === -1) currentTab = 'Dashboard';
  var targetPage = document.getElementById('page' + currentTab);
  var targetTab = document.getElementById('tab' + currentTab);
  if (targetPage && targetTab) {
    targetPage.classList.remove('hidden');
    targetPage.classList.add('active');
    targetTab.classList.add('active');
    if (currentTab === 'Dashboard') {
      if (typeof updateGreeting === 'function') updateGreeting();
      if (typeof render === 'function') requestAnimationFrame(function() { requestAnimationFrame(render); });
    } else if (currentTab === 'Calendar' && typeof renderCalendar === 'function') {
      requestAnimationFrame(function() { requestAnimationFrame(renderCalendar); });
    } else if (currentTab === 'Annual' && typeof renderAnnual === 'function') {
      requestAnimationFrame(function() { requestAnimationFrame(renderAnnual); });
    } else if (currentTab === 'Add' && typeof renderTemplates === 'function') {
      requestAnimationFrame(function() { requestAnimationFrame(renderTemplates); });
    } else if (currentTab === 'Savings' && typeof renderSavings === 'function') {
      requestAnimationFrame(function() { requestAnimationFrame(renderSavings); });
    } else if (currentTab === 'Settings') {
      if (typeof updateAdminButtonLabel === 'function') updateAdminButtonLabel();
      if (typeof initSettingsView === 'function') initSettingsView();
    }
  } else {
    var dash = document.getElementById('pageDashboard');
    var dashTab = document.getElementById('tabDashboard');
    if (dash) { dash.classList.remove('hidden'); dash.classList.add('active'); }
    if (dashTab) dashTab.classList.add('active');
    if (typeof updateGreeting === 'function') updateGreeting();
    if (typeof render === 'function') requestAnimationFrame(function() { requestAnimationFrame(render); });
  }
}

async function init() {
  try {
    await initCore();
  } catch (e) {
    console.error('Init error:', e);
    if (typeof showToast === 'function') showToast('שגיאה בטעינה: ' + (e && e.message ? e.message : String(e)));
    var t = document.getElementById('toast');
    if (t) { t.textContent = 'שגיאה בטעינה – נסה לרענן'; t.classList.add('show'); }
    await initCore();
  }
}

async function initCore() {
  if (typeof loadSettings === 'function') loadSettings();
  if (typeof initDataStore === 'function') {
    try {
      await initDataStore();
    } catch (e) {
      console.warn('initDataStore fallback:', e);
    }
  }
  _applyInitFromData();
  showMainUIImmediately();
}

function _applyInitFromData() {
  var sb = document.getElementById('settingBase');
  if (sb) sb.value = userRates.baseRate;
  var sw = document.getElementById('settingWeekend'); if (sw) sw.value = userRates.weekendMultiplier;
  var sv = document.getElementById('settingVacation'); if (sv) sv.value = userRates.vacationDayRate;
  var sbon = document.getElementById('settingBonus'); if (sbon) sbon.value = userRates.bonusQuarterly;
  var scp = document.getElementById('settingCreditPts'); if (scp) scp.value = creditPoints;

  var tP = document.getElementById('togglePension'); if (tP) tP.classList.toggle('on', dedSettings.pension);
  var tS = document.getElementById('toggleStudy'); if (tS) tS.classList.toggle('on', dedSettings.study);
  var tN = document.getElementById('toggleNI'); if (tN) tN.classList.toggle('on', dedSettings.ni);
  var tI = document.getElementById('toggleIncomeTax'); if (tI) tI.classList.toggle('on', dedSettings.incomeTax);
  const t2025 = document.getElementById('toggleTaxYear2025');
  if (t2025) t2025.classList.toggle('on', dedSettings.taxYear2025);
  const tSimple = document.getElementById('toggleSimpleMode');
  if (tSimple) tSimple.classList.toggle('on', dedSettings.simpleMode);
  const tCharts = document.getElementById('toggleCharts');
  if (tCharts) tCharts.classList.toggle('on', showCharts);
  const tNotif = document.getElementById('toggleNotifications');
  if (tNotif) tNotif.classList.toggle('on', notificationsEnabled);

  var leave = typeof loadLeaveBalances === 'function' ? loadLeaveBalances() : { vacation: 0, sick: 0 };
  var vacEl = document.getElementById('settingVacBal'); if (vacEl) vacEl.value = leave.vacation;
  var sickEl = document.getElementById('settingSickBal'); if (sickEl) sickEl.value = leave.sick;

  var today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  var todayStr = y + '-' + m + '-' + d;
  var sd = document.getElementById('shiftDate'); if (sd) sd.value = todayStr;
  var rs = document.getElementById('rangeStart'); if (rs) rs.value = todayStr;
  var re = document.getElementById('rangeEnd'); if (re) re.value = todayStr;

  // Profile (wrapped to prevent blocking init if localStorage is unavailable)
  var savedName = null;
  try { savedName = loadUserName(); } catch (e) {}
  const nameInput = document.getElementById('settingUserName');
  if (nameInput && savedName) nameInput.value = savedName;

  updateMonthLabels();
  recalcAll();
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(function() { updateBackupDisplay(); }, { timeout: 500 });
  } else {
    updateBackupDisplay();
  }
  initOfflineIndicator();
  function deferNonCriticalInit() {
    initServiceWorker();
    initInstallHint();
    if (notificationsEnabled && typeof schedulePeriodicCheck === 'function') schedulePeriodicCheck();
  }
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(deferNonCriticalInit, { timeout: 2000 });
  } else {
    setTimeout(deferNonCriticalInit, 0);
  }

  // Hide Add to Home button in Settings when already installed
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator.standalone === true);
  var btnAdd = document.getElementById('btnAddToHome');
  if (btnAdd && isStandalone) btnAdd.style.display = 'none';

  if (typeof updateAdminButtonLabel === 'function') updateAdminButtonLabel();

  // Tutorial first (first-time only), then name onboarding if needed
  if (!isTutorialComplete()) {
    showTutorial();
  } else if (!savedName || savedName.trim() === '') {
    var overlay = document.getElementById('onboardingOverlay');
    if (overlay) {
      overlay.style.display = 'flex';
      requestAnimationFrame(function() { overlay.classList.add('visible'); });
      var nameField = document.getElementById('onboardingName');
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
