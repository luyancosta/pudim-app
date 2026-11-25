/* ==========================================================================
   UI helpers — Pudim Du Cariri
   1) Ícones SVG (conjunto único, traço 2px, herdam a cor do texto)
   2) Ordenação por coluna em qualquer tabela (clique no cabeçalho; no celular, seletor)
   Carregar ANTES do app.js. Não depende de nenhum dado do app.
   ========================================================================== */
const ICONS = {
  dashboard: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
  factory: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1M12 18h1M7 18h1"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"/>',
  trending: '<path d="M22 7 13.5 15.5l-5-5L2 17"/><path d="M16 7h6v6"/>',
  hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
  scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  banknote: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  sliders: '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
  pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  plus: '<path d="M5 12h14M12 5v14"/>', minus: '<path d="M5 12h14"/>', check: '<path d="M20 6 9 17l-5-5"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>', undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  hourglass: '<path d="M5 22h14M5 2h14M17 22v-4.17a2 2 0 0 0-.59-1.41L12 12l-4.41 4.42A2 2 0 0 0 7 17.83V22M7 2v4.17a2 2 0 0 0 .59 1.41L12 12l4.41-4.42A2 2 0 0 0 17 6.17V2"/>',
  sort: '<path d="m21 16-4 4-4-4M17 20V4M3 8l4-4 4 4M7 4v16"/>'
};
const EMO = { '✏': 'pencil', '🗑': 'trash', '⚖': 'scale', '📦': 'package', '🎄': 'calendar', '🛒': 'cart', '📄': 'file', '💰': 'banknote', '📞': 'phone', '📊': 'dashboard', '🏭': 'factory', '💸': 'wallet', '🔒': 'lock', '➕': 'plus', '☰': 'menu', '👥': 'users', '🧾': 'receipt', '📈': 'trending', '🔢': 'hash', '🏧': 'banknote', '🕘': 'history', '⚙': 'sliders', '✔': 'check', '📜': 'history', '🔎': 'search', '↩': 'undo', '⏳': 'clock', '🔔': 'bell', '✕': 'x', '➖': 'minus', '✅': 'check-circle', '↕': 'sort', '📤': 'send', '⌛': 'hourglass' };
const svg = (n, c = '') => `<svg class="i ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;
const _alt = Object.keys(EMO).join('|'), RT = new RegExp(_alt), RG = new RegExp('(?:' + _alt + ')\\uFE0F?', 'g');
const _esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function iconize(root) {
  const nos = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) if (RT.test(n.nodeValue) && !n.parentElement.closest('select,option,textarea,script,style,title,svg')) nos.push(n);
  const NOME = { x: 'Remover', pencil: 'Editar', trash: 'Excluir', scale: 'Ajustar saldo', menu: 'Abrir menu', sort: 'Inverter ordem', bell: 'Avisos', plus: 'Adicionar', minus: 'Diminuir' };
  nos.forEach(n => {
    const pai = n.parentElement, ctl = pai.closest('button,a'), t = document.createElement('template'); let ic = '';
    t.innerHTML = _esc(n.nodeValue).replace(RG, m => { ic = EMO[m.replace('\uFE0F', '')]; return svg(ic); }); n.replaceWith(...t.content.childNodes);
    if (ctl && !ctl.textContent.trim() && !ctl.getAttribute('aria-label')) ctl.setAttribute('aria-label', ctl.title || NOME[ic] || 'Ação');
  });
}
/* ordenação: números, moeda (R$), datas dd/mm/aaaa e texto */
function skey(v) {
  const t = String(v).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); let m;
  if ((m = t.match(/^(\d{2})\/(\d{2})\/(\d{4})/))) return +(m[3] + m[2] + m[1]);
  if ((m = t.match(/^([-−]?)R\$ ?([\d.]+(?:,\d+)?)/))) return (m[1] ? -1 : 1) * parseFloat(m[2].replace(/\./g, '').replace(',', '.'));
  if ((m = t.match(/^#?(\d+(?:[.,]\d+)?)(?:\s|$|–)/))) return parseFloat(m[1].replace(',', '.'));
  return t.toLowerCase();
}
const cmp = (x, y) => { const a = skey(x), b = skey(y); return typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b), 'pt-BR', { numeric: true }); };
function ordenaTabela(t, i, dir) {
  const tb = t.tBodies[0], rs = [...tb.rows].filter(r => !r.querySelector('td.vz'));
  rs.sort((a, b) => dir * cmp(a.cells[i].textContent, b.cells[i].textContent)); rs.forEach(r => tb.appendChild(r));
  [...t.tHead.rows[0].cells].forEach((th, j) => j === i ? th.setAttribute('aria-sort', dir > 0 ? 'ascending' : 'descending') : th.removeAttribute('aria-sort'));
}
function tabelas(root) {
  (root.matches && root.matches('.tw') ? [root] : [...root.querySelectorAll('.tw')]).forEach(tw => {
    const t = tw.querySelector('table'); if (tw.dataset.s || tw.closest('.hist') || !t || !t.tHead || t.tBodies[0].rows.length < 3) return; tw.dataset.s = 1;
    const ths = [...t.tHead.rows[0].cells], cols = ths.map((th, i) => [i, th.textContent.trim()]).filter(c => c[1] && c[1] !== 'Ações'); let est = { i: -1, d: 1 };
    cols.forEach(([i]) => { const th = ths[i]; th.tabIndex = 0; th.classList.add('sortable'); const go = () => { est = { i, d: est.i === i ? -est.d : 1 }; ordenaTabela(t, est.i, est.d); sel.value = i; }; th.onclick = go; th.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }; });
    const sel = document.createElement('select'); sel.setAttribute('aria-label', 'Ordenar por'); sel.innerHTML = cols.map(([i, n]) => `<option value="${i}">${n}</option>`).join('');
    sel.onchange = () => { est = { i: +sel.value, d: 1 }; ordenaTabela(t, est.i, 1); };
    const btn = document.createElement('button'); btn.className = 'b sm'; btn.setAttribute('aria-label', 'Inverter ordem'); btn.innerHTML = svg('sort'); btn.onclick = () => { est.d = -est.d; ordenaTabela(t, est.i, est.d); };
    const bar = document.createElement('div'); bar.className = 'sortbar'; bar.append(sel, btn); tw.before(bar);
  });
}
const _mo = new MutationObserver(ms => { _mo.disconnect(); ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) { iconize(n); tabelas(n); } else if (n.nodeType === 3 && n.parentElement) iconize(n.parentElement); })); _mo.observe(document.body, { childList: true, subtree: true }); });
iconize(document.body); tabelas(document.body); _mo.observe(document.body, { childList: true, subtree: true });
