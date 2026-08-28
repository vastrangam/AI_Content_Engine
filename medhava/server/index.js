'use strict';
/* THE MEDHAVA SERVER.
 *
 *   npm start   →  http://localhost:4000
 *
 * Plain Node. No framework, and no dependency this repository did not already have: the whole
 * point of the first slice is that it runs on a laptop with nothing installed, so somebody can
 * open it in a browser and see the platform's central claim being enforced rather than described.
 *
 * WHAT THIS IS AND IS NOT
 * It is the first vertical slice of the platform: a real schema, real row-level isolation, real
 * sessions, the module list read from its canonical source, and screens over the top. It is NOT
 * the 113 apps — those are specified in MEDHAVA_PLAN_OF_ACTION.md and not built, and nothing here
 * pretends otherwise.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const db = require('./db.js');
const sessions = require('./auth.js');
const { ROUTES, json } = require('./api.js');
const { seed } = require('../seed/demo.js');

const WEB = path.join(__dirname, '..', 'web');
const PORT = Number(process.env.PORT || 4000);

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
                '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml',
                '.json': 'application/json; charset=utf-8' };

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      /* A body limit is not paranoia, it is the difference between a slow request and a dead
         process. Small because nothing here posts anything large. */
      if (size > 1_000_000) { reject(new Error('body too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch (e) { reject(new Error('body is not json')); }
    });
    req.on('error', reject);
  });
}

function serveStatic(res, urlPath) {
  const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const file = path.join(WEB, rel);
  /* Never serve outside the web directory, whatever the URL says. */
  if (!file.startsWith(WEB)) { res.writeHead(403).end('no'); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'content-type': 'text/plain' }).end('not found'); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const key = `${req.method} ${url.pathname}`;

  if (!url.pathname.startsWith('/api/')) return serveStatic(res, url.pathname);

  const handler = ROUTES[key];
  if (!handler) return json(res, 404, { error: `no route ${key}` });

  const ctx = { session: sessions.fromRequest(req), url };
  try {
    const body = req.method === 'POST' || req.method === 'PUT' ? await readBody(req) : {};
    await handler(req, res, ctx, ctx, body);
  } catch (e) {
    /* Explicit, and logged. An error swallowed into a 200 is the failure this whole design is
       written against. */
    console.error(`  ${key} failed:`, e.message);
    if (!res.headersSent) json(res, 500, { error: e.message });
  }
});

async function main() {
  process.stdout.write('Medhava — loading the schema into PostgreSQL... ');
  const t0 = Date.now();
  await db.open();
  const result = await seed();
  const ms = Date.now() - t0;

  const info = await db.godView(
    `SELECT (SELECT count(*)::int FROM information_schema.tables WHERE table_schema='public') AS tables,
            (SELECT count(*)::int FROM pg_policies WHERE schemaname='public') AS policies,
            (SELECT count(*)::int FROM tenants) AS tenants,
            (SELECT count(*)::int FROM companies) AS companies,
            version() AS v`);
  const i = info[0];

  console.log(`done in ${ms}ms`);
  console.log('');
  console.log(`  ${String(i.v).split(',')[0]}`);
  console.log(`  ${i.tables} tables · ${i.policies} row-level policies active`);
  console.log(`  ${i.tenants} businesses · ${i.companies} companies` +
              `${result.already ? ' (already seeded)' : ' (seeded)'}`);
  console.log('');

  server.listen(PORT, () => {
    console.log(`  open        http://localhost:${PORT}`);
    console.log(`  sign in as  owner@anjali.demo   (two companies, apparel)`);
    console.log(`              owner@deccan.demo   (one company, steel)`);
    console.log('');
    console.log('  The Isolation page shows what this company can see against what the database');
    console.log('  actually holds. The gap is enforced by PostgreSQL, not by application code.');
    console.log('');
  });
}

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\n  Port ${PORT} is already in use. Something else is listening there —`);
    console.error(`  stop it, or start this with a different port:\n`);
    console.error(`      PORT=4100 npm start\n`);
    process.exit(1);
  }
  throw e;
});

if (require.main === module) {
  main().catch((e) => { console.error('\nMedhava failed to start:', e.message); process.exit(1); });
}

module.exports = { server, main, PORT };
