(async () => {
  renderHeader('');
  renderFooter();
  const id = params().get('id');
  try {
    const data = await loadData();
    const nade = data.nades.find(n => n.id === id && n.published);
    if (!nade) throw new Error('La lineup solicitada no existe o no está publicada.');
    const map = mapBySlug(data, nade.map);
    document.title = `${nade.title} · EsboSmokes`;
    document.querySelector('[data-breadcrumb]').innerHTML = `<a href="map.html?map=${encodeURIComponent(nade.map)}">${escapeHtml(map?.name || nade.map)}</a> / ${TYPE_LABELS[nade.type] || nade.type}`;
    document.querySelector('[data-title]').textContent = nade.title;
    document.querySelector('[data-description]').textContent = nade.description;
    document.querySelector('[data-route]').innerHTML = `${escapeHtml(nade.origin)} <span class="arrow">→</span> ${escapeHtml(nade.target)}`;

    renderSpawnReference(nade);

    const videos = normalizeNadeVideos(nade.videos, nade.videoUrl);
    const videoViewer = document.querySelector('[data-video-viewer], [data-video]');

    if (!videoViewer) {
      throw new Error('No se encontró el contenedor de vídeos en nade.html.');
    }

    renderNadeVideos(videoViewer, videos, nade.title);

    const favorite = getFavorites().includes(nade.id);
    const favBtn = document.querySelector('[data-detail-favorite]');
    favBtn.dataset.favoriteId = nade.id;
    favBtn.textContent = favorite ? '★ Guardada' : '☆ Guardar';
    favBtn.classList.toggle('btn-primary', favorite);
    favBtn.addEventListener('click', () => {
      toggleFavorite(nade.id);
      const active = getFavorites().includes(nade.id);
      favBtn.textContent = active ? '★ Guardada' : '☆ Guardar';
      favBtn.classList.toggle('btn-primary', active);
    });

    document.querySelector('[data-details]').innerHTML = [
      ['Mapa', map?.name || nade.map], ['Granada', TYPE_LABELS[nade.type] || nade.type],
      ['Equipo', nade.team], ['Dificultad', nade.difficulty], ['Lanzamiento', nade.throw],
      ['Movimiento', nade.movement], ['Precisión', nade.precision], ['Vídeos', String(videos.length)]
    ].map(([label, value]) => `<div class="detail-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');

    document.querySelector('[data-steps]').innerHTML = (nade.steps || []).map(step => `<li>${escapeHtml(step)}</li>`).join('');
    const setposWrap = document.querySelector('[data-setpos-wrap]');
    if (nade.setpos) {
      document.querySelector('[data-setpos]').textContent = nade.setpos;
      document.querySelector('[data-copy-setpos]').addEventListener('click', async () => {
        await navigator.clipboard.writeText(nade.setpos);
        toast('Comando copiado');
      });
    } else setposWrap.hidden = true;

    const related = data.nades.filter(n => n.published && n.map === nade.map && n.id !== nade.id).slice(0, 3);
    const relatedGrid = document.querySelector('[data-related-grid]');
    relatedGrid.innerHTML = related.length ? related.map(nadeCard).join('') : '<div class="empty">No hay lineups relacionadas.</div>';
    bindFavoriteButtons(relatedGrid);
  } catch (error) {
    document.querySelector('main').innerHTML = `<div class="container section"><div class="empty">${escapeHtml(error.message)}</div></div>`;
  }
})();


function renderSpawnReference(nade) {
  const wrapper = document.querySelector('[data-spawn-image-wrap]');
  const image = document.querySelector('[data-spawn-image]');
  const thumbnail = String(nade.thumbnail || '').trim();

  if (!wrapper || !image || !thumbnail) return;

  image.src = thumbnail;
  image.alt = `Referencia visual de ${nade.title}`;
  wrapper.hidden = false;

  image.addEventListener('error', () => {
    wrapper.hidden = true;
  }, { once: true });
}

function normalizeNadeVideos(videos, legacyVideoUrl = '') {
  const source = Array.isArray(videos) ? videos : [];

  const normalized = source
    .map((video, index) => {
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
    })
    .filter(Boolean);

  const legacy = String(legacyVideoUrl || '').trim();
  if (!normalized.length && legacy) {
    normalized.push({ title: 'Vídeo 1', url: legacy });
  }

  return normalized;
}

function renderNadeVideos(container, videos, lineupTitle) {
  if (!videos.length) {
    container.innerHTML = `
      <div class="video-shell">
        ${renderVideoPlayer('', `Vídeo de ${lineupTitle}`)}
      </div>
    `;
    return;
  }

  container.innerHTML = `
    ${videos.length > 1 ? `
      <div class="nade-video-control">
        <label for="nade-video-selector">Seleccionar vídeo</label>
        <select id="nade-video-selector" data-video-selector>
          ${videos.map((video, index) => `
            <option value="${index}">${escapeHtml(video.title || `Vídeo ${index + 1}`)}</option>
          `).join('')}
        </select>
      </div>
    ` : ''}

    <h2 class="nade-video-title" data-video-title>
      ${escapeHtml(videos[0].title || 'Vídeo 1')}
    </h2>

    <div class="video-shell" data-video-player>
      ${renderVideoPlayer(videos[0].url, `${videos[0].title || 'Vídeo 1'} de ${lineupTitle}`)}
    </div>
  `;

  const selector = container.querySelector('[data-video-selector]');
  if (!selector) return;

  selector.addEventListener('change', () => {
    const index = Number(selector.value);
    const selected = videos[index];
    if (!selected) return;

    const title = container.querySelector('[data-video-title]');
    const player = container.querySelector('[data-video-player]');

    if (title) title.textContent = selected.title || `Vídeo ${index + 1}`;
    if (player) {
      player.innerHTML = renderVideoPlayer(
        selected.url,
        `${selected.title || `Vídeo ${index + 1}`} de ${lineupTitle}`
      );
    }
  });
}

