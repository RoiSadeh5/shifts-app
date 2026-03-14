/**
 * Settings Component – rate inputs, deduction toggles, leave balances, data management.
 * Depends on globals from app.js and dataManager.js.
 */

function saveSettings() {
  userRates.baseRate = parseFloat(document.getElementById('settingBase').value) || 75;
  userRates.weekendMultiplier = parseFloat(document.getElementById('settingWeekend').value) || 1.5;
  userRates.vacationDayRate = parseFloat(document.getElementById('settingVacation').value) || 1750;
  userRates.bonusQuarterly = parseFloat(document.getElementById('settingBonus').value) || 3500;
  creditPoints = parseFloat(document.getElementById('settingCreditPts').value) || 2.25;
  if (typeof persistSettings === 'function') {
    persistSettings({
      baseRate: userRates.baseRate, weekendMul: userRates.weekendMultiplier,
      vacationRate: userRates.vacationDayRate, bonus: userRates.bonusQuarterly,
      creditPoints: creditPoints,
      deductions: dedSettings
    });
  }
  recalcAll();
  showToast('ההגדרות נשמרו');
}

function toggleDedSetting(key) {
  dedSettings[key] = !dedSettings[key];
  document.getElementById('toggle' + key.charAt(0).toUpperCase() + key.slice(1))
    .classList.toggle('on', dedSettings[key]);
  saveDedSettings();
}

function toggleNotifications() {
  notificationsEnabled = !notificationsEnabled;
  var el = document.getElementById('toggleNotifications');
  if (el) el.classList.toggle('on', notificationsEnabled);
  var existing = typeof getSettingsData === 'function' ? getSettingsData() : {};
  existing.notificationsEnabled = notificationsEnabled;
  if (typeof persistSettings === 'function') persistSettings(existing);
  if (notificationsEnabled && typeof requestNotificationPermission === 'function') {
    requestNotificationPermission(function() {});
  }
}

function toggleCharts() {
  showCharts = !showCharts;
  var el = document.getElementById('toggleCharts');
  if (el) el.classList.toggle('on', showCharts);
  var existing = typeof getSettingsData === 'function' ? getSettingsData() : {};
  existing.showCharts = showCharts;
  if (typeof persistSettings === 'function') persistSettings(existing);
  render();
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

function toggleComparison() {
  const body = document.getElementById('cmpBody');
  const arrow = document.getElementById('cmpArrow');
  body.classList.toggle('open');
  arrow.style.transform = body.classList.contains('open') ? 'rotate(180deg)' : '';
}

function saveLeaveSettings() {
  const vacation = parseInt(document.getElementById('settingVacBal').value) || 0;
  const sick = parseInt(document.getElementById('settingSickBal').value) || 0;
  saveLeaveBalances({ vacation: Math.max(0, vacation), sick: Math.max(0, sick) });
  render();
}

function clearAllData() {
  showConfirm('מחיקת כל הנתונים', 'בטוח שברצונך למחוק את כל המשמרות והתלושים? לא ניתן לשחזר.', () => {
    saveShifts([]);
    saveHistory({});
    render();
    renderCalendar();
    if (typeof initCharts === 'function' && showCharts) initCharts();
    showToast('🗑️ כל הנתונים נמחקו');
  });
}

function initSettingsView() {
  updateBackupDisplay();
}
