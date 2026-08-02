(async () => {
  renderHeader('execute');
  renderFooter();

  const grid = document.querySelector('[data-execute-grid]');

  try {
    const response = await fetch('data/executes.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('No se pudo cargar data/executes.json');

    const data = await response.json();
    const executes = (data.executes || []).filter(item => item.published !== false);

    if (!executes.length) {
      grid.innerHTML = '<div class="empty">Todavía no hay executes publicados.</div>';
      return;
    }

    grid.innerHTML = executes.map(item => `
      <a class="card map-card" href="execute-detail.html?id=${encodeURIComponent(item.id)}">
        <img src="${escapeAttr(item.thumbnail)}" alt="${escapeAttr(item.title)}">
        <div class="map-card-body">
          <div class="type-counts">
            <span class="type-pill">${escapeHtml(item.map || 'CS2')}</span>
            ${item.site ? `<span class="type-pill">Site ${escapeHtml(item.site)}</span>` : ''}
          </div>
          <h2>${escapeHtml(item.title)}</h2>
          <p>${escapeHtml(item.description || '')}</p>
        </div>
      </a>
    `).join('');
  } catch (error) {
    grid.innerHTML = `<div class="empty"><strong>Error al cargar Execute.</strong><br><br>${escapeHtml(error.message)}</div>`;
  }
})();
