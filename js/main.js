// ===========================
// MAIN APPLICATION LOGIC
// ===========================

const { db, storage } = window.firebaseServices;

// State management
const state = {
  projects: [],
  resources: [],
  skills: [],
  profileData: {},
  currentFilter: 'all',
  isChatOpen: false
};

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing app...');
  
  // Setup event listeners
  setupEventListeners();
  
  // Load data from Firestore
  await loadProfileData();
  await loadProjects();
  await loadResources();
  await loadSkills();
  
  // Update stats
  updateStats();
  
  console.log('App initialized');
});

// ===========================
// EVENT LISTENERS
// ===========================

function setupEventListeners() {
  // Mobile menu toggle
  const navToggle = document.getElementById('navToggle');
  navToggle?.addEventListener('click', toggleMobileMenu);
  
  // Close mobile menu on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelector('.nav-menu')?.classList.remove('show');
    });
  });
  
  // Project filter
  document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      state.currentFilter = e.target.dataset.filter;
      renderProjects();
    });
  });
  
  // Resource tabs
  document.querySelectorAll('.resource-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.resource-tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      renderResources(e.target.dataset.type);
    });
  });
  
  // Resume button
  document.getElementById('resumeBtn')?.addEventListener('click', () => {
    showResumeModal();
  });
  
  document.getElementById('downloadResumeBtn')?.addEventListener('click', () => {
    downloadResume();
  });
  
  // Close modals on outside click
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('show');
    }
  });
}

function toggleMobileMenu() {
  const navMenu = document.querySelector('.nav-menu');
  navMenu?.classList.toggle('show');
}

// ===========================
// DATA LOADING
// ===========================

async function loadProfileData() {
  try {
    const doc = await db.collection('profile').doc('main').get();
    if (doc.exists) {
      state.profileData = doc.data();
      updateProfileUI();
    } else {
      console.log('No profile data found');
    }
  } catch (error) {
    console.error('Error loading profile data:', error);
  }
}

async function loadProjects() {
  try {
    const snapshot = await db.collection('projects').get();
    state.projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderProjects();
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}

async function loadResources() {
  try {
    const snapshot = await db.collection('resources').get();
    state.resources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderResources('pdf');
  } catch (error) {
    console.error('Error loading resources:', error);
  }
}

async function loadSkills() {
  try {
    const doc = await db.collection('profile').doc('skills').get();
    if (doc.exists) {
      state.skills = doc.data().skills || [];
      renderSkills();
    }
  } catch (error) {
    console.error('Error loading skills:', error);
  }
}

// ===========================
// UI UPDATES
// ===========================

function updateProfileUI() {
  const profile = state.profileData;
  
  if (profile.avatarUrl) {
    document.getElementById('heroAvatar').src = profile.avatarUrl;
    document.getElementById('aboutAvatar').src = profile.avatarUrl;
  }
  
  if (profile.bio) {
    document.getElementById('aboutBio').textContent = profile.bio;
  }
  
  if (profile.email) {
    document.getElementById('contactEmail').href = `mailto:${profile.email}`;
    document.getElementById('contactEmail').textContent = profile.email;
  }
}

function renderProjects() {
  const projectsGrid = document.getElementById('projectsGrid');
  const filtered = state.currentFilter === 'all' 
    ? state.projects 
    : state.projects.filter(p => p.category === state.currentFilter);
  
  projectsGrid.innerHTML = filtered.map(project => `
    <div class="project-card" onclick="showProjectDetails('${project.id}')">
      ${project.imageUrl ? `<img src="${project.imageUrl}" alt="${project.title}" class="project-image">` : '<div class="project-image" style="background: linear-gradient(135deg, #1B2A4A, #2E86DE);"></div>'}
      <div class="project-content">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description.substring(0, 100)}...</p>
        <div class="project-tags">
          ${project.tools?.map(tool => `<span class="project-tag">${tool}</span>`).join('') || ''}
        </div>
      </div>
    </div>
  `).join('');
  
  // Add filter tags if they don't exist
  const filterTags = document.getElementById('filterTags');
  const categories = [...new Set(state.projects.map(p => p.category))];
  if (filterTags.children.length === 1) {
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-tag';
      btn.dataset.filter = cat;
      btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        state.currentFilter = cat;
        renderProjects();
      });
      filterTags.appendChild(btn);
    });
  }
}

function renderResources(type = 'pdf') {
  const resourcesList = document.getElementById('resourcesList');
  const filtered = state.resources.filter(r => r.type === type);
  
  if (filtered.length === 0) {
    resourcesList.innerHTML = '<p style="text-align: center; color: var(--color-text-light);">No resources available</p>';
    return;
  }
  
  resourcesList.innerHTML = filtered.map(resource => {
    const icons = {
      pdf: '📄',
      excel: '📊',
      ppt: '🎯',
      image: '🖼️',
      powerbi: '📈',
      link: '🔗'
    };
    
    return `
      <div class="resource-item">
        <div class="resource-icon">${icons[type]}</div>
        <div class="resource-info">
          <div class="resource-name">${resource.name}</div>
          <div class="resource-description">${resource.description}</div>
        </div>
        <div class="resource-actions">
          ${type === 'link' 
            ? `<a href="${resource.url}" target="_blank" class="resource-action-btn">Open</a>`
            : `<button class="resource-action-btn" onclick="previewFile('${resource.id}', '${type}')">Preview</button>
               <button class="resource-action-btn" onclick="downloadFile('${resource.id}')">Download</button>`
          }
        </div>
      </div>
    `;
  }).join('');
}

function renderSkills() {
  const skillsContainer = document.getElementById('skillsContainer');
  skillsContainer.innerHTML = state.skills.map(skill => 
    `<span class="skill-tag">${skill}</span>`
  ).join('');
}

function updateStats() {
  document.getElementById('projectCount').textContent = state.projects.length;
  document.getElementById('skillCount').textContent = state.skills.length;
  document.getElementById('resourceCount').textContent = state.resources.length;
}

// ===========================
// MODALS & PREVIEWS
// ===========================

function showProjectDetails(projectId) {
  const project = state.projects.find(p => p.id === projectId);
  if (!project) return;
  
  const projectDetails = document.getElementById('projectDetails');
  projectDetails.innerHTML = `
    <h2>${project.title}</h2>
    ${project.imageUrl ? `<img src="${project.imageUrl}" alt="${project.title}" style="width: 100%; border-radius: 12px; margin: 1rem 0;">` : ''}
    <p>${project.description}</p>
    
    <h3 style="margin-top: 2rem; margin-bottom: 1rem;">Tools & Technologies</h3>
    <div class="project-tags">
      ${project.tools?.map(tool => `<span class="project-tag">${tool}</span>`).join('') || '<span class="project-tag">Not specified</span>'}
    </div>
    
    ${project.link ? `
      <div style="margin-top: 2rem;">
        <a href="${project.link}" target="_blank" class="btn btn-primary">View Project →</a>
      </div>
    ` : ''}
  `;
  
  const modal = document.getElementById('projectModal');
  modal.classList.add('show');
}

async function showResumeModal() {
  const resumePreview = document.getElementById('resumePreview');
  
  if (state.profileData.resumeUrl) {
    resumePreview.innerHTML = `
      <iframe src="${state.profileData.resumeUrl}#toolbar=0" 
              style="width: 100%; height: 600px; border: none; border-radius: 12px;"
              title="Resume">
      </iframe>
    `;
  } else {
    resumePreview.innerHTML = '<p>Resume not available</p>';
  }
  
  const modal = document.getElementById('resumeModal');
  modal.classList.add('show');
}

async function previewFile(fileId, type) {
  const resource = state.resources.find(r => r.id === fileId);
  if (!resource) return;
  
  const filePreview = document.getElementById('filePreview');
  
  try {
    if (type === 'pdf') {
      filePreview.innerHTML = `
        <iframe src="${resource.url}#toolbar=0" 
                style="width: 100%; height: 600px; border: none; border-radius: 12px;"
                title="${resource.name}">
        </iframe>
      `;
    } else if (type === 'powerbi') {
      filePreview.innerHTML = `
        <iframe src="${resource.embedUrl}" 
                style="width: 100%; height: 600px; border: none; border-radius: 12px;"
                title="${resource.name}">
        </iframe>
      `;
    } else {
      filePreview.innerHTML = `<p>Preview not available for this file type</p>`;
    }
    
    const modal = document.getElementById('fileModal');
    modal.classList.add('show');
  } catch (error) {
    console.error('Error previewing file:', error);
  }
}

async function downloadFile(fileId) {
  const resource = state.resources.find(r => r.id === fileId);
  if (!resource) return;
  
  try {
    const link = document.createElement('a');
    link.href = resource.url;
    link.download = resource.name;
    link.click();
  } catch (error) {
    console.error('Error downloading file:', error);
  }
}

async function downloadResume() {
  if (state.profileData.resumeUrl) {
    const link = document.createElement('a');
    link.href = state.profileData.resumeUrl;
    link.download = 'Guoxuan_Zhu_Resume.pdf';
    link.click();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('show');
}

// ===========================
// SCROLL ANIMATIONS
// ===========================

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
  });
});
