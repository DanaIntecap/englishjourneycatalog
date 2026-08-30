const ui = {
  level: document.querySelector('#levelFilter'),
  unit: document.querySelector('#unitFilter'),
  skill: document.querySelector('#skillFilter'),
  grid: document.querySelector('#catalogGrid'),
  count: document.querySelector('#resultCount'),
  clear: document.querySelector('#clearFilters')
};

let catalogData = [];

const asArray = value => Array.isArray(value) ? value : (value == null || value === '' ? [] : [String(value)]);
const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[character]);
const sorted = values => [...values].sort((a, b) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' }));

function populateFilter(select, values) {
  sorted(values).forEach(value => select.add(new Option(value, value)));
}

function matches(values, selection) {
  return !selection || asArray(values).includes(selection);
}

function list(items, ordered = false) {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${asArray(items).map(item => `<li>${escapeHTML(item)}</li>`).join('')}</${tag}>`;
}

function cardTemplate(resource) {
  const badges = [
    ...asArray(resource.level).map(value => `<span class="badge level">${escapeHTML(value)}</span>`),
    ...asArray(resource.skill).map(value => `<span class="badge skill">${escapeHTML(value)}</span>`),
    ...asArray(resource.unit).map(value => `<span class="badge unit">Unidad ${escapeHTML(value)}</span>`)
  ].join('');

  return `<article class="card">
    <h3>${escapeHTML(resource.title)}</h3>
    <div class="badges">${badges}</div>
    <p>${escapeHTML(resource.description)}</p>
    <details class="pedagogical-sheet">
      <summary>Ver ficha pedagógica</summary>
      <div class="sheet-content">
        <h4>Objetivo de aprendizaje</h4><p>${escapeHTML(resource.objective)}</p>
        <h4>Instrucciones para el instructor</h4>${list(resource.instructions, true)}
        <h4>Variaciones</h4>${list(resource.variations)}
        <div class="resource-meta"><span><strong>Duración:</strong> ${escapeHTML(resource.duration)}</span><span><strong>Plataforma:</strong> ${escapeHTML(resource.platform)}</span><span><strong>Tipo:</strong> ${escapeHTML(resource.resourceType)}</span></div>
      </div>
    </details>
    ${resource.url ? `<a class="activity-link" href="${escapeHTML(resource.url)}" target="_blank" rel="noopener noreferrer">Ir a la actividad</a>` : ''}
  </article>`;
}

function renderCatalog() {
  const resources = catalogData.filter(resource => resource.active &&
    matches(resource.level, ui.level.value) &&
    matches(resource.unit, ui.unit.value) &&
    matches(resource.skill, ui.skill.value));

  ui.count.textContent = `${resources.length} recurso${resources.length === 1 ? '' : 's'} encontrado${resources.length === 1 ? '' : 's'}.`;
  ui.grid.innerHTML = resources.length
    ? resources.map(cardTemplate).join('')
    : '<p class="empty">No hay recursos que coincidan con esos filtros. Prueba otra combinación.</p>';
}

async function initializeCatalog() {
  try {
    const response = await fetch('./catalog.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    catalogData = Array.isArray(payload) ? payload : payload.resources;
    if (!Array.isArray(catalogData)) throw new TypeError('catalog.json debe contener un arreglo de recursos.');

    populateFilter(ui.level, new Set(catalogData.flatMap(resource => asArray(resource.level))));
    populateFilter(ui.unit, new Set(catalogData.flatMap(resource => asArray(resource.unit))));
    populateFilter(ui.skill, new Set(catalogData.flatMap(resource => asArray(resource.skill))));
    [ui.level, ui.unit, ui.skill].forEach(select => select.addEventListener('change', renderCatalog));
    ui.clear.addEventListener('click', () => {
      ui.level.value = '';
      ui.unit.value = '';
      ui.skill.value = '';
      renderCatalog();
    });
    renderCatalog();
  } catch (error) {
    ui.count.textContent = '';
    ui.grid.innerHTML = '<p class="empty">No fue posible cargar el catálogo. Confirma que catalog.json esté publicado en la misma carpeta.</p>';
    console.error('Error al cargar el catálogo:', error);
  }
}

initializeCatalog();
