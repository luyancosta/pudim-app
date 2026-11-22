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
const KEYS = ['clientes', 'vendas', 'atacado', 'despesas', 'pagamentos', 'producoes', 'estoqueMov', 'ajustes', 'compras', 'sabores', 'itensExtra'];

/* ============ HELPERS ============ */
const $ = id => document.getElementById(id);
const num = v => parseFloat(v) || 0;
const r2 = v => Math.round(v * 100) / 100;
const hoje = () => { const t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset()); return t.toISOString().slice(0, 10); };
const R$ = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(v) < 0.005 ? 0 : v);
const fdata = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '-';
const arr = o => !o ? [] : (Array.isArray(o) ? o : Object.values(o)).filter(Boolean);
const uid = () => Date.now() + Math.floor(Math.random() * 1000);
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
function toast(m, err) { const t = $('toast'); t.textContent = m; t.className = 'on' + (err ? ' err' : ''); clearTimeout(t._t); t._t = setTimeout(() => t.className = '', 3200); }
function ask(titulo, campos, cb) {
  $('m-t').textContent = titulo;
  $('m-b').innerHTML = campos.map(c => `<label>${c[1]}</label>${inp('m-' + c[0], c[2], c[3], c[4])}`).join('');
  $('m-ok').hidden = false; $('modal').hidden = false;
  $('m-ok').onclick = () => { const v = {}; campos.forEach(c => v[c[0]] = $('m-' + c[0]).value); fechar(); cb(v); };
}
function info(t, h) { $('m-t').textContent = t; $('m-b').innerHTML = h; $('m-ok').hidden = true; $('modal').hidden = false; }
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
const minOf = k => MIN[k] ?? (PRONTOS.includes(k) ? 5 : 0);
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
  ['dashboard', '📊', 'Painel'], ['estoque', '🏭', 'Estoque e produção'], ['vendas', '🛒', 'Varejo (PDV)'], ['atacado', '📦', 'Atacado'], ['clientes', '👥', 'Clientes'],
  ['receber', '⏳', 'A receber'], ['compras', '🧾', 'Compra direta'], ['precos', '📈', 'Histórico de preços'], ['contagem', '🔢', 'Contagem mensal'], ['rateio', '⚖️', 'Rateio'],
  ['despesas', '💸', 'Despesas'], ['saques', '🏧', 'Saques'], ['config', '⚙️', 'Configurações']
];
const CFG0 = {
  precoUnd: 15, precoCombo: 40, custoCopo: 1.5, taxaCredIns: 4.98, taxaCredApr: 3.09, taxaDebIns: 1.99, taxaDebApr: 0.89, taxaOnline: 2.99, diasAviso: 7,
  insumo: { varejo: { tradicional: 6.22, ninho: 7.29, brigadeirao: 6.96 }, atacado: { tradicional: 5.12, ninho: 6.19, brigadeirao: 5.86 } },
  ficha: { lc: 6.5, li: 4.5, ov: 14, ac: 4, cp: 1.5, tp: 1.2, ad: .55, sc: .9, co: .2, lp: 40, nt: 75, cl: 10, ch: 60, gr: 40 },
  abasViewer: { dashboard: true, contagem: true, estoque: true }, setupFeito: false
};
let db, role = 'viewer', email = '', carregou = false, ultimoTotal = 0, ultimoSync = {}, ultimoJSON = '', cart = [], edit = {};

function carregar(d) {
  d = d || {}; const c = d.config || {}, i = c.insumo || {};
  const o = { config: { ...CFG0, ...c, insumo: { varejo: { ...CFG0.insumo.varejo, ...i.varejo }, atacado: { ...CFG0.insumo.atacado, ...i.atacado } }, ficha: { ...CFG0.ficha, ...c.ficha }, abasViewer: { ...CFG0.abasViewer, ...c.abasViewer } } };
  KEYS.forEach(k => o[k] = arr(d[k])); return o;
}
db = carregar(null);
const total = d => KEYS.reduce((a, k) => a + arr(d[k]).length, 0);
const custo = (s, canal) => db.config.insumo[canal][s] || 0;

/* ============ GRAVAÇÃO SEGURA ============ */
function versoes() {
  try {
    const v = JSON.parse(localStorage.getItem(LSV) || '[]');
    if (ultimoJSON && (!v.length || Date.now() - v[0].ts > 600000)) { v.unshift({ ts: Date.now(), json: ultimoJSON }); localStorage.setItem(LSV, JSON.stringify(v.slice(0, 5))); }
  } catch (e) { }
}
function guardar(forcar) {
  if (role !== 'admin') return toast('Modo visualização: só o administrador altera.', 1);
  if (!carregou) return toast('Aguarde a sincronização com a nuvem.', 1);
  const t = total(db);
  if (!forcar && ultimoTotal > 10 && t < ultimoTotal * 0.5) { db = carregar(JSON.parse(ultimoJSON)); updateAll(); return toast('Gravação bloqueada: os dados ficaram muito menores. Nada foi alterado.', 1); }
  versoes();
  KEYS.concat('config').forEach(k => {
    const j = JSON.stringify(db[k]);
    if (j !== ultimoSync[k]) firebase.database().ref('pudimAppDB/' + k).set(JSON.parse(j)).then(() => { ultimoSync[k] = j; $('sync').classList.remove('off'); }).catch(e => { $('sync').classList.add('off'); toast('Erro ao salvar na nuvem: ' + e.code, 1); });
  });
  ultimoTotal = t; ultimoJSON = JSON.stringify(db);
  try { localStorage.setItem(LS, ultimoJSON); } catch (e) { }
  updateAll();
}

/* ============ CÁLCULOS ============ */
const comboOk = v => v.produto === 'Combo' && Array.isArray(v.saboresCombo) && v.saboresCombo.length === 3;
const unid = v => comboOk(v) ? v.saboresCombo.map(s => [s, num(v.qtd) || 1]) : [[v.sabor || 'tradicional', (v.produto === 'Combo' ? 3 : 1) * (num(v.qtd) || 1)]];
const qtdTotal = v => unid(v).reduce((a, x) => a + x[1], 0);
const nomeSab = v => { if (comboOk(v)) { const c = {}; v.saboresCombo.forEach(s => c[s] = (c[s] || 0) + 1); return Object.entries(c).map(([s, n]) => `${n}x ${NS[s]}`).join(' + '); } return NS[v.sabor] || 'Tradicional'; };
const rateio = b => { const cg = b * .15, mo = b * .23, l = b - cg - mo; return { cg, mo, l, fundo: l * .12, bea: l * .35, lu: l * .53 }; };

/* Atacado só entra nos números quando PAGO (mas conta no mês do pedido). */
function linhasFin() {
  const L = [];
  db.vendas.forEach(v => { const q = qtdTotal(v), ins = q * num(v.custoUnd), liq = num(v.liquido); L.push({ canal: 'varejo', data: v.data || '', q, bruto: num(v.bruto), liq, ins, ...rateio(liq - ins), sab: unid(v) }); });
  db.atacado.filter(a => a.status === 'PAGO').forEach(a => { const ins = insAt(a), liq = num(a.totalLiquido); L.push({ canal: 'atacado', data: a.data || '', q: num(a.qtd), bruto: num(a.totalBruto), liq, ins, ...rateio(liq - ins), sab: atItens(a).map(i => [i.sabor, num(i.qtd)]) }); });
  return L;
}
function saldos() {
  const s = {}; Object.keys(ITENS).forEach(k => s[k] = 0);
  db.estoqueMov.forEach(m => { if (s[m.item] !== undefined) s[m.item] += m.tipo === 'entrada' ? num(m.qtd) : -num(m.qtd); });
  // Insumos baixam SOMENTE na receita; a receita já cria o pudim pronto.
  db.producoes.forEach(p => { const r = REC[p.sabor] || REC.tradicional, q = num(p.qtd); s[r.prod] += q * r.rende; for (const k in r.ins) s[k] -= q * r.ins[k]; ['copo', 'tampa', 'adesivo'].forEach(k => s[k] -= q * r.rende); });
  // Venda baixa o pudim pronto, a colher e a sacola (nunca os insumos de novo).
  db.vendas.forEach(v => { unid(v).forEach(([sb, q]) => s[SP[sb] || 'pudim'] -= q); s.colher -= qtdTotal(v); if (v.sacTipo && v.sacTipo !== 'nenhuma') s[v.sacTipo] -= num(v.sacQtd); });
  db.atacado.forEach(a => { atItens(a).forEach(i => s[SP[i.sabor] || 'pudim'] -= num(i.qtd)); s.copo += num(a.copos); });
  return s;
}
function caixas() {
  const L = linhasFin(), sm = k => L.reduce((a, x) => a + x[k], 0);
  const dsp = c => db.despesas.filter(d => d.categoria === c).reduce((a, d) => a + num(d.total), 0);
  const aj = c => db.ajustes.filter(a => a.caixa === c).reduce((a, x) => a + num(x.valor), 0);
  const sq = t => db.pagamentos.filter(p => p.tipo === t).reduce((a, p) => a + num(p.valor), 0);
  const ev = []; db.vendas.forEach(v => { if (num(v.entrega) > 0) ev.push({ d: v.data || '', id: v.id, t: 'e', v: num(v.entrega) }); });
  db.despesas.filter(d => d.categoria === 'ENTREGADOR').forEach(d => ev.push({ d: d.data || '', id: d.id, t: 's', v: num(d.total) }));
  ev.sort((a, b) => a.d === b.d ? a.id - b.id : (a.d < b.d ? -1 : 1));
  let gav = 0, desc = 0; ev.forEach(e => { if (e.t === 'e') gav += e.v; else if (gav >= e.v) gav -= e.v; else { desc += e.v - gav; gav = 0; } });
  const c = { Insumos: sm('ins') - dsp('INSUMOS') - dsp('EMBALAGEM') + aj('Insumos'), CG: sm('cg') - dsp('GASTOS GERAIS') - desc + aj('CG'), MO: sm('mo') - sq('MaoObra') + aj('MO'), Fundo: sm('fundo') - dsp('MARKETING') + aj('Fundo'), Luyan: sm('lu') - sq('Luyan') + aj('Luyan'), Beatriz: sm('bea') - sq('Beatriz') + aj('Beatriz'), Entrega: gav + aj('Entrega') };
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
const optSab = () => Object.entries(NS);
const optIt = () => Object.entries(ITENS).map(([k, v]) => [k, v[0]]);
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
  despesas: {
    t: 'Despesa', f: [['data', 'Data', 'date'], ['item', 'Descrição', 'text'], ['qtd', 'Qtd', 'number'], ['unitario', 'Valor unitário (R$)', 'number'], ['categoria', 'Categoria', 'select', [['INSUMOS', 'Insumos'], ['EMBALAGEM', 'Embalagem'], ['GASTOS GERAIS', 'Gastos gerais'], ['MARKETING', 'Marketing'], ['ENTREGADOR', 'Entregador']]]],
    h: ['#', 'Data', 'Item', 'Total', 'Categoria'], r: d => ['#' + d.num, fdata(d.data), d.item, R$(d.total), d.categoria],
    pre: o => { o.qtd = num(o.qtd) || 1; o.unitario = num(o.unitario); o.total = r2(o.qtd * o.unitario); if (!o.total) { toast('Informe o valor.', 1); return false; } }
  },
  pagamentos: { t: 'Saque', f: [['data', 'Data', 'date'], ['tipo', 'Caixinha', 'select', [['MaoObra', 'Mão de obra'], ['Luyan', 'Luyan'], ['Beatriz', 'Beatriz']]], ['valor', 'Valor (R$)', 'number'], ['obs', 'Observação', 'text']], h: ['Data', 'Caixinha', 'Valor', 'Obs.'], r: p => [fdata(p.data), p.tipo, '-' + R$(p.valor), p.obs || '-'], pre: o => { o.valor = num(o.valor); if (!o.valor) { toast('Informe o valor.', 1); return false; } } },
  producoes: { t: 'Produção (bater receita)', f: [['data', 'Data', 'date'], ['sabor', 'Sabor', 'select', optSab], ['qtd', 'Nº de receitas', 'number', null, 1]], h: ['Data', 'Sabor', 'Receitas', 'Pudins'], r: p => [fdata(p.data), NS[p.sabor], p.qtd, p.qtd * REC[p.sabor].rende], pre: o => { o.qtd = num(o.qtd); if (!o.qtd) { toast('Informe a quantidade.', 1); return false; } } },
  estoqueMov: {
    t: 'Ajuste manual / perda', f: [['data', 'Data', 'date'], ['item', 'Item', 'select', optIt], ['tipo', 'Tipo', 'select', [['entrada', 'Entrada (+)'], ['saida', 'Saída (−)'], ['perda', 'Perda / quebra']]], ['qtd', 'Quantidade', 'number'], ['desc', 'Motivo', 'text']],
    h: ['Data', 'Item', 'Mov.', 'Motivo'], r: m => [fdata(m.data), ITENS[m.item] ? ITENS[m.item][0] : m.item, `<b class="${m.tipo === 'entrada' ? '' : 'neg'}">${m.tipo === 'entrada' ? '+' : '−'}${r2(m.qtd)}</b>`, m.desc || '-'],
    pre: o => { o.qtd = num(o.qtd); if (!o.qtd) { toast('Informe a quantidade.', 1); return false; } if (o.tipo === 'perda') { o.tipo = 'saida'; o.desc = 'PERDA: ' + (o.desc || ''); } }
  },
  compras: {
    t: 'Compra direta (atualiza estoque e despesas)', semEdit: 1, f: [['data', 'Data', 'date'], ['fornecedor', 'Fornecedor (opcional)', 'text'], ['item', 'Item', 'select', optComp], ['qtd', 'Quantidade', 'number'], ['unidade', 'Unidade', 'select', [['un', 'Unidade(s)'], ['kg', 'Quilo(s)'], ['g', 'Grama(s)'], ['l', 'Litro(s)'], ['ml', 'ml'], ['pct20', 'Pacote c/ 20 un']]], ['valor', 'Valor total pago (R$)', 'number']],
    h: ['Data', 'Item', 'Comprado', 'Entrou no estoque', 'Total', 'Fornecedor'], r: c => [fdata(c.data), ITENS[c.item][0], `${c.qtd} ${c.unidade}`, `${r2(c.qtdBase)} ${ITENS[c.item][1]}`, R$(c.valor), c.fornecedor || '-'],
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
const formHTML = l => { const s = SCH[l]; return `<div class="card"><h3>${edit[l] ? '✏️ Editando: ' : ''}${s.t}</h3><div class="fg">${s.f.map(([k, lb, t, o, d]) => `<div><label>${lb}</label>${inp(`f-${l}-${k}`, t, d !== undefined ? d : (t === 'date' ? hoje() : ''), typeof o === 'function' ? o() : o)}</div>`).join('')}</div>${s.extra ? s.extra() : ''}<div class="row"><button class="b pri" onclick="salvar('${l}')">Salvar</button>${edit[l] ? `<button class="b" onclick="limpar('${l}')">Cancelar edição</button>` : ''}</div></div>`; };
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
  edit[l] = null; renderForm(l); guardar(); toast('Salvo!');
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
function rLista(l) {
  const s = SCH[l], el = $('lista-' + l); if (!el) return;
  el.innerHTML = tbl([...s.h, 'Ações'], ordenar(db[l]).slice(0, 80).map(x => [...s.r(x), (s.ex ? s.ex(x) : '') + (s.semEdit ? '' : bt('✏️', `editar('${l}',${x.id})`)) + bt('🗑️', `excluir('${l}',${x.id})`, 'red')]));
}
const lista = l => `<div class="adm" id="form-${l}"></div><div id="lista-${l}"></div>`;

/* ============ HTML DAS ABAS ============ */
const H = {
  dashboard: () => `<div id="aviso-setup"></div><div class="card row" style="margin-top:0"><label style="margin:0">Mês:</label><input type="month" id="dash-mes" style="width:170px" onchange="rDash()"><button class="b" onclick="$('dash-mes').value='';rDash()">Todos</button></div><div id="dash-body"></div>`,
  contagem: () => `<div id="cont-body"></div>`,
  vendas: () => `<div class="card adm"><h3>1. Montar pedido</h3><div class="fg">
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
    <div class="alert row" style="justify-content:space-between"><b>Total a cobrar</b><b id="pv-total" style="font-size:1.5rem">R$ 0,00</b></div>
    <button class="b pri" onclick="pdvFinal()">Finalizar venda</button></div>
    <h4>Histórico de vendas</h4><div id="lista-vendas"></div>`,
  atacado: () => lista('atacado'), clientes: () => `<div class="alert" id="rc-aviso" hidden></div>${lista('clientes').replace('<div id="lista-clientes"></div>', '')}<div id="clientes-tab"></div>`,
  receber: () => `<div class="grid" id="rec-k"></div><div id="rec-t"></div>`,
  compras: () => lista('compras'), precos: () => `<div id="precos-body"></div>`,
  estoque: () => `<div class="grid" id="est-k"></div><div id="est-prev"></div><div class="fg"><div>${lista('producoes')}</div><div>${lista('estoqueMov')}</div></div>`,
  despesas: () => lista('despesas'), saques: () => lista('pagamentos'),
  rateio: () => `<h4>Varejo</h4><div id="rt-v"></div><h4>Atacado (pedidos pagos)</h4><div id="rt-a"></div>`,
  config: () => `<div id="cfg-body"></div>`
};

/* ============ RENDER ============ */
const R = {};
const KB = (t, v, c) => kpi(t, R$(v), v < -0.004 ? 'neg ' + (c || '') : c || '');
R.dashboard = () => rDash();
function rDash() {
  const c = caixas(), m = $('dash-mes') ? $('dash-mes').value : '', L = linhasFin().filter(x => !m || x.data.startsWith(m));
  const rc = recompra().filter(x => x.alerta), pend = db.atacado.filter(atrasado), sal = saldos(), baixos = Object.keys(ITENS).filter(k => sal[k] <= minOf(k));
  $('aviso-setup').innerHTML = db.config.setupFeito || role !== 'admin' ? '' : `<div class="alert">Sistema novo: confira e aplique o <b>saldo inicial</b> em Configurações. <button class="b sm" onclick="irPara('config')">Abrir</button></div>`;
  const cx = (t, k, ex) => `<div class="k c-${k} ${c[k] < -0.004 ? 'neg' : ''}"><small>${t}</small><b>${R$(c[k])}</b><div class="row">${ex || ''}${bt('⚖️ Ajustar', `ajustar('${k}')`)}</div></div>`;
  const grp = can => { const l = L.filter(x => x.canal === can), s = k => l.reduce((a, x) => a + x[k], 0); return `<div class="grid">${kpi('Fat. bruto', R$(s('bruto')))}${kpi('Fat. líquido', R$(s('liq')))}${kpi('Qtd vendida', s('q'))}${KB('Insumo fixo', s('ins'))}${KB('Custos gerais', s('cg'))}${KB('Mão de obra', s('mo'))}${KB('Lucro líquido', s('l'), 'ok')}${kpi('Fundo empresa', R$(s('fundo')))}${kpi('Luyan', R$(s('lu')))}${kpi('Beatriz', R$(s('bea')))}</div>`; };
  $('dash-body').innerHTML = `
  ${rc.length ? `<div class="alert"><b>📞 Clientes para contatar (${rc.length})</b>${tbl(['Cliente', 'Último pedido', 'Dias', 'Ações'], rc.map(x => [x.c.nome, fdata(x.ult), `${x.dias} (aviso em ${x.lim})`, `<a class="b sm" target="_blank" href="${wpp(x.c)}">WhatsApp</a>` + bt('✔ Contatado hoje', `contatado(${x.c.id})`)]))}</div>` : ''}
  ${pend.length ? `<div class="alert"><b>⚠️ ${pend.length} pedido(s) de atacado vencido(s)</b> — veja em "A receber".</div>` : ''}
  ${baixos.length ? `<div class="alert"><b>📦 Estoque baixo:</b> ${baixos.map(k => ITENS[k][0]).join(', ')}</div>` : ''}
  <div class="grid"><div class="k big"><small>Dinheiro total disponível em conta</small><b>${R$(c.total)}</b><div class="row">${bt('⚖️ Ajustar caixa geral', `ajustar('Caixa Geral')`)}</div></div></div>
  <h4>Caixinhas</h4><div class="grid">${cx('Insumo fixo', 'Insumos')}${cx('Custos gerais', 'CG')}${cx('Mão de obra', 'MO', bt('Sacar', `sacar('MaoObra')`, 'red'))}${cx('Fundo empresa', 'Fundo')}${cx('Luyan', 'Luyan', bt('Sacar', `sacar('Luyan')`, 'red'))}${cx('Beatriz', 'Beatriz', bt('Sacar', `sacar('Beatriz')`, 'red'))}${cx('Gaveta entregas', 'Entrega')}</div>
  <h4>Varejo ${m ? '(' + m + ')' : '(tudo)'}</h4>${grp('varejo')}<h4>Atacado pago</h4>${grp('atacado')}`;
  const n = rc.length + pend.length; $('bdg').innerHTML = n ? `<span class="bdg">${n}</span>` : '';
}
R.contagem = () => {
  const M = {}; const g = m => M[m] ||= { t: 0, n: 0, b: 0, x: 0, q: 0, br: 0, lq: 0, l: 0, d: 0 };
  linhasFin().forEach(x => { const o = g(x.data.slice(0, 7) || 'Sem data'); x.sab.forEach(([s, q]) => { if (s === 'ninho') o.n += q; else if (s === 'brigadeirao') o.b += q; else if (s === 'tradicional') o.t += q; else o.x += q; }); o.q += x.q; o.br += x.bruto; o.lq += x.liq; o.l += x.l; });
  db.despesas.forEach(d => { g(d.data.slice(0, 7) || 'Sem data').d += num(d.total); });
  const mn = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  $('cont-body').innerHTML = `<div class="card">Atacado conta no <b>mês do pedido</b>, mas só aparece aqui depois de marcado como <b>pago</b>.</div>` + tbl(['Mês', 'Tradicional', 'Ninho', 'Brigadeirão', 'Outros sabores', 'Total vendido', 'Fat. bruto', 'Fat. líquido', 'Lucro líquido', 'Despesas'], Object.keys(M).sort().reverse().map(k => { const o = M[k], [y, mm] = k.split('-'); return [mm ? `<b>${mn[mm - 1]}/${y}</b>` : k, o.t, o.n, o.b, o.x, `<b>${o.q} un</b>`, R$(o.br), R$(o.lq), `<b style="color:var(--ok)">${R$(o.l)}</b>`, `<span class="neg">${R$(o.d)}</span>`]; }));
};
R.vendas = () => { $('lista-vendas').innerHTML = tbl(['#', 'Data', 'Produto', 'Sabores', 'Líquido', 'Pgto', ''], ordenar(db.vendas).slice(0, 80).map(v => ['#' + v.num, fdata(v.data), `${v.produto} (${v.qtd}x)`, nomeSab(v), R$(v.liquido), v.pgto, bt('🗑️', `excluir('vendas',${v.id})`, 'red')])); };
R.atacado = () => { const s = $('f-atacado-clienteId'); if (s && !edit.atacado) { const v = s.value; s.innerHTML = optCli().map(x => `<option value="${x[0]}">${x[1]}</option>`).join(''); s.value = v; } rLista('atacado'); };
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
  h.forEach(c => { const l = por[c.item] ||= [], p = l[l.length - 1], v = p ? (c.precoRef - p) / p * 100 : null; l.push(c.precoRef); hist.push([fdata(c.data), ITENS[c.item][0], c.fornecedor || '-', R$(c.precoRef) + '/' + (ITENS[c.item][1] === 'g' ? 'kg' : ITENS[c.item][1] === 'ml' ? 'L' : 'un'), v === null ? '-' : `<b class="${v > 0 ? 'neg' : ''}" style="${v < 0 ? 'color:var(--ok)' : ''}">${v > 0 ? '▲' : v < 0 ? '▼' : '='} ${Math.abs(v).toFixed(1)}%</b>`]); });
  const res = Object.entries(por).map(([k, l]) => { const a = l[l.length - 1], p = l[l.length - 2], v = p ? (a - p) / p * 100 : null; return [ITENS[k][0], R$(a), p ? R$(p) : '-', v === null ? '-' : `${v > 0 ? '▲' : '▼'} ${Math.abs(v).toFixed(1)}%`, R$(Math.min(...l)), R$(Math.max(...l)), l.length]; });
  $('precos-body').innerHTML = `<div class="card">Apenas acompanhamento. <b>Não altera</b> a Calculadora de Ficha Técnica.</div><h4>Resumo por item (preço por kg, litro ou unidade)</h4>${tbl(['Item', 'Atual', 'Anterior', 'Variação', 'Mínimo', 'Máximo', 'Compras'], res, 'Registre compras para ver a evolução.')}<h4>Todas as compras</h4>${tbl(['Data', 'Item', 'Fornecedor', 'Preço', 'Variação vs. compra anterior'], hist.reverse())}`;
};
function previsao() {
  const lim = new Date(); lim.setDate(lim.getDate() - 28); const li = lim.toISOString().slice(0, 10), sal = saldos(), venda = Object.fromEntries(Object.keys(REC).map(k => [k, 0]));
  db.vendas.filter(v => v.data >= li).forEach(v => unid(v).forEach(([s, q]) => venda[s] += q)); db.atacado.filter(a => a.data >= li).forEach(a => atItens(a).forEach(i => venda[i.sabor] += num(i.qtd)));
  const need = {}, rows = Object.keys(REC).map(s => { const r = REC[s], sem = venda[s] / 4, rec = Math.ceil(Math.max(0, sem - sal[r.prod]) / r.rende); for (const k in r.ins) need[k] = (need[k] || 0) + rec * r.ins[k]; ['copo', 'tampa', 'adesivo'].forEach(k => need[k] = (need[k] || 0) + rec * r.rende); return [NS[s], r2(sem), sal[r.prod], `<b>${rec}</b>`]; });
  const compras = Object.keys(ITENS).filter(k => !PRONTOS.includes(k)).map(k => { const falta = Math.max(0, (need[k] || 0) - sal[k]), baixo = sal[k] <= minOf(k) ? Math.max(0, minOf(k) * 2 - sal[k]) : 0, sug = Math.ceil(Math.max(falta, baixo)); return sug > 0 ? [ITENS[k][0], r2(sal[k]) + ' ' + ITENS[k][1], `<b>${sug} ${ITENS[k][1]}</b>`] : null; }).filter(Boolean);
  return `<h4>Previsão de produção da semana (média das últimas 4 semanas)</h4>${tbl(['Sabor', 'Venda média/semana', 'Estoque pronto', 'Receitas a bater'], rows)}<h4>Lista de compras sugerida</h4>${tbl(['Item', 'Saldo', 'Comprar'], compras, 'Estoque suficiente para a previsão. ✅')}`;
}
R.estoque = () => {
  const s = saldos();
  $('est-k').innerHTML = Object.keys(ITENS).map(k => { const v = r2(s[k]), c = v <= 0 ? 'neg' : ''; return `<div class="k ${c}" style="${v > 0 && v <= minOf(k) ? 'border-left-color:#F59E0B' : ''}"><small>${ITENS[k][0]}</small><b>${v} ${ITENS[k][1]}</b><div class="row">${bt('Contagem', `contar('${k}')`)}</div></div>`; }).join('');
  $('est-prev').innerHTML = previsao(); rLista('producoes'); rLista('estoqueMov');
};
R.despesas = () => rLista('despesas'); R.saques = () => rLista('pagamentos');
R.config = () => { }; // montada em rConfig() ao abrir a aba

/* ============ AÇÕES ============ */
function ajustar(k) { ask('Ajustar: ' + k, [['d', 'Data', 'date', hoje()], ['op', 'Operação', 'select', 'e', [['e', '➕ Adicionar'], ['s', '➖ Subtrair']]], ['v', 'Valor (R$)', 'number']], r => { let v = num(r.v); if (!v) return toast('Valor inválido.', 1); db.ajustes.push({ id: uid(), caixa: k, data: r.d, valor: r.op === 's' ? -v : v }); guardar(); toast('Ajustado.'); }); }
function sacar(t) { ask('Saque — ' + t, [['d', 'Data', 'date', hoje()], ['v', 'Valor (R$)', 'number'], ['o', 'Observação', 'text']], r => { if (!num(r.v)) return toast('Valor inválido.', 1); db.pagamentos.push({ id: uid(), data: r.d, tipo: t, valor: num(r.v), obs: r.o }); guardar(); toast('Saque registrado.'); }); }
function contar(k) { const at = r2(saldos()[k]); ask('Contagem real: ' + ITENS[k][0], [['q', `Quantidade real agora (sistema: ${at} ${ITENS[k][1]})`, 'number', at]], r => { const d = r2(num(r.q) - at); if (!d) return; db.estoqueMov.push({ id: uid(), data: hoje(), tipo: d > 0 ? 'entrada' : 'saida', item: k, qtd: Math.abs(d), desc: 'Contagem real' }); guardar(); toast('Estoque ajustado.'); }); }
function receber(id) { const a = db.atacado.find(x => x.id === id); if (a && confirm(`Confirmar recebimento de ${R$(a.totalLiquido)} de ${a.cliente}?`)) { a.status = 'PAGO'; a.pagoEm = hoje(); guardar(); toast('Pagamento confirmado!'); } }
function contatado(id) { const c = db.clientes.find(x => x.id === id); c.contatadoEm = hoje(); guardar(); }
function toggleAtivo(id) { const c = db.clientes.find(x => x.id === id); c.ativo = c.ativo === 'nao' ? 'sim' : 'nao'; guardar(); }
function histCliente(id) { const c = db.clientes.find(x => x.id === id); info('Histórico — ' + c.nome, tbl(['Data', 'Sabor', 'Qtd', 'Valor', 'Status'], ordenar(db.atacado.filter(a => a.clienteId === id)).map(a => [fdata(a.data), NS[a.sabor], a.qtd, R$(a.totalLiquido), a.status === 'PAGO' ? 'Pago' : 'Pendente']))); }
function irPara(id) { switchTab(id); }

/* PDV */
function pdvTog() { const c = $('pv-prod').value === 'Combo'; $('pv-sab1').hidden = c; $('pv-combo').hidden = !c; pdvPrev(); }
function pdvPreco() { let p = db.config.precoUnd; if ($('pv-prod').value === 'Combo') p = db.config.precoCombo + [1, 2, 3].reduce((a, i) => a + adic($('pv-s' + i).value), 0); const m = num($('pv-man').value); return m > 0 ? m : p; }
function pdvPrev() { const q = num($('pv-qtd').value) || 1; $('pv-prev').textContent = `Valor: ${R$(pdvPreco())} × ${q} = ${R$(pdvPreco() * q)}`; }
function pdvAdd() { const p = $('pv-prod').value, q = parseInt($('pv-qtd').value) || 1, cb = p === 'Combo' ? [1, 2, 3].map(i => $('pv-s' + i).value) : null; cart.push({ produto: p, sabor: cb ? cb[0] : $('pv-sab').value, saboresCombo: cb, qtd: q, bruto: pdvPreco() * q }); $('pv-qtd').value = 1; $('pv-man').value = ''; pdvPrev(); pdvCart(); }
function pdvCart() { $('pv-cart').innerHTML = cart.length ? tbl(['Qtd', 'Produto', 'Sabores', 'Subtotal', ''], cart.map((i, n) => [i.qtd + 'x', i.produto, nomeSab(i), R$(i.bruto), bt('🗑️', `cart.splice(${n},1);pdvCart()`, 'red')])) : ''; pdvTot(); }
function pdvTot() { $('pv-total').textContent = R$(Math.max(0, cart.reduce((a, i) => a + i.bruto, 0) - num($('pv-desc').value) + num($('pv-ent').value))); }
function pdvFinal() {
  if (!cart.length) return toast('Carrinho vazio.', 1);
  const C = db.config, pg = $('pv-pg').value, desc = num($('pv-desc').value), ent = num($('pv-ent').value), data = $('pv-data').value || hoje(), tb = cart.reduce((a, i) => a + i.bruto, 0);
  const tx = { 'Credito Insercao': C.taxaCredIns, 'Credito Aproximacao': C.taxaCredApr, 'Debito Insercao': C.taxaDebIns, 'Debito Aproximacao': C.taxaDebApr, 'Cartao Online': C.taxaOnline }[pg] || 0;
  let n = prox(db.vendas);
  cart.forEach((i, ix) => {
    const d = tb ? desc * i.bruto / tb : 0, cob = i.bruto - d, taxa = pg === 'PIX' ? ($('pv-asaas').checked && !ix ? 0.14 : 0) : cob * tx / 100, sabs = i.saboresCombo || [i.sabor];
    db.vendas.push({ id: uid(), num: n++, data, produto: i.produto, sabor: i.sabor, saboresCombo: i.saboresCombo, qtd: i.qtd, pgto: pg, bruto: r2(i.bruto), desconto: r2(d), taxa: r2(taxa), liquido: r2(cob - taxa), entrega: ix ? 0 : r2(ent), sacTipo: ix ? 'nenhuma' : $('pv-sac').value, sacQtd: ix ? 0 : num($('pv-sacq').value), custoUnd: sabs.reduce((a, s) => a + custo(s, 'varejo'), 0) / sabs.length });
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
  <div class="card"><h3>Calculadora de ficha técnica</h3><p style="color:var(--mu)">Só muda os custos oficiais quando você clicar em aplicar. Compras novas não alteram nada aqui.</p><div class="fg">${FK.map((k, i) => `<div><label>${FL[i]}</label><input id="fc-${k}" type="number" step="any" value="${C.ficha[k]}" oninput="calcFicha()"></div>`).join('')}</div><div id="fc-res"></div><div class="row"><button class="b pri" onclick="aplicarFicha()">Aplicar custos nas tabelas varejo/atacado</button></div></div>
  <div class="card"><h3>Abas que a Beatriz pode ver</h3><div class="fg">${TABS.filter(t => t[0] !== 'config').map(t => `<label style="display:flex;gap:8px;align-items:center;margin:4px 0"><input type="checkbox" id="av-${t[0]}" ${C.abasViewer[t[0]] ? 'checked' : ''}> ${t[2]}</label>`).join('')}</div><div class="row"><button class="b pri" onclick="salvarAbas()">Salvar permissões</button></div></div>
  ${C.setupFeito ? '' : `<div class="card"><h3>Saldo inicial (valores dos prints — confira)</h3><div class="fg">${SI_C.map(([k, v]) => `<div><label>Caixinha ${k} (R$)</label>${inp('si-c-' + k, 'number', v)}</div>`).join('')}${Object.keys(SI_E).map(k => `<div><label>${ITENS[k][0]} (${ITENS[k][1]})</label>${inp('si-e-' + k, 'number', SI_E[k])}</div>`).join('')}</div><div class="row"><button class="b pri" onclick="aplicarSaldo()">Aplicar saldo inicial (uma vez)</button></div></div>`}
  <div class="card"><h3>Novo sabor</h3><div class="fg"><div><label>Nome do sabor</label><input id="sb-nome"></div><div><label>Pudins por receita</label><input id="sb-rende" type="number" value="7"></div><div><label>Adicional no combo (R$)</label><input id="sb-adic" type="number" step="any" value="0"></div><div><label>Custo insumo atacado (R$/un)</label><input id="sb-ca" type="number" step="any"></div><div><label>Custo insumo varejo (R$/un, vazio = atacado + sacola + colher)</label><input id="sb-cv" type="number" step="any"></div></div>
  <label>Ingredientes por receita (copo, tampa e adesivo baixam sozinhos)</label><div id="sb-ing"></div><div class="row"><button class="b sm" onclick="addIng()">+ Ingrediente</button><button class="b pri" onclick="salvarSabor()">Cadastrar sabor</button></div>
  ${db.sabores.length ? tbl(['Sabor', 'Rende', 'Ingredientes'], db.sabores.map(s => [s.nome, s.rende, Object.entries(s.ins || {}).map(([k, q]) => `${q} ${ITENS[k] ? ITENS[k][1] : ''} ${ITENS[k] ? ITENS[k][0] : k}`).join(', ')])) : ''}</div>
  <div class="card"><h3>Novo item de estoque</h3><div class="fg"><div><label>Nome</label><input id="ie-nome"></div><div><label>Unidade</label><select id="ie-un"><option value="g">gramas</option><option value="ml">ml</option><option value="un">unidades</option></select></div></div><div class="row"><button class="b pri" onclick="salvarItem()">Cadastrar item</button></div></div>
  <div class="card"><h3>Segurança dos dados</h3><div class="row"><button class="b" onclick="exportar()">Baixar backup (.json)</button><button class="b" onclick="$('imp').click()">Restaurar de arquivo</button><input type="file" id="imp" accept=".json" hidden onchange="importar(event)"></div>
  <h4>Versões locais recentes</h4>${tbl(['Salva em', 'Registros', ''], vers.map((v, i) => [new Date(v.ts).toLocaleString('pt-BR'), total(JSON.parse(v.json)), bt('Restaurar', `restaurar(${i})`)]), 'Nenhuma versão ainda.')}</div>`;
  calcFicha(); addIng();
}
function salvarCfg() { CF.concat(CIf()).forEach(([k]) => sp(db.config, k, num($('c-' + k).value))); db.config.diasAviso = num($('c-diasAviso').value); guardar(); toast('Configurações salvas.'); }
function salvarAbas() { TABS.filter(t => t[0] !== 'config').forEach(t => db.config.abasViewer[t[0]] = $('av-' + t[0]).checked); guardar(); toast('Permissões salvas.'); }
function calcFicha() {
  const F = {}; FK.forEach(k => F[k] = num($('fc-' + k).value)); const { lc, li, ov, ac, cp, tp, ad, sc, co, lp, nt, cl, ch, gr } = F, n = 700 / 12, e = cp + tp + ad;
  const at = { tradicional: (lc + .4 * li + 3 * ov / 20 + .2 * ac + 6 * e) / 6, ninho: (lc + .4 * li + 3 * ov / 20 + .13 * lp + n * (nt + cl) / 1000 + 7 * e) / 7, brigadeirao: (lc + .2 * li + 3 * ov / 20 + .2 * cl + .09 * ch + .035 * gr + 7 * e) / 7 };
  window._fc = { F, at, va: { tradicional: at.tradicional + sc + co, ninho: at.ninho + sc + co, brigadeirao: at.brigadeirao + sc + co } };
  $('fc-res').innerHTML = tbl(['Sabor', 'Atacado (un)', 'Varejo (un, c/ sacola e colher)'], Object.keys(NS).map(s => [NS[s], R$(at[s]), '<b>' + R$(window._fc.va[s]) + '</b>']));
}
function aplicarFicha() { calcFicha(); const f = window._fc; db.config.ficha = f.F; Object.keys(NS).forEach(s => { db.config.insumo.atacado[s] = r2(f.at[s]); db.config.insumo.varejo[s] = r2(f.va[s]); }); guardar(); rConfig(); toast('Custos aplicados.'); }
function aplicarSaldo() {
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
const adic = s => s === 'ninho' ? 1 : num((db.sabores.find(x => x.id === s) || {}).adic);
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
  db.sabores.forEach(s => { NS[s.id] = s.nome; SP[s.id] = 'pudim_' + s.id; ITENS['pudim_' + s.id] = ['Pudim ' + s.nome, 'un']; REC[s.id] = { rende: num(s.rende), prod: 'pudim_' + s.id, ins: s.ins || {} }; });
}
function refreshSel() {
  const fill = (el, o) => { if (!el || el.options.length === o.length) return; const v = el.value; el.innerHTML = o.map(x => `<option value="${x[0]}">${x[1]}</option>`).join(''); if ([...el.options].some(p => p.value === v)) el.value = v; };
  ['pv-sab', 'pv-s1', 'pv-s2', 'pv-s3', 'f-producoes-sabor'].forEach(i => fill($(i), optSab()));
  document.querySelectorAll('.ai-s').forEach(e => fill(e, optSab()));
  fill($('f-estoqueMov-item'), optIt()); fill($('f-compras-item'), optComp());
}
function bnavSync() {
  const v = visiveis().map(t => t[0]), a = document.querySelector('.tab.on'), id = a ? a.id.slice(4) : '';
  document.querySelectorAll('#bnav button[data-t]').forEach(b => { b.hidden = !v.includes(b.dataset.t); b.classList.toggle('on', b.dataset.t === id); });
}
function addIng(i, q) {
  const el = $('sb-ing'); if (!el) return; const d = document.createElement('div'); d.className = 'irow';
  d.innerHTML = `<select class="ig-i">${optIt().filter(([k]) => !PRONTOS.includes(k) && !EMB.includes(k)).map(([k, n]) => `<option value="${k}" ${k === i ? 'selected' : ''}>${n} (${ITENS[k][1]})</option>`).join('')}</select><input class="ig-q" type="number" step="any" placeholder="Qtd por receita" value="${q ?? ''}"><button type="button" class="b sm red" onclick="this.parentNode.remove()">✕</button>`;
  el.appendChild(d);
}
function salvarSabor() {
  const nome = $('sb-nome').value.trim(), rende = num($('sb-rende').value), ca = num($('sb-ca').value);
  const id = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!nome || !id || !rende || !ca) return toast('Informe nome, pudins por receita e custo de atacado.', 1);
  if (NS[id]) return toast('Já existe um sabor com esse nome.', 1);
  const ins = {}; document.querySelectorAll('#sb-ing .irow').forEach(r => { const q = num(r.querySelector('.ig-q').value); if (q > 0) ins[r.querySelector('.ig-i').value] = (ins[r.querySelector('.ig-i').value] || 0) + q; });
  if (!Object.keys(ins).length) return toast('Adicione pelo menos um ingrediente.', 1);
  db.sabores.push({ id, nome, rende, adic: num($('sb-adic').value), ins });
  db.config.insumo.atacado[id] = ca; db.config.insumo.varejo[id] = num($('sb-cv').value) || r2(ca + db.config.ficha.sc + db.config.ficha.co);
  aplicarCustom(); guardar(); rConfig(); toast('Sabor cadastrado!');
}
function salvarItem() {
  const nome = $('ie-nome').value.trim(); if (!nome) return toast('Informe o nome.', 1);
  db.itensExtra.push({ id: 'x_' + uid(), nome, un: $('ie-un').value }); aplicarCustom(); guardar(); rConfig(); toast('Item cadastrado!');
}
R.rateio = () => {
  const tab = L => {
    const T = { liq: 0, ins: 0, cg: 0, mo: 0, l: 0, fundo: 0, lu: 0, bea: 0 }, rows = L.map(([n, d, liq, ins]) => { const r = rateio(liq - ins); T.liq += liq; T.ins += ins; ['cg', 'mo', 'l', 'fundo', 'lu', 'bea'].forEach(k => T[k] += r[k]); return [n, fdata(d), R$(liq), `<span class="neg">-${R$(ins)}</span>`, `<span class="neg">-${R$(r.cg)}</span>`, `<span class="neg">-${R$(r.mo)}</span>`, `<b style="color:var(--ok)">${R$(r.l)}</b>`, R$(r.fundo), R$(r.lu), R$(r.bea)]; });
    const tot = ['<b>TOTAL</b>', '', `<b>${R$(T.liq)}</b>`, `<b>-${R$(T.ins)}</b>`, `<b>-${R$(T.cg)}</b>`, `<b>-${R$(T.mo)}</b>`, `<b>${R$(T.l)}</b>`, `<b>${R$(T.fundo)}</b>`, `<b>${R$(T.lu)}</b>`, `<b>${R$(T.bea)}</b>`];
    return tbl(['#', 'Data', 'Líquido', 'Insumo', 'Gerais (15%)', 'Mão de obra (23%)', 'Lucro', 'Fundo (12%)', 'Luyan (53%)', 'Beatriz (35%)'], L.length ? [tot, ...rows.slice(0, 80)] : [], 'Sem lançamentos.');
  };
  $('rt-v').innerHTML = tab(ordenar(db.vendas).map(v => ['#' + v.num, v.data, num(v.liquido), qtdTotal(v) * num(v.custoUnd)]));
  $('rt-a').innerHTML = tab(ordenar(db.atacado.filter(a => a.status === 'PAGO')).map(a => ['#' + a.num, a.data, num(a.totalLiquido), insAt(a)]));
};

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
  const id = ativa.id.slice(4); if (id !== 'config') R[id](); if (id !== 'dashboard') { try { rDash(); } catch (e) { } }
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
