const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const crypto = require('crypto');

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
const bucket = admin.storage().bucket('guoxuan-portfolio.firebasestorage.app');

// DeepSeek API configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const ADMIN_PASSWORD = '879189509';

function setCors(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

function requirePost(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return false;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return false;
  }

  if (!req.body || req.body.password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Invalid admin password' });
    return false;
  }

  return true;
}

function sanitizeFileName(fileName) {
  return String(fileName || 'upload')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

function parseDataUrl(dataUrl) {
  const match = /^data:([^;,]+)?(?:;[^,]*)?;base64,(.+)$/.exec(dataUrl || '');
  if (!match) {
    throw new Error('Invalid file payload');
  }

  return {
    contentType: match[1] || 'application/octet-stream',
    buffer: Buffer.from(match[2], 'base64')
  };
}

async function uploadDataUrl({ folder, fileName, dataUrl, maxBytes }) {
  const { contentType, buffer } = parseDataUrl(dataUrl);
  if (buffer.length > maxBytes) {
    throw new Error(`File is too large. Maximum size is ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  }

  const token = crypto.randomUUID();
  const safeName = sanitizeFileName(fileName);
  const path = `${folder}/${Date.now()}-${safeName}`;
  const file = bucket.file(path);

  await file.save(buffer, {
    contentType,
    resumable: false,
    metadata: {
      cacheControl: 'public,max-age=3600',
      metadata: {
        firebaseStorageDownloadTokens: token
      }
    }
  });

  const encodedPath = encodeURIComponent(path);
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;

  return {
    url,
    path,
    fileName: safeName,
    contentType,
    size: buffer.length
  };
}

exports.adminAction = functions
  .runWith({ memory: '512MB', timeoutSeconds: 60 })
  .https.onRequest(async (req, res) => {
    if (!requirePost(req, res)) return;

    try {
      const { action, payload = {} } = req.body;

      if (action === 'uploadAvatar') {
        const uploaded = await uploadDataUrl({
          folder: 'profile/avatar',
          fileName: payload.fileName,
          dataUrl: payload.dataUrl,
          maxBytes: 5 * 1024 * 1024
        });
        await db.collection('profile').doc('main').set({
          avatarUrl: uploaded.url,
          avatarPath: uploaded.path,
          avatarFileName: uploaded.fileName,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        res.json({ ok: true, uploaded });
        return;
      }

      if (action === 'uploadResume') {
        const uploaded = await uploadDataUrl({
          folder: 'profile/resume',
          fileName: payload.fileName,
          dataUrl: payload.dataUrl,
          maxBytes: 10 * 1024 * 1024
        });
        await db.collection('profile').doc('main').set({
          resumeUrl: uploaded.url,
          resumePath: uploaded.path,
          resumeFileName: uploaded.fileName,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        res.json({ ok: true, uploaded });
        return;
      }

      if (action === 'saveProfile') {
        await db.collection('profile').doc('main').set({
          bio: payload.bio || '',
          email: payload.email || '',
          github: payload.github || '',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        res.json({ ok: true });
        return;
      }

      if (action === 'saveSkills') {
        await db.collection('profile').doc('skills').set({
          skills: Array.isArray(payload.skills) ? payload.skills : [],
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ ok: true });
        return;
      }

      if (action === 'deleteSkill') {
        const skillsDoc = await db.collection('profile').doc('skills').get();
        const skills = skillsDoc.exists ? (skillsDoc.data().skills || []) : [];
        skills.splice(Number(payload.index), 1);
        await db.collection('profile').doc('skills').set({ skills });
        res.json({ ok: true, skills });
        return;
      }

      if (action === 'saveProject') {
        let imageUrl = '';
        if (payload.imageDataUrl) {
          const uploaded = await uploadDataUrl({
            folder: 'projects',
            fileName: payload.imageFileName,
            dataUrl: payload.imageDataUrl,
            maxBytes: 5 * 1024 * 1024
          });
          imageUrl = uploaded.url;
        }

        const docRef = await db.collection('projects').add({
          title: payload.title || '',
          description: payload.description || '',
          category: payload.category || '',
          tools: Array.isArray(payload.tools) ? payload.tools : [],
          link: payload.link || '',
          imageUrl,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ ok: true, id: docRef.id });
        return;
      }

      if (action === 'deleteProject') {
        await db.collection('projects').doc(payload.id).delete();
        res.json({ ok: true });
        return;
      }

      if (action === 'saveResource') {
        const uploaded = await uploadDataUrl({
          folder: 'resources',
          fileName: payload.fileName,
          dataUrl: payload.dataUrl,
          maxBytes: 10 * 1024 * 1024
        });

        const docRef = await db.collection('resources').add({
          type: payload.type || 'pdf',
          name: payload.name || uploaded.fileName,
          description: payload.description || '',
          url: uploaded.url,
          storagePath: uploaded.path,
          fileName: uploaded.fileName,
          contentType: uploaded.contentType,
          size: uploaded.size,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ ok: true, id: docRef.id, uploaded });
        return;
      }

      if (action === 'deleteResource') {
        await db.collection('resources').doc(payload.id).delete();
        res.json({ ok: true });
        return;
      }

      if (action === 'saveLink') {
        const docRef = await db.collection('resources').add({
          type: 'link',
          name: payload.title || '',
          description: payload.description || '',
          url: payload.url || '',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ ok: true, id: docRef.id });
        return;
      }

      res.status(400).json({ error: 'Unknown admin action' });
    } catch (error) {
      console.error('Error in adminAction:', error);
      res.status(500).json({
        error: error.message || 'Admin action failed'
      });
    }
  });

/**
 * Cloud Function: Chat with AI
 * Receives a user question and returns an AI-generated response
 * based on the user's portfolio data
 */
exports.chat = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Retrieve relevant context from Firestore
    const context = await retrieveContext(message);

    // Build conversation history for the API
    const messages = [];
    
    // System message
    messages.push({
      role: 'system',
      content: `You are an AI assistant for Guoxuan Zhu's professional portfolio. 
Answer questions about his background, projects, skills, and uploaded documents. 
Be professional, helpful, and concise. 
Here is relevant information from the portfolio:

${context}`
    });

    // Add conversation history if provided
    if (Array.isArray(conversationHistory)) {
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    // Call DeepSeek API
    const response = await callDeepSeekAPI(messages);

    res.json({
      response: response
    });

  } catch (error) {
    console.error('Error in chat function:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/**
 * Retrieve relevant context from Firestore based on the user's question
 */
async function retrieveContext(question) {
  try {
    const lowerQuestion = question.toLowerCase();
    let context = '';

    // Get profile information
    const profileDoc = await db.collection('profile').doc('main').get();
    if (profileDoc.exists) {
      const profile = profileDoc.data();
      if (profile.bio) context += `Bio: ${profile.bio}\n`;
      if (profile.email) context += `Email: ${profile.email}\n`;
    }

    // Get skills
    const skillsDoc = await db.collection('profile').doc('skills').get();
    if (skillsDoc.exists) {
      const skills = skillsDoc.data().skills || [];
      context += `Skills: ${skills.join(', ')}\n`;
    }

    // Get relevant projects
    const projectsSnapshot = await db.collection('projects').limit(5).get();
    if (!projectsSnapshot.empty) {
      context += '\nProjects:\n';
      projectsSnapshot.forEach(doc => {
        const project = doc.data();
        context += `- ${project.title}: ${project.description}\n`;
      });
    }

    // Get relevant resources
    const resourcesSnapshot = await db.collection('resources').limit(5).get();
    if (!resourcesSnapshot.empty) {
      context += '\nResources:\n';
      resourcesSnapshot.forEach(doc => {
        const resource = doc.data();
        if (resource.type !== 'link') {
          context += `- ${resource.name} (${resource.type}): ${resource.description}\n`;
        }
      });
    }

    return context;
  } catch (error) {
    console.error('Error retrieving context:', error);
    return '';
  }
}

/**
 * Call DeepSeek API with the given messages
 */
async function callDeepSeekAPI(messages) {
  try {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY environment variable not set');
    }

    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.95
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('No response from DeepSeek API');
    }
  } catch (error) {
    console.error('Error calling DeepSeek API:', error.message);
    throw error;
  }
}

/**
 * Health check function
 */
exports.health = functions.https.onRequest((req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
