'use strict';

let catalog = [];
let activeType = 'all';
let searchQuery = '';

const grid = document.getElementById('grid');
const emptyEl = document.getElementById('empty');
const loadingEl = document.getElementById('loading');
const statsEl = document.getElementById('stats');
const searchEl = document.getElementById('search');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');
const modalBackdrop = document.getElementById('modal-backdrop');

// ── 데이터 로드 ──────────────────────────────────────────
async function loadCatalog() {
  try {
    const res = await fetch('catalog.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    catalog = await res.json();
  } catch (err) {
    catalog = [];
    console.error('catalog.json 로드 실패:', err);
  }
  loadingEl.classList.add('hidden');
  render();
}

// ── 필터링 ───────────────────────────────────────────────
function filtered() {
  const q = searchQuery.toLowerCase();
  return catalog.filter(a => {
    const typeMatch = activeType === 'all' || a.type === activeType;
    if (!typeMatch) return false;
    if (!q) return true;
    return (
      (a.title || '').toLowerCase().includes(q) ||
      (a.description || '').toLowerCase().includes(q) ||
      (a.tags || []).some(t => t.toLowerCase().includes(q))
    );
  });
}

// ── 렌더링 ───────────────────────────────────────────────
function render() {
  const items = filtered();
  grid.innerHTML = '';
  statsEl.textContent = `총 ${items.length}개 asset`;
  emptyEl.classList.toggle('hidden', items.length > 0);

  for (const asset of items) {
    grid.appendChild(createCard(asset));
  }
}

function badgeClass(type) {
  return `badge badge-${type || 'skill'}`;
}

function createCard(asset) {
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <div class="card-header">
      <span class="card-title">${esc(asset.title)}</span>
      <span class="${badgeClass(asset.type)}">${esc(asset.type)}</span>
    </div>
    <p class="card-desc">${esc(asset.description)}</p>
    <div class="card-tags">
      ${(asset.tags || []).slice(0, 4).map(t => `<span class="tag">${esc(t)}</span>`).join('')}
    </div>
    <div class="card-footer">
      <div class="card-meta">
        <span class="downloads">↓ ${asset.downloads ?? 0}</span>
      </div>
      <span>v${esc(asset.version || '1.0.0')}</span>
    </div>
  `;
  el.addEventListener('click', () => openModal(asset));
  return el;
}

// ── 모달 ─────────────────────────────────────────────────
function openModal(asset) {
  const toolBadges = (asset.tools || [])
    .map(t => `<span class="tool-badge">${esc(t)}</span>`)
    .join('');

  const allTags = (asset.tags || [])
    .map(t => `<span class="tag">${esc(t)}</span>`)
    .join('');

  const zipHref = asset.zipPath ? asset.zipPath : '#';

  modalContent.innerHTML = `
    <div class="modal-type"><span class="${badgeClass(asset.type)}">${esc(asset.type)}</span></div>
    <div class="modal-title">${esc(asset.title)}</div>
    <p class="modal-description">${esc(asset.description)}</p>
    <div class="modal-tags">${allTags}</div>
    <div class="modal-info">
      <span><strong>버전</strong> ${esc(asset.version || '-')}</span>
      <span><strong>업데이트</strong> ${esc(asset.updated || '-')}</span>
      <span><strong>다운로드</strong> ${asset.downloads ?? 0}회</span>
      <span><strong>작성자</strong> ${esc(asset.author || '-')}</span>
    </div>
    <div class="modal-tools">${toolBadges}</div>
    <a class="download-btn" href="${zipHref}" download>다운로드 (.tar.gz)</a>
  `;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ── 이벤트 ───────────────────────────────────────────────
searchEl.addEventListener('input', e => {
  searchQuery = e.target.value;
  render();
});

document.getElementById('filters').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeType = btn.dataset.type;
  render();
});

// ── XSS 방지 ─────────────────────────────────────────────
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── 시작 ─────────────────────────────────────────────────
loadCatalog();
