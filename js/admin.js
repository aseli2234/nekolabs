// Cek admin
const user = JSON.parse(localStorage.getItem('nekolabs_user') || 'null');
if (!user || user.role !== 'admin') {
  alert('Akses ditolak!');
  window.location.href = 'index.html';
}

// ========== TABS ==========
function showTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  
  document.getElementById('tab-users').style.display = tab === 'users' ? 'block' : 'none';
  document.getElementById('tab-mods').style.display = tab === 'mods' ? 'block' : 'none';

  if (tab === 'users') loadUsers();
  if (tab === 'mods') loadMods();
}

// ========== USERS ==========
async function loadUsers() {
  const container = document.getElementById('userList');
  container.innerHTML = '<p style="text-align:center; color:var(--text-secondary);">⏳ Memuat...</p>';

  try {
    const res = await fetch('https://nekolabs-api.onrender.com/api/admin/users');
    const data = await res.json();

    if (!data.ok) throw new Error('Gagal');

    container.innerHTML = data.data.map(u => `
      <div class="card" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <strong>${escapeHTML(u.username)}</strong>
          ${u.role === 'admin' ? '<span class="badge badge-admin">👑 Admin</span>' : ''}
          ${u.premium ? '<span class="badge badge-premium">💎 Premium</span>' : '<span class="badge badge-free">Gratis</span>'}
          <p style="font-size:0.75em; color:var(--text-muted); margin-top:4px;">
            📅 ${new Date(u.created_at).toLocaleDateString('id-ID')}
          </p>
        </div>
        <div style="display:flex; gap:8px;">
          ${u.role !== 'admin' ? `
            <button class="btn btn-sm ${u.premium ? 'btn-danger' : 'btn-success'}" 
              onclick="togglePremium(${u.id}, ${!u.premium})">
              ${u.premium ? '⬇️ Cabut Premium' : '⬆️ Kasih Premium'}
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})">🗑️ Hapus</button>
          ` : '<span style="color:var(--text-muted);">Super Admin</span>'}
        </div>
      </div>
    `).join('');

  } catch (err) {
    container.innerHTML = '<p style="text-align:center; color:var(--danger);">❌ Gagal memuat user.</p>';
  }
}

// ========== TOGGLE PREMIUM ==========
async function togglePremium(id, premium) {
  if (!confirm(`${premium ? 'Kasih' : 'Cabut'} premium user ini?`)) return;

  try {
    const res = await fetch(`/api/admin/premium/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ premium })
    });
    const data = await res.json();
    alert(data.message);
    loadUsers();
  } catch {
    alert('Gagal!');
  }
}

// ========== DELETE USER ==========
async function deleteUser(id) {
  if (!confirm('Hapus user ini? Data tidak bisa dikembalikan!')) return;

  try {
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message);
    loadUsers();
  } catch {
    alert('Gagal!');
  }
}

// ========== MODS ==========
async function loadMods() {
  const container = document.getElementById('adminModList');
  container.innerHTML = '<p style="text-align:center; color:var(--text-secondary);">⏳ Memuat...</p>';

  try {
    const res = await fetch('https://nekolabs-api.onrender.com/api/mods');
    const data = await res.json();

    if (!data.ok) throw new Error('Gagal');

    container.innerHTML = data.data.map(m => `
      <div class="card" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <strong>📦 ${escapeHTML(m.name)}</strong>
          <span class="badge badge-free">${escapeHTML(m.category)}</span>
          ${m.password ? '<span class="badge badge-premium">🔒 Pass</span>' : ''}
          <p style="font-size:0.75em; color:var(--text-muted); margin-top:4px;">
            👤 ${escapeHTML(m.uploaded_by)} • 📅 ${new Date(m.created_at).toLocaleDateString('id-ID')}
          </p>
        </div>
        <button class="btn btn-sm btn-danger" onclick="deleteMod(${m.id})">🗑️ Hapus</button>
      </div>
    `).join('');

  } catch {
    container.innerHTML = '<p style="text-align:center; color:var(--danger);">❌ Gagal memuat mod.</p>';
  }
}

// ========== DELETE MOD ==========
async function deleteMod(id) {
  if (!confirm('Hapus mod ini?')) return;

  try {
    const res = await fetch(`/api/mods/${id}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message);
    loadMods();
  } catch {
    alert('Gagal!');
  }
}

// ========== HELPER ==========
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ========== ADMIN UPLOAD MOD ==========
const adminUploadForm = document.getElementById('adminUploadForm');

if (adminUploadForm) {
  adminUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('adminModName').value.trim();
    const category = document.getElementById('adminModCategory').value;
    const description = document.getElementById('adminModDesc').value.trim();
    const link = document.getElementById('adminModLink').value.trim();
    const password = document.getElementById('adminModPassword').value.trim();
    const msgBox = document.getElementById('adminUploadMessage');

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
        adminUploadForm.reset();
        loadMods();
      } else {
        msgBox.innerHTML = '<p style="color:var(--danger);">❌ ' + data.message + '</p>';
      }
    } catch {
      msgBox.innerHTML = '<p style="color:var(--danger);">❌ Gagal terhubung ke server</p>';
    }
  });
}

// Init
loadUsers();