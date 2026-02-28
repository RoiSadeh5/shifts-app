/**
 * Data Manager – localStorage persistence for shifts, settings, and history.
 * All functions operate on globals from app.js (userRates, creditPoints, dedSettings).
 */

var SHIFTS_KEY = 'shifter_shifts';
var SETTINGS_KEY = 'shifter_settings';
var HISTORY_KEY = 'shifter_history';

function loadShifts() {
  try { return JSON.parse(localStorage.getItem(SHIFTS_KEY)) || []; }
  catch { return []; }
}

function saveShifts(list) {
  localStorage.setItem(SHIFTS_KEY, JSON.stringify(list));
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}; }
  catch { return {}; }
}

function saveHistory(h) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (s) {
      userRates.baseRate = s.baseRate || 75;
      userRates.weekendMultiplier = s.weekendMul || 1.5;
      userRates.vacationDayRate = s.vacationRate || 1750;
      userRates.bonusQuarterly = s.bonus || 3500;
      if (s.creditPoints !== undefined) creditPoints = s.creditPoints;
      if (s.deductions) dedSettings = { ...dedSettings, ...s.deductions };
    }
  } catch {}
}

function saveDedSettings() {
  const existing = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  existing.deductions = dedSettings;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(existing));
  render();
}

function exportData() {
  const data = { shifts: loadShifts(), settings: localStorage.getItem(SETTINGS_KEY), history: loadHistory() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sachash-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📤 הנתונים יוצאו');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.shifts) {
        const existing = loadShifts();
        const existingIds = new Set(existing.map(s => s.id));
        const newShifts = data.shifts.filter(s => !existingIds.has(s.id));
        saveShifts([...existing, ...newShifts]);
        if (data.history) {
          const existingH = loadHistory();
          Object.keys(data.history).forEach(y => {
            if (!existingH[y]) existingH[y] = {};
            Object.assign(existingH[y], data.history[y]);
          });
          saveHistory(existingH);
        }
        render();
        renderCalendar();
        showToast(`📥 יובאו ${newShifts.length} משמרות`);
      }
    } catch { showToast('⚠️ קובץ לא תקין'); }
  };
  reader.readAsText(file);
  e.target.value = '';
}
