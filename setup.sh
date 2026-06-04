#!/bin/bash

# Portfolio Website Setup Script
# This script automates some of the initial setup

set -e

echo "🚀 Guoxuan Zhu Portfolio Setup Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}Firebase CLI not found. Installing...${NC}"
    npm install -g firebase-tools
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
cd functions
npm install
cd ..
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Prompt for configuration
echo -e "${BLUE}Configuration Setup${NC}"
echo "===================="
echo ""
echo "You'll need the following from Firebase Console (Project Settings):"
echo ""

read -p "Enter Firebase API Key: " API_KEY
read -p "Enter Firebase Auth Domain: " AUTH_DOMAIN
read -p "Enter Firebase Project ID: " PROJECT_ID
read -p "Enter Firebase Storage Bucket: " STORAGE_BUCKET
read -p "Enter Firebase Messaging Sender ID: " MESSAGING_SENDER_ID
read -p "Enter Firebase App ID: " APP_ID

# Update firebase-config.js
echo -e "${BLUE}Updating Firebase configuration...${NC}"

cat > firebase-config.js << EOF
// Firebase Configuration
const firebaseConfig = {
  apiKey: "$API_KEY",
  authDomain: "$AUTH_DOMAIN",
  projectId: "$PROJECT_ID",
  storageBucket: "$STORAGE_BUCKET",
  messagingSenderId: "$MESSAGING_SENDER_ID",
  appId: "$APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const db = firebase.firestore();
const storage = firebase.storage();

// Export for use in other files
window.firebaseServices = {
  db,
  storage,
  auth: firebase.auth()
};
EOF

echo -e "${GREEN}✓ Firebase config updated${NC}"
echo ""

# Update .firebaserc
echo -e "${BLUE}Updating Firebase project mapping...${NC}"
cat > .firebaserc << EOF
{
  "projects": {
    "default": "$PROJECT_ID"
  }
}
EOF

echo -e "${GREEN}✓ Project mapping updated${NC}"
echo ""

# Admin password
echo -e "${BLUE}Security Setup${NC}"
echo "=============="
echo ""
read -sp "Enter a new admin password (won't display): " ADMIN_PASSWORD
echo ""

# Update admin password in admin.js
sed -i.bak "s/const ADMIN_PASSWORD = '[^']*';/const ADMIN_PASSWORD = '$ADMIN_PASSWORD';/" admin/admin.js
rm admin/admin.js.bak 2>/dev/null || true

echo -e "${GREEN}✓ Admin password set${NC}"
echo ""

# DeepSeek API Key
echo -e "${BLUE}AI Chat Setup${NC}"
echo "============="
echo ""
read -sp "Enter your DeepSeek API Key: " DEEPSEEK_KEY
echo ""

echo ""
echo -e "${YELLOW}Setting Cloud Function environment variables...${NC}"
firebase functions:config:set deepseek.api_key="$DEEPSEEK_KEY"

echo -e "${GREEN}✓ Environment variables set${NC}"
echo ""

# Summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Login to Firebase:"
echo "   ${BLUE}firebase login${NC}"
echo ""
echo "2. Deploy Cloud Functions:"
echo "   ${BLUE}firebase deploy --only functions${NC}"
echo ""
echo "3. Deploy website:"
echo "   ${BLUE}firebase deploy${NC}"
echo ""
echo "4. Or test locally first:"
echo "   ${BLUE}firebase serve${NC}"
echo ""
echo "Admin panel: https://YOUR_PROJECT_ID.web.app/admin/"
echo "Password: [Your chosen password]"
echo ""
echo "For more help, see:"
echo "- DEPLOYMENT_GUIDE.md - Step-by-step deployment"
echo "- README.md - Full documentation"
echo "- QUICK_REFERENCE.md - Quick usage guide"
echo ""
