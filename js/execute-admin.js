let executeData = { maps: [], executes: [] };
let editingExecuteId = null;
let editingExecuteMapSlug = null;
let previewObjectUrl = null;

(async () => {
  renderHeader('admin');
  renderFooter();

  bindExecuteAdminEvents();

  try {
    const response = await fetch('data/executes.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('No se pudo cargar data/executes.json');

    executeData = normalizeExecuteData(await response.json());
    validateExecuteData(executeData);
    refreshExecuteAdmin();
    resetExecuteMapForm();
    resetExecuteForm();
  } catch (error) {
    setStatus(`Error: ${error.message}`);
  }
})();

function bindExecuteAdminEvents() {
  document.querySelector('[data-execute-map-form]').addEventListener('submit', saveExecuteMap);
  document.querySelector('[data-execute-map-reset]').addEventListener('click', resetExecuteMapForm);

  const form = document.querySelector('[data-execute-form]');
  form.addEventListener('submit', saveExecute);
  form.addEventListener('input', renderCardPreview);
  form.addEventListener('change', renderCardPreview);

  document.querySelector('[data-create-card]').addEventListener('click', startNewCard);
  document.querySelector('[data-execute-reset]').addEventListener('click', resetExecuteForm);
  document.querySelector('[data-execute-search]').addEventListener('input', renderExecuteList);
  document.querySelector('[data-execute-export]').addEventListener('click', exportExecutes);
  document.querySelector('[data-execute-export-bottom]').addEventListener('click', exportExecutes);
  document.querySelector('[data-execute-import]').addEventListener('change', importExecutes);
  document.querySelector('[data-thumbnail-file]').addEventListener('change', selectThumbnailFile);
  document.querySelector('[data-video-files]').addEventListener('change', selectVideoFiles);
}

function normalizeExecuteData(raw) {
  const data = raw && typeof raw === 'object' ? raw : {};
  const executes = Array.isArray(data.executes)
    ? data.executes.map(item => ({ ...item }))
    : Array.isArray(data)
      ? data.map(item => ({ ...item }))
      : [];

  let maps = Array.isArray(data.maps)
    ? data.maps.map(map => ({
        slug: slugify(map.slug || map.name),
        name: String(map.name || map.slug || '').trim(),
        image: String(map.image || '').trim(),
        description: String(map.description || '').trim()
      }))
    : [];

  if (!maps.length) {
    const seen = new Set();
    maps = executes.reduce((result, item) => {
      const original = String(item.map || '').trim();
      const slug = slugify(original);
      if (!slug || seen.has(slug)) return result;

      seen.add(slug);
      result.push({
        slug,
        name: original || titleFromSlug(slug),
        image: String(item.thumbnail || '').trim(),
        description: `Executes coordinados para ${original || titleFromSlug(slug)}.`
      });
      return result;
    }, []);
  }

  const cleanedMaps = [];
  const seenSlugs = new Set();
  maps.forEach(map => {
    const slug = slugify(map.slug || map.name);
    if (!slug || seenSlugs.has(slug)) return;
    seenSlugs.add(slug);
    cleanedMaps.push({
      slug,
      name: String(map.name || titleFromSlug(slug)).trim(),
      image: String(map.image || '').trim(),
      description: String(map.description || '').trim()
    });
  });
  maps = cleanedMaps;

  const mapByName = new Map();
  maps.forEach(map => {
    mapByName.set(map.slug.toLowerCase(), map.slug);
    mapByName.set(map.name.toLowerCase(), map.slug);
  });

  executes.forEach(item => {
    const original = String(item.map || '').trim();
    const resolved = mapByName.get(original.toLowerCase()) || slugify(original);
    item.map = resolved;
    item.videos = normalizeVideos(item.videos, item.videoUrl);
    delete item.videoUrl;
  });

  return { maps, executes };
}

function refreshExecuteAdmin(selectedMap = '') {
  populateExecuteMaps(selectedMap);
  renderExecuteMapList();
  renderExecuteList();
  renderCardPreview();
}

function executeMapFormValue(name) {
  return document.querySelector(`[name="${name}"]`).value.trim();
}

function saveExecuteMap(event) {
  event.preventDefault();

  const name = executeMapFormValue('mapName');
  const slug = slugify(executeMapFormValue('mapSlug') || name);
  const image = executeMapFormValue('mapImage');
  const description = executeMapFormValue('mapDescription');

  if (!name || !slug || !image) {
    return toast('Completa nombre, slug e imagen');
  }

  const duplicate = executeData.maps.some(map => map.slug === slug && map.slug !== editingExecuteMapSlug);
  if (duplicate) return toast('Ese slug ya existe');

  const map = { slug, name, image, description };

  if (editingExecuteMapSlug) {
    const index = executeData.maps.findIndex(item => item.slug === editingExecuteMapSlug);
    if (index === -1) return;

    executeData.maps[index] = map;

    if (slug !== editingExecuteMapSlug) {
      executeData.executes.forEach(item => {
        if (item.map === editingExecuteMapSlug) item.map = slug;
      });
    }

    toast('Mapa actualizado');
  } else {
    executeData.maps.push(map);
    toast('Mapa añadido');
  }

  markExecutePending();
  refreshExecuteAdmin(slug);
  resetExecuteMapForm();
}

function editExecuteMap(slug) {
  const map = executeData.maps.find(item => item.slug === slug);
  if (!map) return;

  editingExecuteMapSlug = slug;
  document.querySelector('[name="mapName"]').value = map.name || '';
  document.querySelector('[name="mapSlug"]').value = map.slug || '';
  document.querySelector('[name="mapImage"]').value = map.image || '';
  document.querySelector('[name="mapDescription"]').value = map.description || '';
  document.querySelector('[data-execute-map-form-title]').textContent = 'Editar mapa';
  document.querySelector('[data-execute-map-save-label]').textContent = 'Guardar mapa';
  document.querySelector('[data-execute-map-form]').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteExecuteMap(slug) {
  const map = executeData.maps.find(item => item.slug === slug);
  if (!map) return;

  const used = executeData.executes.filter(item => item.map === slug).length;
  if (used) return toast(`No se puede borrar: contiene ${used} ${used === 1 ? 'tarjeta' : 'tarjetas'}`);
  if (!confirm(`¿Eliminar el mapa ${map.name}?`)) return;

  executeData.maps = executeData.maps.filter(item => item.slug !== slug);
  markExecutePending();
  refreshExecuteAdmin();
  resetExecuteMapForm();
  toast('Mapa eliminado');
}

function resetExecuteMapForm() {
  editingExecuteMapSlug = null;
  const form = document.querySelector('[data-execute-map-form]');
  form.reset();
  document.querySelector('[data-execute-map-form-title]').textContent = 'Nuevo mapa';
  document.querySelector('[data-execute-map-save-label]').textContent = 'Añadir mapa';
}

function renderExecuteMapList() {
  const count = document.querySelector('[data-execute-map-count]');
  const list = document.querySelector('[data-execute-map-items]');
  if (!count || !list) return;

  count.textContent = `${executeData.maps.length} ${executeData.maps.length === 1 ? 'mapa' : 'mapas'}`;
  list.innerHTML = executeData.maps.length
    ? executeData.maps.map(map => {
        const cards = executeData.executes.filter(item => item.map === map.slug).length;
        return `
          <div class="admin-item">
            <div>
              <strong>${escapeHtml(map.name)}</strong>
              <p>${escapeHtml(map.slug)} · ${cards} ${cards === 1 ? 'tarjeta' : 'tarjetas'}</p>
            </div>
            <div class="admin-item-actions">
              <button class="small-btn" type="button" data-edit-execute-map="${escapeAttr(map.slug)}">Editar</button>
              <button class="small-btn" type="button" data-delete-execute-map="${escapeAttr(map.slug)}">Eliminar</button>
            </div>
          </div>`;
      }).join('')
    : '<div class="empty">No hay mapas. Añade el primero con el formulario.</div>';

  document.querySelectorAll('[data-edit-execute-map]').forEach(button => {
    button.addEventListener('click', () => editExecuteMap(button.dataset.editExecuteMap));
  });

  document.querySelectorAll('[data-delete-execute-map]').forEach(button => {
    button.addEventListener('click', () => deleteExecuteMap(button.dataset.deleteExecuteMap));
  });
}

function populateExecuteMaps(selectedValue = '') {
  const select = document.querySelector('[name="map"]');
  if (!select) return;

  const current = selectedValue || select.value;

  if (!executeData.maps.length) {
    select.innerHTML = '<option value="">Añade primero un mapa</option>';
    select.disabled = true;
    return;
  }

  select.disabled = false;
  select.innerHTML = executeData.maps
    .map(map => `<option value="${escapeAttr(map.slug)}">${escapeHtml(map.name)}</option>`)
    .join('');

  if (executeData.maps.some(map => map.slug === current)) {
    select.value = current;
  }
}

function saveExecute(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = new FormData(form);

  if (!executeData.maps.length) return toast('Añade primero un mapa');

  const title = String(values.get('title') || '').trim();
  const id = slugify(String(values.get('id') || '').trim() || title);
  if (!id) return toast('Añade un título válido');

  const duplicate = executeData.executes.some(item => item.id === id && item.id !== editingExecuteId);
  if (duplicate) return toast('Ese ID ya existe');

  const current = executeData.executes.find(item => item.id === editingExecuteId);
  const item = {
    id,
    title,
    map: String(values.get('map') || '').trim(),
    site: String(values.get('site') || '').trim(),
    difficulty: String(values.get('difficulty') || 'media'),
    thumbnail: String(values.get('thumbnail') || '').trim(),
    videos: parseVideoLines(values.get('videos')),
    gallery: lines(values.get('gallery')),
    description: String(values.get('description') || '').trim(),
    steps: lines(values.get('steps')),
    tags: String(values.get('tags') || '').split(',').map(tag => tag.trim()).filter(Boolean),
    published: values.get('published') === 'on',
    createdAt: current?.createdAt || new Date().toISOString().slice(0, 10)
  };

  if (!item.title || !item.map || !item.thumbnail) {
    return toast('Completa título, mapa y foto de portada');
  }

  if (!executeData.maps.some(map => map.slug === item.map)) {
    return toast('Selecciona un mapa válido');
  }

  if (editingExecuteId) {
    const index = executeData.executes.findIndex(entry => entry.id === editingExecuteId);
    executeData.executes[index] = item;
    toast('Tarjeta actualizada');
  } else {
    executeData.executes.unshift(item);
    toast('Tarjeta creada');
  }

  markExecutePending();
  refreshExecuteAdmin(item.map);
  resetExecuteForm();
}

function renderExecuteList() {
  const query = String(document.querySelector('[data-execute-search]')?.value || '').toLowerCase().trim();
  const items = executeData.executes.filter(item => {
    const map = getExecuteMap(item.map);
    const text = [item.title, item.map, map?.name, item.site, ...(item.tags || [])].join(' ').toLowerCase();
    return text.includes(query);
  });

  document.querySelector('[data-execute-count]').textContent = `${executeData.executes.length} ${executeData.executes.length === 1 ? 'tarjeta' : 'tarjetas'}`;
  document.querySelector('[data-execute-items]').innerHTML = items.length
    ? items.map(item => {
        const map = getExecuteMap(item.map);
        return `
          <div class="admin-item execute-admin-item">
            <img src="${escapeAttr(item.thumbnail)}" alt="" loading="lazy" onerror="this.hidden=true">
            <div class="execute-admin-item-copy">
              <strong>${escapeHtml(item.title)}</strong>
              <p>${escapeHtml(map?.name || item.map)}${item.site ? ` · Site ${escapeHtml(item.site)}` : ''} · ${item.published ? 'Publicada' : 'Borrador'}</p>
            </div>
            <div class="admin-item-actions">
              <button class="small-btn" type="button" data-edit-execute="${escapeAttr(item.id)}">Editar</button>
              <button class="small-btn" type="button" data-duplicate-execute="${escapeAttr(item.id)}">Duplicar</button>
              <button class="small-btn" type="button" data-delete-execute="${escapeAttr(item.id)}">Eliminar</button>
            </div>
          </div>`;
      }).join('')
    : '<div class="empty">No hay tarjetas.</div>';

  document.querySelectorAll('[data-edit-execute]').forEach(button => {
    button.addEventListener('click', () => editExecute(button.dataset.editExecute));
  });
  document.querySelectorAll('[data-duplicate-execute]').forEach(button => {
    button.addEventListener('click', () => duplicateExecute(button.dataset.duplicateExecute));
  });
  document.querySelectorAll('[data-delete-execute]').forEach(button => {
    button.addEventListener('click', () => deleteExecute(button.dataset.deleteExecute));
  });
}

function startNewCard() {
  if (!executeData.maps.length) {
    document.querySelector('[data-execute-map-form]').scrollIntoView({ behavior: 'smooth', block: 'start' });
    return toast('Añade primero un mapa');
  }

  resetExecuteForm();
  const form = document.querySelector('[data-execute-form]');
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  form.elements.title.focus();
}

function editExecute(id) {
  const item = executeData.executes.find(entry => entry.id === id);
  if (!item) return;

  editingExecuteId = id;
  fillForm(item);
  document.querySelector('[data-execute-form-title]').textContent = 'Editar tarjeta';
  document.querySelector('[data-execute-save]').textContent = 'Guardar cambios';
  document.querySelector('[data-execute-form]').scrollIntoView({ behavior: 'smooth', block: 'start' });
  renderCardPreview();
}

function duplicateExecute(id) {
  const item = executeData.executes.find(entry => entry.id === id);
  if (!item) return;

  editingExecuteId = null;
  fillForm({
    ...item,
    id: `${item.id}-copia`,
    title: `${item.title} (copia)`
  });
  document.querySelector('[data-execute-form-title]').textContent = 'Duplicar tarjeta';
  document.querySelector('[data-execute-save]').textContent = 'Crear copia';
  document.querySelector('[data-execute-form]').scrollIntoView({ behavior: 'smooth', block: 'start' });
  renderCardPreview();
}

function fillForm(item) {
  const form = document.querySelector('[data-execute-form]');
  populateExecuteMaps(item.map || '');
  form.elements.title.value = item.title || '';
  form.elements.id.value = item.id || '';
  form.elements.map.value = item.map || executeData.maps[0]?.slug || '';
  form.elements.site.value = item.site || '';
  form.elements.difficulty.value = item.difficulty || 'media';
  form.elements.thumbnail.value = item.thumbnail || '';
  form.elements.videos.value = serializeVideoLines(normalizeVideos(item.videos, item.videoUrl));
  form.elements.gallery.value = (item.gallery || []).join('\n');
  form.elements.description.value = item.description || '';
  form.elements.steps.value = (item.steps || []).join('\n');
  form.elements.tags.value = (item.tags || []).join(', ');
  form.elements.published.checked = item.published !== false;
}

function deleteExecute(id) {
  const item = executeData.executes.find(entry => entry.id === id);
  if (!item) return;
  if (!confirm(`¿Eliminar la tarjeta "${item.title}"?`)) return;

  executeData.executes = executeData.executes.filter(entry => entry.id !== id);
  if (editingExecuteId === id) resetExecuteForm();
  markExecutePending();
  refreshExecuteAdmin();
  toast('Tarjeta eliminada');
}

function resetExecuteForm() {
  editingExecuteId = null;
  const form = document.querySelector('[data-execute-form]');
  form.reset();
  populateExecuteMaps();
  form.elements.difficulty.value = 'media';
  form.elements.published.checked = true;
  document.querySelector('[data-execute-form-title]').textContent = 'Nueva tarjeta';
  document.querySelector('[data-execute-save]').textContent = 'Crear tarjeta';
  clearPreviewObjectUrl();
  renderCardPreview();
}

function renderCardPreview() {
  const form = document.querySelector('[data-execute-form]');
  if (!form) return;

  const title = form.elements.title.value.trim() || 'Título de la tarjeta';
  const mapSlug = form.elements.map.value;
  const map = getExecuteMap(mapSlug);
  const mapName = map?.name || 'Mapa';
  const site = form.elements.site.value.trim();
  const difficulty = form.elements.difficulty.value || 'media';
  const description = form.elements.description.value.trim() || 'La descripción aparecerá aquí.';
  const thumbnail = previewObjectUrl || form.elements.thumbnail.value.trim();

  document.querySelector('[data-card-preview]').innerHTML = `
    <article class="card map-card execute-preview-card">
      ${thumbnail
        ? `<img src="${escapeAttr(thumbnail)}" alt="Vista previa de ${escapeAttr(title)}" onerror="this.outerHTML='<div class=&quot;execute-preview-placeholder&quot;>Añade una portada</div>'">`
        : '<div class="execute-preview-placeholder">Añade una portada</div>'}
      <div class="map-card-body">
        <div class="type-counts">
          <span>${escapeHtml(mapName)}</span>
          ${site ? `<span>Site ${escapeHtml(site)}</span>` : ''}
          <span>${escapeHtml(difficulty)}</span>
        </div>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(description)}</p>
      </div>
    </article>`;
}

function selectThumbnailFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  clearPreviewObjectUrl();
  previewObjectUrl = URL.createObjectURL(file);
  const safeName = sanitizeFileName(file.name);
  const path = `assets/executes/${safeName}`;
  document.querySelector('[name="thumbnail"]').value = path;
  document.querySelector('[data-thumbnail-file-help]').textContent = `Ruta sugerida: ${path}. Copia el archivo a assets/executes/.`;
  renderCardPreview();
}

function selectVideoFiles(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  const textarea = document.querySelector('[name="videos"]');
  const current = lines(textarea.value);
  const additions = files.map(file => {
    const safeName = sanitizeFileName(file.name);
    const path = `assets/videos/${safeName}`;
    const title = titleFromSlug(safeName.replace(/\.[^.]+$/, ''));
    return `${title} | ${path}`;
  });

  textarea.value = [...current, ...additions].join('\n');
  document.querySelector('[data-video-files-help]').textContent = `${files.length} ${files.length === 1 ? 'vídeo añadido' : 'vídeos añadidos'}. Copia los archivos a assets/videos/.`;
  event.target.value = '';
  renderCardPreview();
}

function clearPreviewObjectUrl() {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }
}

function sanitizeFileName(name) {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const extension = dot > 0 ? name.slice(dot).toLowerCase() : '';
  return `${slugify(base) || 'archivo'}${extension}`;
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
  return lines(value).map((line, index) => {
    const separator = line.indexOf('|');
    if (separator === -1) {
      return { title: `Vídeo ${index + 1}`, url: line.trim() };
    }

    const title = line.slice(0, separator).trim() || `Vídeo ${index + 1}`;
    const url = line.slice(separator + 1).trim();
    return url ? { title, url } : null;
  }).filter(Boolean);
}

function serializeVideoLines(videos) {
  return normalizeVideos(videos)
    .map((video, index) => `${video.title || `Vídeo ${index + 1}`} | ${video.url}`)
    .join('\n');
}

function exportExecutes() {
  validateExecuteData(executeData);
  const text = JSON.stringify(executeData, null, 2) + '\n';
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'executes.json';
  link.click();
  URL.revokeObjectURL(url);
  setStatus('JSON exportado. Reemplaza data/executes.json en tu clon local y haz push.');
  toast('executes.json exportado');
}

async function importExecutes(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const parsed = normalizeExecuteData(JSON.parse(await file.text()));
    validateExecuteData(parsed);
    executeData = parsed;
    refreshExecuteAdmin();
    resetExecuteMapForm();
    resetExecuteForm();
    setStatus(`Cargado: ${file.name}`);
    toast('JSON importado');
  } catch (error) {
    toast(`Error: ${error.message}`);
  } finally {
    event.target.value = '';
  }
}

function validateExecuteData(data) {
  if (!data || !Array.isArray(data.maps)) throw new Error('Formato inválido: falta el array maps');
  if (!Array.isArray(data.executes)) throw new Error('Formato inválido: falta el array executes');

  const mapSlugs = new Set();
  data.maps.forEach(map => {
    if (!map.slug || !map.name || !map.image) throw new Error(`Mapa incompleto: ${map.slug || 'sin slug'}`);
    if (mapSlugs.has(map.slug)) throw new Error(`Slug de mapa duplicado: ${map.slug}`);
    mapSlugs.add(map.slug);
  });

  const ids = new Set();
  data.executes.forEach(item => {
    if (!item.id || !item.title || !item.map || !item.thumbnail) throw new Error(`Tarjeta incompleta: ${item.id || 'sin ID'}`);
    if (ids.has(item.id)) throw new Error(`ID duplicado: ${item.id}`);
    if (!mapSlugs.has(item.map)) throw new Error(`La tarjeta ${item.id} usa un mapa inexistente: ${item.map}`);
    ids.add(item.id);
  });
}

function getExecuteMap(slug) {
  return executeData.maps.find(map => map.slug === slug);
}

function markExecutePending() {
  setStatus('Cambios pendientes de exportar y subir a GitHub.');
}

function setStatus(text) {
  const status = document.querySelector('[data-execute-status]');
  if (status) status.textContent = text;
}

function lines(value) {
  return String(value || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function titleFromSlug(slug) {
  return String(slug || '')
    .split('-')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
