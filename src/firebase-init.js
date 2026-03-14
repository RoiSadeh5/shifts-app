/**
 * Firebase initialization – Auth, Firestore.
 * Requires firebase-config.js with window.FIREBASE_CONFIG.
 */
(function() {
  if (typeof firebase === 'undefined') return;
  var config = window.FIREBASE_CONFIG;
  if (!config || !config.apiKey || String(config.apiKey).indexOf('YOUR_') === 0) {
    window.firebaseApp = null;
    window.firebaseAuth = null;
    window.firebaseDb = null;
    window.firebaseReady = Promise.resolve(false);
    return;
  }
  try {
    window.firebaseApp = firebase.initializeApp(config);
    window.firebaseAuth = firebase.auth();
    window.firebaseDb = firebase.firestore();
    firebaseAuth.useDeviceLanguage && firebaseAuth.useDeviceLanguage();
    window.firebaseReady = Promise.resolve(true);
  } catch (e) {
    console.warn('Firebase init error:', e);
    window.firebaseApp = null;
    window.firebaseAuth = null;
    window.firebaseDb = null;
    window.firebaseReady = Promise.resolve(false);
  }
})();
