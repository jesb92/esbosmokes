(async () => {
  renderHeader('execute');
  renderFooter();

  const id = params().get('id');

  try {
    const response = await fetch('data/executes.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('No se pudo cargar data/executes.json');

    const data = await response.json();
    const item = (data.executes || []).find(execute => execute.id === id && execute.published !== false);
    if (!item) throw new Error('El execute solicitado no existe o no está publicado.');

    const map = (data.maps || []).find(entry => entry.slug === item.map);
    const mapName = map?.name || item.map || 'CS2';

    document.title = `${item.title} · EsboSmokes`;
    document.querySelector('[data-execute-breadcrumb]').textContent = `${mapName}${item.site ? ` / Site ${item.site}` : ''}`;
    document.querySelector('[data-execute-title]').textContent = item.title;
    document.querySelector('[data-execute-description]').textContent = item.description || '';

    document.querySelector('[data-execute-meta]').innerHTML = [
      mapName,
      item.site ? `Site ${item.site}` : '',
      item.difficulty,
      ...(item.tags || [])
    ].filter(Boolean).map(value => `<span class="pill">${escapeHtml(value)}</span>`).join('');

    const videos = getExecuteVideos(item);
    const videoSection = document.querySelector('[data-video-section]');
    const videoList = document.querySelector('[data-execute-videos]');

    if (!videos.length) {
      videoSection.hidden = true;
    } else {
      videoList.innerHTML = videos.map((video, index) => `
        <article class="execute-video-item">
          <h3>${escapeHtml(video.title || `Vídeo ${index + 1}`)}</h3>
          <div class="video-shell">
            ${renderVideoPlayer(video.url, `${video.title || `Vídeo ${index + 1}`} de ${item.title}`)}
          </div>
        </article>
      `).join('');
    }

    const steps = item.steps || [];
    document.querySelector('[data-execute-steps]').innerHTML = steps.length
      ? steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')
      : '<li>Contenido pendiente.</li>';

    document.querySelector('[data-execute-details]').innerHTML = [
      ['Mapa', mapName],
      ['Zona', item.site || '—'],
      ['Dificultad', item.difficulty || '—'],
      ['Vídeos', String(videos.length)],
      ['Actualizado', item.createdAt || '—']
    ].map(([label, value]) => `<div class="detail-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');

    const gallery = item.gallery || [];
    const gallerySection = document.querySelector('[data-gallery-section]');
    if (!gallery.length) {
      gallerySection.hidden = true;
    } else {
      document.querySelector('[data-execute-gallery]').innerHTML = gallery.map((image, index) => `
        <a href="${escapeAttr(image)}" target="_blank" rel="noopener">
          <img src="${escapeAttr(image)}" alt="${escapeAttr(item.title)} · referencia ${index + 1}">
        </a>
      `).join('');
    }
  } catch (error) {
    document.querySelector('main').innerHTML = `<div class="container section"><div class="empty">${escapeHtml(error.message)}</div></div>`;
  }
})();

function getExecuteVideos(item) {
  const videos = Array.isArray(item.videos) ? item.videos : [];
  const normalized = videos.map((video, index) => {
    if (typeof video === 'string') {
      const url = video.trim();
      return url ? { title: `Vídeo ${index + 1}`, url } : null;
    }

    if (!video || typeof video !== 'object') return null;
    const url = String(video.url || video.videoUrl || '').trim();
    if (!url) return null;

    return {
      title: String(video.title || `Vídeo ${index + 1}`).trim(),
      url
    };
  }).filter(Boolean);

  const legacy = String(item.videoUrl || '').trim();
  if (!normalized.length && legacy) {
    normalized.push({ title: 'Vídeo 1', url: legacy });
  }

  return normalized;
}
