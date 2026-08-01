(async () => {
  renderHeader('maps');
  renderFooter();
  try {
    const data = await loadData();
    const published = data.nades.filter(n => n.published);
    document.querySelector('[data-total-nades]').textContent = published.length;
    document.querySelector('[data-total-maps]').textContent = data.maps.length;
    document.querySelector('[data-total-featured]').textContent = published.filter(n => n.featured).length;

    const mapGrid = document.querySelector('[data-map-grid]');
    mapGrid.innerHTML = data.maps.map(map => {
      const items = published.filter(n => n.map === map.slug);
      const counts = ['smoke', 'molotov', 'flash', 'he'].map(type => {
        const count = items.filter(n => n.type === type).length;
        return `<span class="type-pill">${TYPE_ICONS[type]} ${TYPE_LABELS[type]} ${count}</span>`;
      }).join('');
      return `
        <a class="card map-card" href="map.html?map=${encodeURIComponent(map.slug)}">
          <img src="${escapeAttr(map.image)}" alt="Mapa ${escapeAttr(map.name)}">
          <div class="map-card-body">
            <h2>${escapeHtml(map.name)}</h2>
            <p>${escapeHtml(map.description)}</p>
            <div class="type-counts">${counts}</div>
          </div>
        </a>`;
    }).join('');

    const featured = published.filter(n => n.featured).slice(0, 6);
    const featuredGrid = document.querySelector('[data-featured-grid]');
    featuredGrid.innerHTML = featured.length ? featured.map(nadeCard).join('') : '<div class="empty">Todavía no hay lineups destacadas.</div>';
    bindFavoriteButtons(featuredGrid);
  } catch (error) {
    document.querySelector('main').innerHTML = `<div class="container section"><div class="empty"><strong>Error al cargar el contenido.</strong><br>${escapeHtml(error.message)}<br><br>Comprueba que GitHub Pages esté activo y que <span class="kbd">data/nades.json</span> exista en el repositorio.</div></div>`;
  }
})();
