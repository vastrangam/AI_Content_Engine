/* Medhava — Module 01 · the shared screens.

   m01lib.js holds the arithmetic. This file holds the SCREENS that draw it, for the same
   reason: the CEO Dashboard's Overview and the combined app's Overview are not two screens
   that look alike, they are one screen compiled into two files. Change a column here and it
   changes everywhere at once, which is the only way four apps stay honest about being one.

   Each app calls M01V.make(CFG, options) and takes the screens it wants. Nothing here decides
   what an app is — that is the core's job. */
var M01V = (function () {
  'use strict';
  var K = (typeof Medhava !== 'undefined') ? Medhava : {};
  var H = K.H || {}, money = K.money, inr = K.inr, num = K.num, r2 = K.r2, esc = K.esc, toast = K.toast;
  function db() { return K.DB; }

  function periodLabel(DB) { return (!DB.period || DB.period === 'all') ? 'Full year' : (M01.MLBL[DB.period] || DB.period); }

  /* The dials. `co` decides whether this app has a company switcher: the dashboard and the
     report builder do, group consolidation deliberately does not — its job is all of them. */
  function dials(DB, withCo, foot) {
    var opts = M01.MONTHS.map(function (m) { return [m, M01.MSHORT[m]]; }).concat([['all', 'Full year']]);
    var cos = [['all', 'All companies']].concat((DB.companies || []).map(function (c) { return [c.id, c.name]; }));
    var row = function (label, list, act, attr, cur) {
      return '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap' + (act === 'setco' ? ';margin-top:8px' : '') + '">' +
        '<span style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);font-weight:600;min-width:56px">' + label + '</span>' +
        list.map(function (o) {
          return '<button class="btn sm' + (cur === o[0] ? ' p' : '') + '" data-act="' + act + '" ' + attr + '="' + esc(o[0]) + '">' + esc(o[1]) + '</button>';
        }).join('') + '</div>';
    };
    return '<div class="panel" style="padding:11px 14px;margin-bottom:14px">' +
      row('Period', opts, 'setp', 'data-p', DB.period || 'all') +
      (withCo ? row('Company', cos, 'setco', 'data-c', DB.co || 'all') : '') +
      (foot ? '<p class="hint" style="margin-top:8px">' + foot + '</p>' : '') + '</div>';
  }

  function make(CFG, opt) {
    opt = opt || {};
    var withCo = opt.co !== false;
    var bar = function (DB, foot) { return dials(DB, withCo, foot === undefined ? opt.dialNote : foot); };
    var V = {};

    /* ══════════ the CEO Dashboard screens ══════════ */
    V.dash = function () {
      var DB = db(), s = M01.monthSeries(DB);
      var mx = Math.max.apply(null, s.map(function (x) { return x.net; })) || 1;
      var al = M01.alerts(DB), g = M01.growthPct(DB), np = M01.netProfit(DB);
      return H.head('Command · Overview', opt.title || CFG.name,
        'Everything below is computed from your own records — change the period or the company and every figure moves.') +
      bar(DB) +
      H.kpis([
        { l: 'Net sales', v: money(M01.netSales(DB)), d: 'after returns', icon: 'coin', tone: 'teal' },
        { l: 'Net profit', v: money(np), d: M01.marginPct(DB) + '% margin', cls: np >= 0 ? 'g' : 'r', icon: 'chart', tone: 'green' },
        { l: 'Cash + bank', v: money(M01.cash(DB)), d: 'live balance', icon: 'coin', tone: 'blue' },
        { l: 'To collect', v: money(M01.receivable(DB)), d: 'from customers', icon: 'doc', tone: 'peach' },
        { l: 'Open alerts', v: al.length, d: 'need a decision', cls: al.length ? 'r' : 'g', icon: 'bell', tone: al.length ? 'red' : 'green' }], 'k5') +
      '<div class="two">' +
      H.panel('Net sales by month <span class="badge">' + (g >= 0 ? '+' : '') + g + '% last month</span>',
        s.map(function (x) {
          return '<div style="margin-bottom:11px"><div class="kv" style="border:none;padding:2px 0"><span>' + x.label +
            ' <span class="hint">profit ' + money(x.profit) + '</span></span><b>' + money(x.net) + '</b></div>' + H.bar(x.net / mx * 100) + '</div>';
        }).join('') +
        '<div class="kv" style="margin-top:12px"><span>Best month</span><b>' +
          esc(s.slice().sort(function (a, b) { return b.net - a.net; })[0].label) + '</b></div>' +
        '<div class="kv"><span>Total net sales, all four months</span><b>' +
          money(r2(s.reduce(function (t, x) { return t + x.net; }, 0))) + '</b></div>' +
        '<div class="kv"><span>Total profit, all four months</span><b class="' +
          (s.reduce(function (t, x) { return t + x.profit; }, 0) >= 0 ? 'g' : 'r') + '">' +
          money(r2(s.reduce(function (t, x) { return t + x.profit; }, 0))) + '</b></div>' +
        '<p class="hint" style="margin-top:8px">' + esc(CFG.profitNote || 'Profit here is after purchases, making cost and every running cost. It is the figure that actually reaches the bank.') + '</p>') +
      H.panel('What needs you <span class="badge">' + al.length + '</span>',
        al.length ? H.table([
          { label: '', align: 'l', fmt: function (a) { return H.tag(a.sev === 'high' ? 'urgent' : 'watch', a.sev === 'high' ? 'red' : 'amb'); } },
          { label: 'Area', align: 'l', k: 'area' }, { label: 'What', align: 'l', k: 'what' },
          { label: '', align: 'l', fmt: function (a) { return '<button class="btn sm" data-go="' + a.go + '">Open →</button>'; } }], al.slice(0, 6))
        : '<div class="cascade">Nothing needs a decision right now. Everything is inside its limits.</div>') +
      '</div>';
    };

    V.sales = function () {
      var DB = db(), ch = M01.byChannel(DB);
      var mx = Math.max.apply(null, ch.map(function (c) { return c.net; })) || 1;
      var rr = M01.returnRate(DB);
      return H.head('Command · Sales', 'Sales & channels',
        'Which channel actually makes money after returns — not just which one looks busy.') +
      bar(DB) +
      H.kpis([{ l: 'Gross sales', v: money(M01.grossSales(DB)), d: 'before returns', icon: 'cart', tone: 'teal' },
        { l: 'Returns', v: money(M01.returnsVal(DB)), d: rr + '% of gross', cls: rr > 10 ? 'r' : '', icon: 'return', tone: 'peach' },
        { l: 'Net sales', v: money(M01.netSales(DB)), d: 'what you keep', cls: 'g', icon: 'coin', tone: 'green' },
        { l: 'Sold outside the group', v: money(M01.externalGross(DB)), d: 'gross, own companies excluded', icon: 'store', tone: 'blue' }], '') +
      H.panel('By channel', H.table([
        { label: 'Channel', align: 'l', fmt: function (c) { return esc(c.channel) + (M01.isInternal(DB, c.channel) ? ' ' + H.tag('own group', 'blu') : ''); } },
        { label: 'Gross', fmt: function (c) { return inr(c.gross); }, cellcls: 'mono' },
        { label: 'Returns', fmt: function (c) { return inr(c.returns); }, cellcls: 'mono' },
        { label: 'Return %', fmt: function (c) { return c.rr + '%'; }, cellcls: function (c) { return 'mono ' + (c.rr >= 12 ? 'r' : ''); } },
        { label: 'Net', fmt: function (c) { return inr(c.net); }, cellcls: 'mono' },
        { label: 'Units', k: 'units', cellcls: 'mono' },
        { label: '', align: 'l', fmt: function (c) {
          return M01.isInternal(DB, c.channel) ? H.tag('not a group sale', 'blu')
            : c.rr >= 12 ? H.tag('returns high', 'red') : H.tag('healthy', 'grn'); } }], ch)) +
      H.panel('Net sales share', ch.map(function (c) {
        return '<div style="margin-bottom:9px"><div class="kv" style="border:none;padding:2px 0"><span>' + esc(c.channel) +
          '</span><b>' + money(c.net) + '</b></div>' + H.bar(c.net / mx * 100) + '</div>';
      }).join('') +
        '<p class="hint" style="margin-top:8px">A line marked <b>own group</b> is one of your companies billing another. It is real for that company and it is not a sale for the group — Group Consolidation takes it back out.</p>');
    };

    V.money = function () {
      var DB = db();
      var rec = M01.held(DB, 'receivables'), pay = M01.held(DB, 'payables');
      var recOver = rec.filter(function (x) { return x.days > 30; });
      var payOver = pay.filter(function (x) { return x.days > 0; });
      return H.head('Command · Money', 'Money in, money out',
        'Cash position, who owes you, and who you owe — with how late each one is.') +
      bar(DB) +
      H.kpis([{ l: 'Cash + bank', v: money(M01.cash(DB)), d: 'live balance', icon: 'coin', tone: 'teal' },
        { l: 'To collect', v: money(M01.receivable(DB)), d: recOver.length + ' overdue', cls: recOver.length ? 'r' : '', icon: 'doc', tone: 'peach' },
        { l: 'To pay', v: money(M01.payable(DB)), d: payOver.length + ' late', cls: payOver.length ? 'r' : '', icon: 'scale', tone: 'blue' },
        { l: 'Net position', v: money(r2(M01.cash(DB) + M01.receivable(DB) - M01.payable(DB))), d: 'cash + owed − owing', cls: 'g', icon: 'chart', tone: 'green' }], '') +
      '<div class="two">' +
      H.panel('Customers who owe you', H.table([{ label: 'Customer', align: 'l', k: 'party' },
        { label: 'Company', align: 'l', fmt: function (x) { return esc(M01.coName(DB, x.co)); } },
        { label: 'Amount', fmt: function (x) { return inr(x.amount); }, cellcls: 'mono' },
        { label: 'Age', fmt: function (x) { return x.days + 'd'; }, cellcls: function (x) { return 'mono ' + (x.days > 30 ? 'r' : ''); } },
        { label: '', align: 'l', fmt: function (x) { return x.days > 60 ? H.tag('chase now', 'red') : x.days > 30 ? H.tag('overdue', 'amb') : H.tag('ok', 'grn'); } }], rec)) +
      H.panel('Suppliers you owe', H.table([{ label: 'Supplier', align: 'l', k: 'party' },
        { label: 'Company', align: 'l', fmt: function (x) { return esc(M01.coName(DB, x.co)); } },
        { label: 'Amount', fmt: function (x) { return inr(x.amount); }, cellcls: 'mono' },
        { label: 'Due in', fmt: function (x) { return x.days > 0 ? (x.days + 'd late') : ((-x.days) + 'd'); }, cellcls: function (x) { return 'mono ' + (x.days > 0 ? 'r' : ''); } },
        { label: '', align: 'l', fmt: function (x) { return x.days > 60 ? H.tag('very late', 'red') : x.days > 0 ? H.tag('late', 'amb') : H.tag('on time', 'grn'); } }], pay)) +
      '</div>' +
      H.panel('Profit build-up for this period',
        '<div class="kv"><span>Net sales</span><b>' + money(M01.netSales(DB)) + '</b></div>' +
        '<div class="kv"><span>− Purchases</span><b>' + money(M01.purchases(DB)) + '</b></div>' +
        '<div class="kv"><span>− Making / wages</span><b>' + money(M01.wages(DB)) + '</b></div>' +
        '<div class="kv"><span>= Gross profit</span><b>' + money(M01.grossProfit(DB)) + '</b></div>' +
        '<div class="kv"><span>− Running expenses</span><b>' + money(M01.expenses(DB)) + '</b></div>' +
        '<div class="kv"><span><b>= Net profit</b></span><b class="' + (M01.netProfit(DB) >= 0 ? 'g' : 'r') + '">' +
          money(M01.netProfit(DB)) + '</b></div>');
    };

    V.stock = function () {
      var DB = db(), low = M01.lowStock(DB), st = M01.held(DB, 'stock');
      return H.head('Command · Stock', 'Stock & making',
        'What you are holding, what is running out, and what the floor produced.') +
      bar(DB) +
      H.kpis([{ l: 'Stock value', v: money(M01.stockValue(DB)), d: 'at cost', icon: 'box', tone: 'teal' },
        { l: 'Running out', v: low.length, d: 'at or below reorder', cls: low.length ? 'r' : 'g', icon: 'bell', tone: low.length ? 'red' : 'green' },
        { l: 'Pieces made', v: M01.piecesMade(DB), d: 'this period', cls: 'g', icon: 'wrench', tone: 'green' },
        { l: 'Making cost', v: money(M01.wages(DB)), d: 'wages paid', icon: 'coin', tone: 'blue' }], '') +
      H.panel('Stock on hand', H.table([{ label: 'Code', align: 'l', k: 'sku', cellcls: 'mono' },
        { label: 'Item', align: 'l', k: 'name' },
        { label: 'Company', align: 'l', fmt: function (x) { return esc(M01.coName(DB, x.co)); } },
        { label: 'Qty', k: 'qty', cellcls: 'mono' }, { label: 'Reorder at', k: 'rop', cellcls: 'mono' },
        { label: 'Value', fmt: function (x) { return inr(num(x.qty) * num(x.cost)); }, cellcls: 'mono' },
        { label: '', align: 'l', fmt: function (x) {
          return num(x.qty) <= num(x.rop) ? H.tag('reorder', 'red') : num(x.qty) <= num(x.rop) * 2 ? H.tag('low', 'amb') : H.tag('ok', 'grn'); } }], st)) +
      H.panel('Production by month', H.table([
        { label: 'Month', align: 'l', fmt: function (x) { return M01.MSHORT[x.month]; } },
        { label: 'Company', align: 'l', fmt: function (x) { return esc(M01.coName(DB, x.co)); } },
        { label: 'Pieces', k: 'pieces', cellcls: 'mono' },
        { label: 'Wages', fmt: function (x) { return inr(x.wages); }, cellcls: 'mono' },
        { label: 'Cost per piece', fmt: function (x) { return num(x.pieces) ? inr(r2(x.wages / x.pieces)) : '—'; }, cellcls: 'mono' }],
        M01.rows(DB, 'production')));
    };

    V.companies = function () {
      var DB = db(), per = M01.perCompany(DB), g = M01.groupFigures(DB);
      return H.head('Operations · Companies', 'The companies you run',
        'The same figures, one row per company. Switching the company pill above filters every other screen to that one.') +
      bar(DB) +
      H.kpis([{ l: 'Companies', v: per.length, d: 'in the group', icon: 'store', tone: 'teal' },
        { l: 'With a tax registration', v: g.registered, d: 'of ' + per.length, icon: 'shield', tone: 'blue' },
        { l: 'Trading names', v: (DB.brands || []).length, d: 'not companies', icon: 'tag', tone: 'peach' },
        { l: 'Plan covers', v: (DB.plan && DB.plan.companyCap) || 20, d: 'companies on ' + ((DB.plan && DB.plan.name) || 'this plan'), icon: 'layers', tone: 'green' }], '') +
      H.panel('Company by company <span class="badge">' + esc(periodLabel(DB)) + '</span>', H.table([
        { label: 'Company', align: 'l', fmt: function (c) { return '<b>' + esc(c.name) + '</b>'; } },
        { label: 'Net sales', fmt: function (c) { return inr(c.net); }, cellcls: 'mono' },
        { label: 'Profit', fmt: function (c) { return inr(c.profit); }, cellcls: function (c) { return 'mono ' + (c.profit >= 0 ? 'g' : 'r'); } },
        { label: 'Cash', fmt: function (c) { return inr(c.cash); }, cellcls: 'mono' },
        { label: 'Stock', fmt: function (c) { return inr(c.stock); }, cellcls: 'mono' },
        { label: 'Tax registration', align: 'l', fmt: function (c) { return c.registered ? '<span class="mono">' + esc(c.gstin) + '</span>' : H.tag('none of its own', 'amb'); } },
        { label: '', align: 'l', fmt: function (c) { return '<button class="btn sm" data-act="setco" data-c="' + esc(c.id) + '">Look at only this</button>'; } }], per),
        '<button class="btn sm" data-act="setco" data-c="all">Back to all companies</button>') +
      '<div class="two">' +
      H.panel('Names you sell under', H.table([
        { label: 'Trading name', align: 'l', k: 'name' },
        { label: 'Belongs to', align: 'l', fmt: function (b) { return esc(M01.coName(DB, b.co)); } },
        { label: 'Used on', align: 'l', k: 'where' }], DB.brands || []) +
        '<p class="hint" style="margin-top:8px">A trading name is <b>not</b> a company. Its orders are the sales of the company it belongs to, and they are counted once — under that company.</p>') +
      H.panel(opt.companiesNoteTitle || 'What this screen will not do', opt.companiesNote ||
        ('<p>It shows companies; it does not <b>change</b> them. Adding a company, removing what your companies billed each other, and working out which of them may file a return all live in <b>Group Consolidation</b>, the third app of this module.</p>' +
         '<p class="hint">This one reads. That is the whole point of a dashboard.</p>')) +
      '</div>';
    };

    V.alerts = function () {
      var DB = db(), al = M01.alerts(DB), resolved = Object.keys(DB.resolved || {}).length;
      return H.head('Operations · Alerts', 'Alerts',
        'Everything the system thinks you should decide about. Clear one and it stays cleared.') +
      H.kpis([{ l: 'Open', v: al.length, d: 'need a decision', cls: al.length ? 'r' : 'g', icon: 'bell', tone: al.length ? 'red' : 'green' },
        { l: 'Urgent', v: al.filter(function (a) { return a.sev === 'high'; }).length, d: 'do these first', cls: 'r', icon: 'scale', tone: 'red' },
        { l: 'Cleared', v: resolved, d: 'handled by you', cls: 'g', icon: 'check', tone: 'green' }], 'k3') +
      H.panel('Open alerts', al.length ? H.table([
        { label: '', align: 'l', fmt: function (a) { return H.tag(a.sev === 'high' ? 'urgent' : 'watch', a.sev === 'high' ? 'red' : 'amb'); } },
        { label: 'Area', align: 'l', k: 'area' }, { label: 'What is happening', align: 'l', k: 'what' },
        { label: '', align: 'l', fmt: function (a) {
          return '<button class="btn sm" data-go="' + a.go + '">Look</button> <button class="btn sm" data-act="clear" data-id="' + esc(a.id) + '">Clear</button>'; } }], al)
        : '<div class="cascade"><b>All clear.</b> Nothing is outside its limits right now.</div>') +
      (resolved ? H.panel('Cleared',
        '<p class="hint">You have cleared ' + resolved + ' alert(s). They come back automatically if the situation gets worse.</p>' +
        '<button class="btn" data-act="unclear">Bring them all back</button>') : '');
    };

    /* ══════════ the Report Builder screens ══════════ */
    var SRC = M01.SRC, SRCKEYS = M01.SRCKEYS, report = M01.report, labelOf = M01.labelOf;
    function fmtv(m, v) { return m.money ? money(v) : String(v); }

    V.build = function () {
      var DB = db(), d = DB.draft || M01.defaultDef('sales'), S = SRC[d.src], rep = report(DB, d);
      var mx = Math.max.apply(null, rep.rows.map(function (r) { return Math.abs(num(r.v[S.measures[0].k])); }).concat([1])) || 1;
      var ff = M01.fieldsOf(d.src);
      return H.head('Reports · Builder', 'Build a report',
        'Pick what to look at, how to group it, and what to leave out. The answer appears straight away.') +
      bar(DB, 'These two decide which records a report can see at all. Filters below narrow what is left.') +
      H.panel('1 · What do you want to look at?',
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' + SRCKEYS.map(function (k) {
          return '<button class="btn' + (d.src === k ? ' p' : '') + '" data-act="setsrc" data-s="' + k +
            '"><svg class="i"><use href="#s-' + SRC[k].icon + '"/></svg> ' + esc(SRC[k].label) + '</button>';
        }).join('') + '</div><p class="hint" style="margin-top:9px">' + esc(S.note) + '</p>') +
      H.panel('2 · How should it be arranged?',
        '<div class="form f4">' + H.fields([
          { id: 'r_group', label: 'Group the rows by', type: 'select', value: d.group,
            options: S.dims.map(function (x) { return { v: x.k, label: x.l }; }).concat([{ v: 'none', label: 'Do not group — show every record' }]) },
          { id: 'r_sort', label: 'Sort by', type: 'select', value: d.sort,
            options: [{ v: 'label', label: 'Name (A–Z)' }].concat(S.measures.map(function (m) { return { v: m.k, label: m.l }; })).concat([{ v: 'n', label: 'Number of records' }]) },
          { id: 'r_dir', label: 'Order', type: 'select', value: d.dir, options: [{ v: 'desc', label: 'Biggest first' }, { v: 'asc', label: 'Smallest first' }] },
          { id: 'r_limit', label: 'Show only top', type: 'select', value: String(d.limit),
            options: [{ v: '0', label: 'All rows' }, { v: '3', label: 'Top 3' }, { v: '5', label: 'Top 5' }, { v: '10', label: 'Top 10' }] }
        ]) + '<div class="fld full" style="align-items:flex-end"><button class="btn p" data-act="run"><svg class="i"><use href="#s-sync"/></svg> Run this report</button></div></div>') +
      H.panel('3 · Leave anything out? <span class="badge">' + (d.filters || []).length + ' filter(s)</span>',
        '<div class="form f4">' + H.fields([
          { id: 'f_field', label: 'Field', type: 'select', options: ff.map(function (x) { return { v: x.k, label: x.l }; }) },
          { id: 'f_op', label: 'Condition', type: 'select', options: ['is', 'is not', 'contains', '>=', '<=', '>', '<'] },
          { id: 'f_val', label: 'Value', type: 'text', ph: 'e.g. ' + esc(String(S.rows(DB)[0] ? S.rows(DB)[0][S.dims[0].k] : '')) }
        ]) + '<div class="fld" style="align-items:flex-end"><button class="btn" data-act="addf">Add filter</button></div></div>' +
        ((d.filters || []).length
          ? '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">' + d.filters.map(function (f, i) {
              return '<span class="tag t-blu">' + esc(labelOf(d.src, f.field) + ' ' + f.op + ' ' + f.val) +
                ' <button class="btn sm" data-act="delf" data-i="' + i + '" style="padding:0 6px;margin-left:4px">×</button></span>';
            }).join('') + ' <button class="btn sm" data-act="clearf">Remove all filters</button></div>'
          : '<p class="hint" style="margin-top:6px">No filters — every record in scope is included.</p>')) +
      H.panel('Result <span class="badge">' + rep.matched + ' of ' + rep.scanned + ' records</span>',
        H.table([{ label: d.group === 'none' ? 'Record' : labelOf(d.src, d.group), align: 'l', fmt: function (r) { return esc(r.label); } }]
          .concat(S.measures.map(function (m) { return { label: m.l, fmt: function (r) { return fmtv(m, r.v[m.k]); }, cellcls: 'mono' }; }))
          .concat([{ label: 'Records', k: 'n', cellcls: 'mono' },
                   { label: S.measures[0].l + ' — share', align: 'l', fmt: function (r) {
                     return '<div style="min-width:150px">' + H.bar(Math.abs(num(r.v[S.measures[0].k])) / mx * 100) + '</div>'; } }]), rep.rows) +
        '<div class="kv" style="margin-top:8px"><span><b>Total</b>' +
          (rep.limited ? ' <span class="hint">(all ' + rep.allRows.length + ' rows, not just the ones shown)</span>' : '') + '</span><b>' +
          S.measures.map(function (m) { return esc(m.l) + ': ' + fmtv(m, rep.total.v[m.k]); }).join(' &nbsp;·&nbsp; ') + '</b></div>',
        '<button class="btn sm" data-act="csvdl">Download CSV</button>') +
      H.panel('Keep this report',
        '<div class="form f2">' + H.fields([{ id: 'r_name', label: 'Give it a name', type: 'text', ph: 'e.g. Best channels this quarter', wide: true }]) +
        '<div class="fld" style="align-items:flex-end"><button class="btn p" data-act="savedef">Save report</button></div></div>' +
        '<p class="hint">Saved reports remember the source, grouping, filters and sort — not the numbers. Run one next month and it recalculates on the new data.</p>');
    };

    V.lib = function () {
      return H.head('Reports · Ready-made', 'Ready-made reports',
        'Questions most owners ask. One click loads it into the builder — then change anything you like.') +
      H.note('These are starting points, not fixed reports. Load one, then add a filter or change the grouping and it is yours.') +
      '<div class="two">' + (CFG.templates || []).map(function (t, i) {
        return H.panel(esc(t.name),
          '<p>' + esc(t.why) + '</p>' +
          '<p class="hint">Looks at <b>' + esc(SRC[t.def.src].label) + '</b>, grouped by <b>' +
          esc(t.def.group === 'none' ? 'nothing' : labelOf(t.def.src, t.def.group)) + '</b>' +
          ((t.def.filters || []).length ? ', filtered on ' + esc(t.def.filters.map(function (f) {
            return labelOf(t.def.src, f.field) + ' ' + f.op + ' ' + f.val; }).join(' and ')) : '') + '.</p>' +
          '<button class="btn p" data-act="tpl" data-i="' + i + '">Load &amp; run →</button>');
      }).join('') + '</div>';
    };

    V.saved = function () {
      var DB = db(), sv = DB.saved || [];
      return H.head('Reports · Saved', 'My saved reports', 'Your own reports. They recalculate every time you run them.') +
      H.kpis([{ l: 'Saved reports', v: sv.length, d: 'built by you', icon: 'save', tone: 'teal' },
        { l: 'Sources available', v: SRCKEYS.length, d: 'to report on', icon: 'layers', tone: 'blue' },
        { l: 'Records in scope', v: SRCKEYS.reduce(function (s, k) { return s + SRC[k].rows(DB).length; }, 0), d: 'across all sources', icon: 'doc', tone: 'green' }], 'k3') +
      H.panel('Saved reports', sv.length ? H.table([
        { label: 'Name', align: 'l', fmt: function (r) { return esc(r.name); } },
        { label: 'Source', align: 'l', fmt: function (r) { return esc(SRC[r.def.src].label); } },
        { label: 'Grouped by', align: 'l', fmt: function (r) { return esc(r.def.group === 'none' ? '—' : labelOf(r.def.src, r.def.group)); } },
        { label: 'Filters', fmt: function (r) { return (r.def.filters || []).length; }, cellcls: 'mono' },
        { label: 'Rows', fmt: function (r) { return report(db(), r.def).allRows.length; }, cellcls: 'mono' },
        { label: 'Answer if you run it now', align: 'l', fmt: function (r) {
          var rp = report(db(), r.def), m = rp.measures.filter(function (x) { return x.money; })[0] || rp.measures[0];
          return '<span class="mono">' + esc(m.l) + ' ' + fmtv(m, rp.total.v[m.k]) + '</span>'; } },
        { label: '', align: 'l', fmt: function (r) { var i = sv.indexOf(r);
          return '<button class="btn sm p" data-act="runsaved" data-i="' + i + '">Run</button> <button class="btn sm d" data-act="delsaved" data-i="' + i + '">Delete</button>'; } }], sv)
        : '<div class="empty">Nothing saved yet. Build a report and press <b>Save report</b>, or load a ready-made one.</div>');
    };

    /* ══════════ the Group Consolidation screens ══════════ */
    V.group = function () {
      var DB = db(), g = M01.groupFigures(DB), per = M01.perCompany(DB);
      var mx = Math.max.apply(null, per.map(function (c) { return c.net; }).concat([1])) || 1;
      return H.head('The group · Figures', 'Group figures',
        'Every company added together, with what they billed each other taken back out first.') +
      dials(DB, false, 'One company or all of them — this screen is always all of them. Every row below is one company.') +
      H.kpis([
        { l: 'Group net sales', v: money(g.net), d: 'after removing internal billing', icon: 'coin', tone: 'teal' },
        { l: 'Group profit', v: money(g.profit), d: g.net ? Math.round(g.profit / g.net * 100) + '% margin' : '—', cls: g.profit >= 0 ? 'g' : 'r', icon: 'chart', tone: 'green' },
        { l: 'Group cash', v: money(g.cash), d: 'across every company', icon: 'coin', tone: 'blue' },
        { l: 'Group stock', v: money(g.stock), d: 'at cost', icon: 'box', tone: 'peach' },
        { l: 'Companies', v: g.companies, d: g.registered + ' with a registration', icon: 'store', tone: 'violet' }], 'k5') +
      '<div class="two">' +
      H.panel('How the group total is arrived at',
        '<div class="kv"><span>Every company’s net sales, added up</span><b>' + money(g.addedNet) + '</b></div>' +
        '<div class="kv"><span>− What your companies billed each other</span><b class="r">' + money(g.eliminated) + '</b></div>' +
        '<div class="kv"><span><b>= Group net sales</b></span><b>' + money(g.net) + '</b></div>' +
        '<div style="height:10px"></div>' +
        '<div class="kv"><span>Every company’s purchases, added up</span><b>' + money(g.addedPurchases) + '</b></div>' +
        '<div class="kv"><span>− The same internal billing, on the buying side</span><b class="r">' + money(g.eliminated) + '</b></div>' +
        '<div class="kv"><span><b>= Group purchases</b></span><b>' + money(g.purchases) + '</b></div>' +
        '<div style="height:10px"></div>' +
        '<div class="kv"><span>− Making / wages</span><b>' + money(g.wages) + '</b></div>' +
        '<div class="kv"><span>− Running costs</span><b>' + money(g.expenses) + '</b></div>' +
        '<div class="kv"><span><b>= Group profit</b></span><b class="' + (g.profit >= 0 ? 'g' : 'r') + '">' + money(g.profit) + '</b></div>' +
        '<p class="hint" style="margin-top:9px"><b>Notice that the elimination appears twice and cancels itself.</b> ' +
        'That is not a coincidence — an internal bill is income to one of your companies and a cost to another, ' +
        'so removing it changes what the group <i>sold</i> and never changes what the group <i>earned</i>.</p>') +
      H.panel('Where the sales came from',
        per.map(function (c) {
          return '<div style="margin-bottom:10px"><div class="kv" style="border:none;padding:2px 0"><span>' + esc(c.name) +
            (c.registered ? '' : ' ' + H.tag('no registration', 'amb')) +
            ' <span class="hint">profit ' + money(c.profit) + '</span></span><b>' + money(c.net) + '</b></div>' +
            H.bar(c.net / mx * 100) + '</div>';
        }).join('') +
        '<div class="kv" style="margin-top:10px"><span>Sold outside the group</span><b>' + money(M01.externalGross(M01.scope(DB, DB.period, 'all'))) + '</b></div>' +
        '<div class="kv"><span>Billed between your own companies</span><b>' + money(g.eliminated) + '</b></div>' +
        '<p class="hint" style="margin-top:8px">The first line is business you won. The second is work moving inside the group. Only the first grows the business.</p>') +
      '</div>';
    };

    V.compare = function () {
      var DB = db(), per = M01.perCompany(DB), g = M01.groupFigures(DB);
      return H.head('The group · Company by company', 'Company by company',
        'The same figures, one row each. A healthy group total can hide a company that is losing money.') +
      dials(DB, false, '') +
      H.panel('Every company <span class="badge">' + esc(periodLabel(DB)) + '</span>', H.table([
        { label: 'Company', align: 'l', fmt: function (c) { return '<b>' + esc(c.name) + '</b><div class="hint">' + esc(c.note) + '</div>'; } },
        { label: 'Net sales', fmt: function (c) { return inr(c.net); }, cellcls: 'mono' },
        { label: 'Purchases', fmt: function (c) { return inr(c.purchases); }, cellcls: 'mono' },
        { label: 'Wages', fmt: function (c) { return inr(c.wages); }, cellcls: 'mono' },
        { label: 'Running costs', fmt: function (c) { return inr(c.expenses); }, cellcls: 'mono' },
        { label: 'Profit', fmt: function (c) { return inr(c.profit); }, cellcls: function (c) { return 'mono ' + (c.profit >= 0 ? 'g' : 'r'); } },
        { label: 'Margin', fmt: function (c) { return c.margin + '%'; }, cellcls: function (c) { return 'mono ' + (c.profit >= 0 ? '' : 'r'); } },
        { label: '', align: 'l', fmt: function (c) { return c.registered ? H.tag('can file', 'grn') : H.tag('cannot file', 'amb'); } }], per) +
        '<div class="kv" style="margin-top:8px"><span><b>Added together</b> <span class="hint">before anything is removed</span></span><b>' +
        'Net: ' + money(g.addedNet) + ' &nbsp;·&nbsp; Profit: ' + money(g.profit) + '</b></div>') +
      '<div class="two">' +
      H.panel('Cash, stock and who owes whom', H.table([
        { label: 'Company', align: 'l', k: 'name' },
        { label: 'Cash + bank', fmt: function (c) { return inr(c.cash); }, cellcls: 'mono' },
        { label: 'Stock', fmt: function (c) { return inr(c.stock); }, cellcls: 'mono' },
        { label: 'To collect', fmt: function (c) { return inr(c.receivable); }, cellcls: 'mono' },
        { label: 'To pay', fmt: function (c) { return inr(c.payable); }, cellcls: 'mono' }], per)) +
      H.panel('What this table is for',
        '<p>A group total is an average with the arguments removed. The point of this screen is to put them back.</p>' +
        '<ul class="pts" style="margin-top:6px"><li>A company with good sales and a <b>negative margin</b> is being carried.</li>' +
        '<li>A company with cash and no stock is a <b>trading</b> arm; one with stock and no cash is a <b>making</b> arm. They should not be judged the same way.</li>' +
        '<li>Balances — cash, stock, what is owed — <b>do not move</b> when you change the period, because a balance is a position.</li></ul>') +
      '</div>';
    };

    V.internal = function () {
      var DB = db(), ic = M01.interco(DB), tot = M01.intercoTotal(DB), g = M01.groupFigures(DB);
      return H.head('The group · Internal billing', 'Between your own companies',
        'One of your companies invoicing another. Real for both of them; not a sale for the group.') +
      dials(DB, false, '') +
      H.kpis([{ l: 'Internal billing', v: money(tot), d: 'in this period', icon: 'sync', tone: 'teal' },
        { l: 'Entries', v: ic.length, d: 'invoices between your companies', icon: 'doc', tone: 'blue' },
        { l: 'Group sales without removing it', v: money(g.addedNet), d: 'the flattering figure', cls: 'r', icon: 'chart', tone: 'peach' },
        { l: 'Group sales after removing it', v: money(g.net), d: 'the honest one', cls: 'g', icon: 'coin', tone: 'green' }], '') +
      H.panel('Every internal invoice in this period', H.table([
        { label: 'Month', align: 'l', fmt: function (x) { return M01.MLBL[x.month] || x.month; } },
        { label: 'Billed by', align: 'l', fmt: function (x) { return esc(M01.coName(DB, x.from)); } },
        { label: 'Billed to', align: 'l', fmt: function (x) { return esc(M01.coName(DB, x.to)); } },
        { label: 'What for', align: 'l', k: 'note' },
        { label: 'Amount', fmt: function (x) { return inr(x.amount); }, cellcls: 'mono' }], ic) +
        '<div class="kv" style="margin-top:8px"><span><b>Removed from the group figures</b></span><b>' + money(tot) + '</b></div>') +
      '<div class="two">' +
      H.panel('Why removing it does not change the profit',
        '<div class="cascade">' +
        '<div class="cl"><span class="d">1</span><div>The company that raised the invoice booked it as <b>income</b>.</div></div>' +
        '<div class="cl"><span class="d">2</span><div>The company that received it booked exactly the same amount as a <b>cost</b>.</div></div>' +
        '<div class="cl"><span class="d">3</span><div>Added together, they are already <b>zero</b>. So group profit was never wrong.</div></div>' +
        '<div class="cl"><span class="d">4</span><div>Group <b>sales</b>, though, counted the money once. That is the figure this screen corrects.</div></div>' +
        '</div>' +
        '<p class="hint" style="margin-top:8px">This is why a group can quote a turnover far larger than it earned, without anybody lying: nobody removed the internal billing.</p>') +
      H.panel('Where it shows up elsewhere',
        '<p>An internal invoice travels on its own channel, called <b>' + esc(M01.icChannel(DB)) + '</b>, so it is never mistaken for business won outside.</p>' +
        '<p>On the Overview and Sales screens that channel is tagged <b>own group</b>. In the report builder you can drop it with one filter: <span class="mono">Channel is not ' + esc(M01.icChannel(DB)) + '</span>.</p>' +
        '<p class="hint">It is never hidden. Hiding it would be the same mistake in the other direction — for the company that did the work, that invoice is its whole living.</p>') +
      '</div>';
    };

    V.cos = function () {
      var DB = db(), per = M01.perCompany(DB), cap = (DB.plan && DB.plan.companyCap) || 20;
      var refusal = DB.lastRefusal;
      return H.head('Set up · Companies', 'Companies and the names you sell under',
        'Add a company whenever the business grows one. Nothing in the software caps how many — only your plan does.') +
      H.kpis([{ l: 'Companies', v: per.length, d: 'set up', icon: 'store', tone: 'teal' },
        { l: 'Your plan covers', v: cap, d: (DB.plan && DB.plan.name) || 'current plan', icon: 'layers', tone: 'blue' },
        { l: 'Room left', v: Math.max(0, cap - per.length), d: 'more companies', cls: cap - per.length > 0 ? 'g' : 'r', icon: 'check', tone: 'green' },
        { l: 'Trading names', v: (DB.brands || []).length, d: 'not companies', icon: 'tag', tone: 'peach' }], '') +
      (refusal ? H.panel('That was refused <span class="badge">' + esc(refusal.kind) + '</span>',
        '<div class="cascade"><b>' + esc(refusal.reason) + '</b></div>' +
        '<button class="btn sm" data-act="dismiss" style="margin-top:9px">Understood</button>') : '') +
      H.panel('Your companies', H.table([
        { label: 'Code', align: 'l', k: 'id', cellcls: 'mono' },
        { label: 'Company', align: 'l', k: 'name' },
        { label: 'What it does', align: 'l', k: 'note' },
        { label: 'Tax registration', align: 'l', fmt: function (c) {
          return String(c.gstin || '').trim() ? '<span class="mono">' + esc(c.gstin) + '</span>' : H.tag('none of its own', 'amb'); } },
        { label: '', align: 'l', fmt: function (c) { return '<button class="btn sm d" data-act="delco" data-c="' + esc(c.id) + '">Remove</button>'; } }], DB.companies || [])) +
      H.panel('Add a company',
        H.form([{ id: 'c_id', label: 'Short code', type: 'text', ph: 'e.g. NEW' },
                { id: 'c_name', label: 'Company name', type: 'text', wide: true },
                { id: 'c_gst', label: 'Tax registration (leave empty if it has none)', type: 'text', wide: true },
                { id: 'c_note', label: 'What it does', type: 'text', wide: true }], 'Add company', 'addco', 'f4') +
        '<p class="hint">A company with no registration is perfectly normal — a job-work arm, a new venture, a branch that bills through another. It counts in every group figure and is kept out of returns.</p>') +
      H.panel('The ways you sell <span class="badge">channels</span>',
        H.table([
          { label: 'Code', align: 'l', k: 'id', cellcls: 'mono' },
          { label: 'Channel', align: 'l', k: 'name' },
          { label: 'Sold by', align: 'l', fmt: function (c) {
            return String(c.co || '').trim() ? esc(M01.coName(DB, c.co)) : H.tag('the whole group', 'grn'); } },
          { label: 'Sales against it', fmt: function (c) { return String(M01.channelUse(DB, c.id)); }, cellcls: 'mono' },
          { label: '', align: 'l', fmt: function (c) {
            return '<button class="btn sm d" data-act="delch" data-c="' + esc(c.id) + '">Remove</button>'; } }],
          DB.channels || []) +
        '<p class="hint" style="margin-top:8px">A channel is a way you sell, not a name you sell under. ' +
        'Nothing here caps how many you open — the eleventh marketplace is a row, the same as the fourth company is.</p>' +
        H.form([{ id: 'ch_id', label: 'Short code', type: 'text', ph: 'e.g. NYKA' },
                { id: 'ch_name', label: 'Channel name', type: 'text', wide: true },
                { id: 'ch_co', label: 'Sold by', type: 'select', options: [{ v: '', label: 'The whole group' }]
                  .concat((DB.companies || []).map(function (c) { return { v: c.id, label: c.name }; })) },
                { id: 'ch_note', label: 'Notes', type: 'text', wide: true }], 'Add channel', 'addch', 'f4')) +
      H.panel('Names you sell under <span class="badge">not companies</span>',
        H.table([{ label: 'Trading name', align: 'l', k: 'name' },
          { label: 'Belongs to', align: 'l', fmt: function (b) { return esc(M01.coName(DB, b.co)); } },
          { label: 'Used on', align: 'l', k: 'where' },
          { label: '', align: 'l', fmt: function (b) {
            return '<button class="btn sm" data-act="trybrand" data-n="' + esc(b.name) + '">Try making this a company</button>'; } }], DB.brands || []) +
        '<p class="hint" style="margin-top:8px">Press that button on any row. The refusal you get is the rule working: a seller name is not a business, and counting it as one would double every figure it touches.</p>' +
        H.form([{ id: 'b_name', label: 'Trading name', type: 'text' },
                { id: 'b_co', label: 'Belongs to', type: 'select', options: (DB.companies || []).map(function (c) { return { v: c.id, label: c.name }; }) },
                { id: 'b_where', label: 'Used on', type: 'text', wide: true }], 'Add trading name', 'addbrand', 'f4'));
    };

    V.returns = function () {
      var DB = db(), per = M01.perCompany(DB), out = DB.lastReturn;
      return H.head('Set up · Returns', 'Who may file a return',
        'Only a company with its own registration can file one. This is refused in the engine, not warned about on a screen.') +
      dials(DB, false, '') +
      H.panel('Ask for a return, company by company', H.table([
        { label: 'Company', align: 'l', fmt: function (c) { return '<b>' + esc(c.name) + '</b>'; } },
        { label: 'Registration', align: 'l', fmt: function (c) { return c.registered ? '<span class="mono">' + esc(c.gstin) + '</span>' : H.tag('none', 'amb'); } },
        { label: 'Net sales in period', fmt: function (c) { return inr(c.net); }, cellcls: 'mono' },
        { label: 'Counts in group figures', align: 'l', fmt: function () { return H.tag('always', 'grn'); } },
        { label: '', align: 'l', fmt: function (c) {
          return '<button class="btn sm ' + (c.registered ? 'p' : 'd') + '" data-act="filereturn" data-c="' + esc(c.id) + '">Build its return</button>'; } }], per)) +
      (out ? (out.ok
        ? H.panel('Return figures · ' + esc(out.company) + ' <span class="badge">accepted</span>',
            '<div class="kv"><span>Registration</span><b class="mono">' + esc(out.gstin) + '</b></div>' +
            '<div class="kv"><span>Gross sales</span><b>' + money(out.gross) + '</b></div>' +
            '<div class="kv"><span>Returns / credit notes</span><b>' + money(out.returns) + '</b></div>' +
            '<div class="kv"><span>Net sales</span><b>' + money(out.net) + '</b></div>' +
            '<div class="kv"><span>Purchases</span><b>' + money(out.purchases) + '</b></div>' +
            '<p class="hint" style="margin-top:8px">These are this company’s own figures. The group total is a different question and is answered on the Group figures screen.</p>')
        : H.panel('Refused <span class="badge">' + esc(out.company || 'not possible') + '</span>',
            '<div class="cascade"><b>' + esc(out.reason) + '</b></div>' +
            '<p class="hint" style="margin-top:9px">This is the app doing its job. A return filed for a company that has no registration is not a small mistake; ' +
            'it is a filing in somebody else’s name. So it is not offered, not warned about, and not possible.</p>')) : '') +
      '<div class="two">' +
      H.panel('The two questions people confuse',
        '<table><thead><tr><th>Question</th><th>Answer for a company with no registration</th></tr></thead><tbody>' +
        '<tr><td><b>Does it count in my group figures?</b></td><td class="g"><b>Yes, always.</b> Its sales, costs, cash and stock are all in every total.</td></tr>' +
        '<tr><td><b>Can it file a return?</b></td><td class="r"><b>No.</b> It has no registration to file under.</td></tr>' +
        '</tbody></table>' +
        '<p class="hint" style="margin-top:8px">Most software answers both questions the same way, and you end up either losing a company from your group figures or filing something you should not have.</p>') +
      H.panel('What happens when the company does get registered',
        '<p>Put the registration number on it in <b>Companies &amp; names</b>. Nothing else changes: the same records, the same group figures, and from that moment it can build a return.</p>' +
        '<p class="hint">No migration, no re-entry, no second company. The registration is a field on the company, not the reason it exists.</p>') +
      '</div>';
    };

    /* ══════════ wiring — driven entirely by CFG, with the app's own closing panels ══════════ */
    V.wiring = function () {
      return H.head('Wiring · Integration', opt.wiringTitle || 'Where every number comes from',
        opt.wiringSub || 'This app owns no records of its own. It reads the shared Data Core and shows you the result.') +
      H.note('Shared Data Core: Item/SKU · Party · Stock · Ledger/Voucher · Order — every module reads and writes these.') +
      H.panel('Every figure on these screens, and its source', H.table([
        { label: 'Figure here', align: 'l', k: 'f' }, { label: 'Comes from', align: 'l', k: 's' },
        { label: 'How it is worked out', align: 'l', k: 'h' }], CFG.wiring || [])) +
      '<div class="two">' + (opt.wiringPanels ? opt.wiringPanels() : '') + '</div>';
    };

    return V;
  }

  /* ══════════ the actions, shared the same way ══════════ */
  function actions(CFG) {
    CFG = CFG || {};
    var A = {};
    A.setp = function (b) { var DB = db(); DB.period = b.getAttribute('data-p'); K.save(); K.render(); };
    A.setco = function (b) { var DB = db(); DB.co = b.getAttribute('data-c'); K.save(); K.render(); };
    A.clear = function (b) { var DB = db(); DB.resolved = DB.resolved || {}; DB.resolved[b.getAttribute('data-id')] = 1;
      K.save(); toast('Alert cleared ✓'); setTimeout(function () { K.render(); }, 350); };
    A.unclear = function () { var DB = db(); DB.resolved = {}; K.save(); toast('All alerts restored'); setTimeout(function () { K.render(); }, 350); };

    A.setsrc = function (b) { var DB = db(); DB.draft = M01.defaultDef(b.getAttribute('data-s')); K.save(); K.render(); };
    A.run = function () { var DB = db(), d = DB.draft;
      d.group = H.val('r_group'); d.sort = H.val('r_sort'); d.dir = H.val('r_dir'); d.limit = num(H.val('r_limit'));
      K.save(); toast('Report run ✓'); K.render(); };
    A.addf = function () { var DB = db(), d = DB.draft, f = { field: H.val('f_field'), op: H.val('f_op'), val: H.val('f_val') };
      if (f.val === '') { toast('Type a value first'); return; }
      d.filters = d.filters || []; d.filters.push(f); K.save(); toast('Filter added'); K.render(); };
    A.delf = function (b) { var DB = db(); DB.draft.filters.splice(num(b.getAttribute('data-i')), 1); K.save(); K.render(); };
    A.clearf = function () { var DB = db(); DB.draft.filters = []; K.save(); toast('Filters removed'); K.render(); };
    A.savedef = function () { var DB = db(), n = (H.val('r_name') || '').trim();
      if (!n) { toast('Give the report a name'); return; }
      DB.saved = DB.saved || []; DB.saved.push({ name: n, def: JSON.parse(JSON.stringify(DB.draft)) });
      K.save(); toast('Saved ✓'); K.go('saved'); };
    A.runsaved = function (b) { var DB = db(), s = DB.saved[num(b.getAttribute('data-i'))];
      if (!s) return; DB.draft = JSON.parse(JSON.stringify(s.def)); K.save(); toast('Loaded “' + s.name + '”'); K.go('build'); };
    A.delsaved = function (b) { var DB = db(); DB.saved.splice(num(b.getAttribute('data-i')), 1); K.save(); toast('Deleted'); K.render(); };
    A.tpl = function (b) { var DB = db(), t = (CFG.templates || [])[num(b.getAttribute('data-i'))];
      if (!t) return; DB.draft = JSON.parse(JSON.stringify(t.def)); K.save(); toast('Loaded “' + t.name + '”'); K.go('build'); };
    A.csvdl = function () { var DB = db(), txt = M01.csvOf(M01.report(DB, DB.draft), DB.draft);
      try { var bl = new Blob([txt], { type: 'text/csv' }); var a = document.createElement('a');
        a.href = URL.createObjectURL(bl); a.download = (CFG.id || 'report') + '.csv'; a.click(); toast('CSV downloaded'); }
      catch (e) { toast('Download not available here'); } };

    A.dismiss = function () { var DB = db(); DB.lastRefusal = null; K.save(); K.render(); };
    A.addco = function () {
      var DB = db(), res = M01.addCompany(DB, { id: H.val('c_id'), name: H.val('c_name'), gstin: H.val('c_gst'), note: H.val('c_note') });
      if (!res.ok) { DB.lastRefusal = { kind: res.refused ? 'a rule, not an error' : 'check this', reason: res.reason };
        K.save(); toast('Refused'); K.render(); return; }
      DB.lastRefusal = null;
      if (!(DB.openings || []).some(function (o) { return o.co === res.id; }))
        (DB.openings = DB.openings || []).push({ id: M01.uid('op'), co: res.id, cash: 0, bank: 0 });
      K.save(); toast('Company added ✓'); K.render();
    };
    A.delco = function (b) {
      var DB = db(), id = b.getAttribute('data-c');
      var used = ['sales', 'purchases', 'expenses', 'production', 'stock', 'receivables', 'payables']
        .reduce(function (s, k) { return s + (DB[k] || []).filter(function (x) { return x.co === id; }).length; }, 0);
      if (used) { DB.lastRefusal = { kind: 'a rule, not an error',
        reason: M01.coName(DB, id) + ' has ' + used + ' records against it. Removing the company would leave those records ' +
          'belonging to nobody and every group figure would quietly change. Move or delete the records first.' };
        K.save(); toast('Refused'); K.render(); return; }
      DB.companies = DB.companies.filter(function (c) { return c.id !== id; });
      DB.brands = (DB.brands || []).filter(function (x) { return x.co !== id; });
      DB.openings = (DB.openings || []).filter(function (x) { return x.co !== id; });
      if (DB.co === id) DB.co = 'all';
      DB.lastRefusal = null; K.save(); toast('Company removed'); K.render();
    };
    A.addch = function () {
      var DB = db(), res = M01.addChannel(DB, { id: H.val('ch_id'), name: H.val('ch_name'),
        co: H.val('ch_co'), note: H.val('ch_note') });
      if (!res.ok) { DB.lastRefusal = { kind: res.refused ? 'a rule, not an error' : 'check this', reason: res.reason };
        K.save(); toast('Refused'); K.render(); return; }
      DB.lastRefusal = null; K.save(); toast('Channel added ✓'); K.render();
    };
    A.delch = function (b) {
      var DB = db(), id = b.getAttribute('data-c'), used = M01.channelUse(DB, id);
      if (used) { DB.lastRefusal = { kind: 'a rule, not an error',
        reason: 'That channel has ' + used + ' sales against it. Removing it would leave those sales ' +
          'belonging to a channel that no longer exists, and every by-channel figure would quietly change. ' +
          'Move or delete the sales first.' };
        K.save(); toast('Refused'); K.render(); return; }
      DB.channels = (DB.channels || []).filter(function (c) { return c.id !== id; });
      DB.lastRefusal = null; K.save(); toast('Channel removed'); K.render();
    };
    A.addbrand = function () {
      var DB = db(), n = (H.val('b_name') || '').trim();
      if (!n) { toast('Give the trading name a name'); return; }
      DB.brands = DB.brands || [];
      DB.brands.push({ id: M01.uid('br'), name: n, co: H.val('b_co'), where: H.val('b_where') });
      K.save(); toast('Trading name added ✓'); K.render();
    };
    A.trybrand = function (b) {
      var DB = db(), n = b.getAttribute('data-n');
      var res = M01.addCompany(DB, { id: n.slice(0, 3).toUpperCase(), name: n });
      DB.lastRefusal = res.ok ? null : { kind: 'a rule, not an error', reason: res.reason };
      if (res.ok) { DB.companies = DB.companies.filter(function (c) { return c.id !== res.id; });
        DB.lastRefusal = { kind: 'undone', reason: 'That should not have been allowed. It has been undone.' }; }
      K.save(); toast('Refused — see the panel'); K.go('cos');
    };
    A.filereturn = function (b) {
      var DB = db(); DB.lastReturn = M01.gstReturn(DB, b.getAttribute('data-c'));
      K.save(); toast(DB.lastReturn.ok ? 'Return figures ready' : 'Refused'); K.render();
    };
    return A;
  }

  return { make: make, actions: actions, dials: dials, periodLabel: periodLabel };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = M01V;
