'use strict';
/* SESSIONS — kept deliberately small, and deliberately not clever.
 *
 * In memory, so a restart signs everybody out. That is correct for a demo and wrong for
 * production, and it is written here rather than discovered later: brand/site/stack.js names the
 * sign-in layer and its alternatives, and this is the local stand-in for whichever is chosen.
 *
 * WHAT IT DOES CARRY, BECAUSE EVERYTHING ELSE DEPENDS ON IT
 * The tenant and the company. Every business query is scoped by those two values and by nothing
 * the client sends — a company id arriving in a request body is a request, never an authority.
 */

const crypto = require('node:crypto');

const store = new Map();

function create(fields) {
  const id = crypto.randomBytes(24).toString('base64url');
  const s = { id, at: Date.now(), ...fields };
  store.set(id, s);
  return s;
}

const get = (id) => (id ? store.get(id) || null : null);
const destroy = (id) => store.delete(id);

/* Never hand the raw session to the client: it holds the id, which IS the credential. */
const publicView = (s) => ({
  name: s.name, email: s.email, role: s.role,
  tenantId: s.tenantId, companyId: s.companyId, companies: s.companies,
});

/** Read the cookie without a parser dependency. */
function fromRequest(req) {
  const raw = req.headers.cookie || '';
  const hit = raw.split(';').map((p) => p.trim()).find((p) => p.startsWith('mid='));
  return get(hit ? hit.slice(4) : null);
}

module.exports = { create, get, destroy, publicView, fromRequest };
