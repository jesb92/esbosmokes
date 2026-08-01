(async () => {
  renderHeader('favorites');
  renderFooter();
  try {
    const data = await loadData();
    const favoriteIds = getFavorites();
    const items = data.nades.filter(n => n.published && favoriteIds.includes(n.id));
    const grid = document.querySelector('[data-favorites-grid]');
    grid.innerHTML = items.length ? items.map(nadeCard).join('') : '<div class="empty">No has guardado ninguna lineup todavía.<br><br><a class="btn btn-primary" href="index.html#maps">Explorar mapas</a></div>';
    bindFavoriteButtons(grid);
  } catch (error) {
    document.querySelector('[data-favorites-grid]').innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`;
  }
})();
