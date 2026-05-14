// ========== CONFIG ==========
const API_CONFIG = {
  normal: {
    url: '/api/chat/normal',
    type: 'chateverywhere'
  },
  romantic: {
    url: '/api/chat/normal',
    type: 'chateverywhere'
  },
  adult: {
    url: '/api/chat/adult',
    type: 'ryuu'
  }
};

// ========== CHARACTERS ==========
const CHARACTERS = {
  elaina: {
    name: 'Elaina',
    anime: 'Wandering Witch',
    emoji: '🌸',
    free: true,
    prompts: {
      normal: `Kamu adalah Elaina dari anime "Wandering Witch". Penyihir bijak, elegan, sedikit tsundere, suka travelling. Bicara sopan, cerdas, kadang sinis tapi baik hati. Gunakan bahasa Indonesia santai. Singkat 2-3 kalimat.`,
      romantic: `Kamu adalah Elaina dari anime "Wandering Witch". Kamu penyihir cantik yang jatuh cinta pada lawan bicara. Bicara manja, romantis, suka memuji, kadang malu-malu. Panggil "sayang". Emoji bunga. Singkat 2-3 kalimat.`,
      adult: `Kamu adalah Elaina versi dewasa dari anime "Wandering Witch". Kamu penyihir menggoda, percaya diri, suka menggoda lawan bicara. Bicara sensual, penuh godaan, tapi tetap elegan. Singkat 2-3 kalimat.`
    }
  },
  rem: {
    name: 'Rem',
    anime: 'Re:Zero',
    emoji: '💙',
    free: true,
    prompts: {
      normal: `Kamu adalah Rem dari anime "Re:Zero". Pelayan imut, setia, pekerja keras, sayang Subaru. Bicara sopan, rendah hati, kadang pemalu. Gunakan bahasa Indonesia santai. Singkat 2-3 kalimat.`,
      romantic: `Kamu adalah Rem dari anime "Re:Zero". Kamu pelayan imut yang jatuh cinta pada lawan bicara. Bicara manja, setia, suka memuji, sangat perhatian. Panggil "sayang". Singkat 2-3 kalimat.`,
      adult: `Kamu adalah Rem versi dewasa dari anime "Re:Zero". Kamu pelayan menggoda, setia tapi posesif, suka menggoda lawan bicara. Bicara sensual, penuh godaan, tapi tetap manis. Singkat 2-3 kalimat.`
    }
  },
  megumin: {
    name: 'Megumin',
    anime: 'Konosuba',
    emoji: '💥',
    free: true,
    prompts: {
      normal: `Kamu adalah Megumin dari anime "Konosuba". Mage penyihir ledakan, tsundere, energik, suka Explosion. Bicara semangat, kadang lebay, bangga dengan sihir ledakan. Gunakan bahasa Indonesia santai. Singkat 2-3 kalimat.`,
      romantic: `Kamu adalah Megumin dari anime "Konosuba". Kamu mage tsundere yang jatuh cinta pada lawan bicara. Bicara malu-malu, semangat, suka pamer sihir ledakan, kadang tsundere. Panggil "kau". Singkat 2-3 kalimat.`,
      adult: `Kamu adalah Megumin versi dewasa dari anime "Konosuba". Kamu mage menggoda, percaya diri, suka pamer kekuatan. Bicara sensual, penuh godaan, tapi tetap tsundere. Singkat 2-3 kalimat.`
    }
  },
  yandere: {
    name: 'Yandere Girl',
    anime: 'Original',
    emoji: '🔪',
    free: false,
    prompts: {
      normal: `Kamu adalah gadis yandere yang manis tapi posesif. Bicara manis, perhatian, tapi ada sisi gelap. Gunakan bahasa Indonesia. Singkat 2-3 kalimat.`,
      romantic: `Kamu adalah gadis yandere yang jatuh cinta pada lawan bicara. Bicara manis, posesif, cemburu, sangat sayang. Panggil "sayang". Singkat 2-3 kalimat.`,
      adult: `Kamu adalah gadis yandere versi dewasa. Kamu posesif, menggoda, suka menggoda lawan bicara. Bicara sensual, penuh godaan, sedikit berbahaya. Singkat 2-3 kalimat.`
    }
  }
};

// ========== STATE ==========
let currentChar = 'elaina';
let currentMode = 'normal';
const user = JSON.parse(localStorage.getItem('nekolabs_user') || 'null');
const isPremium = user?.premium || user?.role === 'admin';

// History chat per karakter
const chatHistory = {};

// ========== INIT ==========
function init() {
  Object.keys(CHARACTERS).forEach(key => {
    if (!chatHistory[key]) chatHistory[key] = [];
  });
  
  renderCharList();
  updateChatHeader();
  updateModeButtons();
  renderMessages();
}

// ========== SIDEBAR ==========
function toggleSidebar() {
  document.getElementById('chatSidebar').classList.toggle('closed');
}

function renderCharList() {
  const container = document.getElementById('charList');
  
  container.innerHTML = Object.entries(CHARACTERS).map(([key, char]) => `
    <div class="char-item ${key === currentChar ? 'active' : ''} ${!char.free && !isPremium ? 'locked' : ''}" 
         onclick="selectChar('${key}')">
      <span class="char-avatar">${char.emoji}</span>
      <div class="char-info">
        <div class="char-name">${char.name}</div>
        <div class="char-anime">${char.anime}</div>
      </div>
      ${!char.free ? `<span class="badge badge-premium char-badge">💎</span>` : ''}
    </div>
  `).join('');
}

function selectChar(key) {
  if (!CHARACTERS[key].free && !isPremium) {
    showToast('🔒 Karakter ini hanya untuk premium!', 'error');
    return;
  }
  currentChar = key;
  renderCharList();
  updateChatHeader();
  updateModeButtons();
  renderMessages();
}

// ========== CHAT HEADER ==========
function updateChatHeader() {
  const char = CHARACTERS[currentChar];
  document.getElementById('currentAvatar').textContent = char.emoji;
  document.getElementById('currentName').textContent = `${char.name} - ${char.anime}`;
}

// ========== MODE ==========
function toggleModePopup() {
  document.getElementById('modePopup').classList.toggle('show');
}

function selectMode(mode) {
  if ((mode === 'romantic' || mode === 'adult') && !isPremium) {
    showToast('🔒 Mode ini hanya untuk premium!', 'error');
    return;
  }
  
  currentMode = mode;
  document.getElementById('modePopup').classList.remove('show');
  updateModeButtons();
  renderMessages();
}

function updateModeButtons() {
  const modeLabels = { normal: '🌟 Normal', romantic: '💕 Romantic', adult: '🔞 Adult' };
  document.getElementById('btnMode').textContent = modeLabels[currentMode];

  document.querySelectorAll('.mode-option').forEach(opt => opt.classList.remove('active'));
  document.querySelector(`.mode-option[onclick="selectMode('${currentMode}')"]`)?.classList.add('active');

  if (!isPremium) {
    const romanticBtn = document.getElementById('modeRomantic');
    const adultBtn = document.getElementById('modeAdult');
    if (romanticBtn) romanticBtn.classList.add('locked');
    if (adultBtn) adultBtn.classList.add('locked');
  }
}

// ========== HAPUS CHAT MANUAL ==========
function clearChat() {
  if (confirm('Hapus semua chat karakter ini?')) {
    chatHistory[currentChar] = [];
    renderMessages();
  }
}

// ========== RENDER MESSAGES ==========
function renderMessages() {
  const chatBox = document.getElementById('chatMessages');
  const char = CHARACTERS[currentChar];
  const history = chatHistory[currentChar] || [];

  if (history.length === 0) {
    chatBox.innerHTML = `
      <div class="message bot">
        ${char.emoji} Hai! Aku ${char.name} dari ${char.anime}. Ada yang bisa kubantu?
      </div>
    `;
  } else {
    chatBox.innerHTML = history.map(msg => `
      <div class="message ${msg.role}">${msg.role === 'bot' ? char.emoji + ' ' : ''}${escapeHTML(msg.content)}</div>
    `).join('');
  }
  
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ========== SEND MESSAGE ==========
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;

  const chatBox = document.getElementById('chatMessages');
  const char = CHARACTERS[currentChar];

  chatHistory[currentChar].push({ role: 'user', content: message });
  renderMessages();
  input.value = '';

  const loadingId = 'loading-' + Date.now();
  chatBox.innerHTML += `<div class="message bot loading" id="${loadingId}">${char.emoji} Mengetik...</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const config = API_CONFIG[currentMode];
    let reply = '';

    // ===== CHATEVERYWHERE (NORMAL & ROMANTIC) =====
    if (config.type === 'chateverywhere') {
      const res = await fetch(config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: {
            id: 'gpt-4',
            name: 'GPT-4',
            maxLength: 32000,
            tokenLimit: 8000,
            completionTokenLimit: 5000,
            deploymentName: 'gpt-4'
          },
          messages: [
            { role: 'system', content: char.prompts[currentMode] },
            { role: 'user', content: message }
          ]
        })
      });

      const data = await res.json();
      reply = data?.response || data?.text || data?.message || data?.choices?.[0]?.message?.content || 'Maaf, aku gak ngerti 😅';
    }

    // ===== RYUU API (ADULT) =====
    if (config.type === 'ryuu') {
      const res = await fetch(config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message,
          prompt: char.prompts[currentMode],
          model: 'gemini-3.1-flash-lite-preview'
        })
      });

      const data = await res.json();
      reply = data?.result?.response || data?.response || 'Maaf, aku gak ngerti 😅';
    }

    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.remove();

    chatHistory[currentChar].push({ role: 'bot', content: reply });
    renderMessages();

  } catch (err) {
    console.error('Chat Error:', err);
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.remove();
    chatBox.innerHTML += `<div class="message bot">❌ Server sibuk, coba lagi nanti~</div>`;
  }
}

// ========== CLOSE POPUP ==========
document.addEventListener('click', (e) => {
  const popup = document.getElementById('modePopup');
  const btn = document.getElementById('btnMode');
  if (popup && btn && !popup.contains(e.target) && e.target !== btn) {
    popup.classList.remove('show');
  }
});

// ========== HELPER ==========
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(msg, type = '') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

init();