# Firestore Rules Setup

Copy these rules into Firebase Console → Firestore Database → Rules tab

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

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Firebase Storage Rules

Copy these into Firebase Console → Storage → Rules tab

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile files - readable by all
    match /profile/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }

    // Project files - readable by all
    match /projects/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }

    // Resource files - readable by all
    match /resources/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }

    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Important Notes

- These rules make data readable to everyone (visitors)
- Admin panel uploads go through Cloud Functions (not direct client uploads shown here)
- For a production app with user authentication, these rules would be more restrictive
- Current setup is optimized for a public portfolio website
