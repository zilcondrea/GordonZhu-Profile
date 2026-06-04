# Guoxuan Zhu - Professional Portfolio Website

A modern, professional portfolio website built for recruiting purposes. Features a clean design, project showcase, AI-powered chat, and a complete admin panel for content management.

## 🚀 Features

### Visitor Experience
- **Hero Section**: Attractive landing with avatar, introduction, and statistics
- **About Page**: Detailed professional background, education, skills, and resume preview
- **Projects Gallery**: Filterable project showcase with detailed views
- **Resources Library**: Organized file management (PDFs, Excel, PowerPoint, Images, PowerBI, Links)
- **AI Chat Widget**: Right-side floating chat powered by DeepSeek AI
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop
- **Modern Aesthetics**: Business-professional design with smooth animations

### Admin Features
- **Secure Password-Protected Access**: Simple, secure admin panel
- **Profile Management**: Update avatar, bio, resume, social links
- **Project Management**: Add/edit/delete projects with images and tags
- **Resource Upload**: Support for PDFs, Excel, PowerPoint, images, PowerBI
- **Skills Management**: Easy skills list management
- **Link Management**: Add external links
- **Real-time Updates**: Changes reflect immediately on the website

## 🛠️ Technology Stack

- **Frontend**: Pure HTML + CSS + JavaScript (no framework required)
- **Backend**: Firebase (Firestore, Storage, Cloud Functions)
- **Hosting**: Firebase Hosting (free tier)
- **AI**: DeepSeek API for intelligent Q&A
- **Design**: Custom CSS with modern design system

## 📋 Prerequisites

Before you start, make sure you have:
1. A Google account (for Firebase)
2. Node.js and npm installed
3. Firebase CLI installed (`npm install -g firebase-tools`)
4. A DeepSeek API key (for AI chat feature)

## 🔧 Setup Instructions

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project"
3. Enter "guoxuan-portfolio" as project name
4. Click "Continue"
5. Enable Google Analytics (optional)
6. Click "Create Project"
7. Wait for project creation to complete

### Step 2: Update Firebase Configuration

1. In Firebase Console, go to Project Settings (⚙️ icon)
2. Copy your project credentials
3. Update `.firebaserc`:
   ```json
   {
     "projects": {
       "default": "YOUR_PROJECT_ID"
     }
   }
   ```

4. Update `firebase-config.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

### Step 3: Setup Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your preferred location
5. Click "Enable"

### Step 4: Setup Firebase Storage

1. In Firebase Console, go to "Storage"
2. Click "Get started"
3. Accept the default rules (can be modified later)
4. Click "Done"

### Step 5: Setup Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Anonymous" sign-in method (for simplicity)

### Step 6: Deploy Cloud Functions

1. Install dependencies:
   ```bash
   cd functions
   npm install
   ```

2. Set environment variables in Firebase:
   ```bash
   firebase functions:config:set deepseek.api_key="YOUR_DEEPSEEK_API_KEY"
   ```

3. Deploy functions:
   ```bash
   firebase deploy --only functions
   ```

### Step 7: Update Admin Password

Edit `admin/admin.js` and change the admin password:
```javascript
const ADMIN_PASSWORD = 'your_secure_password';
```

**Important**: Keep this secure and change it to a strong password!

### Step 8: Deploy Website

1. Login to Firebase:
   ```bash
   firebase login
   ```

2. Deploy:
   ```bash
   firebase deploy
   ```

3. Your website is now live! Check the deployment URL in the console.

## 📁 Project Structure

```
Personal Website/
├── public/
│   ├── index.html           # Main website
│   ├── css/
│   │   └── styles.css       # All styling
│   ├── js/
│   │   ├── main.js          # Main logic
│   │   └── chat.js          # Chat functionality
│   └── assets/
│       └── images/          # Store images here
├── admin/
│   ├── index.html           # Admin panel
│   └── admin.js             # Admin logic
├── functions/
│   ├── index.js             # Cloud functions
│   └── package.json
├── firebase-config.js       # Firebase configuration
├── firebase.json            # Firebase config
├── .firebaserc              # Project mapping
└── README.md
```

## 🔐 Admin Panel Usage

1. Navigate to `https://your-domain.web.app/admin/`
2. Enter your admin password
3. Access the dashboard to:
   - **Profile Tab**: Upload avatar, resume, update bio and skills
   - **Projects Tab**: Add new projects with images and details
   - **Resources Tab**: Upload PDFs, Excel, PowerPoint files
   - **Links Tab**: Add external links

## 💬 AI Chat Configuration

The AI chat uses DeepSeek API. To set it up:

1. Get API key from [DeepSeek](https://platform.deepseek.com)
2. Set in Firebase:
   ```bash
   firebase functions:config:set deepseek.api_key="YOUR_KEY"
   ```
3. Redeploy functions:
   ```bash
   firebase deploy --only functions
   ```

## 🎨 Customization

### Colors
Edit CSS variables in `public/css/styles.css`:
```css
:root {
  --color-dark-blue: #1B2A4A;
  --color-bright-blue: #2E86DE;
  --color-accent-orange: #E67E22;
  /* ... etc */
}
```

### Personal Information
Edit `firebase-config.js` and your profile in the admin panel.

### Design
All styling is in `public/css/styles.css`. Modify sections as needed.

## 📊 Firestore Database Structure

The website uses the following Firestore structure:

```
profile/
  └── main
      ├── avatarUrl
      ├── bio
      ├── email
      ├── github
      └── resumeUrl
  └── skills
      └── skills: [array of skill strings]

projects/
  └── [projectId]
      ├── title
      ├── description
      ├── category
      ├── tools: [array]
      ├── link
      ├── imageUrl
      └── createdAt

resources/
  └── [resourceId]
      ├── type (pdf, excel, ppt, image, powerbi, link)
      ├── name
      ├── description
      ├── url
      ├── fileName
      └── createdAt
```

## 🚀 Deployment

### Deploy Everything
```bash
firebase deploy
```

### Deploy Only Website
```bash
firebase deploy --only hosting
```

### Deploy Only Functions
```bash
firebase deploy --only functions
```

### View Logs
```bash
firebase functions:log
```

## 🔗 Access Points

After deployment:
- **Website**: `https://your-project-id.web.app`
- **Admin Panel**: `https://your-project-id.web.app/admin/`
- **Cloud Functions**: Automatically configured

## 📱 Responsive Design

The website is fully responsive and tested on:
- Mobile (320px - 480px)
- Tablet (480px - 768px)
- Desktop (768px+)

## 🐛 Troubleshooting

### Chat not working?
- Check if DeepSeek API key is set correctly
- Verify Cloud Functions are deployed
- Check browser console for errors

### Files not uploading?
- Ensure Firebase Storage permissions are correct
- Check file size (Firebase has size limits)
- Verify CORS settings in Cloud Functions

### Admin panel not loading?
- Clear browser cache
- Check if Firebase configuration is correct
- Verify Firestore database permissions

## 📝 Content Management Tips

1. **Projects**: Use clear titles and descriptions. Add relevant tools/technologies.
2. **Resources**: Organize by type. Use descriptive names and summaries.
3. **Skills**: Keep skills updated and relevant to target positions.
4. **Resume**: Keep PDF up-to-date for quick previews.

## 🔒 Security Notes

- Keep admin password secure and change it regularly
- Don't commit Firebase credentials to public repositories
- Use environment variables for sensitive data
- Regularly update dependencies

## 📞 Support & Updates

For Firebase documentation: [Firebase Docs](https://firebase.google.com/docs)
For DeepSeek API: [DeepSeek Docs](https://platform.deepseek.com/docs)

## 📄 License

This project is for personal use as a professional portfolio.

---

**Version**: 1.0.0
**Last Updated**: 2024
