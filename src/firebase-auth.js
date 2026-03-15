/**
 * Firebase Phone Auth – SMS verification, session persistence, logout.
 * Auth state drives data source: Firebase when signed in, local for migration.
 */
(function() {
  var confirmationResult = null;
  var recaptchaVerifier = null;

  function getAuth() { return window.firebaseAuth || null; }
  function isReady() { return !!getAuth(); }

  function maskPhone(phone) {
    if (!phone || typeof phone !== 'string') return '***';
    var digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return '***';
    return '***-**-' + digits.slice(-4);
  }

  function normalizePhone(input) {
    var s = (input || '').replace(/\D/g, '');
    if (s.startsWith('0')) s = '972' + s.slice(1);
    else if (!s.startsWith('972')) s = '972' + s;
    return '+' + s;
  }

  window.firebaseAuthApi = {
    isReady: isReady,
    getAuth: getAuth,
    getCurrentUser: function() { var a = getAuth(); return a ? a.currentUser : null; },
    maskPhone: maskPhone,
    normalizePhone: normalizePhone,

    /** Returns Promise<boolean> – true if user has admin custom claim */
    isAdmin: function() {
      var u = getAuth() ? getAuth().currentUser : null;
      if (!u) return Promise.resolve(false);
      return u.getIdTokenResult(true).then(function(res) {
        return !!(res.claims && res.claims.admin === true);
      }).catch(function() { return false; });
    },

    /** Force token refresh so new custom claims take effect immediately */
    forceTokenRefresh: function() {
      var u = getAuth() ? getAuth().currentUser : null;
      if (!u) return Promise.resolve();
      return u.getIdToken(true);
    },

    onAuthStateChanged: function(cb) {
      var a = getAuth();
      if (!a) { cb(null); return function() {}; }
      return a.onAuthStateChanged(cb);
    },

    sendOtp: function(phoneInput, onSuccess, onError) {
      if (!isReady()) { if (onError) onError(new Error('Firebase not configured')); return; }
      var phone = normalizePhone(phoneInput);
      var auth = getAuth();
      var container = null;
      try {
        container = document.getElementById('authRecaptchaContainer');
        if (!container) {
          container = document.createElement('div');
          container.id = 'authRecaptchaContainer';
          container.style.cssText = 'min-height:78px;margin:12px 0;';
          document.body.appendChild(container);
        }
        container.style.cssText = 'min-height:78px;margin:12px 0;';
        if (recaptchaVerifier) {
          try { recaptchaVerifier.clear && recaptchaVerifier.clear(); } catch (e) {}
        }
        recaptchaVerifier = new firebase.auth.RecaptchaVerifier(container.id, {
          size: 'normal',
          callback: function() {}
        });
      } catch (initErr) {
        console.error('RecaptchaVerifier init error:', initErr);
        if (onError) onError(initErr);
        return;
      }
      try {
        auth.signInWithPhoneNumber(phone, recaptchaVerifier)
          .then(function(result) {
            confirmationResult = result;
            if (onSuccess) onSuccess();
          })
          .catch(function(err) {
            console.error('signInWithPhoneNumber error:', err);
            try {
              if (recaptchaVerifier && recaptchaVerifier.clear) recaptchaVerifier.clear();
            } catch (e) {}
            if (onError) onError(err);
          });
      } catch (callErr) {
        console.error('signInWithPhoneNumber call error:', callErr);
        try {
          if (recaptchaVerifier && recaptchaVerifier.clear) recaptchaVerifier.clear();
        } catch (e) {}
        if (onError) onError(callErr);
      }
    },

    verifyOtp: function(code, onSuccess, onError) {
      if (!confirmationResult || !code || !String(code).trim()) {
        if (onError) onError(new Error('קוד לא תקין'));
        return;
      }
      confirmationResult.confirm(String(code).trim())
        .then(function(result) {
          confirmationResult = null;
          if (onSuccess) onSuccess(result.user);
        })
        .catch(function(err) {
          if (onError) onError(err);
        });
    },

    signOut: function() {
      var a = getAuth();
      if (a) return a.signOut();
      return Promise.resolve();
    }
  };
})();
