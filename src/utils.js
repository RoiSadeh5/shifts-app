/**
 * Utils – Animations, notifications, payment date helpers.
 */
/* ========== Animations ========== */
function countUp(el, targetNum, opts) {
  if (!el || typeof targetNum !== 'number') return;
  opts = opts || {};
  var duration = opts.duration || 380;
  var easing = opts.easing || function(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  var formatter = opts.formatter || (function(n) { return '₪' + Math.round(n).toLocaleString(); });
  var from = parseFloat(el.dataset.countUpFrom) || 0;
  if (el.dataset.countUpFrom === undefined) from = 0;
  el.dataset.countUpFrom = String(targetNum);
  var start = performance.now();
  function step(now) {
    var elapsed = now - start;
    var progress = Math.min(elapsed / duration, 1);
    var eased = easing(progress);
    var current = from + (targetNum - from) * eased;
    el.textContent = formatter(current);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function staggerEntrance(container, itemSelector, opts) {
  if (!container) return;
  opts = opts || {};
  var items = container.querySelectorAll(itemSelector || '.shift-item');
  var delayStep = opts.delayStep || 50;
  var baseDelay = opts.baseDelay || 0;
  var maxStagger = opts.maxStagger !== undefined ? opts.maxStagger : 12;
  items.forEach(function(item, i) {
    if (i >= maxStagger) return;
    item.style.animationDelay = (baseDelay + i * delayStep) + 'ms';
    item.style.animationFillMode = 'backwards';
    if (!item.classList.contains('stagger-in')) item.classList.add('stagger-in');
  });
}

/* ========== Notifications & Payment Date ========== */
function getPaymentDateForMonth(month, year) {
  var payMonth = month + 2;
  var payYear = year;
  if (payMonth > 11) { payMonth -= 12; payYear++; }
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
  Notification.requestPermission().then(function(p) { if (cb) cb(p); });
}

function checkAndNotify() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  var now = new Date();
  var day = now.getDate();
  var month = now.getMonth();
  var year = now.getFullYear();
  if (day === 1) {
    var prevMonth = month === 0 ? 11 : month - 1;
    var msg = 'משכורת ' + (typeof hebrewMonths !== 'undefined' ? hebrewMonths[prevMonth] : prevMonth + 1) + ' אמורה להיכנס היום';
    try { new Notification('שכ״ש', { body: msg }); } catch (e) {}
  }
}

var _notifyIntervalId = null;

function schedulePeriodicCheck() {
  if (!notificationsEnabled) return;
  requestNotificationPermission(function(p) { if (p === 'granted') checkAndNotify(); });
  if (_notifyIntervalId) clearInterval(_notifyIntervalId);
  _notifyIntervalId = setInterval(checkAndNotify, 24 * 60 * 60 * 1000);
}
