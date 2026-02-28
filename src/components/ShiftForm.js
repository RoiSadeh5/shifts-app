/**
 * Shift Form Component – type selection, date/range picker, result panel.
 * Depends on globals from app.js and dataManager.js.
 */

function selectType(type) {
  selectedType = type;
  document.querySelectorAll('.type-btn').forEach(b =>
    b.classList.toggle('selected', b.dataset.type === type));
  document.getElementById('minusFields').classList.toggle('hidden', type !== 'minus');
}

function toggleBonus() {
  bonusOn = !bonusOn;
  document.getElementById('bonusToggle').classList.toggle('on', bonusOn);
}

function toggleRange() {
  rangeOn = !rangeOn;
  document.getElementById('rangeToggle').classList.toggle('on', rangeOn);
  document.getElementById('singleDateGroup').classList.toggle('hidden', rangeOn);
  document.getElementById('rangeDateGroup').classList.toggle('hidden', !rangeOn);
}

function getDatesInRange(startStr, endStr) {
  const dates = [];
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  if (isNaN(start) || isNaN(end) || end < start) return dates;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${day}`);
  }
  return dates;
}

function addShift() {
  let datesToAdd = [];

  if (rangeOn) {
    const rs = document.getElementById('rangeStart').value;
    const re = document.getElementById('rangeEnd').value;
    if (!rs || !re) { showToast('⚠️ בחר תאריכי התחלה וסיום'); return; }
    datesToAdd = getDatesInRange(rs, re);
    if (datesToAdd.length === 0) { showToast('⚠️ טווח תאריכים לא תקין'); return; }
    if (datesToAdd.length > 60) { showToast('⚠️ מקסימום 60 ימים בטווח'); return; }
  } else {
    const dateVal = document.getElementById('shiftDate').value;
    if (!dateVal) { showToast('⚠️ בחר תאריך'); return; }
    datesToAdd = [dateVal];
  }

  let startTime = null, endTime = null;
  if (selectedType === 'minus') {
    startTime = document.getElementById('startTime').value;
    endTime = document.getElementById('endTime').value;
    if (!startTime || !endTime) { showToast('⚠️ הזן שעות'); return; }
  }

  const existingShifts = loadShifts();
  const existingDates = new Set(existingShifts.map(s => s.date));
  const skipped = [];
  const added = [];
  let lastResult = null;

  datesToAdd.forEach((dateStr, idx) => {
    if (existingDates.has(dateStr)) {
      skipped.push(dateStr);
      return;
    }

    const shift = { id: Date.now() + idx, type: selectedType, date: dateStr, hasBonus: bonusOn && idx === 0 };

    if (selectedType === 'minus') {
      shift.startTime = startTime;
      shift.endTime = endTime;
    }

    const result = calculateShiftPay(shift);
    if (result.error) return;
    shift.result = result;
    existingShifts.push(shift);
    existingDates.add(dateStr);
    added.push(shift);
    lastResult = result;
  });

  if (added.length === 0 && skipped.length > 0) {
    showToast(`⚠️ כל ${skipped.length} הימים כבר קיימים`);
    return;
  }
  if (added.length === 0) {
    showToast('⚠️ שגיאה בחישוב');
    return;
  }

  saveShifts(existingShifts);

  if (added.length === 1) {
    showResultPanel(lastResult);
    showToast(`✅ נשמר! ₪${lastResult.totalPay.toLocaleString()}`);
  } else {
    const totalPay = added.reduce((s, sh) => s + sh.result.totalPay, 0);
    showResultPanel({
      totalPay, flatRate: selectedType === 'vacation',
      totalHours: added.reduce((s, sh) => s + (sh.result.totalHours || 0), 0),
      breakdown: null, bonusApplied: 0,
    });
    let msg = `✅ נוספו ${added.length} משמרות · ₪${Math.round(totalPay).toLocaleString()}`;
    if (skipped.length > 0) msg += ` (${skipped.length} דולגו)`;
    showToast(msg);
  }

  render();
  bonusOn = false;
  document.getElementById('bonusToggle').classList.remove('on');
}

function deleteShift(id) {
  if (!confirm('למחוק משמרת?')) return;
  saveShifts(loadShifts().filter(s => s.id !== id));
  render();
  renderCalendar();
}

function showResultPanel(r) {
  const panel = document.getElementById('resultPanel');
  document.getElementById('rpPay').textContent = `₪${r.totalPay.toLocaleString()}`;
  document.getElementById('rpHours').textContent = r.flatRate ? 'תעריף יומי קבוע' : `${r.totalHours} שעות`;
  const grid = document.getElementById('rpGrid');
  if (r.breakdown) {
    grid.innerHTML = `
      <div class="rp-item"><div class="rp-label">רגיל</div><div class="rp-val">₪${r.breakdown.regular}</div></div>
      <div class="rp-item"><div class="rp-label">סוף שבוע</div><div class="rp-val">₪${r.breakdown.weekend}</div></div>
      <div class="rp-item"><div class="rp-label">לילה (מנוחה)</div><div class="rp-val">₪${r.breakdown.rest}</div></div>
      <div class="rp-item"><div class="rp-label">סופ"ש + לילה</div><div class="rp-val">₪${r.breakdown.weekendRest}</div></div>
      ${r.bonusApplied ? `<div class="rp-item" style="grid-column:1/-1"><div class="rp-label">בונוס רבעוני</div><div class="rp-val" style="color:var(--green)">+₪${r.bonusApplied.toLocaleString()}</div></div>` : ''}`;
  } else { grid.innerHTML = ''; }
  panel.classList.add('show');
}
