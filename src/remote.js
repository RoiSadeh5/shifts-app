/**
 * Cloud accounts (Supabase). Empty URL keeps the app local on this phone.
 * The public anon key is the only key shipped here. Row rules on the server
 * let each person read their own salary, and the admin read everyone.
 */
var REMOTE_LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/dist/umd/supabase.js';
var REMOTE_KINDS = ['shifts', 'history', 'settings', 'savings', 'leave', 'profile'];
var remoteClient = null;
var remotePushTimer = null;
var remotePushPending = {};

function isRemoteConfigured() {
  var url = window.SUPABASE_URL || '';
  var key = window.SUPABASE_ANON_KEY || '';
  return !!(url && key && url.indexOf('http') === 0 && key.length > 20);
}

function remoteIsAdmin() {
  return window.__remoteRole === 'admin';
}

function remoteDataOwner() {
  return window.__viewUserId || window.__remoteUserId || '';
}

function loadSupabaseLib() {
  if (window.supabase && window.supabase.createClient) return Promise.resolve(window.supabase);
  return new Promise(function(resolve, reject) {
    var s = document.createElement('script');
    s.src = REMOTE_LIB;
    s.onload = function() {
      if (window.supabase && window.supabase.createClient) resolve(window.supabase);
      else reject(new Error('supabase missing'));
    };
    s.onerror = function() { reject(new Error('supabase load failed')); };
    document.head.appendChild(s);
  });
}

function remoteClientOrNull() {
  return remoteClient;
}

function remoteDb() {
  return remoteClient.schema('sachash');
}

async function remotePrepareSession() {
  if (!isRemoteConfigured()) return true;
  showAuthScreen();
  try {
    var lib = await loadSupabaseLib();
    remoteClient = lib.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, storageKey: 'sachash-auth', autoRefreshToken: true }
    });
    var res = await remoteClient.auth.getSession();
    var session = res && res.data ? res.data.session : null;
    if (!session || !session.user) return false;
    await adoptSession(session);
    hideAuthScreen();
    return true;
  } catch (e) {
    console.error(e);
    setAuthError('לא הצלחתי להתחבר לענן. בדוק את החיבור ונסה שוב.');
    return false;
  }
}

async function adoptSession(session) {
  window.__remoteUserId = session.user.id;
  window.__remoteEmail = session.user.email || '';
  window.__remoteRole = 'user';
  window.__viewUserId = null;
  window.__viewUserName = '';
  var prof = await remoteDb().from('profiles').select('role, name, email').eq('id', session.user.id).maybeSingle();
  if (prof && prof.data) {
    window.__remoteRole = prof.data.role || 'user';
    if (prof.data.name && typeof saveUserName === 'function' && !window.__remoteApplying) {
      /* name is applied later from user_data; keep profile name as fallback */
      window.__remoteProfileName = prof.data.name;
    }
  }
  var view = '';
  try { view = sessionStorage.getItem('sachash_view_user') || ''; } catch (e) {}
  if (window.__remoteRole === 'admin' && view && view !== session.user.id) {
    window.__viewUserId = view;
    var other = await remoteDb().from('profiles').select('name, email').eq('id', view).maybeSingle();
    window.__viewUserName = (other && other.data && (other.data.name || other.data.email)) || 'חבר';
  } else {
    try { sessionStorage.removeItem('sachash_view_user'); } catch (e2) {}
  }
}

function showAuthScreen() {
  var el = document.getElementById('authOverlay');
  if (!el) return;
  el.style.display = 'flex';
  el.classList.add('visible');
  setAuthMode('login');
}

function hideAuthScreen() {
  var el = document.getElementById('authOverlay');
  if (!el) return;
  el.classList.remove('visible');
  el.style.display = 'none';
}

function setAuthError(msg) {
  var el = document.getElementById('authError');
  if (el) el.textContent = msg || '';
}

function setAuthMode(mode) {
  var signup = mode === 'signup';
  var fields = document.getElementById('authSignupFields');
  var code = document.getElementById('authCode');
  var title = document.getElementById('authTitle');
  var desc = document.getElementById('authDesc');
  var submit = document.getElementById('authSubmit');
  var toggle = document.getElementById('authToggleMode');
  if (fields) fields.style.display = signup ? 'block' : 'none';
  if (code) code.style.display = signup ? 'block' : 'none';
  if (title) title.textContent = signup ? 'הצטרפות' : 'כניסה';
  if (desc) desc.textContent = signup
    ? 'שם, אימייל, סיסמה, והקוד שקיבלת.'
    : 'נכנסים עם האימייל והסיסמה של החשבון שלך.';
  if (submit) submit.textContent = signup ? 'צור חשבון' : 'כניסה';
  if (toggle) toggle.textContent = signup ? 'יש לי כבר חשבון' : 'יש לי קוד הצטרפות';
  var form = document.getElementById('authOverlay');
  if (form) form.setAttribute('data-mode', signup ? 'signup' : 'login');
  setAuthError('');
}

function toggleAuthMode() {
  var form = document.getElementById('authOverlay');
  var signup = form && form.getAttribute('data-mode') === 'signup';
  setAuthMode(signup ? 'login' : 'signup');
}

function authMessage(error) {
  var msg = (error && error.message) ? String(error.message) : '';
  if (msg.indexOf('invalid_invite') !== -1) return 'הקוד לא תקף, או שכבר השתמשו בו.';
  if (msg.indexOf('already registered') !== -1 || msg.indexOf('already been registered') !== -1) return 'האימייל הזה כבר רשום. אפשר להיכנס.';
  if (msg.indexOf('Invalid login') !== -1 || msg.indexOf('invalid_credentials') !== -1) return 'אימייל או סיסמה לא נכונים.';
  if (msg.indexOf('Email not confirmed') !== -1) return 'צריך לאשר את האימייל, או לכבות אישור אימייל בפרויקט.';
  if (msg.indexOf('Password') !== -1) return 'הסיסמה צריכה 6 תווים לפחות.';
  return 'לא הצלחתי. נסה שוב.';
}

async function submitAuth() {
  if (!remoteClient && isRemoteConfigured()) {
    try { await remotePrepareSession(); } catch (e) {}
  }
  if (!remoteClient) { setAuthError('הענן לא מוגדר.'); return; }
  var form = document.getElementById('authOverlay');
  var signup = form && form.getAttribute('data-mode') === 'signup';
  var email = (document.getElementById('authEmail').value || '').trim();
  var password = document.getElementById('authPassword').value || '';
  if (!email || !password) { setAuthError('צריך אימייל וסיסמה.'); return; }
  setAuthError('');
  var btn = document.getElementById('authSubmit');
  if (btn) btn.disabled = true;
  try {
    if (signup) {
      var name = (document.getElementById('authName').value || '').trim();
      var code = (document.getElementById('authCode').value || '').trim();
      if (!name || !code) { setAuthError('צריך שם וקוד הצטרפות.'); return; }
      var created = await remoteClient.auth.signUp({
        email: email,
        password: password,
        options: { data: { sachash_name: name, sachash_invite_code: code } }
      });
      if (created.error) { setAuthError(authMessage(created.error)); return; }
      if (!created.data || !created.data.session) {
        setAuthError('החשבון נוצר. אם צריך לאשר אימייל, אשר ואז היכנס.');
        setAuthMode('login');
        return;
      }
    } else {
      var signed = await remoteClient.auth.signInWithPassword({ email: email, password: password });
      if (signed.error) { setAuthError(authMessage(signed.error)); return; }
    }
    location.reload();
  } catch (e) {
    setAuthError('לא הצלחתי. נסה שוב.');
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function signOutAccount() {
  try { sessionStorage.removeItem('sachash_view_user'); } catch (e) {}
  if (remoteClient) {
    try { await remoteClient.auth.signOut(); } catch (e2) {}
  }
  location.reload();
}

function deviceSnapshot() {
  var id = '';
  try { id = localStorage.getItem('shifter_user_id') || ''; } catch (e) {}
  if (!id || id === window.__remoteUserId) return null;
  function readJson(base) {
    try { return JSON.parse(localStorage.getItem(base + '_' + id) || 'null'); } catch (e) { return null; }
  }
  var name = '';
  try { name = localStorage.getItem('shifter_username_' + id) || ''; } catch (e2) {}
  return {
    shifts: readJson('shifter_shifts') || [],
    history: readJson('shifter_history') || {},
    settings: readJson('shifter_settings') || {},
    savings: readJson('shifter_savings'),
    leave: readJson('shifter_leave') || { vacation: 0, sick: 0 },
    profile: { name: name }
  };
}

function snapshotHasData(snap) {
  if (!snap) return false;
  if (Array.isArray(snap.shifts) && snap.shifts.length) return true;
  if (snap.history && Object.keys(snap.history).length) return true;
  if (snap.savings && (snap.savings.pension || snap.savings.study || (snap.savings.general && snap.savings.general.length))) return true;
  if (snap.profile && snap.profile.name) return true;
  if (snap.settings && Object.keys(snap.settings).length) return true;
  return false;
}

function localPayload(kind) {
  if (kind === 'shifts' && typeof loadShifts === 'function') return loadShifts();
  if (kind === 'history' && typeof loadHistory === 'function') return loadHistory();
  if (kind === 'settings' && typeof getSettingsData === 'function') return getSettingsData();
  if (kind === 'savings' && typeof loadSavings === 'function') return loadSavings();
  if (kind === 'leave' && typeof loadLeaveBalances === 'function') return loadLeaveBalances();
  if (kind === 'profile') return { name: (typeof loadUserName === 'function' ? loadUserName() : '') || '' };
  return null;
}

function applyRemotePayload(kind, payload) {
  if (payload == null) return;
  window.__remoteApplying = true;
  try {
    if (kind === 'shifts' && typeof saveShifts === 'function') saveShifts(Array.isArray(payload) ? payload : []);
    if (kind === 'history' && typeof saveHistory === 'function') saveHistory(payload || {});
    if (kind === 'settings' && typeof persistSettings === 'function') persistSettings(payload || {});
    if (kind === 'savings' && payload && typeof saveSavings === 'function') saveSavings(payload);
    if (kind === 'leave' && typeof saveLeaveBalances === 'function') saveLeaveBalances(payload || { vacation: 0, sick: 0 });
    if (kind === 'profile' && payload && typeof saveUserName === 'function') saveUserName(payload.name || '');
  } finally {
    window.__remoteApplying = false;
  }
}

async function pullOwner(ownerId) {
  var res = await remoteDb().from('user_data').select('kind, payload, updated_at').eq('user_id', ownerId);
  if (res.error) throw res.error;
  var map = {};
  (res.data || []).forEach(function(row) { map[row.kind] = row; });
  return map;
}

async function pushKind(kind, payload, ownerId) {
  if (!remoteClient || payload == null) return;
  var owner = ownerId || remoteDataOwner();
  if (!owner) return;
  var updated = new Date().toISOString();
  try { localStorage.setItem('shifter_rev_' + owner + '_' + kind, updated); } catch (e) {}
  var res = await remoteDb().from('user_data').upsert({
    user_id: owner,
    kind: kind,
    payload: payload,
    updated_at: updated
  }, { onConflict: 'user_id,kind' });
  if (res.error) {
    console.error(res.error);
    if (typeof showToast === 'function') showToast('לא נשמר בענן');
  }
}

async function reconcileRemote() {
  if (!remoteClient || !window.__remoteUserId) return;
  var owner = remoteDataOwner();
  var remote = await pullOwner(owner);
  var kinds = Object.keys(remote);
  if (!kinds.length && !window.__viewUserId) {
    var flag = 'shifter_remote_seeded_' + owner;
    var seeded = false;
    try { seeded = localStorage.getItem(flag) === '1'; } catch (e) {}
    if (!seeded) {
      var snap = deviceSnapshot();
      if (snapshotHasData(snap)) {
        REMOTE_KINDS.forEach(function(kind) {
          if (snap[kind] != null) applyRemotePayload(kind, snap[kind]);
        });
        for (var i = 0; i < REMOTE_KINDS.length; i++) {
          var k = REMOTE_KINDS[i];
          if (snap[k] != null) await pushKind(k, snap[k], owner);
        }
      }
      try { localStorage.setItem(flag, '1'); } catch (e2) {}
    }
    return;
  }
  for (var j = 0; j < REMOTE_KINDS.length; j++) {
    var kind = REMOTE_KINDS[j];
    var row = remote[kind];
    if (!row) continue;
    var rev = '';
    try { rev = localStorage.getItem('shifter_rev_' + owner + '_' + kind) || ''; } catch (e3) {}
    var remoteAt = row.updated_at || '';
    if (rev && remoteAt && rev > remoteAt) {
      await pushKind(kind, localPayload(kind), owner);
    } else {
      applyRemotePayload(kind, row.payload);
      try { localStorage.setItem('shifter_rev_' + owner + '_' + kind, remoteAt); } catch (e4) {}
    }
  }
  if (!window.__viewUserId && window.__remoteProfileName && typeof loadUserName === 'function' && !(loadUserName() || '').trim()) {
    applyRemotePayload('profile', { name: window.__remoteProfileName });
  }
}

function queueRemoteSync(kind) {
  if (window.__remoteApplying) return;
  if (!isRemoteConfigured() || !window.__remoteUserId) return;
  try { localStorage.setItem('shifter_rev_' + remoteDataOwner() + '_' + kind, new Date().toISOString()); } catch (e) {}
  remotePushPending[kind] = true;
  if (remotePushTimer) clearTimeout(remotePushTimer);
  remotePushTimer = setTimeout(flushRemoteSync, 400);
}

async function flushRemoteSync() {
  var kinds = Object.keys(remotePushPending);
  remotePushPending = {};
  for (var i = 0; i < kinds.length; i++) {
    try { await pushKind(kinds[i], localPayload(kinds[i])); } catch (e) { console.error(e); }
  }
}

async function remoteCreateInvite() {
  if (!remoteClient || !remoteIsAdmin()) return '';
  var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var code = '';
  for (var i = 0; i < 8; i++) code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  var res = await remoteDb().from('invite_codes').insert({ code: code });
  if (res.error) {
    if (typeof showToast === 'function') showToast('לא נוצר קוד');
    return '';
  }
  return code;
}

async function remoteListPeople() {
  if (!remoteClient) return { people: [], codes: [] };
  var peopleRes = await remoteDb().from('profiles').select('id, name, email, role, created_at').order('created_at', { ascending: true });
  var codesRes = await remoteDb().from('invite_codes').select('code, used_by, created_at').is('used_by', null).order('created_at', { ascending: false });
  return {
    people: (peopleRes && peopleRes.data) || [],
    codes: (codesRes && codesRes.data) || []
  };
}

function remoteOpenUser(userId, name) {
  try { sessionStorage.setItem('sachash_view_user', userId); } catch (e) {}
  location.reload();
}

function remoteCloseUser() {
  try { sessionStorage.removeItem('sachash_view_user'); } catch (e) {}
  location.reload();
}

function updateAccountSection() {
  var section = document.getElementById('accountSection');
  if (!section) return;
  if (!isRemoteConfigured() || !window.__remoteUserId) {
    section.style.display = 'none';
    return;
  }
  section.style.display = 'block';
  var emailEl = document.getElementById('accountEmail');
  if (emailEl) emailEl.textContent = window.__remoteEmail || '';
  var banner = document.getElementById('impersonationBanner');
  var label = document.getElementById('impersonationLabel');
  if (banner) {
    if (window.__viewUserId) {
      banner.hidden = false;
      if (label) label.textContent = 'הנתונים של ' + (window.__viewUserName || 'חבר');
    } else {
      banner.hidden = true;
    }
  }
}
