const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Load chat history or show greeting
let messages = JSON.parse(localStorage.getItem("chatHistory")) || [];

if (messages.length === 0) {
  messages.push({ sender: 'ai', text: "👋 Hi! I'm your meal planner assistant. What ingredients do you have today?" });
  localStorage.setItem("chatHistory", JSON.stringify(messages));
}

renderMessages();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userMsg = input.value.trim();
  if (!userMsg) return;

  appendMessage('user', userMsg);
  input.value = '';

  // Typing indicator
  appendMessage('ai', '<em>Cooking...</em>');

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg })
    });

    const data = await response.json();

    // Remove "Typing..." message
    messages.pop();

    const formattedReply = formatReply(data.reply);
    appendMessage('ai', formattedReply);

  } catch (error) {
    console.error("Error getting AI response:", error);
    messages.pop();
    appendMessage('ai', "⚠️ Sorry, something went wrong.");
  }
});

function appendMessage(sender, text) {
  messages.push({ sender, text });
  localStorage.setItem("chatHistory", JSON.stringify(messages));
  renderMessages();
}

function renderMessages() {
  chatBox.innerHTML = '';
  messages.forEach(({ sender, text }) => {
    const bubble = document.createElement('div');
    bubble.className = sender === 'user' ? 'chat-bubble user' : 'chat-bubble ai';
    bubble.innerHTML = text;
    chatBox.appendChild(bubble);
  });

  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: 'smooth'
  });
}

function formatReply(text) {
  return text
    .replace(/(?:\r\n|\r|\n){2,}/g, '<br><br>')                     // Paragraphs
    .replace(/(?:\r\n|\r|\n)/g, '<br>')                             // Line breaks
    .replace(/###\s?\*\*(.*?)\*\*/g, '<h3>$1</h3>')                 // ### **Heading**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')              // Bold
    .replace(/^\s*[-*]\s+/gm, '<li>')                               // Bullet start
    .replace(/<li>(.*?)<br>/g, '<li>$1</li>')                       // Wrap list items
    .replace(/<li>/g, '<ul><li>')                                   // Wrap in <ul>
    .replace(/<\/li>/g, '</li></ul>')                               // Close <ul>
    .replace(/<\/ul><ul>/g, '')                                     // Cleanup
    .replace(/---/g, '<hr>')                                        // Horizontal line
    .replace(/<br>(\d+\.\s)/g, '<br><strong>$1</strong>');          // Numbered list
}

// Reset chat with "New Chat" button
document.getElementById('new-chat-btn').addEventListener('click', () => {
  if (confirm("Are you sure you want to start a new chat?")) {
    localStorage.removeItem("chatHistory");
    messages = [{ sender: 'ai', text: "👋 Hi! I'm your meal planner assistant. What ingredients do you have today?" }];
    localStorage.setItem("chatHistory", JSON.stringify(messages));
    renderMessages();
  }
});
