/**
 * Cloud Functions for Shifts app – admin list users, delete user.
 * Admin access: custom claim (request.auth.token.admin) OR master password.
 * Admin SDK bypasses Firestore rules by default.
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

function isAdminByClaim(context) {
  return context.auth && context.auth.token && context.auth.token.admin === true;
}

function checkAdminPassword(password) {
  const expected = process.env.ADMIN_PASSWORD || functions.config().admin?.password;
  return expected && password === expected;
}

function requireAdmin(data, context) {
  if (isAdminByClaim(context)) return;
  const password = (data && data.password) || '';
  if (checkAdminPassword(password)) return;
  throw new functions.https.HttpsError('permission-denied', 'Admin access required');
}

exports.adminListUsers = functions.https.onCall(async (data, context) => {
  requireAdmin(data, context);
  const db = admin.firestore();
  const snap = await db.collection('users').get();
  const users = [];
  snap.docs.forEach(doc => {
    const d = doc.data();
    const firstSeen = d.firstSeen?.toDate ? d.firstSeen.toDate().toISOString() : null;
    const lastActive = d.lastActive?.toDate ? d.lastActive.toDate().toISOString() : null;
    users.push({
      userId: doc.id,
      phoneMasked: d.phoneMasked || '***',
      firstSeen,
      lastActive
    });
  });
  return { users };
});

exports.adminDeleteUser = functions.https.onCall(async (data, context) => {
  requireAdmin(data, context);
  const userId = (data && data.userId) || '';
  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'userId required');
  }
  const db = admin.firestore();
  const batch = db.batch();
  const userRef = db.collection('users').doc(userId);
  batch.delete(userRef);
  const dataSnap = await userRef.collection('data').get();
  dataSnap.docs.forEach(doc => batch.delete(doc.ref));
  const templatesSnap = await userRef.collection('templates').get();
  templatesSnap.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  try {
    await admin.auth().deleteUser(userId);
  } catch (e) {
    // User may not exist in Auth if only Firestore data
  }
  return { ok: true };
});
