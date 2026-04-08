/**
 * Shift Templates – CRUD, apply to week/month, capture current week.
 * Stores in IndexedDB. Template: { id, name, pattern: [{ dayOfWeek: 0-6, type }] }
 */
var templatesCache = [];

function loadTemplates(cb) {
  if (typeof window !== 'undefined' && window.db) {
    window.db.getTemplates().then(function(list) {
      templatesCache = list || [];
      if (cb) cb(templatesCache);
    });
  } else {
    templatesCache = [];
    if (cb) cb([]);
  }
}

function saveTemplate(tpl, cb) {
  if (!tpl.id) tpl.id = 'tpl_' + Date.now();
  if (typeof window !== 'undefined' && window.db) {
    window.db.saveTemplate(tpl).then(function() {
      var idx = templatesCache.findIndex(function(t) { return t.id === tpl.id; });
      if (idx >= 0) templatesCache[idx] = tpl;
      else templatesCache.push(tpl);
      if (cb) cb();
    });
  } else if (cb) cb();
}

function deleteTemplate(id, cb) {
  if (typeof window !== 'undefined' && window.db) {
    window.db.deleteTemplate(id).then(function() {
      templatesCache = templatesCache.filter(function(t) { return t.id !== id; });
      if (cb) cb();
    });
  } else if (cb) cb();
}

function renderTemplates() {
  var container = document.getElementById('templatesContainer');
  if (!container) return;
  loadTemplates(function(list) {
    if (list.length === 0) {
      container.innerHTML = '<div class="section-label" style="margin-bottom:8px;">תבניות משמרות</div>' +
        '<div class="empty-state" style="padding:24px;"><div class="empty-hint">אין תבניות. צלם את השבוע הנוכחי או צור תבנית חדשה.</div>' +
        '<button class="btn-secondary" style="margin-top:12px;" onclick="captureCurrentWeek()">📸 צלם שבוע נוכחי</button></div>';
      return;
    }
    var html = '<div class="section-label" style="margin-bottom:8px;">תבניות משמרות</div>' +
      '<button class="btn-secondary" style="margin-bottom:10px;" onclick="captureCurrentWeek()">📸 צלם שבוע נוכחי</button>' +
      list.map(function(t) {
        var summary = (t.pattern || []).map(function(p) {
          var d = ['א\'','ב\'','ג\'','ד\'','ה\'','ו\'','ש\''][p.dayOfWeek] || '';
          var tn = (typeof typeNames !== 'undefined' && typeNames[p.type]) ? typeNames[p.type] : p.type;
          return d + ':' + tn;
        }).join(' ');
        return '<div class="template-card" data-id="' + t.id + '">' +
          '<div class="template-name">' + (t.name || 'ללא שם') + '</div>' +
          '<div class="template-summary">' + (summary || '—') + '</div>' +
          '<div class="template-actions">' +
          '<button class="btn-payslip" onclick="applyTemplateToWeek(\'' + t.id + '\')">שבוע</button>' +
          '<button class="btn-payslip" onclick="applyTemplateToMonth(\'' + t.id + '\')">חודש</button>' +
          '<button class="si-delete" onclick="deleteTemplateUi(\'' + t.id + '\')" title="מחק">✕</button>' +
          '</div></div>';
      }).join('');
    container.innerHTML = html;
  });
}

function captureCurrentWeek() {
  var now = new Date();
  var dayOfWeek = now.getDay();
  var startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  var shifts = loadShifts();
  var pattern = [];
  for (var d = 0; d < 7; d++) {
    var dDate = new Date(startOfWeek);
    dDate.setDate(startOfWeek.getDate() + d);
    var y = dDate.getFullYear();
    var m = String(dDate.getMonth() + 1).padStart(2, '0');
    var day = String(dDate.getDate()).padStart(2, '0');
    var dateStr = y + '-' + m + '-' + day;
    var dayShifts = shifts.filter(function(s) { return s.date === dateStr; });
    if (dayShifts.length > 0) {
      pattern.push({ dayOfWeek: d, type: dayShifts[0].type });
    }
  }
  if (pattern.length === 0) {
    showToast('אין משמרות בשבוע הנוכחי');
    return;
  }
  var name = 'שבוע ' + startOfWeek.getDate() + '/' + (startOfWeek.getMonth() + 1);
  var tpl = { id: 'tpl_' + Date.now(), name: name, pattern: pattern };
  saveTemplate(tpl, function() {
    renderTemplates();
    showToast('תבנית נשמרה');
  });
  haptic(true);
}

function applyTemplateToWeek(tplId) {
  var tpl = templatesCache.find(function(t) { return t.id === tplId; });
  if (!tpl || !tpl.pattern || tpl.pattern.length === 0) { showToast('תבנית לא נמצאה'); return; }
  var startStr = document.getElementById('rangeStart').value || document.getElementById('shiftDate').value;
  if (!startStr) { showToast('בחר תאריך התחלה'); return; }
  var start = new Date(startStr + 'T00:00:00');
  var dayOfWeekStart = start.getDay();
  var existing = loadShifts();
  var existingSet = new Set(existing.map(function(s) { return s.date; }));
  var added = 0;
  tpl.pattern.forEach(function(p) {
    var diff = (p.dayOfWeek - dayOfWeekStart + 7) % 7;
    var d = new Date(start);
    d.setDate(start.getDate() + diff);
    var dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    if (existingSet.has(dateStr)) return;
    var shift = { id: Date.now() + added, type: p.type, date: dateStr };
    shift.result = typeof calculateShiftPay === 'function' ? calculateShiftPay(shift) : {};
    existing.push(shift);
    existingSet.add(dateStr);
    added++;
  });
  saveShifts(existing);
  if (typeof refreshCurrentView === 'function') refreshCurrentView();
  recalcAll();
  render();
  renderCalendar();
  showToast('נוספו ' + added + ' משמרות');
  haptic(true);
}

function applyTemplateToMonth(tplId) {
  var tpl = templatesCache.find(function(t) { return t.id === tplId; });
  if (!tpl || !tpl.pattern || tpl.pattern.length === 0) { showToast('תבנית לא נמצאה'); return; }
  var y = currentYear;
  var m = currentMonth;
  var firstDay = new Date(y, m, 1);
  var lastDay = new Date(y, m + 1, 0);
  var existing = loadShifts();
  var existingSet = new Set(existing.map(function(s) { return s.date; }));
  var added = 0;
  for (var d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    var dow = d.getDay();
    var p = tpl.pattern.find(function(x) { return x.dayOfWeek === dow; });
    if (!p) continue;
    var dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    if (existingSet.has(dateStr)) continue;
    var shift = { id: Date.now() + added, type: p.type, date: dateStr };
    shift.result = typeof calculateShiftPay === 'function' ? calculateShiftPay(shift) : {};
    existing.push(shift);
    existingSet.add(dateStr);
    added++;
  }
  saveShifts(existing);
  if (typeof refreshCurrentView === 'function') refreshCurrentView();
  recalcAll();
  render();
  renderCalendar();
  showToast('נוספו ' + added + ' משמרות לחודש');
  haptic(true);
}

function deleteTemplateUi(id) {
  showConfirm('מחיקת תבנית', 'למחוק את התבנית?', function() {
    deleteTemplate(id, function() {
      renderTemplates();
      showToast('נמחק');
    });
  }, 'מחק');
}
