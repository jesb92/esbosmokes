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

    const video = document.querySelector('[data-video]');
    video.innerHTML = renderVideoPlayer(nade.videoUrl, `Vídeo de ${nade.title}`);

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
      ['Movimiento', nade.movement], ['Precisión', nade.precision]
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
