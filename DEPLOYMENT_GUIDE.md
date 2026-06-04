# Deployment Checklist & Quick Start Guide

## Pre-Deployment Checklist

- [ ] Firebase project created
- [ ] Firebase configuration updated (`firebase-config.js`)
- [ ] Admin password changed (`admin/admin.js`)
- [ ] DeepSeek API key obtained
- [ ] Node.js and Firebase CLI installed
- [ ] All files created in correct directories

## Quick Start (5 minutes)

### 1. Initialize Firebase Project
```bash
cd "/Users/zilcondrea/Desktop/Codes/Personal Website"
firebase init hosting
# Choose: Don't overwrite public/index.html
# Public directory: public
```

### 2. Update Firebase Config
Edit `firebase-config.js` with your project credentials from Firebase Console

### 3. Deploy Cloud Functions
```bash
cd functions
npm install
firebase functions:config:set deepseek.api_key="YOUR_DEEPSEEK_API_KEY"
firebase deploy --only functions
```

### 4. Deploy Website
```bash
cd ..
firebase deploy
```

## First Time Setup Walkthrough

### Step 1: Firebase Console Setup
1. Visit https://console.firebase.google.com
2. Create new project
3. Enable Firestore Database (Production mode)
4. Enable Storage
5. Enable Authentication (Anonymous sign-in)
6. Copy Web SDK config

### Step 2: Configure Credentials
File: `firebase-config.js`
```javascript
const firebaseConfig = {
  apiKey: "xxxxx",
  authDomain: "xxxxx.firebaseapp.com",
  projectId: "xxxxx",
  storageBucket: "xxxxx.appspot.com",
  messagingSenderId: "xxxxx",
  appId: "xxxxx"
};
```

### Step 3: Update Admin Password
File: `admin/admin.js` (Line ~12)
```javascript
const ADMIN_PASSWORD = 'YourSecurePassword123';
```

### Step 4: Deploy
```bash
firebase login
firebase deploy --only hosting
firebase deploy --only functions
```

## File Locations Reference

```
/Users/zilcondrea/Desktop/Codes/Personal Website/
├── public/
│   ├── index.html             ← Main website
│   ├── css/styles.css         ← All styling
│   ├── js/main.js             ← Site logic
│   ├── js/chat.js             ← Chat logic
│   └── assets/images/         ← Upload images here
├── admin/
│   ├── index.html             ← Admin login page
│   └── admin.js               ← Admin dashboard logic
├── functions/
│   ├── index.js               ← Cloud functions code
│   └── package.json           ← Function dependencies
├── firebase-config.js         ← Firebase credentials
├── firebase.json              ← Firebase hosting config
├── .firebaserc                ← Project ID mapping
└── README.md                  ← Full documentation
```

## Admin Panel Access

1. **URL**: `https://your-project.web.app/admin/`
2. **Password**: [Your chosen password]
3. **Features Available**:
   - Upload profile avatar
   - Add/manage projects
   - Upload resources (PDF, Excel, PPT, Images)
   - Manage skills
   - Update resume
   - Add external links

## Content to Add After Deployment

1. **Profile Tab**
   - Upload your avatar photo
   - Upload resume PDF
   - Write your bio
   - Add email and GitHub links
   - List your key skills

2. **Projects Tab**
   - Add 3-5 featured projects
   - Upload project images
   - Include tools/technologies used
   - Add project links if available

3. **Resources Tab**
   - Upload relevant PDFs
   - Add Excel reports
   - Include presentations
   - Upload case study images

## Environment Variables for Cloud Functions

Set in Firebase Console or via CLI:
```bash
firebase functions:config:set deepseek.api_key="sk-xxxxx"
```

## Testing Before Going Live

1. **Test Website**:
   ```bash
   firebase serve
   # Visit http://localhost:5000
   ```

2. **Test Admin Panel**:
   - Navigate to `http://localhost:5000/admin/`
   - Login with your password
   - Try uploading a test project

3. **Test Chat**:
   - Open browser console
   - Try asking a question
   - Check for errors

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Cannot find Firebase config" | Update `firebase-config.js` with correct credentials |
| "Admin login not working" | Check password in `admin/admin.js` matches what you're entering |
| "Chat returns 404" | Ensure Cloud Functions are deployed: `firebase deploy --only functions` |
| "Files won't upload" | Check Firebase Storage rules in console |
| "Styling looks broken" | Clear cache: Ctrl+Shift+Del (Cmd+Shift+Delete on Mac) |

## Monitoring & Maintenance

```bash
# View function logs
firebase functions:log

# View deployment status
firebase status

# Update dependencies
cd functions && npm update

# Redeploy after updates
firebase deploy
```

## Access Your Live Website

After deployment:
- **Main Site**: `https://YOUR_PROJECT_ID.web.app/`
- **Admin**: `https://YOUR_PROJECT_ID.web.app/admin/`

Find YOUR_PROJECT_ID in Firebase Console or `.firebaserc` file.

## Next Steps After Deployment

1. ✅ Test all functionality
2. ✅ Add your profile information
3. ✅ Upload projects and resume
4. ✅ Share admin link (keep password safe!)
5. ✅ Share portfolio website with recruiters
6. ✅ Monitor chat conversations (check Cloud Functions logs)

---

**Remember**: 
- Keep your admin password secure
- Backup your Firestore data regularly
- Monitor Cloud Functions usage (free tier: 125k invocations/month)
- Test before sharing with recruiters!
