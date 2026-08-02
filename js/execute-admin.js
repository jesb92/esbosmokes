let executeData = { executes: [] };
let editingExecuteId = null;
let previewObjectUrl = null;

(async () => {
  renderHeader('admin');
  renderFooter();

  try {
    const response = await fetch('data/executes.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('No se pudo cargar data/executes.json');
    executeData = await response.json();
    validateExecuteData(executeData);
    renderExecuteList();
  } catch (error) {
    setStatus(`Error: ${error.message}`);
  }

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
  document.querySelector('[data-video-file]').addEventListener('change', selectVideoFile);

  renderCardPreview();
})();

function saveExecute(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = new FormData(form);

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
    videoUrl: String(values.get('videoUrl') || '').trim(),
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

  if (editingExecuteId) {
    const index = executeData.executes.findIndex(entry => entry.id === editingExecuteId);
    executeData.executes[index] = item;
    toast('Tarjeta actualizada');
  } else {
    executeData.executes.unshift(item);
    toast('Tarjeta creada');
  }

  markExecutePending();
  renderExecuteList();
  resetExecuteForm();
}

function renderExecuteList() {
  const query = String(document.querySelector('[data-execute-search]')?.value || '').toLowerCase().trim();
  const items = executeData.executes.filter(item => {
    const text = [item.title, item.map, item.site, ...(item.tags || [])].join(' ').toLowerCase();
    return text.includes(query);
  });

  document.querySelector('[data-execute-count]').textContent = `${executeData.executes.length} ${executeData.executes.length === 1 ? 'tarjeta' : 'tarjetas'}`;
  document.querySelector('[data-execute-items]').innerHTML = items.length
    ? items.map(item => `
      <div class="admin-item execute-admin-item">
        <img src="${escapeAttr(item.thumbnail)}" alt="" loading="lazy" onerror="this.hidden=true">
        <div class="execute-admin-item-copy">
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.map)}${item.site ? ` · Site ${escapeHtml(item.site)}` : ''} · ${item.published ? 'Publicada' : 'Borrador'}</p>
        </div>
        <div class="admin-item-actions">
          <button class="small-btn" type="button" data-edit-execute="${escapeAttr(item.id)}">Editar</button>
          <button class="small-btn" type="button" data-duplicate-execute="${escapeAttr(item.id)}">Duplicar</button>
          <button class="small-btn" type="button" data-delete-execute="${escapeAttr(item.id)}">Eliminar</button>
        </div>
      </div>
    `).join('')
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
  form.elements.title.value = item.title || '';
  form.elements.id.value = item.id || '';
  form.elements.map.value = item.map || '';
  form.elements.site.value = item.site || '';
  form.elements.difficulty.value = item.difficulty || 'media';
  form.elements.thumbnail.value = item.thumbnail || '';
  form.elements.videoUrl.value = item.videoUrl || '';
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
  renderExecuteList();
  toast('Tarjeta eliminada');
}

function resetExecuteForm() {
  editingExecuteId = null;
  const form = document.querySelector('[data-execute-form]');
  form.reset();
  form.elements.difficulty.value = 'media';
  form.elements.published.checked = true;
  document.querySelector('[data-execute-form-title]').textContent = 'Nueva tarjeta';
  document.querySelector('[data-execute-save]').textContent = 'Crear tarjeta';
  clearPreviewObjectUrl();
  renderCardPreview();
}

function renderCardPreview() {
  const form = document.querySelector('[data-execute-form]');
  const title = form.elements.title.value.trim() || 'Título de la tarjeta';
  const map = form.elements.map.value.trim() || 'Mapa';
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
          <span>${escapeHtml(map)}</span>
          ${site ? `<span>Site ${escapeHtml(site)}</span>` : ''}
          <span>${escapeHtml(difficulty)}</span>
        </div>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(description)}</p>
      </div>
    </article>
  `;
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

function selectVideoFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const safeName = sanitizeFileName(file.name);
  const path = `assets/videos/${safeName}`;
  document.querySelector('[name="videoUrl"]').value = path;
  document.querySelector('[data-video-file-help]').textContent = `Ruta sugerida: ${path}. Copia el archivo a assets/videos/.`;
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

function exportExecutes() {
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
    const parsed = JSON.parse(await file.text());
    validateExecuteData(parsed);
    executeData = parsed;
    renderExecuteList();
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
  if (!data || !Array.isArray(data.executes)) throw new Error('Formato inválido: falta el array executes');
  const ids = new Set();
  data.executes.forEach(item => {
    if (!item.id || !item.title || !item.map || !item.thumbnail) throw new Error(`Tarjeta incompleta: ${item.id || 'sin ID'}`);
    if (ids.has(item.id)) throw new Error(`ID duplicado: ${item.id}`);
    ids.add(item.id);
  });
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
