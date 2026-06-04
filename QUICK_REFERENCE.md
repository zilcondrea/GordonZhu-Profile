# Quick Reference Guide

## 🚀 Quick Start (After Deployment)

### Access Your Website
```
https://YOUR_PROJECT_ID.web.app
```

### Access Admin Panel
```
https://YOUR_PROJECT_ID.web.app/admin/
Password: [Your chosen password from admin/admin.js]
```

## 📋 Admin Panel Features

### Profile Tab
- **Avatar**: Upload your profile picture (JPEG, PNG)
- **Bio**: Write your professional summary
- **Email**: Your contact email
- **GitHub**: Your GitHub profile link
- **Resume**: Upload PDF resume for preview
- **Skills**: Add comma-separated skills (e.g., "React, Python, Firebase")

### Projects Tab
- **Title**: Project name
- **Description**: What the project does
- **Category**: Type (e.g., "data-analysis", "web-dev")
- **Tools**: Technologies used (comma-separated)
- **Link**: Project URL
- **Image**: Project thumbnail

### Resources Tab
- **Type**: PDF, Excel, PowerPoint, Image, PowerBI, Link
- **Name**: File/resource name
- **Description**: Brief description
- **Upload**: Select file from computer

### Links Tab
- **Title**: Link name
- **URL**: Full URL (e.g., https://linkedin.com/in/...)
- **Description**: What the link is

## 📁 Important Files

| File | Purpose |
|------|---------|
| `firebase-config.js` | Firebase credentials (update with your info) |
| `admin/admin.js` | Admin password (Line 12) - CHANGE THIS! |
| `public/index.html` | Main website structure |
| `public/css/styles.css` | All styling and design |
| `public/js/main.js` | Website functionality |
| `public/js/chat.js` | AI chat functionality |
| `functions/index.js` | Cloud functions (AI backend) |

## 🔐 Security Checklist

- [ ] Changed admin password to something secure
- [ ] Updated Firebase config with real credentials
- [ ] Set DeepSeek API key in Firebase
- [ ] Deployed Cloud Functions
- [ ] Tested admin panel login
- [ ] Tested file uploads
- [ ] Tested AI chat
- [ ] Reviewed Firestore security rules

## 🎨 Customization Quick Tips

### Change Colors
File: `public/css/styles.css` → Lines 6-11
```css
--color-dark-blue: #1B2A4A;      /* Primary color */
--color-bright-blue: #2E86DE;    /* Secondary color */
--color-accent-orange: #E67E22;  /* Accent color */
```

### Change Text
- Hero text: `public/index.html` → Search "Guoxuan Zhu"
- Navigation: `public/index.html` → `<nav>` section
- Footer: `public/index.html` → `<footer>` section

### Add New Section
1. Add HTML to `public/index.html`
2. Add CSS styling to `public/css/styles.css`
3. Add JavaScript logic to `public/js/main.js` if needed

## 📊 Website Structure

```
Homepage (Hero)
├── Hero Section (Avatar, Name, CTA)
├── Statistics (Project Count, Skills Count, etc.)
└── Featured Projects

About Me
├── Personal Photo
├── Bio & Background
├── Education
├── Skills
└── Resume Preview (Modal)

Projects
├── Filter by Category
└── Project Grid with Details

Resources
├── PDFs
├── Excel Files
├── Presentations
├── Images
├── PowerBI
└── Links

Contact
├── Email
├── LinkedIn
└── GitHub

Footer
└── Social Links
```

## 🔍 Troubleshooting

### Admin won't let me in
- Check password (case-sensitive)
- Clear browser cookies
- Try incognito/private mode
- Check browser console for errors

### Files won't upload
- Check file size (under 100MB)
- Check internet connection
- Try a different file
- Check Firebase Storage quota

### Chat not responding
- Check browser console (F12)
- Verify Cloud Functions are deployed
- Check DeepSeek API key is set
- Try refreshing page

### Website looks broken
- Clear browser cache (Ctrl+Shift+Delete)
- Check mobile responsiveness
- Verify CSS loaded (check Network tab)
- Check for console errors (F12)

## 🌐 URL Paths

After deployment:

| Path | Purpose |
|------|---------|
| `/` | Home page |
| `/admin/` | Admin panel |
| `/#about` | About section |
| `/#projects` | Projects section |
| `/#resources` | Resources section |
| `/#contact` | Contact section |

## 📈 Content Strategy

### For Recruiters
1. **Profile**: Make first impression count
   - Professional photo
   - Clear, concise bio
   - Up-to-date resume
   - Relevant skills

2. **Projects**: Showcase your best work
   - 3-5 strong projects
   - Clear descriptions
   - Links to live demos if possible
   - Technologies used

3. **Resources**: Support your claims
   - Case studies
   - Reports you've written
   - Presentations
   - Portfolio pieces

4. **Chat**: Show expertise
   - AI pulls from your data
   - Recruiter can ask questions
   - Shows you're tech-savvy

## 🔄 Regular Maintenance

### Weekly
- Check for typos on main page
- Verify links still work

### Monthly
- Review projects
- Update resume if needed
- Check Cloud Functions logs

### Quarterly
- Update skills list
- Add new projects
- Review analytics (if integrated)

## 🚀 Tips for Success

1. **Be Specific**: Use clear, descriptive titles and descriptions
2. **Show Results**: Include metrics in project descriptions
3. **Use Keywords**: Include industry keywords for searchability
4. **Keep Fresh**: Regularly add new content
5. **Link Everything**: Connect to GitHub, LinkedIn, live demos
6. **Mobile First**: Test on your phone
7. **Engage**: Respond to inquiries quickly

## 📞 Quick Command Reference

```bash
# Start local development
firebase serve

# Deploy everything
firebase deploy

# Deploy only website
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# View logs
firebase functions:log

# Check status
firebase status
```

## 🎯 First 30 Days After Launch

- Day 1: Test everything thoroughly
- Day 2: Add initial content (profile, resume)
- Day 3: Add 3-5 projects
- Day 4: Add supporting resources
- Day 5: Share with network
- Day 7: First review - fix any issues
- Day 14: Add more projects/content
- Day 30: Review and optimize

## 💡 Pro Tips

1. **Use Professional Images**: Resize before uploading (saves storage)
2. **Name Projects Clearly**: Use descriptive, searchable names
3. **Write for Non-Experts**: Explain projects clearly for all audiences
4. **Update Regularly**: Shows you're active and engaged
5. **Monitor Chat**: See what recruiters are asking about
6. **Keep Resume Updated**: It's the first thing recruiters want
7. **Test on Mobile**: Most recruiters browse on their phones

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [DeepSeek API Docs](https://platform.deepseek.com/api-docs)
- [Web Performance Tips](https://web.dev/performance/)
- [Portfolio Best Practices](https://www.smashingmagazine.com/)

---

**Remember**: Your portfolio is a reflection of you. Keep it professional, updated, and error-free!
