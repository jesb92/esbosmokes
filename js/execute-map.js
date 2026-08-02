(async () => {
  renderHeader('execute');
  renderFooter();

  const mapSlug = params().get('map');
  const grid = document.querySelector('[data-execute-grid]');

  try {
    const response = await fetch('data/executes.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('No se pudo cargar data/executes.json');

    const data = await response.json();
    const map = (data.maps || []).find(item => item.slug === mapSlug);
    if (!map) throw new Error('El mapa solicitado no existe.');

    const executes = (data.executes || []).filter(item => item.map === map.slug && item.published !== false);

    document.title = `${map.name} Execute · EsboSmokes`;
    document.querySelector('[data-execute-map-title]').textContent = map.name;
    document.querySelector('[data-execute-map-description]').textContent = map.description || '';
    document.querySelector('[data-execute-map-count]').textContent = `${executes.length} ${executes.length === 1 ? 'execute' : 'executes'}`;

    if (!executes.length) {
      grid.innerHTML = '<div class="empty">Todavía no hay tarjetas publicadas para este mapa.</div>';
      return;
    }

    grid.innerHTML = executes.map(item => `
      <a class="card map-card" href="execute-detail.html?id=${encodeURIComponent(item.id)}">
        <img src="${escapeAttr(item.thumbnail)}" alt="${escapeAttr(item.title)}">
        <div class="map-card-body">
          <div class="type-counts">
            ${item.site ? `<span class="type-pill">Site ${escapeHtml(item.site)}</span>` : ''}
            ${item.difficulty ? `<span class="type-pill">${escapeHtml(item.difficulty)}</span>` : ''}
          </div>
          <h2>${escapeHtml(item.title)}</h2>
          <p>${escapeHtml(item.description || '')}</p>
        </div>
      </a>
    `).join('');
  } catch (error) {
    document.querySelector('main').innerHTML = `<div class="container section"><div class="empty">${escapeHtml(error.message)}</div></div>`;
  }
})();
