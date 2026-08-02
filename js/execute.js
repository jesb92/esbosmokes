(async () => {
  renderHeader('execute');
  renderFooter();

  const grid = document.querySelector('[data-execute-map-grid]');

  try {
    const response = await fetch('data/executes.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('No se pudo cargar data/executes.json');

    const data = await response.json();
    const maps = Array.isArray(data.maps) ? data.maps : [];
    const executes = (data.executes || []).filter(item => item.published !== false);

    if (!maps.length) {
      grid.innerHTML = '<div class="empty">Todavía no hay mapas de Execute.</div>';
      return;
    }

    grid.innerHTML = maps.map(map => {
      const items = executes.filter(item => item.map === map.slug);
      return `
        <a class="card map-card" href="execute-map.html?map=${encodeURIComponent(map.slug)}">
          <img src="${escapeAttr(map.image)}" alt="Mapa ${escapeAttr(map.name)}">
          <div class="map-card-body">
            <h2>${escapeHtml(map.name)}</h2>
            <p>${escapeHtml(map.description || '')}</p>
            <div class="type-counts">
              <span class="type-pill">${items.length} ${items.length === 1 ? 'execute' : 'executes'}</span>
            </div>
          </div>
        </a>`;
    }).join('');
  } catch (error) {
    grid.innerHTML = `<div class="empty"><strong>Error al cargar Execute.</strong><br><br>${escapeHtml(error.message)}</div>`;
  }
})();
