/* Medhava — Module 01 · the shared engine.

   All four apps in this module — CEO Dashboard, Report Builder, Group Consolidation and the
   combined Module 01 app — are built from THIS file. Not from a copy of it, not from something
   that looks like it. One arithmetic, compiled into four HTML files.

   That is the only way "the report can never disagree with the dashboard" can be a fact rather
   than an intention. When two apps each keep their own copy of "net sales = gross − returns",
   they agree until the day somebody fixes a rounding bug in one of them.

   What lives here:
     1. the data model    — the tables, their columns, and what a valid row looks like
     2. the seed          — the same demo business in every app, split across real companies
     3. scope             — period AND company filtering, the two dials every figure obeys
     4. the figures       — sales, profit, cash, stock, alerts
     5. the report engine — sources, grouping, filtering, sorting, CSV
     6. consolidation     — several companies rolled into one set of books
     7. import / export   — the column maps, and the rules an uploaded row has to satisfy

   Nothing in here knows what industry it is running. Names come from CONFIG, always. */

var M01 = (function () {
  'use strict';
  var K = (typeof Medhava !== 'undefined') ? Medhava : {};
  var r2 = K.r2 || function (n) { return Math.round((Number(n) + Number.EPSILON) * 100) / 100; };
  var num = K.num || function (n) { return (n == null || n === '' || isNaN(n)) ? 0 : Number(n); };

  var MONTHS = ['2026-04', '2026-05', '2026-06', '2026-07'];
  var MSHORT = { '2026-04': 'Apr', '2026-05': 'May', '2026-06': 'Jun', '2026-07': 'Jul' };
  var MLBL = { '2026-04': 'Apr 2026', '2026-05': 'May 2026', '2026-06': 'Jun 2026', '2026-07': 'Jul 2026' };

  /* ═══════════════ 1 · THE DATA MODEL ═══════════════
     Every table is described once, here. The edit forms, the import column matching, the
     export sheets and the validation rules are all generated from these descriptions — so a
     column can never exist in the grid but be missing from the importer. */
  var TABLES = [
    { key: 'companies', label: 'Companies', icon: 'store', one: 'company',
      note: 'Every legal entity you run. Add as many as your plan allows — the software itself sets no limit.',
      cols: [ { k: 'id', l: 'Code', type: 'text', req: 1, w: 1 },
              { k: 'name', l: 'Company name', type: 'text', req: 1 },
              { k: 'gstin', l: 'Tax registration', type: 'text', hint: 'Leave empty if this company has none' },
              { k: 'note', l: 'What it does', type: 'text' } ] },
    { key: 'brands', label: 'Trading names', icon: 'tag', one: 'trading name',
      note: 'A name you sell under. A trading name is NOT a company — it belongs to one, and its sales are that company’s sales.',
      cols: [ { k: 'name', l: 'Trading name', type: 'text', req: 1 },
              { k: 'co', l: 'Belongs to', type: 'co', req: 1 },
              { k: 'where', l: 'Used on', type: 'text' } ] },
    { key: 'sales', label: 'Sales', icon: 'cart', one: 'sales line',
      note: 'One line per company per channel per month. Returns belong on the same line as the sale they came off.',
      cols: [ { k: 'co', l: 'Company', type: 'co', req: 1 },
              { k: 'month', l: 'Month', type: 'month', req: 1 },
              { k: 'channel', l: 'Channel', type: 'text', req: 1 },
              { k: 'gross', l: 'Gross', type: 'num' },
              { k: 'returns', l: 'Returns', type: 'num' },
              { k: 'units', l: 'Units', type: 'num' } ] },
    { key: 'purchases', label: 'Purchases', icon: 'truck', one: 'purchase',
      note: 'What you bought in, month by month. Not running costs — those are their own table.',
      cols: [ { k: 'co', l: 'Company', type: 'co', req: 1 },
              { k: 'month', l: 'Month', type: 'month', req: 1 },
              { k: 'party', l: 'Supplier', type: 'text' },
              { k: 'amount', l: 'Amount', type: 'num' } ] },
    { key: 'expenses', label: 'Running costs', icon: 'scale', one: 'cost',
      note: 'Everything spent to keep the business open — rent, salaries, marketing, freight.',
      cols: [ { k: 'co', l: 'Company', type: 'co', req: 1 },
              { k: 'month', l: 'Month', type: 'month', req: 1 },
              { k: 'cat', l: 'Cost head', type: 'text', req: 1 },
              { k: 'amount', l: 'Amount', type: 'num' } ] },
    { key: 'production', label: 'Production', icon: 'wrench', one: 'production line',
      note: 'What was finished, and what it cost in wages. A services firm uses this for delivered work.',
      cols: [ { k: 'co', l: 'Company', type: 'co', req: 1 },
              { k: 'month', l: 'Month', type: 'month', req: 1 },
              { k: 'pieces', l: 'Pieces made', type: 'num' },
              { k: 'wages', l: 'Wages', type: 'num' } ] },
    { key: 'stock', label: 'Stock', icon: 'box', one: 'stock item',
      note: 'What you are holding right now, valued at what it cost you.',
      cols: [ { k: 'co', l: 'Company', type: 'co', req: 1 },
              { k: 'sku', l: 'Code', type: 'text', req: 1 },
              { k: 'name', l: 'Item', type: 'text', req: 1 },
              { k: 'qty', l: 'Quantity', type: 'num' },
              { k: 'rop', l: 'Reorder at', type: 'num' },
              { k: 'cost', l: 'Cost each', type: 'num' } ] },
    { key: 'receivables', label: 'Money owed to you', icon: 'doc', one: 'receivable',
      note: 'Unpaid invoices, with how many days old each one is.',
      cols: [ { k: 'co', l: 'Company', type: 'co', req: 1 },
              { k: 'party', l: 'Who owes you', type: 'text', req: 1 },
              { k: 'amount', l: 'Amount', type: 'num' },
              { k: 'days', l: 'Days old', type: 'num' } ] },
    { key: 'payables', label: 'Money you owe', icon: 'coin', one: 'payable',
      note: 'Unpaid bills. Days is positive when it is late, negative when it is not due yet.',
      cols: [ { k: 'co', l: 'Company', type: 'co', req: 1 },
              { k: 'party', l: 'Who you owe', type: 'text', req: 1 },
              { k: 'amount', l: 'Amount', type: 'num' },
              { k: 'days', l: 'Days late', type: 'num' } ] },
    { key: 'openings', label: 'Opening balances', icon: 'coin', one: 'opening balance',
      note: 'What each company started the year with. One row per company.',
      cols: [ { k: 'co', l: 'Company', type: 'co', req: 1 },
              { k: 'cash', l: 'Cash', type: 'num' },
              { k: 'bank', l: 'Bank', type: 'num' } ] },
    { key: 'intercompany', label: 'Between your own companies', icon: 'sync', one: 'inter-company entry',
      note: 'One of your companies invoicing another. Real for each of them; not a sale for the group.',
      cols: [ { k: 'month', l: 'Month', type: 'month', req: 1 },
              { k: 'from', l: 'Billed by', type: 'co', req: 1 },
              { k: 'to', l: 'Billed to', type: 'co', req: 1 },
              { k: 'amount', l: 'Amount', type: 'num' },
              { k: 'note', l: 'What for', type: 'text' } ] }
  ];
  var TBL = {}; TABLES.forEach(function (t) { TBL[t.key] = t; });

  var seq = 0;
  function uid(p) { seq++; return p + '-' + (Date.now() % 100000) + '-' + seq; }
  /* Seeded records get stable ids so two builds of the same edition are byte-identical
     and a self-test can name a row. Only records the user adds get a clock in the id. */
  function sid(p, i) { return p + '-' + i; }

  /* ═══════════════ 2 · THE SEED ═══════════════
     One demo business, the same numbers in every app of this module. The channel-month
     totals are the ones this module has always used; what is new is that they are split
     across the companies the group actually runs, by a whole-rupee split that adds back
     up to the original figure exactly. */

  /* Largest-remainder split: hand out whole rupees by share, then give the leftover rupees
     to whoever was rounded down hardest. The parts always add up to the total — which is why
     the group figure can be asserted against a fixed number in a self-test. */
  function split(total, shares) {
    var raw = shares.map(function (s) { return total * s; });
    var out = raw.map(function (x) { return Math.floor(x); });
    var left = Math.round(total - out.reduce(function (a, b) { return a + b; }, 0));
    var order = raw.map(function (x, i) { return { i: i, f: x - Math.floor(x) }; })
      .sort(function (a, b) { return b.f - a.f; });
    for (var j = 0; j < left; j++) out[order[j % order.length].i]++;
    return out;
  }

  var CHBASE = [
    [182000, 196000, 211000, 238000],
    [128000, 141000, 133000, 164000],
    [96000, 104000, 118000, 127000],
    [74000, 69000, 81000, 92000],
    [52000, 58000, 61000, 55000]
  ];
  var CHRET = [0.06, 0.14, 0.11, 0.09, 0.02];
  /* how each channel's business is split between the group's companies */
  var CHSPLIT = [
    [0.55, 0.35, 0.10],
    [0.70, 0.30, 0.00],
    [0.40, 0.45, 0.15],
    [0.20, 0.55, 0.25],
    [0.00, 0.60, 0.40]
  ];

  function seed(DB, CFG) {
    var COS = CFG.companies || [{ id: 'C1', name: CFG.company || 'Company', gstin: '', note: '' }];
    DB.companies = COS.map(function (c) { return { id: c.id, name: c.name, gstin: c.gstin || '', note: c.note || '' }; });
    DB.brands = (CFG.brands || []).map(function (b) { return { id: sid('br', b.name), name: b.name, co: b.co, where: b.where || '' }; });
    DB.plan = { name: (CFG.plan && CFG.plan.name) || 'Enterprise', companyCap: (CFG.plan && CFG.plan.companyCap) || 20 };

    var CH = CFG.channels, ids = DB.companies.map(function (c) { return c.id; });
    var sales = [], n = 0, m, c, k;
    for (m = 0; m < MONTHS.length; m++) for (c = 0; c < CH.length; c++) {
      var parts = split(CHBASE[c][m], CHSPLIT[c].slice(0, ids.length));
      for (k = 0; k < ids.length; k++) {
        if (!parts[k]) continue;
        sales.push({ id: sid('sl', ++n), co: ids[k], month: MONTHS[m], channel: CH[c],
          gross: parts[k], returns: r2(parts[k] * CHRET[c]), units: Math.round(parts[k] / 1450) });
      }
    }
    DB.sales = sales;

    var pbase = [214000, 198000, 243000, 262000], psplit = [0.45, 0.35, 0.20];
    DB.purchases = []; n = 0;
    for (m = 0; m < MONTHS.length; m++) {
      var pp = split(pbase[m], psplit.slice(0, ids.length));
      for (k = 0; k < ids.length; k++) if (pp[k])
        DB.purchases.push({ id: sid('pu', ++n), co: ids[k], month: MONTHS[m],
          party: (CFG.parties.p[k % CFG.parties.p.length]), amount: pp[k] });
    }

    var EX = [['Rent', [42000, 42000, 42000, 42000]], ['Salaries', [96000, 98000, 101000, 104000]],
              [CFG.costHeads && CFG.costHeads[0] || 'Marketing', [31000, 38000, 44000, 52000]],
              [CFG.costHeads && CFG.costHeads[1] || 'Logistics', [26000, 29000, 31000, 34000]]];
    var esplit = [0.45, 0.35, 0.20];
    DB.expenses = []; n = 0;
    EX.forEach(function (e) {
      for (m = 0; m < MONTHS.length; m++) {
        var ep = split(e[1][m], esplit.slice(0, ids.length));
        for (k = 0; k < ids.length; k++) if (ep[k])
          DB.expenses.push({ id: sid('ex', ++n), co: ids[k], month: MONTHS[m], cat: e[0], amount: ep[k] });
      }
    });

    /* Production sits mostly with the making arm — in this group that is the third company,
       the one with no tax registration, because it only ever does work for the other two. */
    var prod = [[410, 74000], [445, 79000], [498, 88000], [534, 95000]];
    var prsplit = ids.length > 2 ? [0.15, 0.15, 0.70] : [0.6, 0.4];
    DB.production = []; n = 0;
    for (m = 0; m < MONTHS.length; m++) {
      var pcs = split(prod[m][0], prsplit.slice(0, ids.length)), wg = split(prod[m][1], prsplit.slice(0, ids.length));
      for (k = 0; k < ids.length; k++) if (pcs[k])
        DB.production.push({ id: sid('pr', ++n), co: ids[k], month: MONTHS[m], pieces: pcs[k], wages: wg[k] });
    }

    DB.stock = (CFG.items || []).map(function (it, i) {
      return { id: sid('st', i + 1), co: it.co || ids[i % ids.length], sku: it.sku, name: it.name,
        qty: it.qty, rop: it.rop, cost: it.cost };
    });

    DB.receivables = CFG.parties.r.map(function (p, i) {
      return { id: sid('rc', i + 1), co: ids[i % ids.length], party: p,
        amount: [186400, 94200, 212800, 61500][i], days: [12, 38, 5, 72][i] };
    });
    DB.payables = CFG.parties.p.map(function (p, i) {
      return { id: sid('py', i + 1), co: ids[i % ids.length], party: p,
        amount: [148900, 92400, 189500, 64000][i], days: [-3, 30, -22, 76][i] };
    });
    DB.openings = ids.map(function (id, i) {
      return { id: sid('op', i + 1), co: id, cash: [110000, 48000, 22000][i] || 0, bank: [390000, 190000, 60000][i] || 0 };
    });

    /* The making arm bills the two selling companies for the work it did. Each of those bills is
       completely real to the company that issued it and the company that received it — so each
       one IS a sales line for the biller and a purchase for the buyer, sitting in the ordinary
       tables like any other. And each one is completely fictional to the group, which cannot
       sell anything to itself. The table below is not a second copy of them; it is the list of
       which pairs are internal, so the group figures know what to take back out. */
    DB.intercompany = [];
    DB.icChannel = CFG.icChannel || 'Between our own companies';
    if (ids.length > 2) {
      var IC = [['2026-04', 62000], ['2026-05', 68000], ['2026-06', 74000], ['2026-07', 81000]];
      var icCh = DB.icChannel;
      IC.forEach(function (x, i) {
        var a = Math.round(x[1] * 0.6), b = x[1] - a;
        [[ids[0], a], [ids[1], b]].forEach(function (pair, j) {
          DB.intercompany.push({ id: sid('ic', i * 2 + j + 1), month: x[0], from: ids[2], to: pair[0],
            amount: pair[1], note: CFG.icNote || 'Work done for the selling companies' });
          DB.sales.push({ id: sid('sl', 'ic' + (i * 2 + j + 1)), co: ids[2], month: x[0], channel: icCh,
            gross: pair[1], returns: 0, units: 0 });
          DB.purchases.push({ id: sid('pu', 'ic' + (i * 2 + j + 1)), co: pair[0], month: x[0],
            party: DB.companies[2].name, amount: pair[1] });
        });
      });
    }
    DB.period = '2026-07'; DB.co = 'all'; DB.resolved = {};
  }

  /* ═══════════════ 3 · SCOPE — the two dials ═══════════════
     Every figure in this module obeys exactly two controls: which period, and which company.
     Written once here so no screen can quietly forget one of them. */
  function inPeriod(DB, month) { var p = DB.period; return (!p || p === 'all') ? true : month === p; }
  function inCo(DB, co) { var c = DB.co; return (!c || c === 'all') ? true : co === c; }
  function months(DB) { return (!DB.period || DB.period === 'all') ? MONTHS.slice() : [DB.period]; }
  /* Flow records: filtered by period AND company. */
  function rows(DB, key) {
    return (DB[key] || []).filter(function (x) { return inPeriod(DB, x.month) && inCo(DB, x.co); });
  }
  /* Balances: filtered by company only. A balance is a position, not a period — "cash for
     June" is not a thing, and pretending it is turns a bank balance into nonsense. */
  function held(DB, key) { return (DB[key] || []).filter(function (x) { return inCo(DB, x.co); }); }
  function coName(DB, id) {
    if (!id || id === 'all') return 'All companies';
    var c = (DB.companies || []).filter(function (x) { return x.id === id; })[0];
    return c ? c.name : id;
  }
  function coIds(DB) { return (DB.companies || []).map(function (c) { return c.id; }); }
  /* One of your companies billing another is a sale for that company and not a sale for the
     group. It travels on its own channel so it is never mistaken for business won outside. */
  function icChannel(DB) { return DB.icChannel || 'Between our own companies'; }
  function isInternal(DB, channel) { return channel === icChannel(DB); }
  function externalGross(DB) {
    return sum(rows(DB, 'sales').filter(function (x) { return !isInternal(DB, x.channel); }), function (x) { return x.gross; });
  }

  /* ═══════════════ 4 · THE FIGURES ═══════════════ */
  function sum(list, f) { return r2(list.reduce(function (s, x) { return s + num(f(x)); }, 0)); }

  function grossSales(DB) { return sum(rows(DB, 'sales'), function (x) { return x.gross; }); }
  function returnsVal(DB) { return sum(rows(DB, 'sales'), function (x) { return x.returns; }); }
  function netSales(DB) { return r2(grossSales(DB) - returnsVal(DB)); }
  function unitsSold(DB) { return rows(DB, 'sales').reduce(function (s, x) { return s + num(x.units); }, 0); }
  function returnRate(DB) { var g = grossSales(DB); return g ? Math.round(returnsVal(DB) / g * 100) : 0; }
  function purchases(DB) { return sum(rows(DB, 'purchases'), function (x) { return x.amount; }); }
  function expenses(DB) { return sum(rows(DB, 'expenses'), function (x) { return x.amount; }); }
  function wages(DB) { return sum(rows(DB, 'production'), function (x) { return x.wages; }); }
  function piecesMade(DB) { return rows(DB, 'production').reduce(function (s, x) { return s + num(x.pieces); }, 0); }
  function grossProfit(DB) { return r2(netSales(DB) - purchases(DB) - wages(DB)); }
  function netProfit(DB) { return r2(grossProfit(DB) - expenses(DB)); }
  function marginPct(DB) { var n = netSales(DB); return n ? Math.round(netProfit(DB) / n * 100) : 0; }
  function opening(DB) { return sum(held(DB, 'openings'), function (x) { return num(x.cash) + num(x.bank); }); }
  function cash(DB) {
    /* a true position: opening plus everything earned or spent since, whatever period is on screen */
    var all = scope(DB, 'all', DB.co);
    return r2(opening(DB) + netProfit(all));
  }
  function receivable(DB) { return sum(held(DB, 'receivables'), function (x) { return x.amount; }); }
  function payable(DB) { return sum(held(DB, 'payables'), function (x) { return x.amount; }); }
  function stockValue(DB) { return sum(held(DB, 'stock'), function (x) { return num(x.qty) * num(x.cost); }); }
  function lowStock(DB) { return held(DB, 'stock').filter(function (x) { return num(x.qty) <= num(x.rop); }); }

  /* A view of the same records under different dials. Used wherever a figure has to be worked
     out for another period or another company without disturbing what is on screen. */
  function scope(DB, period, co) {
    var v = { period: period, co: co, icChannel: DB.icChannel };
    ['sales', 'purchases', 'expenses', 'production', 'stock', 'receivables', 'payables',
     'openings', 'intercompany', 'companies', 'brands'].forEach(function (k) { v[k] = DB[k]; });
    return v;
  }

  function byChannel(DB) {
    var m = {};
    rows(DB, 'sales').forEach(function (x) {
      var e = m[x.channel] = m[x.channel] || { gross: 0, returns: 0, units: 0 };
      e.gross = r2(e.gross + num(x.gross)); e.returns = r2(e.returns + num(x.returns)); e.units += num(x.units);
    });
    return Object.keys(m).map(function (c) {
      var e = m[c];
      return { channel: c, gross: e.gross, returns: e.returns, net: r2(e.gross - e.returns), units: e.units,
        rr: e.gross ? Math.round(e.returns / e.gross * 100) : 0 };
    }).sort(function (a, b) { return b.net - a.net; });
  }
  function monthSeries(DB) {
    return MONTHS.map(function (m) {
      var one = scope(DB, m, DB.co);
      return { month: m, label: MSHORT[m], net: netSales(one), profit: netProfit(one) };
    });
  }
  function growthPct(DB) {
    var s = monthSeries(DB); if (s.length < 2) return 0;
    var a = s[s.length - 2].net, b = s[s.length - 1].net;
    return a ? Math.round((b - a) / a * 100) : 0;
  }

  /* Alerts are worked out from live figures every time a screen opens. Nobody types them in,
     and clearing one only records that you have seen it. */
  function alerts(DB) {
    var out = [], done = DB.resolved || {}, money = K.money || String;
    lowStock(DB).forEach(function (it) {
      out.push({ id: 'stock-' + it.sku + '-' + it.co, sev: 'high', area: 'Inventory',
        what: it.name + ' is down to ' + it.qty + ' — reorder point is ' + it.rop, go: 'stock' });
    });
    held(DB, 'receivables').filter(function (x) { return x.days > 30; }).forEach(function (x) {
      out.push({ id: 'rec-' + x.party, sev: x.days > 60 ? 'high' : 'med', area: 'Money',
        what: x.party + ' owes ' + money(x.amount) + ', ' + x.days + ' days overdue', go: 'money' });
    });
    held(DB, 'payables').filter(function (x) { return x.days > 0; }).forEach(function (x) {
      out.push({ id: 'pay-' + x.party, sev: x.days > 60 ? 'high' : 'med', area: 'Money',
        what: 'You owe ' + x.party + ' ' + money(x.amount) + ', ' + x.days + ' days late', go: 'money' });
    });
    byChannel(DB).filter(function (c) { return c.rr >= 12; }).forEach(function (c) {
      out.push({ id: 'ret-' + c.channel, sev: 'med', area: 'Sales',
        what: c.channel + ' return rate is ' + c.rr + '% — above the 12% line', go: 'sales' });
    });
    /* a company kept in the group books with no tax registration is a fact to know about,
       not a fault to fix — so it is a watch, and it names what it means */
    (DB.companies || []).filter(function (c) { return !String(c.gstin || '').trim(); }).forEach(function (c) {
      out.push({ id: 'gst-' + c.id, sev: 'med', area: 'Group',
        what: c.name + ' has no tax registration — it counts in group figures but is left out of returns', go: 'companies' });
    });
    return out.filter(function (a) { return !done[a.id]; });
  }

  /* ═══════════════ 5 · THE REPORT ENGINE ═══════════════
     Each source flattens records into plain rows, so grouping, filtering and sorting work the
     same way whatever you are looking at. Every source respects the period and company dials,
     which is why a report grouped by channel equals the dashboard's net sales exactly. */
  var SRC = {
    sales: { label: 'Sales', icon: 'cart',
      note: 'One row per company per channel per month. Returns are already taken off before "Net".',
      dims: [{ k: 'channel', l: 'Channel' }, { k: 'monthLabel', l: 'Month' }, { k: 'company', l: 'Company' }],
      measures: [{ k: 'gross', l: 'Gross', money: 1 }, { k: 'returns', l: 'Returns', money: 1 }, { k: 'net', l: 'Net sales', money: 1 }, { k: 'units', l: 'Units' }],
      rows: function (DB) { return rows(DB, 'sales').map(function (r) {
        return { channel: r.channel, monthLabel: MLBL[r.month], month: r.month, company: coName(DB, r.co), co: r.co,
          gross: num(r.gross), returns: num(r.returns), net: r2(num(r.gross) - num(r.returns)), units: num(r.units) }; }); } },
    money: { label: 'Money owed', icon: 'coin',
      note: 'Who owes you and who you owe, side by side, aged in days.',
      dims: [{ k: 'party', l: 'Party' }, { k: 'type', l: 'Direction' }, { k: 'status', l: 'Status' }, { k: 'company', l: 'Company' }],
      measures: [{ k: 'amount', l: 'Amount', money: 1 }, { k: 'days', l: 'Days' }],
      rows: function (DB) { var out = [];
        held(DB, 'receivables').forEach(function (x) { out.push({ party: x.party, type: 'To collect', days: num(x.days),
          amount: num(x.amount), company: coName(DB, x.co), co: x.co,
          status: x.days > 60 ? 'Very overdue' : x.days > 30 ? 'Overdue' : 'On time' }); });
        held(DB, 'payables').forEach(function (x) { out.push({ party: x.party, type: 'To pay', days: num(x.days),
          amount: num(x.amount), company: coName(DB, x.co), co: x.co,
          status: x.days > 60 ? 'Very late' : x.days > 0 ? 'Late' : 'On time' }); });
        return out; } },
    stock: { label: 'Stock', icon: 'box',
      note: 'What you are holding right now, valued at cost, with anything below its reorder point flagged.',
      dims: [{ k: 'name', l: 'Item' }, { k: 'status', l: 'Status' }, { k: 'company', l: 'Company' }],
      measures: [{ k: 'qty', l: 'Quantity' }, { k: 'value', l: 'Value at cost', money: 1 }],
      rows: function (DB) { return held(DB, 'stock').map(function (x) {
        return { sku: x.sku, name: x.name, qty: num(x.qty), rop: num(x.rop), cost: num(x.cost),
          value: r2(num(x.qty) * num(x.cost)), company: coName(DB, x.co), co: x.co,
          status: num(x.qty) <= num(x.rop) ? 'Reorder now' : num(x.qty) <= num(x.rop) * 2 ? 'Getting low' : 'Comfortable' }; }); } },
    expenses: { label: 'Running costs', icon: 'scale',
      note: 'Everything spent to keep the business running — not the cost of what you sell.',
      dims: [{ k: 'cat', l: 'Cost head' }, { k: 'monthLabel', l: 'Month' }, { k: 'company', l: 'Company' }],
      measures: [{ k: 'amount', l: 'Amount', money: 1 }],
      rows: function (DB) { return rows(DB, 'expenses').map(function (x) {
        return { cat: x.cat, monthLabel: MLBL[x.month], month: x.month, amount: num(x.amount), company: coName(DB, x.co), co: x.co }; }); } },
    production: { label: 'Production', icon: 'wrench',
      note: 'What was actually finished each month, and what it cost in wages.',
      dims: [{ k: 'monthLabel', l: 'Month' }, { k: 'company', l: 'Company' }],
      measures: [{ k: 'pieces', l: 'Pieces made' }, { k: 'wages', l: 'Wages', money: 1 }],
      rows: function (DB) { return rows(DB, 'production').map(function (x) {
        return { monthLabel: MLBL[x.month], month: x.month, pieces: num(x.pieces), wages: num(x.wages),
          cpp: num(x.pieces) ? r2(num(x.wages) / num(x.pieces)) : 0, company: coName(DB, x.co), co: x.co }; }); } },
    purchases: { label: 'Purchases', icon: 'truck',
      note: 'What you bought in, by supplier and month.',
      dims: [{ k: 'party', l: 'Supplier' }, { k: 'monthLabel', l: 'Month' }, { k: 'company', l: 'Company' }],
      measures: [{ k: 'amount', l: 'Amount', money: 1 }],
      rows: function (DB) { return rows(DB, 'purchases').map(function (x) {
        return { party: x.party, monthLabel: MLBL[x.month], month: x.month, amount: num(x.amount), company: coName(DB, x.co), co: x.co }; }); } }
  };
  var SRCKEYS = ['sales', 'money', 'stock', 'expenses', 'production', 'purchases'];

  function fieldsOf(src) { var S = SRC[src]; return S.dims.concat(S.measures); }
  function isMeasure(src, k) { return SRC[src].measures.some(function (m) { return m.k === k; }); }
  function labelOf(src, k) { var f = fieldsOf(src).filter(function (x) { return x.k === k; })[0]; return f ? f.l : k; }

  function passes(row, f, src) {
    var v = row[f.field];
    if (isMeasure(src, f.field)) {
      var a = num(v), b = num(f.val);
      if (f.op === '>=') return a >= b; if (f.op === '<=') return a <= b;
      if (f.op === '>') return a > b; if (f.op === '<') return a < b;
      return a === b;
    }
    var s = String(v == null ? '' : v).toLowerCase(), q = String(f.val == null ? '' : f.val).toLowerCase();
    if (f.op === 'is') return s === q;
    if (f.op === 'is not') return s !== q;
    return s.indexOf(q) >= 0;
  }
  function report(DB, def) {
    var S = SRC[def.src] || SRC.sales, ms = S.measures;
    var all = S.rows(DB);
    var kept = all.filter(function (r) { return (def.filters || []).every(function (f) { return passes(r, f, def.src); }); });
    var out;
    if (def.group === 'none') {
      out = kept.map(function (r) { var v = {}; ms.forEach(function (m) { v[m.k] = num(r[m.k]); });
        return { label: S.dims.map(function (d) { return r[d.k]; }).join(' · '), n: 1, v: v }; });
    } else {
      var map = {}, order = [];
      kept.forEach(function (r) {
        var k = String(r[def.group]);
        if (!map[k]) { map[k] = { label: k, n: 0, v: {} }; ms.forEach(function (m) { map[k].v[m.k] = 0; }); order.push(k); }
        map[k].n++; ms.forEach(function (m) { map[k].v[m.k] = r2(map[k].v[m.k] + num(r[m.k])); });
      });
      out = order.map(function (k) { return map[k]; });
    }
    var sk = def.sort || ms[0].k, dir = def.dir === 'asc' ? 1 : -1;
    out.sort(function (a, b) {
      if (sk === 'label') return a.label < b.label ? -dir : a.label > b.label ? dir : 0;
      if (sk === 'n') return (a.n - b.n) * dir;
      return (num(a.v[sk]) - num(b.v[sk])) * dir;
    });
    var total = { label: 'Total', n: kept.length, v: {} };
    ms.forEach(function (m) { total.v[m.k] = r2(kept.reduce(function (s, r) { return s + num(r[m.k]); }, 0)); });
    var shown = out, limited = false;
    if (num(def.limit) > 0 && out.length > num(def.limit)) { shown = out.slice(0, num(def.limit)); limited = true; }
    return { rows: shown, allRows: out, total: total, measures: ms, matched: kept.length, scanned: all.length, limited: limited };
  }
  function csvOf(rep, def) {
    var head = [def.group === 'none' ? 'Row' : labelOf(def.src, def.group)]
      .concat(rep.measures.map(function (m) { return m.l; })).concat(['Records']);
    var lines = [head.map(q).join(',')];
    rep.rows.forEach(function (r) {
      lines.push([q(r.label)].concat(rep.measures.map(function (m) { return r.v[m.k]; })).concat([r.n]).join(','));
    });
    lines.push([q('TOTAL')].concat(rep.measures.map(function (m) { return rep.total.v[m.k]; })).concat([rep.total.n]).join(','));
    return lines.join('\n');
    function q(s) { s = String(s == null ? '' : s); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
  }
  function defaultDef(src) {
    var S = SRC[src];
    return { src: src, group: S.dims[0].k, sort: S.measures[0].k, dir: 'desc', limit: 0, filters: [] };
  }

  /* ═══════════════ 6 · CONSOLIDATION ═══════════════
     Several companies, one set of figures. Three things have to be true for a group total to
     mean anything, and each of them is a rule here rather than a note in a manual. */

  /* Per-company figures, always at group period, ignoring whatever company filter is on screen. */
  function perCompany(DB) {
    return (DB.companies || []).map(function (c) {
      var v = scope(DB, DB.period, c.id);
      return { id: c.id, name: c.name, gstin: String(c.gstin || '').trim(), note: c.note || '',
        gross: grossSales(v), returns: returnsVal(v), net: netSales(v), units: unitsSold(v),
        purchases: purchases(v), wages: wages(v), expenses: expenses(v),
        grossProfit: grossProfit(v), profit: netProfit(v), margin: marginPct(v),
        cash: cash(v), receivable: receivable(v), payable: payable(v), stock: stockValue(v),
        registered: !!String(c.gstin || '').trim() };
    });
  }
  /* Inter-company billing for the period: real to each company, not a sale for the group. */
  function interco(DB) {
    return (DB.intercompany || []).filter(function (x) { return inPeriod(DB, x.month); });
  }
  function intercoTotal(DB) { return sum(interco(DB), function (x) { return x.amount; }); }

  /* The group figures. Sales and purchases are reduced by what the companies billed each
     other; profit is not, because both halves of an internal bill cancel out on their own. */
  function groupFigures(DB) {
    var per = perCompany(DB), el = intercoTotal(DB);
    var add = function (f) { return r2(per.reduce(function (s, c) { return s + c[f]; }, 0)); };
    var netAdded = add('net'), purAdded = add('purchases');
    return {
      companies: per.length,
      registered: per.filter(function (c) { return c.registered; }).length,
      addedNet: netAdded, eliminated: el, net: r2(netAdded - el),
      addedPurchases: purAdded, purchases: r2(purAdded - el),
      gross: r2(add('gross') - el), returns: add('returns'), units: per.reduce(function (s, c) { return s + c.units; }, 0),
      wages: add('wages'), expenses: add('expenses'),
      grossProfit: r2(netAdded - el - (purAdded - el) - add('wages')),
      profit: add('profit'), cash: add('cash'), receivable: add('receivable'),
      payable: add('payable'), stock: add('stock')
    };
  }
  /* THE GATE. A company with no tax registration is a company like any other in the group
     books — and must never be dragged into a tax return it has no business being in. Asking
     for one is refused here, in the engine, not warned about on a screen somebody can ignore. */
  function gstReturn(DB, coId) {
    var c = (DB.companies || []).filter(function (x) { return x.id === coId; })[0];
    if (!c) return { ok: false, reason: 'No such company.' };
    if (!String(c.gstin || '').trim())
      return { ok: false, refused: true, company: c.name,
        reason: c.name + ' has no tax registration of its own, so it cannot file a return. ' +
          'Its figures still count in every group total — that is a different question from filing.' };
    var v = scope(DB, DB.period, coId);
    return { ok: true, company: c.name, gstin: c.gstin, gross: grossSales(v), returns: returnsVal(v),
      net: netSales(v), purchases: purchases(v) };
  }
  /* THE SECOND GATE. A trading name is not a company. Selling under two names on one
     marketplace does not create a second business, and the group must never count it twice. */
  function brandOwner(DB, name) {
    var b = (DB.brands || []).filter(function (x) { return String(x.name).toLowerCase() === String(name).toLowerCase(); })[0];
    return b ? b.co : null;
  }
  function addCompany(DB, rec) {
    var cap = (DB.plan && DB.plan.companyCap) || 20;
    if ((DB.companies || []).length >= cap)
      return { ok: false, refused: true, reason: 'Your ' + ((DB.plan && DB.plan.name) || 'current') +
        ' plan covers ' + cap + ' companies and you already have ' + DB.companies.length +
        '. The software has no limit of its own — moving up a plan raises this.' };
    var id = String(rec.id || '').trim().toUpperCase();
    if (!id) return { ok: false, reason: 'A company needs a short code.' };
    if ((DB.companies || []).some(function (c) { return c.id === id; }))
      return { ok: false, reason: 'The code ' + id + ' is already used by another company.' };
    if (brandOwner(DB, rec.name))
      return { ok: false, refused: true, reason: '"' + rec.name + '" is already a trading name of ' +
        coName(DB, brandOwner(DB, rec.name)) + '. A name you sell under is not a separate company — ' +
        'making it one would count the same sales twice in every group figure.' };
    DB.companies.push({ id: id, name: String(rec.name || '').trim() || id, gstin: String(rec.gstin || '').trim(), note: rec.note || '' });
    return { ok: true, id: id };
  }

  /* ═══════════════ 7 · IMPORT AND EXPORT ═══════════════
     A row that cannot be trusted is never quietly dropped and never quietly fixed. It is
     rejected, counted, and the reason is shown next to it. */
  function validate(DB, key, rec) {
    var t = TBL[key], bad = [];
    t.cols.forEach(function (c) {
      var v = rec[c.k];
      if (c.req && (v === '' || v == null)) bad.push(c.l + ' is required');
      if (c.type === 'num' && v !== '' && v != null && isNaN(v)) bad.push(c.l + ' is not a number');
      if (c.type === 'co' && v && coIds(DB).indexOf(String(v)) < 0 && !(DB.companies || []).some(function (x) { return x.name === v; }))
        bad.push('there is no company "' + v + '" — add the company first');
      if (c.type === 'month' && v && MONTHS.indexOf(String(v)) < 0 && !/^\d{4}-\d{2}$/.test(String(v)))
        bad.push(c.l + ' must look like 2026-07');
    });
    return bad;
  }
  /* Company columns may arrive as a code or as a full name — both are what a person would type. */
  function normalise(DB, key, rec) {
    var t = TBL[key], out = {};
    t.cols.forEach(function (c) {
      var v = rec[c.k];
      if (c.type === 'num') v = num(v);
      else v = String(v == null ? '' : v).trim();
      if (c.type === 'co' && v) {
        var hit = (DB.companies || []).filter(function (x) { return x.id === v || x.name === v; })[0];
        if (hit) v = hit.id;
      }
      out[c.k] = v;
    });
    return out;
  }
  function importRows(DB, key, list) {
    var okRows = [], bad = [];
    (list || []).forEach(function (raw, i) {
      var rec = normalise(DB, key, raw), errs = validate(DB, key, rec);
      if (errs.length) bad.push({ line: i + 2, why: errs.join('; '), row: raw });
      else { rec.id = uid(key.slice(0, 2)); okRows.push(rec); }
    });
    return { rows: okRows, rejected: bad };
  }
  function sheetsOf(DB) {
    var out = {};
    TABLES.forEach(function (t) {
      out[t.label] = [t.cols.map(function (c) { return c.l; })].concat(
        (DB[t.key] || []).map(function (r) { return t.cols.map(function (c) { return r[c.k] == null ? '' : r[c.k]; }); }));
    });
    return out;
  }
  /* Which table does an uploaded sheet belong to? Its name if it matches, otherwise whichever
     table its column headings fit best — so a sheet called "Sheet1" still lands correctly. */
  function guessTable(sheetName, rows) {
    var n = String(sheetName || '').toLowerCase().replace(/[^a-z]/g, '');
    var byName = TABLES.filter(function (t) {
      var l = t.label.toLowerCase().replace(/[^a-z]/g, '');
      return n === l || n === t.key || (n.length > 3 && (n.indexOf(t.key) >= 0 || l.indexOf(n) >= 0));
    })[0];
    if (byName) return byName.key;
    if (!rows || !rows.length) return null;
    var head = (rows[0] || []).map(function (h) { return String(h).toLowerCase().replace(/[^a-z0-9]/g, ''); });
    var best = null, bestScore = 0;
    TABLES.forEach(function (t) {
      var score = t.cols.filter(function (c) {
        return head.indexOf(c.k.toLowerCase()) >= 0 || head.indexOf(c.l.toLowerCase().replace(/[^a-z0-9]/g, '')) >= 0;
      }).length;
      if (score > bestScore) { bestScore = score; best = t.key; }
    });
    return bestScore >= 2 ? best : null;
  }

  return {
    MONTHS: MONTHS, MSHORT: MSHORT, MLBL: MLBL, TABLES: TABLES, TBL: TBL,
    uid: uid, split: split, seed: seed, scope: scope,
    inPeriod: inPeriod, inCo: inCo, months: months, rows: rows, held: held,
    coName: coName, coIds: coIds, icChannel: icChannel, isInternal: isInternal, externalGross: externalGross,
    grossSales: grossSales, returnsVal: returnsVal, netSales: netSales, unitsSold: unitsSold,
    returnRate: returnRate, purchases: purchases, expenses: expenses, wages: wages,
    piecesMade: piecesMade, grossProfit: grossProfit, netProfit: netProfit, marginPct: marginPct,
    opening: opening, cash: cash, receivable: receivable, payable: payable,
    stockValue: stockValue, lowStock: lowStock, byChannel: byChannel,
    monthSeries: monthSeries, growthPct: growthPct, alerts: alerts,
    SRC: SRC, SRCKEYS: SRCKEYS, fieldsOf: fieldsOf, isMeasure: isMeasure, labelOf: labelOf,
    report: report, csvOf: csvOf, defaultDef: defaultDef,
    perCompany: perCompany, interco: interco, intercoTotal: intercoTotal, groupFigures: groupFigures,
    gstReturn: gstReturn, brandOwner: brandOwner, addCompany: addCompany,
    validate: validate, normalise: normalise, importRows: importRows,
    sheetsOf: sheetsOf, guessTable: guessTable
  };
})();
/* Hang the engine off the kernel so the whole of it is inspectable from the console of the
   shipped file. If a figure is ever disputed, anybody can open the browser console and add up
   the records themselves — which is a stronger answer than a support ticket. */
if (typeof Medhava !== 'undefined') Medhava.M01 = M01;
if (typeof module !== 'undefined' && module.exports) module.exports = M01;
