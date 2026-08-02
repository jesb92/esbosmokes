const DATA_PATH = 'data/nades.json';
const TYPE_LABELS = { smoke: 'Smoke', molotov: 'Molotov', flash: 'Flash', he: 'HE' };
const TYPE_ICONS = { smoke: '☁', molotov: '🔥', flash: '✦', he: '●' };

async function loadData() {
  const response = await fetch(DATA_PATH, { cache: 'no-store' });
  if (!response.ok) throw new Error('No se pudo cargar data/nades.json');
  return response.json();
}

function getFavorites() {
  try { return JSON.parse(localStorage.getItem('esboSmokesFavorites') || '[]'); }
  catch { return []; }
}

function setFavorites(items) {
  localStorage.setItem('esboSmokesFavorites', JSON.stringify([...new Set(items)]));
  updateFavoriteBadge();
}

function toggleFavorite(id) {
  const favorites = getFavorites();
  const next = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
  setFavorites(next);
  document.querySelectorAll(`[data-favorite-id="${CSS.escape(id)}"]`).forEach(btn => {
    const active = next.includes(id);
    btn.classList.toggle('is-favorite', active);
    btn.setAttribute('aria-label', active ? 'Quitar de favoritos' : 'Añadir a favoritos');
    btn.textContent = active ? '★' : '☆';
  });
  toast(next.includes(id) ? 'Añadida a favoritos' : 'Eliminada de favoritos');
}

function updateFavoriteBadge() {
  const el = document.querySelector('[data-favorites-count]');
  if (el) el.textContent = getFavorites().length;
}

function toast(message) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

function getYouTubeEmbed(url) {
  if (!url) return '';
  const patterns = [
    /youtu\.be\/([\w-]{6,})/,
    /youtube\.com\/watch\?v=([\w-]{6,})/,
    /youtube\.com\/embed\/([\w-]{6,})/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube-nocookie.com/embed/${match[1]}`;
  }
  return '';
}

function renderVideoPlayer(url, title = 'Vídeo de la lineup') {
  const value = String(url || '').trim();
  if (!value) {
    return `<div class="video-placeholder"><strong>Vídeo pendiente</strong><span>Añade una URL de YouTube o una ruta MP4 desde el editor de contenido.</span></div>`;
  }

  const embed = getYouTubeEmbed(value);
  if (embed) {
    return `<iframe src="${escapeAttr(embed)}" title="${escapeAttr(title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }

  const cleanPath = value.split('?')[0].split('#')[0].toLowerCase();
  const isVideoFile = ['.mp4', '.webm', '.ogg', '.ogv'].some(ext => cleanPath.endsWith(ext));
  if (isVideoFile) {
    return `<video controls preload="metadata" playsinline title="${escapeAttr(title)}"><source src="${escapeAttr(value)}">Tu navegador no puede reproducir este vídeo.</video>`;
  }

  return `<div class="video-placeholder"><strong>Formato no reconocido</strong><span>Usa una URL de YouTube o una ruta terminada en .mp4, .webm, .ogg u .ogv.</span></div>`;
}

function nadeCard(nade) {
  const favorite = getFavorites().includes(nade.id);
  return `
    <article class="card nade-card">
      <div class="nade-card-media">
        <a href="nade.html?id=${encodeURIComponent(nade.id)}" aria-label="Abrir ${escapeHtml(nade.title)}">
          <img src="${escapeAttr(nade.thumbnail)}" alt="${escapeAttr(nade.title)}">
        </a>
        <span class="nade-icon">${TYPE_ICONS[nade.type] || ''} ${TYPE_LABELS[nade.type] || nade.type}</span>
        <button class="favorite-btn ${favorite ? 'is-favorite' : ''}" data-favorite-id="${escapeAttr(nade.id)}" aria-label="${favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}">${favorite ? '★' : '☆'}</button>
      </div>
      <div class="nade-card-body">
        <a href="nade.html?id=${encodeURIComponent(nade.id)}"><h3>${escapeHtml(nade.title)}</h3></a>
        <div class="route"><span>${escapeHtml(nade.origin)}</span><span class="arrow">→</span><span>${escapeHtml(nade.target)}</span></div>
        <div class="meta">
          <span class="pill">${escapeHtml(nade.team)}</span>
          <span class="pill">${escapeHtml(nade.difficulty)}</span>
          <span class="pill">${escapeHtml(nade.throw)}</span>
        </div>
      </div>
    </article>`;
}

function bindFavoriteButtons(root = document) {
  root.querySelectorAll('[data-favorite-id]').forEach(btn => {
    btn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      toggleFavorite(btn.dataset.favoriteId);
    });
  });
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
}
function escapeAttr(value = '') { return escapeHtml(value); }
function params() { return new URLSearchParams(location.search); }
function mapBySlug(data, slug) { return data.maps.find(map => map.slug === slug); }

function renderHeader(active = '') {
  document.querySelector('[data-site-header]').innerHTML = `
    <header class="site-header">
      <div class="container nav">
        <a class="brand" href="index.html"><img src="assets/logo.svg" alt="EsboSmokes"></a>
        <nav class="nav-links" aria-label="Principal">
          <a class="${active === 'maps' ? 'active' : ''}" href="index.html#maps">Mapas</a>
          <a class="${active === 'execute' ? 'active' : ''}" href="execute.html#execute">Execute</a>
          <a class="${active === 'favorites' ? 'active' : ''}" href="favorites.html">Favoritos <span class="badge-count" data-favorites-count>0</span></a>
          <a class="${active === 'admin' ? 'active' : ''}" href="admin.html">Editor</a>
        </nav>
      </div>
    </header>`;
  updateFavoriteBadge();
}

function renderFooter() {
  document.querySelector('[data-site-footer]').innerHTML = `
    <footer class="footer">
      <div class="container footer-row">
        <span>EsboSmokes</span>
        <span>Humos oficiales de Colegio Labor</span>
      </div>
    </footer>`;
}
