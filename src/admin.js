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
  if (typeof remoteIsAdmin === 'function' && remoteIsAdmin()) {
    showAdminPanel();
    return;
  }
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

function _esc(s) {
  return String(s || '').replace(/[&<>"']/g, function(c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}

function renderAdminPanel() {
  if (typeof remoteIsAdmin === 'function' && remoteIsAdmin() && typeof remoteListPeople === 'function') {
    renderCloudAdmin();
    return;
  }
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

function renderCloudAdmin() {
  var listEl = document.getElementById('adminUserList');
  var totalEl = document.getElementById('adminTotalUsers');
  var activeEl = document.getElementById('adminActiveUsers');
  var activeLabel = document.getElementById('adminActiveLabel');
  if (activeLabel) activeLabel.textContent = 'קודים פנויים';
  var footerBtn = document.querySelector('.admin-btn-logout');
  if (footerBtn) {
    footerBtn.textContent = 'סגור';
    footerBtn.onclick = function() { closeAdminPanel(); };
  }
  if (listEl) listEl.innerHTML = '<div class="admin-empty">טוען…</div>';
  remoteListPeople().then(function(data) {
    var people = data.people || [];
    var codes = data.codes || [];
    if (totalEl) totalEl.textContent = people.length;
    if (activeEl) activeEl.textContent = codes.length;
    var codeHtml = '<button type="button" class="admin-btn-logout" style="margin-bottom:12px" onclick="adminCreateInviteUi()">קוד חדש לחבר</button>';
    if (codes.length) {
      codeHtml += codes.map(function(c) {
        return '<div class="admin-user-dates">קוד פנוי: ' + _esc(c.code) + '</div>';
      }).join('');
    }
    var rows = people.map(function(p) {
      var name = p.name || p.email || 'בלי שם';
      var mine = p.id === window.__remoteUserId ? ' (אני)' : '';
      var role = p.role === 'admin' ? ' · מנהל' : '';
      var openBtn = p.id === window.__remoteUserId
        ? ''
        : '<button type="button" class="admin-btn-view" onclick="remoteOpenUser(\'' + _esc(p.id) + '\')">פתח</button>';
      return '<div class="admin-user-row"><div class="admin-user-info">' +
        '<span class="admin-user-id">' + _esc(name) + mine + role + '</span>' +
        '<span class="admin-user-dates">' + _esc(p.email || '') + '</span>' +
        '</div><div class="admin-user-actions">' + openBtn + '</div></div>';
    }).join('');
    if (listEl) listEl.innerHTML = codeHtml + (rows || '<div class="admin-empty">אין עדיין חברים</div>');
  }).catch(function() {
    if (listEl) listEl.innerHTML = '<div class="admin-empty">לא הצלחתי לטעון</div>';
  });
}

function adminCreateInviteUi() {
  if (typeof remoteCreateInvite !== 'function') return;
  remoteCreateInvite().then(function(code) {
    if (!code) return;
    if (typeof showToast === 'function') showToast('הקוד: ' + code);
    renderCloudAdmin();
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
