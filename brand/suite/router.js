/* Medhava — Provider Router & Cost Guard.

   WHY THIS EXISTS
   providers.js *declares* that no capability depends on one outside service.
   Declaring it is not enforcing it. On the day Razorpay times out, or an AI
   key hits its quota at 11pm, a declaration does nothing — something has to
   actually walk down the list, notice the failure, stop hammering the dead
   provider, and land on the option that needs nobody's cloud.

   That is this file. It adds four mechanisms on top of the capability model:

     1. CASCADE      an ordered fallback list per capability, always ending on
                     an option that costs nothing and needs nothing connected.
     2. BREAKER      a provider that keeps failing is tripped OPEN and skipped
                     entirely until a cooldown passes — then one trial call
                     decides whether it comes back.
     3. BACKOFF      retries within one provider wait base·2^n, so a service
                     that is merely busy gets a chance without being flooded.
     4. COST GUARD   every attempt's cost is recorded in integer paise against
                     a ceiling. Over the ceiling the paid provider is REFUSED,
                     not warned about — the cascade then falls to a free one.

   The last point is the one worth reading twice. Because every capability is
   guaranteed a built-in or by-hand option (providers.js tests this at every
   launch), and because those cost zero, a blown budget can never stop the
   business working. It can only stop the business spending.

   No network calls live in here. The caller hands in the function that does
   the real work; this decides who it runs against and whether it may run at
   all. That is what makes it testable, and it is tested — `--selftest`.
*/
(function () {
  var Providers = (typeof require !== 'undefined')
    ? require('./providers.js')
    : (typeof window !== 'undefined' ? window.MedhavaProviders : null);

  /* ---- defaults -------------------------------------------------------- */

  var DEFAULTS = {
    retries: 3,            /* attempts per provider, including the first */
    backoffMs: 200,        /* first wait; doubles each retry */
    breakerFails: 3,       /* consecutive failures that trip a provider open */
    breakerCooldownMs: 60000,
    ceilingPaise: null     /* null = no ceiling; a number = refuse beyond it */
  };

  /* A provider that ships inside Medhava, or that a person does by hand,
     costs nothing to call. Everything else costs whatever the caller says it
     costs — we never invent a price. */
  var FREE_KINDS = { 'built-in': 1, 'manual': 1 };

  function isFree(p) { return !!FREE_KINDS[p.kind]; }

  /* ---- the router ------------------------------------------------------ */

  /** create({ now, sleep, ceilingPaise, ... })
   *  `now` and `sleep` are injected so the breaker's clock and the backoff's
   *  waiting can be driven instantly in a test instead of really sleeping.
   *  Nothing else in here reads the wall clock. */
  function create(opts) {
    opts = opts || {};
    var cfg = {};
    Object.keys(DEFAULTS).forEach(function (k) {
      cfg[k] = (opts[k] === undefined || opts[k] === null) && k !== 'ceilingPaise'
        ? DEFAULTS[k] : (opts[k] === undefined ? DEFAULTS[k] : opts[k]);
    });

    var now = opts.now || function () { return Date.now(); };
    var sleep = opts.sleep || function (ms) {
      return new Promise(function (r) { setTimeout(r, ms); });
    };

    /* breaker state, keyed "<capability>/<provider>" — a provider that is
       flaky for images is not therefore flaky for text. */
    var breakers = {};
    /* spend, in integer paise. Never a float: paise are money. */
    var spend = { total: 0, byCap: {}, byProvider: {} };
    var log = [];

    function key(capId, pid) { return capId + '/' + pid; }

    function breaker(capId, pid) {
      var k = key(capId, pid);
      if (!breakers[k]) breakers[k] = { fails: 0, openedAt: null, trips: 0 };
      return breakers[k];
    }

    /** OPEN   = skip it, the cooldown has not passed
     *  HALF   = cooldown passed, allow exactly one trial call
     *  CLOSED = healthy */
    function breakerState(capId, pid) {
      var b = breaker(capId, pid);
      if (b.openedAt === null) return 'CLOSED';
      return (now() - b.openedAt >= cfg.breakerCooldownMs) ? 'HALF' : 'OPEN';
    }

    function recordSuccess(capId, pid) {
      var b = breaker(capId, pid);
      b.fails = 0; b.openedAt = null;
    }

    function recordFailure(capId, pid) {
      var b = breaker(capId, pid);
      b.fails += 1;
      if (b.fails >= cfg.breakerFails && b.openedAt === null) {
        b.openedAt = now(); b.trips += 1;
      }
    }

    /** The ordered list of providers to try for a capability.
     *
     *  Order: the one you chose first, then the paid options as declared,
     *  then the free ones — so the cascade bottoms out somewhere that needs
     *  nothing connected and charges nothing.
     *
     *  Your choice is hoisted to the front even when it is a free one. That
     *  matters: running a paid provider ahead of an explicit free choice
     *  would spend money nobody authorised. The side effect is that for the
     *  two capabilities declaring exactly one free option (messaging, email)
     *  a free-by-default choice leaves the tail paid — which is harmless,
     *  because the free option was already tried first, at position zero.
     *  The invariant that actually protects the business is weaker and
     *  unconditional: every cascade CONTAINS a zero-cost option, so no spend
     *  ceiling can ever exhaust one. Both are asserted in the self-test. */
    function cascade(capId, activeId) {
      var c = Providers.cap(capId);
      if (!c) return [];
      var active = activeId || Providers.defaultOf(capId);
      var paid = [], free = [];
      c.providers.forEach(function (p) {
        (isFree(p) ? free : paid).push(p);
      });
      var ordered = paid.concat(free);
      /* the chosen provider goes to the front wherever it sits */
      var chosen = ordered.filter(function (p) { return p.id === active; });
      var rest = ordered.filter(function (p) { return p.id !== active; });
      return chosen.concat(rest);
    }

    /** Would spending this much break the ceiling? */
    function wouldExceed(paise) {
      if (cfg.ceilingPaise === null || cfg.ceilingPaise === undefined) return false;
      return spend.total + paise > cfg.ceilingPaise;
    }

    function charge(capId, pid, paise) {
      spend.total += paise;
      spend.byCap[capId] = (spend.byCap[capId] || 0) + paise;
      spend.byProvider[pid] = (spend.byProvider[pid] || 0) + paise;
    }

    /** run(capId, work, options)
     *
     *  `work(provider, attemptNo)` does the real thing and may throw or
     *  reject. `options.costOf(provider)` returns the cost of ONE attempt in
     *  integer paise (default: 0 for built-in/manual, else options.costPaise
     *  or 0 — we never guess a price).
     *
     *  Resolves { ok, provider, value, attempts, refused, skipped }.
     *  Never throws for a provider failure: the whole point is that the
     *  caller gets an answer about what happened, not an exception. */
    function run(capId, work, options) {
      options = options || {};
      var list = cascade(capId, options.activeId);
      var attempts = [];
      var refused = [];
      var skipped = [];

      var costOf = options.costOf || function (p) {
        return isFree(p) ? 0 : (options.costPaise || 0);
      };

      function tryProvider(i) {
        if (i >= list.length) {
          return Promise.resolve({
            ok: false, provider: null, value: null,
            attempts: attempts, refused: refused, skipped: skipped,
            reason: 'every provider for "' + capId + '" was exhausted'
          });
        }
        var p = list[i];
        var state = breakerState(capId, p.id);

        if (state === 'OPEN') {
          skipped.push({ provider: p.id, why: 'breaker open' });
          return tryProvider(i + 1);
        }

        var cost = costOf(p);
        if (cost > 0 && wouldExceed(cost)) {
          /* Refused, not warned. The cascade continues to a cheaper or free
             option — which is why a blown budget slows spending, not work. */
          refused.push({
            provider: p.id, costPaise: cost,
            spentPaise: spend.total, ceilingPaise: cfg.ceilingPaise,
            why: 'would exceed the spend ceiling'
          });
          return tryProvider(i + 1);
        }

        /* a HALF-open provider gets exactly one trial call, not a retry run */
        var budget = (state === 'HALF') ? 1 : cfg.retries;

        function attempt(n) {
          return Promise.resolve()
            .then(function () { return work(p, n); })
            .then(function (value) {
              if (cost > 0) charge(capId, p.id, cost);
              attempts.push({ provider: p.id, attempt: n, ok: true, costPaise: cost });
              recordSuccess(capId, p.id);
              log.push({ cap: capId, provider: p.id, ok: true, at: now() });
              return {
                ok: true, provider: p, value: value,
                attempts: attempts, refused: refused, skipped: skipped
              };
            })
            .catch(function (err) {
              /* A failed call to a metered service still costs money at some
                 providers, but we do not assume that — charging for a failure
                 we cannot verify would be inventing a number. Only successes
                 are charged, and options.chargeFailures flips that. */
              if (cost > 0 && options.chargeFailures) charge(capId, p.id, cost);
              attempts.push({
                provider: p.id, attempt: n, ok: false,
                error: (err && err.message) || String(err)
              });
              recordFailure(capId, p.id);
              log.push({ cap: capId, provider: p.id, ok: false, at: now() });
              if (n + 1 >= budget) return tryProvider(i + 1);
              var wait = cfg.backoffMs * Math.pow(2, n);
              return Promise.resolve(sleep(wait)).then(function () {
                return attempt(n + 1);
              });
            });
        }
        return attempt(0);
      }

      return tryProvider(0);
    }

    return {
      cfg: cfg,
      cascade: cascade,
      run: run,
      breakerState: breakerState,
      breakers: function () { return breakers; },
      spend: function () { return { total: spend.total,
        byCap: JSON.parse(JSON.stringify(spend.byCap)),
        byProvider: JSON.parse(JSON.stringify(spend.byProvider)) }; },
      log: function () { return log.slice(); },
      /* the ceiling can be raised or lowered while running, because a real
         business changes its mind about money mid-month */
      setCeiling: function (paise) { cfg.ceilingPaise = paise; }
    };
  }

  /* ---- self-test ------------------------------------------------------- */

  function selftest() {
    var pass = 0, fail = 0;
    function t(name, cond) {
      if (cond) { pass++; console.log('  ok   ' + name); }
      else { fail++; console.log('  FAIL ' + name); }
    }
    var chain = Promise.resolve();
    function step(fn) { chain = chain.then(fn); return chain; }

    /* a sleep that does not sleep, and a clock we drive by hand */
    var clock = { t: 0 };
    var waited = [];
    function mk(extra) {
      var o = { now: function () { return clock.t; },
                sleep: function (ms) { waited.push(ms); clock.t += ms; return Promise.resolve(); } };
      Object.keys(extra || {}).forEach(function (k) { o[k] = extra[k]; });
      return create(o);
    }

    console.log('Provider Router & Cost Guard — self-test\n');

    /* 1 · cascade shape */
    step(function () {
      var R = mk();
      var c = R.cascade('ai_text', 'claude');
      t('the chosen provider is tried first', c[0].id === 'claude');
      t('the cascade covers every declared provider',
        c.length === Providers.cap('ai_text').providers.length);
      var last = c[c.length - 1];
      t('the cascade ends on an option needing nothing connected',
        last.kind === 'built-in' || last.kind === 'manual');
      /* The property that makes a blown budget survivable. Unconditional:
         a spend ceiling can never exhaust a cascade, for any capability,
         under any choice of provider. */
      var neverExhausted = Providers.CAPS.every(function (cap) {
        return cap.providers.every(function (chosen) {
          return R.cascade(cap.id, chosen.id).some(isFree);
        });
      });
      t('no spend ceiling can exhaust any cascade (a free option is always in it)',
        neverExhausted);
      /* And whenever the choice is a paid one — the case where a budget or an
         outage can actually strand you — the cascade ends on a free option. */
      var paidChoicesEndFree = Providers.CAPS.every(function (cap) {
        return cap.providers.filter(function (p) { return !isFree(p); })
          .every(function (chosen) {
            var l = R.cascade(cap.id, chosen.id);
            return isFree(l[l.length - 1]);
          });
      });
      t('choosing a paid provider always leaves a free one at the end of the cascade',
        paidChoicesEndFree);
    });

    /* 2 · fallback on failure */
    step(function () {
      var R = mk();
      var seen = [];
      return R.run('ai_text', function (p) {
        seen.push(p.id);
        if (p.id !== 'templates') throw new Error('dead');
        return 'written by ' + p.id;
      }, { activeId: 'claude' }).then(function (r) {
        t('a total outage still returns a result', r.ok === true);
        t('the result came from the built-in option', r.provider.id === 'templates');
        t('the chosen provider was tried before the fallback', seen[0] === 'claude');
      });
    });

    /* 3 · backoff doubles */
    step(function () {
      waited.length = 0; clock.t = 0;
      var R = mk({ retries: 4, backoffMs: 100 });
      var n = 0;
      return R.run('ai_image', function (p) {
        if (p.id === 'flux') { n++; throw new Error('busy'); }
        return 'ok';
      }, { activeId: 'flux' }).then(function () {
        t('retries happen within one provider before moving on', n === 4);
        t('backoff doubles each retry (100, 200, 400)',
          waited.slice(0, 3).join(',') === '100,200,400');
      });
    });

    /* 4 · a retried provider that recovers is used, not abandoned */
    step(function () {
      var R = mk({ retries: 3, backoffMs: 10 });
      var n = 0;
      return R.run('ai_text', function (p) {
        if (p.id === 'claude') { n++; if (n < 3) throw new Error('rate limited'); return 'recovered'; }
        return 'fallback';
      }, { activeId: 'claude' }).then(function (r) {
        t('a provider that recovers mid-retry is kept', r.provider.id === 'claude');
        t('its value is the recovered one', r.value === 'recovered');
      });
    });

    /* 5 · the breaker trips, skips, then reopens after the cooldown */
    step(function () {
      clock.t = 0;
      var R = mk({ retries: 1, backoffMs: 10, breakerFails: 3, breakerCooldownMs: 60000 });
      var calls = 0;
      function bad() {
        return R.run('ai_text', function (p) {
          if (p.id === 'claude') { calls++; throw new Error('down'); }
          return 'fallback';
        }, { activeId: 'claude' });
      }
      return bad().then(bad).then(bad).then(function () {
        t('three consecutive failures trip the breaker open',
          R.breakerState('ai_text', 'claude') === 'OPEN');
        var before = calls;
        return bad().then(function (r) {
          t('an open provider is skipped, not called', calls === before);
          t('the work still succeeded elsewhere', r.ok === true);
          t('the skip is reported, not silent',
            r.skipped.some(function (s) { return s.provider === 'claude'; }));
          clock.t += 60001;
          t('after the cooldown it goes half-open',
            R.breakerState('ai_text', 'claude') === 'HALF');
          return R.run('ai_text', function (p) { return 'healthy from ' + p.id; },
            { activeId: 'claude' });
        }).then(function (r) {
          t('a half-open provider that works is restored', r.provider.id === 'claude');
          t('the breaker closes again after a success',
            R.breakerState('ai_text', 'claude') === 'CLOSED');
        });
      });
    });

    /* 6 · the cost guard refuses rather than warns */
    step(function () {
      var R = mk({ retries: 1, ceilingPaise: 5000 });   /* ₹50.00 */
      var used = [];
      function call() {
        return R.run('ai_image', function (p) { used.push(p.id); return 'img'; },
          { activeId: 'flux', costPaise: 2000 });        /* ₹20.00 a shot */
      }
      return call().then(call).then(function () {
        t('spending is tracked in integer paise', R.spend().total === 4000);
        return call();
      }).then(function (r) {
        t('the third call would break the ceiling and is refused',
          r.refused.some(function (x) { return x.provider === 'flux'; }));
        t('the refusal names the ceiling it protected',
          r.refused[0].ceilingPaise === 5000);
        t('work still completed on a free provider', r.ok === true);
        t('the free provider costs nothing', r.provider.kind === 'built-in' ||
          r.provider.kind === 'manual');
        t('the ceiling was never exceeded', R.spend().total <= 5000);
        t('spend is still an integer number of paise',
          Number.isInteger(R.spend().total));
      });
    });

    /* 7 · raising the ceiling lets paid work resume */
    step(function () {
      var R = mk({ retries: 1, ceilingPaise: 1000 });
      return R.run('ai_image', function () { return 'a'; },
        { activeId: 'flux', costPaise: 2000 }).then(function (r) {
        /* every paid option in the cascade is refused, not merely the chosen
           one — a ceiling that only stopped your first pick would be no
           ceiling at all, it would just reroute the same spend elsewhere */
        t('a ceiling below the price refuses every paid option, not just the first',
          r.refused.length > 1 &&
          r.refused.some(function (x) { return x.provider === 'flux'; }) &&
          r.refused.every(function (x) { return x.costPaise === 2000; }));
        t('nothing was spent while under the ceiling', R.spend().total === 0);
        R.setCeiling(10000);
        return R.run('ai_image', function () { return 'b'; },
          { activeId: 'flux', costPaise: 2000 });
      }).then(function (r) {
        t('raising the ceiling lets the paid provider run again',
          r.provider.id === 'flux' && r.ok === true);
      });
    });

    /* 8 · a failure is not charged for unless the caller says so */
    step(function () {
      var R = mk({ retries: 2, backoffMs: 1 });
      return R.run('ai_image', function (p) {
        if (p.id === 'flux') throw new Error('nope');
        return 'ok';
      }, { activeId: 'flux', costPaise: 2000 }).then(function () {
        t('a failed call is not charged for by default',
          (R.spend().byProvider.flux || 0) === 0);
      });
    });

    /* 9 · every capability can be driven, not just the two used above */
    step(function () {
      var R = mk({ retries: 1 });
      var jobs = Providers.CAPS.map(function (cap) {
        return R.run(cap.id, function (p) { return p.id; }, {});
      });
      return Promise.all(jobs).then(function (rs) {
        t('every declared capability routes to a working provider',
          rs.length === Providers.CAPS.length && rs.every(function (r) { return r.ok; }));
      });
    });

    return chain.then(function () {
      console.log('\n' + pass + ' passed, ' + fail + ' failed');
      if (typeof process !== 'undefined' && fail) process.exit(1);
      return { pass: pass, fail: fail };
    });
  }

  var API = { create: create, DEFAULTS: DEFAULTS, selftest: selftest };
  if (typeof window !== 'undefined') window.MedhavaRouter = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;

  if (typeof require !== 'undefined' && typeof module !== 'undefined' &&
      require.main === module && process.argv.indexOf('--selftest') >= 0) {
    selftest();
  }
})();
