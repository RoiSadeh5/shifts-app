/**
 * Savings tab – pension and study fund.
 * Current balance = opening balance + each saved month's deposit.
 * The month on screen is recalculated from the payslip, or from shifts when there is no payslip.
 */
var savingsChartInstance = null;

function projectSavingsBalance(balance, monthlyContrib, annualRatePercent, months) {
  if (typeof SalaryEngine !== 'undefined' && SalaryEngine.projectSavingsBalance) {
    return SalaryEngine.projectSavingsBalance(balance, monthlyContrib, annualRatePercent, months);
  }
  var r = (annualRatePercent || 0) / 100 / 12;
  var fv = balance || 0;
  for (var i = 0; i < (months || 0); i++) fv = fv * (1 + r) + (monthlyContrib || 0);
  return fv;
}

function savingsDisplayBalance(fund) {
  if (typeof SalaryEngine !== 'undefined' && SalaryEngine.fundDisplayBalance) {
    return SalaryEngine.fundDisplayBalance(fund);
  }
  return (fund && fund.openingBalance) || 0;
}

function savingsYearsToRetirement(birthYear) {
  var year = typeof currentYear === 'number' ? currentYear : new Date().getFullYear();
  if (typeof SalaryEngine !== 'undefined' && SalaryEngine.yearsUntilRetirement) {
    return SalaryEngine.yearsUntilRetirement(birthYear, year, SalaryEngine.SAVINGS_RETIREMENT_AGE || 67);
  }
  return null;
}

function savingsOngoingMonth() {
  var now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

function savingsMonthEntry(fund, year, month) {
  var key = (typeof SalaryEngine !== 'undefined' && SalaryEngine.savingsMonthKey)
    ? SalaryEngine.savingsMonthKey(year, month)
    : (year + '-' + month);
  var entry = fund && fund.contributions ? fund.contributions[key] : null;
  if (!entry) return { employee: 0, employer: 0, total: 0, source: 'none', mismatch: false, ceilingApplied: false, wageBase: 0, gross: 0, calculatedEmployee: 0 };
  if (typeof entry === 'number') return { employee: null, employer: null, total: entry, source: 'legacy', mismatch: false, ceilingApplied: false };
  return entry;
}

function getSavingsProjections(fundName) {
  var savings = typeof loadSavings === 'function' ? loadSavings() : { pension: {}, study: {} };
  var f = savings[fundName] || {};
  var balance = savingsDisplayBalance(f);
  var rate = f.returnRate != null ? f.returnRate : 7;
  var month = typeof currentMonth === 'number' ? currentMonth : new Date().getMonth();
  var year = typeof currentYear === 'number' ? currentYear : new Date().getFullYear();
  var deposit = savingsMonthEntry(f, year, month);
  var ongoing = savingsOngoingMonth();
  var ongoingDeposit = savingsMonthEntry(f, ongoing.year, ongoing.month);
  var viewedContrib = deposit.total || 0;
  var forecastContrib = ongoingDeposit.total || 0;
  var years = savingsYearsToRetirement(savings.birthYear);
  return {
    balance: balance,
    openingBalance: f.openingBalance || 0,
    monthlyContrib: viewedContrib,
    deposit: deposit,
    forecastContrib: forecastContrib,
    forecastIsViewedMonth: ongoing.year === year && ongoing.month === month,
    returnRate: rate,
    year1: projectSavingsBalance(balance, forecastContrib, rate, 12),
    year5: projectSavingsBalance(balance, forecastContrib, rate, 60),
    year10: projectSavingsBalance(balance, forecastContrib, rate, 120),
    retirement: years == null ? null : projectSavingsBalance(balance, forecastContrib, rate, years * 12),
    yearsToRetirement: years
  };
}

function getSavingsChartData() {
  var savings = typeof loadSavings === 'function' ? loadSavings() : { pension: {}, study: {} };
  var pension = savings.pension || {};
  var study = savings.study || {};
  var pRate = pension.returnRate != null ? pension.returnRate : 7;
  var sRate = study.returnRate != null ? study.returnRate : 7;
  var pBal = savingsDisplayBalance(pension);
  var sBal = savingsDisplayBalance(study);
  var ongoing = savingsOngoingMonth();
  var month = ongoing.month;
  var year = ongoing.year;
  var pContrib = (savingsMonthEntry(pension, year, month).total) || 0;
  var sContrib = (savingsMonthEntry(study, year, month).total) || 0;
  var labels = [];
  var pensionData = [];
  var studyData = [];
  var names = (typeof hebrewMonths !== 'undefined') ? hebrewMonths : ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  for (var i = 0; i <= 120; i += 12) {
    var d = new Date(year, month + i, 1);
    labels.push(names[d.getMonth()] + ' \'' + String(d.getFullYear()).slice(-2));
    pensionData.push(Math.round(projectSavingsBalance(pBal, pContrib, pRate, i)));
    studyData.push(Math.round(projectSavingsBalance(sBal, sContrib, sRate, i)));
  }
  return { labels: labels, pension: pensionData, study: studyData };
}

function renderSavings() {
  var section = document.getElementById('savingsSection');
  if (!section) return;
  if (typeof syncSavingsMonth === 'function' && typeof currentYear === 'number') {
    syncSavingsMonth(currentYear, currentMonth);
    var ongoingSync = savingsOngoingMonth();
    if (ongoingSync.year !== currentYear || ongoingSync.month !== currentMonth) {
      syncSavingsMonth(ongoingSync.year, ongoingSync.month);
    }
  }
  if (typeof updateMonthLabels === 'function') updateMonthLabels();
  var savings = typeof loadSavings === 'function' ? loadSavings() : { pension: {}, study: {} };
  renderSavingsBirth(savings);
  var generalCount = Array.isArray(savings.general) ? savings.general.length : 0;
  var pensionBal = savingsDisplayBalance(savings.pension);
  var studyBal = savingsDisplayBalance(savings.study);
  var month = typeof currentMonth === 'number' ? currentMonth : 0;
  var year = typeof currentYear === 'number' ? currentYear : new Date().getFullYear();
  var hasDeposit = (savingsMonthEntry(savings.pension, year, month).total || 0) > 0
    || (savingsMonthEntry(savings.study, year, month).total || 0) > 0;
  var hasAny = pensionBal > 0 || studyBal > 0 || (savings.pension && savings.pension.openingBalance) || (savings.study && savings.study.openingBalance)
    || generalCount > 0 || hasDeposit
    || (typeof dedSettings !== 'undefined' && dedSettings && (dedSettings.pension || dedSettings.study));
  var emptyEl = document.getElementById('savingsEmptyState');
  var contentEl = document.getElementById('savingsContentArea');
  if (!hasAny) {
    if (emptyEl) emptyEl.style.display = 'block';
    if (contentEl) contentEl.style.display = 'none';
    section.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  if (contentEl) contentEl.style.display = 'block';
  section.style.display = 'block';

  renderSavingsFund('pension', 'קרן פנסיה');
  renderSavingsFund('study', 'קרן השתלמות');
  renderSavingsLedger(savings);
  renderGeneralSavings();
  renderSavingsTotal();
  renderSavingsChart();
}

function renderSavingsBirth(savings) {
  var input = document.getElementById('savingsBirthYear');
  var hint = document.getElementById('savingsRetirementHint');
  if (input && document.activeElement !== input) input.value = savings.birthYear || '';
  if (!hint) return;
  var years = savingsYearsToRetirement(savings.birthYear);
  if (years == null) {
    hint.textContent = 'פרישה בגיל 67. הזן שנת לידה כדי לחשב כמה שנים נשארו.';
    return;
  }
  var retireYear = (savings.birthYear || 0) + (typeof SalaryEngine !== 'undefined' && SalaryEngine.SAVINGS_RETIREMENT_AGE ? SalaryEngine.SAVINGS_RETIREMENT_AGE : 67);
  if (years === 0) hint.textContent = 'גיל הפרישה 67 כבר הגיע (' + retireYear + ').';
  else if (years === 1) hint.textContent = 'פרישה בגיל 67 בעוד שנה (' + retireYear + ').';
  else hint.textContent = 'פרישה בגיל 67 בעוד ' + years + ' שנים (' + retireYear + ').';
}

function saveSavingsBirthYear() {
  var input = document.getElementById('savingsBirthYear');
  if (!input || typeof updateSavingsBirthYear !== 'function') return;
  updateSavingsBirthYear(input.value);
  renderSavings();
}

function savingsSourceLabel(deposit) {
  if (!deposit || deposit.source === 'none') return 'אין שכר בחודש הזה';
  if (deposit.source === 'payslip') return 'לפי התלוש';
  if (deposit.source === 'shifts') return 'לפי המשמרות בחודש';
  if (deposit.source === 'legacy') return 'הפקדה שנשמרה';
  return '';
}

function renderSavingsFund(fund, label) {
  var container = document.getElementById('savingsFund' + fund.charAt(0).toUpperCase() + fund.slice(1));
  if (!container) return;
  var proj = getSavingsProjections(fund);
  var dep = proj.deposit || {};
  var note = '';
  if (dep.ceilingApplied) {
    var ceiling = (typeof SalaryEngine !== 'undefined' && SalaryEngine.DEDUCTION_CONSTANTS)
      ? SalaryEngine.DEDUCTION_CONSTANTS.STUDY_WAGE_CEILING
      : 15712;
    note = '<div class="savings-note">תקרת השכר להשתלמות היא ' + fmtNIS(ceiling) + '. ההפקדה חושבה על ' + fmtNIS(dep.wageBase || ceiling) + ' מתוך ' + fmtNIS(dep.gross || 0) + '.</div>';
  }
  if (dep.mismatch) {
    note += '<div class="savings-note">חלק העובד בתלוש הוא ' + fmtNIS(dep.employee || 0) + ', והחישוב לפי השכר הוא ' + fmtNIS(dep.calculatedEmployee || 0) + '. ליתרה נכנס הסכום מהתלוש, וחלק המעסיק לפי החישוב.</div>';
  }
  var source = savingsSourceLabel(dep);
  if (source) note = '<div class="savings-note">' + source + '</div>' + note;
  if (!proj.forecastIsViewedMonth) {
    var ongoing = savingsOngoingMonth();
    var names = (typeof hebrewMonths !== 'undefined') ? hebrewMonths : [];
    note += '<div class="savings-note">התחזית ממשיכה לפי ההפקדה של ' + (names[ongoing.month] || '') + ' ' + ongoing.year + ', ' + fmtNIS(proj.forecastContrib) + ' בחודש.</div>';
  }
  var employeeText = dep.employee == null ? '—' : fmtNIS(dep.employee);
  var employerText = dep.employer == null ? '—' : fmtNIS(dep.employer);
  var retireText = proj.retirement == null ? '—' : fmtNIS(proj.retirement);
  var retireLabel = proj.yearsToRetirement == null ? 'פרישה' : (proj.yearsToRetirement === 0 ? 'פרישה' : ('פרישה · ' + proj.yearsToRetirement));
  container.innerHTML = '<div class="savings-fund-card">' +
    '<div class="savings-fund-header">' +
      '<span class="savings-fund-label">' + label + '</span>' +
      '<button class="savings-edit-btn" onclick="openSavingsEditModal(\'' + fund + '\')" aria-label="ערוך">✎</button>' +
    '</div>' +
    '<div class="savings-row">' +
      '<span class="savings-name">יתרה נוכחית</span>' +
      '<span class="savings-val green">' + fmtNIS(proj.balance) + '</span>' +
    '</div>' +
    '<div class="savings-row">' +
      '<span class="savings-name">יתרת פתיחה</span>' +
      '<span class="savings-val">' + fmtNIS(proj.openingBalance) + '</span>' +
    '</div>' +
    '<div class="savings-row">' +
      '<span class="savings-name">הפקדה החודש</span>' +
      '<span class="savings-val">' + fmtNIS(proj.monthlyContrib) + '</span>' +
    '</div>' +
    '<div class="savings-row">' +
      '<span class="savings-name">עובד</span>' +
      '<span class="savings-val">' + employeeText + '</span>' +
    '</div>' +
    '<div class="savings-row">' +
      '<span class="savings-name">מעסיק</span>' +
      '<span class="savings-val">' + employerText + '</span>' +
    '</div>' +
    note +
    '<div class="savings-row">' +
      '<span class="savings-name">תשואה שנתית</span>' +
      '<span class="savings-val">' + proj.returnRate + '%</span>' +
    '</div>' +
    '<div class="savings-proj-grid">' +
      '<div class="savings-proj-item"><span class="savings-proj-label">שנה</span><span class="savings-proj-val">' + fmtNIS(proj.year1) + '</span></div>' +
      '<div class="savings-proj-item"><span class="savings-proj-label">5 שנים</span><span class="savings-proj-val">' + fmtNIS(proj.year5) + '</span></div>' +
      '<div class="savings-proj-item"><span class="savings-proj-label">10 שנים</span><span class="savings-proj-val">' + fmtNIS(proj.year10) + '</span></div>' +
      '<div class="savings-proj-item"><span class="savings-proj-label">' + retireLabel + '</span><span class="savings-proj-val accent">' + retireText + '</span></div>' +
    '</div>' +
  '</div>';
}

function renderSavingsLedger(savings) {
  var el = document.getElementById('savingsLedger');
  if (!el) return;
  var names = (typeof hebrewMonths !== 'undefined') ? hebrewMonths : [];
  var keys = {};
  ['pension', 'study'].forEach(function(fund) {
    var c = (savings[fund] && savings[fund].contributions) || {};
    Object.keys(c).forEach(function(k) { keys[k] = true; });
  });
  var rows = Object.keys(keys).map(function(k) {
    var parts = k.split('-');
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var p = savingsMonthEntry(savings.pension, year, month);
    var s = savingsMonthEntry(savings.study, year, month);
    return { key: k, year: year, month: month, pension: p.total || 0, study: s.total || 0 };
  }).filter(function(r) { return r.pension > 0 || r.study > 0; });
  rows.sort(function(a, b) { return (b.year * 12 + b.month) - (a.year * 12 + a.month); });
  if (!rows.length) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = '<div class="section-label savings-ledger-label">הפקדות שנשמרו</div>' +
    rows.map(function(r) {
      var name = names[r.month] || '';
      return '<div class="savings-row">' +
        '<span class="savings-name">' + name + ' ' + r.year + '</span>' +
        '<span class="savings-val">פנסיה ' + fmtNIS(r.pension) + ' · השתלמות ' + fmtNIS(r.study) + '</span>' +
      '</div>';
    }).join('');
}

function renderGeneralSavings() {
  var container = document.getElementById('savingsGeneralList');
  if (!container) return;
  var savings = loadSavings();
  var entries = Array.isArray(savings.general) ? savings.general : [];
  if (entries.length === 0) {
    container.innerHTML = '<div class="savings-general-empty">אין עדיין חסכונות כלליים. הם לא נכנסים לסה״כ הפנסיוני.</div>';
    return;
  }
  container.innerHTML = entries.map(function(e) {
    return '<div class="savings-general-item">' +
      '<div class="savings-general-info">' +
        '<span class="savings-general-name">' + (e.name || 'חסכון') + '</span>' +
        '<span class="savings-general-amount">' + fmtNIS(e.amount || 0) + '</span>' +
      '</div>' +
      '<div class="savings-general-actions">' +
        '<button class="savings-edit-btn" onclick="openGeneralSavingsModal(\'' + (e.id || '') + '\')" aria-label="ערוך">✎</button>' +
        '<button class="savings-delete-btn" onclick="deleteGeneralSavingsEntryUi(\'' + (e.id || '') + '\')" aria-label="מחק">✕</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function renderSavingsTotal() {
  var valEl = document.getElementById('savingsTotalVal');
  if (!valEl) return;
  var savings = loadSavings();
  var total = savingsDisplayBalance(savings.pension) + savingsDisplayBalance(savings.study);
  valEl.textContent = fmtNIS(total);
}

function openGeneralSavingsModal(editId) {
  if (typeof haptic === 'function') haptic(true);
  var titleEl = document.getElementById('generalSavingsModalTitle');
  var idEl = document.getElementById('generalSavingsEditId');
  var nameEl = document.getElementById('generalSavingsName');
  var amountEl = document.getElementById('generalSavingsAmount');
  if (!titleEl || !idEl || !nameEl || !amountEl) return;
  if (editId) {
    var savings = loadSavings();
    var e = savings.general && savings.general.find(function(x) { return x.id === editId; });
    if (e) {
      titleEl.textContent = 'עריכת חסכון';
      idEl.value = e.id;
      nameEl.value = e.name || '';
      amountEl.value = e.amount != null ? e.amount : '';
    }
  } else {
    titleEl.textContent = 'הוסף חסכון';
    idEl.value = '';
    nameEl.value = '';
    amountEl.value = '';
  }
  var ov = document.getElementById('generalSavingsOverlay');
  if (ov) {
    ov.style.display = 'flex';
    requestAnimationFrame(function() { ov.classList.add('visible'); });
  }
}

function closeGeneralSavingsModal() {
  var ov = document.getElementById('generalSavingsOverlay');
  if (ov) {
    ov.classList.remove('visible');
    setTimeout(function() { ov.style.display = 'none'; }, 200);
  }
}

function saveGeneralSavingsEntry() {
  var idEl = document.getElementById('generalSavingsEditId');
  var nameEl = document.getElementById('generalSavingsName');
  var amountEl = document.getElementById('generalSavingsAmount');
  var id = (idEl && idEl.value) || '';
  var name = (nameEl && nameEl.value) || '';
  var amount = parseFloat(amountEl && amountEl.value) || 0;
  if (id) {
    if (typeof updateGeneralSavingsEntry === 'function') updateGeneralSavingsEntry(id, name, amount);
  } else {
    if (typeof addGeneralSavingsEntry === 'function') addGeneralSavingsEntry(name, amount);
  }
  closeGeneralSavingsModal();
  if (typeof renderSavings === 'function') renderSavings();
  if (typeof showToast === 'function') showToast('הנתונים נשמרו');
}

function deleteGeneralSavingsEntryUi(id) {
  if (typeof showConfirm !== 'function') {
    if (typeof deleteGeneralSavingsEntry === 'function') deleteGeneralSavingsEntry(id);
    if (typeof renderSavings === 'function') renderSavings();
    return;
  }
  showConfirm('מחיקת חסכון', 'למחוק את פריט החסכון?', function() {
    if (typeof deleteGeneralSavingsEntry === 'function') deleteGeneralSavingsEntry(id);
    if (typeof renderSavings === 'function') renderSavings();
    if (typeof showToast === 'function') showToast('נמחק');
  }, 'מחק');
}

function renderSavingsChart() {
  var canvas = document.getElementById('savingsChartCanvas');
  if (!canvas) return;
  if (typeof Chart === 'undefined') {
    if (typeof loadChartJs === 'function') {
      loadChartJs().then(renderSavingsChart).catch(function() {});
    }
    return;
  }
  if (typeof initChartDefaults === 'function') initChartDefaults();
  if (savingsChartInstance) {
    savingsChartInstance.destroy();
    savingsChartInstance = null;
  }
  var data = getSavingsChartData();
  var ctx = canvas.getContext('2d');
  var defaults = typeof getChartDefaults === 'function' ? getChartDefaults() : { responsive: true, maintainAspectRatio: false };
  savingsChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        { label: 'פנסיה', data: data.pension, borderColor: '#1c1915', backgroundColor: 'rgba(28,25,21,0.08)', fill: true, tension: 0.3 },
        { label: 'קרן השתלמות', data: data.study, borderColor: '#1f6b4a', backgroundColor: 'rgba(31,107,74,0.12)', fill: true, tension: 0.3 }
      ]
    },
    options: Object.assign({}, defaults, {
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: "'Heebo', sans-serif", size: 10 } } },
        y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { font: { family: "'Heebo', sans-serif", size: 10 }, callback: function(v) { return '₪' + (v >= 1000 ? (v/1000) + 'k' : v); } } }
      },
      plugins: { legend: { position: 'bottom', rtl: true } }
    })
  });
}

function openSavingsEditModal(fund) {
  if (typeof haptic === 'function') haptic(true);
  var savings = loadSavings();
  var f = savings[fund] || {};
  document.getElementById('savingsEditFund').value = fund;
  document.getElementById('savingsEditBalance').value = f.openingBalance != null ? f.openingBalance : '';
  document.getElementById('savingsEditRate').value = f.returnRate != null ? f.returnRate : 7;
  document.getElementById('savingsEditLabel').textContent = fund === 'pension' ? 'קרן פנסיה' : 'קרן השתלמות';
  var ov = document.getElementById('savingsEditOverlay');
  if (ov) {
    ov.style.display = 'flex';
    requestAnimationFrame(function() { ov.classList.add('visible'); });
  }
}

function closeSavingsEditModal() {
  var ov = document.getElementById('savingsEditOverlay');
  if (ov) {
    ov.classList.remove('visible');
    setTimeout(function() { ov.style.display = 'none'; }, 200);
  }
}

function saveSavingsEdit() {
  var fund = document.getElementById('savingsEditFund').value;
  var balance = parseFloat(document.getElementById('savingsEditBalance').value) || 0;
  var rate = parseFloat(document.getElementById('savingsEditRate').value);
  if (typeof updateSavingsBalance === 'function') updateSavingsBalance(fund, balance);
  if (typeof updateSavingsReturnRate === 'function') updateSavingsReturnRate(fund, isNaN(rate) ? 7 : rate);
  closeSavingsEditModal();
  if (typeof renderSavings === 'function') renderSavings();
  if (typeof showToast === 'function') showToast('הנתונים נשמרו');
}
