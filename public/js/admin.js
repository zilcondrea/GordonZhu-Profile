const adminDb = window.firebaseServices?.db;

const ADMIN_PASSWORD = '879189509';
const ADMIN_API_URL = 'https://us-central1-guoxuan-portfolio.cloudfunctions.net/adminAction';
const ADMIN_TAB_IDS = {
  profile: 'adminProfile',
  projects: 'adminProjects',
  resources: 'adminResources',
  links: 'adminLinks'
};

const adminState = {
  isAuthenticated: false,
  projects: [],
  resources: [],
  skills: [],
  profileData: {},
  projectImageFile: null,
  resourceFile: null
};

document.addEventListener('DOMContentLoaded', () => {
  const auth = sessionStorage.getItem('adminAuth');
  const password = sessionStorage.getItem('adminPassword');
  if (auth === 'true' && password) {
    adminState.isAuthenticated = true;
  }

  const adminOverlay = document.getElementById('adminOverlay');
  adminOverlay?.addEventListener('click', (e) => {
    if (e.target.id === 'adminOverlay') {
      closeAdmin();
    }
  });
});

function openAdmin() {
  document.getElementById('adminOverlay')?.classList.add('show');

  if (adminState.isAuthenticated) {
    showAdminPanel();
  } else {
    showAdminLogin();
  }
}

function closeAdmin() {
  document.getElementById('adminOverlay')?.classList.remove('show');
}

function showAdminLogin() {
  document.getElementById('adminLogin').style.display = 'block';
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('loginError').classList.remove('show');
}

function showAdminPanel() {
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  switchAdminTab('profile', document.querySelector('.admin-tab[data-tab="profile"]'));
  loadAllData();
}

function handleLogin(event) {
  event.preventDefault();
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');

  if (password === ADMIN_PASSWORD) {
    if (!ensureFirebaseReady(errorDiv)) return;

    sessionStorage.setItem('adminAuth', 'true');
    sessionStorage.setItem('adminPassword', password);
    adminState.isAuthenticated = true;
    errorDiv.classList.remove('show');
    showAdminPanel();
  } else {
    errorDiv.textContent = '密码错误，请重试。';
    errorDiv.classList.add('show');
  }
}

function logout() {
  sessionStorage.removeItem('adminAuth');
  sessionStorage.removeItem('adminPassword');
  adminState.isAuthenticated = false;
  closeAdmin();
}

function switchAdminTab(tabName, button) {
  document.querySelectorAll('.admin-tab').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(content => content.style.display = 'none');

  document.getElementById(ADMIN_TAB_IDS[tabName]).style.display = 'block';
  if (button) {
    button.classList.add('active');
  }
}

function ensureFirebaseReady(errorDiv) {
  if (adminDb) return true;

  const message = 'Firebase 没有初始化成功，请检查 firebase-config.js 和网络连接。';
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
  } else {
    alert(message);
  }
  return false;
}

function getAdminPassword() {
  return sessionStorage.getItem('adminPassword') || document.getElementById('password')?.value || '';
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

async function adminAction(action, payload = {}) {
  const response = await fetch(ADMIN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      password: getAdminPassword(),
      action,
      payload
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `Admin action failed (${response.status})`);
  }
  return data;
}

function showAdminError(error, fallbackMessage) {
  console.error(fallbackMessage, error);
  alert(`${fallbackMessage}: ${error.message || error}`);
}

async function refreshPublicContent() {
  if (typeof loadProfileData === 'function') await loadProfileData();
  if (typeof loadSkills === 'function') await loadSkills();
  if (typeof loadProjects === 'function') await loadProjects();
  if (typeof loadResources === 'function') await loadResources();
  if (typeof updateStats === 'function') updateStats();
}

async function uploadAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const storageRef = firebase.storage().ref('profile/avatar/' + Date.now() + '-' + file.name);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();

    adminState.profileData.avatarUrl = url;
    await adminDb.collection('profile').doc('main').set({
      avatarUrl: url,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    document.getElementById('heroAvatar').src = url;
    document.getElementById('aboutAvatar').src = url;
    await refreshPublicContent();
    alert('头像上传成功！');
  } catch (error) {
    showAdminError(error, '上传头像失败');
  }
}

async function uploadResume(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const storageRef = firebase.storage().ref('profile/resume/' + Date.now() + '-' + file.name);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();

    adminState.profileData.resumeUrl = url;
    adminState.profileData.resumeFileName = file.name;
    await adminDb.collection('profile').doc('main').set({
      resumeUrl: url,
      resumeFileName: file.name,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    await refreshPublicContent();
    alert('简历上传成功！');
  } catch (error) {
    showAdminError(error, '上传简历失败');
  }
}

async function saveProfile() {
  const bio = document.getElementById('bio').value;
  const email = document.getElementById('email').value;
  const github = document.getElementById('github').value;

  try {
    if (!ensureFirebaseReady()) return;

    await adminAction('saveProfile', {
      bio,
      email,
      github
    });

    showSuccess('profileSuccess');
    await refreshPublicContent();
  } catch (error) {
    showAdminError(error, 'Error saving profile');
  }
}

async function saveSkills() {
  const skillsInput = document.getElementById('skillsInput').value;
  const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);

  try {
    if (!ensureFirebaseReady()) return;

    await adminAction('saveSkills', { skills });
    adminState.skills = skills;
    showSuccess('skillsSuccess');
    loadSkillsList();
    await refreshPublicContent();
  } catch (error) {
    showAdminError(error, 'Error saving skills');
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
  if (!ensureFirebaseReady()) return;

  const result = await adminAction('deleteSkill', { index });
  adminState.skills = result.skills || adminState.skills.filter((_, skillIndex) => skillIndex !== index);
  loadSkillsList();
  await refreshPublicContent();
}

function handleProjectImage(event) {
  adminState.projectImageFile = event.target.files[0];
}

async function saveProject() {
  const title = document.getElementById('projectTitle').value;
  const description = document.getElementById('projectDescription').value;
  const category = document.getElementById('projectCategory').value;
  const tools = document.getElementById('projectTools').value.split(',').map(t => t.trim()).filter(Boolean);
  const link = document.getElementById('projectLink').value;

  if (!title || !description) {
    alert('Please fill in all required fields');
    return;
  }

  try {
    if (!ensureFirebaseReady()) return;

    let imageDataUrl = '';
    let imageFileName = '';
    if (adminState.projectImageFile) {
      imageDataUrl = await fileToDataUrl(adminState.projectImageFile);
      imageFileName = adminState.projectImageFile.name;
    }

    await adminAction('saveProject', {
      title,
      description,
      category,
      tools,
      link,
      imageDataUrl,
      imageFileName
    });

    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectCategory').value = '';
    document.getElementById('projectTools').value = '';
    document.getElementById('projectLink').value = '';
    document.getElementById('projectImageInput').value = '';
    adminState.projectImageFile = null;

    showSuccess('projectSuccess');
    loadProjectsList();
    await refreshPublicContent();
  } catch (error) {
    showAdminError(error, 'Error saving project');
  }
}

async function loadProjectsList() {
  try {
    const snapshot = await adminDb.collection('projects').get();
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
  if (!confirm('Are you sure you want to delete this project?')) return;

  try {
    if (!ensureFirebaseReady()) return;

    await adminAction('deleteProject', { id: projectId });
    loadProjectsList();
    await refreshPublicContent();
  } catch (error) {
    showAdminError(error, 'Error deleting project');
  }
}

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
    if (!ensureFirebaseReady()) return;

    const dataUrl = await fileToDataUrl(adminState.resourceFile);
    await adminAction('saveResource', {
      type,
      name,
      description,
      fileName: adminState.resourceFile.name,
      dataUrl
    });

    document.getElementById('resourceType').value = 'pdf';
    document.getElementById('resourceName').value = '';
    document.getElementById('resourceDescription').value = '';
    document.getElementById('resourceFileInput').value = '';
    adminState.resourceFile = null;

    showSuccess('resourceSuccess');
    loadResourcesList();
    await refreshPublicContent();
  } catch (error) {
    showAdminError(error, 'Error saving resource');
  }
}

async function loadResourcesList() {
  try {
    const snapshot = await adminDb.collection('resources').get();
    adminState.resources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const resourcesList = document.getElementById('adminResourcesList');
    resourcesList.innerHTML = adminState.resources.map(resource => `
      <div class="item-card">
        <div class="item-info">
          <h4>${resource.name}</h4>
          <p>${resource.type} • ${resource.fileName || ''}</p>
        </div>
        <button class="delete-btn" onclick="deleteResource('${resource.id}')">Delete</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading resources:', error);
  }
}

async function deleteResource(resourceId) {
  if (!confirm('Are you sure you want to delete this resource?')) return;

  try {
    if (!ensureFirebaseReady()) return;

    await adminAction('deleteResource', { id: resourceId });
    loadResourcesList();
    await refreshPublicContent();
  } catch (error) {
    showAdminError(error, 'Error deleting resource');
  }
}

async function saveLink() {
  const title = document.getElementById('linkTitle').value;
  const url = document.getElementById('linkUrl').value;
  const description = document.getElementById('linkDescription').value;

  if (!title || !url) {
    alert('Please fill in all required fields');
    return;
  }

  try {
    if (!ensureFirebaseReady()) return;

    await adminAction('saveLink', {
      title,
      description,
      url
    });

    document.getElementById('linkTitle').value = '';
    document.getElementById('linkUrl').value = '';
    document.getElementById('linkDescription').value = '';

    showSuccess('linkSuccess');
    loadLinksList();
    await refreshPublicContent();
  } catch (error) {
    showAdminError(error, 'Error saving link');
  }
}

async function loadLinksList() {
  try {
    const snapshot = await adminDb.collection('resources').where('type', '==', 'link').get();
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
  if (!confirm('Are you sure you want to delete this link?')) return;

  try {
    if (!ensureFirebaseReady()) return;

    await adminAction('deleteResource', { id: linkId });
    loadLinksList();
    await refreshPublicContent();
  } catch (error) {
    showAdminError(error, 'Error deleting link');
  }
}

function showSuccess(elementId) {
  const successDiv = document.getElementById(elementId);
  successDiv.classList.add('show');
  setTimeout(() => {
    successDiv.classList.remove('show');
  }, 3000);
}

async function loadAllData() {
  try {
    if (!ensureFirebaseReady()) return;

    const profileDoc = await adminDb.collection('profile').doc('main').get();
    if (profileDoc.exists) {
      adminState.profileData = profileDoc.data();
      document.getElementById('bio').value = adminState.profileData.bio || '';
      document.getElementById('email').value = adminState.profileData.email || '';
      document.getElementById('github').value = adminState.profileData.github || '';
    }

    const skillsDoc = await adminDb.collection('profile').doc('skills').get();
    if (skillsDoc.exists) {
      adminState.skills = skillsDoc.data().skills || [];
      document.getElementById('skillsInput').value = adminState.skills.join(', ');
      loadSkillsList();
    }

    loadProjectsList();
    loadResourcesList();
    loadLinksList();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

window.openAdmin = openAdmin;
window.closeAdmin = closeAdmin;
window.handleLogin = handleLogin;
window.logout = logout;
window.switchAdminTab = switchAdminTab;
window.uploadAvatar = uploadAvatar;
window.uploadResume = uploadResume;
window.saveProfile = saveProfile;
window.saveSkills = saveSkills;
window.deleteSkill = deleteSkill;
window.handleProjectImage = handleProjectImage;
window.saveProject = saveProject;
window.deleteProject = deleteProject;
window.handleResourceFile = handleResourceFile;
window.saveResource = saveResource;
window.deleteResource = deleteResource;
window.saveLink = saveLink;
window.deleteLink = deleteLink;
