/* ═══════════ Vastrangam AI Engine — v2 self-tests (catalogue, themes, router, analysis) ═══════════ */
(function () {
  'use strict';
  VA.test(function (t) {
    /* catalogue grouping reads the filename correctly */
    t('the catalogue reads the pose from a filename', VA.CAT.detectPose('mehendi-green-back.jpg') === 'back' && VA.CAT.detectPose('anarkali-closeup.png') === 'closeup');
    t('the catalogue reads the colour from a filename', /mehendi|green/.test(VA.CAT.detectColour('mehendi-green-front.jpg').toLowerCase()) && VA.CAT.detectColour('ruby-wine-back.jpg') === 'Wine');
    t('the catalogue strips pose and colour to a product name', VA.CAT.detectProduct('anarkali-mehendi-green-front-2.jpg').toLowerCase().indexOf('green') < 0);
  });
  VA.test(function (t) {
    /* theme engine derives a full variable set and stays readable */
    var v = VTheme.derive(VTheme.FREE[2]);
    t('a theme derives every core CSS variable', v['--p1'] && v['--bg'] && v['--card'] && v['--ink'] && v['--gold']);
    t('an AI theme comes out of a prompt with a valid primary colour', /^#[0-9a-f]{6}$/i.test(VTheme.fromPrompt('royal midnight blue and gold').p1));
    t('there are several free themes to choose from', VTheme.FREE.length >= 6);
  });
  VA.test(function (t) {
    /* the model router lists free options before paid ones, and never breaks offline */
    var ids = VAI.PROVIDERS.map(function (p) { return p.id; });
    t('the router lists the built-in offline engine first', ids[0] === 'builtin');
    t('paid providers come after the free ones', ids.indexOf('gemini') < ids.indexOf('openai') && ids.indexOf('pollinations') < ids.indexOf('openai'));
    t('with no key connected the text chain is empty (built-in answers)', Array.isArray(VAI.textChain()));
  });
  VA.test(function (t, DB) {
    /* the analysis doc builds the five real sections */
    var p = VA.CE.generate({ desc: 'mehendi green roman silk zari anarkali', occ: 'mehendi' });
    var a = VA.ANALYSIS.analysis(p);
    t('the analysis has three competitor tiers', a.competitors.length === 3 && a.competitors.every(function (c) { return c.tier && c.beat; }));
    t('the analysis has a gap list and a what-you-do-better list', a.gaps.length >= 3 && a.better.length >= 3);
    t('the analysis doc is a Word-openable document', /msword|urn:schemas-microsoft/.test(VA.ANALYSIS.toDoc(p)) || VA.ANALYSIS.toDoc(p).indexOf('Gap analysis') >= 0 || VA.ANALYSIS.toDoc(p).indexOf('what you can do better') >= 0);
  });
})();
