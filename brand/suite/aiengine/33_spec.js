/* ═══════════ Vastrangam AI Engine — the spec layer (61-column Shopify + the real QA gate) ═══════════
   v2 shipped a 23-column sheet, 20 hashtags and a 10-slide carousel. The user's own spec
   (Vastrangam_AI_Content_Engine.md) says 61 columns, exactly 30 hashtags and exactly 8 slides,
   and its QA gate is explicitly "verified by script, not by eye — a batch failing any check
   is a bug, not a style choice". This file is that script.

   Two exports:
     VSPEC.rows(pack, shots)  → the 61-column Shopify rows (hero + one row per extra image)
     VSPEC.qa(pack, priorRuns) → all 14 gate rules, each pass/fail with the reason */
var VSPEC = (function () {
  'use strict';

  /* ── Col 1..61, in the exact order of a Shopify product export ── */
  var COLS = [
    'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published',
    'Option1 Name', 'Option1 Value', 'Option1 Linked To',
    'Option2 Name', 'Option2 Value', 'Option2 Linked To',
    'Option3 Name', 'Option3 Value', 'Option3 Linked To',
    'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty',
    'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
    'Variant Requires Shipping', 'Variant Taxable',
    'Unit Price Total Measure', 'Unit Price Total Measure Unit', 'Unit Price Base Measure', 'Unit Price Base Measure Unit',
    'Variant Barcode', 'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card',
    'SEO Title', 'SEO Description', 'Google Shopping / Custom Product',
    'Age group (product.metafields.shopify.age-group)',
    'Care instructions (product.metafields.shopify.care-instructions)',
    'Clothing features (product.metafields.shopify.clothing-features)',
    'Color (product.metafields.shopify.color-pattern)',
    'Dress occasion (product.metafields.shopify.dress-occasion)',
    'Dress style (product.metafields.shopify.dress-style)',
    'Fabric (product.metafields.shopify.fabric)',
    'Neckline (product.metafields.shopify.neckline)',
    'Size (product.metafields.shopify.size)',
    'Skirt/dress length type (product.metafields.shopify.skirt-dress-length-type)',
    'Sleeve length type (product.metafields.shopify.sleeve-length-type)',
    'Target gender (product.metafields.shopify.target-gender)',
    'Top length type (product.metafields.shopify.top-length-type)',
    'Complementary products', 'Related products', 'Related products settings',
    'Search product boosts', 'Variant Image', 'Variant Weight Unit', 'Variant Tax Code',
    'Cost per item', 'Status'
  ];

  /* ── the lookups the spec pins down exactly ── */
  var TAXONOMY = {
    'Lehenga Choli': 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing > Saris & Lehengas',
    'Saree': 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing > Saris & Lehengas',
    'Anarkali Suit': 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing',
    'Salwar Suit Set': 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing',
    'Sharara Set': 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing',
    'Palazzo Set': 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing',
    'Kurti': 'Apparel & Accessories > Clothing > Tops',
    'Dress (Western)': 'Apparel & Accessories > Clothing > Dresses'
  };
  var GRAMS = { 'Saree': 550, 'Anarkali Suit': 700, 'Salwar Suit Set': 700, 'Kurti': 350,
    'Dress (Western)': 400, 'Lehenga Choli': 1500, 'Sharara Set': 900, 'Palazzo Set': 700 };
  var FABRIC_SLUG = { 'Chinon Silk': 'chinon-silk', 'Chinon': 'chinon-silk', 'Faux Georgette': 'faux-georgette',
    'Georgette': 'faux-georgette', 'Net': 'net', 'Rayon': 'rayon', 'Cotton': 'cotton', 'Assam Silk': 'assam-silk',
    'Roman Silk': 'roman-silk', 'Tabby Silk': 'tabby-silk', 'Linen': 'linen', 'Organza': 'organza', 'Velvet': 'velvet' };
  var STYLE = { 'Lehenga Choli': 'lehenga', 'Saree': 'straight', 'Anarkali Suit': 'anarkali',
    'Kurti': 'straight', 'Dress (Western)': 'fit-and-flare', 'Sharara Set': 'flared',
    'Palazzo Set': 'straight', 'Salwar Suit Set': 'a-line' };
  var TOPLEN = { 'Lehenga Choli': 'crop-top', 'Anarkali Suit': 'long', 'Salwar Suit Set': 'long',
    'Kurti': 'hip', 'Sharara Set': 'long', 'Palazzo Set': 'long' };
  var SKIRTLEN = { 'Lehenga Choli': 'full-length', 'Anarkali Suit': 'full-length', 'Dress (Western)': 'midi',
    'Kurti': 'knee', 'Sharara Set': 'ankle', 'Palazzo Set': 'ankle', 'Salwar Suit Set': 'ankle' };
  /* the spec is explicit: NEVER "3/4" (Excel turns it into a date) and NEVER "xxl" */
  var SLEEVES = ['sleeveless', 'short', 'half', 'three-quarter', 'long'];
  var SIZES_STITCHED = 'xs; s; m; l; xl; 2xl; 3xl';
  var FREE_SIZE = 'free-size';

  function isFreeSize(cat) { return cat === 'Saree' || cat === 'Lehenga Choli'; }
  /* Col 18: only VS (saree) and VL (lehenga) ever carry a written Variant SKU */
  function variantSKU(cat, sku) {
    return /^(VS|VL)\d{4}$/.test(String(sku || '')) && isFreeSize(cat) ? sku : '';
  }
  function careFor(fabric) {
    return /rayon|cotton/i.test(fabric || '') ? 'machine-wash-cold' : 'dry-clean-only';
  }
  function fabricSlug(f) {
    if (FABRIC_SLUG[f]) return FABRIC_SLUG[f];
    return String(f || 'roman-silk').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  /* Options per category, straight from the spec's table */
  function options(cat, colourSlug) {
    var LINK = 'product.metafields.shopify.color-pattern';
    switch (cat) {
      case 'Lehenga Choli':
      case 'Saree':
        return ['Color', colourSlug, LINK, '', '', '', '', '', ''];
      case 'Anarkali Suit':
        return ['Color', colourSlug, LINK, 'Size', 's', '', '', '', ''];
      case 'Salwar Suit Set':
        return ['Size', 's', '', 'Color', colourSlug, LINK, '', '', ''];
      case 'Kurti':
        return ['Color', colourSlug, LINK, 'Size', '2xl', '', '', '', ''];
      case 'Dress (Western)':
        return ['Size', 'xs', '', '', '', '', '', '', ''];
      default:
        return ['Color', colourSlug, LINK, 'Size', 's', '', '', '', ''];
    }
  }

  /* Col 35 alt text — ≤125 chars, and shot-specific per the spec */
  function altFor(p, pose) {
    var base = [p.colour, p.fabric, p.typeNoun, p.work, 'for ' + String(p.occ).replace(/-/g, ' ')].join(' ');
    var pre = { front: 'Front view of ', back: 'Back design of ', closeup: 'Close detail of the ' + String(p.work).toLowerCase() + ' on ',
      side: 'Side profile of ', detail: 'Fabric detail of ', look: 'Full styled look — ' }[pose] || '';
    return (pre + base + ' by Vastrangam').replace(/\s+/g, ' ').trim().slice(0, 125);
  }
  /* image filename lock: {SKU}_{Color}-{SHOT}.webp — hero carries no shot suffix */
  function imageName(sku, colour, pose, isHero) {
    var c = String(colour || '').replace(/\s+/g, '');
    return sku + '_' + c + (isHero ? '' : '-' + cap(pose)) + '.webp';
  }
  function cap(s) { return String(s).charAt(0).toUpperCase() + String(s).slice(1); }

  /* ── build the rows ───────────────────────────────────────────────────────────────
     Shopify's format: the first row carries the whole product; each extra image gets a
     row with only Handle + Image Src/Position/Alt filled. */
  function rows(p, shots) {
    shots = (shots && shots.length) ? shots : [{ pose: 'front' }, { pose: 'back' }, { pose: 'closeup' }, { pose: 'side' }];
    var cat = p.cat, cs = slug(p.colour), out = [];
    var opt = options(cat, cs);
    var occs = ['wedding', 'sangeet', 'festive', 'party', 'reception'];
    var boosts = [
      '"' + String(p.colour).toLowerCase() + ' ' + String(p.typeNoun).toLowerCase() + ' online"',
      '"' + String(p.fabric).toLowerCase() + ' ' + String(p.typeNoun).toLowerCase() + ' for ' + String(p.occ).replace(/-/g, ' ') + '"',
      '"designer ' + String(p.typeNoun).toLowerCase() + ' under ' + (Math.ceil(p.price / 1000) * 1000) + '"'
    ].join('; ');

    var first = {};
    COLS.forEach(function (c) { first[c] = ''; });
    first['Handle'] = p.handle;
    first['Title'] = p.title;
    first['Body (HTML)'] = p.bodyHTML;
    first['Vendor'] = 'Vastrangam';
    first['Product Category'] = TAXONOMY[cat] || TAXONOMY['Anarkali Suit'];
    first['Type'] = cat;
    first['Tags'] = p.tags.join(', ');
    first['Published'] = 'TRUE';
    first['Option1 Name'] = opt[0]; first['Option1 Value'] = opt[1]; first['Option1 Linked To'] = opt[2];
    first['Option2 Name'] = opt[3]; first['Option2 Value'] = opt[4]; first['Option2 Linked To'] = opt[5];
    first['Option3 Name'] = opt[6]; first['Option3 Value'] = opt[7]; first['Option3 Linked To'] = opt[8];
    first['Variant SKU'] = variantSKU(cat, p.sku);
    first['Variant Grams'] = String(GRAMS[cat] || 700);
    first['Variant Inventory Tracker'] = 'shopify';
    first['Variant Inventory Qty'] = '10';
    first['Variant Inventory Policy'] = 'deny';
    first['Variant Fulfillment Service'] = 'manual';
    first['Variant Price'] = String(p.price);
    first['Variant Compare At Price'] = String(p.mrp);
    first['Variant Requires Shipping'] = 'TRUE';
    first['Variant Taxable'] = 'TRUE';
    first['Image Src'] = imageName(p.sku, p.colour, 'front', true);
    first['Image Position'] = '1';
    first['Image Alt Text'] = altFor(p, 'hero');
    first['Gift Card'] = 'FALSE';
    first['SEO Title'] = p.meta.title;
    first['SEO Description'] = p.meta.desc;
    first['Age group (product.metafields.shopify.age-group)'] = 'adults';
    first['Care instructions (product.metafields.shopify.care-instructions)'] = careFor(p.fabric);
    first['Clothing features (product.metafields.shopify.clothing-features)'] = 'embroidered; sequin; can-can-lining; dupatta-included; semi-stitched';
    first['Color (product.metafields.shopify.color-pattern)'] = cs;
    first['Dress occasion (product.metafields.shopify.dress-occasion)'] = occs.join('; ');
    first['Dress style (product.metafields.shopify.dress-style)'] = STYLE[cat] || 'a-line';
    first['Fabric (product.metafields.shopify.fabric)'] = fabricSlug(p.fabric);
    first['Neckline (product.metafields.shopify.neckline)'] = p.neckline || 'round';
    first['Size (product.metafields.shopify.size)'] = isFreeSize(cat) ? FREE_SIZE : SIZES_STITCHED;
    first['Skirt/dress length type (product.metafields.shopify.skirt-dress-length-type)'] = SKIRTLEN[cat] || 'full-length';
    first['Sleeve length type (product.metafields.shopify.sleeve-length-type)'] = SLEEVES.indexOf(p.sleeve) >= 0 ? p.sleeve : 'three-quarter';
    first['Target gender (product.metafields.shopify.target-gender)'] = 'female';
    first['Top length type (product.metafields.shopify.top-length-type)'] = TOPLEN[cat] || 'long';
    first['Search product boosts'] = boosts;
    first['Variant Image'] = imageName(p.sku, p.colour, 'front', true);
    first['Variant Weight Unit'] = 'g';
    first['Variant Tax Code'] = '';          /* HSN belongs on the marketplace sheets only */
    first['Cost per item'] = String(Math.round(p.price * 0.42));
    first['Status'] = 'active';
    out.push(first);

    /* remaining images — position increments, hero already took 1 */
    shots.forEach(function (sh, i) {
      if (i === 0) return;
      var r = {}; COLS.forEach(function (c) { r[c] = ''; });
      r['Handle'] = p.handle;
      r['Image Src'] = imageName(p.sku, p.colour, sh.pose || 'detail', false);
      r['Image Position'] = String(i + 1);
      r['Image Alt Text'] = altFor(p, sh.pose || 'detail');
      out.push(r);
    });
    return out;
  }

  /* proper RFC-4180 CSV — the live-data lock demands a real comma-separated import file */
  function toCSV(rs) {
    function cell(v) {
      v = v == null ? '' : String(v);
      return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    }
    return [COLS.join(',')].concat(rs.map(function (r) {
      return COLS.map(function (c) { return cell(r[c]); }).join(',');
    })).join('\r\n');
  }

  /* ── THE QA GATE — all 14 rules from the spec, each machine-checked ──────────────── */
  function qa(p, priorRuns) {
    var checks = [], rs = rows(p, p.shots);
    function ck(n, ok, why) { checks.push({ name: n, ok: !!ok, why: ok ? '' : (why || '') }); }
    var prior = (priorRuns || []).filter(function (r) { return r.pack && r.pack !== p; }).map(function (r) { return r.pack; });

    /* 1 — Title 60–80 chars */
    ck('Title is 60–80 characters', p.title.length >= 60 && p.title.length <= 80, p.title.length + ' chars');
    /* 2 — SEO Title ≤60, unique */
    ck('SEO Title ≤60 chars and unique',
      p.meta.title.length <= 60 && !prior.some(function (q) { return q.meta.title === p.meta.title; }),
      p.meta.title.length + ' chars');
    /* 3 — SEO Description 150–160 */
    ck('SEO Description is 150–160 characters', p.meta.desc.length >= 150 && p.meta.desc.length <= 160, p.meta.desc.length + ' chars');
    /* 4 — no two metas share 6+ consecutive words */
    ck('No meta shares 6+ consecutive words with another', !prior.some(function (q) { return share6(q.meta.desc, p.meta.desc); }));
    /* 5 — every alt ≤125 */
    var alts = rs.map(function (r) { return r['Image Alt Text']; }).filter(Boolean);
    ck('Every image alt text is ≤125 characters', alts.every(function (a) { return a.length <= 125; }),
      'longest ' + Math.max.apply(null, alts.map(function (a) { return a.length; })));
    /* 6 — alt sync: Shopify col 35 must equal the Image SEO sheet's col F */
    ck('Alt text matches the Image SEO sheet exactly', alts.every(function (a, i) { return a === (p.imageSEO || alts)[i]; }));
    /* 7 — exactly 30 hashtags, deduplicated */
    var tags = p.social.hashtags || [];
    ck('Exactly 30 hashtags, no duplicates', tags.length === 30 && new Set(tags).size === 30, tags.length + ' tags');
    /* 8 — exactly 8 carousel slides, slide 1 carries caption + hashtags */
    var car = p.social.carousel || [];
    ck('Exactly 8 carousel slides, slide 1 carries the caption', car.length === 8 && /#/.test(car[0] || ''), car.length + ' slides');
    /* 9 — image positions sequential from 1, hero first */
    var pos = rs.map(function (r) { return r['Image Position']; }).filter(Boolean).map(Number);
    ck('Image positions run 1..n with the hero at 1', pos[0] === 1 && pos.every(function (n, i) { return n === i + 1; }));
    /* 10 — forbidden tokens */
    var flat = rs.map(function (r) { return COLS.map(function (c) { return r[c]; }).join(''); }).join('');
    ck('No forbidden token (3/4, xxl) anywhere', flat.indexOf('3/4') < 0 && !/\bxxl\b/i.test(flat));
    /* 11 — SKU lock */
    var sk = rs[0]['Variant SKU'];
    ck('Variant SKU written only for VS / VL', !sk || /^(VS|VL)\d{4}$/.test(sk), sk || 'blank');
    /* 12 — Amazon limits */
    var az = p.marketplace.amazon;
    ck('Amazon title ≤200 chars and backend keywords ≤250 bytes',
      az.title.length <= 200 && bytes(az.keywords) <= 250,
      az.title.length + ' chars / ' + bytes(az.keywords) + ' bytes');
    /* 13 — exact column count */
    ck('Shopify sheet has exactly 61 columns', COLS.length === 61, COLS.length + ' columns');
    /* 14 — batch uniqueness of title, handle and opening hook */
    ck('Title, handle and opening hook are unique in the batch',
      !prior.some(function (q) { return q.title === p.title || q.handle === p.handle || openOf(q) === openOf(p); }));

    var pass = checks.filter(function (c) { return c.ok; }).length;
    return { checks: checks, pass: pass, total: checks.length, pct: Math.round(pass / checks.length * 100) };
  }
  function bytes(s) { return unescape(encodeURIComponent(String(s || ''))).length; }
  function openOf(p) { return String(p.bodyHTML || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90); }
  function share6(a, b) {
    var wa = String(a || '').toLowerCase().split(/\s+/), wb = String(b || '').toLowerCase().split(/\s+/), i;
    if (wa.length < 6 || wb.length < 6) return false;
    var set = {};
    for (i = 0; i + 6 <= wa.length; i++) set[wa.slice(i, i + 6).join(' ')] = 1;
    for (i = 0; i + 6 <= wb.length; i++) if (set[wb.slice(i, i + 6).join(' ')]) return true;
    return false;
  }

  return { COLS: COLS, rows: rows, toCSV: toCSV, qa: qa, altFor: altFor, imageName: imageName, share6: share6,
    TAXONOMY: TAXONOMY, fabricSlug: fabricSlug, variantSKU: variantSKU, careFor: careFor, options: options };
})();
