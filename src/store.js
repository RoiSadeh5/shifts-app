/**
 * Store – IndexedDB + localStorage for shifts, history, settings, savings.
 * db: IndexedDB wrapper. dataManager: load/save API. Uses globals from app.js.
 */
/* ========== IndexedDB ========== */
var DB_NAME = 'sachash-db';
var DB_VERSION = 2;
var dbInstance = null;
window.dbReady = new Promise(function(resolve) {
  if (typeof indexedDB === 'undefined') { resolve(null); return; }
  var req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onerror = function() { resolve(null); };
  req.onsuccess = function() {
    dbInstance = req.result;
    resolve(dbInstance);
  };
  req.onupgradeneeded = function(e) {
    var db = e.target.result;
    if (!db.objectStoreNames.contains('shifts')) db.createObjectStore('shifts', { keyPath: 'k' });
    if (!db.objectStoreNames.contains('history')) db.createObjectStore('history', { keyPath: 'k' });
    if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
    if (!db.objectStoreNames.contains('templates')) db.createObjectStore('templates', { keyPath: 'id' });
  };
});

window.db = {
  getShifts: function() {
    return new Promise(function(resolve) {
      if (!dbInstance) { resolve(null); return; }
      var tx = dbInstance.transaction('shifts', 'readonly');
      var req = tx.objectStore('shifts').get('main');
      req.onsuccess = function() { var arr = req.result ? req.result.v : null; resolve(Array.isArray(arr) ? arr : []); };
      req.onerror = function() { resolve([]); };
    });
  },
  saveShifts: function(list) {
    return new Promise(function(resolve, reject) {
      if (!dbInstance) { resolve(); return; }
      var tx = dbInstance.transaction('shifts', 'readwrite');
      tx.objectStore('shifts').put({ k: 'main', v: list || [] });
      tx.oncomplete = function() { resolve(); };
      tx.onerror = function() { reject(tx.error); };
    });
  },
  getHistory: function() {
    return new Promise(function(resolve) {
      if (!dbInstance) { resolve(null); return; }
      var tx = dbInstance.transaction('history', 'readonly');
      var req = tx.objectStore('history').get('main');
      req.onsuccess = function() { var h = req.result ? req.result.v : null; resolve(h && typeof h === 'object' ? h : {}); };
      req.onerror = function() { resolve({}); };
    });
  },
  saveHistory: function(h) {
    return new Promise(function(resolve, reject) {
      if (!dbInstance) { resolve(); return; }
      var tx = dbInstance.transaction('history', 'readwrite');
      tx.objectStore('history').put({ k: 'main', v: h || {} });
      tx.oncomplete = function() { resolve(); };
      tx.onerror = function() { reject(tx.error); };
    });
  },
  getMeta: function(key) {
    return new Promise(function(resolve) {
      if (!dbInstance) { resolve(null); return; }
      var tx = dbInstance.transaction('meta', 'readonly');
      var req = tx.objectStore('meta').get(key);
      req.onsuccess = function() { resolve(req.result ? req.result.value : null); };
      req.onerror = function() { resolve(null); };
    });
  },
  setMeta: function(key, value) {
    return new Promise(function(resolve, reject) {
      if (!dbInstance) { resolve(); return; }
      var tx = dbInstance.transaction('meta', 'readwrite');
      tx.objectStore('meta').put({ key: key, value: value });
      tx.oncomplete = function() { resolve(); };
      tx.onerror = function() { reject(tx.error); };
    });
  },
  getTemplates: function() {
    return new Promise(function(resolve) {
      if (!dbInstance) { resolve([]); return; }
      var tx = dbInstance.transaction('templates', 'readonly');
      var req = tx.objectStore('templates').getAll();
      req.onsuccess = function() { resolve(req.result || []); };
      req.onerror = function() { resolve([]); };
    });
  },
  saveTemplate: function(tpl) {
    return new Promise(function(resolve, reject) {
      if (!dbInstance) { resolve(); return; }
      var tx = dbInstance.transaction('templates', 'readwrite');
      tx.objectStore('templates').put(tpl);
      tx.oncomplete = function() { resolve(); };
      tx.onerror = function() { reject(tx.error); };
    });
  },
  deleteTemplate: function(id) {
    return new Promise(function(resolve, reject) {
      if (!dbInstance) { resolve(); return; }
      var tx = dbInstance.transaction('templates', 'readwrite');
      tx.objectStore('templates').delete(id);
      tx.oncomplete = function() { resolve(); };
      tx.onerror = function() { reject(tx.error); };
    });
  }
};

/* ========== Data Manager ========== */
var SHIFTS_KEY = 'shifter_shifts';
var SETTINGS_KEY = 'shifter_settings';
var HISTORY_KEY = 'shifter_history';
var BACKUP_TS_KEY = 'shifter_last_backup';
var LEAVE_KEY = 'shifter_leave';
var USERNAME_KEY = 'shifter_username';
var SAVINGS_KEY = 'shifter_savings';
var _cache = { shifts: [], history: {}, ready: false };

function initDataStore() {
  return new Promise(function(resolve) {
    if (typeof window === 'undefined' || !window.dbReady) {
      _loadFromLocalStorage();
      _cache.ready = true;
      resolve();
      return;
    }
    window.dbReady.then(function() {
      if (!window.db) {
        _loadFromLocalStorage();
        _cache.ready = true;
        resolve();
        return;
      }
      window.db.getShifts().then(function(arr) {
        var hasIdbShifts = arr && arr.length > 0;
        var lsShifts = [];
        try { lsShifts = JSON.parse(localStorage.getItem(SHIFTS_KEY)) || []; } catch (e) {}
        if (!hasIdbShifts && lsShifts.length > 0) {
          _cache.shifts = lsShifts;
          window.db.saveShifts(lsShifts).catch(function() {});
        } else {
          _cache.shifts = arr || [];
        }
        return window.db.getHistory();
      }).then(function(h) {
        var hasIdbHistory = h && Object.keys(h).length > 0;
        var lsHistory = {};
        try { lsHistory = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}; } catch (e) {}
        if (!hasIdbHistory && Object.keys(lsHistory).length > 0) {
          _cache.history = lsHistory;
          window.db.saveHistory(lsHistory).catch(function() {});
        } else {
          _cache.history = h || {};
        }
        _cache.ready = true;
        resolve();
      }).catch(function() {
        _loadFromLocalStorage();
        _cache.ready = true;
        resolve();
      });
    }).catch(function() {
      _loadFromLocalStorage();
      _cache.ready = true;
      resolve();
    });
  });
}

function _loadFromLocalStorage() {
  try {
    _cache.shifts = JSON.parse(localStorage.getItem(SHIFTS_KEY)) || [];
    _cache.history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
  } catch (e) {
    _cache.shifts = [];
    _cache.history = {};
  }
}

function loadShifts() {
  return _cache.ready ? _cache.shifts : (function() {
    try { return JSON.parse(localStorage.getItem(SHIFTS_KEY)) || []; }
    catch { return []; }
  })();
}

function saveShifts(list) {
  _cache.shifts = list || [];
  if (typeof window !== 'undefined' && window.db) {
    window.db.saveShifts(_cache.shifts).catch(function() {
      try { localStorage.setItem(SHIFTS_KEY, JSON.stringify(list)); } catch (e) {}
    });
  } else {
    try { localStorage.setItem(SHIFTS_KEY, JSON.stringify(list)); } catch (e) {}
  }
}

function loadHistory() {
  return _cache.ready ? _cache.history : (function() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}; }
    catch { return {}; }
  })();
}

function saveHistory(h) {
  _cache.history = h || {};
  if (typeof window !== 'undefined' && window.db) {
    window.db.saveHistory(_cache.history).catch(function() {
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch (e) {}
    });
  } else {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch (e) {}
  }
}

function loadPayslip(year, month) {
  var history = loadHistory();
  var yearKey = String(year);
  return (history[yearKey] && history[yearKey][month]) || null;
}

function savePayslip(year, month, data) {
  var history = loadHistory();
  var yearKey = String(year);
  if (!history[yearKey]) history[yearKey] = {};
  history[yearKey][month] = Object.assign({}, history[yearKey][month] || {}, data);
  saveHistory(history);
}

function loadSettings() {
  try {
    var s = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (s) {
      userRates.baseRate = s.baseRate || 75;
      userRates.weekendMultiplier = s.weekendMul || 1.5;
      userRates.vacationDayRate = s.vacationRate || 1750;
      userRates.bonusQuarterly = s.bonus || 3500;
      if (s.creditPoints !== undefined) creditPoints = s.creditPoints;
      if (s.deductions) dedSettings = Object.assign({}, dedSettings, s.deductions);
      if (s.showCharts !== undefined) showCharts = !!s.showCharts;
      if (s.notificationsEnabled !== undefined) notificationsEnabled = !!s.notificationsEnabled;
    }
  } catch (e) {}
}

function saveDedSettings() {
  var existing = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  existing.deductions = dedSettings;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(existing));
  render();
}

function getLastBackupTime() {
  return localStorage.getItem(BACKUP_TS_KEY) || null;
}

function exportShiftsCSV() {
  var shifts = loadShifts().filter(function(s) {
    var p = s.date.split('-');
    return parseInt(p[1], 10) - 1 === currentMonth && parseInt(p[0], 10) === currentYear;
  }).sort(function(a, b) { return a.date.localeCompare(b.date); });
  var monthLabel = (typeof hebrewMonths !== 'undefined') ? hebrewMonths[currentMonth] + '_' + currentYear : (currentMonth + 1) + '_' + currentYear;
  var BOM = '\uFEFF';
  var header = 'תאריך,סוג,שעות,תשלום';
  var rows = shifts.map(function(s) {
    var typeName = (typeof typeNames !== 'undefined' && typeNames[s.type]) ? typeNames[s.type] : s.type;
    var hours = (s.result && s.result.totalHours != null) ? s.result.totalHours : 0;
    var pay = (s.result && s.result.totalPay != null) ? s.result.totalPay : 0;
    return [s.date, typeName, hours, pay].join(',');
  });
  var csv = BOM + header + '\n' + rows.join('\n');
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'sachash-mashmarot-' + monthLabel + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  haptic();
  showToast('📊 ייצוא CSV הושלם');
}

function exportData() {
  var data = {
    version: '5.1',
    exportedAt: new Date().toISOString(),
    shifts: loadShifts(),
    settings: JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'),
    history: loadHistory(),
    leave: loadLeaveBalances(),
    userName: loadUserName(),
    savings: typeof loadSavings === 'function' ? loadSavings() : null,
  };
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'sachash-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  localStorage.setItem(BACKUP_TS_KEY, new Date().toISOString());
  updateBackupDisplay();
  haptic();
  showToast('📤 הגיבוי יוצא בהצלחה');
}

function importData(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    try {
      var data = JSON.parse(ev.target.result);
      if (!data.shifts && !data.settings && !data.history) {
        showToast('⚠️ קובץ לא תקין');
        return;
      }
      showConfirm('ייבוא גיבוי', 'פעולה זו תשחזר את כל הנתונים מהגיבוי. נתונים קיימים ימוזגו. להמשיך?', function() {
        var shiftsAdded = 0;
        if (data.shifts) {
          var existing = loadShifts();
          var existingIds = new Set(existing.map(function(s) { return s.id; }));
          var newShifts = data.shifts.filter(function(s) { return !existingIds.has(s.id); });
          saveShifts(existing.concat(newShifts));
          shiftsAdded = newShifts.length;
        }
        if (data.history) {
          var existingH = loadHistory();
          Object.keys(data.history).forEach(function(y) {
            if (!existingH[y]) existingH[y] = {};
            Object.assign(existingH[y], data.history[y]);
          });
          saveHistory(existingH);
        }
        if (data.leave) {
          saveLeaveBalances(data.leave);
          var vacEl = document.getElementById('settingVacBal');
          if (vacEl) vacEl.value = data.leave.vacation || 0;
          var sickEl = document.getElementById('settingSickBal');
          if (sickEl) sickEl.value = data.leave.sick || 0;
        }
        if (data.userName) {
          saveUserName(data.userName);
          var nameInput = document.getElementById('settingUserName');
          if (nameInput) nameInput.value = data.userName;
          updateGreeting();
        }
        if (data.savings && typeof data.savings === 'object') {
          try { localStorage.setItem(SAVINGS_KEY, JSON.stringify(data.savings)); } catch (e) {}
        }
        if (data.settings && typeof data.settings === 'object') {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
          loadSettings();
          document.getElementById('settingBase').value = userRates.baseRate;
          document.getElementById('settingWeekend').value = userRates.weekendMultiplier;
          document.getElementById('settingVacation').value = userRates.vacationDayRate;
          document.getElementById('settingBonus').value = userRates.bonusQuarterly;
          document.getElementById('settingCreditPts').value = creditPoints;
          var tP = document.getElementById('togglePension'); if (tP) tP.classList.toggle('on', dedSettings.pension);
          var tS = document.getElementById('toggleStudy'); if (tS) tS.classList.toggle('on', dedSettings.study);
          var tN = document.getElementById('toggleNI'); if (tN) tN.classList.toggle('on', dedSettings.ni);
          var tI = document.getElementById('toggleIncomeTax'); if (tI) tI.classList.toggle('on', dedSettings.incomeTax);
          var t2025 = document.getElementById('toggleTaxYear2025');
          if (t2025) t2025.classList.toggle('on', dedSettings.taxYear2025);
          var tSimple = document.getElementById('toggleSimpleMode');
          if (tSimple) tSimple.classList.toggle('on', dedSettings.simpleMode);
        }
        recalcAll();
        renderCalendar();
        showToast('📥 יובאו ' + shiftsAdded + ' משמרות + הגדרות');
      }, 'שחזר');
    } catch (e) { showToast('⚠️ קובץ לא תקין'); }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function formatBackupTime(isoStr) {
  if (!isoStr) return null;
  var d = new Date(isoStr);
  var now = new Date();
  var diffMs = now - d;
  var diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'היום';
  if (diffDays === 1) return 'אתמול';
  if (diffDays < 7) return 'לפני ' + diffDays + ' ימים';
  if (diffDays < 30) return 'לפני ' + Math.floor(diffDays / 7) + ' שבועות';
  return d.toLocaleDateString('he-IL');
}

function updateBackupDisplay() {
  var el = document.getElementById('lastBackupInfo');
  if (!el) return;
  var ts = getLastBackupTime();
  if (ts) {
    el.textContent = 'גיבוי אחרון: ' + formatBackupTime(ts);
    el.style.color = 'var(--green)';
  } else {
    el.textContent = 'לא בוצע גיבוי עדיין';
    el.style.color = 'var(--orange)';
  }
}

function loadLeaveBalances() {
  try { return JSON.parse(localStorage.getItem(LEAVE_KEY)) || { vacation: 0, sick: 0 }; }
  catch (e) { return { vacation: 0, sick: 0 }; }
}

function saveLeaveBalances(balances) {
  try { localStorage.setItem(LEAVE_KEY, JSON.stringify(balances)); } catch (e) {}
}

function loadUserName() {
  return localStorage.getItem(USERNAME_KEY) || null;
}

function saveUserName(name) {
  try { localStorage.setItem(USERNAME_KEY, (name || '').trim()); } catch (e) {}
}

/* ========== Savings ========== */
var SAVINGS_DEFAULT_RETURN = 7;
function loadSavings() {
  try {
    var s = JSON.parse(localStorage.getItem(SAVINGS_KEY));
    if (s) {
      var general = Array.isArray(s.general) ? s.general : [];
      return {
        pension: { balance: s.pension && s.pension.balance != null ? s.pension.balance : 0, returnRate: s.pension && s.pension.returnRate != null ? s.pension.returnRate : SAVINGS_DEFAULT_RETURN, contributions: (s.pension && s.pension.contributions) || {} },
        study: { balance: s.study && s.study.balance != null ? s.study.balance : 0, returnRate: s.study && s.study.returnRate != null ? s.study.returnRate : SAVINGS_DEFAULT_RETURN, contributions: (s.study && s.study.contributions) || {} },
        general: general
      };
    }
  } catch (e) {}
  return {
    pension: { balance: 0, returnRate: SAVINGS_DEFAULT_RETURN, contributions: {} },
    study: { balance: 0, returnRate: SAVINGS_DEFAULT_RETURN, contributions: {} },
    general: []
  };
}

function saveSavings(savings) {
  try { localStorage.setItem(SAVINGS_KEY, JSON.stringify(savings)); } catch (e) {}
}

function updateSavingsFromPayslip(year, month, slipData) {
  var savings = loadSavings();
  var ded = typeof calcDeductions === 'function' ? calcDeductions(slipData.gross || 0) : { employee: { pension: 0, study: 0 }, employer: { pension: 0, study: 0 } };
  var empPension = ded.employer && ded.employer.pension != null ? ded.employer.pension : 0;
  var empStudy = ded.employer && ded.employer.study != null ? ded.employer.study : 0;
  var slipPension = slipData.pension != null ? slipData.pension : (ded.employee && ded.employee.pension) || 0;
  var slipStudy = slipData.study != null ? slipData.study : (ded.employee && ded.employee.study) || 0;
  var pensionContrib = (slipPension || 0) + (empPension || 0);
  var studyContrib = (slipStudy || 0) + (empStudy || 0);
  if (dedSettings && !dedSettings.pension) pensionContrib = 0;
  if (dedSettings && !dedSettings.study) studyContrib = 0;
  var ym = year + '-' + month;
  var prevPension = savings.pension.contributions[ym] || 0;
  var prevStudy = savings.study.contributions[ym] || 0;
  savings.pension.balance = (savings.pension.balance || 0) - prevPension + pensionContrib;
  savings.study.balance = (savings.study.balance || 0) - prevStudy + studyContrib;
  savings.pension.contributions[ym] = pensionContrib;
  savings.study.contributions[ym] = studyContrib;
  saveSavings(savings);
}

function updateSavingsBalance(fund, balance) {
  var savings = loadSavings();
  var f = savings[fund];
  if (f) { f.balance = Math.max(0, parseFloat(balance) || 0); saveSavings(savings); }
}

function updateSavingsReturnRate(fund, rate) {
  var savings = loadSavings();
  var f = savings[fund];
  if (f) { var r = parseFloat(rate); f.returnRate = isNaN(r) ? SAVINGS_DEFAULT_RETURN : Math.max(0, Math.min(20, r)); saveSavings(savings); }
}

function addGeneralSavingsEntry(name, amount) {
  var savings = loadSavings();
  if (!savings.general) savings.general = [];
  var id = 'g' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  savings.general.push({ id: id, name: (name || '').trim() || 'חסכון', amount: Math.max(0, parseFloat(amount) || 0) });
  saveSavings(savings);
}

function updateGeneralSavingsEntry(id, name, amount) {
  var savings = loadSavings();
  if (!savings.general) return;
  var e = savings.general.find(function(x) { return x.id === id; });
  if (e) { e.name = (name || '').trim() || 'חסכון'; e.amount = Math.max(0, parseFloat(amount) || 0); saveSavings(savings); }
}

function deleteGeneralSavingsEntry(id) {
  var savings = loadSavings();
  if (!savings.general) return;
  savings.general = savings.general.filter(function(x) { return x.id !== id; });
  saveSavings(savings);
}
