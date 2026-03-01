/**
 * Annual Summary / Form 106 Component – yearly totals and past paycheck history.
 * Depends on globals from app.js, dataManager.js, and SalaryEngine.
 */

function changeAnnualYear(delta) {
  annualYear += delta;
  renderAnnual();
}

function switchAnnualView(view) {
  document.getElementById('annualTabSummary').classList.toggle('active', view === 'summary');
  document.getElementById('annualTabHistory').classList.toggle('active', view === 'history');
  document.getElementById('annualSummaryView').classList.toggle('hidden', view !== 'summary');
  document.getElementById('annualHistoryView').classList.toggle('hidden', view !== 'history');
}

function getShiftGrossForMonth(year, month) {
  const shifts = loadShifts().filter(s => {
    const p = s.date.split('-');
    return parseInt(p[0]) === year && parseInt(p[1]) - 1 === month;
  });
  let gross = 0;
  shifts.forEach(s => { gross += s.result?.totalPay || 0; });
  if (shifts.length > 0) gross += SalaryEngine.calculateFixedMonthlyAdditions().total;
  return gross;
}

function buildAnnualMonthlyData(year) {
  const history = loadHistory();
  const yearKey = String(year);
  const yearHistory = history[yearKey] || {};
  const months = [];

  for (let m = 0; m < 12; m++) {
    const shiftGross = getShiftGrossForMonth(year, m);
    const hist = yearHistory[m] || {};
    const hasHistory = hist.gross > 0 || hist.incomeTax > 0 || hist.ni > 0;
    const hasShifts = shiftGross > 0;

    const gross = hasHistory ? hist.gross : shiftGross;
    const ded = calcDeductions(gross);
    const tax = calcIncomeTax(gross);

    months.push({
      month: m,
      gross: gross,
      incomeTax: hasHistory ? (hist.incomeTax || 0) : (dedSettings.incomeTax ? tax.finalTax : 0),
      ni: hasHistory ? (hist.ni || 0) : ded.employee.ni,
      pension: hasHistory ? (hist.pension || 0) : ded.employee.pension,
      study: hasHistory ? (hist.study || 0) : ded.employee.study,
      empPension: hasHistory ? (hist.empPension || 0) : ded.employer.pension,
      empStudy: hasHistory ? (hist.empStudy || 0) : ded.employer.study,
      source: hasHistory ? 'manual' : (hasShifts ? 'auto' : 'empty'),
      cumulativeGrossTax: hist.cumulativeGrossTax || 0,
      cumulativeGrossStudy: hist.cumulativeGrossStudy || 0,
    });
  }
  return months;
}

function renderAnnual() {
  document.getElementById('annualYearLabel').textContent = annualYear;
  const monthlyData = buildAnnualMonthlyData(annualYear);
  const summary = SalaryEngine.calcAnnualSummary(monthlyData, creditPoints, dedSettings);
  const reportedMonths = monthlyData.filter(m => m.source !== 'empty').length;
  const manualMonths = monthlyData.filter(m => m.source === 'manual');

  document.getElementById('f106Net').textContent = fmtNIS(summary.totalNet);
  document.getElementById('f106Sub').textContent = reportedMonths > 0
    ? `${reportedMonths} חודשים מדווחים · שיעור מס אפקטיבי ${summary.totalGross > 0 ? Math.round(summary.totalIncomeTax / summary.totalGross * 100) : 0}%`
    : '';
  document.getElementById('f106Gross').textContent = fmtNIS(summary.totalGross);
  document.getElementById('f106Months').textContent = reportedMonths;
  document.getElementById('f106Tax').textContent = `-${fmtNIS(summary.totalIncomeTax)}`;
  document.getElementById('f106NI').textContent = `-${fmtNIS(summary.totalNI)}`;
  document.getElementById('f106Pension').textContent = `-${fmtNIS(summary.totalPension)}`;
  document.getElementById('f106Study').textContent = `-${fmtNIS(summary.totalStudy)}`;
  document.getElementById('f106TotalDed').textContent = `-${fmtNIS(summary.totalDeductions)}`;
  document.getElementById('f106EmpPension').textContent = `+${fmtNIS(summary.totalEmpPension)}`;
  document.getElementById('f106EmpStudy').textContent = `+${fmtNIS(summary.totalEmpStudy)}`;
  document.getElementById('f106EmpTotal').textContent = `+${fmtNIS(summary.totalEmpContributions)}`;

  // Cumulative data from actual payslips – only show when we have payslip entries
  const cumSection = document.getElementById('f106CumulativeSection');
  if (cumSection) {
    const yearKey = String(annualYear);
    const history = loadHistory();
    const yearHist = history[yearKey] || {};

    let latestMonthFound = -1;
    let taxValue = 0;
    let studyValue = 0;

    if (manualMonths.length === 0) {
      cumSection.style.display = 'none';
    } else {
      // Scan from month 11 backwards; first month with gross > 0 wins
      for (let i = 11; i >= 0; i--) {
        const hist = yearHist[String(i)] || yearHist[i] || {};
        const actualGross = hist.gross || 0;
        if (actualGross > 0) {
          latestMonthFound = i;
          taxValue = hist.cumulativeGrossTax || 0;
          studyValue = hist.cumulativeGrossStudy || 0;
          break;
        }
      }

      // Fallback: if cumulative fields are missing, sum monthly gross values
      if (taxValue === 0 && manualMonths.length > 0) {
        let runningGross = 0;
        for (let i = 0; i <= (latestMonthFound >= 0 ? latestMonthFound : 11); i++) {
          const hist = yearHist[String(i)] || yearHist[i] || {};
          runningGross += hist.gross || 0;
        }
        taxValue = runningGross;
      }
      if (studyValue === 0 && manualMonths.length > 0) {
        let runningGross = 0;
        for (let i = 0; i <= (latestMonthFound >= 0 ? latestMonthFound : 11); i++) {
          const hist = yearHist[String(i)] || yearHist[i] || {};
          runningGross += hist.gross || 0;
        }
        studyValue = runningGross;
      }

      console.log('Summary Debug:', {
        annualYear, yearKey, latestMonthFound, taxValue, studyValue,
        manualCount: manualMonths.length,
        yearHistKeys: Object.keys(yearHist),
      });

      const avgGross = manualMonths.reduce((s, m) => s + m.gross, 0) / manualMonths.length;

      cumSection.style.display = 'block';
      document.getElementById('f106AvgGross').textContent = fmtNIS(avgGross);
      document.getElementById('f106CumTax').textContent = taxValue > 0 ? fmtNIS(taxValue) : '—';
      document.getElementById('f106CumStudy').textContent = studyValue > 0 ? fmtNIS(studyValue) : '—';
      document.getElementById('f106ManualCount').textContent = manualMonths.length + ' תלושים';
    }
  }

  renderHistoryMonths(monthlyData);
}

function renderHistoryMonths(monthlyData) {
  const container = document.getElementById('historyMonthsList');
  container.innerHTML = monthlyData.map((m, idx) => {
    const sourceLabel = m.source === 'auto' ? 'משמרות' : (m.source === 'manual' ? 'ידני' : '');
    const sourceCls = m.source === 'auto' ? 'auto' : 'manual';
    return `
      <div class="history-month-card">
        <div class="hm-header" onclick="toggleHistoryMonth(${idx})">
          <div style="display:flex;align-items:center;gap:8px">
            <span class="hm-month">${hebrewMonths[idx]}</span>
            ${sourceLabel ? `<span class="hm-source ${sourceCls}">${sourceLabel}</span>` : ''}
          </div>
          <span class="hm-gross">${m.gross > 0 ? fmtNIS(m.gross) : '—'}</span>
        </div>
        <div class="hm-body" id="hmBody${idx}">
          <div class="hm-fields">
            <div class="hm-field"><label>ברוטו חודשי</label><input type="number" inputmode="decimal" step="0.01" value="${m.source === 'manual' ? m.gross : ''}" placeholder="${m.source === 'auto' ? Math.round(m.gross) : '0'}" onchange="saveHistoryField(${idx},'gross',this.value)"></div>
            <div class="hm-field"><label>מס הכנסה ששולם</label><input type="number" inputmode="decimal" step="0.01" value="${m.source === 'manual' ? m.incomeTax : ''}" placeholder="${m.source === 'auto' ? Math.round(m.incomeTax) : '0'}" onchange="saveHistoryField(${idx},'incomeTax',this.value)"></div>
            <div class="hm-field"><label>ביטוח לאומי ששולם</label><input type="number" inputmode="decimal" step="0.01" value="${m.source === 'manual' ? m.ni : ''}" placeholder="${m.source === 'auto' ? Math.round(m.ni) : '0'}" onchange="saveHistoryField(${idx},'ni',this.value)"></div>
            <div class="hm-field"><label>פנסיה (עובד)</label><input type="number" inputmode="decimal" step="0.01" value="${m.source === 'manual' ? m.pension : ''}" placeholder="${m.source === 'auto' ? Math.round(m.pension) : '0'}" onchange="saveHistoryField(${idx},'pension',this.value)"></div>
            <div class="hm-field"><label>קרן השתלמות (עובד)</label><input type="number" inputmode="decimal" step="0.01" value="${m.source === 'manual' ? m.study : ''}" placeholder="${m.source === 'auto' ? Math.round(m.study) : '0'}" onchange="saveHistoryField(${idx},'study',this.value)"></div>
          </div>
        </div>
      </div>`;
  }).join('');
}

function toggleHistoryMonth(idx) {
  const body = document.getElementById('hmBody' + idx);
  body.classList.toggle('open');
}

function saveHistoryField(monthIdx, field, value) {
  const history = loadHistory();
  const yearKey = String(annualYear);
  if (!history[yearKey]) history[yearKey] = {};
  if (!history[yearKey][monthIdx]) history[yearKey][monthIdx] = {};

  const numVal = parseFloat(value);
  if (!isNaN(numVal) && numVal > 0) {
    history[yearKey][monthIdx][field] = numVal;
    if (field === 'gross') {
      const g = numVal;
      const ded = calcDeductions(g);
      const tax = calcIncomeTax(g);
      const h = history[yearKey][monthIdx];
      if (!h.incomeTax) h.incomeTax = dedSettings.incomeTax ? tax.finalTax : 0;
      if (!h.ni) h.ni = ded.employee.ni;
      if (!h.pension) h.pension = ded.employee.pension;
      if (!h.study) h.study = ded.employee.study;
      if (!h.empPension) h.empPension = ded.employer.pension;
      if (!h.empStudy) h.empStudy = ded.employer.study;
    }
  } else {
    delete history[yearKey][monthIdx][field];
    if (Object.keys(history[yearKey][monthIdx]).length === 0) {
      delete history[yearKey][monthIdx];
    }
  }
  saveHistory(history);
  renderAnnual();
}
