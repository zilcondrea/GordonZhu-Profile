# Configuration Setup Guide

## Environment Variables

### Local Development
Create a `.env.local` file in the root directory:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key
```

### Firebase Functions
Set environment variables via CLI:
```bash
firebase functions:config:set deepseek.api_key="YOUR_API_KEY"
```

## Firebase Rules

### Firestore Security Rules
Update in Firebase Console: Firestore → Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Profile data - readable by all, writable only via Cloud Functions
    match /profile/{document=**} {
      allow read: if true;
      allow write: if false;
    }

    // Projects - readable by all
    match /projects/{document=**} {
      allow read: if true;
      allow write: if false;
    }

    // Resources - readable by all
    match /resources/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### Storage Rules
Update in Firebase Console: Storage → Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile files
    match /profile/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }

    // Projects
    match /projects/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }

    // Resources
    match /resources/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## API Credentials Required

### Firebase
- [ ] API Key
- [ ] Auth Domain
- [ ] Project ID
- [ ] Storage Bucket
- [ ] Messaging Sender ID
- [ ] App ID

Get from: Firebase Console → Project Settings → Web App

### DeepSeek
- [ ] API Key

Get from: https://platform.deepseek.com/account/api_keys

## Local Development Setup

### 1. Install Dependencies
```bash
# Functions dependencies
cd functions
npm install

# Back to root
cd ..
```

### 2. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 3. Authenticate with Firebase
```bash
firebase login
```

### 4. Start Local Emulator
```bash
firebase emulators:start --only hosting,firestore,functions,storage
```

### 5. Access Local Services
- Website: http://localhost:5000
- Admin: http://localhost:5000/admin/
- Firestore Emulator: http://localhost:4000
- Functions Logs: Visible in terminal

## Updating Credentials

If you need to update credentials later:

### Firebase Config
Edit `firebase-config.js` and restart local server or redeploy.

### DeepSeek API Key
```bash
firebase functions:config:set deepseek.api_key="NEW_KEY"
firebase deploy --only functions
```

### Admin Password
Edit `admin/admin.js` line ~12 and redeploy hosting.

## Database Backups

### Automatic Backups
Firebase automatically backs up your data. Check in Firestore console.

### Manual Export
```bash
firebase firestore:export ./backups/firestore-backup --export-auth-disabled
```

## Monitoring

### View Logs
```bash
firebase functions:log
```

### Monitor Cloud Function Usage
- Go to Firebase Console
- Functions → Usage
- Check invocations and errors

### Monitor Storage Usage
- Go to Firebase Console
- Storage → Files
- Check total size

## Cost Optimization

Free tier includes:
- ✅ 1 GB Cloud Firestore storage
- ✅ 5 GB Cloud Storage
- ✅ 125k Cloud Function invocations/month
- ✅ Unlimited Hosting

Avoid exceeding limits by:
- Cleaning old files regularly
- Optimizing image sizes
- Limiting AI chat invocations during testing
