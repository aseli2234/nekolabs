async function downloadVideo() {
  const url = document.getElementById('urlInput').value.trim();
  const resultBox = document.getElementById('resultBox');
  
  if (!url) {
    alert('⚠️ Masukkan link dulu ya!');
    return;
  }

  const isTikTok = url.includes('tiktok.com');
  const isInstagram = url.includes('instagram.com');
  
  if (!isTikTok && !isInstagram) {
    alert('⚠️ Link harus TikTok atau Instagram!');
    return;
  }

  const platform = isTikTok ? 'TikTok' : 'Instagram';
  const platformEmoji = isTikTok ? '🎵' : '📷';
  
  resultBox.innerHTML = '<p style="text-align:center; color:var(--text-secondary);">⏳ Mendownload...</p>';
  
  try {
    const endpoint = isTikTok 
      ? 'https://api-faa.my.id/faa/tiktok'
      : 'https://api-faa.my.id/faa/igdl';
    
    const apiUrl = `${endpoint}?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!data.status || !data.result) {
      throw new Error('Gagal ambil data');
    }

    const result = data.result;
    
    if (isTikTok) {
      // TikTok
      const videoUrl = result.data || result.alternatives?.hd || result.alternatives?.selected || result.alternatives?.sd;
      const title = result.title || 'TikTok Video';
      const cover = result.cover || '';
      const duration = result.duration || '0';
      const author = result.author?.nickname || result.author?.username || 'Unknown';
      const authorAvatar = result.author?.avatar || '';
      const views = result.stats?.views || '0';
      const likes = result.stats?.likes || '0';
      const musicUrl = result.music_info?.url || '';
      
      resultBox.innerHTML = `
        <div class="card-glass" style="padding:20px; animation:fadeIn 0.3s ease;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
            <img src="${authorAvatar}" alt="" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid var(--accent);" onerror="this.style.display='none'">
            <div>
              <strong>${platformEmoji} @${author}</strong>
              <p style="font-size:0.8em; color:var(--text-muted);">${views} views • ${likes} likes</p>
            </div>
          </div>
          
          <p style="margin-bottom:12px;">${title.substring(0, 200)}</p>
          
          <img src="${cover}" alt="Cover" style="width:100%; border-radius:12px; margin-bottom:12px; max-height:300px; object-fit:cover;" onerror="this.style.display='none'">
          
          <p style="color:var(--text-secondary); font-size:0.9em; margin-bottom:12px;">⏱️ ${duration}</p>
          
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <a href="${videoUrl}" target="_blank" class="btn btn-primary btn-sm">📥 Download Video (HD)</a>
            ${musicUrl ? `<a href="${musicUrl}" target="_blank" class="btn btn-outline btn-sm">🎵 Download Musik</a>` : ''}
          </div>
        </div>
      `;
      
    } else {
      // Instagram
      const mediaUrl = result.url?.[0] || result.url || '';
      const username = result.metadata?.username || 'Unknown';
      const caption = result.metadata?.caption || '';
      const isVideo = result.metadata?.isVideo !== false;
      const likes = result.metadata?.like || 0;
      const comments = result.metadata?.comment || 0;
      
      resultBox.innerHTML = `
        <div class="card-glass" style="padding:20px; animation:fadeIn 0.3s ease;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
            <strong>${platformEmoji} @${username}</strong>
            <span class="badge badge-free">${isVideo ? '🎬 Video' : '🖼️ Gambar'}</span>
            <p style="font-size:0.8em; color:var(--text-muted);">❤️ ${likes} • 💬 ${comments}</p>
          </div>
          
          <p style="margin-bottom:12px;">${caption.substring(0, 200)}</p>
          
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <a href="${mediaUrl}" target="_blank" class="btn btn-primary btn-sm">📥 Download ${isVideo ? 'Video' : 'Gambar'}</a>
          </div>
        </div>
      `;
    }
    
  } catch (err) {
    console.error('Download Error:', err.message);
    resultBox.innerHTML = `
      <div class="card-glass" style="padding:20px; text-align:center;">
        <p style="font-size:3em;">❌</p>
        <p style="color:var(--danger);">Gagal download dari ${platform}</p>
        <p style="font-size:0.85em; color:var(--text-muted);">Coba link lain atau cek koneksi</p>
      </div>
    `;
  }
}

// Enter key
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('urlInput');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') downloadVideo();
    });
  }
});