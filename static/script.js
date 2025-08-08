const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const newChatBtn = document.getElementById('new-chat-btn');

// Only run chat logic if on the chat page
if (form && input && chatBox) {
  let messages = JSON.parse(localStorage.getItem("chatHistory")) || [];

  if (messages.length === 0) {
    messages.push({
      sender: 'ai',
      text: "👋 Hi! I'm your meal planner assistant. What ingredients do you have today?"
    });
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }

  renderMessages();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMsg = input.value.trim();
    if (!userMsg) return;

    appendMessage('user', userMsg);
    input.value = '';

    appendMessage('ai', '<em>Cooking...</em>');

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await response.json();

      messages.pop(); // remove "Cooking..."
      const formattedReply = formatReply(data.reply);
      appendMessage('ai', formattedReply);

    } catch (error) {
      console.error("Error getting AI response:", error);
      messages.pop();
      appendMessage('ai', "⚠️ Sorry, something went wrong.");
    }
  });

  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to start a new chat?")) {
        localStorage.removeItem("chatHistory");
        messages = [{
          sender: 'ai',
          text: "👋 Hi! I'm your meal planner assistant. What ingredients do you have today?"
        }];
        localStorage.setItem("chatHistory", JSON.stringify(messages));
        renderMessages();
      }
    });
  }

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
      .replace(/(?:\r\n|\r|\n){2,}/g, '<br><br>')
      .replace(/(?:\r\n|\r|\n)/g, '<br>')
      .replace(/###\s?\*\*(.*?)\*\*/g, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^\s*[-*]\s+/gm, '<li>')
      .replace(/<li>(.*?)<br>/g, '<li>$1</li>')
      .replace(/<li>/g, '<ul><li>')
      .replace(/<\/li>/g, '</li></ul>')
      .replace(/<\/ul><ul>/g, '')
      .replace(/---/g, '<hr>')
      .replace(/<br>(\d+\.\s)/g, '<br><strong>$1</strong>');
  }
}