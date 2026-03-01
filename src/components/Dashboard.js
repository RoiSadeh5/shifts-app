/**
 * Dashboard + Calendar Component
 * Renders monthly summary, deduction panels, shift list, calendar grid, day detail.
 * Depends on globals from app.js and dataManager.js.
 */

// ===== Dashboard =====

function getMonthShifts() {
  return loadShifts().filter(s => {
    const p = s.date.split('-');
    return parseInt(p[1]) - 1 === currentMonth && parseInt(p[0]) === currentYear;
  }).sort((a, b) => b.date.localeCompare(a.date));
}

function render() {
  const monthShifts = getMonthShifts();
  let totalH = 0, totalP = 0, totalMeal = 0;
  const typeTotals = {};

  monthShifts.forEach(s => {
    totalH += s.result?.totalHours || 0;
    totalP += s.result?.totalPay || 0;
    totalMeal += s.result?.mealAllowance || 0;
    const t = s.type;
    if (!typeTotals[t]) typeTotals[t] = { count: 0, pay: 0 };
    typeTotals[t].count++;
    typeTotals[t].pay += s.result?.totalPay || 0;
  });

  const fixedAdd = monthShifts.length > 0 ? SalaryEngine.calculateFixedMonthlyAdditions() : { total: 0 };
  const totalGross = totalP + fixedAdd.total;

  const ded = calcDeductions(totalGross);
  const tax = calcIncomeTax(totalGross);
  const incomeTaxAmount = dedSettings.incomeTax ? tax.finalTax : 0;
  const totalAllDeductions = ded.employee.total + incomeTaxAmount;
  const netAfterAll = totalGross - totalAllDeductions;

  document.getElementById('heroNet').textContent = fmtNIS(netAfterAll);
  document.getElementById('heroNetSub').textContent =
    totalGross > 0 ? `${Math.round(netAfterAll / totalGross * 100)}% מהברוטו` : '';
  document.getElementById('heroGross').textContent = fmtNIS(totalGross);
  document.getElementById('heroSub').textContent = `${monthShifts.length} משמרות · ${Math.round(totalH)} שעות`;

  document.getElementById('statHours').textContent = Math.round(totalH * 10) / 10;
  document.getElementById('statShifts').textContent = monthShifts.length;
  document.getElementById('statAvg').textContent = monthShifts.length ? fmtNIS(totalP / monthShifts.length) : '₪0';

  document.getElementById('dedTotal').textContent = `-${fmtNIS(totalAllDeductions)}`;
  document.getElementById('dedIncomeTax').textContent = `-${fmtNIS(incomeTaxAmount)}`;

  const taxTierRow = document.getElementById('taxTierRow');
  const taxTierDetail = document.getElementById('taxTierDetail');
  if (dedSettings.incomeTax && tax.finalTax > 0) {
    taxTierRow.style.display = '';
    let tierHtml = tax.tiers.filter(t => t.tax > 0).map(t =>
      `<div style="display:flex;justify-content:space-between;margin-bottom:2px"><span>${Math.round(t.rate*100)}% (${fmtNIS(t.from)}–${t.to === Infinity ? '∞' : fmtNIS(t.to)})</span><span>-${fmtNIS(t.tax)}</span></div>`
    ).join('');
    tierHtml += `<div style="display:flex;justify-content:space-between;margin-top:4px;color:var(--green)"><span>זיכוי (${creditPoints} נק׳ × ₪242)</span><span>+${fmtNIS(tax.creditAmount)}</span></div>`;
    taxTierDetail.innerHTML = tierHtml;
  } else {
    taxTierRow.style.display = 'none';
  }

  document.getElementById('dedPension').textContent = `-${fmtNIS(ded.employee.pension)}`;
  document.getElementById('dedStudy').textContent = `-${fmtNIS(ded.employee.study)}`;
  document.getElementById('dedNI').textContent = `-${fmtNIS(ded.employee.nationalInsurance || ded.employee.ni)}`;
  document.getElementById('dedHealth').textContent = `-${fmtNIS(ded.employee.healthInsurance || 0)}`;

  document.getElementById('studyCap').style.display = totalGross > STUDY_CEILING ? '' : 'none';

  const niTierRow = document.getElementById('niTierRow');
  const niDetail = document.getElementById('niTierDetail');
  if (ded.employee.ni > 0) {
    niTierRow.style.display = '';
    document.getElementById('niTier1').textContent = `-${fmtNIS(ded.employee.nationalInsurance || ded.employee.niTier1 + ded.employee.niTier2)}`;
    document.getElementById('niTier2').textContent = `-${fmtNIS(ded.employee.healthInsurance || 0)}`;
  } else {
    niTierRow.style.display = 'none';
  }

  document.getElementById('empTotal').textContent = `+${fmtNIS(ded.employer.total)}`;
  document.getElementById('empPension').textContent = `+${fmtNIS(ded.employer.pension)}`;
  document.getElementById('empStudy').textContent = `+${fmtNIS(ded.employer.study)}`;

  const hasGross = totalGross > 0;
  document.getElementById('deductionsPanel').style.display = hasGross ? '' : 'none';
  document.getElementById('employerPanel').style.display = hasGross ? '' : 'none';
  document.getElementById('shareBtn').style.display = hasGross ? '' : 'none';

  // ===== Annual Forecast =====
  renderAnnualForecast(totalGross);

  // ===== Payslip Comparison =====
  renderPayslipComparison(totalGross, incomeTaxAmount, ded, netAfterAll);

  // Type breakdown + meal allowance info + fixed additions
  const bdList = document.getElementById('breakdownList');
  const bdSection = document.getElementById('breakdownSection');
  const hasBreakdown = Object.keys(typeTotals).length > 0 || fixedAdd.total > 0;

  if (!hasBreakdown) {
    bdSection.classList.add('hidden');
  } else {
    bdSection.classList.remove('hidden');
    let bdHtml = Object.entries(typeTotals).map(([type, data]) => `
      <div class="bd-row">
        <div class="bd-right">
          <div class="bd-dot" style="background:${dotColors[type]}"></div>
          <span class="bd-name">${typeNames[type]}</span>
          <span class="bd-count">(${data.count})</span>
        </div>
        <span class="bd-pay" style="color:${dotColors[type]}">${fmtNIS(data.pay)}</span>
      </div>
    `).join('');

    if (totalMeal > 0) {
      bdHtml += `<div class="bd-row" style="opacity:0.7">
        <div class="bd-right">
          <div class="bd-dot" style="background:var(--orange)"></div>
          <span class="bd-name">אש״ל</span>
          <span class="bd-count" style="font-size:10px">(כלול בשכר)</span>
        </div>
        <span class="bd-pay" style="color:var(--orange)">${fmtNIS(totalMeal)}</span>
      </div>`;
    }

    if (fixedAdd.total > 0) {
      bdHtml += `<div class="bd-row">
        <div class="bd-right">
          <div class="bd-dot" style="background:var(--green)"></div>
          <span class="bd-name">תוספות קבועות</span>
          <span class="bd-count" style="font-size:10px">(חודשי)</span>
        </div>
        <span class="bd-pay" style="color:var(--green)">${fmtNIS(fixedAdd.total)}</span>
      </div>`;
    }

    bdList.innerHTML = bdHtml;
  }

  // Leave balance
  const leave = loadLeaveBalances();
  document.getElementById('vacBalance').textContent = leave.vacation;
  document.getElementById('sickBalance').textContent = leave.sick;

  const listEl = document.getElementById('recentShifts');
  if (monthShifts.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-text">אין משמרות ב${hebrewMonths[currentMonth]}</div>
        <div class="empty-hint">לחץ על "הוספה" להוסיף משמרת</div>
      </div>`;
    return;
  }

  listEl.innerHTML = monthShifts.map(s => {
    const p = s.date.split('-');
    const d = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
    return `
      <div class="shift-item">
        <div class="si-right">
          <span class="type-badge ${badgeCls[s.type]}">${typeNames[s.type]}</span>
          <span class="si-date">יום ${dayNamesFull[d.getDay()]}, ${d.getDate()}/${d.getMonth()+1}</span>
        </div>
        <div class="si-left">
          <div>
            <div class="si-pay">${fmtNIS(s.result.totalPay)}</div>
            <div class="si-hours">${s.result.flatRate ? 'קבוע' : s.result.totalHours + ' שעות'}</div>
          </div>
          <button class="si-delete" onclick="deleteShift(${s.id})">✕</button>
        </div>
      </div>`;
  }).join('');
}

// ===== Annual Forecast =====

function renderAnnualForecast(currentMonthGross) {
  const card = document.getElementById('forecastCard');
  if (!card) return;

  const monthlyData = typeof buildAnnualMonthlyData === 'function' ? buildAnnualMonthlyData(currentYear) : [];
  const monthsWithGross = monthlyData.filter(m => m.gross > 0);

  let projectedMonthly = currentMonthGross;
  if (projectedMonthly <= 0 && monthsWithGross.length > 0) {
    projectedMonthly = monthsWithGross.reduce((s, m) => s + m.gross, 0) / monthsWithGross.length;
  }

  // Use YTD from latest payslip when available for baseline
  const history = loadHistory();
  const yearHist = history[String(currentYear)] || {};
  let latestMonthIdx = -1;
  let ytdFromPayslip = 0;
  for (let i = 11; i >= 0; i--) {
    const hist = yearHist[i] || {};
    if (hist.gross > 0 && hist.cumulativeGrossTax > 0) {
      latestMonthIdx = i;
      ytdFromPayslip = hist.cumulativeGrossTax;
      break;
    }
  }
  const options = (latestMonthIdx >= 0 && ytdFromPayslip > 0)
    ? { ytdGross: ytdFromPayslip, monthsWithData: latestMonthIdx + 1 }
    : undefined;

  const pred = SalaryEngine.predictAnnualTax(monthlyData, projectedMonthly, creditPoints, dedSettings.taxYear2025, options);

  if (pred.estimatedAnnualGross > 0) {
    card.style.display = '';
    document.getElementById('forecastGross').textContent = fmtNIS(pred.estimatedAnnualGross);
    document.getElementById('forecastTax').textContent = '-' + fmtNIS(pred.predictedAnnualTax);
  } else {
    card.style.display = 'none';
  }
}

// ===== Payslip Comparison =====

function renderPayslipComparison(appGross, appTax, appDed, appNet) {
  const panel = document.getElementById('comparisonPanel');
  if (!panel) return;

  const slip = loadPayslip(currentYear, currentMonth);
  if (!slip || !slip.gross) {
    panel.style.display = 'none';
    return;
  }

  panel.style.display = '';
  const rows = [
    { name: 'ברוטו', app: appGross, actual: slip.gross },
    { name: 'מס הכנסה', app: appTax, actual: slip.incomeTax || 0, negative: true },
    { name: 'ביטוח לאומי', app: appDed.employee.nationalInsurance || appDed.employee.ni, actual: slip.ni || slip.nationalInsurance || 0, negative: true },
    { name: 'ביטוח בריאות', app: appDed.employee.healthInsurance || 0, actual: slip.health || slip.healthInsurance || 0, negative: true },
    { name: 'פנסיה', app: appDed.employee.pension, actual: slip.pension || 0, negative: true },
    { name: 'קרן השתלמות', app: appDed.employee.study, actual: slip.study || 0, negative: true },
    { name: 'נטו', app: appNet, actual: slip.actualNet || 0 },
  ];

  const body = document.getElementById('comparisonBody');
  body.innerHTML = rows.map(r => {
    const diff = (r.actual || 0) - r.app;
    const diffAbs = Math.abs(diff);
    const diffCls = diff > 0.5 ? 'green' : (diff < -0.5 ? 'red' : '');
    const sign = r.negative ? '-' : '';
    const diffSign = diff > 0 ? '+' : (diff < 0 ? '-' : '');
    return `<div class="cmp-row">
      <span class="cmp-name">${r.name}</span>
      <span class="cmp-val">${sign}${fmtNIS(r.app)}</span>
      <span class="cmp-val">${sign}${fmtNIS(r.actual)}</span>
      <span class="cmp-val ${diffCls}">${diffAbs < 0.5 ? '—' : diffSign + fmtNIS(diffAbs)}</span>
    </div>`;
  }).join('');
}

// ===== Payslip Entry Modal =====

function openPayslipModal() {
  const slip = loadPayslip(currentYear, currentMonth) || {};
  const overlay = document.getElementById('payslipOverlay');

  document.getElementById('psGross').value = slip.gross || '';
  document.getElementById('psNet').value = slip.actualNet || '';
  document.getElementById('psTax').value = slip.incomeTax || '';
  document.getElementById('psNI').value = slip.ni || slip.nationalInsurance || '';
  document.getElementById('psHealth').value = slip.health || slip.healthInsurance || '';
  document.getElementById('psPension').value = slip.pension || '';
  document.getElementById('psStudy').value = slip.study || '';
  document.getElementById('psCumTax').value = slip.cumulativeGrossTax || '';
  document.getElementById('psCumStudy').value = slip.cumulativeGrossStudy || '';
  document.getElementById('psMonthLabel').textContent = `${hebrewMonths[currentMonth]} ${currentYear}`;

  overlay.style.display = 'flex';
  requestAnimationFrame(() => overlay.classList.add('visible'));
}

function closePayslipModal() {
  const overlay = document.getElementById('payslipOverlay');
  overlay.classList.remove('visible');
  setTimeout(() => { overlay.style.display = 'none'; }, 200);
}

function recalcPayslipFromGross() {
  const g = parseFloat(document.getElementById('psGross').value);
  if (isNaN(g) || g <= 0) { showToast('⚠️ הזן ברוטו תחילה'); return; }
  const ded = calcDeductions(g);
  const tax = calcIncomeTax(g);
  document.getElementById('psTax').value = dedSettings.incomeTax ? Math.round(tax.finalTax * 100) / 100 : 0;
  document.getElementById('psNI').value = Math.round((ded.employee.nationalInsurance || ded.employee.ni) * 100) / 100;
  document.getElementById('psHealth').value = Math.round((ded.employee.healthInsurance || 0) * 100) / 100;
  document.getElementById('psPension').value = Math.round(ded.employee.pension * 100) / 100;
  document.getElementById('psStudy').value = Math.round(ded.employee.study * 100) / 100;
  const net = g - (dedSettings.incomeTax ? tax.finalTax : 0) - ded.employee.total;
  document.getElementById('psNet').value = Math.round(net * 100) / 100;
  showToast('✅ חושב לפי ברוטו – ניתן לערוך ידנית');
}

function savePayslipModal() {
  const g = parseFloat(document.getElementById('psGross').value);
  if (isNaN(g) || g <= 0) { showToast('⚠️ הזן ברוטו בפועל'); return; }

  const data = {
    gross: g,
    actualNet: parseFloat(document.getElementById('psNet').value) || 0,
    incomeTax: parseFloat(document.getElementById('psTax').value) || 0,
    ni: parseFloat(document.getElementById('psNI').value) || 0,
    health: parseFloat(document.getElementById('psHealth').value) || 0,
    pension: parseFloat(document.getElementById('psPension').value) || 0,
    study: parseFloat(document.getElementById('psStudy').value) || 0,
    cumulativeGrossTax: parseFloat(document.getElementById('psCumTax').value) || 0,
    cumulativeGrossStudy: parseFloat(document.getElementById('psCumStudy').value) || 0,
  };

  savePayslip(currentYear, currentMonth, data);
  closePayslipModal();
  render();
  if (typeof renderAnnual === 'function') renderAnnual();
  showToast('✅ תלוש נשמר');
}

// ===== Calendar =====

function renderCalendar() {
  const grid = document.getElementById('calGrid');
  const details = document.getElementById('calDetails');
  const monthShifts = getMonthShifts();

  const shiftsByDay = {};
  monthShifts.forEach(s => {
    const day = parseInt(s.date.split('-')[2]);
    if (!shiftsByDay[day]) shiftsByDay[day] = [];
    shiftsByDay[day].push(s);
  });

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date();

  let html = dayNames.map(d => `<div class="cal-header">${d}</div>`).join('');

  for (let i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';

  for (let d = 1; d <= daysInMonth; d++) {
    const shifts = shiftsByDay[d] || [];
    const isToday = d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
    const cls = [
      'cal-day',
      shifts.length ? 'has-shift' : '',
      isToday ? 'today' : ''
    ].filter(Boolean).join(' ');

    const dots = shifts.map(s => `<div class="cal-dot ${dotCls[s.type]}"></div>`).join('');

    html += `<div class="${cls}" onclick="showDayDetail(${d})">
      <span>${d}</span>
      ${dots ? `<div class="cal-dots">${dots}</div>` : ''}
    </div>`;
  }

  grid.innerHTML = html;
  details.innerHTML = '';
}

function shareWhatsApp() {
  const monthShifts = getMonthShifts();
  let totalH = 0, totalP = 0, totalMeal = 0;
  monthShifts.forEach(s => {
    totalH += s.result?.totalHours || 0;
    totalP += s.result?.totalPay || 0;
    totalMeal += s.result?.mealAllowance || 0;
  });

  const fixedAdd = monthShifts.length > 0 ? SalaryEngine.calculateFixedMonthlyAdditions() : { total: 0 };
  const totalGross = totalP + fixedAdd.total;

  const ded = calcDeductions(totalGross);
  const tax = calcIncomeTax(totalGross);
  const incomeTaxAmount = dedSettings.incomeTax ? tax.finalTax : 0;
  const netAfterAll = totalGross - ded.employee.total - incomeTaxAmount;

  const text = SalaryEngine.generateShareText({
    month: currentMonth,
    year: currentYear,
    shifts: monthShifts.length,
    hours: totalH,
    gross: totalGross,
    net: netAfterAll,
    mealAllowance: totalMeal,
    fixedAdditions: fixedAdd.total,
    healthInsurance: ded.employee.healthInsurance || 0,
  });

  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}

function showDayDetail(day) {
  const details = document.getElementById('calDetails');
  const monthShifts = getMonthShifts();
  const dayShifts = monthShifts.filter(s => parseInt(s.date.split('-')[2]) === day);

  if (dayShifts.length === 0) {
    details.innerHTML = `<div class="cal-day-detail">
      <div class="cdd-date">${day} ${hebrewMonths[currentMonth]}</div>
      <div style="color:var(--text-dim);font-size:13px;">אין משמרות</div>
    </div>`;
    return;
  }

  details.innerHTML = dayShifts.map(s => `
    <div class="cal-day-detail">
      <div class="cdd-date">${day} ${hebrewMonths[currentMonth]} – <span class="type-badge ${badgeCls[s.type]}">${typeNames[s.type]}</span></div>
      <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:22px;font-weight:700;color:var(--green)">${fmtNIS(s.result.totalPay)}</span>
        <span style="color:var(--text-dim);font-size:13px;">${s.result.flatRate ? 'קבוע' : s.result.totalHours + ' שעות'}</span>
      </div>
    </div>`).join('');
}
