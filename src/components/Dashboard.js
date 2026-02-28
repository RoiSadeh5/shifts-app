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
  let totalH = 0, totalP = 0;
  const typeTotals = {};

  monthShifts.forEach(s => {
    totalH += s.result?.totalHours || 0;
    totalP += s.result?.totalPay || 0;
    const t = s.type;
    if (!typeTotals[t]) typeTotals[t] = { count: 0, pay: 0 };
    typeTotals[t].count++;
    typeTotals[t].pay += s.result?.totalPay || 0;
  });

  const ded = calcDeductions(totalP);
  const tax = calcIncomeTax(totalP);
  const incomeTaxAmount = dedSettings.incomeTax ? tax.finalTax : 0;
  const totalAllDeductions = ded.employee.total + incomeTaxAmount;
  const netAfterAll = totalP - totalAllDeductions;

  document.getElementById('heroNet').textContent = fmtNIS(netAfterAll);
  document.getElementById('heroNetSub').textContent =
    totalP > 0 ? `${Math.round(netAfterAll / totalP * 100)}% מהברוטו` : '';
  document.getElementById('heroGross').textContent = fmtNIS(totalP);
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
  document.getElementById('dedNI').textContent = `-${fmtNIS(ded.employee.ni)}`;

  document.getElementById('studyCap').style.display = totalP > STUDY_CEILING ? '' : 'none';

  const niDetail = document.getElementById('niTierDetail');
  if (ded.employee.ni > 0) {
    niDetail.style.display = '';
    document.getElementById('niTier1').textContent = `-${fmtNIS(ded.employee.niTier1)}`;
    document.getElementById('niTier2').textContent = ded.employee.niTier2 > 0 ? `-${fmtNIS(ded.employee.niTier2)}` : '₪0';
  } else {
    niDetail.style.display = 'none';
  }

  document.getElementById('empTotal').textContent = `+${fmtNIS(ded.employer.total)}`;
  document.getElementById('empPension').textContent = `+${fmtNIS(ded.employer.pension)}`;
  document.getElementById('empStudy').textContent = `+${fmtNIS(ded.employer.study)}`;

  const hasGross = totalP > 0;
  document.getElementById('deductionsPanel').style.display = hasGross ? '' : 'none';
  document.getElementById('employerPanel').style.display = hasGross ? '' : 'none';

  const bdList = document.getElementById('breakdownList');
  const bdSection = document.getElementById('breakdownSection');
  if (Object.keys(typeTotals).length === 0) {
    bdSection.classList.add('hidden');
  } else {
    bdSection.classList.remove('hidden');
    bdList.innerHTML = Object.entries(typeTotals).map(([type, data]) => `
      <div class="bd-row">
        <div class="bd-right">
          <div class="bd-dot" style="background:${dotColors[type]}"></div>
          <span class="bd-name">${typeNames[type]}</span>
          <span class="bd-count">(${data.count})</span>
        </div>
        <span class="bd-pay" style="color:${dotColors[type]}">${fmtNIS(data.pay)}</span>
      </div>
    `).join('');
  }

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
