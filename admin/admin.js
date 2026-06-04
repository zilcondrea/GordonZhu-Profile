// ===========================
// ADMIN PANEL LOGIC
// ===========================

const { db, storage } = window.firebaseServices;

// Admin password (Change this to your preferred password)
const ADMIN_PASSWORD = 'admin123';

// State
const adminState = {
  isAuthenticated: false,
  projects: [],
  resources: [],
  skills: [],
  profileData: {},
  projectImageFile: null,
  resourceFile: null
};

// Check if already authenticated
document.addEventListener('DOMContentLoaded', () => {
  const auth = sessionStorage.getItem('adminAuth');
  if (auth === 'true') {
    adminState.isAuthenticated = true;
    showAdminPanel();
    loadAllData();
  }
  
  // Load existing data for editing
  loadProjectsList();
  loadResourcesList();
  loadLinksList();
});

// ===========================
// AUTHENTICATION
// ===========================

function handleLogin(event) {
  event.preventDefault();
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');
  
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem('adminAuth', 'true');
    adminState.isAuthenticated = true;
    errorDiv.classList.remove('show');
    showAdminPanel();
    loadAllData();
  } else {
    errorDiv.textContent = 'Incorrect password';
    errorDiv.classList.add('show');
  }
}

function logout() {
  sessionStorage.removeItem('adminAuth');
  adminState.isAuthenticated = false;
  document.getElementById('adminPage').classList.remove('show');
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('password').value = '';
}

function showAdminPanel() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('adminPage').classList.add('show');
}

// ===========================
// TAB SWITCHING
// ===========================

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('show');
  });
  
  // Deactivate all buttons
  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab and activate button
  document.getElementById(tabName).classList.add('show');
  event.target.classList.add('active');
  
  // Load data for the tab
  if (tabName === 'projects') {
    loadProjectsList();
  } else if (tabName === 'resources') {
    loadResourcesList();
  } else if (tabName === 'links') {
    loadLinksList();
  }
}

// ===========================
// PROFILE MANAGEMENT
// ===========================

async function uploadAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const storageRef = storage.ref(`profile/avatar/${Date.now()}-${file.name}`);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();
    adminState.profileData.avatarUrl = url;
    alert('Avatar uploaded successfully!');
  } catch (error) {
    console.error('Error uploading avatar:', error);
    alert('Error uploading avatar');
  }
}

async function uploadResume(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const storageRef = storage.ref(`profile/resume/${Date.now()}-${file.name}`);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();
    adminState.profileData.resumeUrl = url;
    alert('Resume uploaded successfully!');
  } catch (error) {
    console.error('Error uploading resume:', error);
    alert('Error uploading resume');
  }
}

async function saveProfile() {
  const bio = document.getElementById('bio').value;
  const email = document.getElementById('email').value;
  const github = document.getElementById('github').value;
  
  try {
    await db.collection('profile').doc('main').set({
      bio,
      email,
      github,
      avatarUrl: adminState.profileData.avatarUrl || '',
      resumeUrl: adminState.profileData.resumeUrl || ''
    }, { merge: true });
    
    showSuccess('profileSuccess');
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('Error saving profile');
  }
}

async function saveSkills() {
  const skillsInput = document.getElementById('skillsInput').value;
  const skills = skillsInput.split(',').map(s => s.trim()).filter(s => s);
  
  try {
    await db.collection('profile').doc('skills').set({
      skills
    });
    
    adminState.skills = skills;
    showSuccess('skillsSuccess');
    loadSkillsList();
  } catch (error) {
    console.error('Error saving skills:', error);
    alert('Error saving skills');
  }
}

function loadSkillsList() {
  const skillsList = document.getElementById('skillsList');
  skillsList.innerHTML = adminState.skills.map((skill, index) => `
    <div class="item-card">
      <div class="item-info">
        <h4>${skill}</h4>
      </div>
      <button class="delete-btn" onclick="deleteSkill(${index})">Delete</button>
    </div>
  `).join('');
}

async function deleteSkill(index) {
  adminState.skills.splice(index, 1);
  await db.collection('profile').doc('skills').set({ skills: adminState.skills });
  loadSkillsList();
}

// ===========================
// PROJECTS MANAGEMENT
// ===========================

function handleProjectImage(event) {
  adminState.projectImageFile = event.target.files[0];
}

async function saveProject() {
  const title = document.getElementById('projectTitle').value;
  const description = document.getElementById('projectDescription').value;
  const category = document.getElementById('projectCategory').value;
  const tools = document.getElementById('projectTools').value.split(',').map(t => t.trim()).filter(t => t);
  const link = document.getElementById('projectLink').value;
  
  if (!title || !description) {
    alert('Please fill in all required fields');
    return;
  }
  
  try {
    let imageUrl = '';
    
    // Upload image if provided
    if (adminState.projectImageFile) {
      const storageRef = storage.ref(`projects/${Date.now()}-${adminState.projectImageFile.name}`);
      await storageRef.put(adminState.projectImageFile);
      imageUrl = await storageRef.getDownloadURL();
    }
    
    // Add project to Firestore
    await db.collection('projects').add({
      title,
      description,
      category,
      tools,
      link,
      imageUrl,
      createdAt: new Date()
    });
    
    // Clear form
    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectCategory').value = '';
    document.getElementById('projectTools').value = '';
    document.getElementById('projectLink').value = '';
    document.getElementById('projectImageInput').value = '';
    adminState.projectImageFile = null;
    
    showSuccess('projectSuccess');
    loadProjectsList();
  } catch (error) {
    console.error('Error saving project:', error);
    alert('Error saving project');
  }
}

async function loadProjectsList() {
  try {
    const snapshot = await db.collection('projects').get();
    adminState.projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = adminState.projects.map(project => `
      <div class="item-card">
        <div class="item-info">
          <h4>${project.title}</h4>
          <p>${project.category} • ${project.tools?.join(', ') || 'No tools'}</p>
        </div>
        <button class="delete-btn" onclick="deleteProject('${project.id}')">Delete</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}

async function deleteProject(projectId) {
  if (confirm('Are you sure you want to delete this project?')) {
    try {
      await db.collection('projects').doc(projectId).delete();
      loadProjectsList();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  }
}

// ===========================
// RESOURCES MANAGEMENT
// ===========================

function handleResourceFile(event) {
  adminState.resourceFile = event.target.files[0];
}

async function saveResource() {
  const type = document.getElementById('resourceType').value;
  const name = document.getElementById('resourceName').value;
  const description = document.getElementById('resourceDescription').value;
  
  if (!name || !description || !adminState.resourceFile) {
    alert('Please fill in all fields and select a file');
    return;
  }
  
  try {
    // Upload file
    const storageRef = storage.ref(`resources/${Date.now()}-${adminState.resourceFile.name}`);
    await storageRef.put(adminState.resourceFile);
    const url = await storageRef.getDownloadURL();
    
    // Add to Firestore
    await db.collection('resources').add({
      type,
      name,
      description,
      url,
      fileName: adminState.resourceFile.name,
      createdAt: new Date()
    });
    
    // Clear form
    document.getElementById('resourceType').value = 'pdf';
    document.getElementById('resourceName').value = '';
    document.getElementById('resourceDescription').value = '';
    document.getElementById('resourceFileInput').value = '';
    adminState.resourceFile = null;
    
    showSuccess('resourceSuccess');
    loadResourcesList();
  } catch (error) {
    console.error('Error saving resource:', error);
    alert('Error saving resource');
  }
}

async function loadResourcesList() {
  try {
    const snapshot = await db.collection('resources').get();
    adminState.resources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const resourcesList = document.getElementById('resourcesList');
    resourcesList.innerHTML = adminState.resources.map(resource => `
      <div class="item-card">
        <div class="item-info">
          <h4>${resource.name}</h4>
          <p>${resource.type} • ${resource.fileName}</p>
        </div>
        <button class="delete-btn" onclick="deleteResource('${resource.id}')">Delete</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading resources:', error);
  }
}

async function deleteResource(resourceId) {
  if (confirm('Are you sure you want to delete this resource?')) {
    try {
      await db.collection('resources').doc(resourceId).delete();
      loadResourcesList();
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Error deleting resource');
    }
  }
}

// ===========================
// LINKS MANAGEMENT
// ===========================

async function saveLink() {
  const title = document.getElementById('linkTitle').value;
  const url = document.getElementById('linkUrl').value;
  const description = document.getElementById('linkDescription').value;
  
  if (!title || !url) {
    alert('Please fill in all required fields');
    return;
  }
  
  try {
    await db.collection('resources').add({
      type: 'link',
      name: title,
      description,
      url,
      createdAt: new Date()
    });
    
    document.getElementById('linkTitle').value = '';
    document.getElementById('linkUrl').value = '';
    document.getElementById('linkDescription').value = '';
    
    showSuccess('linkSuccess');
    loadLinksList();
  } catch (error) {
    console.error('Error saving link:', error);
    alert('Error saving link');
  }
}

async function loadLinksList() {
  try {
    const snapshot = await db.collection('resources').where('type', '==', 'link').get();
    const links = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const linksList = document.getElementById('linksList');
    linksList.innerHTML = links.map(link => `
      <div class="item-card">
        <div class="item-info">
          <h4>${link.name}</h4>
          <p><a href="${link.url}" target="_blank">${link.url}</a></p>
        </div>
        <button class="delete-btn" onclick="deleteLink('${link.id}')">Delete</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading links:', error);
  }
}

async function deleteLink(linkId) {
  if (confirm('Are you sure you want to delete this link?')) {
    try {
      await db.collection('resources').doc(linkId).delete();
      loadLinksList();
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('Error deleting link');
    }
  }
}

// ===========================
// HELPERS
// ===========================

function showSuccess(elementId) {
  const successDiv = document.getElementById(elementId);
  successDiv.classList.add('show');
  setTimeout(() => {
    successDiv.classList.remove('show');
  }, 3000);
}

async function loadAllData() {
  try {
    // Load profile
    const profileDoc = await db.collection('profile').doc('main').get();
    if (profileDoc.exists) {
      adminState.profileData = profileDoc.data();
      document.getElementById('bio').value = adminState.profileData.bio || '';
      document.getElementById('email').value = adminState.profileData.email || '';
      document.getElementById('github').value = adminState.profileData.github || '';
    }
    
    // Load skills
    const skillsDoc = await db.collection('profile').doc('skills').get();
    if (skillsDoc.exists) {
      adminState.skills = skillsDoc.data().skills || [];
      document.getElementById('skillsInput').value = adminState.skills.join(', ');
    }
    
    // Load projects, resources, links
    loadProjectsList();
    loadResourcesList();
    loadLinksList();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}
