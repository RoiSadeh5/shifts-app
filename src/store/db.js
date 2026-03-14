/**
 * IndexedDB wrapper for שכ״ש – stores: shifts, history, meta (settings, leave, backup, username).
 * Usage: await dbReady; then db.getShifts(), db.saveShifts(), etc.
 */
var DB_NAME = 'sachash-db';
var DB_VERSION = 2;
var dbInstance = null;

var dbReady = new Promise(function(resolve, reject) {
  if (typeof indexedDB === 'undefined') {
    resolve(null);
    return;
  }
  var req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onerror = function() { resolve(null); };
  req.onsuccess = function() {
    dbInstance = req.result;
    resolve(dbInstance);
  };
  req.onupgradeneeded = function(e) {
    var db = e.target.result;
    if (!db.objectStoreNames.contains('shifts')) {
      db.createObjectStore('shifts', { keyPath: 'k' });
    }
    if (!db.objectStoreNames.contains('history')) {
      db.createObjectStore('history', { keyPath: 'k' });
    }
    if (!db.objectStoreNames.contains('meta')) {
      db.createObjectStore('meta', { keyPath: 'key' });
    }
    if (!db.objectStoreNames.contains('templates')) {
      db.createObjectStore('templates', { keyPath: 'id' });
    }
  };
});

function _getStore(name, mode) {
  if (!dbInstance) return null;
  return dbInstance.transaction(name, mode || 'readonly').objectStore(name);
}

var db = {
  getShifts: function() {
    return new Promise(function(resolve) {
      if (!dbInstance) { resolve(null); return; }
      var tx = dbInstance.transaction('shifts', 'readonly');
      var store = tx.objectStore('shifts');
      var req = store.get('main');
      req.onsuccess = function() {
        var arr = req.result ? req.result.v : null;
        resolve(Array.isArray(arr) ? arr : []);
      };
      req.onerror = function() { resolve([]); };
    });
  },

  saveShifts: function(list) {
    return new Promise(function(resolve, reject) {
      if (!dbInstance) { resolve(); return; }
      var tx = dbInstance.transaction('shifts', 'readwrite');
      var store = tx.objectStore('shifts');
      store.put({ k: 'main', v: list || [] });
      tx.oncomplete = function() { resolve(); };
      tx.onerror = function() { reject(tx.error); };
    });
  },

  getHistory: function() {
    return new Promise(function(resolve) {
      if (!dbInstance) { resolve(null); return; }
      var tx = dbInstance.transaction('history', 'readonly');
      var store = tx.objectStore('history');
      var req = store.get('main');
      req.onsuccess = function() {
        var h = req.result ? req.result.v : null;
        resolve(h && typeof h === 'object' ? h : {});
      };
      req.onerror = function() { resolve({}); };
    });
  },

  saveHistory: function(h) {
    return new Promise(function(resolve, reject) {
      if (!dbInstance) { resolve(); return; }
      var tx = dbInstance.transaction('history', 'readwrite');
      var store = tx.objectStore('history');
      store.put({ k: 'main', v: h || {} });
      tx.oncomplete = function() { resolve(); };
      tx.onerror = function() { reject(tx.error); };
    });
  },

  getMeta: function(key) {
    return new Promise(function(resolve) {
      if (!dbInstance) { resolve(null); return; }
      var tx = dbInstance.transaction('meta', 'readonly');
      var store = tx.objectStore('meta');
      var req = store.get(key);
      req.onsuccess = function() {
        resolve(req.result ? req.result.value : null);
      };
      req.onerror = function() { resolve(null); };
    });
  },

  setMeta: function(key, value) {
    return new Promise(function(resolve, reject) {
      if (!dbInstance) { resolve(); return; }
      var tx = dbInstance.transaction('meta', 'readwrite');
      var store = tx.objectStore('meta');
      store.put({ key: key, value: value });
      tx.oncomplete = function() { resolve(); };
      tx.onerror = function() { reject(tx.error); };
    });
  },

  getTemplates: function() {
    return new Promise(function(resolve) {
      if (!dbInstance) { resolve([]); return; }
      var tx = dbInstance.transaction('templates', 'readonly');
      var req = tx.objectStore('templates').getAll();
      req.onsuccess = function() {
        resolve(req.result || []);
      };
      req.onerror = function() { resolve([]); };
    });
  },

  saveTemplate: function(tpl) {
    return new Promise(function(resolve, reject) {
      if (!dbInstance) { resolve(); return; }
      var tx = dbInstance.transaction('templates', 'readwrite');
      tx.objectStore('templates').put(tpl);
      tx.oncomplete = function() { resolve(); };
      tx.onerror = function() { reject(tx.error); };
    });
  },

  deleteTemplate: function(id) {
    return new Promise(function(resolve, reject) {
      if (!dbInstance) { resolve(); return; }
      var tx = dbInstance.transaction('templates', 'readwrite');
      tx.objectStore('templates').delete(id);
      tx.oncomplete = function() { resolve(); };
      tx.onerror = function() { reject(tx.error); };
    });
  }
};
