document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const newChatBtn = document.getElementById('new-chat-btn');

    let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

    const initialMessage = {
        sender: 'ai',
        text: "👋 Hi! I'm your meal planner assistant. What ingredients do you have today?"
    };

    if (chatHistory.length === 0) {
        chatHistory.push(initialMessage);
        updateLocalStorage();
    }

    renderMessages();

    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userMessage = userInput.value.trim();
            if (!userMessage) return;

            appendMessage('user', userMessage);
            userInput.value = '';
            showTypingIndicator();

            try {
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userMessage })
                });

                const data = await response.json();
                removeTypingIndicator();
                const formattedReply = formatMarkdown(data.reply);
                appendMessage('ai', formattedReply);

            } catch (error) {
                console.error("Error fetching AI response:", error);
                removeTypingIndicator();
                appendMessage('ai', "⚠️ Sorry, something went wrong. Please try again.");
            }
        });
    }

    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to start a new chat? This will clear your conversation.")) {
                chatHistory = [initialMessage];
                updateLocalStorage();
                renderMessages();
            }
        });
    }

    function appendMessage(sender, text) {
        chatHistory.push({ sender, text });
        updateLocalStorage();
        renderMessages();
    }

    function renderMessages() {
        if (!chatBox) return;
        chatBox.innerHTML = '';
        chatHistory.forEach(({ sender, text }) => {
            const messageBubble = document.createElement('div');
            messageBubble.className = `chat-bubble ${sender}`;
            messageBubble.innerHTML = text;
            chatBox.appendChild(messageBubble);
        });
        scrollToBottom();
    }
    
    function showTypingIndicator() {
        const typingBubble = document.createElement('div');
        typingBubble.className = 'chat-bubble ai typing-indicator';
        typingBubble.innerHTML = '<span></span><span></span><span></span>';
        chatBox.appendChild(typingBubble);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const typingIndicator = chatBox.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function updateLocalStorage() {
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }

    function scrollToBottom() {
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function formatMarkdown(text) {
        let html = text
            .replace(/### \*\*(.*?)\*\*/g, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^\s*[-*]\s+(.*)/gm, '<li>$1</li>')
            .replace(/<\/li><li>/g, '</li><li>')
            .replace(/<li>/g, '<ul><li>')
            .replace(/<\/li>/g, '</li></ul>')
            .replace(/<\/ul>(\s*<ul>)/g, '$1')
            .replace(/\n/g, '<br>');
        return html;
    }
});