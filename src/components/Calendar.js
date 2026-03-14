/**
 * Calendar component – month/week view, swipe, tap empty day → Add form.
 * Depends on Dashboard (getMonthShifts), app.js globals.
 */
var calViewMode = 'month';
var calSwipeStartX = 0;

function renderCalendar() {
  try {
    renderCalendarCore();
  } catch (e) {
    console.error('Calendar render error:', e);
    if (typeof showToast === 'function') showToast('שגיאה – נסה לרענן');
  }
}

function renderCalendarCore() {
  var grid = document.getElementById('calGrid');
  var details = document.getElementById('calDetails');
  if (!grid || !details) return;
  var monthShifts = typeof getMonthShifts === 'function' ? getMonthShifts() : [];

  var shiftsByDay = {};
  monthShifts.forEach(function(s) {
    var day = parseInt(s.date.split('-')[2]);
    if (!shiftsByDay[day]) shiftsByDay[day] = [];
    shiftsByDay[day].push(s);
  });

  var firstDay = new Date(currentYear, currentMonth, 1).getDay();
  var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  var today = new Date();

  var html = dayNames.map(function(d) { return '<div class="cal-header">' + d + '</div>'; }).join('');

  if (calViewMode === 'week') {
    var refDay = (currentYear === today.getFullYear() && currentMonth === today.getMonth())
      ? today.getDate() : 15;
    var weekStart = Math.max(1, refDay - new Date(currentYear, currentMonth, refDay).getDay());
    var weekEnd = Math.min(daysInMonth, weekStart + 6);
    for (var j = 0; j < firstDay; j++) html += '<div class="cal-day empty"></div>';
    for (var d = 1; d <= daysInMonth; d++) {
      var inWeek = d >= weekStart && d <= weekEnd;
      if (!inWeek) {
        html += '<div class="cal-day empty"></div>';
      } else {
        var shifts = shiftsByDay[d] || [];
        var isToday = d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
        var cls = 'cal-day' + (shifts.length ? ' has-shift' : '') + (isToday ? ' today' : '');
        var dots = shifts.map(function(s) { return '<div class="cal-dot ' + dotCls[s.type] + '"></div>'; }).join('');
        html += '<div class="' + cls + '" onclick="showDayDetail(' + d + ')"><span>' + d + '</span>' + (dots ? '<div class="cal-dots">' + dots + '</div>' : '') + '</div>';
      }
    }
  } else {
    for (var i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';

    for (var d = 1; d <= daysInMonth; d++) {
      var shifts = shiftsByDay[d] || [];
      var isToday = d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
      var cls = 'cal-day' + (shifts.length ? ' has-shift' : '') + (isToday ? ' today' : '');
      var dots = shifts.map(function(s) { return '<div class="cal-dot ' + dotCls[s.type] + '"></div>'; }).join('');
      html += '<div class="' + cls + '" onclick="showDayDetail(' + d + ')"><span>' + d + '</span>' + (dots ? '<div class="cal-dots">' + dots + '</div>' : '') + '</div>';
    }
  }

  grid.innerHTML = html;
  details.innerHTML = '';
  initCalSwipe(grid);
}

function initCalSwipe(container) {
  if (!container) return;
  if (container.dataset.calSwipe) return;
  container.dataset.calSwipe = '1';
  container.addEventListener('touchstart', function calTouchStart(e) {
    if (e.touches.length === 1) calSwipeStartX = e.touches[0].clientX;
  }, { passive: true });
  container.addEventListener('touchend', function calTouchEnd(e) {
    if (e.changedTouches.length !== 1) return;
    var dx = e.changedTouches[0].clientX - calSwipeStartX;
    if (dx > 60) changeMonth(-1);
    else if (dx < -60) changeMonth(1);
  }, { passive: true });
}

function showDayDetail(day) {
  var details = document.getElementById('calDetails');
  var monthShifts = getMonthShifts();
  var dayShifts = monthShifts.filter(function(s) { return parseInt(s.date.split('-')[2]) === day; });

  if (dayShifts.length === 0) {
    var y = currentYear;
    var m = String(currentMonth + 1).padStart(2, '0');
    var dStr = String(day).padStart(2, '0');
    var dateVal = y + '-' + m + '-' + dStr;
    details.innerHTML = '<div class="cal-day-detail">' +
      '<div class="cdd-date">' + day + ' ' + hebrewMonths[currentMonth] + '</div>' +
      '<div style="color:var(--text-dim);font-size:13px;margin-bottom:12px;">אין משמרות</div>' +
      '<button class="btn-add" onclick="openAddForDate(\'' + dateVal + '\')">➕ הוסף משמרת ליום זה</button>' +
      '</div>';
    return;
  }

  details.innerHTML = dayShifts.map(function(s) {
    return '<div class="cal-day-detail">' +
      '<div class="cdd-date">' + day + ' ' + hebrewMonths[currentMonth] + ' – <span class="type-badge ' + badgeCls[s.type] + '">' + typeNames[s.type] + '</span></div>' +
      '<div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">' +
      '<span style="font-size:22px;font-weight:700;color:var(--green)">' + fmtNIS(s.result.totalPay) + '</span>' +
      '<span style="color:var(--text-dim);font-size:13px;">' + (s.result.flatRate ? 'קבוע' : s.result.totalHours + ' שעות') + '</span>' +
      '</div></div>';
  }).join('');
}

function openAddForDate(dateStr) {
  haptic(true);
  document.getElementById('shiftDate').value = dateStr;
  switchTab('Add');
}

function toggleCalView() {
  calViewMode = calViewMode === 'month' ? 'week' : 'month';
  var btn = document.getElementById('calViewToggle');
  if (btn) btn.textContent = calViewMode === 'month' ? 'שבוע' : 'חודש';
  renderCalendar();
}
