/**
 * Savings Dashboard – Pension (פנסיה) & Keren Hishtalmut (קרן השתלמות)
 * Balance tracking, investment returns, projections.
 */
var SAVINGS_RETIREMENT_AGE = 67;
var SAVINGS_YEARS_TO_RETIREMENT = 32;
var savingsChartInstance = null;

function projectSavingsBalance(balance, monthlyContrib, annualRatePercent, months) {
  var r = (annualRatePercent || 7) / 100 / 12;
  var fv = balance;
  for (var i = 0; i < months; i++) {
    fv = fv * (1 + r) + (monthlyContrib || 0);
  }
  return fv;
}

function getSavingsMonthlyContribution(fund) {
  var slip = typeof loadPayslip === 'function' ? loadPayslip(currentYear, currentMonth) : null;
  var gross = slip && slip.gross > 0 ? slip.gross : 0;
  if (gross <= 0 && typeof getMonthShifts === 'function') {
    var monthShifts = getMonthShifts();
    var totalP = 0;
    monthShifts.forEach(function(s) { totalP += (s.result && s.result.totalPay) || 0; });
    if (monthShifts.length > 0 && typeof SalaryEngine !== 'undefined') {
      var fixedAdd = SalaryEngine.calculateFixedMonthlyAdditions ? SalaryEngine.calculateFixedMonthlyAdditions() : { total: 0 };
      gross = totalP + (fixedAdd.total || 0);
    }
  }
  var ded = gross > 0 && typeof calcDeductions === 'function' ? calcDeductions(gross) : { employee: { pension: 0, study: 0 }, employer: { pension: 0, study: 0 } };
  if (fund === 'pension') {
    var emp = slip && slip.pension != null ? slip.pension : ded.employee.pension;
    return (emp || 0) + (ded.employer ? ded.employer.pension : 0);
  }
  var empStudy = slip && slip.study != null ? slip.study : ded.employee.study;
  return (empStudy || 0) + (ded.employer ? ded.employer.study : 0);
}

function getSavingsProjections(fund) {
  var savings = typeof loadSavings === 'function' ? loadSavings() : { pension: {}, study: {} };
  var f = savings[fund] || {};
  var balance = f.balance || 0;
  var rate = f.returnRate != null ? f.returnRate : 7;
  var monthlyContrib = getSavingsMonthlyContribution(fund);
  if (dedSettings && ((fund === 'pension' && !dedSettings.pension) || (fund === 'study' && !dedSettings.study))) {
    monthlyContrib = 0;
  }
  var yearsToRetirement = Math.max(1, SAVINGS_YEARS_TO_RETIREMENT);
  return {
    balance: balance,
    monthlyContrib: monthlyContrib,
    returnRate: rate,
    year1: projectSavingsBalance(balance, monthlyContrib, rate, 12),
    year5: projectSavingsBalance(balance, monthlyContrib, rate, 60),
    year10: projectSavingsBalance(balance, monthlyContrib, rate, 120),
    retirement: projectSavingsBalance(balance, monthlyContrib, rate, yearsToRetirement * 12),
    yearsToRetirement: yearsToRetirement
  };
}

function getSavingsChartData() {
  var savings = typeof loadSavings === 'function' ? loadSavings() : { pension: {}, study: {} };
  var pension = savings.pension || {};
  var study = savings.study || {};
  var pRate = pension.returnRate != null ? pension.returnRate : 7;
  var sRate = study.returnRate != null ? study.returnRate : 7;
  var pBal = pension.balance || 0;
  var sBal = study.balance || 0;
  var pContrib = getSavingsMonthlyContribution('pension');
  var sContrib = getSavingsMonthlyContribution('study');
  if (dedSettings && !dedSettings.pension) pContrib = 0;
  if (dedSettings && !dedSettings.study) sContrib = 0;
  var labels = [];
  var pensionData = [];
  var studyData = [];
  var hebrewMonths = typeof hebrewMonths !== 'undefined' ? hebrewMonths : ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  var now = new Date();
  for (var i = 0; i <= 120; i += 12) {
    var d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    labels.push(hebrewMonths[d.getMonth()] + ' \'' + String(d.getFullYear()).slice(-2));
    pensionData.push(Math.round(projectSavingsBalance(pBal, pContrib, pRate, i)));
    studyData.push(Math.round(projectSavingsBalance(sBal, sContrib, sRate, i)));
  }
  return { labels: labels, pension: pensionData, study: studyData };
}

function renderSavings() {
  var section = document.getElementById('savingsSection');
  if (!section) return;
  var savings = typeof loadSavings === 'function' ? loadSavings() : { pension: {}, study: {} };
  var generalCount = Array.isArray(savings.general) ? savings.general.length : 0;
  var hasAny = (savings.pension && savings.pension.balance > 0) || (savings.study && savings.study.balance > 0) ||
    generalCount > 0 ||
    (dedSettings && (dedSettings.pension || dedSettings.study)) ||
    (getSavingsMonthlyContribution('pension') > 0 || getSavingsMonthlyContribution('study') > 0);
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
  renderGeneralSavings();
  renderSavingsTotal();
  renderSavingsChart();
}

function renderSavingsFund(fund, label) {
  var container = document.getElementById('savingsFund' + fund.charAt(0).toUpperCase() + fund.slice(1));
  if (!container) return;
  var proj = getSavingsProjections(fund);
  container.innerHTML = '<div class="savings-fund-card">' +
    '<div class="savings-fund-header">' +
      '<span class="savings-fund-label">' + label + '</span>' +
      '<button class="savings-edit-btn" onclick="openSavingsEditModal(\'' + fund + '\')" aria-label="ערוך">✎</button>' +
    '</div>' +
    '<div class="savings-row">' +
      '<span class="savings-name">יתרה נוכחית</span>' +
      '<span class="savings-val green" id="savings' + fund + 'Balance">' + fmtNIS(proj.balance) + '</span>' +
    '</div>' +
    '<div class="savings-row">' +
      '<span class="savings-name">הפקדה חודשית</span>' +
      '<span class="savings-val" id="savings' + fund + 'Contrib">' + fmtNIS(proj.monthlyContrib) + '</span>' +
    '</div>' +
    '<div class="savings-row">' +
      '<span class="savings-name">תשואה שנתית</span>' +
      '<span class="savings-val" id="savings' + fund + 'Rate">' + proj.returnRate + '%</span>' +
    '</div>' +
    '<div class="savings-proj-grid">' +
      '<div class="savings-proj-item"><span class="savings-proj-label">שנה</span><span class="savings-proj-val" id="savings' + fund + 'P1">' + fmtNIS(proj.year1) + '</span></div>' +
      '<div class="savings-proj-item"><span class="savings-proj-label">5 שנים</span><span class="savings-proj-val" id="savings' + fund + 'P5">' + fmtNIS(proj.year5) + '</span></div>' +
      '<div class="savings-proj-item"><span class="savings-proj-label">10 שנים</span><span class="savings-proj-val" id="savings' + fund + 'P10">' + fmtNIS(proj.year10) + '</span></div>' +
      '<div class="savings-proj-item"><span class="savings-proj-label">פרישה</span><span class="savings-proj-val accent" id="savings' + fund + 'PRet">' + fmtNIS(proj.retirement) + '</span></div>' +
    '</div>' +
  '</div>';
}

function renderGeneralSavings() {
  var container = document.getElementById('savingsGeneralList');
  if (!container) return;
  var savings = loadSavings();
  var entries = Array.isArray(savings.general) ? savings.general : [];
  if (entries.length === 0) {
    container.innerHTML = '<div class="savings-general-empty">אין עדיין חסכונות כלליים. לחץ להלן להוספה.</div>';
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
  var card = document.getElementById('savingsTotalCard');
  var valEl = document.getElementById('savingsTotalVal');
  if (!card || !valEl) return;
  var savings = loadSavings();
  var pensionBal = (savings.pension && savings.pension.balance) || 0;
  var studyBal = (savings.study && savings.study.balance) || 0;
  var generalTotal = 0;
  if (Array.isArray(savings.general)) {
    savings.general.forEach(function(e) { generalTotal += parseFloat(e.amount) || 0; });
  }
  var total = pensionBal + studyBal + generalTotal;
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
  if (typeof render === 'function') render();
  if (typeof showToast === 'function') showToast('הנתונים נשמרו');
}

function deleteGeneralSavingsEntryUi(id) {
  if (typeof showConfirm !== 'function') {
    if (typeof deleteGeneralSavingsEntry === 'function') deleteGeneralSavingsEntry(id);
    if (typeof render === 'function') render();
    return;
  }
  showConfirm('מחיקת חסכון', 'למחוק את פריט החסכון?', function() {
    if (typeof deleteGeneralSavingsEntry === 'function') deleteGeneralSavingsEntry(id);
    if (typeof render === 'function') render();
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
        { label: 'פנסיה', data: data.pension, borderColor: '#818cf8', backgroundColor: 'rgba(129,140,248,0.12)', fill: true, tension: 0.3 },
        { label: 'קרן השתלמות', data: data.study, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.12)', fill: true, tension: 0.3 }
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
  document.getElementById('savingsEditBalance').value = f.balance || '';
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
  if (typeof render === 'function') render();
  if (typeof showToast === 'function') showToast('הנתונים נשמרו');
}
