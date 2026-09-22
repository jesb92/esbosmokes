(async () => {
  renderHeader('maps');
  renderFooter();
  const slug = params().get('map') || 'mirage';
  try {
    const data = await loadData();
    const map = mapBySlug(data, slug);
    if (!map) throw new Error('El mapa solicitado no existe.');
    document.title = `${map.name} · EsboSmokes`;
    document.querySelector('[data-map-name]').textContent = map.name;
    document.querySelector('[data-map-description]').textContent = map.description;
    document.querySelector('[data-map-image]').src = map.image;
    document.querySelector('[data-map-image]').alt = `Mapa ${map.name}`;

    const items = data.nades.filter(n => n.published && n.map === slug);
    const grid = document.querySelector('[data-nade-grid]');
    const count = document.querySelector('[data-result-count]');
    const search = document.querySelector('[data-search]');
    const type = document.querySelector('[data-type]');
    const team = document.querySelector('[data-team]');
    const difficulty = document.querySelector('[data-difficulty]');
    const teamCards = Array.from(document.querySelectorAll('[data-team-choice]'));
    const teamStatus = document.querySelector('[data-team-status]');

    function syncTeamCards() {
      const selectedTeam = String(team.value || '').toUpperCase();

      teamCards.forEach(button => {
        const isActive = button.dataset.teamChoice === selectedTeam;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });

      if (teamStatus) {
        teamStatus.textContent = selectedTeam
          ? `Mostrando solo ${selectedTeam}`
          : 'Mostrando ambos equipos';
      }
    }

    function render() {
      const query = search.value.trim().toLowerCase();
      const filtered = items.filter(n => {
        const haystack = [n.title, n.origin, n.target, n.description, ...(n.tags || [])].join(' ').toLowerCase();
        return (!query || haystack.includes(query)) &&
          (!type.value || n.type === type.value) &&
          (!team.value || String(n.team || '').toUpperCase() === team.value) &&
          (!difficulty.value || n.difficulty === difficulty.value);
      });
      count.textContent = `${filtered.length} lineup${filtered.length === 1 ? '' : 's'}`;
      grid.innerHTML = filtered.length ? filtered.map(nadeCard).join('') : '<div class="empty">No hay resultados con estos filtros.</div>';
      bindFavoriteButtons(grid);
    }
    teamCards.forEach(button => {
      button.addEventListener('click', () => {
        const choice = button.dataset.teamChoice;

        team.value = team.value === choice ? '' : choice;
        syncTeamCards();
        render();
      });
    });

    [search, type, team, difficulty].forEach(el => {
      el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', () => {
        syncTeamCards();
        render();
      });
    });

    syncTeamCards();
    render();
  } catch (error) {
    document.querySelector('main').innerHTML = `<div class="container section"><div class="empty">${escapeHtml(error.message)}</div></div>`;
  }
})();
