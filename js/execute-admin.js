let executeData = { executes: [] };
let editingExecuteId = null;

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
    document.querySelector('[data-execute-status]').textContent = `Error: ${error.message}`;
  }

  document.querySelector('[data-execute-form]').addEventListener('submit', saveExecute);
  document.querySelector('[data-execute-reset]').addEventListener('click', resetExecuteForm);
  document.querySelector('[data-execute-search]').addEventListener('input', renderExecuteList);
  document.querySelector('[data-execute-export]').addEventListener('click', exportExecutes);
  document.querySelector('[data-execute-import]').addEventListener('change', importExecutes);
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
    toast('Execute actualizado');
  } else {
    executeData.executes.unshift(item);
    toast('Execute añadido');
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

  document.querySelector('[data-execute-count]').textContent = `${executeData.executes.length} entradas`;
  document.querySelector('[data-execute-items]').innerHTML = items.length
    ? items.map(item => `
      <div class="admin-item">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.map)}${item.site ? ` · Site ${escapeHtml(item.site)}` : ''} · ${item.published ? 'Publicado' : 'Borrador'}</p>
        </div>
        <div class="admin-item-actions">
          <button class="small-btn" type="button" data-edit-execute="${escapeAttr(item.id)}">Editar</button>
          <button class="small-btn" type="button" data-delete-execute="${escapeAttr(item.id)}">Eliminar</button>
        </div>
      </div>
    `).join('')
    : '<div class="empty">No hay resultados.</div>';

  document.querySelectorAll('[data-edit-execute]').forEach(button => {
    button.addEventListener('click', () => editExecute(button.dataset.editExecute));
  });
  document.querySelectorAll('[data-delete-execute]').forEach(button => {
    button.addEventListener('click', () => deleteExecute(button.dataset.deleteExecute));
  });
}

function editExecute(id) {
  const item = executeData.executes.find(entry => entry.id === id);
  if (!item) return;

  editingExecuteId = id;
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

  document.querySelector('[data-execute-form-title]').textContent = 'Editar execute';
  document.querySelector('[data-execute-save]').textContent = 'Guardar cambios';
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteExecute(id) {
  const item = executeData.executes.find(entry => entry.id === id);
  if (!item) return;
  if (!confirm(`¿Eliminar "${item.title}"?`)) return;

  executeData.executes = executeData.executes.filter(entry => entry.id !== id);
  if (editingExecuteId === id) resetExecuteForm();
  markExecutePending();
  renderExecuteList();
  toast('Execute eliminado');
}

function resetExecuteForm() {
  editingExecuteId = null;
  const form = document.querySelector('[data-execute-form]');
  form.reset();
  form.elements.difficulty.value = 'media';
  form.elements.published.checked = true;
  document.querySelector('[data-execute-form-title]').textContent = 'Nuevo execute';
  document.querySelector('[data-execute-save]').textContent = 'Añadir execute';
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
  document.querySelector('[data-execute-status]').textContent = 'JSON exportado. Reemplaza data/executes.json en GitHub.';
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
    document.querySelector('[data-execute-status]').textContent = `Cargado: ${file.name}`;
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
    if (!item.id || !item.title || !item.map || !item.thumbnail) throw new Error(`Execute incompleto: ${item.id || 'sin ID'}`);
    if (ids.has(item.id)) throw new Error(`ID duplicado: ${item.id}`);
    ids.add(item.id);
  });
}

function markExecutePending() {
  document.querySelector('[data-execute-status]').textContent = 'Cambios pendientes de exportar y subir a GitHub.';
}

function lines(value) {
  return String(value || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
}

function slugify(text) {
  return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
