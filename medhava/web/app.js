'use strict';
/* The shell. Deliberately plain JavaScript — no build step, no framework, nothing to install.
   A first slice whose demonstration requires a toolchain is a first slice nobody runs.

   The permission checks here are for LAYOUT ONLY. Every one of them is enforced again on the
   server and a third time by the database, which is where security actually lives. If this file
   were replaced wholesale by a hostile one, no business record would be reachable that is not
   reachable now. */

const api = async (path, opts) => {
  const r = await fetch(path, { headers: { 'content-type': 'application/json' }, ...opts });
  const body = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, body };
};
const el = (t, c, txt) => { const n = document.createElement(t); if (c) n.className = c;
  if (txt !== undefined) n.textContent = txt; return n; };
/* PAISE ARE SHOWN WHENEVER THERE ARE ANY, AND THIS IS NOT A STYLE CHOICE.
   The first version rounded to whole rupees. The first real invoice it drew said CGST ₹672 where
   the figure is ₹671.82, and Total ₹12,541 where the customer owes ₹12,540.64 — a screen rounding
   away the exact number in a system whose whole argument is that money is exact integer paise.
   On a list of orders the rounding was invisible and harmless; on a document that says what
   somebody owes it is simply wrong. Whole amounts still print whole, so nothing gains a
   decorative ".00". */
const rupees = (p) => {
  const n = Number(p) || 0;
  const frac = n % 100 === 0 ? 0 : 2;
  return '₹' + (n / 100).toLocaleString('en-IN',
    { minimumFractionDigits: frac, maximumFractionDigits: frac });
};

let ME = null, MODULES = [], VIEW = 'isolation';

/* ── sign in ──────────────────────────────────────────────────────────── */
async function showSignIn() {
  const { body } = await api('/api/accounts');
  const box = document.getElementById('accounts');
  box.innerHTML = '';
  body.forEach((a) => {
    const b = el('button', 'acct');
    const left = el('div');
    left.append(el('b', null, a.name), el('span', null, a.email));
    b.append(left, el('span', null, a.role));
    b.onclick = () => signIn(a.email);
    box.append(b);
  });
}

async function signIn(email) {
  const { ok, body } = await api('/api/session', { method: 'POST', body: JSON.stringify({ email }) });
  if (!ok) { document.getElementById('signin-err').textContent = body.error || 'could not sign in'; return; }
  ME = body;
  await start();
}

/* ── shell ────────────────────────────────────────────────────────────── */
async function start() {
  document.getElementById('signin').hidden = true;
  document.getElementById('app').hidden = false;
  document.getElementById('user').textContent = ME.name;

  const sel = document.getElementById('company');
  sel.innerHTML = '';
  /* With no company chosen the selector must SAY so. Showing the first company as selected while
     the session carries none is the screen telling the reader something the server does not
     believe, and every figure under it would then look like that company's. */
  if (!ME.companyId) {
    const o = el('option', null, 'choose a company…'); o.value = ''; o.selected = true;
    sel.append(o);
  }
  ME.companies.forEach((c) => {
    const o = el('option', null, c.name); o.value = c.id;
    if (c.id === ME.companyId) o.selected = true;
    sel.append(o);
  });
  sel.onchange = async () => {
    if (!sel.value) return;                    // the "choose a company…" placeholder
    const { ok, body } = await api('/api/company',
      { method: 'POST', body: JSON.stringify({ companyId: sel.value }) });
    /* start(), not render(): the placeholder has to come back out of the list once a company is
       chosen, and that is the header's job rather than the view's. */
    if (ok) { ME = body; await start(); }
  };
  document.getElementById('out').onclick = async () => {
    await api('/api/session', { method: 'DELETE' });
    location.reload();
  };

  if (!MODULES.length) MODULES = (await api('/api/modules')).body.modules;
  buildNav();
  render();
}

function buildNav() {
  const nav = document.getElementById('nav');
  nav.innerHTML = '';
  nav.append(el('div', 'sec', 'The platform'));
  [['isolation', 'Isolation — the proof'], ['sell', 'Record a sale'], ['channels', 'Channels'],
   ['products', 'Products'], ['orders', 'Orders']].forEach(([id, label]) => {
    const b = el('button', VIEW === id ? 'on' : '', label);
    b.onclick = () => { VIEW = id; buildNav(); render(); };
    nav.append(b);
  });

  nav.append(el('div', 'sec', `${MODULES.length} modules`));
  MODULES.forEach((m) => {
    const b = el('button', VIEW === 'm' + m.n ? 'on' : '');
    b.append(el('span', 'num', m.n), document.createTextNode(m.name));
    b.onclick = () => { VIEW = 'm' + m.n; buildNav(); render(); };
    nav.append(b);
    if (VIEW === 'm' + m.n) nav.append(el('div', 'apps', m.apps.join(' · ')));
  });
}

/* ── views ────────────────────────────────────────────────────────────── */
const main = () => document.getElementById('main');

function head(crumb, title, lede) {
  main().innerHTML = '';
  main().append(el('div', 'crumb', crumb), el('h1', null, title));
  if (lede) main().append(el('p', 'lede', lede));
}

function table(cols, rows) {
  const t = el('table'), thead = el('thead'), tr = el('tr');
  cols.forEach((c) => { const th = el('th', c.n ? 'n' : '', c.label); tr.append(th); });
  thead.append(tr); t.append(thead);
  const tb = el('tbody');
  rows.forEach((r) => {
    const line = el('tr');
    cols.forEach((c) => line.append(el('td', c.n ? 'n' : '', c.get(r))));
    tb.append(line);
  });
  t.append(tb);
  return t;
}

/* Every view runs inside this. A view that throws must not leave the reader looking at a heading
   with nothing under it — which is what happened, and which reads as "this software is broken"
   with no way to find out why. The message goes on the screen. */
async function render() {
  try { await draw(); }
  catch (e) {
    const box = el('div', 'broke');
    box.append(el('b', null, 'This screen could not be drawn.'));
    box.append(document.createTextNode(String(e && e.message || e)));
    main().append(box);
    throw e;                      // still a real error in the console, for whoever is debugging
  }
}

async function draw() {
  const co = ME.companies.find((c) => c.id === ME.companyId);
  const name = co ? co.name : 'no company';

  /* AN ACCOUNT WITH TWO COMPANIES STARTS WITH NEITHER, deliberately: the server will not guess
     which set of books somebody meant. So this is the first screen that account sees, and until
     it was driven in a browser it did not exist — every view called an API that correctly
     answered 409, and the reader got a heading over an empty page. The API was right. The shell
     had no state for being right in. */
  if (!ME.companyId) {
    head('Signed in', 'Which company?',
      `${ME.name} has access to ${ME.companies.length} companies. They are separate sets of ` +
      'books and nothing is shown until one is chosen — an unset company is not "all of them".');
    const box = el('div', 'choose');
    ME.companies.forEach((c) => {
      const b = el('button');
      b.append(el('b', null, c.name), el('span', null, c.code));
      b.onclick = async () => {
        const r = await api('/api/company', { method: 'POST', body: JSON.stringify({ companyId: c.id }) });
        if (r.ok) { ME = r.body; await start(); }
      };
      box.append(b);
    });
    main().append(box);
    return;
  }

  if (VIEW === 'isolation') {
    const { body } = await api('/api/isolation');
    head('The platform', 'Isolation, shown rather than promised',
      'Most software asks you to take this on trust, because the only honest demonstration is ' +
      'showing what you cannot see — and a screen showing nothing looks like a screen that is ' +
      'broken. So both numbers are here.');
    const proof = el('div', 'proof');
    body.counts.forEach((c) => {
      const row = el('div', 'row');
      row.append(el('div', 'label', c.what));
      const a = el('div'); a.append(el('div', 'big you', String(c.visibleToYou)),
        el('span', 'cap', 'visible to ' + name));
      const b = el('div'); b.append(el('div', 'big all', String(c.inTheDatabase)),
        el('span', 'cap', 'actually in the database'));
      row.append(a, b);
      proof.append(row);
    });
    main().append(proof);
    main().append(el('div', 'callout', body.how));
    const u = body.unsetContext;
    main().append(el('div', 'callout warn',
      u.refused
        ? 'With no company set at all, the database refuses the query outright rather than ' +
          'answering it — PostgreSQL says: ' + u.why + '. An unset company is never read as ' +
          '“all of them”, and it never quietly returns an empty list either, because an empty ' +
          'list is indistinguishable from a company that genuinely has no orders.'
        : 'With no company set at all, the query returns ' + u.rows + ' rows. An unset context ' +
          'matches nothing — it is not read as "everything", which is the defect that looks ' +
          'like a working system.'));
    main().append(el('p', 'muted',
      `${body.tenantsOnThisInstallation} unrelated businesses are running on this one installation.`));
    return;
  }

  if (VIEW === 'channels') {
    const { body } = await api('/api/channels');
    head(name, 'Channels', 'Every route an order can reach you by. A channel is a row and ' +
      'nothing counts them — two companies may both sell on the same marketplace, and those are ' +
      'two rows whose figures never merge.');
    main().append(table([
      { label: 'Code', get: (r) => r.code },
      { label: 'Name', get: (r) => r.name },
      { label: 'Kind', get: (r) => r.kind },
    ], body.channels));
    return;
  }

  if (VIEW === 'products') {
    const { body } = await api('/api/products');
    head(name, 'Products', 'Read through the same policy as everything else — this list is this ' +
      'company’s and the database will not serve any other.');
    main().append(table([
      { label: 'Code', get: (r) => r.code },
      { label: 'Name', get: (r) => r.name },
      { label: 'Set type', get: (r) => r.set || '—' },
      { label: 'MRP', n: true, get: (r) => rupees(r.mrpPaise) },
    ], body.products));
    return;
  }

  if (VIEW === 'orders') {
    const { body } = await api('/api/orders');
    head(name, 'Orders', 'Money is stored as whole paise and formatted here. It is never a ' +
      'floating-point number anywhere in the system.');
    main().append(table([
      { label: 'Number', get: (r) => r.number },
      { label: 'Channel', get: (r) => r.channel },
      { label: 'Type', get: (r) => r.type },
      { label: 'Total', n: true, get: (r) => rupees(r.totalPaise) },
    ], body.orders));
    const sum = body.orders.reduce((s, o) => s + o.totalPaise, 0);
    main().append(el('p', 'muted', `${body.orders.length} orders · ${rupees(sum)} — this company only.`));
    return;
  }

  if (VIEW === 'sell') { await sellScreen(name); return; }

  /* A module page. Honest about what it is: the app list is real and read from the canonical
     source; the screens behind it are specified and not built. Saying so on the screen is the
     difference between a plan and a pretence. */
  const m = MODULES.find((x) => 'm' + x.n === VIEW);
  if (!m) return;
  head(`Module ${m.n}${m.spine ? ' · the spine' : ''}`, m.name,
    `${m.apps.length} apps belong to this module.`);
  const list = el('table');
  const tb = el('tbody');
  m.apps.forEach((a) => { const tr = el('tr'); tr.append(el('td', null, a)); tb.append(tr); });
  list.append(tb);
  main().append(list);
  const spec = el('div', 'spec');
  spec.append(el('b', null, 'These screens are specified and not built.'));
  spec.append(document.createTextNode(
    'The module list, the app names and their order are read from brand/site/modules.js, the one ' +
    'canonical list — so this page cannot drift from the specification. What is running today is ' +
    'the platform underneath: the schema, the isolation, the sessions and the company scope. ' +
    'MEDHAVA_PLAN_OF_ACTION.md carries the rules each of these apps must satisfy.'));
  main().append(spec);
}

/* ── module 05 · recording a sale ─────────────────────────────────────────
   The first screen in this platform that CREATES something. Everything else reads.

   The totals shown while typing are an ESTIMATE and say so on screen. The figures that count are
   the ones the server returns after posting, because the server computes them from the item's own
   GST rate and the company's own state — and a screen that quietly disagrees with the invoice is
   worse than a screen that shows no total at all. */
async function sellScreen(name) {
  const { body: cat } = await api('/api/items');
  const { body: chans } = await api('/api/channels');
  head(name, 'Record a sale',
    'This writes. One transaction moves the stock, raises the invoice and posts the ledger — ' +
    'all of it or none of it, which is rule R05.2, and R05.3 is what happens when the last part ' +
    'refuses: the stock never moved.');

  const form = el('div', 'sell');
  const row = (label, control) => {
    const r = el('label', 'field');
    r.append(el('span', null, label), control);
    return r;
  };

  const channel = el('select');
  chans.channels.forEach((c) => {
    const o = el('option', null, `${c.code} — ${c.name}`); o.value = c.code; channel.append(o);
  });
  const type = el('select');
  [['b2c', 'Retail (B2C)'], ['b2b', 'Wholesale (B2B)'], ['pos', 'Counter (POS)'],
   ['export', 'Export']].forEach(([v, t]) => {
    const o = el('option', null, t); o.value = v; type.append(o);
  });
  const state = el('input'); state.placeholder = 'buyer state code, e.g. 27'; state.value = '';

  form.append(row('Channel', channel), row('Type', type), row('Buyer state', state));
  main().append(form);

  /* The lines. Deliberately plain rows rather than a grid component — this is the first write
     screen and what matters is that it posts correctly, not that it looks like a spreadsheet. */
  const lines = el('div', 'lines');
  const addLine = () => {
    const r = el('div', 'line');
    const sel = el('select');
    const none = el('option', null, '— choose an item —'); none.value = ''; sel.append(none);
    cat.items.forEach((i) => {
      const o = el('option', null, `${i.sku} · ${i.name} · ${i.gstRate}% GST`);
      o.value = i.id; sel.append(o);
    });
    const qty = el('input'); qty.type = 'number'; qty.min = '1'; qty.value = '1';
    const rate = el('input'); rate.type = 'number'; rate.min = '0'; rate.placeholder = 'rate in ₹';
    sel.onchange = () => {
      const it = cat.items.find((i) => i.id === sel.value);
      if (it && !rate.value) rate.value = String(it.mrpPaise / 100);
      estimate();
    };
    qty.oninput = estimate; rate.oninput = estimate;
    const drop = el('button', 'link', 'remove');
    drop.onclick = () => { r.remove(); estimate(); };
    r.append(sel, qty, rate, drop);
    r._read = () => ({ itemId: sel.value, qty: Number(qty.value),
                       ratePaise: Math.round(Number(rate.value || 0) * 100) });
    lines.append(r);
    estimate();
  };

  const running = el('p', 'muted');
  function estimate() {
    let sub = 0, tax = 0;
    [...lines.children].forEach((r) => {
      const l = r._read();
      const it = cat.items.find((i) => i.id === l.itemId);
      if (!it || !(l.qty > 0) || !(l.ratePaise >= 0)) return;
      const taxable = l.qty * l.ratePaise;
      sub += taxable;
      if (type.value !== 'export') tax += Math.round((taxable * it.gstRate) / 100);
    });
    running.textContent = sub
      ? `Estimate while you type — ${rupees(sub)} + ${rupees(tax)} tax = ${rupees(sub + tax)}. ` +
        `The invoice figures come from the server.`
      : 'Add a line.';
  }
  type.onchange = estimate;

  const add = el('button', 'link', '+ add a line');
  add.onclick = addLine;
  main().append(lines, add, running);

  const err = el('div');
  const post = el('button', 'primary', 'Post the sale');
  post.onclick = async () => {
    err.innerHTML = '';
    post.disabled = true;
    const payload = {
      channelCode: channel.value, orderType: type.value,
      customerState: state.value.trim() || undefined,
      lines: [...lines.children].map((r) => r._read()),
    };
    const { ok, status, body } = await api('/api/orders',
      { method: 'POST', body: JSON.stringify(payload) });
    post.disabled = false;
    if (!ok) {
      /* The rule that refused it is named on the screen. "Invalid input" teaches nobody
         anything; "R05.15 — line 2 has quantity 0" tells them what to change and why. */
      const box = el('div', 'broke');
      box.append(el('b', null, body.rule ? `Refused by rule ${body.rule}` : `Refused (${status})`));
      box.append(document.createTextNode(body.error || 'no reason given'));
      err.append(box);
      return;
    }
    showPosted(body, err);
    [...lines.children].forEach((r) => r.remove());
    estimate();
  };
  main().append(post, err);
  addLine();
}

function showPosted(r, into) {
  const box = el('div', 'posted');
  box.append(el('b', null, `Posted — order ${r.orderNumber}, invoice ${r.invoiceNumber}`));
  box.append(table([
    { label: 'SKU', get: (l) => l.sku },
    { label: 'Item', get: (l) => l.name },
    { label: 'Qty', n: true, get: (l) => String(l.qty) },
    { label: 'Rate', n: true, get: (l) => rupees(l.ratePaise) },
    { label: 'GST', n: true, get: (l) => l.gstRate + '%' },
    { label: 'Amount', n: true, get: (l) => rupees(l.amountPaise) },
  ], r.lines));
  const tax = r.igstPaise
    ? `IGST ${rupees(r.igstPaise)}`
    : `CGST ${rupees(r.cgstPaise)} + SGST ${rupees(r.sgstPaise)}`;
  box.append(el('p', null,
    `Taxable ${rupees(r.subtotalPaise)} · ${tax} · Total ${rupees(r.totalPaise)}` +
    (r.exportUnderLut ? ' · export under LUT, so no GST (R05.16)' : '')));
  box.append(el('p', 'muted',
    'Stock moved, invoice raised and ledger posted in one transaction. Open Orders to see it, ' +
    'or Isolation to confirm the other company still cannot.'));
  into.append(box);
}

/* ── boot ─────────────────────────────────────────────────────────────── */
(async () => {
  const { ok, body } = await api('/api/me');
  if (ok) { ME = body; await start(); } else { await showSignIn(); }
})();
