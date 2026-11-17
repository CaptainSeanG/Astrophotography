const byId = id => document.getElementById(id);
const detail = byId('detail');
const viewer = byId('viewer');
const stage = byId('stage');
const full = byId('full');
const photographs = galleryData.map(target => {
  const catalog = targetCatalog[target.id] ?? {};
  const aliases = [target.aliases, catalog.aliases].filter(Boolean).join(', ').split(', ');
  return { ...target, ...catalog, ...(targetDetails[target.id] ?? {}), libraryName: catalog.libraryName ?? target.name, aliases: [...new Set(aliases)].join(', ') };
});
const targets = new Map(photographs.map(target => [target.id, target]));
const asset = (target, variant) => target.images?.[variant] ?? `images/${target.id}-${variant}.webp`;
const hours = seconds => `${(seconds / 3600).toFixed(2)} h`;
const normalize = value => value.toLowerCase().replace(/[^a-z0-9]/g, '');
let selected;
const featured = targets.get('m106') ?? photographs[0];
if (featured) {
  document.querySelector('.hero-photo').src = asset(featured, 'preview');
  const credit = document.querySelector('.hero-credit');
  credit.dataset.target = featured.id;
  credit.firstChild.textContent = featured.name + ' ';
}

function element(tag, value, className) {
  const item = document.createElement(tag);
  if (value) item.textContent = value;
  if (className) item.className = className;
  return item;
}

function objectTypes(target) {
  return new Set([target.type, target.subtype, ...(target.tags ?? [])].filter(Boolean));
}

const typeFilters = [
  ['Galaxy', 'Galaxies'], ['Nebula', 'All nebulae'],
  ['Emission nebula', 'Emission nebulae'], ['Planetary nebula', 'Planetary nebulae'],
  ['Reflection nebula', 'Reflection nebulae'], ['Dark nebula', 'Dark nebulae'],
  ['Supernova remnant', 'Supernova remnants'], ['Globular cluster', 'Globular clusters'],
  ['Open cluster', 'Open clusters']
];
for (const [value, label] of typeFilters) {
  const count = photographs.filter(target => objectTypes(target).has(value)).length;
  if (!count) continue;
  const option = element('option', `${label} (${count})`);
  option.value = value;
  byId('type').append(option);
}

function render() {
  const query = normalize(byId('search').value);
  const type = byId('type').value;
  const order = byId('sort').value;
  const compare = {
    library: (a, b) => a.libraryName.localeCompare(b.libraryName, 'en-US'),
    name: (a, b) => a.name.localeCompare(b.name),
    recent: (a, b) => Date.parse(b.finished) - Date.parse(a.finished),
    hours: (a, b) => (b.integrationSeconds ?? -1) - (a.integrationSeconds ?? -1)
  };
  const matches = photographs.filter(target =>
    (!type || objectTypes(target).has(type)) && normalize(`${target.name} ${target.aliases} ${target.id}`).includes(query)
  ).sort(compare[order]);
  byId('empty').hidden = matches.length > 0;
  byId('photographs').replaceChildren(...matches.map(target => {
    const card = element('button', '', 'card');
    card.type = 'button';
    card.dataset.target = target.id;
    const image = element('img');
    image.src = asset(target, 'thumb');
    image.alt = '';
    image.loading = 'lazy';
    const copy = element('span', '', 'card-body');
    copy.append(element('span', target.aliases, 'alias'), element('strong', target.name),
      element('span', target.subtype, 'meta'));
    card.append(image, copy);
    return card;
  }));
}

function openDetail(target) {
  selected = target;
  const preview = byId('preview');
  preview.alt = target.name;
  preview.src = asset(target, 'preview');
  byId('detail-alias').textContent = target.aliases;
  byId('detail-title').textContent = target.name;
  byId('description').textContent = target.description ?? '';
  byId('description').hidden = !target.description;
  const source = byId('source');
  source.hidden = !target.source;
  if (target.source) source.href = target.source;
  const magnitudeSource = byId('magnitude-source');
  magnitudeSource.hidden = !target.magnitudeSource;
  if (target.magnitudeSource) magnitudeSource.href = target.magnitudeSource;
  byId('image-note').hidden = !target.imageNote;
  byId('image-note').textContent = target.imageNote ?? '';
  const rows = [
    ['Object type', target.subtype ?? target.type],
    ['Constellation', target.constellation],
    ['Apparent magnitude', target.magnitude ?? 'No verified integrated value'],
    ['Approx. distance', target.distance ? `${target.distance} light-years` : 'Not verified'],
    ['Integrated exposure', target.integrationSeconds === null ? 'Unverified' : hours(target.integrationSeconds)],
    ['Captured exposure¹', typeof target.capturedHours === 'number' && `${target.capturedHours.toFixed(2)} h`],
    ...target.filters.map(group => [group.filter, `${hours(group.seconds)} · ${group.frames} frames`]),
    ['Full resolution', `${target.width} × ${target.height} pixels`]
  ];
  byId('facts').replaceChildren(...rows.filter(([, value]) => value).flatMap(([key, value]) => [element('dt', key), element('dd', value)]));
  byId('capture-note').hidden = typeof target.capturedHours !== 'number';
  detail.showModal();
}

let zoom = 1;
let x = 0;
let y = 0;
let fitting = true;
const points = new Map();
const fitScale = () => Math.min(stage.clientWidth / selected.width, stage.clientHeight / selected.height, 1);
const clamp = (value, limit) => Math.min(limit, Math.max(-limit, value));

function paint() {
  if (!viewer.open) return;
  x = clamp(x, Math.max(0, (selected.width * zoom - stage.clientWidth) / 2));
  y = clamp(y, Math.max(0, (selected.height * zoom - stage.clientHeight) / 2));
  full.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${zoom})`;
  byId('zoom-status').textContent = `${Math.round(zoom * 100)}% · ${selected.width} × ${selected.height} pixels`;
}

function fit() {
  fitting = true;
  zoom = fitScale();
  x = y = 0;
  paint();
}

function setZoom(next, anchorX = 0, anchorY = 0) {
  fitting = false;
  const value = Math.min(4, Math.max(fitScale(), next));
  x = anchorX + (x - anchorX) * value / zoom;
  y = anchorY + (y - anchorY) * value / zoom;
  zoom = value;
  paint();
}

function openViewer() {
  full.alt = selected.name;
  full.width = selected.width;
  full.height = selected.height;
  full.src = asset(selected, 'full');
  byId('viewer-title').textContent = selected.name;
  viewer.showModal();
  fit();
}

document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-target]');
  if (trigger) openDetail(targets.get(trigger.dataset.target));
});
byId('search').addEventListener('input', render);
for (const id of ['type', 'sort']) byId(id).addEventListener('change', render);
byId('close-detail').onclick = () => detail.close();
byId('enlarge').onclick = openViewer;
byId('close-viewer').onclick = () => viewer.close();
byId('fit').onclick = fit;
byId('actual').onclick = () => setZoom(1);
byId('zoom-in').onclick = () => setZoom(zoom * 1.3);
byId('zoom-out').onclick = () => setZoom(zoom / 1.3);
viewer.addEventListener('close', () => points.clear());
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const modal = viewer.open ? viewer : detail.open ? detail : null;
  if (!modal) return;
  event.preventDefault();
  if (!event.repeat) modal.close();
});
detail.addEventListener('click', event => {
  if (event.target !== detail) return;
  const rect = detail.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom) detail.close();
});

function offset(clientX, clientY) {
  const rect = stage.getBoundingClientRect();
  return [clientX - rect.left - rect.width / 2, clientY - rect.top - rect.height / 2];
}

stage.addEventListener('wheel', event => {
  event.preventDefault();
  setZoom(zoom * (event.deltaY < 0 ? 1.16 : 1 / 1.16), ...offset(event.clientX, event.clientY));
}, { passive: false });
stage.addEventListener('pointerdown', event => {
  if (points.size === 2 || event.button !== 0) return;
  stage.setPointerCapture(event.pointerId);
  points.set(event.pointerId, [event.clientX, event.clientY]);
});
stage.addEventListener('pointermove', event => {
  const previous = points.get(event.pointerId);
  if (!previous) return;
  const next = [event.clientX, event.clientY];
  points.set(event.pointerId, next);
  if (points.size === 2) {
    const other = [...points.entries()].find(([id]) => id !== event.pointerId)[1];
    const distance = point => Math.hypot(point[0] - other[0], point[1] - other[1]);
    const oldDistance = distance(previous);
    if (oldDistance > 0) setZoom(zoom * distance(next) / oldDistance,
      ...offset((next[0] + other[0]) / 2, (next[1] + other[1]) / 2));
  } else {
    x += next[0] - previous[0];
    y += next[1] - previous[1];
    paint();
  }
});
stage.addEventListener('lostpointercapture', event => points.delete(event.pointerId));
stage.addEventListener('keydown', event => {
  const moves = { ArrowLeft: [50, 0], ArrowRight: [-50, 0], ArrowUp: [0, 50], ArrowDown: [0, -50] };
  if (Object.hasOwn(moves, event.key)) {
    event.preventDefault();
    const [dx, dy] = moves[event.key];
    x += dx;
    y += dy;
    paint();
  } else if (event.key === '+' || event.key === '=' || event.key === '-') {
    event.preventDefault();
    setZoom(zoom * (event.key === '-' ? 1 / 1.3 : 1.3));
  }
});
new ResizeObserver(() => {
  if (!viewer.open) return;
  if (fitting) fit();
  else if (zoom < fitScale()) setZoom(fitScale());
  else paint();
}).observe(stage);

render();
