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

    const videos = normalizeNadeVideos(nade.videos, nade.videoUrl);
    const videoContainer = document.querySelector(
      '[data-video-section], [data-video]'
    );

    if (!videoContainer) {
      throw new Error(
        'No se encontró el contenedor de vídeo en nade.html. ' +
        'Reemplaza nade.html y js/nade.js con la misma versión.'
      );
    }

    renderNadeVideoSection(
      videoContainer,
      videos,
      nade.title
    );

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
      ['Movimiento', nade.movement], ['Precisión', nade.precision],
      ['Vídeos', String(videos.length)]
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

function normalizeNadeVideos(videos, legacyVideoUrl = '') {
  const source = Array.isArray(videos) ? videos : [];

  const normalized = source.map((video, index) => {
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

  const legacy = String(legacyVideoUrl || '').trim();

  if (!normalized.length && legacy) {
    normalized.push({
      title: 'Vídeo 1',
      url: legacy
    });
  }

  return normalized;
}

function renderNadeVideoSection(container, videos, lineupTitle) {
  if (!container) return;

  if (!videos.length) {
    container.innerHTML = `
      <div class="video-shell">
        ${renderVideoPlayer('', `Vídeo de ${lineupTitle}`)}
      </div>
    `;
    return;
  }

  container.innerHTML = `
    ${
      videos.length > 1
        ? `
          <div class="nade-video-tabs" role="tablist" aria-label="Vídeos de la lineup">
            ${videos.map((video, index) => `
              <button
                class="nade-video-tab ${index === 0 ? 'is-active' : ''}"
                type="button"
                data-video-index="${index}"
              >
                ${escapeHtml(video.title || `Vídeo ${index + 1}`)}
              </button>
            `).join('')}
          </div>
        `
        : ''
    }

    <div class="nade-current-video">
      <h2 data-current-video-title>
        ${escapeHtml(videos[0].title || 'Vídeo 1')}
      </h2>

      <div class="video-shell" data-current-video-player>
        ${renderVideoPlayer(
          videos[0].url,
          `${videos[0].title || 'Vídeo 1'} de ${lineupTitle}`
        )}
      </div>
    </div>
  `;

  container.querySelectorAll('[data-video-index]').forEach(button => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.videoIndex);
      const video = videos[index];

      if (!video) return;

      container.querySelectorAll('[data-video-index]').forEach(item => {
        item.classList.toggle('is-active', item === button);
      });

      const title = container.querySelector('[data-current-video-title]');
      const player = container.querySelector('[data-current-video-player]');

      if (title) {
        title.textContent = video.title || `Vídeo ${index + 1}`;
      }

      if (player) {
        player.innerHTML = renderVideoPlayer(
          video.url,
          `${video.title || `Vídeo ${index + 1}`} de ${lineupTitle}`
        );
      }
    });
  });
}

