const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// DeepSeek API configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

/**
 * Cloud Function: Chat with AI
 * Receives a user question and returns an AI-generated response
 * based on the user's portfolio data
 */
exports.chat = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

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
