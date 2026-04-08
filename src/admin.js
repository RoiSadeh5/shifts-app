/**
 * Admin panel – local IndexedDB registry only (password in config.js).
 */
var ADMIN_SESSION_KEY = 'shifter_admin_session';

function isAdminLoggedIn() {
  try { return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1'; } catch (e) { return false; }
}

function setAdminSession(ok) {
  try { sessionStorage.setItem(ADMIN_SESSION_KEY, ok ? '1' : ''); } catch (e) {}
}

function getAdminPassword() {
  return (window.ADMIN_CONFIG && window.ADMIN_CONFIG.password) || '';
}

function openAdminPrompt() {
  if (typeof haptic === 'function') haptic(true);
  _openAdminWithPassword();
}

function _openAdminWithPassword() {
  var pw = prompt('סיסמת מנהל:');
  if (pw === null) return;
  if (!getAdminPassword()) {
    if (typeof showToast === 'function') showToast('הגדר config.js עם סיסמת מנהל');
    return;
  }
  if (pw === getAdminPassword()) {
    setAdminSession(true);
    showAdminPanel();
  } else {
    if (typeof showToast === 'function') showToast('סיסמה שגויה');
  }
}

function closeAdminPanel() {
  var overlay = document.getElementById('adminOverlay');
  if (overlay) {
    overlay.classList.remove('visible');
    setTimeout(function() { overlay.style.display = 'none'; }, 200);
  }
}

function logoutAdmin() {
  setAdminSession(false);
  closeAdminPanel();
  if (typeof showToast === 'function') showToast('יציאת מנהל');
}

function showAdminPanel() {
  var overlay = document.getElementById('adminOverlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  requestAnimationFrame(function() { overlay.classList.add('visible'); });
  renderAdminPanel();
}

function renderAdminPanel() {
  function render(reg) {
    reg = reg || [];
    var total = reg.length;
    var thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    var active = reg.filter(function(r) {
      var t = r.lastActive ? new Date(r.lastActive).getTime() : 0;
      return t >= thirtyDaysAgo;
    }).length;
    var listHtml = reg.map(function(r) {
      var first = r.firstSeen ? new Date(r.firstSeen).toLocaleDateString('he-IL') : '—';
      var last = r.lastActive ? new Date(r.lastActive).toLocaleDateString('he-IL') : '—';
      var label = (r.userId || '').slice(0, 20) + (typeof getCurrentUserId === 'function' && r.userId === getCurrentUserId() ? ' (נוכחי)' : '');
      var uid = (r.userId || '').replace(/'/g, "\\'");
      var viewBtn = typeof getLocalDataForUserId === 'function'
        ? '<button class="admin-btn-view" onclick="adminViewUserUi(\'' + uid + '\')" title="צפה בנתונים">צפה</button>'
        : '';
      return '<div class="admin-user-row">' +
        '<div class="admin-user-info">' +
          '<span class="admin-user-id">' + label.replace(/'/g, "\\'") + '</span>' +
          '<span class="admin-user-dates">נרשם: ' + first + ' · פעיל: ' + last + '</span>' +
        '</div>' +
        '<div class="admin-user-actions">' + viewBtn +
        '<button class="admin-btn-delete" onclick="adminDeleteUserUi(\'' + uid + '\')" title="מחיקת המשתמש">מחק</button></div>' +
      '</div>';
    }).join('');
    var totalEl = document.getElementById('adminTotalUsers');
    var activeEl = document.getElementById('adminActiveUsers');
    var listEl = document.getElementById('adminUserList');
    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (listEl) listEl.innerHTML = listHtml || '<div class="admin-empty">אין משתמשים רשומים</div>';
  }
  if (typeof getAdminRegistry !== 'function') return;
  getAdminRegistry().then(function(reg) {
    var mapped = (reg || []).map(function(r) {
      return { userId: r.userId, firstSeen: r.firstSeen, lastActive: r.lastActive };
    });
    render(mapped);
  });
}

function adminViewUserUi(userId) {
  if (typeof getLocalDataForUserId !== 'function') return;
  getLocalDataForUserId(userId).then(function(data) {
    var shifts = (data && data.shifts) ? data.shifts : [];
    var history = (data && data.history) ? data.history : {};
    var histCount = Object.keys(history).reduce(function(n, y) {
      return n + (history[y] && typeof history[y] === 'object' ? Object.keys(history[y]).length : 0);
    }, 0);
    var msg = 'משמרות: ' + shifts.length + '\nתלושים (חודשים): ' + histCount;
    alert('משתמש ' + String(userId).slice(0, 12) + '…\n\n' + msg);
  }).catch(function() {
    if (typeof showToast === 'function') showToast('שגיאה בטעינה');
  });
}

function adminDeleteUserUi(userId) {
  if (!confirm('למחוק משתמש זה ואת כל נתוניו? פעולה בלתי הפיכה.')) return;
  if (typeof adminDeleteUser !== 'function') return;
  adminDeleteUser(userId).then(function() {
    if (typeof showToast === 'function') showToast('המשתמש נמחק');
    if (typeof getCurrentUserId === 'function' && userId === getCurrentUserId()) {
      setAdminSession(false);
      closeAdminPanel();
      location.reload();
    } else {
      renderAdminPanel();
    }
  }).catch(function() {
    if (typeof showToast === 'function') showToast('שגיאה במחיקה');
  });
}
