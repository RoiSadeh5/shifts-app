# Firebase Setup for Shifts App

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication** → **Sign-in method** → **Phone**
4. Add your app domains to **Authorized domains**:
   - Firebase Console → **Authentication** → **Settings** (gear) → **Authorized domains**
   - Add `localhost` for development
   - Add `roisadeh5.github.io` for GitHub Pages production (phone auth & reCAPTCHA require this)
5. Enable **Firestore Database** → Create database

## 2. Configure the App

1. Copy `firebase-config.example.js` to `firebase-config.js` (or edit the example)
2. Fill in your project credentials from Firebase Console → Project Settings → Your apps
3. Add `firebase-config.js` to `.gitignore` (already done) so secrets are not committed

## 3. Deploy Firestore Rules

```bash
firebase init firestore   # if not already done; select existing firestore.rules
firebase deploy --only firestore
```

## 4. Deploy Cloud Functions (Admin)

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

Set the admin password (must match `config.js` / `ADMIN_CONFIG.password`):

```bash
firebase functions:config:set admin.password="YOUR_SECURE_ADMIN_PASSWORD"
firebase deploy --only functions
```

Or use an environment variable when deploying (e.g. in CI).

## 5. Test Phone Auth (Development)

1. In Firebase Console → Authentication → Sign-in method → Phone
2. Add **Phone numbers for testing** (e.g. +1 650-555-1234 with code 123456)
3. Use these for local testing without sending real SMS

## 6. Admin Panel & God Mode

**Two admin paths:**
1. **Password:** `config.js` (`ADMIN_CONFIG.password`) must match `admin.password` in Firebase Functions config
2. **Custom claim (God Mode):** User with `admin: true` claim bypasses password and has full Firestore access

**Grant God Mode to a user:**
```bash
cd scripts && npm install
# Add scripts/service-account.json from Firebase Console → Service accounts
node set-admin-claim.js <USER_UID>
```
User must sign out and sign back in for the claim to take effect.

**God Mode benefits:**
- Admin panel opens without password
- Firestore rules allow read/write on all user data
- Cloud Functions accept the admin claim (no password needed)
- "צפה" (View) button to inspect any user's shifts/history
