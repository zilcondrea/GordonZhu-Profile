const { db, storage } = window.firebaseServices || {};

const ADMIN_PASSWORD = '879189509';
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
  if (auth === 'true') {
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
    sessionStorage.setItem('adminAuth', 'true');
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
  adminState.isAuthenticated = false;
  closeAdmin();
}

function switchAdminTab(tabName, button) {
  document.querySelectorAll('.admin-tab').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(content => content.style.display = 'none');

  const tabId = ADMIN_TAB_IDS[tabName] || tabName;
  document.getElementById(tabId).style.display = 'block';
  if (button) {
    button.classList.add('active');
  }
}

function showAdminError(error, fallbackMessage) {
  console.error(fallbackMessage, error);
  alert(fallbackMessage + ': ' + (error.message || error));
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
    const storageRef = storage.ref('profile/avatar/' + Date.now() + '-' + file.name);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();

    adminState.profileData.avatarUrl = url;
    await db.collection('profile').doc('main').set({
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
    const storageRef = storage.ref('profile/resume/' + Date.now() + '-' + file.name);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();

    adminState.profileData.resumeUrl = url;
    adminState.profileData.resumeFileName = file.name;
    await db.collection('profile').doc('main').set({
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
    await db.collection('profile').doc('main').set({
      bio,
      email,
      github,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    showSuccess('profileSuccess');
    await refreshPublicContent();
  } catch (error) {
    showAdminError(error, '保存个人信息失败');
  }
}

async function saveSkills() {
  const skillsInput = document.getElementById('skillsInput').value;
  const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);

  try {
    await db.collection('profile').doc('skills').set({ skills });
    adminState.skills = skills;
    showSuccess('skillsSuccess');
    loadSkillsList();
    await refreshPublicContent();
  } catch (error) {
    showAdminError(error, '保存技能失败');
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
    let imageUrl = '';

    if (adminState.projectImageFile) {
      const storageRef = storage.ref('projects/' + Date.now() + '-' + adminState.projectImageFile.name);
      await storageRef.put(adminState.projectImageFile);
      imageUrl = await storageRef.getDownloadURL();
    }

    await db.collection('projects').add({
      title,
      description,
      category,
      tools,
      link,
      imageUrl,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
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
    showAdminError(error, '保存项目失败');
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
          <p>${project.category} · ${project.tools?.join(', ') || 'No tools'}</p>
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
    await db.collection('projects').doc(projectId).delete();
    loadProjectsList();
    await refreshPublicContent();
  } catch (error) {
    showAdminError(error, '删除项目失败');
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
    const storageRef = storage.ref('resources/' + Date.now() + '-' + adminState.resourceFile.name);
    await storageRef.put(adminState.resourceFile);
    const url = await storageRef.getDownloadURL();

    await db.collection('resources').add({
      type,
      name,
      description,
      url,
      fileName: adminState.resourceFile.name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById('resourceType').value = 'pdf';
    document.getElementById('resourceName').value = '';
    document.getElementById('resourceDescription').value = '';
    document.getElementById('resourceFileInput').value = '';
    adminState.resourceFile = null;

    showSuccess('resourceSuccess');
    loadResourcesList();
  } catch (error) {
    showAdminError(error, '保存资源失败');
  }
}

async function loadResourcesList() {
  try {
    const snapshot = await db.collection('resources').get();
    adminState.resources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const resourcesList = document.getElementById('resourcesList');
    if (resourcesList) {
      resourcesList.innerHTML = adminState.resources.map(resource => `
        <div class="item-card">
          <div class="item-info">
            <h4>${resource.name}</h4>
            <p>${resource.type} · ${resource.fileName || ''}</p>
          </div>
          <button class="delete-btn" onclick="deleteResource('${resource.id}')">Delete</button>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading resources:', error);
  }
}

async function deleteResource(resourceId) {
  if (!confirm('Are you sure you want to delete this resource?')) return;

  try {
    await db.collection('resources').doc(resourceId).delete();
    loadResourcesList();
  } catch (error) {
    showAdminError(error, '删除资源失败');
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
    await db.collection('resources').add({
      type: 'link',
      name: title,
      description,
      url,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById('linkTitle').value = '';
    document.getElementById('linkUrl').value = '';
    document.getElementById('linkDescription').value = '';

    showSuccess('linkSuccess');
    loadLinksList();
  } catch (error) {
    showAdminError(error, '保存链接失败');
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
  if (!confirm('Are you sure you want to delete this link?')) return;

  try {
    await db.collection('resources').doc(linkId).delete();
    loadLinksList();
  } catch (error) {
    showAdminError(error, '删除链接失败');
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
    const profileDoc = await db.collection('profile').doc('main').get();
    if (profileDoc.exists) {
      adminState.profileData = profileDoc.data();
      document.getElementById('bio').value = adminState.profileData.bio || '';
      document.getElementById('email').value = adminState.profileData.email || '';
      document.getElementById('github').value = adminState.profileData.github || '';

      if (adminState.profileData.avatarUrl) {
        document.getElementById('heroAvatar').src = adminState.profileData.avatarUrl;
        document.getElementById('aboutAvatar').src = adminState.profileData.avatarUrl;
      }
    }

    const skillsDoc = await db.collection('profile').doc('skills').get();
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
