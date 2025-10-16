# Saveory 🍹
Find live **Happy Hours, Deals, and Events** around Madison in real time. Built with **React Native** + **Firebase**.  
Serving **2,000+ users** and **60+ local businesses**.

> Mobile-first app for exploring nearby deals, with live maps, filters, bookmarks, reviews, and a business portal for owners.

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Data Model (Firestore)](#data-model-firestore)
- [Analytics & Events](#analytics--events)
- [Business Portal](#business-portal)
- [Data Ingestion Pipeline](#data-ingestion-pipeline)
- [Scripts](#scripts)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- 🔎 **Live Deals Feed** — Filter by distance, day, time, category, and “live now”.
- 🗺️ **Map View** — Clustered map with callouts, directions deeplinks, and distance sorting.
- ⭐ **Bookmarks** — Save favorite spots (synced per user).
- 💬 **Comments/Reviews** — Lightweight feedback and tips.
- 🌙 **Dark Mode** — Respects system theme.
- 🔔 **(Optional) Push** — FCM/Expo notifications for nearby live deals.
- 📊 **Owner Analytics** — Basic impressions & clicks for listed deals.
- 🧩 **Business Portal** — Owners add/edit deals; changes sync to the app.

---

## Architecture
```
React Native (Expo/CLI) 
 ├─ UI: React Navigation, functional components, hooks
 ├─ State: React Context (Bookmarks, Theme, Auth)
 ├─ Maps: react-native-maps (Apple/Google)
 ├─ Auth: Firebase Auth (email/anonymous)
 ├─ Data: Firestore (real-time), Cloud Storage (images)
 ├─ Cloud Functions (optional): data validation / denormalization
 └─ Analytics: Firebase Analytics (and/or Amplitude)
```

---

## Tech Stack
**Mobile:** React Native, TypeScript/JavaScript, React Navigation  
**Backend:** Firebase Auth, Firestore, Cloud Storage, Cloud Functions (Node)  
**Infra/Other:** AWS (hosting/assets as needed), Databricks (experiments), GitHub Actions (CI)  
**Maps/Location:** `react-native-maps`, device geolocation APIs

---

## Getting Started

### 1) Clone
```bash
git clone https://github.com/anthonyjcthomas/savory-app.git
cd savory-app
```

### 2) Install
```bash
# If Expo:
npm i
# or
yarn
```

### 3) Configure env
Create `.env` (or use `app.config.js`/`app.json` with extra config):

```bash
FIREBASE_API_KEY=xxxx
FIREBASE_AUTH_DOMAIN=xxxx.firebaseapp.com
FIREBASE_PROJECT_ID=xxxx
FIREBASE_STORAGE_BUCKET=xxxx.appspot.com
FIREBASE_MESSAGING_SENDER_ID=xxxx
FIREBASE_APP_ID=1:xxxx:web:xxxx
FIREBASE_MEASUREMENT_ID=G-xxxx
```

Initialize Firebase in your app entry using these vars.

### 4) Run
```bash
# Expo
npx expo start
# iOS
npx expo run:ios   # or 'i' in Expo
# Android
npx expo run:android
```

> If you’re on **React Native CLI (bare)**, ensure CocoaPods are installed, then `cd ios && pod install && cd ..`, and run from Xcode/Android Studio or `npx react-native run-ios/android`.

---

## Configuration
- **Maps**: Provide API keys (Apple Maps default on iOS; Google Maps on Android).  
- **Auth**: Enable Email/Anonymous in Firebase Console.  
- **Firestore Rules**: Lock down writes to authenticated users and Cloud Functions where appropriate.  
- **Images**: Configure Firebase Storage rules for owner uploads.

---

## Data Model (Firestore)
A flexible schema that supports **multiple deals per restaurant** and **live filtering**:

```json
// Collection: restaurants
{
  "id": "auto-id",
  "name": "Estación Inka",
  "address": "123 State St, Madison, WI",
  "coords": { "lat": 43.074, "lng": -89.384 },
  "categories": ["Peruvian", "Latin"],
  "phone": "(608) 555-1212",
  "website": "https://example.com",
  "images": ["gs://.../image1.jpg"],
  "happy_hour_deals": [
    {
      "title": "Half-off apps",
      "days": ["Mon","Tue","Wed"],
      "start_time": "15:00",
      "end_time": "18:00",
      "description": "Half off select appetizers; $5 drafts",
      "tags": ["food","beer"],
      "active": true
    },
    {
      "title": "$6 margs",
      "days": ["Thu","Fri"],
      "start_time": "16:00",
      "end_time": "19:00",
      "description": "House margaritas",
      "tags": ["cocktail"]
    }
  ],
  "updated_at": 1717286400000
}
```

---

## License
MIT © Anthony Thomas
