/**
 * Firebase Auth UI – phone input, OTP flow, migration prompt, logout.
 */
(function() {
  var MIGRATION_DONE_KEY = 'shifter_migration_done';
  var AUTH_REQUIRED_KEY = 'shifter_auth_required';

  function usingFirebase() {
    return window.firebaseAuthApi && window.firebaseAuthApi.isReady();
  }

  function showAuthOverlay() {
    var el = document.getElementById('authOverlay');
    if (!el) return;
    el.style.display = 'flex';
    el.classList.add('visible');
    el.setAttribute('aria-hidden', 'false');
    document.getElementById('authPhoneStep').style.display = '';
    document.getElementById('authOtpStep').style.display = 'none';
    document.getElementById('authPhoneInput').value = '';
    document.getElementById('authOtpInput').value = '';
  }

  function hideAuthOverlay() {
    var el = document.getElementById('authOverlay');
    if (!el) return;
    el.style.display = 'none';
    el.classList.remove('visible');
    el.setAttribute('aria-hidden', 'true');
  }

  function showMigrationOverlay() {
    var el = document.getElementById('migrationOverlay');
    if (!el) return;
    el.style.display = 'flex';
    el.classList.add('visible');
  }

  function hideMigrationOverlay() {
    var el = document.getElementById('migrationOverlay');
    if (!el) return;
    el.style.display = 'none';
    el.classList.remove('visible');
  }

  function hasLocalDataToMigrate() {
    try {
      if (!localStorage.getItem('shifter_user_id')) return false;
      var sk = 'shifter_shifts_' + localStorage.getItem('shifter_user_id');
      var shifts = JSON.parse(localStorage.getItem(sk) || '[]');
      if (Array.isArray(shifts) && shifts.length > 0) return true;
      var hk = 'shifter_history_' + localStorage.getItem('shifter_user_id');
      var hist = JSON.parse(localStorage.getItem(hk) || '{}');
      if (hist && typeof hist === 'object' && Object.keys(hist).length > 0) return true;
    } catch (e) {}
    return false;
  }

  function shouldShowMigrationPrompt() {
    try {
      if (localStorage.getItem(MIGRATION_DONE_KEY)) return false;
      return hasLocalDataToMigrate();
    } catch (e) { return false; }
  }

  function shouldShowMigrationPromptAsync() {
    if (localStorage.getItem(MIGRATION_DONE_KEY)) return Promise.resolve(false);
    var oldUserId = localStorage.getItem('shifter_user_id');
    if (!oldUserId) return Promise.resolve(false);
    if (hasLocalDataToMigrate()) return Promise.resolve(true);
    if (typeof window.getLocalDataForUserId !== 'function') return Promise.resolve(false);
    return window.getLocalDataForUserId(oldUserId).then(function(data) {
      return (Array.isArray(data.shifts) && data.shifts.length > 0) ||
             (data.history && typeof data.history === 'object' && Object.keys(data.history).length > 0);
    });
  }

  function runMigration(onComplete) {
    var oldUserId = localStorage.getItem('shifter_user_id');
    if (!oldUserId || !window.firebaseStore) {
      if (onComplete) onComplete();
      return;
    }
    if (typeof window.getLocalDataForUserId === 'function') {
      window.getLocalDataForUserId(oldUserId).then(function(data) {
        runMigrationWithData(data, oldUserId, onComplete);
      }).catch(function() {
        runMigrationWithData({ shifts: [], history: {}, settings: {}, profile: { username: null, leave: { vacation: 0, sick: 0 } }, savings: null }, oldUserId, onComplete);
      });
      return;
    }
    var data = { shifts: [], history: {}, settings: {}, profile: { username: null, leave: { vacation: 0, sick: 0 } }, savings: null };
    try {
      var pre = 'shifter_';
      data.shifts = JSON.parse(localStorage.getItem(pre + 'shifts_' + oldUserId) || '[]') || [];
      data.history = JSON.parse(localStorage.getItem(pre + 'history_' + oldUserId) || '{}') || {};
      data.settings = JSON.parse(localStorage.getItem(pre + 'settings_' + oldUserId) || '{}') || {};
      data.profile.leave = JSON.parse(localStorage.getItem(pre + 'leave_' + oldUserId) || '{}') || { vacation: 0, sick: 0 };
      data.profile.username = localStorage.getItem(pre + 'username_' + oldUserId);
      data.savings = JSON.parse(localStorage.getItem(pre + 'savings_' + oldUserId) || 'null');
    } catch (e) {}
    runMigrationWithData(data, oldUserId, onComplete);
  }

  function runMigrationWithData(data, oldUserId, onComplete) {
    var shifts = data.shifts || [];
    var history = data.history || {};
    var settings = data.settings || {};
    var leave = (data.profile && data.profile.leave) || { vacation: 0, sick: 0 };
    var username = (data.profile && data.profile.username) || null;
    var savings = data.savings || null;
    Promise.all([
      window.firebaseStore.saveShifts(Array.isArray(shifts) ? shifts : []),
      window.firebaseStore.saveHistory(history && typeof history === 'object' ? history : {}),
      window.firebaseStore.saveSettings(settings && typeof settings === 'object' ? settings : {}),
      window.firebaseStore.saveProfile({ username: username, leave: leave, lastBackup: null }),
      savings && typeof savings === 'object' ? window.firebaseStore.saveSavings(savings) : Promise.resolve()
    ]).then(function() {
      try {
        localStorage.setItem(MIGRATION_DONE_KEY, '1');
        ['shifter_shifts', 'shifter_settings', 'shifter_history', 'shifter_leave', 'shifter_username', 'shifter_savings'].forEach(function(base) {
          localStorage.removeItem(base + '_' + oldUserId);
        });
        localStorage.removeItem('shifter_user_id');
      } catch (e) {}
      if (onComplete) onComplete();
      if (typeof showToast === 'function') showToast('הנתונים הועברו בהצלחה');
    }).catch(function(err) {
      console.error('Migration error:', err);
      if (typeof showToast === 'function') showToast('שגיאה בהעברת נתונים');
      if (onComplete) onComplete();
    });
  }

  function bindAuthEvents() {
    var sendBtn = document.getElementById('authSendOtp');
    var verifyBtn = document.getElementById('authVerifyOtp');
    var backBtn = document.getElementById('authBackToPhone');
    var phoneInput = document.getElementById('authPhoneInput');
    var otpInput = document.getElementById('authOtpInput');
    if (!sendBtn || !window.firebaseAuthApi) return;

    sendBtn.onclick = function() {
      var phone = (phoneInput && phoneInput.value) ? phoneInput.value.trim() : '';
      if (!phone) {
        if (typeof showToast === 'function') showToast('הזן מספר טלפון');
        return;
      }
      sendBtn.disabled = true;
      sendBtn.textContent = 'שולח...';
      window.firebaseAuthApi.sendOtp(phone,
        function() {
          document.getElementById('authPhoneStep').style.display = 'none';
          document.getElementById('authOtpStep').style.display = 'block';
          if (otpInput) { otpInput.focus(); otpInput.value = ''; }
          sendBtn.disabled = false;
          sendBtn.textContent = 'שלח קוד';
        },
        function(err) {
          sendBtn.disabled = false;
          sendBtn.textContent = 'שלח קוד';
          var msg = (err && err.message) ? err.message : 'שגיאה בשליחת קוד';
          if (msg.indexOf('reCAPTCHA') >= 0) msg = 'אנא אשר שאתה לא רובוט';
          if (typeof showToast === 'function') showToast(msg);
        }
      );
    };

    if (backBtn) {
      backBtn.onclick = function() {
        document.getElementById('authPhoneStep').style.display = '';
        document.getElementById('authOtpStep').style.display = 'none';
      };
    }

    if (verifyBtn) {
      verifyBtn.onclick = function() {
        var code = (otpInput && otpInput.value) ? otpInput.value.trim() : '';
        verifyBtn.disabled = true;
        verifyBtn.textContent = 'מאמת...';
        window.firebaseAuthApi.verifyOtp(code,
          function(user) {
            hideAuthOverlay();
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'אימות';
          },
          function(err) {
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'אימות';
            if (typeof showToast === 'function') showToast('קוד לא תקין – נסה שוב');
          }
        );
      };
    }

    var skipMigration = document.getElementById('migrationSkip');
    var doMigration = document.getElementById('migrationDo');
    if (skipMigration) {
      skipMigration.onclick = function() {
        try { localStorage.setItem(MIGRATION_DONE_KEY, '1'); } catch (e) {}
        hideMigrationOverlay();
        window.usingFirebaseStore = true;
        if (typeof onAuthSuccess === 'function') onAuthSuccess(null);
      };
    }
    if (doMigration) {
      doMigration.onclick = function() {
        doMigration.disabled = true;
        doMigration.textContent = 'מעביר...';
        runMigration(function() {
          hideMigrationOverlay();
          doMigration.disabled = false;
          doMigration.textContent = 'העבר לענן';
          window.usingFirebaseStore = true;
          if (typeof onAuthSuccess === 'function') onAuthSuccess(null);
        });
      };
    }
  }

  function firebaseLogout() {
    if (typeof haptic === 'function') haptic(true);
    if (!window.firebaseAuthApi) return;
    if (!confirm('להתנתק מחשבונך?')) return;
    window.firebaseAuthApi.signOut().then(function() {
      if (typeof showToast === 'function') showToast('ניתקת מהחשבון');
      location.reload();
    });
  }

  window.firebaseAuthUi = {
    usingFirebase: usingFirebase,
    showAuthOverlay: showAuthOverlay,
    hideAuthOverlay: hideAuthOverlay,
    showMigrationOverlay: showMigrationOverlay,
    hideMigrationOverlay: hideMigrationOverlay,
    shouldShowMigrationPrompt: shouldShowMigrationPrompt,
    shouldShowMigrationPromptAsync: shouldShowMigrationPromptAsync,
    runMigration: runMigration,
    bindAuthEvents: bindAuthEvents,
    firebaseLogout: firebaseLogout
  };
  window.firebaseLogout = firebaseLogout;
})();
