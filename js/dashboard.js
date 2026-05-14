// Cek login
const user = JSON.parse(localStorage.getItem('nekolabs_user') || 'null');
if (!user) {
  alert('Silakan login dulu!');
  window.location.href = 'login.html';
}

// Tampilkan nama user
document.getElementById('userNameDisplay').textContent = user.username;

if (user.premium) {
  document.getElementById('premiumBadge').innerHTML = '<span class="badge badge-premium">💎 Premium</span>';
}

// Update navbar
(function() {
  const nav = document.getElementById('navLinks');
  if (!nav) return;

  if (user.role === 'admin') {
    nav.innerHTML = `
      <a href="mods.html" class="nav-link">📂 Mods</a>
      <a href="chat.html" class="nav-link">🤖 Chat AI</a>
      <a href="downloader.html" class="nav-link">📥 Downloader</a>
      <span class="nav-user">👑 ${user.username}</span>
      <a href="dashboard-admin.html" class="nav-btn nav-btn-outline">🛠️ Admin</a>
      <a href="#" onclick="logout()" class="nav-btn nav-btn-primary">🚪 Keluar</a>
    `;
  } else {
    nav.innerHTML = `
      <a href="mods.html" class="nav-link">📂 Mods</a>
      <a href="chat.html" class="nav-link">🤖 Chat AI</a>
      <a href="downloader.html" class="nav-link">📥 Downloader</a>
      <span class="nav-user">👤 ${user.username}</span>
      ${user.premium ? '<span class="badge badge-premium">💎 Premium</span>' : ''}
      <a href="dashboard-user.html" class="nav-btn nav-btn-outline">📂 Dashboard</a>
      <a href="#" onclick="logout()" class="nav-btn nav-btn-primary">🚪 Keluar</a>
    `;
  }
})();

function logout() {
  localStorage.removeItem('nekolabs_user');
  location.href = 'index.html';
}

// ========== TABS ==========
function showTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');

  document.getElementById('tab-upload').style.display = tab === 'upload' ? 'block' : 'none';
  document.getElementById('tab-my-mods').style.display = tab === 'my-mods' ? 'block' : 'none';

  if (tab === 'my-mods') loadMyMods();
}

// ========== UPLOAD MOD ==========
const uploadForm = document.getElementById('uploadForm');

if (uploadForm) {
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('modName').value.trim();
    const category = document.getElementById('modCategory').value;
    const description = document.getElementById('modDesc').value.trim();
    const link = document.getElementById('modLink').value.trim();
    const password = document.getElementById('modPassword').value.trim();
    const msgBox = document.getElementById('uploadMessage');

    msgBox.innerHTML = '<p style="color:var(--text-secondary);">⏳ Mengupload...</p>';

    try {
      const res = await fetch('https://nekolabs-api.onrender.com/api/mods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, category, description, link, password,
          username: user.username
        })
      });

      const data = await res.json();

      if (data.ok) {
        msgBox.innerHTML = '<p style="color:var(--success);">✅ Mod berhasil diupload!</p>';
        uploadForm.reset();
      } else {
        msgBox.innerHTML = '<p style="color:var(--danger);">❌ ' + data.message + '</p>';
      }
    } catch {
      msgBox.innerHTML = '<p style="color:var(--danger);">❌ Gagal terhubung ke server</p>';
    }
  });
}

// ========== MY MODS ==========
async function loadMyMods() {
  const container = document.getElementById('myModList');
  container.innerHTML = '<p style="text-align:center; color:var(--text-secondary);">⏳ Memuat...</p>';

  try {
    const res = await fetch('https://nekolabs-api.onrender.com/api/mods');
    const data = await res.json();

    if (!data.ok) throw new Error('Gagal');

    const myMods = data.data.filter(m => m.uploaded_by === user.username);

    if (myMods.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:var(--text-secondary); padding:40px;">📭 Kamu belum upload mod.</p>';
      return;
    }

    container.innerHTML = myMods.map(m => `
      <div class="card" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <strong>📦 ${escapeHTML(m.name)}</strong>
          <span class="badge badge-free">${escapeHTML(m.category)}</span>
          ${m.password ? '<span class="badge badge-premium">🔒 Pass</span>' : ''}
          <p style="font-size:0.75em; color:var(--text-muted); margin-top:4px;">
            📅 ${new Date(m.created_at).toLocaleDateString('id-ID')}
          </p>
        </div>
        <div style="display:flex; gap:8px;">
          <a href="${escapeHTML(m.link)}" target="_blank" class="btn btn-sm btn-outline">🔗 Link</a>
          ${m.password ? `<button class="btn btn-sm btn-outline" onclick="copyPass('${escapeHTML(m.password)}')">📋 Salin</button>` : ''}
        </div>
      </div>
    `).join('');

  } catch {
    container.innerHTML = '<p style="text-align:center; color:var(--danger);">❌ Gagal memuat mod.</p>';
  }
}

function copyPass(pass) {
  navigator.clipboard.writeText(pass)
    .then(() => alert('✅ Password disalin!'))
    .catch(() => alert('❌ Gagal!'));
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}