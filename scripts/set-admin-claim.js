#!/usr/bin/env node
/**
 * Set admin custom claim on a Firebase user.
 * Usage: node scripts/set-admin-claim.js <UID>
 *
 * Prerequisites:
 * 1. Service account: Get from Firebase Console → Project Settings → Service accounts → Generate new private key
 * 2. Save as scripts/service-account.json (gitignored)
 * 3. Or set GOOGLE_APPLICATION_CREDENTIALS to the path of your service account JSON
 *
 * Example:
 *   GOOGLE_APPLICATION_CREDENTIALS=./scripts/service-account.json node scripts/set-admin-claim.js abc123xyz
 */
const admin = require('firebase-admin');
const path = require('path');

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node set-admin-claim.js <UID>');
  console.error('  UID = Firebase Auth user ID (from Firebase Console or user.uid)');
  process.exit(1);
}

// Initialize: use GOOGLE_APPLICATION_CREDENTIALS or scripts/service-account.json
function init() {
  if (admin.apps.length) return;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp();
    return;
  }
  const credPath = path.join(__dirname, 'service-account.json');
  const fs = require('fs');
  if (!fs.existsSync(credPath)) {
    throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS or add scripts/service-account.json');
  }
  const serviceAccount = require(credPath);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
try {
  init();
} catch (e) {
  console.error('Failed to initialize Firebase Admin. Ensure:');
  console.error('  1. service-account.json in scripts/ (from Firebase Console → Service accounts)');
  console.error('  2. Or set GOOGLE_APPLICATION_CREDENTIALS');
  console.error('  3. npm install firebase-admin (in project root or scripts/)');
  console.error('');
  console.error(e.message);
  process.exit(1);
}

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('Admin claim set for UID:', uid);
    console.log('User must sign out and sign back in for the claim to take effect.');
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
