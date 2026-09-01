// Firebase Configuration
// Initialize Firebase with your project credentials
const firebaseConfig = {
  apiKey: "AIzaSyCyqSPxOu7he4h_Kw3ke8PRsuXdH8O_4uw",
  authDomain: "guoxuan-portfolio.firebaseapp.com",
  projectId: "guoxuan-portfolio",
  storageBucket: "guoxuan-portfolio.firebasestorage.app",
  messagingSenderId: "563407411728",
  appId: "1:563407411728:web:024c0ce0b39c784200c895"
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
