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
const rupees = (p) => '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });

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
  [['isolation', 'Isolation — the proof'], ['channels', 'Channels'],
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

/* ── boot ─────────────────────────────────────────────────────────────── */
(async () => {
  const { ok, body } = await api('/api/me');
  if (ok) { ME = body; await start(); } else { await showSignIn(); }
})();
