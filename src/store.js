/**
 * Store – IndexedDB + localStorage (per-device). User-scoped keys via local user id.
 */
var USER_ID_KEY = 'shifter_user_id';

function getCurrentUserId() {
  try {
    var id = localStorage.getItem(USER_ID_KEY);
    if (id) return id;
    id = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 15);
    localStorage.setItem(USER_ID_KEY, id);
    _registerUser(id);
    return id;
  } catch (e) { return 'u_unknown'; }
}

function _registerUser(userId) {
  var now = new Date().toISOString();
  window.dbReady.then(function() {
    if (!dbInstance) return;
    var tx = dbInstance.transaction('meta', 'readwrite');
    var getReq = tx.objectStore('meta').get('_user_registry');
    getReq.onsuccess = function() {
      var reg = getReq.result ? (getReq.result.value || []) : [];
      if (!Array.isArray(reg)) reg = [];
      var entry = reg.find(function(r) { return r.userId === userId; });
      if (!entry) reg.push({ userId: userId, firstSeen: now, lastActive: now });
      else entry.lastActive = now;
      tx.objectStore('meta').put({ key: '_user_registry', value: reg });
    };
  });
}

function touchUserActivity() {
  var uid = getCurrentUserId();
  window.dbReady.then(function() {
    if (!dbInstance) return;
    var tx = dbInstance.transaction('meta', 'readwrite');
    var getReq = tx.objectStore('meta').get('_user_registry');
    getReq.onsuccess = function() {
      var reg = getReq.result ? (getReq.result.value || []) : [];
      var entry = reg.find(function(r) { return r.userId === uid; });
      if (entry) entry.lastActive = new Date().toISOString();
      else reg.push({ userId: uid, firstSeen: new Date().toISOString(), lastActive: new Date().toISOString() });
      tx.objectStore('meta').put({ key: '_user_registry', value: reg });
    };
  });
}

/* ========== IndexedDB ========== */
var DB_NAME = 'sachash-db';
var DB_VERSION = 3;
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

function _shiftsKey() { return 'main_' + getCurrentUserId(); }
function _historyKey() { return 'main_' + getCurrentUserId(); }

function _shiftsKeyFor(userId) { return 'main_' + (userId || getCurrentUserId()); }
function _historyKeyFor(userId) { return 'main_' + (userId || getCurrentUserId()); }

/** Read local data for a given userId (admin / diagnostics). Returns Promise<{shifts,history,settings,profile,savings}> */
window.getLocalDataForUserId = function(userId) {
  if (!userId) return Promise.resolve({ shifts: [], history: {}, settings: {}, profile: { username: null, leave: { vacation: 0, sick: 0 } }, savings: null });
  var pre = 'shifter_';
  var result = {
    shifts: [],
    history: {},
    settings: {},
    profile: { username: null, leave: { vacation: 0, sick: 0 }, lastBackup: null },
    savings: null
  };
  try {
    result.shifts = JSON.parse(localStorage.getItem(pre + 'shifts_' + userId) || '[]') || [];
    result.history = JSON.parse(localStorage.getItem(pre + 'history_' + userId) || '{}') || {};
    result.settings = JSON.parse(localStorage.getItem(pre + 'settings_' + userId) || '{}') || {};
    result.profile.leave = JSON.parse(localStorage.getItem(pre + 'leave_' + userId) || '{}') || { vacation: 0, sick: 0 };
    result.profile.username = localStorage.getItem(pre + 'username_' + userId);
    result.savings = JSON.parse(localStorage.getItem(pre + 'savings_' + userId) || 'null');
  } catch (e) {}
  if (!dbInstance || !window.dbReady) return Promise.resolve(result);
  return window.dbReady.then(function() {
    if (!dbInstance) return result;
    return new Promise(function(resolve) {
      var tx = dbInstance.transaction(['shifts', 'history'], 'readonly');
      var shiftsReq = tx.objectStore('shifts').get(_shiftsKeyFor(userId));
      var histReq = tx.objectStore('history').get(_historyKeyFor(userId));
      var done = 0;
      function check() {
        done++;
        if (done >= 2) resolve(result);
      }
      shiftsReq.onsuccess = function() {
        var v = shiftsReq.result ? shiftsReq.result.v : null;
        if (Array.isArray(v) && v.length > 0) result.shifts = v;
        check();
      };
      shiftsReq.onerror = check;
      histReq.onsuccess = function() {
        var v = histReq.result ? histReq.result.v : null;
        if (v && typeof v === 'object' && Object.keys(v).length > 0) result.history = v;
        check();
      };
      histReq.onerror = check;
    });
  });
};

window.db = {
  getShifts: function() {
    return new Promise(function(resolve) {
      if (!dbInstance) { resolve(null); return; }
      var tx = dbInstance.transaction('shifts', 'readonly');
      var key = _shiftsKey();
      var req = tx.objectStore('shifts').get(key);
      req.onsuccess = function() {
        var arr = req.result ? req.result.v : null;
        if (Array.isArray(arr)) { resolve(arr); return; }
        var legReq = tx.objectStore('shifts').get('main');
        legReq.onsuccess = function() {
          var old = legReq.result ? legReq.result.v : null;
          resolve(Array.isArray(old) ? old : []);
        };
        legReq.onerror = function() { resolve([]); };
      };
      req.onerror = function() { resolve([]); };
    });
  },
  saveShifts: function(list) {
    return new Promise(function(resolve, reject) {
      if (!dbInstance) { resolve(); return; }
      var tx = dbInstance.transaction('shifts', 'readwrite');
      tx.objectStore('shifts').put({ k: _shiftsKey(), v: list || [] });
      tx.oncomplete = function() { resolve(); };
      tx.onerror = function() { reject(tx.error); };
    });
  },
  getHistory: function() {
    return new Promise(function(resolve) {
      if (!dbInstance) { resolve(null); return; }
      var tx = dbInstance.transaction('history', 'readonly');
      var key = _historyKey();
      var req = tx.objectStore('history').get(key);
      req.onsuccess = function() {
        var h = req.result ? req.result.v : null;
        if (h && typeof h === 'object') { resolve(h); return; }
        var legReq = tx.objectStore('history').get('main');
        legReq.onsuccess = function() {
          var old = legReq.result ? legReq.result.v : null;
          resolve(old && typeof old === 'object' ? old : {});
        };
        legReq.onerror = function() { resolve({}); };
      };
      req.onerror = function() { resolve({}); };
    });
  },
  saveHistory: function(h) {
    return new Promise(function(resolve, reject) {
      if (!dbInstance) { resolve(); return; }
      var tx = dbInstance.transaction('history', 'readwrite');
      tx.objectStore('history').put({ k: _historyKey(), v: h || {} });
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
      var uid = getCurrentUserId();
      var tx = dbInstance.transaction('templates', 'readonly');
      var req = tx.objectStore('templates').getAll();
      req.onsuccess = function() {
        var list = (req.result || []).filter(function(t) {
          return !t.userId || t.userId === uid;
        });
        resolve(list);
      };
      req.onerror = function() { resolve([]); };
    });
  },
  saveTemplate: function(tpl) {
    return new Promise(function(resolve, reject) {
      if (!dbInstance) { resolve(); return; }
      var obj = Object.assign({}, tpl, { userId: getCurrentUserId() });
      var tx = dbInstance.transaction('templates', 'readwrite');
      tx.objectStore('templates').put(obj);
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
function _storageKey(base) { return base + '_' + getCurrentUserId(); }
var SHIFTS_KEY = 'shifter_shifts';
var SETTINGS_KEY = 'shifter_settings';
var HISTORY_KEY = 'shifter_history';
var BACKUP_TS_KEY = 'shifter_last_backup';
var LEAVE_KEY = 'shifter_leave';
var USERNAME_KEY = 'shifter_username';
var SAVINGS_KEY = 'shifter_savings';
var _cache = { shifts: [], history: {}, settings: {}, profile: {}, savings: null, ready: false };

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
        var sk = _storageKey(SHIFTS_KEY);
        var lsShifts = [];
        try { lsShifts = JSON.parse(localStorage.getItem(sk)) || []; } catch (e) {}
        if (!hasIdbShifts && lsShifts.length > 0) {
          _cache.shifts = lsShifts;
          window.db.saveShifts(lsShifts).catch(function() {});
        } else {
          _cache.shifts = arr || [];
        }
        touchUserActivity();
        return window.db.getHistory();
      }).then(function(h) {
        var hasIdbHistory = h && Object.keys(h).length > 0;
        var hk = _storageKey(HISTORY_KEY);
        var lsHistory = {};
        try { lsHistory = JSON.parse(localStorage.getItem(hk)) || {}; } catch (e) {}
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
    _cache.shifts = JSON.parse(localStorage.getItem(_storageKey(SHIFTS_KEY))) || [];
    _cache.history = JSON.parse(localStorage.getItem(_storageKey(HISTORY_KEY))) || {};
  } catch (e) {
    _cache.shifts = [];
    _cache.history = {};
  }
}

function _writeLocalStorageSafely(baseKey, value) {
  try {
    localStorage.setItem(_storageKey(baseKey), JSON.stringify(value));
  } catch (e) {}
}

function loadShifts() {
  return _cache.ready ? _cache.shifts : (function() {
    try { return JSON.parse(localStorage.getItem(_storageKey(SHIFTS_KEY))) || []; }
    catch { return []; }
  })();
}

function saveShifts(list) {
  _cache.shifts = list || [];
  if (typeof window !== 'undefined' && window.db) {
    window.db.saveShifts(_cache.shifts).catch(function() {
      try { localStorage.setItem(_storageKey(SHIFTS_KEY), JSON.stringify(list)); } catch (e) {}
    });
  } else {
    try { localStorage.setItem(_storageKey(SHIFTS_KEY), JSON.stringify(list)); } catch (e) {}
  }
}

function loadHistory() {
  return _cache.ready ? _cache.history : (function() {
    try { return JSON.parse(localStorage.getItem(_storageKey(HISTORY_KEY))) || {}; }
    catch { return {}; }
  })();
}

function saveHistory(h) {
  _cache.history = h || {};
  if (typeof window !== 'undefined' && window.db) {
    window.db.saveHistory(_cache.history).catch(function() {
      try { localStorage.setItem(_storageKey(HISTORY_KEY), JSON.stringify(h)); } catch (e) {}
    });
  } else {
    try { localStorage.setItem(_storageKey(HISTORY_KEY), JSON.stringify(h)); } catch (e) {}
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
    var s = JSON.parse(localStorage.getItem(_storageKey(SETTINGS_KEY)));
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
  var existing = JSON.parse(localStorage.getItem(_storageKey(SETTINGS_KEY)) || '{}');
  existing.deductions = dedSettings;
  localStorage.setItem(_storageKey(SETTINGS_KEY), JSON.stringify(existing));
  render();
}

function persistSettings(obj) {
  try { localStorage.setItem(_storageKey(SETTINGS_KEY), JSON.stringify(obj)); } catch (e) {}
}
function getSettingsData() {
  try { return JSON.parse(localStorage.getItem(_storageKey(SETTINGS_KEY)) || '{}'); } catch (e) { return {}; }
}

function getLastBackupTime() {
  return localStorage.getItem(_storageKey(BACKUP_TS_KEY)) || null;
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
    settings: typeof getSettingsData === 'function' ? getSettingsData() : {},
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
  var now = new Date().toISOString();
  try {
    localStorage.setItem(_storageKey(BACKUP_TS_KEY), now);
  } catch (e) {}
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
          saveSavings(data.savings);
        }
        if (data.settings && typeof data.settings === 'object') {
          persistSettings(data.settings);
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
  try { return JSON.parse(localStorage.getItem(_storageKey(LEAVE_KEY))) || { vacation: 0, sick: 0 }; }
  catch (e) { return { vacation: 0, sick: 0 }; }
}

function saveLeaveBalances(balances) {
  try { localStorage.setItem(_storageKey(LEAVE_KEY), JSON.stringify(balances)); } catch (e) {}
}

function loadUserName() {
  return localStorage.getItem(_storageKey(USERNAME_KEY)) || null;
}

function saveUserName(name) {
  try { localStorage.setItem(_storageKey(USERNAME_KEY), (name || '').trim()); } catch (e) {}
}

/* ========== Savings ========== */
var SAVINGS_DEFAULT_RETURN = 7;
function loadSavings() {
  try {
    var s = JSON.parse(localStorage.getItem(_storageKey(SAVINGS_KEY)));
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
  try { localStorage.setItem(_storageKey(SAVINGS_KEY), JSON.stringify(savings)); } catch (e) {}
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

/* ========== Admin API ========== */
function getAdminRegistry() {
  return new Promise(function(resolve) {
    if (!dbInstance) { resolve([]); return; }
    var tx = dbInstance.transaction('meta', 'readonly');
    var req = tx.objectStore('meta').get('_user_registry');
    req.onsuccess = function() {
      var reg = req.result ? req.result.value : [];
      resolve(Array.isArray(reg) ? reg : []);
    };
    req.onerror = function() { resolve([]); };
  });
}

function adminDeleteUser(userId) {
  return new Promise(function(resolve, reject) {
    if (!dbInstance) { resolve(); return; }
    var tx = dbInstance.transaction(['shifts', 'history', 'meta', 'templates'], 'readwrite');
    tx.objectStore('shifts').delete('main_' + userId);
    tx.objectStore('history').delete('main_' + userId);
    var allTpl = tx.objectStore('templates').getAll();
    allTpl.onsuccess = function() {
      var list = allTpl.result || [];
      list.filter(function(t) { return t.userId === userId; }).forEach(function(t) {
        tx.objectStore('templates').delete(t.id);
      });
    };
    var getReg = tx.objectStore('meta').get('_user_registry');
    getReg.onsuccess = function() {
      var reg = getReg.result ? getReg.result.value : [];
      if (!Array.isArray(reg)) reg = [];
      reg = reg.filter(function(r) { return r.userId !== userId; });
      tx.objectStore('meta').put({ key: '_user_registry', value: reg });
    };
    tx.oncomplete = function() {
      ['shifter_shifts', 'shifter_settings', 'shifter_history', 'shifter_last_backup', 'shifter_leave', 'shifter_username', 'shifter_savings'].forEach(function(base) {
        try { localStorage.removeItem(base + '_' + userId); } catch (e) {}
      });
      if (userId === getCurrentUserId()) {
        try { localStorage.removeItem(USER_ID_KEY); } catch (e) {}
      }
      resolve();
    };
    tx.onerror = function() { reject(tx.error); };
  });
}
