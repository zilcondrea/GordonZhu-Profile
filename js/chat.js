// ===========================
// AI CHAT — DeepSeek Powered
// ===========================

const chatState = {
  isOpen: false,
  messages: [],
  isLoading: false,
  profileContext: null
};

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('chatBubble')?.addEventListener('click', toggleChat);
  document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
  });
});

async function toggleChat() {
  chatState.isOpen = !chatState.isOpen;
  const w = document.getElementById('chatWindow');
  if (chatState.isOpen) {
    w.classList.add('show');
    if (!chatState.profileContext) await loadChatContext();
  } else {
    w.classList.remove('show');
  }
}

async function loadChatContext() {
  try {
    const db = window.firebaseServices?.db;
    if (!db) return;
    const [prof, skills, proj, res, sets] = await Promise.all([
      db.collection('profile').doc('main').get(),
      db.collection('profile').doc('skills').get(),
      db.collection('projects').get(),
      db.collection('resources').get(),
      db.collection('settings').doc('api').get()
    ]);
    const p = prof.exists ? prof.data() : {};
    chatState.profileContext = {
      apiKey: sets.exists ? (sets.data().deepseekKey || '') : '',
      name: 'Guoxuan (Gordon) Zhu',
      headline: "Tulane Master of Management in Energy Candidate '26 | LSU B.S. International Trade & Finance '21",
      bio: p.bio || '',
      email: p.email || '',
      skills: skills.exists ? (skills.data().skills || []) : [],
      projects: proj.docs.map(d => d.data()),
      resources: res.docs.map(d => d.data())
    };
  } catch (e) { console.error('Chat context load failed:', e); }
}

function buildSystemPrompt() {
  var c = chatState.profileContext; if (!c) return '';
  return "You are an AI assistant on Gordon (Guoxuan) Zhu's portfolio site. Answer visitor questions about Gordon.\n\n" +
    "--- GORDON'S PROFILE ---\n" +
    "Name: " + c.name + "\nHeadline: " + c.headline + "\nBio: " + c.bio + "\nEmail: " + c.email + "\n\n" +
    "SKILLS: " + (c.skills.join(', ') || 'None listed') + "\n\n" +
    "PROJECTS:\n" + c.projects.map(function(p) { return '- ' + p.title + ' (' + (p.category||'') + '): ' + p.description + ' | Tools: ' + (p.tools||[]).join(', '); }).join('\n') + "\n\n" +
    "RESOURCES:\n" + c.resources.map(function(r) { return '- ' + r.name + ' (' + r.type + '): ' + (r.description||''); }).join('\n') + "\n\n" +
    "RULES: Only answer about Gordon. Use visitor's language. Keep under 200 words unless asked for detail. Be friendly and professional.";
}

async function sendChatMessage() {
  var input = document.getElementById('chatInput');
  var msg = input.value.trim();
  if (!msg || chatState.isLoading) return;
  addChatMessage(msg, 'user'); input.value = '';
  chatState.isLoading = true; addChatMessage('Thinking...', 'assistant');

  try {
    var key = chatState.profileContext?.apiKey;
    if (!key) { removeLastMessage(); addChatMessage('AI chat not configured. Add your DeepSeek API key in Admin panel.', 'assistant'); chatState.isLoading=false; return; }

    var history = chatState.messages.filter(function(m) { return m.role !== 'system' && m.content !== 'Thinking...'; }).slice(-10).map(function(m) { return {role:m.role,content:m.content}; });

    var resp = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+key },
      body: JSON.stringify({ model:'deepseek-chat', messages: [{role:'system',content:buildSystemPrompt()}].concat(history), max_tokens:500, temperature:0.7 })
    });
    removeLastMessage();
    if (!resp.ok) { var ed = await resp.json().catch(function(){return{};}); throw new Error(ed.error?.message || 'API error '+resp.status); }
    var data = await resp.json();
    addChatMessage(data.choices?.[0]?.message?.content || 'No response generated.', 'assistant');
  } catch (e) {
    console.error('Chat error:', e); removeLastMessage();
    addChatMessage('Sorry, something went wrong. Please try again.', 'assistant');
  } finally { chatState.isLoading = false; }
}

function addChatMessage(c, s) {
  var box = document.getElementById('chatMessages');
  var d = document.createElement('div'); d.className = 'chat-message '+s;
  d.innerHTML = '<div class="chat-message-content">'+escapeHtml(c)+'</div>';
  box.appendChild(d); box.scrollTop = box.scrollHeight;
  chatState.messages.push({role: s==='user'?'user':'assistant', content:c});
}
function removeLastMessage() {
  var box = document.getElementById('chatMessages');
  if (box.lastChild) { box.removeChild(box.lastChild); if (chatState.messages.length) chatState.messages.pop(); }
}
function escapeHtml(t) { var d=document.createElement('div'); d.textContent=t; return d.innerHTML; }
function handleChatKeypress(e) { if (e.key==='Enter'&&!e.shiftKey) { e.preventDefault(); sendChatMessage(); } }
