// ========== REGISTER ==========
const registerForm = document.getElementById('registerForm');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const messageBox = document.getElementById('messageBox');

    if (!username || !password) {
      showMessage(messageBox, '❌ Username & password wajib diisi!', 'error');
      return;
    }

    if (password.length < 4) {
      showMessage(messageBox, '❌ Password minimal 4 karakter!', 'error');
      return;
    }

    showMessage(messageBox, '⏳ Mendaftarkan...', '');

    try {
      const res = await fetch('https://nekolabs-api.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.ok) {
        showMessage(messageBox, '✅ ' + data.message, 'success');
        registerForm.reset();
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
      } else {
        showMessage(messageBox, '❌ ' + data.message, 'error');
      }
    } catch (err) {
      showMessage(messageBox, '❌ Gagal terhubung ke server', 'error');
    }
  });
}

// ========== LOGIN ==========
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const messageBox = document.getElementById('messageBox');

    if (!username || !password) {
      showMessage(messageBox, '❌ Username & password wajib diisi!', 'error');
      return;
    }

    showMessage(messageBox, '⏳ Login...', '');

    try {
      const res = await fetch('https://nekolabs-api.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.ok) {
        localStorage.setItem('nekolabs_user', JSON.stringify(data.user));
        showMessage(messageBox, '✅ Login berhasil!', 'success');
        
        setTimeout(() => {
          if (data.user.role === 'admin') {
            window.location.href = 'dashboard-admin.html';
          } else {
            window.location.href = 'index.html';
          }
        }, 800);
      } else {
        showMessage(messageBox, '❌ ' + data.message, 'error');
      }
    } catch (err) {
      showMessage(messageBox, '❌ Gagal terhubung ke server', 'error');
    }
  });
}

// ========== HELPER ==========
function showMessage(box, msg, type) {
  if (!box) return;
  
  const colors = {
    success: 'var(--success)',
    error: 'var(--danger)',
    '': 'var(--text-secondary)'
  };

  box.innerHTML = `
    <p style="
      color: ${colors[type] || colors['']}; 
      padding: 10px 16px; 
      background: var(--bg-card); 
      border-radius: var(--radius-sm); 
      font-size: 0.9em;
      border: 1px solid var(--border);
    ">${msg}</p>
  `;
}