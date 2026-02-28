/**
 * Settings Component – rate inputs, deduction toggles, data management.
 * Depends on globals from app.js and dataManager.js.
 */

function saveSettings() {
  userRates.baseRate = parseFloat(document.getElementById('settingBase').value) || 75;
  userRates.weekendMultiplier = parseFloat(document.getElementById('settingWeekend').value) || 1.5;
  userRates.vacationDayRate = parseFloat(document.getElementById('settingVacation').value) || 1750;
  userRates.bonusQuarterly = parseFloat(document.getElementById('settingBonus').value) || 3500;
  creditPoints = parseFloat(document.getElementById('settingCreditPts').value) || 2.25;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    baseRate: userRates.baseRate, weekendMul: userRates.weekendMultiplier,
    vacationRate: userRates.vacationDayRate, bonus: userRates.bonusQuarterly,
    creditPoints: creditPoints,
    deductions: dedSettings
  }));
  recalcAll();
  showToast('ההגדרות נשמרו');
}

function toggleDedSetting(key) {
  dedSettings[key] = !dedSettings[key];
  document.getElementById('toggle' + key.charAt(0).toUpperCase() + key.slice(1))
    .classList.toggle('on', dedSettings[key]);
  saveDedSettings();
}

function toggleDeductions() {
  const body = document.getElementById('dedBody');
  const arrow = document.getElementById('dedArrow');
  body.classList.toggle('open');
  arrow.style.transform = body.classList.contains('open') ? 'rotate(180deg)' : '';
}

function toggleEmployer() {
  const body = document.getElementById('empBody');
  const arrow = document.getElementById('empArrow');
  body.classList.toggle('open');
  arrow.style.transform = body.classList.contains('open') ? 'rotate(180deg)' : '';
}

function clearAllData() {
  showConfirm('מחיקת כל הנתונים', 'בטוח שברצונך למחוק את כל המשמרות והתלושים? לא ניתן לשחזר.', () => {
    localStorage.removeItem(SHIFTS_KEY);
    localStorage.removeItem(HISTORY_KEY);
    render();
    renderCalendar();
    showToast('🗑️ כל הנתונים נמחקו');
  });
}

function initSettingsView() {
  updateBackupDisplay();
}
