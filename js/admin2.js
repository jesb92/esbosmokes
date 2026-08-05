let workingData;
let editingId = null;
let editingMapSlug = null;

(async () => {
  renderHeader('admin');
  renderFooter();
  try {
    workingData = await loadData();
    populateMaps();
    renderMapList();
    renderAdminList();
    resetMapForm();
    resetForm();
  } catch (error) {
    document.querySelector('[data-admin-status]').textContent = error.message;
  }

  document.querySelector('[data-map-form]')?.addEventListener('submit', saveMap);
  document.querySelector('[data-map-reset]')?.addEventListener('click', resetMapForm);
  document.querySelector('[data-nade-form]')?.addEventListener('submit', saveEntry);
  document.querySelector('[data-reset-form]')?.addEventListener('click', resetForm);
  document.querySelector('[data-export-json]')?.addEventListener('click', exportJson);
  document.querySelector('[data-import-json]')?.addEventListener('change', importJson);
  document.querySelector('[data-admin-search]')?.addEventListener('input', renderAdminList);
})();

function populateMaps(selectedValue = '') {
  const select = document.querySelector('[name="map"]');
  const current = selectedValue || select.value;
  select.innerHTML = workingData.maps
    .map(map => `<option value="${escapeAttr(map.slug)}">${escapeHtml(map.name)}</option>`)
    .join('');
  if (workingData.maps.some(map => map.slug === current)) select.value = current;
}

function getNamedField(name) {
  return document.querySelector(`[name="${name}"]`);
}

function formValue(name) {
  const field = getNamedField(name);
  return field ? String(field.value || '').trim() : '';
}

function mapFormValue(name) {
  const field = getNamedField(name);
  return field ? String(field.value || '').trim() : '';
}

function saveMap(event) {
  event.preventDefault();
  const name = mapFormValue('mapName');
  const slug = slugify(mapFormValue('mapSlug'));
  const image = mapFormValue('mapImage');
  const description = mapFormValue('mapDescription');

  if (!name || !slug || !image) return toast('Completa nombre, slug e imagen');
  const duplicate = workingData.maps.some(map => map.slug === slug && map.slug !== editingMapSlug);
  if (duplicate) return toast('Ese slug ya existe');

  const map = { slug, name, image, description, order: Number(existing?.order ?? workingData.maps.length + 1) };
  if (editingMapSlug) {
    const index = workingData.maps.findIndex(item => item.slug === editingMapSlug);
    if (index === -1) return;
    workingData.maps[index] = map;
    if (slug !== editingMapSlug) {
      workingData.nades.forEach(nade => {
        if (nade.map === editingMapSlug) nade.map = slug;
      });
    }
    toast('Mapa actualizado');
  } else {
    workingData.maps.push(map);
    toast('Mapa añadido');
  }

  populateMaps(slug);
  renderMapList();
  renderAdminList();
  resetMapForm();
  markPending();
}

function editMap(slug) {
  const map = workingData.maps.find(item => item.slug === slug);
  if (!map) return;
  editingMapSlug = slug;
  document.querySelector('[name="mapName"]').value = map.name || '';
  document.querySelector('[name="mapSlug"]').value = map.slug || '';
  document.querySelector('[name="mapImage"]').value = map.image || '';
  document.querySelector('[name="mapDescription"]').value = map.description || '';
  document.querySelector('[data-map-form-title]').textContent = 'Editar mapa';
  document.querySelector('[data-map-save-label]').textContent = 'Guardar mapa';
  document.querySelector('[data-map-form]').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteMap(slug) {
  const map = workingData.maps.find(item => item.slug === slug);
  if (!map) return;
  const used = workingData.nades.filter(nade => nade.map === slug).length;
  if (used) return toast(`No se puede borrar: contiene ${used} lineups`);
  if (!confirm(`¿Eliminar el mapa ${map.name}?`)) return;
  workingData.maps = workingData.maps.filter(item => item.slug !== slug);
  populateMaps();
  renderMapList();
  resetMapForm();
  markPending();
  toast('Mapa eliminado');
}

function resetMapForm() {
  editingMapSlug = null;
  document.querySelector('[data-map-form]').reset();
  document.querySelector('[data-map-form-title]').textContent = 'Nuevo mapa';
  document.querySelector('[data-map-save-label]').textContent = 'Añadir mapa';
}

function renderMapList() {
  if (!workingData) return;
  document.querySelector('[data-map-count]').textContent = `${workingData.maps.length} mapas`;
  document.querySelector('[data-map-items]').innerHTML = workingData.maps.map(map => {
    const count = workingData.nades.filter(nade => nade.map === map.slug).length;
    return `
      <div class="admin-item">
        <div>
          <strong>${escapeHtml(map.name)}</strong>
          <p>${escapeHtml(map.slug)} · ${count} lineups</p>
        </div>
        <div class="admin-item-actions">
          <button class="small-btn" type="button" onclick="editMap('${escapeJs(map.slug)}')">Editar</button>
          <button class="small-btn" type="button" onclick="deleteMap('${escapeJs(map.slug)}')">Eliminar</button>
        </div>
      </div>`;
  }).join('') || '<div class="empty">No hay mapas.</div>';
}

function saveEntry(event) {
  event.preventDefault();

  try {
    if (!workingData || !Array.isArray(workingData.nades)) {
      throw new Error('Los datos todavía no se han cargado.');
    }

    const title = formValue('title');
    const map = formValue('map');
    const origin = formValue('origin');
    const target = formValue('target');

    if (!title || !map || !origin || !target) {
      toast('Completa título, mapa, origen y destino');
      showAdminError('Faltan campos obligatorios: título, mapa, origen o destino.');
      return;
    }

    const proposedId =
      formValue('id') ||
      slugify(`${map}-${origin}-${target}-${formValue('type')}`);

    if (!proposedId) {
      throw new Error('No se pudo generar el ID de la lineup.');
    }

    const duplicate = workingData.nades.some(
      nade => nade.id === proposedId && nade.id !== editingId
    );

    if (duplicate) {
      toast('Ese ID ya existe');
      showAdminError(`Ya existe una lineup con el ID "${proposedId}".`);
      return;
    }

    const existing = workingData.nades.find(nade => nade.id === editingId);
    const mapRecord = workingData.maps.find(item => item.slug === map);

    const videos = parseVideoLines(formValue('videos'));

    const entry = {
      id: proposedId,
      title,
      map,
      type: formValue('type'),
      team: formValue('team'),
      origin,
      target,
      difficulty: formValue('difficulty'),
      throw: formValue('throw'),
      movement: formValue('movement'),
      precision: formValue('precision'),
      setpos: formValue('setpos'),
      videos,
      videoUrl: videos.length ? videos[0].url : '',
      thumbnail: formValue('thumbnail') || existing?.thumbnail || '',
      description: formValue('description'),
      steps: formValue('steps')
        .split('\n')
        .map(value => value.trim())
        .filter(Boolean),
      tags: formValue('tags')
        .split(',')
        .map(value => value.trim())
        .filter(Boolean),
      featured: Boolean(getNamedField('featured')?.checked),
      published: Boolean(getNamedField('published')?.checked),
      createdAt: existing?.createdAt || new Date().toISOString().slice(0, 10)
    };

    if (editingId) {
      const index = workingData.nades.findIndex(nade => nade.id === editingId);

      if (index === -1) {
        throw new Error('No se encontró la lineup que estabas editando.');
      }

      workingData.nades[index] = entry;
      toast('Lineup actualizada');
    } else {
      workingData.nades.unshift(entry);
      toast('Lineup añadida');
    }

    renderAdminList();
    renderMapList();
    markPending();

    const status = document.querySelector('[data-admin-status]');
    if (status) {
      status.textContent =
        `Cambios guardados en el editor: ${videos.length} vídeo${videos.length === 1 ? '' : 's'}. Ahora pulsa Exportar JSON.`;
    }

    resetForm();
  } catch (error) {
    console.error('Error al guardar la lineup:', error);
    toast(`No se pudo guardar: ${error.message}`);
    showAdminError(error.message);
  }
}

function editEntry(id) {
  const entry = workingData.nades.find(n => n.id === id);
  if (!entry) return;
  editingId = id;
  const fields = ['id','title','map','type','team','origin','target','difficulty','throw','movement','precision','setpos','thumbnail','description'];
  fields.forEach(name => {
    const el = document.querySelector(`[name="${name}"]`);
    if (el) el.value = entry[name] || '';
  });
  const normalizedVideos = normalizeVideos(entry.videos, entry.videoUrl);
  const videosField = getNamedField('videos');

  if (videosField) {
    videosField.value = serializeVideoLines(normalizedVideos);
  }

  document.querySelector('[name="steps"]').value = (entry.steps || []).join('\n');
  document.querySelector('[name="tags"]').value = (entry.tags || []).join(', ');
  document.querySelector('[name="featured"]').checked = Boolean(entry.featured);
  document.querySelector('[name="published"]').checked = Boolean(entry.published);
  document.querySelector('[data-form-title]').textContent = 'Editar lineup';
  document.querySelector('[data-save-label]').textContent = 'Guardar cambios';
  document.querySelector('[data-nade-form]').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteEntry(id) {
  const entry = workingData.nades.find(n => n.id === id);
  if (!entry || !confirm(`¿Eliminar "${entry.title}"?`)) return;
  workingData.nades = workingData.nades.filter(n => n.id !== id);
  if (editingId === id) resetForm();
  renderAdminList();
  renderMapList();
  markPending();
  toast('Lineup eliminada');
}

function resetForm() {
  editingId = null;
  const form = document.querySelector('[data-nade-form]');
  form.reset();
  const publishedField = getNamedField('published');
  const typeField = getNamedField('type');
  if (publishedField) publishedField.checked = true;
  if (typeField) typeField.value = 'smoke';
  document.querySelector('[data-form-title]').textContent = 'Nueva lineup';
  document.querySelector('[data-save-label]').textContent = 'Añadir lineup';
}

function renderAdminList() {
  if (!workingData) return;
  const searchField = document.querySelector('[data-admin-search]');
  const query = searchField
    ? searchField.value.trim().toLowerCase()
    : '';
  const items = workingData.nades.filter(n => !query || [n.title,n.map,n.origin,n.target,n.type].join(' ').toLowerCase().includes(query));
  document.querySelector('[data-admin-count]').textContent = `${workingData.nades.length} entradas`;
  document.querySelector('[data-admin-items]').innerHTML = items.map(n => `
    <div class="admin-item">
      <div>
        <strong>${escapeHtml(n.title)}</strong>
        <p>${escapeHtml(n.map)} · ${escapeHtml(n.origin)} → ${escapeHtml(n.target)} · ${normalizeVideos(n.videos, n.videoUrl).length} vídeo(s) · ${n.published ? 'Publicada' : 'Borrador'}</p>
      </div>
      <div class="admin-item-actions">
        <button class="small-btn" type="button" onclick="editEntry('${escapeJs(n.id)}')">Editar</button>
        <button class="small-btn" type="button" onclick="deleteEntry('${escapeJs(n.id)}')">Eliminar</button>
      </div>
    </div>`).join('') || '<div class="empty">No hay resultados.</div>';
}


function normalizeVideos(videos, legacyVideoUrl = '') {
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
    normalized.push({ title: 'Vídeo 1', url: legacy });
  }

  return normalized;
}

function parseVideoLines(value) {
  return String(value || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const separator = line.indexOf('|');

      if (separator === -1) {
        return {
          title: `Vídeo ${index + 1}`,
          url: line
        };
      }

      const title = line.slice(0, separator).trim() || `Vídeo ${index + 1}`;
      const url = line.slice(separator + 1).trim();

      return url ? { title, url } : null;
    })
    .filter(Boolean);
}

function serializeVideoLines(videos) {
  return normalizeVideos(videos)
    .map((video, index) => `${video.title || `Vídeo ${index + 1}`} | ${video.url}`)
    .join('\n');
}

function exportJson() {
  const text = JSON.stringify(workingData, null, 2) + '\n';
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'nades.json';
  link.click();
  URL.revokeObjectURL(url);
  document.querySelector('[data-admin-status]').textContent = 'JSON exportado. Reemplaza data/nades.json en tu repositorio de GitHub.';
  toast('nades.json exportado');
}

async function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    validateImportedData(parsed);
    workingData = parsed;
    populateMaps();
    renderMapList();
    renderAdminList();
    resetMapForm();
    resetForm();
    document.querySelector('[data-admin-status]').textContent = `Cargado: ${file.name}`;
    toast('JSON importado');
  } catch (error) {
    toast(`Error: ${error.message}`);
  } finally {
    event.target.value = '';
  }
}

function validateImportedData(data) {
  if (!data || !Array.isArray(data.maps) || !Array.isArray(data.nades)) throw new Error('Formato inválido');
  const mapSlugs = new Set();
  data.maps.forEach(map => {
    if (!map.slug || !map.name || !map.image) throw new Error('Hay un mapa incompleto');
    if (mapSlugs.has(map.slug)) throw new Error(`Mapa duplicado: ${map.slug}`);
    mapSlugs.add(map.slug);
  });
  const nadeIds = new Set();
  data.nades.forEach(nade => {
    if (!nade.id || !nade.title || !mapSlugs.has(nade.map)) throw new Error(`Lineup inválida: ${nade.id || 'sin ID'}`);
    if (nadeIds.has(nade.id)) throw new Error(`ID duplicado: ${nade.id}`);
    nadeIds.add(nade.id);
  });
}


function showAdminError(message) {
  const status = document.querySelector('[data-admin-status]');
  if (!status) return;

  status.textContent = `Error al guardar: ${message}`;
  status.classList.add('admin-status-error');
}

window.addEventListener('error', event => {
  const message = event.error?.message || event.message || 'Error de JavaScript';
  console.error(event.error || event);
  showAdminError(message);
});

window.addEventListener('unhandledrejection', event => {
  const message = event.reason?.message || String(event.reason || 'Error inesperado');
  console.error(event.reason);
  showAdminError(message);
});

function markPending() {
  const status = document.querySelector('[data-admin-status]');
  if (!status) return;

  status.classList.remove('admin-status-error');
  status.textContent = 'Cambios pendientes de exportar y subir a GitHub.';
}

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function escapeJs(value = '') { return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
