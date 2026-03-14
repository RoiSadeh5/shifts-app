/**
 * Smart reminders for שכ״ש – shotef+30 (salary paid on 1st of month+2).
 * End-of-month, payslip due, vacation balance. Uses Notification API when available.
 */
function getPaymentDateForMonth(month, year) {
  var payMonth = month + 2;
  var payYear = year;
  if (payMonth > 11) {
    payMonth -= 12;
    payYear++;
  }
  return { month: payMonth, year: payYear };
}

function formatPaymentDateLabel(month, year) {
  var h = typeof hebrewMonths !== 'undefined' ? hebrewMonths : ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  var p = getPaymentDateForMonth(month, year);
  return 'תשלום: 1 ' + (h[p.month] || '') + ' \'' + String(p.year).slice(-2);
}

function requestNotificationPermission(cb) {
  if (!('Notification' in window)) { if (cb) cb('unsupported'); return; }
  if (Notification.permission === 'granted') { if (cb) cb('granted'); return; }
  if (Notification.permission === 'denied') { if (cb) cb('denied'); return; }
  Notification.requestPermission().then(function(p) {
    if (cb) cb(p);
  });
}

function checkAndNotify() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  var now = new Date();
  var day = now.getDate();
  var month = now.getMonth();
  var year = now.getFullYear();
  if (day === 1) {
    var prevMonth = month === 0 ? 11 : month - 1;
    var prevYear = month === 0 ? year - 1 : year;
    var msg = 'משכורת ' + (typeof hebrewMonths !== 'undefined' ? hebrewMonths[prevMonth] : prevMonth + 1) + ' אמורה להיכנס היום';
    try {
      new Notification('שכ״ש', { body: msg });
    } catch (e) {}
  }
}

function schedulePeriodicCheck() {
  if (!notificationsEnabled) return;
  requestNotificationPermission(function(p) {
    if (p === 'granted') checkAndNotify();
  });
  setInterval(checkAndNotify, 24 * 60 * 60 * 1000);
}
