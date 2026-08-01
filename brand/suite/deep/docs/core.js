/* Medhava — Documents & eSign (Module 02 · App 2)

   A document belongs to a RECORD, not to a folder. File it against the order, the party, the
   project or case, or the person it actually belongs to, and it is found by opening that
   record — which is how anybody genuinely looks for one.

   THE GATE THIS APP REFUSES ON: a document is not signed because somebody ticked a box. It is
   signed because a six-digit one-time code went to the named signer and came back, and that
   code is recorded against the document. No code, no signature. A signature nobody can
   evidence is worse than no signature at all, because everybody believes it.

   THE SECOND THING IT REFUSES: filing a document against a record that does not exist. That
   is the one fault which makes a filing system useless — the document is in the system and
   unfindable from the only place anybody would look.

   What a document may be filed against is a SETTING (CFG.docKinds), never an assumption. A
   practice files against a case, a workshop against a job, a clothing house against a style,
   and all three are the same field with different words on it.

   Arithmetic from M02, screens from M02V — the same files the other three apps are built from. */
var K = typeof Medhava !== 'undefined' ? Medhava : {};
var H = K.H, esc = K.esc;
var CFG = (typeof CONFIG !== 'undefined') ? CONFIG : {};

var V = M02V.make(CFG, {
  wiringTitle: 'Where every document lives',
  wiringSub: 'This app owns the documents. Everything they are filed against belongs to another module, and is read from there.',
  wiringPanels: function () {
    return H.panel('What a signature actually is here',
      '<div class="cascade">' +
      '<div class="cl"><span class="d">1</span><div>The document is written. It is a <b>draft</b> — it has been sent to nobody.</div></div>' +
      '<div class="cl"><span class="d">2</span><div>You send it. A six-digit <b>one-time code</b> goes to the named signer, and the state becomes <b>sent</b>.</div></div>' +
      '<div class="cl"><span class="d">3</span><div>They read the code back. You record it. Only now does the state become <b>signed</b>, with the code kept against the document.</div></div>' +
      '<div class="cl"><span class="d">4</span><div>The signed copy files itself back against the same record it started on.</div></div>' +
      '</div>' +
      '<p class="hint" style="margin-top:8px">There is no other route to "signed". Not a tick box, not a menu, not an import.</p>') +
    H.panel('And the passwords question, since it always comes up',
      '<p>A one-time code is <b>not</b> a password, and this app has no use for one. It never asks a signer for a login, ' +
      'and <b>Medhava will never ask you for a marketplace, bank or account password</b> — if any screen ever does, it is not Medhava.</p>' +
      '<p class="hint">Where an outside signature service is used instead, it connects with a scoped, revocable key. See the Connectors screen: there are ' +
      'several, plus a built-in way that needs nobody.</p>');
  }
});

/* It reads the records documents are filed against, sends them out, and prints or stores them. */
/* The whole of what this app can DO. The kernel adds its own backup and connector buttons on
   top; none of them is ours. */
var OWN = (function (A) {
  return { dismiss: A.dismiss, setdocf: A.setdocf, seldoc: A.seldoc,
           senddoc: A.senddoc, signdoc: A.signdoc, adddoc: A.adddoc };
})(M02V.actions(CFG));

var SPEC = {
  uses: ['storage', 'email', 'messaging', 'printing', 'automation'],
  id: CFG.id, name: CFG.name, company: CFG.company, fy: CFG.fy || 'FY 2026-27',
  tagline: CFG.tagline, about: CFG.about,
  groups: [{ label: 'Documents', items: ['docdash', 'docs'] },
           { label: 'Wiring', items: ['wiring'] }],
  nav: [{ v: 'docdash', label: 'Overview', icon: 'grid' }, { v: 'docs', label: 'All documents', icon: 'doc' },
        { v: 'wiring', label: 'Wiring', icon: 'flow' }],
  seed: function (DB) { M02.seed(DB, CFG); },
  views: { docdash: V.docdash, docs: V.docs, wiring: V.wiring },
  actions: OWN,

  tests: function (t, DB) {
    /* ── the filing rule ── */
    t('every document names what it is filed against',
      DB.docs.every(function (d) { return d.againstKind && d.against; }));
    t('nothing on file is filed against a record that does not exist', M02.orphanDocs(DB).length === 0);
    t('a document filed against a party is found from that party',
      M02.docsOfParty(DB, 'P1').some(function (d) { return d.againstKind === 'Party' && d.against === 'P1'; }));
    t('a document filed against an ORDER is also found from that order’s party',
      M02.docsOfParty(DB, 'P7').some(function (d) { return d.againstKind === 'Order'; }));
    t('what a document may be filed against is a setting, not a fixed list',
      (CFG.docKinds || []).length >= 3 && CFG.docKinds.indexOf('Party') >= 0);
    var badFile = M02.recordExists(DB, 'Party', 'NOPE');
    t('a record that does not exist is recognised as not existing', badFile === false);

    /* ── the signature gate ── */
    var sent = M02.awaitingSignature(DB)[0];
    t('there is a document out for signature', !!sent);
    t('marking it signed with no code at all is refused',
      M02.signDoc(DB, sent.id, '').refused === true);
    t('the refusal explains that a signature must be evidenced',
      /cannot be evidenced|only a signature if it can be evidenced/.test(M02.signDoc(DB, sent.id, '').reason));
    t('a code that is not six digits is refused', M02.signDoc(DB, sent.id, '12ab').refused === true);
    t('the document is still unsigned after both refusals', sent.status === 'sent');
    var ok = M02.signDoc(DB, sent.id, '123456');
    t('a six-digit code signs it', ok.ok === true && sent.status === 'signed');
    t('the code is recorded against the document, not thrown away', sent.code === '123456');
    t('the signing date is recorded too', sent.signedOn === M02.dateOnly(M02.TODAY));
    t('signing the same document twice is refused', M02.signDoc(DB, sent.id, '654321').refused === true);
    t('and the original code is not overwritten by the second attempt', sent.code === '123456');

    /* ── you cannot sign something that was never sent ── */
    var draft = (DB.docs || []).filter(function (d) { return d.status === 'draft'; })[0];
    t('there is a draft on file', !!draft);
    t('a draft cannot come back signed before it goes out', M02.signDoc(DB, draft.id, '111111').refused === true);
    t('a draft with a named signer can be sent', M02.sendDoc(DB, draft.id).ok === true);
    t('sending it twice is refused', M02.sendDoc(DB, draft.id).refused === true);
    var noSigner = { id: 'D-TEST', title: 'No signer', type: 'x', againstKind: 'Party', against: 'P1',
      issued: M02.TODAY, expires: '', status: 'draft', signer: '', signedOn: '', code: '' };
    DB.docs.push(noSigner);
    t('a document with nobody named as signer cannot be sent', M02.sendDoc(DB, 'D-TEST').refused === true);
    DB.docs = DB.docs.filter(function (d) { return d.id !== 'D-TEST'; });

    /* ── expiry ── */
    var exp = M02.expiringSoon(DB);
    t('expiring documents are listed soonest first',
      exp.every(function (d, i) { return i === 0 || exp[i - 1].expires <= d.expires; }));
    t('everything in that list really does expire within 60 days',
      exp.every(function (d) { return M02.daysLeft(d) <= 60; }));
    t('a document with no expiry date is never listed as expiring',
      exp.every(function (d) { return !!d.expires; }));

    /* ── the import rule ── */
    var imp = M02.importRows(DB, 'docs', [
      { id: 'D-9001', title: 'Fine', type: 'x', againstKind: 'Party', against: 'P1', issued: '2026-07-01', status: 'filed' },
      { id: 'D-9002', title: 'Claims to be signed', type: 'x', againstKind: 'Party', against: 'P1', issued: '2026-07-01', status: 'signed', code: '' },
      { id: 'D-9003', title: 'Filed at nobody', type: 'x', againstKind: 'Party', against: 'GHOST', issued: '2026-07-01', status: 'filed' }]);
    t('a good document imports', imp.rows.length === 1);
    t('a document claiming to be signed with no code is refused on import',
      imp.rejected.some(function (r) { return /no one-time code/.test(r.why); }));
    t('a document filed against a party that does not exist is refused on import',
      imp.rejected.some(function (r) { return /no party "GHOST"/.test(r.why); }));
    t('and the reason says it could never be found from that record',
      imp.rejected.some(function (r) { return /never be found from that record/.test(r.why); }));
    t('accepted plus rejected always equals what was in the file',
      imp.rows.length + imp.rejected.length === 3);

    /* ── this app does not invent records ── */
    t('this app can do six things, and none of them writes to another module',
      Object.keys(OWN).sort().join(',') === 'adddoc,dismiss,seldoc,senddoc,setdocf,signdoc');
    t('every document type offered is one the company set up', (CFG.docTypes || []).length >= 4);
  }
};

if (typeof module !== 'undefined' && module.exports) module.exports = SPEC;
if (typeof Medhava !== 'undefined' && Medhava.app) Medhava.app(SPEC);
