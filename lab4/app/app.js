const chatHistory = document.getElementById('chatHistory');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const loader = document.getElementById('loader');
const errorBox = document.getElementById('errorBox');

const CONFIG = {
    apiUrl: 'http://localhost:11434/v1/chat/completions',
    model: 'qwen2.5:1.5b',
    // temperature: 0.3 — низька температура, щоб модель не галюцинувала 
    temperature: 0.3,
    // max_tokens: 150 — обов'язковий ліміт
    max_tokens: 150 
};

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    errorBox.style.display = 'none';
    addMessageToChat('Ви', text, 'user-msg');
    userInput.value = '';
    sendBtn.disabled = true;
    loader.style.display = 'block';

    try {
        const response = await fetch(CONFIG.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: CONFIG.model,
                messages: [{ role: 'user', content: text }],
                temperature: CONFIG.temperature,
                max_tokens: CONFIG.max_tokens
            })
        });

        if (!response.ok) throw new Error(`Помилка HTTP: ${response.status}`);
        
        const data = await response.json();
        const aiText = data.choices[0].message.content;
        addMessageToChat('AI', aiText, 'ai-msg');

    } catch (error) {
        console.error("Fetch error:", error);
        errorBox.textContent = "❌ Помилка з'єднання! Перевірте, чи запущено Ollama (OLLAMA_ORIGINS=\"*\" ollama serve)";
        errorBox.style.display = 'block';
    } finally {
        sendBtn.disabled = false;
        loader.style.display = 'none';
        chatHistory.scrollTop = chatHistory.scrollHeight;
        userInput.focus();
    }
}

function addMessageToChat(sender, text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatHistory.appendChild(msgDiv);
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });