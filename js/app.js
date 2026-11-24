'use strict';
/* ============ CONFIG ============ */
const firebaseConfig = {
  apiKey: "AIzaSyDctGxi1zGwJuHJ_eaFJn3TmErK9tWaGy0",
  authDomain: "pudimducaririapp.firebaseapp.com",
  databaseURL: "https://pudimducaririapp-default-rtdb.firebaseio.com",
  projectId: "pudimducaririapp",
  storageBucket: "pudimducaririapp.firebasestorage.app",
  messagingSenderId: "302932015479",
  appId: "1:302932015479:web:dd46d6c1c0b27ee6948972"
};
const ADMIN = 'luyan@pudim.com', VIEWER = 'beatriz@pudim.com';
const LS = 'pudimDB_v2', LSV = 'pudimVersoes_v2';
const EMP = { fantasia: 'Pudim Du Cariri', cnpj: '64.056.475/0001-82', tel: '(88) 99644-5147', pix: 'pudimducariri@gmail.com' };
const KEYS = ['clientes', 'vendas', 'atacado', 'despesas', 'pagamentos', 'producoes', 'estoqueMov', 'ajustes', 'compras', 'sabores', 'itensExtra', 'eventos', 'log', 'fechamentos'];

/* ============ HELPERS ============ */
const $ = id => document.getElementById(id);
const num = v => parseFloat(v) || 0;
const r2 = v => Math.round(v * 100) / 100;
const hoje = () => { const t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset()); return t.toISOString().slice(0, 10); };
const R$ = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(v) < 0.005 ? 0 : v);
const fdata = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '-';
const arr = o => !o ? [] : (Array.isArray(o) ? o : Object.values(o)).filter(Boolean);
let _ult = 0;
const uid = () => { let n = Date.now() * 1000; if (n <= _ult) n = _ult + 1; _ult = n; return n; }; // sempre crescente: mantém a ordem dos lançamentos
const prox = a => a.length ? Math.max(...a.map(x => x.num || 0)) + 1 : 1;
const difDias = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);
const gp = (o, p) => p.split('.').reduce((a, k) => a && a[k], o);
const sp = (o, p, v) => { const k = p.split('.'), l = k.pop(); k.reduce((a, x) => a[x], o)[l] = v; };
const ordenar = a => [...a].sort((x, y) => (x.data || '') === (y.data || '') ? (y.id || 0) - (x.id || 0) : ((x.data || '') < (y.data || '') ? 1 : -1));
const bt = (t, fn, c = '') => `<button class="b sm ${c.includes('v') ? '' : 'adm'} ${c}" onclick="${fn}">${t}</button>`;
const inp = (id, t, v = '', o = []) => t === 'select'
  ? `<select id="${id}">${o.map(x => `<option value="${x[0]}" ${String(x[0]) === String(v) ? 'selected' : ''}>${x[1]}</option>`).join('')}</select>`
  : `<input id="${id}" type="${t}" step="any" value="${v}">`;
const tbl = (h, r, vz = 'Nada por aqui ainda.') => `<div class="tw"><table><thead><tr>${h.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${r.length ? r.map(x => `<tr>${x.map((c, i) => `<td data-label="${h[i] || ''}">${c}</td>`).join('')}</tr>`).join('') : `<tr><td class="vz" colspan="${h.length}">${vz}</td></tr>`}</tbody></table></div>`;
const kpi = (t, v, cl = '') => `<div class="k ${cl}"><small>${t}</small><b>${v}</b></div>`;
let _trava = 0;
function toast(m, err) { if (!err && Date.now() < _trava) return; const t = $('toast'); t.textContent = m; t.className = 'on' + (err ? ' err' : ''); clearTimeout(t._t); t._t = setTimeout(() => t.className = '', err ? 6500 : (m.length > 60 ? 5500 : 3200)); }
const falha = m => { _trava = Date.now() + 2500; toast(m, 1); return false; };
function ask(titulo, campos, cb) {
  $('m-t').textContent = titulo;
  $('m-b').innerHTML = campos.map(c => `<label>${c[1]}</label>${inp('m-' + c[0], c[2], c[3], c[4])}`).join('');
  $('m-ok').hidden = false; $('m-x').textContent = 'Cancelar'; $('modal').hidden = false;
  $('m-ok').onclick = () => { const v = {}; campos.forEach(c => v[c[0]] = $('m-' + c[0]).value); fechar(); cb(v); };
}
function info(t, h) { $('m-t').textContent = t; $('m-b').innerHTML = h; $('m-ok').hidden = true; $('m-x').textContent = 'Fechar'; $('modal').hidden = false; }
function fechar() { $('modal').hidden = true; }

/* ============ DADOS ============ */
const SP = { tradicional: 'pudim', ninho: 'pudim_ninho', brigadeirao: 'pudim_brig' };
const NS = { tradicional: 'Tradicional', ninho: 'Ninho c/ Nutella', brigadeirao: 'Brigadeirão' };
const ITENS = {
  pudim: ['Pudim Tradicional', 'un'], pudim_ninho: ['Pudim Ninho', 'un'], pudim_brig: ['Pudim Brigadeirão', 'un'],
  leite_condensado: ['Leite Condensado', 'un'], leite_integral: ['Leite Integral', 'ml'], ovos: ['Ovos', 'un'], acucar: ['Açúcar', 'g'],
  leite_po: ['Leite em Pó', 'g'], nutella: ['Nutella', 'g'], creme_leite: ['Creme de Leite', 'g'], chocolate_50: ['Chocolate 50%', 'g'], granulado: ['Granulado', 'g'],
  copo: ['Copos', 'un'], tampa: ['Tampas', 'un'], sacola_1: ['Sacola (1 un)', 'un'], sacola_2: ['Sacola (2 un)', 'un'], adesivo: ['Adesivos', 'un'], colher: ['Colheres', 'un']
};
const PRONTOS = { includes: k => k.startsWith('pudim') }, EMB = ['copo', 'tampa', 'sacola_1', 'sacola_2', 'adesivo', 'colher'];
const ativo = k => !(db.config.inativos || {})[k];
const minOf = k => (db.config.minimos || {})[k] ?? MIN[k] ?? (PRONTOS.includes(k) ? 5 : 0);
const MIN = { pudim: 5, pudim_ninho: 5, pudim_brig: 5, leite_condensado: 3, leite_integral: 1000, ovos: 12, acucar: 500, leite_po: 300, nutella: 300, creme_leite: 300, chocolate_50: 200, granulado: 100, copo: 25, tampa: 25, sacola_1: 20, sacola_2: 15, adesivo: 25, colher: 25 };
const REC = {
  tradicional: { rende: 6, prod: 'pudim', ins: { leite_condensado: 1, leite_integral: 400, ovos: 3, acucar: 200 } },
  ninho: { rende: 7, prod: 'pudim_ninho', ins: { leite_condensado: 1, leite_integral: 400, ovos: 3, leite_po: 130, nutella: 700 / 12, creme_leite: 700 / 12 } },
  brigadeirao: { rende: 7, prod: 'pudim_brig', ins: { leite_condensado: 1, leite_integral: 200, ovos: 3, creme_leite: 200, chocolate_50: 90, granulado: 35 } }
};
const UN = { un: 1, kg: 1000, g: 1, l: 1000, ml: 1, pct20: 20 };
const UNOK = { g: ['kg', 'g'], ml: ['l', 'ml'], un: ['un', 'pct20'] };
const FK = ['lc', 'li', 'ov', 'ac', 'cp', 'tp', 'ad', 'sc', 'co', 'lp', 'nt', 'cl', 'ch', 'gr'];
const FL = ['Leite condensado (un)', 'Leite integral (litro)', 'Ovos (pacote c/ 20)', 'Açúcar (kg)', 'Copo (un)', 'Tampa (un)', 'Adesivo (un)', 'Sacola (un)', 'Colher (un)', 'Leite em pó (kg)', 'Nutella (kg)', 'Creme de leite (kg)', 'Chocolate 50% (kg)', 'Granulado (kg)'];
const TABS = [
  ['dashboard', '📊', 'Painel'], ['estoque', '🏭', 'Estoque e produção'], ['vendas', '🛒', 'Varejo (PDV)'], ['atacado', '📦', 'Atacado'], ['clientes', '👥', 'Clientes'], ['eventos', '🎄', 'Eventos'],
  ['receber', '⏳', 'A receber'], ['compras', '🧾', 'Compra direta'], ['precos', '📈', 'Histórico de preços'], ['contagem', '🔢', 'Contagem mensal'], ['rateio', '⚖️', 'Rateio'],
  ['despesas', '💸', 'Despesas'], ['saques', '🏧', 'Saques'], ['log', '🕘', 'Alterações'], ['fechamento', '🔒', 'Fechamento do mês'], ['config', '⚙️', 'Configurações']
];
const CFG0 = {
  precoUnd: 15, precoCombo: 40, custoCopo: 1.5, taxaCredIns: 4.98, taxaCredApr: 3.09, taxaDebIns: 1.99, taxaDebApr: 0.89, taxaOnline: 2.99, diasAviso: 7,
  insumo: { varejo: { tradicional: 6.22, ninho: 7.29, brigadeirao: 6.96 }, atacado: { tradicional: 5.12, ninho: 6.19, brigadeirao: 5.86 } },
  ficha: { lc: 6.5, li: 4.5, ov: 14, ac: 4, cp: 1.5, tp: 1.2, ad: .55, sc: .9, co: .2, lp: 40, nt: 75, cl: 10, ch: 60, gr: 40 },
  abasViewer: { dashboard: true, contagem: true, estoque: true }, setupFeito: false,
  legado: {
    varejo: { bruto: 28063.00, liq: 25839.10, ent: 774.00, q: 1977, ins: 12394.96, cg: 2139.77, mo: 2953.12, l: 8351.24, fundo: 1088.82, lu: 3880.82, bea: 2675.96, giro: 705.64 },
    atacado: { bruto: 42665.22, ent: -495.82, liq: 42169.40, q: 3904, ins: 21605.84, cg: 3398.80, mo: 4458.73, l: 12706.03, fundo: 1691.37, lu: 5987.80, bea: 4134.94, giro: 891.92 }
  }
};
let db, role = 'viewer', email = '', carregou = false, ultimoTotal = 0, ultimoSync = {}, ultimoJSON = '', cart = [], edit = {};

const PRE0 = { leite_condensado: 6.5, leite_integral: 4.5, ovos: 14, acucar: 4, copo: 1.5, tampa: 1.2, adesivo: .55, sacola: .9, colher: .2, leite_po: 40, nutella: 75, creme_leite: 10, chocolate_50: 60, granulado: 40 };
const MAPF = { lc: 'leite_condensado', li: 'leite_integral', ov: 'ovos', ac: 'acucar', cp: 'copo', tp: 'tampa', ad: 'adesivo', sc: 'sacola', co: 'colher', lp: 'leite_po', nt: 'nutella', cl: 'creme_leite', ch: 'chocolate_50', gr: 'granulado' };
const SAB0 = [
  { id: 'tradicional', nome: 'Tradicional', rende: 6, adic: 0, prod: 'pudim', ins: { leite_condensado: 1, leite_integral: 400, ovos: 3, acucar: 200 } },
  { id: 'ninho', nome: 'Ninho c/ Nutella', rende: 7, adic: 1, prod: 'pudim_ninho', ins: { leite_condensado: 1, leite_integral: 400, ovos: 3, leite_po: 130, nutella: 58.33, creme_leite: 58.33 } },
  { id: 'brigadeirao', nome: 'Brigadeirão', rende: 7, adic: 0, prod: 'pudim_brig', ins: { leite_condensado: 1, leite_integral: 200, ovos: 3, creme_leite: 200, chocolate_50: 90, granulado: 35 } }
];
function carregar(d) {
  d = d || {}; const c = d.config || {}, i = c.insumo || {};
  const fp = { ...PRE0 }; if (c.ficha) Object.entries(MAPF).forEach(([a, b]) => { if (c.ficha[a] !== undefined) fp[b] = c.ficha[a]; }); Object.assign(fp, c.fichaPrecos);
  const o = { config: { ...CFG0, ...c, insumo: { varejo: { ...CFG0.insumo.varejo, ...i.varejo }, atacado: { ...CFG0.insumo.atacado, ...i.atacado } }, ficha: { ...CFG0.ficha, ...c.ficha }, abasViewer: { ...CFG0.abasViewer, ...c.abasViewer }, fichaPrecos: fp, inativos: { ...c.inativos }, minimos: { ...c.minimos }, itensNome: { ...c.itensNome }, legado: { varejo: { ...CFG0.legado.varejo, ...(c.legado || {}).varejo }, atacado: { ...CFG0.legado.atacado, ...(c.legado || {}).atacado } } } };
  KEYS.forEach(k => o[k] = arr(d[k]));
  const ex = o.sabores; o.sabores = SAB0.map(b => ex.find(x => x.id === b.id) || JSON.parse(JSON.stringify(b))).concat(ex.filter(x => !SAB0.some(b => b.id === x.id)));
  return o;
}
db = carregar(null);
const total = d => KEYS.filter(k => k !== 'log' && k !== 'fechamentos').reduce((a, k) => a + arr(d[k]).length, 0);
const custo = (s, canal) => db.config.insumo[canal][s] || 0;

/* ============ GRAVAÇÃO SEGURA ============ */
function versoes() {
  try {
    const v = JSON.parse(localStorage.getItem(LSV) || '[]');
    if (ultimoJSON && (!v.length || Date.now() - v[0].ts > 600000)) { v.unshift({ ts: Date.now(), json: ultimoJSON }); localStorage.setItem(LSV, JSON.stringify(v.slice(0, 5))); }
  } catch (e) { }
}
function recarregaLocal() { if (ultimoJSON) { try { db = carregar(JSON.parse(ultimoJSON)); } catch (e) { } } updateAll(); }
function guardar(forcar) {
  if (role !== 'admin') { recarregaLocal(); return falha('Modo visualização: só o administrador altera.'); }
  if (!carregou) { recarregaLocal(); return falha('Ainda sincronizando com a nuvem. NADA foi salvo, tente de novo em instantes.'); }
  const t = total(db);
  if (!forcar && ultimoTotal > 10 && t < ultimoTotal * 0.5) { db = carregar(JSON.parse(ultimoJSON)); updateAll(); return falha('Gravação bloqueada: os dados ficaram muito menores. Nada foi alterado.'); }
  versoes();
  if (ultimoJSON) { try { registrarLog(carregar(JSON.parse(ultimoJSON)), forcar); } catch (e) { console.error('log', e); } }
  // UMA única gravação com tudo que mudou (várias gravações seguidas faziam a nuvem devolver dados antigos e apagar o resto)
  const up = {}; KEYS.concat('config').forEach(k => { const j = JSON.stringify(db[k]); if (j !== ultimoSync[k]) { const v = JSON.parse(j); up[k] = Array.isArray(v) && !v.length ? null : v; } });
  ultimoTotal = t; ultimoJSON = JSON.stringify(db);
  try { localStorage.setItem(LS, ultimoJSON); } catch (e) { }
  const erroNuvem = e => { $('sync').classList.add('off'); toast('NÃO SALVOU na nuvem (' + (e.code || e.message) + '). Confira a internet e as regras do Firebase.', 1); };
  if (Object.keys(up).length) { try { firebase.database().ref('pudimAppDB').update(up).then(() => $('sync').classList.remove('off')).catch(erroNuvem); } catch (e) { erroNuvem(e); } }
  updateAll(); return true;
}

/* ============ CÁLCULOS ============ */
const comboOk = v => v.produto === 'Combo' && Array.isArray(v.saboresCombo) && v.saboresCombo.length === 3;
const unid = v => comboOk(v) ? v.saboresCombo.map(s => [s, num(v.qtd) || 1]) : [[v.sabor || 'tradicional', (v.produto === 'Combo' ? 3 : 1) * (num(v.qtd) || 1)]];
const qtdTotal = v => unid(v).reduce((a, x) => a + x[1], 0);
const nomeSab = v => { if (comboOk(v)) { const c = {}; v.saboresCombo.forEach(s => c[s] = (c[s] || 0) + 1); return Object.entries(c).map(([s, n]) => `${n}x ${NS[s]}`).join(' + '); } return NS[v.sabor] || 'Tradicional'; };
const rateio = b => { const cg = b * .15, mo = b * .23, l = b - cg - mo; return { cg, mo, l, fundo: l * .12, bea: l * .35, lu: l * .53 }; };

/* Pudins EXTRAS (rendeu mais que o esperado) não gastam ingrediente: nas vendas seguintes, os primeiros
   pudins vendidos de cada sabor ficam mais baratos (só embalagem), e o rateio é refeito com esse custo menor. */
const ingUnd = s => { const x = db.sabores.find(y => y.id === s) || REC[s]; if (!x || !num(x.rende)) return 0; let r = 0; for (const k in (x.ins || {})) r += num(x.ins[k]) * costBase(k); return r / num(x.rende); };
function economiaExtras() {
  const M = new Map(), ex = db.producoes.filter(p => num(p.extra) > 0); if (!ex.length) return M;
  const ev = [], pool = {};
  ex.forEach(p => ev.push({ d: p.data || '', id: p.id, t: 0, sab: p.sabor, n: num(p.extra) }));
  db.vendas.forEach(v => unid(v).forEach(([s, n]) => ev.push({ d: v.data || '', id: v.id, t: 1, sab: s, n, k: 'v:' + v.id })));
  db.atacado.forEach(a => atItens(a).forEach(i => ev.push({ d: a.data || '', id: a.id, t: 1, sab: i.sabor, n: num(i.qtd), k: 'a:' + a.id })));
  ev.sort((a, b) => a.d === b.d ? (a.t - b.t || a.id - b.id) : (a.d < b.d ? -1 : 1));
  ev.forEach(e => { if (e.t === 0) pool[e.sab] = (pool[e.sab] || 0) + e.n; else { const t = Math.min(pool[e.sab] || 0, e.n); if (t > 0) { pool[e.sab] -= t; M.set(e.k, (M.get(e.k) || 0) + t * ingUnd(e.sab)); } } });
  return M;
}
/* Atacado só entra nos números quando PAGO (mas conta no mês do pedido). */
function linhasFin() {
  const L = [], M = economiaExtras();
  db.vendas.forEach(v => { const q = qtdTotal(v), ins = Math.max(0, q * num(v.custoUnd) - (M.get('v:' + v.id) || 0)), liq = num(v.liquido); L.push({ canal: v.evento ? 'evento' : 'varejo', ev: v.evento || '', data: v.data || '', q, bruto: num(v.bruto), liq, ins, ...rateio(liq - ins), sab: unid(v) }); });
  db.atacado.filter(a => a.status === 'PAGO').forEach(a => { const ins = Math.max(0, insAt(a) - (M.get('a:' + a.id) || 0)), liq = num(a.totalLiquido); L.push({ canal: 'atacado', data: a.data || '', q: num(a.qtd), bruto: num(a.totalBruto), liq, ins, ...rateio(liq - ins), sab: atItens(a).map(i => [i.sabor, num(i.qtd)]) }); });
  return L;
}
function saldos() {
  const s = {}; Object.keys(ITENS).forEach(k => s[k] = 0);
  db.estoqueMov.forEach(m => { if (s[m.item] !== undefined) s[m.item] += m.tipo === 'entrada' ? num(m.qtd) : -num(m.qtd); });
  // Insumos baixam SOMENTE na receita; a receita já cria o pudim pronto.
  db.producoes.forEach(p => { const r = REC[p.sabor] || REC.tradicional, q = num(p.qtd); const ex = num(p.extra); s[r.prod] += q * r.rende + ex; for (const k in r.ins) s[k] -= q * r.ins[k]; ['copo', 'tampa', 'adesivo'].forEach(k => s[k] -= q * r.rende + ex); });
  // Venda baixa o pudim pronto, a colher e a sacola (nunca os insumos de novo).
  db.vendas.forEach(v => { unid(v).forEach(([sb, q]) => s[SP[sb] || 'pudim'] -= q); s.colher -= qtdTotal(v); if (v.evento) { const e = db.eventos.find(x => x.id === v.evento); if (e && e.itemEmb && s[e.itemEmb] !== undefined) s[e.itemEmb] -= num(e.embQtd) * qtdTotal(v); } if (v.sacTipo && v.sacTipo !== 'nenhuma') s[v.sacTipo] -= num(v.sacQtd); });
  db.atacado.forEach(a => { atItens(a).forEach(i => s[SP[i.sabor] || 'pudim'] -= num(i.qtd)); s.copo += num(a.copos); });
  return s;
}
const CATS = ['INSUMOS', 'EMBALAGEM', 'GASTOS GERAIS', 'MARKETING', 'ENTREGADOR'];
const CXD = { INSUMOS: ['Insumos', 'Insumo fixo'], EMBALAGEM: ['Insumos', 'Insumo fixo'], 'GASTOS GERAIS': ['CG', 'Custos gerais'], MARKETING: ['Fundo', 'Fundo empresa'], ENTREGADOR: ['Entrega', 'Gaveta entregas'] };
// categoria desconhecida/antiga conta como Gastos gerais (antes era ignorada e não descontava de nada)
const catDesp = d => { const k = String(d.categoria || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase(); return CATS.includes(k) ? k : 'GASTOS GERAIS'; };
const dtot = d => num(d.total) || r2((num(d.qtd) || 1) * num(d.unitario));
function caixas() {
  const L = linhasFin(), sm = k => L.reduce((a, x) => a + x[k], 0);
  const dsp = c => db.despesas.filter(d => catDesp(d) === c).reduce((a, d) => a + dtot(d), 0);
  const aj = c => db.ajustes.filter(a => a.caixa === c).reduce((a, x) => a + num(x.valor), 0);
  const sq = t => db.pagamentos.filter(p => p.tipo === t).reduce((a, p) => a + num(p.valor), 0);
  const ev = []; db.vendas.forEach(v => { if (num(v.entrega) > 0) ev.push({ d: v.data || '', id: v.id, t: 'e', v: num(v.entrega) }); });
  db.despesas.filter(d => catDesp(d) === 'ENTREGADOR').forEach(d => ev.push({ d: d.data || '', id: d.id, t: 's', v: dtot(d) }));
  db.ajustes.filter(a => a.caixa === 'Entrega').forEach(a => ev.push({ d: a.data || '', id: a.id, t: 'a', v: num(a.valor) }));
  const rk = e => e.t === 's' ? 1 : 0;
  ev.sort((a, b) => a.d === b.d ? (rk(a) - rk(b) || a.id - b.id) : (a.d < b.d ? -1 : 1));
  let gav = 0, desc = 0; ev.forEach(e => { if (e.t === 'e' || e.t === 'a') gav += e.v; else { const t = Math.min(Math.max(gav, 0), e.v); gav -= t; desc += e.v - t; } });
  const c = { Insumos: sm('ins') - dsp('INSUMOS') - dsp('EMBALAGEM') + aj('Insumos'), CG: sm('cg') - dsp('GASTOS GERAIS') - desc + aj('CG'), MO: sm('mo') - sq('MaoObra') + aj('MO'), Fundo: sm('fundo') - dsp('MARKETING') + aj('Fundo'), Luyan: sm('lu') - sq('Luyan') + aj('Luyan'), Beatriz: sm('bea') - sq('Beatriz') + aj('Beatriz'), Entrega: gav };
  c.total = Object.values(c).reduce((a, b) => a + b, 0) + aj('Caixa Geral'); return c;
}
function recompra() {
  return db.clientes.filter(c => c.ativo !== 'nao').map(c => {
    const ds = db.atacado.filter(a => a.clienteId === c.id).map(a => a.data).sort(), ult = ds[ds.length - 1]; if (!ult) return null;
    const dias = difDias(ult, hoje()), lim = num(c.prazo) || db.config.diasAviso, ct = c.contatadoEm && difDias(c.contatadoEm, hoje()) < lim;
    return { c, ult, dias, lim, alerta: dias >= lim && !ct };
  }).filter(Boolean);
}
const wpp = c => { const d = (c.tel || '').replace(/\D/g, ''); return 'https://wa.me/' + (d.length <= 11 ? '55' + d : d) + '?text=' + encodeURIComponent(`Oi, ${c.nome}, tudo bem? Aqui é do Pudim Du Cariri 🍮 Como está o estoque de pudins por aí? Posso separar seu próximo pedido?`); };
const atrasado = a => a.status !== 'PAGO' && a.venc && a.venc < hoje();

/* ============ CRUD GENÉRICO ============ */
const optCli = () => db.clientes.filter(c => c.ativo !== 'nao').map(c => [c.id, c.nome]);
const optSab = () => Object.entries(NS).filter(([k]) => ativo(SP[k]));
const optIt = () => Object.entries(ITENS).filter(([k]) => ativo(k)).map(([k, v]) => [k, v[0]]);
const optComp = () => optIt().filter(([k]) => !PRONTOS.includes(k));
const SCH = {
  clientes: { t: 'Cliente', custom: 1, req: ['nome', 'tel'], f: [['nome', 'Nome do cliente', 'text'], ['tel', 'Telefone (com DDD)', 'tel'], ['endereco', 'Endereço (rua, número, bairro)', 'text'], ['cidade', 'Cidade', 'text'], ['uf', 'Estado (UF)', 'text'], ['prazo', 'Prazo de recompra em dias (vazio = padrão)', 'number'], ['obs', 'Observações', 'text']] },
  atacado: {
    t: 'Pedido de atacado', extra: () => `<h4>Sabores do pedido</h4><div id="at-itens"></div><div class="row"><button type="button" class="b sm" onclick="addItem()">+ Adicionar sabor</button></div>`,
    f: [['data', 'Data do pedido', 'date'], ['clienteId', 'Cliente', 'select', optCli], ['copos', 'Copos devolvidos', 'number', null, 0], ['desconto', 'Desconto logística (vazio = automático)', 'number'], ['status', 'Status', 'select', [['NÃO PAGO', 'Pendente'], ['PAGO', 'Pago']]], ['venc', 'Vencimento (opcional)', 'date', null, '']],
    h: ['#', 'Data', 'Cliente', 'Sabores', 'Qtd', 'Líquido', 'Status'],
    r: a => ['#' + a.num, fdata(a.data), a.cliente, resumoAt(a), a.qtd, R$(a.totalLiquido), `<span class="tag ${a.status === 'PAGO' ? 'ok' : 'no'}">${a.status === 'PAGO' ? 'Pago' : (atrasado(a) ? 'Atrasado' : 'Pendente')}</span>`],
    ex: a => bt('📄 Recibo', `reciboPedido(${a.id})`, 'v') + (a.status !== 'PAGO' ? bt('💰 Receber', `receber(${a.id})`, 'ok') : ''),
    pre: o => {
      const c = db.clientes.find(x => x.id == o.clienteId); if (!c) { toast('Cadastre e escolha um cliente.', 1); return false; }
      o.itens = lerItens(); if (!o.itens.length) { toast('Adicione ao menos um sabor com quantidade e valor.', 1); return false; }
      o.clienteId = c.id; o.cliente = c.nome; o.copos = num(o.copos);
      o.qtd = o.itens.reduce((a, i) => a + i.qtd, 0); o.sabor = o.itens[0].sabor; o.unitario = o.itens[0].unitario;
      if (o.desconto === '') o.desconto = o.copos >= 12 ? o.copos : 0;
      o.totalBruto = r2(o.itens.reduce((a, i) => a + i.qtd * i.unitario, 0)); o.totalLiquido = r2(o.totalBruto - o.desconto);
    }
  },
  eventos: {
    t: 'Evento', req: ['nome'], f: [['nome', 'Nome do evento (ex.: Natal 2026)', 'text'], ['ini', 'Início', 'date'], ['fim', 'Fim', 'date', null, ''], ['precoUnd', 'Preço da unidade no evento (R$)', 'number'], ['precoCombo', 'Preço base do combo no evento (R$)', 'number'], ['custoExtra', 'Custo extra de embalagem por pudim (R$)', 'number', null, 0], ['itemEmb', 'Embalagem especial (do estoque)', 'select', () => [['', '— nenhuma —'], ...optIt().filter(([k]) => !PRONTOS.includes(k))]], ['embQtd', 'Qtd da embalagem por pudim', 'number', null, 1]],
    h: ['Evento', 'Período', 'Unidade', 'Combo', 'Embalagem extra', 'Situação'],
    r: e => [`<b>${e.nome}</b>`, fdata(e.ini) + ' → ' + fdata(e.fim), R$(e.precoUnd), R$(e.precoCombo), R$(e.custoExtra) + (e.itemEmb && ITENS[e.itemEmb] ? ' + ' + ITENS[e.itemEmb][0] : ''), `<span class="tag ${e.encerrado ? 'no' : 'ok'}">${e.encerrado ? 'Encerrado' : 'Ativo'}</span>`],
    ex: e => (e.encerrado ? '' : bt('🛒 Lançar vendas', `vendaEvento(${e.id})`, 'ok')) + bt(e.encerrado ? 'Reabrir' : 'Encerrar', `toggleEvento(${e.id})`),
    pre: o => { o.precoUnd = num(o.precoUnd); o.precoCombo = num(o.precoCombo); o.custoExtra = num(o.custoExtra); o.embQtd = num(o.embQtd) || 1; if (!o.precoUnd) { toast('Informe o preço da unidade no evento.', 1); return false; } if (!o.precoCombo) o.precoCombo = o.precoUnd * 3; }
  },
  despesas: {
    t: 'Despesa', f: [['data', 'Data', 'date'], ['item', 'Descrição', 'text'], ['qtd', 'Qtd', 'number'], ['unitario', 'Valor unitário (R$)', 'number'], ['categoria', 'Categoria', 'select', [['INSUMOS', 'Insumos'], ['EMBALAGEM', 'Embalagem'], ['GASTOS GERAIS', 'Gastos gerais'], ['MARKETING', 'Marketing'], ['ENTREGADOR', 'Entregador']]]],
    h: ['#', 'Data', 'Item', 'Total', 'Categoria'], r: d => ['#' + d.num, fdata(d.data), d.item, R$(d.total), d.categoria],
    pre: o => { o.qtd = num(o.qtd) || 1; o.unitario = num(o.unitario); o.total = r2(o.qtd * o.unitario); if (!o.total) { toast('Informe o valor.', 1); return false; } },
    msg: n => { const [k, nome] = CXD[catDesp(n)], c = caixas(); return `Despesa de ${R$(n.total)} descontada de ${nome} (saldo ${R$(c[k])}). Total em conta: ${R$(c.total)}`; }
  },
  pagamentos: { t: 'Saque', f: [['data', 'Data', 'date'], ['tipo', 'Caixinha', 'select', [['MaoObra', 'Mão de obra'], ['Luyan', 'Luyan'], ['Beatriz', 'Beatriz']]], ['valor', 'Valor (R$)', 'number'], ['obs', 'Observação', 'text']], h: ['Data', 'Caixinha', 'Valor', 'Obs.'], r: p => [fdata(p.data), p.tipo, '-' + R$(p.valor), p.obs || '-'], pre: o => { o.valor = num(o.valor); if (!o.valor) { toast('Informe o valor.', 1); return false; } } },
  producoes: { t: 'Produção (bater receita)', f: [['data', 'Data', 'date'], ['sabor', 'Sabor', 'select', optSab], ['qtd', 'Nº de receitas', 'number', null, 1], ['extra', 'Pudins a mais (extras além do esperado)', 'number', null, 0]], h: ['Data', 'Sabor', 'Receitas', 'Pudins'], r: p => { const t = num(p.qtd) * ((REC[p.sabor] || {}).rende || 0), e = num(p.extra); return [fdata(p.data), NS[p.sabor] || p.sabor, p.qtd, e > 0 ? `${t + e} <span class="tag ok">+${e} extra</span>` : t]; }, pre: o => { o.qtd = num(o.qtd); o.extra = Math.max(0, Math.round(num(o.extra))); if (!o.qtd) { toast('Informe a quantidade.', 1); return false; } },
    msg: n => { const t = n.qtd * ((REC[n.sabor] || {}).rende || 0); return n.extra > 0 ? `Produção salva: ${t + n.extra} pudins (${t} + ${n.extra} extras). Os extras custam só a embalagem no rateio.` : 'Salvo!'; } },
  estoqueMov: {
    t: 'Ajuste manual / perda', f: [['data', 'Data', 'date'], ['item', 'Item', 'select', optIt], ['tipo', 'Tipo', 'select', [['entrada', 'Entrada (+)'], ['saida', 'Saída (−)'], ['perda', 'Perda / quebra']]], ['qtd', 'Quantidade', 'number'], ['desc', 'Motivo', 'text']],
    h: ['Data', 'Item', 'Mov.', 'Motivo'], r: m => [fdata(m.data), ITENS[m.item] ? ITENS[m.item][0] : m.item, `<b class="${m.tipo === 'entrada' ? '' : 'neg'}">${m.tipo === 'entrada' ? '+' : '−'}${r2(m.qtd)}</b>`, m.desc || '-'],
    pre: o => { o.qtd = num(o.qtd); if (!o.qtd) { toast('Informe a quantidade.', 1); return false; } if (o.tipo === 'perda') { o.tipo = 'saida'; o.desc = 'PERDA: ' + (o.desc || ''); } }
  },
  compras: {
    t: 'Compra direta (atualiza estoque e despesas)', semEdit: 1, f: [['data', 'Data', 'date'], ['fornecedor', 'Fornecedor (opcional)', 'text'], ['item', 'Item', 'select', optComp], ['qtd', 'Quantidade', 'number'], ['unidade', 'Unidade', 'select', [['un', 'Unidade(s)'], ['kg', 'Quilo(s)'], ['g', 'Grama(s)'], ['l', 'Litro(s)'], ['ml', 'ml'], ['pct20', 'Pacote c/ 20 un']]], ['valor', 'Valor total pago (R$)', 'number']],
    h: ['Data', 'Item', 'Comprado', 'Entrou no estoque', 'Total', 'Fornecedor'], r: c => [fdata(c.data), IT(c.item)[0], `${c.qtd} ${c.unidade}`, `${r2(c.qtdBase)} ${IT(c.item)[1]}`, R$(c.valor), c.fornecedor || '-'],
    pre: o => {
      const it = ITENS[o.item]; o.qtd = num(o.qtd); o.valor = num(o.valor);
      if (!UNOK[it[1]].includes(o.unidade)) { toast(`Para ${it[0]} use: ${UNOK[it[1]].join(' ou ')}.`, 1); return false; }
      if (!o.qtd || !o.valor) { toast('Informe quantidade e valor.', 1); return false; }
      o.qtdBase = o.qtd * UN[o.unidade]; o.precoRef = Math.round(o.valor / o.qtdBase * (it[1] === 'un' ? 1 : 1000) * 1e4) / 1e4;
    },
    pos: (o, novo) => {
      if (!novo) return;
      db.estoqueMov.push({ id: uid(), data: o.data, tipo: 'entrada', item: o.item, qtd: o.qtdBase, desc: 'Compra ' + (o.fornecedor || ''), ref: o.id });
      db.despesas.push({ id: uid(), num: prox(db.despesas), data: o.data, item: `${ITENS[o.item][0]} (${o.qtd} ${o.unidade})`, qtd: 1, unitario: o.valor, total: o.valor, categoria: EMB.includes(o.item) ? 'EMBALAGEM' : 'INSUMOS', ref: o.id });
    }
  }
};
const mobile = () => window.matchMedia && matchMedia('(max-width:900px)').matches;
const formHTML = l => { const s = SCH[l]; return `<details class="fd" ${edit[l] || !mobile() ? 'open' : ''}><summary>${edit[l] ? '✏️ Editando: ' : '➕ '}${s.t}</summary><div class="fg">${s.f.map(([k, lb, t, o, d]) => `<div><label>${lb}</label>${inp(`f-${l}-${k}`, t, d !== undefined ? d : (t === 'date' ? hoje() : ''), typeof o === 'function' ? o() : o)}</div>`).join('')}</div>${s.extra ? s.extra() : ''}<div class="row"><button class="b pri" onclick="salvar('${l}')">Salvar</button>${edit[l] ? `<button class="b" onclick="limpar('${l}')">Cancelar edição</button>` : ''}</div></details>`; };
function renderForm(l) { $('form-' + l).innerHTML = formHTML(l); if (l === 'atacado' && !edit.atacado) addItem(); }
function limpar(l) { edit[l] = null; renderForm(l); }
function salvar(l) {
  const s = SCH[l], o = {};
  s.f.forEach(([k, , t]) => { const v = $(`f-${l}-${k}`).value; o[k] = t === 'number' ? (v === '' ? '' : num(v)) : v; });
  if (s.req && s.req.some(k => !o[k])) return toast('Preencha os campos obrigatórios.', 1);
  const ant = edit[l] ? db[l].find(x => x.id === edit[l]) : null, n = { ...(ant || {}), ...o, id: ant ? ant.id : uid() };
  if (!ant) n.num = prox(db[l]);
  if (s.pre && s.pre(n) === false) return;
  if (ant) Object.assign(ant, n); else db[l].push(n);
  if (s.pos) s.pos(n, !ant);
  const msg = s.msg ? s.msg(n) : 'Salvo!'; edit[l] = null; renderForm(l); if (guardar()) toast(msg);
}
function editar(l, id) {
  const x = db[l].find(i => i.id === id); if (!x) return; edit[l] = id; renderForm(l); if (l === 'atacado') atItens(x).forEach(i => addItem(i.sabor, i.qtd, i.unitario, i.custoUnd));
  SCH[l].f.forEach(([k]) => { const e = $(`f-${l}-${k}`); if (e) e.value = x[k] ?? ''; }); $('form-' + l).scrollIntoView({ behavior: 'smooth' });
}
function excluir(l, id) {
  if (!confirm('Excluir este registro? Os saldos serão recalculados.')) return;
  db[l] = db[l].filter(x => x.id !== id);
  if (l === 'compras') { db.estoqueMov = db.estoqueMov.filter(x => x.ref !== id); db.despesas = db.despesas.filter(x => x.ref !== id); }
  guardar(); toast('Excluído.');
}
const pg = {}, histOpen = {};
const HT = { atacado: 'Histórico de pedidos de atacado', eventos: 'Eventos cadastrados', producoes: 'Histórico de produção', estoqueMov: 'Histórico de ajustes de estoque', despesas: 'Histórico de despesas', pagamentos: 'Histórico de saques', compras: 'Histórico de compras', vendas: 'Histórico de vendas (varejo)' };
function hist(l, h, todos, fn, vz) {
  const lim = pg[l] || 10, n = todos.length, falta = n - lim, aberto = histOpen[l] ?? !['estoqueMov', 'producoes'].includes(l);
  return `<details class="hist" ${aberto ? 'open' : ''} ontoggle="histOpen['${l}']=this.open"><summary><span>${HT[l]}</span><b>${n}</b></summary>${tbl(h, todos.slice(0, lim).map(fn), vz)}${falta > 0 ? `<div class="row mais"><button class="b" onclick="verMais('${l}')">Ver mais ${Math.min(10, falta)} (restam ${falta})</button></div>` : ''}</details>`;
}
const verMais = l => { pg[l] = (pg[l] || 10) + 10; updateAll(); };
function rLista(l) {
  const s = SCH[l], el = $('lista-' + l); if (!el) return;
  el.innerHTML = hist(l, [...s.h, 'Ações'], ordenar(db[l]), x => [...s.r(x), (s.ex ? s.ex(x) : '') + (s.semEdit ? '' : bt('✏️', `editar('${l}',${x.id})`)) + bt('🗑️', `excluir('${l}',${x.id})`, 'red')]);
}
const lista = l => `<div class="adm" id="form-${l}"></div><div id="lista-${l}"></div>`;

/* ============ HTML DAS ABAS ============ */
const H = {
  dashboard: () => `<div id="aviso-setup"></div><div class="card row" style="margin-top:0"><label style="margin:0">Mês:</label><input type="month" id="dash-mes" style="width:170px" onchange="rDash()"><button class="b" onclick="$('dash-mes').value='';rDash()">Todos</button></div><div id="dash-body"></div>`,
  contagem: () => `<div id="cont-body"></div>`,
  vendas: () => `<div class="card adm"><h3>1. Montar pedido</h3><div id="pv-evinfo"></div><div class="fg"><div><label>Evento</label><select id="pv-ev" onchange="pdvEv()"><option value="">Venda normal (varejo)</option></select></div>
    <div><label>Produto</label><select id="pv-prod" onchange="pdvTog()"><option>Unidade</option><option>Combo</option></select></div>
    <div id="pv-sab1"><label>Sabor</label><select id="pv-sab">${optSab().map(x => `<option value="${x[0]}">${x[1]}</option>`).join('')}</select></div>
    <div><label>Qtd</label><input id="pv-qtd" type="number" value="1" min="1" oninput="pdvPrev()"></div>
    <div><label>Valor manual (vazio = automático)</label><input id="pv-man" type="number" step="any" oninput="pdvPrev()"></div></div>
    <div id="pv-combo" hidden><label>Sabores do combo (sabores com adicional somam ao valor)</label><div class="fg">${[1, 2, 3].map(i => `<select id="pv-s${i}" onchange="pdvPrev()">${optSab().map(x => `<option value="${x[0]}">${x[1]}</option>`).join('')}</select>`).join('')}</div></div>
    <div class="row"><button class="b pri" onclick="pdvAdd()">Adicionar ao carrinho</button><b id="pv-prev"></b></div></div>
    <div id="pv-cart"></div>
    <div class="card adm"><h3>2. Pagamento</h3><div class="fg">
    <div><label>Data</label><input id="pv-data" type="date" value="${hoje()}"></div>
    <div><label>Forma de pagamento</label><select id="pv-pg" onchange="$('pv-asaas-w').hidden=this.value!=='PIX'"><option value="PIX">PIX</option><option value="Dinheiro">Dinheiro</option><option value="Credito Insercao">Crédito (inserção)</option><option value="Credito Aproximacao">Crédito (aproximação)</option><option value="Debito Insercao">Débito (inserção)</option><option value="Debito Aproximacao">Débito (aproximação)</option><option value="Cartao Online">Link (cartão online)</option></select></div>
    <div id="pv-asaas-w"><label>Taxa Asaas (R$ 0,14)</label><input id="pv-asaas" type="checkbox"></div>
    <div><label>Desconto (R$)</label><input id="pv-desc" type="number" step="any" value="0" oninput="pdvTot()"></div>
    <div><label>Taxa de entrega (R$)</label><input id="pv-ent" type="number" step="any" value="0" oninput="pdvTot()"></div>
    <div><label>Sacola</label><select id="pv-sac"><option value="nenhuma">Nenhuma</option><option value="sacola_1">Sacola (1 un)</option><option value="sacola_2">Sacola (2 un)</option></select></div>
    <div><label>Qtd de sacolas</label><input id="pv-sacq" type="number" value="1" min="0"></div></div>
    <div class="paybar"><div class="alert row" style="justify-content:space-between"><b>Total a cobrar</b><b id="pv-total" style="font-size:1.5rem">R$ 0,00</b></div>
    <button class="b pri" onclick="pdvFinal()">Finalizar venda</button></div></div>
    <div id="lista-vendas"></div>`,
  atacado: () => lista('atacado'), clientes: () => `<div class="alert" id="rc-aviso" hidden></div>${lista('clientes').replace('<div id="lista-clientes"></div>', '')}<div id="clientes-tab"></div>`,
  receber: () => `<div class="grid" id="rec-k"></div><div id="rec-t"></div>`,
  compras: () => lista('compras'), precos: () => `<div id="precos-body"></div>`,
  estoque: () => `<div class="grid" id="est-k"></div><div id="est-prev"></div><div class="fg"><div>${lista('producoes')}</div><div>${lista('estoqueMov')}</div></div>`,
  despesas: () => lista('despesas'), saques: () => lista('pagamentos'),
  eventos: () => lista('eventos') + '<h4>Resultado por evento</h4><div id="ev-rel"></div>',
  rateio: () => `<h4>Varejo</h4><div id="rt-v"></div><h4>Atacado (pedidos pagos)</h4><div id="rt-a"></div>`,
  config: () => `<div id="cfg-body"></div>`
};

/* ============ RENDER ============ */
const R = {};
const IT = k => ITENS[k] || [k, '']; 
const KB = (t, v, c) => kpi(t, R$(v), v < -0.004 ? 'neg ' + (c || '') : c || '');
R.dashboard = () => rDash();
const dashOpen = {};
const dtog = k => `ontoggle="dashOpen['${k}']=this.open" ${dashOpen[k] ? 'open' : ''}`;
function rDash() {
  try { rDash0(); } catch (e) { console.error('Painel:', e); const b = $('dash-body'); if (b) b.innerHTML = `<div class="alert"><b>Não consegui montar o painel.</b><br>Erro: ${String((e && e.message) || e)}</div>`; }
}
function rDash0() {
  const c = caixas(), m = $('dash-mes') ? $('dash-mes').value : '', L = linhasFin().filter(x => !m || x.data.startsWith(m));
  const rc = recompra().filter(x => x.alerta), pend = db.atacado.filter(atrasado), sal = saldos(), baixos = Object.keys(ITENS).filter(k => ativo(k) && sal[k] <= minOf(k));
  const dsp = db.despesas.filter(d => !m || (d.data || '').startsWith(m)).reduce((a, d) => a + dtot(d), 0);
  $('aviso-setup').innerHTML = db.config.setupFeito || role !== 'admin' || db.ajustes.length ? '' : `<div class="alert">Sistema novo: confira e aplique o <b>saldo inicial</b> em Configurações. <button class="b sm" onclick="irPara('config')">Abrir</button></div>`;
  const cx = (t, k, ex) => `<div class="k c-${k} ${c[k] < -0.004 ? 'neg' : ''}"><small>${t}</small><b>${R$(c[k])}</b><div class="row">${ex || ''}<button class="b sm adm" title="Ajustar saldo" onclick="ajustar('${k}')">⚖️</button></div></div>`;
  const sec = (key, tit, can) => {
    const l = L.filter(x => x.canal === can), g = (!m && db.config.legado && db.config.legado[can]) || {}, s = k => l.reduce((a, x) => a + x[k], 0) + num(g[k]), K = kpi;
    const noMes = d => !m || (d || '').startsWith(m);
    const ent = can === 'varejo' ? K('Taxa entrega', R$(db.vendas.filter(v => !v.evento && noMes(v.data)).reduce((a, v) => a + num(v.entrega), 0) + num(g.ent)))
      : can === 'atacado' ? KB('Logística (desc)', num(g.ent) - db.atacado.filter(a => a.status === 'PAGO' && noMes(a.data)).reduce((a, x) => a + num(x.desconto), 0)) : '';
    const bruto = K('Fat. bruto', R$(s('bruto'))), liq = K('Fat. líquido', R$(s('liq')));
    const ordem = can === 'atacado' ? bruto + ent + liq : bruto + liq + ent;
    return `<details class="sec" ${dtog(key)}><summary><span>${tit}</span><b class="${s('l') < -0.004 ? 'neg' : ''}">${R$(s('l'))}<small> lucro</small></b></summary><div class="grid">${ordem}${K('Qtd vendida', s('q'))}${KB('Insumo fixo', s('ins'))}${KB('Custos gerais', s('cg'))}${KB('Mão de obra', s('mo'))}${KB('Lucro líquido', s('l'), 'ok')}${K('Fundo empresa', R$(s('fundo')))}${K('Luyan', R$(s('lu')))}${K('Beatriz', R$(s('bea')))}${g.giro ? K('Giro (legado)', R$(g.giro)) : ''}</div></details>`;
  };
  const chip = (ic, n, lb, k) => n ? `<button class="chip ${k}" onclick="avisos('${k}')"><span>${ic}</span>${lb}<i>${n}</i></button>` : '';
  const chips = chip('📞', rc.length, 'Contatar', 'rc') + chip('⏳', pend.length, 'Vencidos', 'pend') + chip('📦', baixos.length, 'Estoque baixo', 'est');
  $('dash-body').innerHTML = `
  ${chips ? `<div class="chips">${chips}</div>` : ''}
  <div class="grid"><div class="k big ${c.total < -0.004 ? 'neg' : ''}"><small>Dinheiro total disponível em conta</small><b>${R$(c.total)}</b><div class="row"><span class="hsub">Despesas ${m ? 'do mês' : 'lançadas'}: ${R$(dsp)}</span><button class="b sm adm" onclick="ajustar('Caixa Geral')">⚖️ Ajustar</button></div></div></div>
  <h4>Caixinhas</h4><div class="grid">${cx('Insumo fixo', 'Insumos')}${cx('Custos gerais', 'CG')}${cx('Mão de obra', 'MO', bt('Sacar', `sacar('MaoObra')`, 'red'))}${cx('Fundo empresa', 'Fundo')}${cx('Luyan', 'Luyan', bt('Sacar', `sacar('Luyan')`, 'red'))}${cx('Beatriz', 'Beatriz', bt('Sacar', `sacar('Beatriz')`, 'red'))}${cx('Gaveta entregas', 'Entrega')}</div>
  <h4>Resultados ${m ? '(' + m + ')' : ''}</h4>${sec('v', 'Varejo', 'varejo')}${sec('a', 'Atacado pago', 'atacado')}${L.some(x => x.canal === 'evento') ? sec('e', 'Eventos', 'evento') : ''}`;
  const n = rc.length + pend.length; if ($('bdg')) $('bdg').innerHTML = n ? `<span class="bdg">${n}</span>` : '';
}
function avisos(t) {
  let tit, h; const ir = (id, txt) => `<div class="row"><button class="b" onclick="fechar();irPara('${id}')">${txt}</button></div>`;
  if (t === 'rc') {
    const rc = recompra().filter(x => x.alerta); tit = '📞 Clientes para contatar';
    h = (rc.length ? rc.map(x => `<div class="ai"><div><b>${x.c.nome}</b><small>Último pedido em ${fdata(x.ult)}, há ${x.dias} dias (aviso em ${x.lim})</small></div><div class="row"><a class="b sm" target="_blank" href="${wpp(x.c)}">WhatsApp</a><button class="b sm adm" onclick="contatado(${x.c.id})">✔ Contatado</button></div></div>`).join('') : '<p class="vz">Ninguém para contatar agora. 🎉</p>') + ir('clientes', 'Abrir clientes');
  } else if (t === 'pend') {
    const p = db.atacado.filter(atrasado); tit = '⏳ Pedidos vencidos';
    h = (p.length ? p.map(a => `<div class="ai"><div><b>${a.cliente}</b><small>Pedido #${a.num}, ${R$(a.totalLiquido)}, venceu há ${difDias(a.venc, hoje())} dias</small></div><div class="row"><button class="b sm ok adm" onclick="receber(${a.id})">💰 Receber</button></div></div>`).join('') : '<p class="vz">Nenhum pedido vencido. 🎉</p>') + ir('receber', 'Abrir A receber');
  } else {
    const sal = saldos(), bx = Object.keys(ITENS).filter(k => ativo(k) && sal[k] <= minOf(k)); tit = '📦 Estoque baixo';
    h = (bx.length ? bx.map(k => `<div class="ai"><div><b>${ITENS[k][0]}</b><small>Restam ${r2(sal[k])} ${ITENS[k][1]} (mínimo ${minOf(k)})</small></div></div>`).join('') : '<p class="vz">Estoque em dia. ✅</p>') + ir('estoque', 'Abrir estoque');
  }
  info(tit, h);
}
R.contagem = () => {
  const M = {}; const g = m => M[m] ||= { t: 0, n: 0, b: 0, x: 0, q: 0, br: 0, lq: 0, l: 0, d: 0 };
  linhasFin().forEach(x => { const o = g(x.data.slice(0, 7) || 'Sem data'); x.sab.forEach(([s, q]) => { if (s === 'ninho') o.n += q; else if (s === 'brigadeirao') o.b += q; else if (s === 'tradicional') o.t += q; else o.x += q; }); o.q += x.q; o.br += x.bruto; o.lq += x.liq; o.l += x.l; });
  db.despesas.forEach(d => { g((d.data || '').slice(0, 7) || 'Sem data').d += dtot(d); });
  const mn = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  $('cont-body').innerHTML = `<div class="card">Atacado conta no <b>mês do pedido</b>, mas só aparece aqui depois de marcado como <b>pago</b>.</div>` + tbl(['Mês', 'Tradicional', 'Ninho', 'Brigadeirão', 'Outros sabores', 'Total vendido', 'Fat. bruto', 'Fat. líquido', 'Lucro líquido', 'Despesas'], Object.keys(M).sort().reverse().map(k => { const o = M[k], [y, mm] = k.split('-'); return [mm ? `<b>${mn[mm - 1]}/${y}</b>` : k, o.t, o.n, o.b, o.x, `<b>${o.q} un</b>`, R$(o.br), R$(o.lq), `<b style="color:var(--ok)">${R$(o.l)}</b>`, `<span class="neg">${R$(o.d)}</span>`]; }));
};
function pedidosVarejo() {
  const out = [], M = economiaExtras(); let ult = null;
  ordenar(db.vendas).forEach(v => {
    const mesmo = ult && (v.pedido && ult.pedido ? v.pedido === ult.pedido : (!v.pedido && !ult.pedido && v.data === ult.data && v.pgto === ult.pgto && (v.evento || '') === (ult.evento || '') && Math.abs(v.id - ult.id) < 5000));
    if (mesmo) out[out.length - 1].push(v); else out.push([v]); ult = v;
  });
  return out.map(it => { it.sort((a, b) => a.id - b.id); const ns = it.map(v => v.num), mn = Math.min(...ns), mx = Math.max(...ns); return { itens: it, ids: it.map(v => v.id), num: mn === mx ? '' + mn : mn + '–' + mx, data: it[0].data, pgto: it[0].pgto, evento: it[0].evento, liq: it.reduce((a, v) => a + num(v.liquido), 0), ins: it.reduce((a, v) => a + Math.max(0, qtdTotal(v) * num(v.custoUnd) - (M.get('v:' + v.id) || 0)), 0) }; });
}
function excluirVarejo(ids) {
  if (!confirm(ids.length > 1 ? `Excluir este pedido inteiro (${ids.length} itens)? Os saldos serão recalculados.` : 'Excluir este registro? Os saldos serão recalculados.')) return;
  db.vendas = db.vendas.filter(x => !ids.includes(x.id)); guardar(); toast('Excluído.');
}
R.vendas = () => { $('lista-vendas').innerHTML = hist('vendas', ['#', 'Data', 'Produto', 'Sabores', 'Líquido', 'Pgto', ''], pedidosVarejo(), p => ['#' + p.num, fdata(p.data), p.itens.map(v => `${v.produto} (${v.qtd}x)`).join(' + ') + (p.evento ? ' 🎄' : ''), p.itens.map(nomeSab).join(' + '), R$(p.liq), p.pgto, bt('🗑️', `excluirVarejo([${p.ids}])`, 'red')]); };
R.atacado = () => { const s = $('f-atacado-clienteId'); if (s && !edit.atacado) { const v = s.value; s.innerHTML = optCli().map(x => `<option value="${x[0]}">${x[1]}</option>`).join(''); if ([...s.options].some(o => o.value === v)) s.value = v; } rLista('atacado'); };
R.clientes = () => {
  const rc = recompra(), n = rc.filter(x => x.alerta).length;
  $('clientes-tab').innerHTML = tbl(['Cliente', 'Telefone', 'Cidade/UF', 'Último pedido', 'Dias', 'Pedidos', 'Total comprado', 'Ticket médio', 'Sabor favorito', 'Ações'], db.clientes.map(c => {
    const ps = db.atacado.filter(a => a.clienteId === c.id), tot = ps.reduce((a, x) => a + num(x.totalLiquido), 0), r = rc.find(x => x.c.id === c.id), sb = {}; ps.forEach(p => atItens(p).forEach(i => sb[i.sabor] = (sb[i.sabor] || 0) + num(i.qtd)));
    const fav = Object.entries(sb).sort((a, b) => b[1] - a[1])[0];
    return [`<b>${c.nome}</b>${c.ativo === 'nao' ? ' <span class="tag no">inativo</span>' : ''}`, c.tel, [c.cidade, c.uf].filter(Boolean).join('/') || '-', r ? fdata(r.ult) : '-', r ? `<span class="tag ${r.alerta ? 'no' : 'ok'}">${r.dias}d</span>` : '-', ps.length, R$(tot), ps.length ? R$(tot / ps.length) : '-', fav ? NS[fav[0]] : '-',
    `<a class="b sm" target="_blank" href="${wpp(c)}">WhatsApp</a>` + bt('📜 Histórico', `histCliente(${c.id})`, 'v') + bt('📄 Recibo em aberto', `reciboAbertos(${c.id})`, 'v') + bt('✏️', `editar('clientes',${c.id})`) + bt(c.ativo === 'nao' ? 'Reativar' : 'Inativar', `toggleAtivo(${c.id})`)];
  }), 'Cadastre seu primeiro cliente acima.');
  const av = $('rc-aviso'); av.hidden = !n; av.innerHTML = `📞 ${n} cliente(s) já passaram do prazo de recompra.`;
};
R.receber = () => {
  const p = db.atacado.filter(a => a.status !== 'PAGO').sort((a, b) => (a.venc || a.data) < (b.venc || b.data) ? -1 : 1);
  $('rec-k').innerHTML = KB('Total pendente na rua', p.reduce((a, x) => a + num(x.totalLiquido), 0), 'neg') + kpi('Pedidos em aberto', p.length) + kpi('Atrasados', p.filter(atrasado).length);
  $('rec-t').innerHTML = tbl(['Pedido', 'Data', 'Cliente', 'Qtd', 'Valor', 'Vencimento', 'Situação', 'Ações'], p.map(a => ['#' + a.num, fdata(a.data), a.cliente, a.qtd, R$(a.totalLiquido), fdata(a.venc), `<span class="tag ${atrasado(a) ? 'no' : 'wa'}">${atrasado(a) ? 'Atrasado ' + difDias(a.venc, hoje()) + 'd' : 'Em aberto'}</span>`, bt('💰 Receber', `receber(${a.id})`, 'ok') + bt('📄 Recibo', `reciboPedido(${a.id})`, 'v')]), 'Nenhum pedido em aberto. 🎉');
};
R.compras = () => rLista('compras');
R.precos = () => {
  const h = [...db.compras].sort((a, b) => a.data < b.data ? -1 : a.data > b.data ? 1 : a.id - b.id), por = {}, hist = [];
  h.forEach(c => { const l = por[c.item] ||= [], p = l[l.length - 1], v = p ? (c.precoRef - p) / p * 100 : null; l.push(c.precoRef); hist.push([fdata(c.data), IT(c.item)[0], c.fornecedor || '-', R$(c.precoRef) + '/' + (IT(c.item)[1] === 'g' ? 'kg' : IT(c.item)[1] === 'ml' ? 'L' : 'un'), v === null ? '-' : `<b class="${v > 0 ? 'neg' : ''}" style="${v < 0 ? 'color:var(--ok)' : ''}">${v > 0 ? '▲' : v < 0 ? '▼' : '='} ${Math.abs(v).toFixed(1).replace('.', ',')}%</b>`]); });
  const res = Object.entries(por).map(([k, l]) => { const a = l[l.length - 1], p = l[l.length - 2], v = p ? (a - p) / p * 100 : null; return [ITENS[k][0], R$(a), p ? R$(p) : '-', v === null ? '-' : `${v > 0 ? '▲' : '▼'} ${Math.abs(v).toFixed(1).replace('.', ',')}%`, R$(Math.min(...l)), R$(Math.max(...l)), l.length]; });
  $('precos-body').innerHTML = `<div class="card">Apenas acompanhamento. <b>Não altera</b> a Calculadora de Ficha Técnica.</div><h4>Resumo por item (preço por kg, litro ou unidade)</h4>${tbl(['Item', 'Atual', 'Anterior', 'Variação', 'Mínimo', 'Máximo', 'Compras'], res, 'Registre compras para ver a evolução.')}<h4>Todas as compras</h4>${tbl(['Data', 'Item', 'Fornecedor', 'Preço', 'Variação vs. compra anterior'], hist.reverse())}`;
};
function previsao() {
  const lim = new Date(); lim.setDate(lim.getDate() - 28); const li = lim.toISOString().slice(0, 10), sal = saldos(), venda = Object.fromEntries(Object.keys(REC).map(k => [k, 0]));
  db.vendas.filter(v => v.data >= li).forEach(v => unid(v).forEach(([s, q]) => venda[s] += q)); db.atacado.filter(a => a.data >= li).forEach(a => atItens(a).forEach(i => venda[i.sabor] += num(i.qtd)));
  const need = {}, rows = Object.keys(REC).filter(s => ativo(SP[s])).map(s => { const r = REC[s], sem = venda[s] / 4, rec = Math.ceil(Math.max(0, sem - sal[r.prod]) / r.rende); for (const k in r.ins) need[k] = (need[k] || 0) + rec * r.ins[k]; ['copo', 'tampa', 'adesivo'].forEach(k => need[k] = (need[k] || 0) + rec * r.rende); return [NS[s], r2(sem), sal[r.prod], `<b>${rec}</b>`]; });
  const compras = Object.keys(ITENS).filter(k => ativo(k) && !PRONTOS.includes(k)).map(k => { const falta = Math.max(0, (need[k] || 0) - sal[k]), baixo = sal[k] <= minOf(k) ? Math.max(0, minOf(k) * 2 - sal[k]) : 0, sug = Math.ceil(Math.max(falta, baixo)); return sug > 0 ? [ITENS[k][0], r2(sal[k]) + ' ' + ITENS[k][1], `<b>${sug} ${ITENS[k][1]}</b>`] : null; }).filter(Boolean);
  return `<h4>Previsão de produção da semana (média das últimas 4 semanas)</h4>${tbl(['Sabor', 'Venda média/semana', 'Estoque pronto', 'Receitas a bater'], rows)}<h4>Lista de compras sugerida</h4>${tbl(['Item', 'Saldo', 'Comprar'], compras, 'Estoque suficiente para a previsão. ✅')}`;
}
R.estoque = () => {
  const s = saldos();
  $('est-k').innerHTML = Object.keys(ITENS).filter(ativo).map(k => { const v = r2(s[k]), c = v <= 0 ? 'neg' : ''; return `<div class="k ${c}" style="${v > 0 && v <= minOf(k) ? 'border-left-color:#F59E0B' : ''}"><small>${ITENS[k][0]}</small><b>${v} ${ITENS[k][1]}</b><div class="row">${bt('Contagem', `contar('${k}')`)}</div></div>`; }).join('');
  const ina = Object.keys(ITENS).filter(k => !ativo(k)); $('est-prev').innerHTML = (ina.length ? `<div class="card" style="color:var(--mu)">Inativos (fora dos alertas): ${ina.map(k => ITENS[k][0]).join(', ')}. Reative em Configurações.</div>` : '') + previsao(); rLista('producoes'); rLista('estoqueMov');
};
R.despesas = () => rLista('despesas'); R.saques = () => rLista('pagamentos');
R.config = () => { }; // montada em rConfig() ao abrir a aba

/* ============ AÇÕES ============ */
function ajustar(k) { ask('Ajustar: ' + k, [['d', 'Data', 'date', hoje()], ['op', 'Operação', 'select', 'e', [['e', '➕ Adicionar'], ['s', '➖ Subtrair']]], ['v', 'Valor (R$)', 'number']], r => { let v = num(r.v); if (!v) return toast('Valor inválido.', 1); db.ajustes.push({ id: uid(), caixa: k, data: r.d, valor: r.op === 's' ? -v : v }); guardar(); toast('Ajustado.'); }); }
function sacar(t) { ask('Saque — ' + t, [['d', 'Data', 'date', hoje()], ['v', 'Valor (R$)', 'number'], ['o', 'Observação', 'text']], r => { if (!num(r.v)) return toast('Valor inválido.', 1); db.pagamentos.push({ id: uid(), data: r.d, tipo: t, valor: num(r.v), obs: r.o }); guardar(); toast('Saque registrado.'); }); }
function contar(k) { const at = r2(saldos()[k]); ask('Contagem real: ' + ITENS[k][0], [['q', `Quantidade real agora (sistema: ${at} ${ITENS[k][1]})`, 'number', at]], r => { const d = r2(num(r.q) - at); if (!d) return; db.estoqueMov.push({ id: uid(), data: hoje(), tipo: d > 0 ? 'entrada' : 'saida', item: k, qtd: Math.abs(d), desc: 'Contagem real' }); guardar(); toast('Estoque ajustado.'); }); }
function receber(id) { const a = db.atacado.find(x => x.id === id); if (a && confirm(`Confirmar recebimento de ${R$(a.totalLiquido)} de ${a.cliente}?`)) { a.status = 'PAGO'; a.pagoEm = hoje(); guardar(); toast('Pagamento confirmado!'); if (!$('modal').hidden) avisos('pend'); } }
function contatado(id) { const c = db.clientes.find(x => x.id === id); c.contatadoEm = hoje(); guardar(); if (!$('modal').hidden) avisos('rc'); }
function toggleAtivo(id) { const c = db.clientes.find(x => x.id === id); c.ativo = c.ativo === 'nao' ? 'sim' : 'nao'; guardar(); }
function histCliente(id) { const c = db.clientes.find(x => x.id === id); info('Histórico — ' + c.nome, tbl(['Data', 'Sabor', 'Qtd', 'Valor', 'Status'], ordenar(db.atacado.filter(a => a.clienteId === id)).map(a => [fdata(a.data), resumoAt(a), a.qtd, R$(a.totalLiquido), a.status === 'PAGO' ? 'Pago' : 'Pendente']))); }
function irPara(id) { switchTab(id); }

/* PDV */
function pdvTog() { const c = $('pv-prod').value === 'Combo'; $('pv-sab1').hidden = c; $('pv-combo').hidden = !c; pdvPrev(); }
const evAtual = () => db.eventos.find(e => String(e.id) === String($('pv-ev').value)) || null;
function pdvPreco() { const ev = evAtual(); let p = ev ? num(ev.precoUnd) : db.config.precoUnd; if ($('pv-prod').value === 'Combo') p = (ev ? num(ev.precoCombo) : db.config.precoCombo) + [1, 2, 3].reduce((a, i) => a + adic($('pv-s' + i).value), 0); const m = num($('pv-man').value); return m > 0 ? m : p; }
function pdvEv() { cart = []; pdvCart(); pdvPrev(); const e = evAtual(); $('pv-evinfo').innerHTML = e ? `<div class="alert">🎄 <b>${e.nome}</b>: usando os preços e a embalagem deste evento.</div>` : ''; }
function pdvPrev() { const q = num($('pv-qtd').value) || 1; $('pv-prev').textContent = `Valor: ${R$(pdvPreco())} × ${q} = ${R$(pdvPreco() * q)}`; }
function pdvAdd() { const p = $('pv-prod').value, q = parseInt($('pv-qtd').value) || 1, cb = p === 'Combo' ? [1, 2, 3].map(i => $('pv-s' + i).value) : null; cart.push({ produto: p, sabor: cb ? cb[0] : $('pv-sab').value, saboresCombo: cb, qtd: q, bruto: pdvPreco() * q }); $('pv-qtd').value = 1; $('pv-man').value = ''; pdvPrev(); pdvCart(); }
function pdvCart() { $('pv-cart').innerHTML = cart.length ? tbl(['Qtd', 'Produto', 'Sabores', 'Subtotal', ''], cart.map((i, n) => [i.qtd + 'x', i.produto, nomeSab(i), R$(i.bruto), bt('🗑️', `cart.splice(${n},1);pdvCart()`, 'red')])) : ''; pdvTot(); }
function pdvTot() { $('pv-total').textContent = R$(Math.max(0, cart.reduce((a, i) => a + i.bruto, 0) - num($('pv-desc').value) + num($('pv-ent').value))); }
function pdvFinal() {
  if (!cart.length) return toast('Carrinho vazio.', 1);
  const ev = evAtual(), C = db.config, pg = $('pv-pg').value, desc = num($('pv-desc').value), ent = num($('pv-ent').value), data = $('pv-data').value || hoje(), tb = cart.reduce((a, i) => a + i.bruto, 0);
  const tx = { 'Credito Insercao': C.taxaCredIns, 'Credito Aproximacao': C.taxaCredApr, 'Debito Insercao': C.taxaDebIns, 'Debito Aproximacao': C.taxaDebApr, 'Cartao Online': C.taxaOnline }[pg] || 0;
  const n = prox(db.vendas), ped = uid();
  cart.forEach((i, ix) => {
    const d = tb ? desc * i.bruto / tb : 0, cob = i.bruto - d, taxa = pg === 'PIX' ? ($('pv-asaas').checked && !ix ? 0.14 : 0) : cob * tx / 100, sabs = i.saboresCombo || [i.sabor];
    db.vendas.push({ id: uid(), num: n, pedido: ped, data, produto: i.produto, sabor: i.sabor, saboresCombo: i.saboresCombo, qtd: i.qtd, pgto: pg, bruto: r2(i.bruto), desconto: r2(d), taxa: r2(taxa), liquido: r2(cob - taxa), entrega: ix ? 0 : r2(ent), sacTipo: ix ? 'nenhuma' : $('pv-sac').value, sacQtd: ix ? 0 : num($('pv-sacq').value), custoUnd: sabs.reduce((a, s) => a + custo(s, 'varejo'), 0) / sabs.length + (ev ? num(ev.custoExtra) : 0), evento: ev ? ev.id : '' });
  });
  cart = []; pdvCart(); $('pv-desc').value = 0; $('pv-ent').value = 0; guardar(); toast('Venda finalizada!');
}

/* RECIBO PDF */
let _logo;
function logo() { return _logo || (_logo = new Promise(res => { const i = new Image(); i.onload = () => { try { const c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight; c.getContext('2d').drawImage(i, 0, 0); res({ u: c.toDataURL('image/png'), w: 26 * i.naturalWidth / i.naturalHeight, h: 26 }); } catch (e) { res(null); } }; i.onerror = () => res(null); i.src = 'assets/logo.png'; })); }
function reciboPedido(id) {
  const a = db.atacado.find(x => x.id === id), outros = db.atacado.filter(x => x.clienteId === a.clienteId && x.status !== 'PAGO' && x.id !== id);
  let ids = [id]; if (outros.length && confirm(`${a.cliente} tem mais ${outros.length} pedido(s) em aberto. Incluir todos neste recibo?`)) ids = ids.concat(outros.map(x => x.id));
  recibo(a.clienteId, ids);
}
function reciboAbertos(cid) { const ids = db.atacado.filter(a => a.clienteId === cid && a.status !== 'PAGO').map(a => a.id); if (!ids.length) return toast('Cliente sem pedidos em aberto.', 1); recibo(cid, ids); }
async function recibo(cid, ids) {
  const { jsPDF } = window.jspdf, d = new jsPDF(), c = db.clientes.find(x => x.id === cid) || { nome: 'Cliente' };
  const ps = db.atacado.filter(a => ids.includes(a.id)).sort((a, b) => a.data < b.data ? -1 : 1); if (!ps.length) return;
  const lg = await logo(); let x0 = 14; if (lg) { d.addImage(lg.u, 'PNG', 14, 10, lg.w, lg.h); x0 = 14 + lg.w + 6; }
  d.setFont('helvetica', 'bold'); d.setFontSize(17); d.text(EMP.fantasia, x0, 18); d.setFont('helvetica', 'normal'); d.setFontSize(9);
  d.text(`CNPJ: ${EMP.cnpj}`, x0, 24); d.text(`Telefone: ${EMP.tel}  |  Pix (e-mail): ${EMP.pix}`, x0, 29);
  d.setDrawColor(194, 150, 80); d.line(14, 40, 196, 40);
  d.setFont('helvetica', 'bold'); d.setFontSize(14); d.text('RECIBO', 14, 50); d.setFont('helvetica', 'normal'); d.setFontSize(9);
  d.text(`No ${hoje().replace(/-/g, '')}-${ps[0].num}   Emitido em ${fdata(hoje())}`, 196, 50, { align: 'right' });
  d.text(`Cliente: ${c.nome}`, 14, 58); d.text(`Telefone: ${c.tel || '-'}`, 14, 63);
  d.text(`Endereco: ${[c.endereco, [c.cidade, c.uf].filter(Boolean).join('/')].filter(Boolean).join(' - ') || '-'}`.replace('Endereco', 'Endereço'), 14, 68);
  let y = 80; d.setFillColor(62, 31, 18); d.rect(14, y - 5, 182, 8, 'F'); d.setTextColor(255); d.setFont('helvetica', 'bold');
  [['Data', 16], ['Sabor', 40], ['Qtd', 104], ['Unit.', 120], ['Subtotal', 146], ['Status', 176]].forEach(([t, x]) => d.text(t, x, y));
  d.setTextColor(0); d.setFont('helvetica', 'normal'); y += 8;
  ps.forEach(a => {
    atItens(a).forEach(i => {
      if (y > 265) { d.addPage(); y = 20; }
      [[fdata(a.data), 16], [NS[i.sabor] || i.sabor, 40], [String(i.qtd), 104], [R$(i.unitario), 120], [R$(num(i.qtd) * num(i.unitario)), 146], [a.status === 'PAGO' ? 'PAGO' : 'PENDENTE', 176]].forEach(([t, x]) => d.text(t, x, y));
      y += 6;
    });
    if (num(a.desconto) > 0) { d.text('Desconto logística', 40, y); d.text('-' + R$(a.desconto), 146, y); y += 6; }
    d.setDrawColor(226, 232, 240); d.line(14, y - 2, 196, y - 2); y += 3;
  });
  const T = ps.reduce((a, p) => a + num(p.totalLiquido), 0), P = ps.filter(p => p.status === 'PAGO').reduce((a, p) => a + num(p.totalLiquido), 0);
  y += 4; if (y > 255) { d.addPage(); y = 20; }
  d.setFont('helvetica', 'bold'); d.text(`Total: ${R$(T)}`, 196, y, { align: 'right' }); d.text(`Pago: ${R$(P)}`, 196, y + 6, { align: 'right' });
  d.setTextColor(T - P > 0 ? 200 : 0, 0, 0); d.setFontSize(12); d.text(`A pagar: ${R$(T - P)}`, 196, y + 14, { align: 'right' });
  d.setTextColor(0); d.setFontSize(9); d.setFont('helvetica', 'normal'); d.text(`Pagamento via Pix - chave e-mail: ${EMP.pix}`, 14, 285); d.text('Obrigado pela preferência!', 196, 285, { align: 'right' });
  d.save(`Recibo_${c.nome.replace(/\s+/g, '_')}_${hoje()}.pdf`);
}

/* CONFIG */
const CF = [['precoUnd', 'Preço da unidade'], ['precoCombo', 'Preço base do combo (3 un)'], ['custoCopo', 'Abatimento por copo devolvido'], ['taxaCredIns', 'Taxa crédito inserção %'], ['taxaCredApr', 'Taxa crédito aproximação %'], ['taxaDebIns', 'Taxa débito inserção %'], ['taxaDebApr', 'Taxa débito aproximação %'], ['taxaOnline', 'Taxa link de pagamento %']];
const CIf = () => Object.keys(NS).flatMap(s => [['insumo.varejo.' + s, 'Insumo varejo — ' + NS[s]], ['insumo.atacado.' + s, 'Insumo atacado — ' + NS[s]]]);
const SI_C = [['Insumos', 203.44], ['CG', 128.61], ['MO', 114.25], ['Fundo', -23.97], ['Luyan', 0], ['Beatriz', 71.34], ['Entrega', 78]];
const SI_E = { pudim: 15, pudim_ninho: 16, pudim_brig: 0, leite_condensado: 22, leite_integral: 1550, ovos: 23, acucar: 900, leite_po: 200, nutella: 6608.55, creme_leite: 208.55, chocolate_50: 0, granulado: 0, copo: 5, tampa: 6, sacola_1: 0, sacola_2: 0, adesivo: 0, colher: 0 };
function rConfig() {
  if (role !== 'admin') { $('cfg-body').innerHTML = '<div class="card">Somente o administrador acessa as configurações.</div>'; return; }
  const C = db.config, vers = JSON.parse(localStorage.getItem(LSV) || '[]');
  $('cfg-body').innerHTML = `
  <div class="card"><h3>Preços, taxas e custos</h3><div class="fg">${CF.map(([k, l]) => `<div><label>${l}</label>${inp('c-' + k, 'number', C[k])}</div>`).join('')}${CIf().map(([k, l]) => `<div><label>${l}</label>${inp('c-' + k, 'number', gp(C, k))}</div>`).join('')}
  <div><label>Aviso de recompra (dias, padrão)</label>${inp('c-diasAviso', 'select', C.diasAviso, [[7, '7 dias'], [15, '15 dias']])}</div></div><div class="row"><button class="b pri" onclick="salvarCfg()">Salvar configurações</button></div></div>
  ${cfgFicha()}
  ${cfgLegado()}
  <div class="card"><h3>Abas que a Beatriz pode ver</h3><div class="fg">${TABS.filter(t => t[0] !== 'config').map(t => `<label style="display:flex;gap:8px;align-items:center;margin:4px 0"><input type="checkbox" id="av-${t[0]}" ${C.abasViewer[t[0]] ? 'checked' : ''}> ${t[2]}</label>`).join('')}</div><div class="row"><button class="b pri" onclick="salvarAbas()">Salvar permissões</button></div></div>
  ${C.setupFeito || db.ajustes.length ? '' : `<div class="card"><h3>Saldo inicial (valores dos prints — confira)</h3><div class="fg">${SI_C.map(([k, v]) => `<div><label>Caixinha ${k} (R$)</label>${inp('si-c-' + k, 'number', v)}</div>`).join('')}${Object.keys(SI_E).map(k => `<div><label>${ITENS[k][0]} (${ITENS[k][1]})</label>${inp('si-e-' + k, 'number', SI_E[k])}</div>`).join('')}</div><div class="row"><button class="b pri" onclick="aplicarSaldo()">Aplicar saldo inicial (uma vez)</button></div></div>`}
  ${cfgSabores()}
  ${cfgItens()}
  <div class="card"><h3>Segurança dos dados</h3><div class="row"><button class="b" onclick="exportar()">Baixar backup (.json)</button><button class="b" onclick="$('imp').click()">Restaurar de arquivo</button><input type="file" id="imp" accept=".json" hidden onchange="importar(event)"></div>
  <h4>Ajustes de caixa lançados (exclua duplicados aqui)</h4>${tbl(['Data', 'Caixinha', 'Valor', ''], ordenar(db.ajustes).map(x => [fdata(x.data), x.caixa, R$(x.valor), bt('🗑️', `excluir('ajustes',${x.id})`, 'red')]), 'Nenhum ajuste.')}
  <h4>Versões locais recentes</h4>${tbl(['Salva em', 'Registros', ''], vers.map((v, i) => [new Date(v.ts).toLocaleString('pt-BR'), total(JSON.parse(v.json)), bt('Restaurar', `restaurar(${i})`)]), 'Nenhuma versão ainda.')}</div>`;
  calcFicha(); sbForm();
}
function salvarCfg() { CF.concat(CIf()).forEach(([k]) => sp(db.config, k, num($('c-' + k).value))); db.config.diasAviso = num($('c-diasAviso').value); guardar(); toast('Configurações salvas.'); }
function salvarAbas() { TABS.filter(t => t[0] !== 'config').forEach(t => db.config.abasViewer[t[0]] = $('av-' + t[0]).checked); guardar(); toast('Permissões salvas.'); }
function aplicarSaldo() {
  if (db.config.setupFeito) return toast('O saldo inicial já foi aplicado.', 1);
  if (!confirm('Aplicar o saldo inicial? Faça isso só uma vez.')) return;
  SI_C.forEach(([k]) => { const v = num($('si-c-' + k).value); if (v) db.ajustes.push({ id: uid(), caixa: k, data: hoje(), valor: v }); });
  Object.keys(SI_E).forEach(k => { const v = num($('si-e-' + k).value); if (v > 0) db.estoqueMov.push({ id: uid(), data: hoje(), tipo: 'entrada', item: k, qtd: v, desc: 'Saldo inicial' }); });
  db.config.setupFeito = true; guardar(); rConfig(); toast('Saldo inicial aplicado!');
}
function exportar() { const b = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'backup_pudim_' + hoje() + '.json'; a.click(); }
function importar(ev) {
  const f = ev.target.files[0]; if (!f) return; const r = new FileReader();
  r.onload = () => { try { const n = carregar(JSON.parse(r.result)); if (confirm(`Substituir os ${total(db)} registros atuais pelos ${total(n)} do arquivo?`)) { db = n; guardar(true); toast('Restaurado.'); } } catch (e) { toast('Arquivo inválido.', 1); } }; r.readAsText(f);
}
function restaurar(i) { const v = JSON.parse(localStorage.getItem(LSV) || '[]')[i]; if (v && confirm(`Restaurar versão de ${new Date(v.ts).toLocaleString('pt-BR')} (${total(JSON.parse(v.json))} registros)?`)) { db = carregar(JSON.parse(v.json)); guardar(true); rConfig(); } }

/* ============ ATACADO MULTI-SABOR, SABORES NOVOS, RATEIO ============ */
const atItens = a => a.itens && a.itens.length ? a.itens : [{ sabor: a.sabor, qtd: a.qtd, unitario: a.unitario, custoUnd: a.custoUnd }];
const resumoAt = a => atItens(a).map(i => `${i.qtd}x ${NS[i.sabor] || i.sabor}`).join(' + ');
const insAt = a => Math.max(0, atItens(a).reduce((s, i) => s + num(i.qtd) * num(i.custoUnd), 0) - num(a.copos) * db.config.custoCopo);
const adic = s => num((db.sabores.find(x => x.id === s) || {}).adic);
function addItem(s, q, u, c) {
  const d = document.createElement('div'); d.className = 'irow'; d.dataset.s = s || ''; d.dataset.c = c ?? '';
  d.innerHTML = `<select class="ai-s">${optSab().map(x => `<option value="${x[0]}" ${x[0] === s ? 'selected' : ''}>${x[1]}</option>`).join('')}</select><input class="ai-q" type="number" placeholder="Qtd" value="${q ?? ''}"><input class="ai-u" type="number" step="any" placeholder="R$ por un." value="${u ?? ''}"><button type="button" class="b sm red" onclick="this.parentNode.remove()">✕</button>`;
  $('at-itens').appendChild(d);
}
function lerItens() {
  return [...document.querySelectorAll('#at-itens .irow')].map(r => { const sabor = r.querySelector('.ai-s').value; return { sabor, qtd: num(r.querySelector('.ai-q').value), unitario: num(r.querySelector('.ai-u').value), custoUnd: r.dataset.c !== '' && r.dataset.s === sabor ? num(r.dataset.c) : custo(sabor, 'atacado') }; }).filter(i => i.qtd > 0 && i.unitario > 0);
}
function aplicarCustom() {
  db.itensExtra.forEach(i => ITENS[i.id] = [i.nome, i.un]);
  Object.entries(db.config.itensNome || {}).forEach(([k, n]) => { if (ITENS[k]) ITENS[k] = [n, ITENS[k][1]]; });
  db.sabores.forEach(x => { const pk = x.prod || ('pudim_' + x.id); NS[x.id] = x.nome; SP[x.id] = pk; ITENS[pk] = ['Pudim ' + x.nome, 'un']; REC[x.id] = { rende: num(x.rende), prod: pk, ins: x.ins || {} }; });
}
function refreshSel() {
  const fill = (el, o) => { if (!el || el.options.length === o.length) return; const v = el.value; el.innerHTML = o.map(x => `<option value="${x[0]}">${x[1]}</option>`).join(''); if ([...el.options].some(p => p.value === v)) el.value = v; };
  ['pv-sab', 'pv-s1', 'pv-s2', 'pv-s3', 'f-producoes-sabor'].forEach(i => fill($(i), optSab()));
  document.querySelectorAll('.ai-s').forEach(e => fill(e, optSab()));
  fill($('pv-ev'), [['', 'Venda normal (varejo)'], ...db.eventos.filter(e => !e.encerrado).map(e => [e.id, '🎄 ' + e.nome])]);
  fill($('f-eventos-itemEmb'), [['', '— nenhuma —'], ...optIt().filter(([k]) => !PRONTOS.includes(k))]);
  fill($('f-estoqueMov-item'), optIt()); fill($('f-compras-item'), optComp());
}
function bnavSync() {
  const v = visiveis().map(t => t[0]), a = document.querySelector('.tab.on'), id = a ? a.id.slice(4) : '';
  document.querySelectorAll('#bnav button[data-t]').forEach(b => { b.hidden = !v.includes(b.dataset.t); b.classList.toggle('on', b.dataset.t === id); });
}
R.rateio = () => {
  const tab = L => {
    const T = { liq: 0, ins: 0, cg: 0, mo: 0, l: 0, fundo: 0, lu: 0, bea: 0 }, rows = L.map(([n, d, liq, ins]) => { const r = rateio(liq - ins); T.liq += liq; T.ins += ins; ['cg', 'mo', 'l', 'fundo', 'lu', 'bea'].forEach(k => T[k] += r[k]); return [n, fdata(d), R$(liq), `<span class="neg">-${R$(ins)}</span>`, `<span class="neg">-${R$(r.cg)}</span>`, `<span class="neg">-${R$(r.mo)}</span>`, `<b style="color:var(--ok)">${R$(r.l)}</b>`, R$(r.fundo), R$(r.lu), R$(r.bea)]; });
    const tot = ['<b>TOTAL</b>', '', `<b>${R$(T.liq)}</b>`, `<b>-${R$(T.ins)}</b>`, `<b>-${R$(T.cg)}</b>`, `<b>-${R$(T.mo)}</b>`, `<b>${R$(T.l)}</b>`, `<b>${R$(T.fundo)}</b>`, `<b>${R$(T.lu)}</b>`, `<b>${R$(T.bea)}</b>`];
    return tbl(['#', 'Data', 'Líquido', 'Insumo', 'Gerais (15%)', 'Mão de obra (23%)', 'Lucro', 'Fundo (12%)', 'Luyan (53%)', 'Beatriz (35%)'], L.length ? [tot, ...rows.slice(0, 80)] : [], 'Sem lançamentos.');
  };
  $('rt-v').innerHTML = tab(pedidosVarejo().map(p => ['#' + p.num, p.data, p.liq, p.ins]));
  { const M = economiaExtras(); $('rt-a').innerHTML = tab(ordenar(db.atacado.filter(a => a.status === 'PAGO')).map(a => ['#' + a.num, a.data, num(a.totalLiquido), Math.max(0, insAt(a) - (M.get('a:' + a.id) || 0))])); }
};

/* ============ FICHA TÉCNICA, SABORES, ITENS, EVENTOS ============ */
const PU = k => k === 'ovos' ? 'pacote c/ 20' : (k === 'sacola' ? 'un' : ({ g: 'kg', ml: 'litro', un: 'un' }[ITENS[k][1]]));
const costBase = (k, P = db.config.fichaPrecos) => num(P[k]) / (k === 'ovos' ? 20 : (ITENS[k] && ITENS[k][1] !== 'un' ? 1000 : 1));
const fichaKeys = () => Object.keys(ITENS).filter(k => !PRONTOS.includes(k) && !k.startsWith('sacola_')).concat('sacola');
function custosSabor(x, P) {
  P = P || db.config.fichaPrecos; let rec = 0; for (const k in (x.ins || {})) rec += num(x.ins[k]) * costBase(k, P);
  const at = (rec + num(x.rende) * (costBase('copo', P) + costBase('tampa', P) + costBase('adesivo', P))) / (num(x.rende) || 1);
  return { at, va: at + costBase('sacola', P) + costBase('colher', P) };
}
function cfgFicha() {
  const P = db.config.fichaPrecos;
  return `<div class="card"><h3>Calculadora de ficha técnica</h3><p style="color:var(--mu)">Custo de cada sabor calculado pelos ingredientes da receita. Só muda os custos oficiais quando você aplicar. Itens e sabores novos aparecem aqui sozinhos.</p><div class="fg">${fichaKeys().map(k => `<div><label>${k === 'sacola' ? 'Sacola' : ITENS[k][0]} (R$ / ${PU(k)})</label><input id="fp-${k}" type="number" step="any" value="${num(P[k])}" oninput="calcFicha()"></div>`).join('')}</div><div id="fc-res"></div><div class="row"><button class="b pri" onclick="aplicarFicha()">Aplicar custos nas tabelas varejo/atacado</button></div></div>`;
}
function lerP() { const P = {}; fichaKeys().forEach(k => { const e = $('fp-' + k); P[k] = e ? num(e.value) : num(db.config.fichaPrecos[k]); }); return P; }
function calcFicha() {
  const el = $('fc-res'); if (!el) return; const P = lerP();
  el.innerHTML = tbl(['Sabor', 'Atacado (un)', 'Varejo (un)', 'Cadastrado hoje (atac. / var.)'], db.sabores.map(x => { const c = custosSabor(x, P); return [NS[x.id] + (ativo(SP[x.id]) ? '' : ' <span class="tag wa">inativo</span>'), R$(c.at), '<b>' + R$(c.va) + '</b>', R$(custo(x.id, 'atacado')) + ' / ' + R$(custo(x.id, 'varejo'))]; }));
}
function aplicarFicha() {
  const P = lerP(); db.config.fichaPrecos = P;
  db.sabores.forEach(x => { const c = custosSabor(x, P); db.config.insumo.atacado[x.id] = r2(c.at); db.config.insumo.varejo[x.id] = r2(c.va); });
  guardar(); rConfig(); toast('Custos aplicados.');
}
let sbEdit = null;
function cfgSabores() {
  const rows = db.sabores.map(x => { const a = ativo(SP[x.id]); return [`<b>${x.nome}</b>`, x.rende, R$(custo(x.id, 'atacado')), R$(custo(x.id, 'varejo')), x.adic ? '+' + R$(x.adic) : '-', Object.entries(x.ins || {}).map(([k, q]) => `${r2(q)} ${ITENS[k] ? ITENS[k][1] : ''} ${ITENS[k] ? ITENS[k][0] : k}`).join(', '), `<span class="tag ${a ? 'ok' : 'no'}">${a ? 'Ativo' : 'Inativo'}</span>`, bt('✏️ Editar', `editSabor('${x.id}')`) + bt(a ? 'Inativar' : 'Ativar', `toggleInativo('${SP[x.id]}')`)]; });
  return `<div class="card"><h3>Sabores</h3>${tbl(['Sabor', 'Rende', 'Custo atac.', 'Custo var.', 'Adic. combo', 'Ingredientes por receita', 'Status', 'Ações'], rows)}
  <h4 id="sb-tit">Novo sabor</h4><div class="fg"><div><label>Nome do sabor</label><input id="sb-nome"></div><div><label>Pudins por receita</label><input id="sb-rende" type="number"></div><div><label>Adicional no combo (R$)</label><input id="sb-adic" type="number" step="any"></div><div><label>Custo insumo atacado (R$/un) — vazio = calcular pela ficha</label><input id="sb-ca" type="number" step="any"></div><div><label>Custo insumo varejo (R$/un) — vazio = calcular pela ficha</label><input id="sb-cv" type="number" step="any"></div></div>
  <label>Ingredientes por receita (copo, tampa e adesivo baixam sozinhos). Atenção: mudar a receita recalcula o estoque das produções já lançadas.</label><div id="sb-ing"></div><div class="row"><button class="b sm" onclick="addIng()">+ Ingrediente</button><button class="b pri" onclick="salvarSabor()">Salvar sabor</button><button class="b" onclick="sbEdit=null;sbForm()">Limpar / cancelar edição</button></div></div>`;
}
function sbForm() {
  if (!$('sb-nome')) return; const x = sbEdit ? db.sabores.find(y => y.id === sbEdit) : null;
  $('sb-tit').textContent = x ? 'Editando: ' + x.nome : 'Novo sabor';
  $('sb-nome').value = x ? x.nome : ''; $('sb-rende').value = x ? x.rende : 7; $('sb-adic').value = x ? (x.adic || 0) : 0;
  $('sb-ca').value = x ? custo(x.id, 'atacado') : ''; $('sb-cv').value = x ? custo(x.id, 'varejo') : '';
  $('sb-ing').innerHTML = ''; const e = x ? Object.entries(x.ins || {}) : []; if (e.length) e.forEach(([k, q]) => addIng(k, q)); else addIng();
}
function editSabor(id) { sbEdit = id; sbForm(); $('sb-nome').scrollIntoView({ behavior: 'smooth' }); }
function addIng(i, q) {
  const el = $('sb-ing'); if (!el) return; const d = document.createElement('div'); d.className = 'irow';
  d.innerHTML = `<select class="ig-i">${Object.keys(ITENS).filter(k => !PRONTOS.includes(k) && !EMB.includes(k)).map(k => `<option value="${k}" ${k === i ? 'selected' : ''}>${ITENS[k][0]} (${ITENS[k][1]})</option>`).join('')}</select><input class="ig-q" type="number" step="any" placeholder="Qtd por receita" value="${q ?? ''}"><button type="button" class="b sm red" onclick="this.parentNode.remove()">✕</button>`;
  el.appendChild(d);
}
function salvarSabor() {
  const nome = $('sb-nome').value.trim(), rende = num($('sb-rende').value);
  const id = sbEdit || nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!nome || !id || !rende) return toast('Informe nome e pudins por receita.', 1);
  if (!sbEdit && NS[id]) return toast('Já existe um sabor com esse nome.', 1);
  const ins = {}; document.querySelectorAll('#sb-ing .irow').forEach(r => { const q = num(r.querySelector('.ig-q').value), k = r.querySelector('.ig-i').value; if (q > 0) ins[k] = (ins[k] || 0) + q; });
  if (!Object.keys(ins).length) return toast('Adicione pelo menos um ingrediente.', 1);
  let x = db.sabores.find(y => y.id === id); if (!x) { x = { id, prod: 'pudim_' + id }; db.sabores.push(x); }
  Object.assign(x, { nome, rende, adic: num($('sb-adic').value), ins });
  const c = custosSabor(x); db.config.insumo.atacado[id] = num($('sb-ca').value) || r2(c.at); db.config.insumo.varejo[id] = num($('sb-cv').value) || r2(c.va);
  sbEdit = null; aplicarCustom(); guardar(); rConfig(); toast('Sabor salvo!');
}
function cfgItens() {
  const rows = Object.keys(ITENS).filter(k => !PRONTOS.includes(k)).map(k => { const a = ativo(k); return [ITENS[k][0], ITENS[k][1], minOf(k), `<span class="tag ${a ? 'ok' : 'no'}">${a ? 'Ativo' : 'Inativo'}</span>`, bt('✏️ Editar', `editItem('${k}')`) + bt(a ? 'Inativar' : 'Ativar', `toggleInativo('${k}')`)]; });
  return `<div class="card"><h3>Ingredientes e itens de estoque</h3>${tbl(['Item', 'Unid.', 'Estoque mínimo', 'Status', 'Ações'], rows)}<h4>Novo item</h4><div class="fg"><div><label>Nome</label><input id="ie-nome"></div><div><label>Unidade</label><select id="ie-un"><option value="g">gramas</option><option value="ml">ml</option><option value="un">unidades</option></select></div></div><div class="row"><button class="b pri" onclick="salvarItem()">Cadastrar item</button></div></div>`;
}
function editItem(k) { ask('Editar: ' + ITENS[k][0], [['n', 'Nome', 'text', ITENS[k][0]], ['m', `Estoque mínimo para alerta (${ITENS[k][1]})`, 'number', minOf(k)]], r => { if (r.n.trim()) db.config.itensNome[k] = r.n.trim(); db.config.minimos[k] = num(r.m); guardar(); rConfig(); toast('Item atualizado.'); }); }
function toggleInativo(k) { if (db.config.inativos[k]) delete db.config.inativos[k]; else db.config.inativos[k] = true; guardar(); rConfig(); }
function salvarItem() {
  const nome = $('ie-nome').value.trim(); if (!nome) return toast('Informe o nome.', 1);
  const id = 'x_' + uid(); db.itensExtra.push({ id, nome, un: $('ie-un').value }); db.config.fichaPrecos[id] = 0;
  aplicarCustom(); guardar(); rConfig(); toast('Item cadastrado! Informe o preço na ficha técnica.');
}
function vendaEvento(id) { switchTab('vendas'); refreshSel(); $('pv-ev').value = id; pdvEv(); }
function toggleEvento(id) { const e = db.eventos.find(x => x.id === id); e.encerrado = !e.encerrado; guardar(); }
R.eventos = () => {
  rLista('eventos'); const L = linhasFin().filter(x => x.canal === 'evento');
  $('ev-rel').innerHTML = tbl(['Evento', 'Unidades', 'Fat. bruto', 'Fat. líquido', 'Insumo + embalagem', 'Lucro líquido'], db.eventos.map(e => { const l = L.filter(x => x.ev === e.id), t = k => l.reduce((a, x) => a + x[k], 0); return [`<b>${e.nome}</b>`, t('q'), R$(t('bruto')), R$(t('liq')), R$(t('ins')), `<b style="color:var(--ok)">${R$(t('l'))}</b>`]; }), 'Nenhum evento ainda.');
};


/* ============ HISTÓRICO DE ALTERAÇÕES, DESFAZER, FECHAMENTO, VALORES ANTIGOS ============ */
const LOGC = ['vendas', 'atacado', 'despesas', 'pagamentos', 'ajustes', 'producoes', 'estoqueMov', 'compras', 'fechamentos'];
const LOGN = { vendas: 'Varejo', atacado: 'Atacado', despesas: 'Despesas', pagamentos: 'Saques', ajustes: 'Ajustes', producoes: 'Produção', estoqueMov: 'Estoque', compras: 'Compras', fechamentos: 'Fechamento', config: 'Configurações', sistema: 'Sistema' };
const CXN = { total: 'Total em conta', Insumos: 'Insumo fixo', CG: 'Custos gerais', MO: 'Mão de obra', Fundo: 'Fundo empresa', Luyan: 'Luyan', Beatriz: 'Beatriz', Entrega: 'Gaveta entregas' };
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const mesTxt = m => { const [y, mm] = String(m).split('-'); return MESES[mm - 1] ? MESES[mm - 1] + '/' + y : m; };
function dLog(c, r) {
  try {
    switch (c) {
      case 'vendas': return `Venda #${r.num}: ${R$(r.liquido)} (${r.produto} ${r.qtd}x, ${r.pgto})`;
      case 'atacado': return `Pedido #${r.num} de ${r.cliente}: ${R$(r.totalLiquido)} (${r.status === 'PAGO' ? 'pago' : 'pendente'})`;
      case 'despesas': return `Despesa "${r.item}": ${R$(dtot(r))} (${r.categoria})`;
      case 'pagamentos': return `Saque de ${R$(r.valor)} (${r.tipo})`;
      case 'ajustes': return `Ajuste em ${CXN[r.caixa] || r.caixa}: ${R$(r.valor)}`;
      case 'producoes': return `Produção: ${r.qtd} receita(s) de ${NS[r.sabor] || r.sabor}${num(r.extra) > 0 ? ` (+${r.extra} pudins extras)` : ''}`;
      case 'estoqueMov': return `Estoque ${IT(r.item)[0]}: ${r.tipo === 'entrada' ? '+' : '−'}${r2(r.qtd)} ${r.desc || ''}`;
      case 'compras': return `Compra de ${IT(r.item)[0]}: ${R$(r.valor)}`;
      case 'fechamentos': return `Fechamento de ${mesTxt(r.mes)}`;
    }
  } catch (e) { }
  return c;
}
function caixasDe(d) { const s = db; db = d; try { return caixas(); } finally { db = s; } }
function flat(o, p = '', r = {}) { for (const k in (o || {})) { const v = o[k], n = p ? p + '.' + k : k; if (v && typeof v === 'object') flat(v, n, r); else r[n] = v; } return r; }
function registrarLog(velho, forcar) {
  const ts = Date.now(), out = [], imp = {};
  try { const a = caixasDe(velho), b = caixas(); Object.keys(b).forEach(k => { if (Math.abs(b[k] - a[k]) >= 0.005) imp[k] = [r2(a[k]), r2(b[k])]; }); } catch (e) { }
  const mk = (col, acao, desc, rid, antes, antesDesc) => out.push({ id: uid(), ts, quem: email, col, acao, desc, rid: rid ?? null, antes: antes || null, antesDesc: antesDesc || null, v: imp });
  if (forcar) mk('sistema', 'restaurou', 'Backup restaurado ou importado');
  else {
    LOGC.forEach(c => {
      const A = new Map(arr(velho[c]).map(x => [x.id, x])), B = new Map(arr(db[c]).map(x => [x.id, x]));
      const derivado = x => (c === 'estoqueMov' || c === 'despesas') && x.ref;
      if (c === 'vendas') {
        const grupo = (lista, acao) => { if (!lista.length) return; const ns = [...new Set(lista.map(v => v.num))]; mk('vendas', acao, `Venda #${ns.join(', #')}: ${R$(lista.reduce((a, v) => a + num(v.liquido), 0))} (${lista.map(v => `${v.produto} ${v.qtd}x ${nomeSab(v)}`).join(' + ')})`, lista.length > 1 ? lista.map(v => v.id) : lista[0].id, acao === 'excluiu' ? (lista.length > 1 ? lista : lista[0]) : null); };
        grupo([...B.values()].filter(r => !A.has(r.id)), 'criou'); grupo([...A.values()].filter(r => !B.has(r.id)), 'excluiu');
        B.forEach((r, id) => { const o = A.get(id); if (o && JSON.stringify(o) !== JSON.stringify(r)) mk(c, 'editou', dLog(c, r), id, o, dLog(c, o)); });
        return;
      }
      B.forEach((r, id) => { if (derivado(r)) return; const o = A.get(id); if (!o) mk(c, 'criou', dLog(c, r), id); else if (JSON.stringify(o) !== JSON.stringify(r)) mk(c, 'editou', dLog(c, r), id, o, dLog(c, o)); });
      A.forEach((r, id) => { if (!B.has(id) && !derivado(r)) mk(c, 'excluiu', dLog(c, r), id, r); });
    });
    const fa = flat(velho.config), fb = flat(db.config), mud = Object.keys({ ...fa, ...fb }).filter(k => !k.startsWith('abasViewer') && !k.startsWith('inativos') && fa[k] !== fb[k]);
    if (mud.length) mk('config', 'editou', 'Configurações: ' + mud.slice(0, 6).map(k => `${k}: ${fa[k] ?? '-'} → ${fb[k] ?? '-'}`).join('; ') + (mud.length > 6 ? ` (+${mud.length - 6})` : ''));
  }
  if (out.length) { db.log = db.log.concat(out); if (db.log.length > 800) db.log = db.log.slice(-800); }
}
function desfazer(id) {
  const e = db.log.find(x => x.id === id); if (!e) return;
  if (!confirm(`Desfazer esta alteração?\n\n${e.desc}\n\nO lançamento volta ao estado de antes.`)) return;
  const l = e.col, A = db[l], ids = [].concat(e.rid), antes = e.antes ? [].concat(e.antes) : [];
  if (e.acao === 'criou') { db[l] = A.filter(x => !ids.includes(x.id)); if (l === 'compras') { db.estoqueMov = db.estoqueMov.filter(x => !ids.includes(x.ref)); db.despesas = db.despesas.filter(x => !ids.includes(x.ref)); } }
  else if (e.acao === 'excluiu') { if (antes.every(r => A.some(x => x.id === r.id))) return toast('Esse lançamento já existe de novo.', 1); antes.forEach(r => { if (!A.some(x => x.id === r.id)) { db[l].push(r); if (l === 'compras') SCH.compras.pos(r, true); } }); }
  else if (e.acao === 'editou') { const i = A.findIndex(x => x.id === e.rid); if (i < 0) return toast('Esse lançamento não existe mais.', 1); A[i] = e.antes; }
  e.desfeito = true; guardar(); toast('Alteração desfeita.');
}
const logF = { col: '', acao: '', mes: '', n: 10 };
const AC = { criou: ['Criou', 'ok'], editou: ['Editou', 'wa'], excluiu: ['Excluiu', 'no'], restaurou: ['Restaurou', 'wa'] };
H.log = () => `<details class="fd"><summary>🔎 Filtros</summary><div class="fg"><div><label>Tipo</label><select id="lf-col" onchange="logFiltro()"><option value="">Todos</option>${Object.entries(LOGN).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div><div><label>Ação</label><select id="lf-acao" onchange="logFiltro()"><option value="">Todas</option><option value="criou">Criou</option><option value="editou">Editou</option><option value="excluiu">Excluiu</option></select></div><div><label>Mês</label><input id="lf-mes" type="month" onchange="logFiltro()"></div></div><div class="row"><button class="b sm" onclick="logLimpa()">Limpar filtros</button></div></details><div id="log-lista"></div>`;
function logFiltro() { logF.col = $('lf-col').value; logF.acao = $('lf-acao').value; logF.mes = $('lf-mes').value; logF.n = 10; R.log(); }
function logLimpa() { ['lf-col', 'lf-acao', 'lf-mes'].forEach(i => $(i).value = ''); logFiltro(); }
const impHTML = v => Object.entries(v || {}).map(([k, [a, d]]) => `<span class="imp ${d > a ? 'up' : 'dn'}">${CXN[k] || k}: ${d > a ? '+' : '−'}${R$(Math.abs(d - a))} <small>(${R$(a)} → ${R$(d)})</small></span>`).join('') || '<span class="imp">Sem efeito nos valores</span>';
R.log = () => {
  const el = $('log-lista'); if (!el) return;
  const dm = ts => { const d = new Date(ts); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 7); };
  const todos = [...db.log].reverse().filter(e => (!logF.col || e.col === logF.col) && (!logF.acao || e.acao === logF.acao) && (!logF.mes || dm(e.ts) === logF.mes)), n = todos.length;
  el.innerHTML = n ? todos.slice(0, logF.n).map(e => { const ac = AC[e.acao] || [e.acao, 'wa'], pode = !e.desfeito && e.rid != null && LOGC.includes(e.col) && (e.acao === 'criou' || e.antes);
    return `<div class="le"><div class="lh"><span class="tag ${ac[1]}">${ac[0]}</span><b>${LOGN[e.col] || e.col}</b><small>${new Date(e.ts).toLocaleString('pt-BR')}, ${e.quem || ''}</small></div><div class="ld">${e.desc}</div>${e.antesDesc ? `<div class="lo">Antes: ${e.antesDesc}</div>` : ''}<div class="li">${impHTML(e.v)}</div>${e.desfeito ? '<span class="tag no">Desfeito</span>' : (pode ? `<button class="b sm adm" onclick="desfazer(${e.id})">↩ Desfazer</button>` : '')}</div>`; }).join('') + (n > logF.n ? `<div class="row mais"><button class="b" onclick="logF.n+=10;R.log()">Ver mais ${Math.min(10, n - logF.n)} (restam ${n - logF.n})</button></div>` : '')
    : '<div class="card vz">Nenhuma alteração encontrada.</div>';
};
/* Fechamento do mês */
const CATL = { INSUMOS: 'Insumos', EMBALAGEM: 'Embalagem', 'GASTOS GERAIS': 'Gastos gerais', MARKETING: 'Marketing', ENTREGADOR: 'Entregador' }, SQL = { MaoObra: 'Mão de obra', Luyan: 'Luyan', Beatriz: 'Beatriz' };
const CANAIS = [['varejo', 'Varejo'], ['atacado', 'Atacado pago'], ['evento', 'Eventos']];
const MET = [['bruto', 'Fat. bruto'], ['liq', 'Fat. líquido'], ['q', 'Qtd vendida'], ['ins', 'Insumo fixo'], ['cg', 'Custos gerais'], ['mo', 'Mão de obra'], ['l', 'Lucro líquido'], ['fundo', 'Fundo empresa'], ['lu', 'Luyan'], ['bea', 'Beatriz']];
function resumoMes(m) {
  const L = linhasFin().filter(x => (x.data || '').startsWith(m)), can = {}, desp = {}, saq = {}, cx = {}, c = caixas();
  CANAIS.forEach(([k]) => { const l = L.filter(x => x.canal === k), s = f => r2(l.reduce((a, x) => a + x[f], 0)); can[k] = {}; MET.forEach(([f]) => can[k][f] = s(f)); });
  db.despesas.filter(d => (d.data || '').startsWith(m)).forEach(d => { const k = catDesp(d); desp[k] = r2((desp[k] || 0) + dtot(d)); });
  db.pagamentos.filter(p => (p.data || '').startsWith(m)).forEach(p => { saq[p.tipo] = r2((saq[p.tipo] || 0) + num(p.valor)); });
  Object.keys(c).forEach(k => cx[k] = r2(c[k]));
  return { can, desp, saq, cx };
}
function tabResumo(r) {
  const f = (k, v) => k === 'q' ? v : R$(v), soma = (k) => CANAIS.reduce((a, [c]) => a + num(r.can[c][k]), 0);
  const dp = Object.entries(r.desp), sq = Object.entries(r.saq);
  return `<h4>Vendas e resultado do mês</h4>${tbl(['', ...CANAIS.map(x => x[1]), 'Total'], MET.map(([k, n]) => [n, ...CANAIS.map(([c]) => f(k, r.can[c][k])), `<b>${f(k, soma(k))}</b>`]))}
  <h4>Despesas do mês</h4>${tbl(['Categoria', 'Valor'], [...dp.map(([k, v]) => [CATL[k] || k, R$(v)]), ['<b>Total</b>', `<b>${R$(dp.reduce((a, x) => a + x[1], 0))}</b>`]], 'Sem despesas no mês.')}
  <h4>Saques do mês</h4>${tbl(['Caixinha', 'Valor'], sq.map(([k, v]) => [SQL[k] || k, R$(v)]), 'Sem saques no mês.')}
  <h4>Saldo das caixinhas (no momento do fechamento)</h4>${tbl(['Caixinha', 'Saldo'], Object.entries(CXN).map(([k, n]) => [n, R$(r.cx[k] || 0)]))}`;
}
H.fechamento = () => `<div class="card"><h3>Fechar o mês</h3><p style="color:var(--mu)">Guarda uma foto dos números do mês (vendas, lucro, despesas, saques e saldo das caixinhas). Depois de fechado, o resumo não muda mais, mesmo que você lance algo novo.</p><div class="fg"><div><label>Mês</label><input id="fc-mes" type="month" onchange="R.fechamento()"></div></div><div class="row adm"><button class="b pri" onclick="fecharMes()">🔒 Fechar este mês</button></div></div><div id="fc-prev"></div><h4>Meses fechados</h4><div id="fc-lista"></div>`;
R.fechamento = () => {
  const mi = $('fc-mes'); if (!mi.value) mi.value = hoje().slice(0, 7);
  const fe = db.fechamentos.find(x => x.mes === mi.value);
  $('fc-prev').innerHTML = `<h4>${fe ? 'Já fechado em ' + new Date(fe.ts).toLocaleDateString('pt-BR') + ': ' : 'Prévia de '}${mesTxt(mi.value)}</h4>` + tabResumo(fe || resumoMes(mi.value));
  $('fc-lista').innerHTML = tbl(['Mês', 'Fat. líquido', 'Lucro', 'Despesas', 'Total em conta', 'Fechado em', 'Ações'], [...db.fechamentos].sort((a, b) => a.mes < b.mes ? 1 : -1).map(f => [`<b>${mesTxt(f.mes)}</b>`, R$(CANAIS.reduce((a, [c]) => a + num(f.can[c].liq), 0)), R$(CANAIS.reduce((a, [c]) => a + num(f.can[c].l), 0)), R$(Object.values(f.desp || {}).reduce((a, v) => a + v, 0)), R$(f.cx.total), `${new Date(f.ts).toLocaleDateString('pt-BR')}, ${f.quem || ''}`, bt('Ver', `$('fc-mes').value='${f.mes}';R.fechamento();window.scrollTo(0,0)`, 'v') + bt('🗑️', `excluirFech(${f.id})`, 'red')]), 'Nenhum mês fechado ainda.');
};
function fecharMes() {
  const m = $('fc-mes').value; if (!m) return toast('Escolha o mês.', 1);
  const ja = db.fechamentos.find(x => x.mes === m);
  if (ja && !confirm(`${mesTxt(m)} já foi fechado. Substituir pelo fechamento de agora?`)) return;
  if (!ja && !confirm(`Fechar ${mesTxt(m)}? O resumo fica salvo e não muda mais.`)) return;
  db.fechamentos = db.fechamentos.filter(x => x.mes !== m); db.fechamentos.push({ id: uid(), mes: m, ts: Date.now(), quem: email, ...resumoMes(m) });
  guardar(); toast(mesTxt(m) + ' fechado.');
}
function excluirFech(id) { const f = db.fechamentos.find(x => x.id === id); if (f && confirm(`Excluir o fechamento de ${mesTxt(f.mes)}?`)) { db.fechamentos = db.fechamentos.filter(x => x.id !== id); guardar(); } }
/* Valores antigos (só nos Resultados do painel) */
const LGK = [['bruto', 'Fat. bruto'], ['liq', 'Fat. líquido'], ['ent', 'Taxa de entrega / logística'], ['q', 'Qtd vendida'], ['ins', 'Insumo fixo'], ['cg', 'Custos gerais'], ['mo', 'Mão de obra'], ['l', 'Lucro líquido'], ['fundo', 'Fundo empresa'], ['lu', 'Luyan'], ['bea', 'Beatriz'], ['giro', 'Giro (legado)']];
function cfgLegado() {
  const G = db.config.legado;
  return `<div class="card"><h3>Histórico anterior (valores antigos)</h3><p style="color:var(--mu)">Somados só nos Resultados do painel (quando o filtro de mês está em "Todos"). Não mexem nas caixinhas.</p>${[['varejo', 'Varejo'], ['atacado', 'Atacado']].map(([c, n]) => `<h4>${n}</h4><div class="fg">${LGK.map(([k, l]) => `<div><label>${l}</label>${inp('lg-' + c + '-' + k, 'number', num(G[c][k]))}</div>`).join('')}</div>`).join('')}<div class="row"><button class="b pri" onclick="salvarLegado()">Salvar histórico anterior</button></div></div>`;
}
function salvarLegado() { ['varejo', 'atacado'].forEach(c => LGK.forEach(([k]) => db.config.legado[c][k] = num($('lg-' + c + '-' + k).value))); guardar(); toast('Histórico anterior salvo.'); }

/* ============ NAVEGAÇÃO / INICIALIZAÇÃO ============ */
const visiveis = () => TABS.filter(t => role === 'admin' || (t[0] !== 'config' && db.config.abasViewer[t[0]]));
function buildNav() {
  $('nav').innerHTML = visiveis().map(t => `<button id="nv-${t[0]}" onclick="switchTab('${t[0]}')">${t[1]} ${t[2]}${t[0] === 'dashboard' ? '<span id="bdg"></span>' : ''}</button>`).join('');
  const a = document.querySelector('.tab.on'); if (a && $('nv-' + a.id.slice(4))) $('nv-' + a.id.slice(4)).classList.add('on');
}
function switchTab(id) {
  document.querySelectorAll('.tab').forEach(e => e.classList.remove('on')); document.querySelectorAll('#nav button').forEach(e => e.classList.remove('on'));
  $('tab-' + id).classList.add('on'); const b = $('nv-' + id); if (b) b.classList.add('on'); $('titulo').textContent = TABS.find(t => t[0] === id)[2];
  $('side').classList.remove('open'); if (id === 'config') rConfig(); localStorage.setItem('pudimTab', id); updateAll();
}
function updateAll() {
  aplicarCustom(); refreshSel(); bnavSync();
  if (!$('bdg')) buildNav(); else if (visiveis().length !== $('nav').children.length) { buildNav(); }
  const ativa = document.querySelector('.tab.on'); if (!ativa) return;
  const id = ativa.id.slice(4); if (id !== 'config') { try { R[id](); } catch (e) { console.error(id, e); } } if (id !== 'dashboard') rDash();
}
function entrar() {
  const e = $('l-email').value.trim(), s = $('l-senha').value; if (!e || !s) return $('lerr').textContent = 'Digite e-mail e senha.';
  $('l-btn').disabled = true; $('lerr').textContent = '';
  firebase.auth().signInWithEmailAndPassword(e, s).catch(er => { $('lerr').textContent = ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-login-credentials'].includes(er.code) ? 'E-mail ou senha incorretos.' : 'Erro: ' + er.code; }).finally(() => $('l-btn').disabled = false);
}
function sair() { firebase.auth().signOut(); }
function iniciar() {
  firebase.initializeApp(firebaseConfig);
  $('tabs').innerHTML = TABS.map(t => `<section class="tab" id="tab-${t[0]}">${H[t[0]]()}</section>`).join('');
  Object.keys(SCH).forEach(l => { const f = $('form-' + l); if (f) renderForm(l); });
  try { const s = localStorage.getItem(LS); if (s) db = carregar(JSON.parse(s)); } catch (e) { }
  pdvTog(); pdvCart();
  firebase.auth().onAuthStateChanged(u => {
    if (!u) { $('login').hidden = false; $('app').hidden = true; return; }
    email = (u.email || '').toLowerCase();
    if (email !== ADMIN && email !== VIEWER) { $('lerr').textContent = 'Este e-mail não tem permissão.'; firebase.auth().signOut(); return; }
    role = email === ADMIN ? 'admin' : 'viewer'; document.body.classList.toggle('viewer', role === 'viewer'); $('user').textContent = email;
    $('login').hidden = true; $('app').hidden = false; buildNav();
    const v = visiveis().map(t => t[0]), t = localStorage.getItem('pudimTab'); switchTab(v.includes(t) ? t : v[0]);
    firebase.database().ref('pudimAppDB').on('value', s => {
      db = carregar(s.exists() ? s.val() : null); carregou = true; ultimoTotal = total(db); ultimoJSON = JSON.stringify(db);
      ultimoSync = {}; KEYS.concat('config').forEach(k => ultimoSync[k] = JSON.stringify(db[k]));
      try { localStorage.setItem(LS, ultimoJSON); } catch (e) { } $('sync').classList.remove('off');
      buildNav(); const a = document.querySelector('.tab.on'); if (a && !visiveis().some(t => 'tab-' + t[0] === a.id)) switchTab(visiveis()[0][0]); else updateAll();
    }, er => { $('sync').classList.add('off'); toast('Sem leitura da nuvem: ' + er.code, 1); });
  });
}
iniciar();
