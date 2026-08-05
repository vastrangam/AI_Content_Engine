/* ═══════════ Vastrangam AI Engine — data + libraries ═══════════
   The vocabulary libraries from the Content Engine spec, so generation is real and offline.
   Plus the seed DB with genuine Vastrangam textile records. */
var LIB = (function () {
  'use strict';

  var COLOURS = {
    blue: ['Midnight Cobalt', 'Dusty Sapphire', 'Aegean Blue', 'Royal Indigo'],
    green: ['Emerald Isle', 'Pistachio Dew', 'Sage Mist', 'Forest Verdure', 'Parrot Jade', 'Mehendi Green'],
    pink: ['Blush Petal', 'Rose Quartz', 'Rani Fuchsia', 'Powder Punch'],
    purple: ['Regal Amethyst', 'Dusty Lilac', 'Aubergine Mauve', 'Orchid Haze'],
    red: ['Crimson Ember', 'Scarlet Bloom', 'Ruby Wine', 'Pomegranate'],
    yellow: ['Saffron Gold', 'Mustard Harvest', 'Marigold', 'Champagne Ivory'],
    white: ['Alabaster', 'Pearl Mist', 'Ivory Cream', 'Pristine Chalk'],
    black: ['Jet Noir', 'Midnight Onyx', 'Deep Charcoal', 'Obsidian'],
    orange: ['Burnt Sienna', 'Rust Terracotta', 'Mango Sorbet', 'Copper Dusk'],
    teal: ['Teal Lagoon', 'Aqua Jade', 'Sea Glass', 'Peacock Teal'],
    maroon: ['Ruby Wine', 'Pomegranate', 'Wine Velvet'],
    multi: ['Prismatic', 'Rainbow Festive', 'Kaleidoscopic', 'Festival Spectrum']
  };
  var FABRICS = {
    'Chinon Silk': { s: 'Feather-light, fluid drape, silk-like sheen, wrinkle-resistant', w: '~500g' },
    'Faux Georgette': { s: 'Airy with a slight grain, falls gracefully, matte finish', w: '~450g' },
    'Net': { s: 'Semi-sheer delicate mesh, anchors embroidery, structured flare', w: '~650g' },
    'Assam Silk': { s: 'Rich lustre, natural body, temple weave, heirloom quality', w: '~550g' },
    'Roman Silk': { s: 'Medium weight, smooth hand-feel, holds a structured drape', w: '~600g' },
    'Organza': { s: 'Crisp, translucent shimmer, lightweight body that catches light', w: '~350g' },
    'Rayon': { s: 'Breathable, cool touch, easy everyday drape, minimal upkeep', w: '~300g' },
    'Cotton': { s: 'Natural, airy, skin-friendly, summer-ready', w: '~400g' },
    'Tissue Linen': { s: 'Delicate weave, semi-sheer, golden thread shimmer, artisanal', w: '~400g' },
    'Velvet': { s: 'Dense pile, royal weight, deep colour absorption', w: '~800g' },
    'Crepe': { s: 'Smooth matte, wrinkle-hiding, structured fall', w: '~450g' },
    'Viscose Silk': { s: 'Soft sheen, heavy fluid fall, holds a flare without stiffening', w: '~600g' }
  };
  var CRAFT = {
    'Sequence': 'Multi-faceted micro-sequins that dance under halogen and candlelight',
    'Zari': 'Metallic gold thread, woven or hand-applied — temple craft',
    'Thread Work': 'Multi-colour Resham thread, each motif hand-mapped by the karigar',
    'Coding': 'Raised 3D cord outlines that define motif edges with sculptural depth',
    'Pearl Work': 'Hand-set seed pearls, bridal weight, heirloom finish',
    'Mirror Work': 'Hand-stitched shisha mirrors that catch every source of light',
    'Gota Patti': 'Rajasthani flat ribbon appliqué with gold shimmer edging',
    'Zardozi': 'Heavy metal thread, Mughal craft heritage, couture weight',
    'Chikankari': 'Lucknow shadow-work hand embroidery in delicate floral white thread',
    'Digital Print': 'High-resolution screen print, colour-fast, photographic detail',
    'Bandhani': 'Tie-and-dye dot pattern, Rajasthani and Gujarati heritage craft',
    'Foil Print': 'Metallic heat-transfer print, festive shine'
  };
  var OCC = {
    bridal: { c: 'the bride\'s own trousseau', light: 'mandap and natural light' },
    'wedding-guest': { c: 'a wedding you have been invited to', light: 'warm banquet-hall ambient' },
    sangeet: { c: 'a sangeet where you intend to dance', light: 'disco and halogen, dance-ready' },
    mehendi: { c: 'a mehendi ceremony', light: 'outdoor natural daylight' },
    reception: { c: 'an evening reception or cocktail', light: 'crystal chandelier, formal' },
    engagement: { c: 'an engagement ceremony', light: 'studio and ambient' },
    festive: { c: 'Navratri, Diwali, Eid or Teej', light: 'temple, home and outdoor' },
    'party-wear': { c: 'a birthday or anniversary evening', light: 'night venue, neon and mood' },
    'casual-ethnic': { c: 'a family gathering or brunch', light: 'relaxed daytime' },
    'daily-wear': { c: 'everyday comfort', light: 'all-day' }
  };
  var CATS = {
    'Lehenga Choli': { px: 'VL', pr: [2000, 5000], sku: true, opt: 'Color', cat: 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing > Saris & Lehengas', words: ['lehenga', 'choli', 'ghagra'] },
    'Saree': { px: 'VS', pr: [1200, 2500], sku: true, opt: 'Color', cat: 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing > Saris & Lehengas', words: ['saree', 'sari', 'pallu', 'drape'] },
    'Anarkali Suit': { px: 'VAN', pr: [1200, 2000], sku: false, opt: 'Color', cat: 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing', words: ['anarkali', 'gown', 'flared kurta', 'floor-length'] },
    'Salwar Suit Set': { px: 'VSS', pr: [1200, 2000], sku: false, opt: 'Size', cat: 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing', words: ['salwar', 'suit set', 'churidar', 'a-line kurta'] },
    'Sharara Set': { px: 'VSH', pr: [1500, 3500], sku: false, opt: 'Color', cat: 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing', words: ['sharara', 'gharara'] },
    'Palazzo Set': { px: 'VP', pr: [1200, 2500], sku: false, opt: 'Color', cat: 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing', words: ['palazzo'] },
    'Kurti': { px: 'VK', pr: [299, 999], sku: false, opt: 'Color', cat: 'Apparel & Accessories > Clothing > Tops', words: ['kurti', 'kurta', 'tunic'] },
    'Dress (Western)': { px: 'VD', pr: [499, 1500], sku: false, opt: 'Size', cat: 'Apparel & Accessories > Clothing > Dresses', words: ['dress', 'western', 'gown western', 'midi', 'maxi'] }
  };
  var LABELS = {
    'Vastrangam': { pos: 'Mid-premium ₹1,499–₹4,999', tone: 'aspirational, occasion-led, warm', kw: ['Crafted', 'Elegant', 'Festive-ready'] },
    'Go4Fashion': { pos: 'Value ₹499–₹1,499', tone: 'trend-led, contemporary, confident', kw: ['Stylish', 'Affordable', 'Everyday'] },
    'Adini Couture': { pos: 'Ultra-luxury ₹5,000+', tone: 'couture, artisanal, exclusive', kw: ['Handcrafted', 'Couture', 'Heirloom'] }
  };
  var FEST = 'Navratri (Oct) · Diwali (Oct/Nov) · Karwa Chauth (Oct) · Teej (Jul/Aug) · Eid (Mar/Apr) · Holi (Mar) · Durga Puja (Oct)';
  var CHANNELS = [
    { id: 'shopify', name: 'Shopify', c: '#95BF47', ab: 'S' }, { id: 'amazon', name: 'Amazon', c: '#FF9900', ab: 'A' },
    { id: 'flipkart', name: 'Flipkart', c: '#2874F0', ab: 'F' }, { id: 'myntra', name: 'Myntra', c: '#FF3F6C', ab: 'M' },
    { id: 'ajio', name: 'Ajio', c: '#2C4152', ab: 'Aj' }, { id: 'meesho', name: 'Meesho', c: '#F43397', ab: 'Me' },
    { id: 'instagram', name: 'Instagram', c: '#C13584', ab: 'IG' }, { id: 'facebook', name: 'Facebook', c: '#1877F2', ab: 'Fb' },
    { id: 'pinterest', name: 'Pinterest', c: '#E60023', ab: 'P' }, { id: 'youtube', name: 'YouTube', c: '#FF0000', ab: 'YT' }
  ];

  /* banned openers / AI-skeleton phrases from the humanized rules */
  var BANNED = ['in conclusion', 'moreover', 'it\'s worth noting', 'furthermore', 'in today\'s world',
    'elevate your', 'look no further', 'nestled', 'in the realm of', 'when it comes to', 'a testament to',
    'unlock', 'delve', 'embark', 'in summary'];
  var PRODUCT_NOUNS = ['anarkali', 'saree', 'sari', 'lehenga', 'kurti', 'kurta', 'gown', 'dress', 'suit',
    'sharara', 'palazzo', 'choli', 'dupatta', 'outfit', 'ensemble', 'attire', 'garment'];

  function detectCategory(text) {
    var t = String(text).toLowerCase(), best = 'Anarkali Suit', hits = 0;
    Object.keys(CATS).forEach(function (k) {
      var n = CATS[k].words.filter(function (w) { return t.indexOf(w) >= 0; }).length;
      if (n > hits) { hits = n; best = k; }
    });
    return best;
  }
  function colourFamily(text) {
    var t = String(text).toLowerCase();
    var map = { blue: 'blue', navy: 'blue', cobalt: 'blue', green: 'green', mehendi: 'green', olive: 'green',
      pink: 'pink', rani: 'pink', rose: 'pink', purple: 'purple', lavender: 'purple', lilac: 'purple', mauve: 'purple',
      red: 'red', maroon: 'maroon', wine: 'maroon', yellow: 'yellow', mustard: 'yellow', gold: 'yellow',
      white: 'white', ivory: 'white', cream: 'white', black: 'black', orange: 'orange', rust: 'orange',
      teal: 'teal', peacock: 'teal', multi: 'multi' };
    for (var w in map) if (t.indexOf(w) >= 0) return map[w];
    return 'purple';
  }
  function premiumColour(text) {
    var fam = colourFamily(text), list = COLOURS[fam] || COLOURS.purple;
    var t = String(text).toLowerCase();
    var m = list.filter(function (c) { return t.indexOf(c.toLowerCase().split(' ')[0]) >= 0; })[0];
    return m || list[0];
  }

  /* ── the seed DB ── */
  function seed() {
    var runs = [
      demoRun('Mehendi Green', 'Roman Silk', 'Zari', 'mehendi', 'Anarkali Suit', 2499, 'VAN2094',
        'Mehendi Green Roman Silk Zari Anarkali Gown for Mehendi'),
      demoRun('Ruby Wine', 'Velvet', 'Zardozi', 'reception', 'Lehenga Choli', 4999, 'VL1102',
        'Ruby Wine Velvet Zardozi Lehenga Choli for Reception'),
      demoRun('Peacock Teal', 'Chinon Silk', 'Sequence', 'sangeet', 'Anarkali Suit', 2199, 'VAN2087',
        'Peacock Teal Chinon Silk Sequence Anarkali for Sangeet')
    ];
    var products = [
      { id: 'p1', sku: 'VAN2094', name: 'Mehendi Green Anarkali', cat: 'Anarkali Suit', colour: 'Mehendi Green', fabric: 'Roman Silk', work: 'Zari', occ: 'mehendi', label: 'Vastrangam', price: 2499, mrp: 4199, stock: 46 },
      { id: 'p2', sku: 'VL1102', name: 'Ruby Wine Lehenga', cat: 'Lehenga Choli', colour: 'Ruby Wine', fabric: 'Velvet', work: 'Zardozi', occ: 'reception', label: 'Adini Couture', price: 4999, mrp: 8999, stock: 12 },
      { id: 'p3', sku: 'VS0761', name: 'Sage Mist Organza Saree', cat: 'Saree', colour: 'Sage Mist', fabric: 'Organza', work: 'Sequence', occ: 'wedding-guest', label: 'Vastrangam', price: 1899, mrp: 3299, stock: 33 },
      { id: 'p4', sku: 'VK0455', name: 'Marigold Cotton Kurti', cat: 'Kurti', colour: 'Marigold', fabric: 'Cotton', work: 'Digital Print', occ: 'daily-wear', label: 'Go4Fashion', price: 699, mrp: 1199, stock: 120 },
      { id: 'p5', sku: 'VSH1210', name: 'Rani Fuchsia Sharara', cat: 'Sharara Set', colour: 'Rani Fuchsia', fabric: 'Faux Georgette', work: 'Gota Patti', occ: 'festive', label: 'Vastrangam', price: 2899, mrp: 4599, stock: 21 }
    ];
    var assets = [
      { id: 'a1', name: 'VAN2094_Mehendi_hero.webp', kind: 'Hero', product: 'VAN2094', size: '1080×1350', w: 1080, h: 1350 },
      { id: 'a2', name: 'VAN2094_Mehendi_dupatta.webp', kind: 'Detail', product: 'VAN2094', size: '1080×1080', w: 1080, h: 1080 },
      { id: 'a3', name: 'VL1102_Ruby_hero.webp', kind: 'Hero', product: 'VL1102', size: '1080×1350', w: 1080, h: 1350 }
    ];
    var templates = seedTemplates();
    var channels = CHANNELS.map(function (c) { return { id: c.id, name: c.name, connected: ['shopify', 'instagram', 'amazon'].indexOf(c.id) >= 0, mode: ['shopify', 'instagram', 'amazon'].indexOf(c.id) >= 0 ? 'Connected — API key' : 'Not connected' }; });
    var cal = [
      { id: 'c1', date: offsetDate(1), platform: 'instagram', format: 'Reel', hook: 'The colour you are allowed to wear', product: 'VAN2094', status: 'Scheduled' },
      { id: 'c2', date: offsetDate(2), platform: 'shopify', format: 'Listing', hook: 'Mehendi Green Anarkali — live', product: 'VAN2094', status: 'Scheduled' },
      { id: 'c3', date: offsetDate(-1), platform: 'amazon', format: 'Listing', hook: 'Ruby Wine Lehenga', product: 'VL1102', status: 'Published' }
    ];
    var pub = [
      { id: 'pl1', at: offsetDate(-1) + ' 10:20', platform: 'amazon', product: 'VL1102', result: 'Published', note: 'ASIN assigned' },
      { id: 'pl2', at: offsetDate(-2) + ' 16:05', platform: 'instagram', product: 'VS0761', result: 'Published', note: '2.1k reach' }
    ];
    var brand = {
      colours: [{ n: 'Deep Purple', v: '#4A2D82' }, { n: 'Lavender', v: '#7B5EA7' }, { n: 'Gold', v: '#C4963A' }, { n: 'Dark', v: '#12091C' }],
      fonts: ['Cormorant Garamond', 'DM Sans', 'Jost'], logo: 'Vastrangam',
      whatsapp: '+91 87580 38161', site: 'vastrangam.com', shipFree: 1999
    };
    return {
      __v: 1, label: 'Vastrangam', products: products, runs: runs, assets: assets, templates: templates,
      channels: channels, calendar: cal, publog: pub, brand: brand, aiChat: [], provider: 'built-in',
      voiceMemory: ['User cut product-noun openers', 'Prefers concrete Surat karigar detail', 'Wants back/detail hero shots']
    };
  }
  function offsetDate(d) { var x = new Date(); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); }
  function seedTemplates() {
    var g = ['linear-gradient(135deg,#5B2D8E,#9B6FD8)', 'linear-gradient(135deg,#4A2D82,#C4963A)',
      'linear-gradient(135deg,#7B3FBE,#E67E22)', 'linear-gradient(135deg,#2E9E6B,#5B2D8E)',
      'linear-gradient(135deg,#C0392B,#C4963A)', 'linear-gradient(135deg,#12091C,#7B3FBE)'];
    return [
      { id: 't1', name: 'Instagram Post', w: 1080, h: 1080, bg: g[0] },
      { id: 't2', name: 'Instagram Story', w: 1080, h: 1920, bg: g[1] },
      { id: 't3', name: 'Sale Poster', w: 1080, h: 1350, bg: g[2] },
      { id: 't4', name: 'Web Banner', w: 1500, h: 500, bg: g[3] },
      { id: 't5', name: 'Festival Poster', w: 1080, h: 1350, bg: g[4] },
      { id: 't6', name: 'Reel Cover', w: 1080, h: 1920, bg: g[5] },
      { id: 't7', name: 'Marketplace Card', w: 1100, h: 1100, bg: g[0] },
      { id: 't8', name: 'YouTube Thumbnail', w: 1280, h: 720, bg: g[1] }
    ];
  }
  function demoRun(colour, fabric, work, occ, cat, price, sku, title) {
    return { id: 'r-' + sku, at: offsetDate(-Math.floor(Math.random() * 5)), sku: sku, cat: cat, colour: colour,
      fabric: fabric, work: work, occ: occ, label: 'Vastrangam', price: price, title: title, qa: 100, pack: null };
  }

  return {
    COLOURS: COLOURS, FABRICS: FABRICS, CRAFT: CRAFT, OCC: OCC, CATS: CATS, LABELS: LABELS, FEST: FEST,
    CHANNELS: CHANNELS, BANNED: BANNED, PRODUCT_NOUNS: PRODUCT_NOUNS,
    detectCategory: detectCategory, colourFamily: colourFamily, premiumColour: premiumColour, seed: seed
  };
})();
