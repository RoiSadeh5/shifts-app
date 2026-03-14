/**
 * Firestore data layer – shifts, history, settings, savings, leave, username, templates.
 * All data under users/{uid}/. Used only when Firebase Auth user is signed in.
 */
(function() {
  function db() { return window.firebaseDb || null; }
  function uid() {
    var u = window.firebaseAuthApi && window.firebaseAuthApi.getCurrentUser();
    return u ? u.uid : null;
  }

  function userDoc() {
    var u = uid();
    return u && db() ? db().collection('users').doc(u) : null;
  }

  function userDocFor(targetUid) {
    return targetUid && db() ? db().collection('users').doc(targetUid) : null;
  }

  function col(name) {
    var docRef = userDoc();
    return docRef ? docRef.collection(name) : null;
  }

  function colFor(targetUid, name) {
    var docRef = userDocFor(targetUid);
    return docRef ? docRef.collection(name) : null;
  }

  function touchUserActivity() {
    var ref = userDoc();
    if (!ref) return Promise.resolve();
    return ref.set({ lastActive: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
  }

  function ensureUserMeta(phoneMasked) {
    var ref = userDoc();
    if (!ref) return Promise.resolve();
    return ref.get().then(function(snap) {
      if (!snap.exists) {
        return ref.set({
          phoneMasked: phoneMasked || '***',
          firstSeen: firebase.firestore.FieldValue.serverTimestamp(),
          lastActive: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
      return ref.update({ lastActive: firebase.firestore.FieldValue.serverTimestamp() });
    });
  }

  function dataDoc(name) {
    var c = col('data');
    return c ? c.doc(name) : null;
  }

  function getDoc(name) {
    var ref = dataDoc(name);
    if (!ref) return Promise.resolve(null);
    return ref.get().then(function(s) { return s.exists ? s.data() : null; });
  }

  function setDoc(name, data) {
    var ref = dataDoc(name);
    if (!ref) return Promise.resolve();
    return ref.set(data).then(function() { return touchUserActivity(); });
  }

  window.firebaseStore = {
    uid: uid,
    userDoc: userDoc,
    touchUserActivity: touchUserActivity,
    ensureUserMeta: ensureUserMeta,

    getShifts: function() {
      return getDoc('shifts').then(function(d) { return (d && d.list) ? d.list : []; });
    },
    saveShifts: function(list) {
      return setDoc('shifts', { list: list || [] });
    },
    getHistory: function() {
      return getDoc('history').then(function(d) { return (d && typeof d === 'object') ? d : {}; });
    },
    saveHistory: function(h) {
      return setDoc('history', h || {});
    },
    getSettings: function() {
      return getDoc('settings').then(function(d) { return d || {}; });
    },
    saveSettings: function(obj) {
      return setDoc('settings', obj || {});
    },
    getSavings: function() {
      return getDoc('savings').then(function(d) { return d || null; });
    },
    saveSavings: function(obj) {
      return setDoc('savings', obj || {});
    },
    getProfile: function() {
      return getDoc('profile').then(function(d) {
        return d || { username: null, leave: { vacation: 0, sick: 0 }, lastBackup: null };
      });
    },
    saveProfile: function(obj) {
      return setDoc('profile', obj || {});
    },
    getTemplates: function() {
      var c = col('templates');
      if (!c) return Promise.resolve([]);
      return c.get().then(function(snap) {
        return (snap.docs || []).map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      });
    },
    saveTemplate: function(tpl) {
      var c = col('templates');
      if (!c) return Promise.resolve();
      var id = tpl.id || ('tpl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8));
      return c.doc(id).set(Object.assign({}, tpl, { id: id })).then(function() { return touchUserActivity(); });
    },
    deleteTemplate: function(id) {
      var c = col('templates');
      if (!c || !id) return Promise.resolve();
      return c.doc(id).delete().then(function() { return touchUserActivity(); });
    },

    /** Admin only: read any user's data. Firestore rules allow when isAdmin. */
    getDataForUser: function(targetUid, dataType) {
      if (!targetUid || !dataType || !db()) return Promise.resolve(null);
      var c = colFor(targetUid, 'data');
      if (!c) return Promise.resolve(null);
      return c.doc(dataType).get().then(function(s) { return s.exists ? s.data() : null; });
    },

    /** Admin only: write any user's data */
    setDataForUser: function(targetUid, dataType, data) {
      if (!targetUid || !dataType || !db()) return Promise.resolve();
      var c = colFor(targetUid, 'data');
      if (!c) return Promise.resolve();
      return c.doc(dataType).set(data || {}).then(function() {});
    }
  };
})();
