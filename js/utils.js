// ========== TOAST NOTIFICATION ==========
function showToast(message, type = '') {
  // Hapus toast lama
  const oldToast = document.querySelector('.toast');
  if (oldToast) oldToast.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Animasi masuk
  setTimeout(() => toast.classList.add('show'), 100);

  // Hilang setelah 2.5 detik
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ========== SALIN TEKS ==========
function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => showToast('✅ Berhasil disalin!', 'success'))
    .catch(() => showToast('❌ Gagal menyalin!', 'error'));
}

// ========== ESCAPE HTML ==========
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ========== FORMAT TANGGAL ==========
function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// ========== NAVBAR SCROLL EFFECT ==========
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  console.log('✅ utils.js loaded!');
});