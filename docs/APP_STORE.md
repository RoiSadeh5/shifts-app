# App Store Submission Guide – שכ״ש

This guide covers everything needed to publish שכ״ש to the Apple App Store.

---

## Prerequisites

1. **Apple Developer Account** – $99/year at [developer.apple.com](https://developer.apple.com)
2. **Xcode** – installed from Mac App Store (latest version)
3. **Mac** – required for building iOS apps

---

## Build & Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Build web assets and sync to native project
npm run cap:sync

# 3. Open in Xcode
npm run ios
```

In Xcode:
- Select your **Team** (Signing & Capabilities)
- Select a **simulator** or connected iPhone
- Press ▶️ to build and run

---

## App Store Connect Checklist

### 1. Create the App
- Go to [App Store Connect](https://appstoreconnect.apple.com)
- **My Apps** → **+** → **New App**
- **Platform**: iOS
- **Name**: שכ״ש (or "Sachash" for store listing)
- **Primary Language**: Hebrew
- **Bundle ID**: `com.roisadeh.sachash`
- **SKU**: e.g. `sachash-001`

### 2. App Information
- **Subtitle**: חישוב שכר ומשמרות
- **Category**: Finance or Productivity
- **Privacy Policy URL**: Required – use your hosted URL, e.g.  
  `https://roisadeh5.github.io/shifts-app/privacy.html`

### 3. Screenshots (Required)
Apple requires screenshots for each device size. Minimum:
- **6.7" iPhone** (1290×2796): 3–10 screenshots
- **6.5" iPhone** (1242×2688): optional but recommended
- **5.5" iPhone** (1242×2208): optional

**How to capture**: Run the app in Simulator → File → Save Screen, or use a real device + Xcode.

### 4. App Icon
- **1024×1024 px** – already in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- No transparency, sRGB, square (Apple applies the mask)

### 5. Version Information
- **Version**: 5.0.0 (match `package.json`)
- **Copyright**: © 2026 Roi Sadeh
- **Description**: Hebrew description of the app (what it does, who it's for)
- **Keywords**: שכר, משמרות, תלוש, חישוב, 2026

### 6. Age Rating
- Answer the questionnaire – likely **4+** (no restricted content)

### 7. Pricing
- **Free** – select "0" or "Free"

---

## Archive & Upload

1. In Xcode: **Product** → **Archive**
2. When archive completes: **Window** → **Organizer**
3. Select the archive → **Distribute App**
4. Choose **App Store Connect** → **Upload**
5. Follow the wizard (default options usually work)

---

## After Upload

1. In App Store Connect, the build appears under **TestFlight** first
2. Go to your app → **App Store** tab → select the build for submission
3. Click **Submit for Review**
4. Review typically takes 24–48 hours

---

## Releasing Updates

1. Bump version in `package.json` and `ios/App/App.xcodeproj/project.pbxproj` (or Xcode)
2. Run `npm run cap:sync`
3. Archive and upload again

---

## Files Reference

| Path | Purpose |
|------|---------|
| `capacitor.config.json` | App ID, name, web dir |
| `ios/App/App/Info.plist` | Display name, localizations |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/` | App icon |
| `privacy.html` | Privacy policy (also on GitHub Pages) |

---

## Hosted Privacy Policy

Your app is live at `https://roisadeh5.github.io/shifts-app/`.  
Use this URL for the privacy policy in App Store Connect:
```
https://roisadeh5.github.io/shifts-app/privacy.html
```

---

כל הזכויות שמורות ל-Roi Sadeh
