/**
 * Data Manager – localStorage persistence for shifts, settings, and history.
 * All functions operate on globals from app.js (userRates, creditPoints, dedSettings).
 */

var SHIFTS_KEY = 'shifter_shifts';
var SETTINGS_KEY = 'shifter_settings';
var HISTORY_KEY = 'shifter_history';
var BACKUP_TS_KEY = 'shifter_last_backup';

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

function getLastBackupTime() {
  return localStorage.getItem(BACKUP_TS_KEY) || null;
}

function exportData() {
  const data = {
    version: '5.0',
    exportedAt: new Date().toISOString(),
    shifts: loadShifts(),
    settings: JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'),
    history: loadHistory(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sachash-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);

  localStorage.setItem(BACKUP_TS_KEY, new Date().toISOString());
  updateBackupDisplay();
  showToast('📤 הגיבוי יוצא בהצלחה');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.shifts && !data.settings && !data.history) {
        showToast('⚠️ קובץ לא תקין');
        return;
      }

      showConfirm('ייבוא גיבוי', 'פעולה זו תשחזר את כל הנתונים מהגיבוי. נתונים קיימים ימוזגו. להמשיך?', function() {
        let shiftsAdded = 0;

        if (data.shifts) {
          const existing = loadShifts();
          const existingIds = new Set(existing.map(s => s.id));
          const newShifts = data.shifts.filter(s => !existingIds.has(s.id));
          saveShifts([...existing, ...newShifts]);
          shiftsAdded = newShifts.length;
        }

        if (data.history) {
          const existingH = loadHistory();
          Object.keys(data.history).forEach(y => {
            if (!existingH[y]) existingH[y] = {};
            Object.assign(existingH[y], data.history[y]);
          });
          saveHistory(existingH);
        }

        if (data.settings && typeof data.settings === 'object') {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
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
        }

        recalcAll();
        renderCalendar();
        showToast('📥 יובאו ' + shiftsAdded + ' משמרות + הגדרות');
      });
    } catch { showToast('⚠️ קובץ לא תקין'); }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function formatBackupTime(isoStr) {
  if (!isoStr) return null;
  const d = new Date(isoStr);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'היום';
  if (diffDays === 1) return 'אתמול';
  if (diffDays < 7) return 'לפני ' + diffDays + ' ימים';
  if (diffDays < 30) return 'לפני ' + Math.floor(diffDays / 7) + ' שבועות';
  return d.toLocaleDateString('he-IL');
}

function updateBackupDisplay() {
  const el = document.getElementById('lastBackupInfo');
  if (!el) return;
  const ts = getLastBackupTime();
  if (ts) {
    el.textContent = 'גיבוי אחרון: ' + formatBackupTime(ts);
    el.style.color = 'var(--green)';
  } else {
    el.textContent = 'לא בוצע גיבוי עדיין';
    el.style.color = 'var(--orange)';
  }
}
