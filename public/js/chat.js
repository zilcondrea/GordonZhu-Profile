// ===========================
// CHAT FUNCTIONALITY
// ===========================

const chatState = {
  isOpen: false,
  messages: [],
  isLoading: false
};

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
  setupChatListeners();
});

function setupChatListeners() {
  const chatBubble = document.getElementById('chatBubble');
  chatBubble?.addEventListener('click', toggleChat);
  
  const chatInput = document.getElementById('chatInput');
  chatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });
}

function toggleChat() {
  chatState.isOpen = !chatState.isOpen;
  const chatWindow = document.getElementById('chatWindow');
  
  if (chatState.isOpen) {
    chatWindow.classList.add('show');
  } else {
    chatWindow.classList.remove('show');
  }
}

async function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  const message = chatInput.value.trim();
  
  if (!message || chatState.isLoading) return;
  
  // Add user message
  addChatMessage(message, 'user');
  chatInput.value = '';
  
  // Show loading state
  chatState.isLoading = true;
  addChatMessage('Thinking...', 'assistant');
  
  try {
    // Call Cloud Function to get AI response
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        conversationHistory: chatState.messages
      })
    });
    
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    // Remove loading message and add actual response
    removeLastMessage();
    addChatMessage(data.response, 'assistant');
    
  } catch (error) {
    console.error('Error:', error);
    removeLastMessage();
    addChatMessage('Sorry, I encountered an error. Please try again.', 'assistant');
  } finally {
    chatState.isLoading = false;
  }
}

function addChatMessage(content, sender) {
  const chatMessages = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}`;
  messageDiv.innerHTML = `<div class="chat-message-content">${escapeHtml(content)}</div>`;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  chatState.messages.push({ role: sender === 'user' ? 'user' : 'assistant', content });
}

function removeLastMessage() {
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages.lastChild) {
    chatMessages.removeChild(chatMessages.lastChild);
    if (chatState.messages.length > 0) {
      chatState.messages.pop();
    }
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function handleChatKeypress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendChatMessage();
  }
}
