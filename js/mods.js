let allMods = [];

// ========== FETCH MODS ==========
async function loadMods() {
  const container = document.getElementById('modList');
  if (!container) return;

  container.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-secondary);">⏳ Memuat mod...</p>';

  try {
    const res = await fetch('https://nekolabs-api.onrender.com/api/mods');
    const data = await res.json();

    if (data.ok) {
      allMods = data.data;
      filterAndRender();
    } else {
      container.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--danger);">❌ Gagal memuat mod.</p>';
    }
  } catch (err) {
    container.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--danger);">❌ Gagal terhubung ke server.</p>';
  }
}

// ========== FILTER & RENDER ==========
function filterAndRender() {
  const container = document.getElementById('modList');
  const searchQuery = document.getElementById('searchInput')?.value?.toLowerCase() || '';
  const category = document.getElementById('categoryFilter')?.value || 'all';

  let filtered = [...allMods];

  if (category !== 'all') {
    filtered = filtered.filter(m => m.category === category);
  }

  if (searchQuery) {
    filtered = filtered.filter(m =>
      m.name.toLowerCase().includes(searchQuery) ||
      (m.description && m.description.toLowerCase().includes(searchQuery))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-secondary); padding:40px;">📭 Tidak ada mod ditemukan</p>';
    return;
  }

  container.innerHTML = filtered.map(mod => `
    <div class="card mod-card" onclick="openDetail('${mod.id}')" style="cursor:pointer;">
      <h3 style="margin-bottom:8px; color:var(--accent-light);">📦 ${escapeHTML(mod.name)}</h3>
      <span class="badge badge-free">${escapeHTML(mod.category)}</span>
      ${mod.password ? '<span class="badge badge-premium" style="margin-left:4px;">🔒 Pass</span>' : ''}
      <p style="color:var(--text-secondary); font-size:0.85em; margin-top:8px;">
        ${escapeHTML(mod.description || 'Tidak ada deskripsi').substring(0, 80)}...
      </p>
      <p style="color:var(--text-muted); font-size:0.75em; margin-top:4px;">
        👤 ${escapeHTML(mod.uploaded_by)} • ${new Date(mod.created_at).toLocaleDateString('id-ID')}
      </p>
    </div>
  `).join('');
}

// ========== OPEN DETAIL MODAL ==========
function openDetail(id) {
  const mod = allMods.find(m => m.id == id);
  if (!mod) return;

  document.getElementById('modalTitle').textContent = '📦 ' + mod.name;
  document.getElementById('modalDesc').textContent = mod.description || 'Tidak ada deskripsi';
  document.getElementById('modalLink').href = mod.link;

  const passwordBox = document.getElementById('modalPasswordBox');
  const passwordInput = document.getElementById('modalPassword');

  if (mod.password) {
    passwordBox.style.display = 'flex';
    passwordInput.value = mod.password;
  } else {
    passwordBox.style.display = 'none';
    passwordInput.value = '';
  }

  document.getElementById('detailModal').classList.add('active');
}

// ========== CLOSE MODAL ==========
function closeModal() {
  document.getElementById('detailModal').classList.remove('active');
}

// ========== COPY PASSWORD ==========
function copyPassword() {
  const input = document.getElementById('modalPassword');
  input.select();
  navigator.clipboard.writeText(input.value)
    .then(() => alert('✅ Password berhasil disalin!'))
    .catch(() => alert('❌ Gagal menyalin!'));
}

// ========== EVENT LISTENERS ==========
document.addEventListener('DOMContentLoaded', () => {
  loadMods();

  document.getElementById('searchInput')?.addEventListener('input', filterAndRender);
  document.getElementById('categoryFilter')?.addEventListener('change', filterAndRender);

  // Close modal on overlay click
  document.getElementById('detailModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
});

// ========== HELPER ==========
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}