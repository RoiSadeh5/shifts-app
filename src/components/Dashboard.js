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

  // Show actual payslip net when no shifts exist for this month
  const slip = loadPayslip(currentYear, currentMonth);
  const hasActualSlip = slip && slip.gross > 0;
  let displayNet = netAfterAll;
  let displayGross = totalGross;
  let netSubText = '';

  if (totalGross > 0) {
    netSubText = `${Math.round(netAfterAll / totalGross * 100)}% מהברוטו`;
  } else if (hasActualSlip) {
    const slipTax = slip.incomeTax || 0;
    const slipNI = slip.ni || slip.nationalInsurance || 0;
    const slipHealth = slip.health || slip.healthInsurance || 0;
    const slipPension = slip.pension || 0;
    const slipStudy = slip.study || 0;
    const slipDedSum = slipTax + slipNI + slipHealth + slipPension + slipStudy;

    if (slip.actualNet && slip.actualNet > 0) {
      displayNet = slip.actualNet;
    } else if (slipDedSum > 0) {
      displayNet = slip.gross - slipDedSum;
    } else {
      const autoDed = calcDeductions(slip.gross);
      const autoTax = calcIncomeTax(slip.gross);
      const autoTaxAmt = dedSettings.incomeTax ? autoTax.finalTax : 0;
      displayNet = slip.gross - autoDed.employee.total - autoTaxAmt;
    }
    displayGross = slip.gross;
    netSubText = 'לפי תלוש בפועל';
  }

  var heroNetEl = document.getElementById('heroNet');
  var heroGrossEl = document.getElementById('heroGross');
  if (typeof countUp === 'function') {
    if (heroNetEl) countUp(heroNetEl, displayNet, { formatter: fmtNIS });
    if (heroGrossEl) countUp(heroGrossEl, displayGross, { formatter: fmtNIS });
  } else {
    if (heroNetEl) heroNetEl.textContent = fmtNIS(displayNet);
    if (heroGrossEl) heroGrossEl.textContent = fmtNIS(displayGross);
  }
  document.getElementById('heroNetSub').textContent = netSubText;
  document.getElementById('heroSub').textContent = `${monthShifts.length} משמרות · ${Math.round(totalH)} שעות`;
  var payDateEl = document.getElementById('heroPaymentDate');
  if (payDateEl && typeof formatPaymentDateLabel === 'function') {
    payDateEl.textContent = formatPaymentDateLabel(currentMonth, currentYear);
  }

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
  const niVal = ded.employee.nationalInsurance != null ? ded.employee.nationalInsurance : ded.employee.ni;
  const healthVal = ded.employee.healthInsurance != null ? ded.employee.healthInsurance : 0;
  if (totalGross > 0 && healthVal === 0) {
    console.warn('Health Insurance Debug: gross=' + totalGross + ', ni toggle=' + dedSettings.ni,
      ', healthInsurance=' + ded.employee.healthInsurance,
      ', full ded=', JSON.stringify(ded.employee));
  }
  document.getElementById('dedNI').textContent = `-${fmtNIS(niVal)}`;
  document.getElementById('dedHealth').textContent = `-${fmtNIS(healthVal)}`;

  const niTierRow = document.getElementById('niTierRow');
  const niDetail = document.getElementById('niTierDetail');
  if (ded.employee.ni > 0) {
    niTierRow.style.display = '';
    document.getElementById('niTier1').textContent = `-${fmtNIS(niVal)}`;
    document.getElementById('niTier2').textContent = `-${fmtNIS(healthVal)}`;
  } else {
    niTierRow.style.display = 'none';
  }

  document.getElementById('empTotal').textContent = `+${fmtNIS(ded.employer.total)}`;
  document.getElementById('empPension').textContent = `+${fmtNIS(ded.employer.pension)}`;
  document.getElementById('empStudy').textContent = `+${fmtNIS(ded.employer.study)}`;

  const hasGross = totalGross > 0;
  const hasAnyData = hasGross || hasActualSlip;
  const simple = !!dedSettings.simpleMode;

  // Simple Mode: forcefully hide all advanced panels
  document.getElementById('deductionsPanel').style.display = (hasGross && !simple) ? '' : 'none';
  document.getElementById('employerPanel').style.display = (hasGross && !simple) ? '' : 'none';
  var shareEl = document.getElementById('shareButtons');
  if (shareEl) {
    shareEl.style.display = hasAnyData ? 'grid' : 'none';
  }
  document.getElementById('forecastCard').style.display = 'none';
  document.getElementById('comparisonPanel').style.display = simple ? 'none' : '';
  document.getElementById('statsGrid').style.display = simple ? 'none' : '';
  document.getElementById('leaveBalance').style.display = simple ? 'none' : '';
  document.getElementById('breakdownSection').style.display = simple ? 'none' : '';

  var chartsEl = document.getElementById('chartsContainer');
  if (chartsEl) {
    if (showCharts && !simple) {
      chartsEl.style.display = '';
      if (typeof initCharts === 'function') setTimeout(initCharts, 50);
    } else {
      chartsEl.style.display = 'none';
      if (typeof destroyCharts === 'function') destroyCharts();
    }
  }

  // ===== Monthly Projection (visible in all modes) =====
  renderMonthlyProjection(totalGross, monthShifts);

  // ===== Payslip Comparison =====
  if (!simple) renderPayslipComparison(totalGross, incomeTaxAmount, ded, netAfterAll);

  // Type breakdown + meal allowance info + fixed additions
  if (!simple) {
    const bdList = document.getElementById('breakdownList');
    const bdSection = document.getElementById('breakdownSection');
    const hasBreakdown = Object.keys(typeTotals).length > 0 || fixedAdd.total > 0;

    if (!hasBreakdown) {
      bdSection.style.display = 'none';
    } else {
      bdSection.style.display = '';
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
  }

  // Leave balance
  const leave = loadLeaveBalances();
  document.getElementById('vacBalance').textContent = leave.vacation;
  document.getElementById('sickBalance').textContent = leave.sick;

  const listEl = document.getElementById('recentShifts');
  if (monthShifts.length === 0) {
    const allShifts = loadShifts();
    const isFirstEver = allShifts.length === 0;
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${isFirstEver ? '👋' : '📭'}</div>
        <div class="empty-text">${isFirstEver ? 'ברוך הבא! הוסף משמרת ראשונה' : 'אין משמרות ב' + hebrewMonths[currentMonth]}</div>
        <div class="empty-hint">${isFirstEver ? 'לחץ למטה להתחיל' : 'לחץ למטה להוסיף משמרת'}</div>
        <button class="empty-state-btn" onclick="switchTab('Add')">➕ הוסף משמרת</button>
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
  if (typeof staggerEntrance === 'function') {
    staggerEntrance(listEl, '.shift-item');
  }
}

// ===== Monthly Projection =====

function renderMonthlyProjection(currentGross, monthShifts) {
  const grossProjEl = document.getElementById('heroGrossProj');
  const netProjEl = document.getElementById('heroNetProj');
  if (!grossProjEl || !netProjEl) return;

  const today = new Date();
  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

  if (!isCurrentMonth || currentGross <= 0 || monthShifts.length === 0) {
    grossProjEl.style.display = 'none';
    netProjEl.style.display = 'none';
    return;
  }

  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  if (dayOfMonth >= daysInMonth) {
    grossProjEl.style.display = 'none';
    netProjEl.style.display = 'none';
    return;
  }

  // Scan up to 12 months back (crosses year boundary) for actual payslip gross
  const allHistory = loadHistory();
  const monthlyGrossHistory = [];
  let scanYear = currentYear;
  let scanMonth = currentMonth - 1;
  for (let i = 0; i < 12; i++) {
    if (scanMonth < 0) { scanMonth = 11; scanYear--; }
    const yearData = allHistory[String(scanYear)];
    if (yearData) {
      const rec = yearData[String(scanMonth)] || yearData[scanMonth];
      if (rec && rec.gross > 0) {
        monthlyGrossHistory.push(rec.gross);
      }
    }
    scanMonth--;
  }

  console.log('Projection Debug:', {
    currentGross, dayOfMonth, daysInMonth,
    historyFound: monthlyGrossHistory.length,
    historyValues: monthlyGrossHistory,
  });

  const proj = SalaryEngine.getMonthlyProjection(
    currentGross, dayOfMonth, daysInMonth, creditPoints, dedSettings,
    { monthlyGrossHistory, baseRate: userRates.baseRate }
  );
  if (!proj) {
    grossProjEl.style.display = 'none';
    netProjEl.style.display = 'none';
    return;
  }

  console.log('Projection Result:', proj);

  grossProjEl.textContent = `צפי לסוף חודש: ${fmtNIS(proj.projectedGross)} (דיוק: ${proj.precision}%)`;
  grossProjEl.style.display = '';
  netProjEl.textContent = `צפי נטו: ${fmtNIS(proj.projectedNet)}`;
  netProjEl.style.display = '';
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
    const taxEl = document.getElementById('forecastTax');
    const taxLabelEl = document.getElementById('forecastTaxLabel');
    if (pred.predictedAnnualTax > 0) {
      taxEl.textContent = fmtNIS(pred.predictedAnnualTax);
      taxEl.className = 'forecast-val red';
      if (taxLabelEl) taxLabelEl.textContent = 'מס שנתי חזוי';
    } else {
      taxEl.textContent = fmtNIS(0);
      taxEl.className = 'forecast-val green';
      if (taxLabelEl) taxLabelEl.textContent = 'החזר משוער';
    }
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

  // Derive actual net from deductions if not explicitly entered
  const slipTax = slip.incomeTax || 0;
  const slipNI = slip.ni || slip.nationalInsurance || 0;
  const slipHealth = slip.health || slip.healthInsurance || 0;
  const slipPension = slip.pension || 0;
  const slipStudy = slip.study || 0;
  const slipDedSum = slipTax + slipNI + slipHealth + slipPension + slipStudy;
  let actualNet;
  if (slip.actualNet && slip.actualNet > 0) {
    actualNet = slip.actualNet;
  } else if (slipDedSum > 0) {
    actualNet = slip.gross - slipDedSum;
  } else {
    const autoDed = calcDeductions(slip.gross);
    const autoTax = calcIncomeTax(slip.gross);
    const autoTaxAmt = dedSettings.incomeTax ? autoTax.finalTax : 0;
    actualNet = slip.gross - autoDed.employee.total - autoTaxAmt;
  }

  const rows = [
    { name: 'ברוטו', app: appGross, actual: slip.gross },
    { name: 'מס הכנסה', app: appTax, actual: slipTax, negative: true },
    { name: 'ביטוח לאומי', app: appDed.employee.nationalInsurance != null ? appDed.employee.nationalInsurance : appDed.employee.ni, actual: slipNI, negative: true },
    { name: 'ביטוח בריאות', app: appDed.employee.healthInsurance != null ? appDed.employee.healthInsurance : 0, actual: slipHealth, negative: true },
    { name: 'פנסיה', app: appDed.employee.pension, actual: slipPension, negative: true },
    { name: 'קרן השתלמות', app: appDed.employee.study, actual: slipStudy, negative: true },
    { name: 'נטו', app: appNet, actual: actualNet },
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

  const enteredNet = parseFloat(document.getElementById('psNet').value) || 0;
  const enteredTax = parseFloat(document.getElementById('psTax').value) || 0;
  const enteredNI = parseFloat(document.getElementById('psNI').value) || 0;
  const enteredHealth = parseFloat(document.getElementById('psHealth').value) || 0;
  const enteredPension = parseFloat(document.getElementById('psPension').value) || 0;
  const enteredStudy = parseFloat(document.getElementById('psStudy').value) || 0;

  let finalNet = enteredNet;
  if (finalNet <= 0) {
    const sumDeductions = enteredTax + enteredNI + enteredHealth + enteredPension + enteredStudy;
    if (sumDeductions > 0) {
      finalNet = g - sumDeductions;
    } else {
      const autoDed = calcDeductions(g);
      const autoTax = calcIncomeTax(g);
      const autoTaxAmt = dedSettings.incomeTax ? autoTax.finalTax : 0;
      finalNet = g - autoDed.employee.total - autoTaxAmt;
    }
  }

  const data = {
    gross: g,
    actualNet: Math.round(finalNet * 100) / 100,
    incomeTax: enteredTax,
    ni: enteredNI,
    health: enteredHealth,
    pension: enteredPension,
    study: enteredStudy,
    cumulativeGrossTax: parseFloat(document.getElementById('psCumTax').value) || 0,
    cumulativeGrossStudy: parseFloat(document.getElementById('psCumStudy').value) || 0,
  };

  savePayslip(currentYear, currentMonth, data);
  closePayslipModal();
  render();
  if (typeof renderAnnual === 'function') renderAnnual();
  showToast('✅ תלוש נשמר');
}

// ===== shareWhatsApp =====

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
    healthInsurance: ded.employee.healthInsurance != null ? ded.employee.healthInsurance : 0,
  });

  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}
