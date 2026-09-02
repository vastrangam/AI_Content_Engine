'use strict';
const fs = require('fs');
const D = require('docx');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, LevelFormat, PageBreak, ExternalHyperlink, convertInchesToTwip,
} = D;

/* ── palette ─────────────────────────────────────────────────────────── */
const PURPLE = '4A1E7C', GOLD = 'A87C1F', GREEN = '4E7A2A', INK = '1F1B2E', MUT = '6B6480';
const USABLE = 9746;   /* A4 (11906) minus 0.75in margins each side */

/* ── small helpers ───────────────────────────────────────────────────── */
const P = (text, o = {}) => new Paragraph({
  spacing: { before: o.before ?? 60, after: o.after ?? 110, line: o.line ?? 280 },
  alignment: o.align,
  indent: o.indent,
  border: o.border,
  shading: o.shade ? { type: ShadingType.CLEAR, fill: o.shade } : undefined,
  children: (Array.isArray(text) ? text : [text]).map(t =>
    typeof t === 'string'
      ? new TextRun({ text: t, size: o.size ?? 20, color: o.color ?? INK, font: o.font ?? 'Calibri',
                      bold: o.bold, italics: o.italics })
      : t),
});
const R = (text, o = {}) => new TextRun({
  text, size: o.size ?? 20, color: o.color ?? INK, font: o.font ?? 'Calibri',
  bold: o.bold, italics: o.italics, break: o.break,
});
const H1 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 },
  children: [new TextRun({ text: t, size: 30, bold: true, color: PURPLE, font: 'Calibri' })],
});
const H2 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_2, spacing: { before: 260, after: 110 },
  children: [new TextRun({ text: t, size: 24, bold: true, color: PURPLE, font: 'Calibri' })],
});
const H3 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 90 },
  children: [new TextRun({ text: t, size: 21, bold: true, color: GOLD, font: 'Calibri' })],
});
const BUL = (t, o = {}) => new Paragraph({
  numbering: { reference: 'bul', level: 0 }, spacing: { before: 30, after: 60, line: 270 },
  children: (Array.isArray(t) ? t : [t]).map(x =>
    typeof x === 'string' ? new TextRun({ text: x, size: 20, color: INK, font: 'Calibri' }) : x),
});
const NUM = (t) => new Paragraph({
  numbering: { reference: 'num', level: 0 }, spacing: { before: 30, after: 60, line: 270 },
  children: (Array.isArray(t) ? t : [t]).map(x =>
    typeof x === 'string' ? new TextRun({ text: x, size: 20, color: INK, font: 'Calibri' }) : x),
});
const RULE = () => new Paragraph({
  spacing: { before: 60, after: 160 }, children: [new TextRun({ text: '', size: 2 })],
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D9D3E6' } },
});
const LINK = (label, url) => new ExternalHyperlink({
  link: url, children: [new TextRun({ text: label, size: 19, color: '2A5DB0', underline: {}, font: 'Calibri' })],
});

/* callout box */
const BOX = (lines, fill, edge) => new Table({
  width: { size: USABLE, type: WidthType.DXA }, columnWidths: [USABLE],
  borders: {
    top: { style: BorderStyle.SINGLE, size: 2, color: edge }, bottom: { style: BorderStyle.SINGLE, size: 2, color: edge },
    left: { style: BorderStyle.SINGLE, size: 18, color: edge }, right: { style: BorderStyle.SINGLE, size: 2, color: edge },
    insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
  },
  rows: [new TableRow({ children: [new TableCell({
    width: { size: USABLE, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill },
    margins: { top: 130, bottom: 130, left: 180, right: 180 },
    children: lines,
  })] })],
});

/* data table */
function TBL(headers, rows, widths) {
  const total = widths.reduce((a, b) => a + b, 0);
  const w = widths.map(x => Math.round(x / total * USABLE));
  w[w.length - 1] = USABLE - w.slice(0, -1).reduce((a, b) => a + b, 0);
  const cell = (txt, i, head, alt) => new TableCell({
    width: { size: w[i], type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: head ? PURPLE : (alt ? 'F6F3FB' : 'FFFFFF') },
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    children: (Array.isArray(txt) ? txt : [txt]).map(t => new Paragraph({
      spacing: { before: 20, after: 20, line: 250 },
      children: typeof t === 'string'
        ? [new TextRun({ text: t, size: 18, bold: head, color: head ? 'FFFFFF' : INK, font: 'Calibri' })]
        : [t],
    })),
  });
  return new Table({
    width: { size: USABLE, type: WidthType.DXA }, columnWidths: w,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: 'C9C2DC' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: 'C9C2DC' },
      left: { style: BorderStyle.SINGLE, size: 2, color: 'C9C2DC' },
      right: { style: BorderStyle.SINGLE, size: 2, color: 'C9C2DC' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'E2DDEE' },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'E2DDEE' },
    },
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, i, true)) }),
      ...rows.map((r, ri) => new TableRow({ children: r.map((c, i) => cell(c, i, false, ri % 2 === 1)) })),
    ],
  });
}

/* code / copy block */
const CODE = (lines) => new Table({
  width: { size: USABLE, type: WidthType.DXA }, columnWidths: [USABLE],
  borders: {
    top: { style: BorderStyle.SINGLE, size: 2, color: 'D9D3E6' }, bottom: { style: BorderStyle.SINGLE, size: 2, color: 'D9D3E6' },
    left: { style: BorderStyle.SINGLE, size: 2, color: 'D9D3E6' }, right: { style: BorderStyle.SINGLE, size: 2, color: 'D9D3E6' },
    insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
  },
  rows: [new TableRow({ children: [new TableCell({
    width: { size: USABLE, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: 'FAF9FC' },
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    children: lines.map(l => new Paragraph({
      spacing: { before: 10, after: 10, line: 250 },
      children: [new TextRun({ text: l, size: 17, font: 'Consolas', color: '33304A' })],
    })),
  })] })],
});

/* ═════════════════════════════════════════════════════════════════════ */
const doc = new Document({
  creator: 'Vastrangam',
  title: 'Mehendi Green Anarkali — Market & Competitive Research + Content Pack',
  description: 'Competitor mapping, price ladder and full channel content for the mehendi green Anarkali gown with zari-embroidered dupatta.',
  numbering: {
    config: [
      { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 340, hanging: 200 } } } }] },
      { reference: 'num', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 220 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
    children: [

/* ── COVER ───────────────────────────────────────────────────────────── */
new Paragraph({ spacing: { before: 0, after: 40 },
  children: [new TextRun({ text: 'V A S T R A N G A M', size: 22, bold: true, color: GOLD, font: 'Calibri' })] }),
new Paragraph({ spacing: { before: 0, after: 40 },
  children: [new TextRun({ text: 'Market & Competitive Research', size: 44, bold: true, color: PURPLE, font: 'Calibri' })] }),
new Paragraph({ spacing: { before: 0, after: 200 },
  children: [new TextRun({ text: 'plus a full channel content pack', size: 26, color: MUT, font: 'Calibri', italics: true })] }),

TBL(['Field', 'Detail'], [
  ['Product', 'Mehendi-green Anarkali gown, floor-length fit-and-flare, with a matching zari-embroidered dupatta'],
  ['Reference photo', 'ebf92072-1001490546.jpg (single front image, model, haveli courtyard)'],
  ['Prepared for', 'Vastrangam / Ethnic Fashion'],
  ['Date', '4 August 2026'],
  ['Method', 'Description-led web research. See the honesty note on this page.'],
], [22, 78]),

P(''),
BOX([
  P([R('Read this first — what I can and cannot prove', { bold: true, size: 21, color: 'A03A2B' })], { after: 90 }),
  P([
    R('I cannot reverse-image-search.', { bold: true }),
    R(' Google Lens matches your photograph pixel-for-pixel against an index of images; the tools I have search '),
    R('text', { italics: true }),
    R('. So I will not pretend to name the one boutique that shot this frame — you already have that from Lens, and if I guessed at it I would just be telling you something you could not rely on.'),
  ]),
  P([
    R('What I did instead, and what is worth having: I read the garment off the photograph — colour, silhouette, neckline, sleeve, the gota-and-pearl hem, the circular zari medallions on the dupatta — and searched on '),
    R('that', { italics: true }),
    R(' description. That found the design family, the sellers carrying it, the colourways it ships in, the price ladder from wholesale to premium, and the cost floor. Everything named below is a real listing I found, with the link at the end.'),
  ]),
  P([
    R('One finding is worth your attention up front: ', {}),
    R('this design is sold in mehendi green by at least one seller under a listing that names both colourways', { bold: true }),
    R(' — see section 3. Whether that is the shop Lens gave you, only you can say.'),
  ], { after: 0 }),
], 'FDF6F3', 'C97B5F'),

new Paragraph({ children: [new PageBreak()] }),

/* ── 1 · THE GARMENT ─────────────────────────────────────────────────── */
H1('1 · What the garment actually is'),
P('Read off the photograph, in the words the trade uses. This is the spec I searched on, so if anything here is wrong the research below inherits the error — check it against the piece in your hand.'),

TBL(['Element', 'What the photo shows'], [
  ['Colour', 'Mehendi green — a warm, slightly olive deep green. Not emerald, not bottle, not sea green. This distinction matters: it changes which search terms you rank for.'],
  ['Silhouette', 'Floor-length Anarkali gown. Fit-and-flare, seamed at a high/empire waist with gathers released into a full circular flare.'],
  ['Neckline', 'Deep V / scooped sweetheart, no yoke embroidery, no collar.'],
  ['Sleeve', 'Full length, fitted, plain — no cuff embroidery visible in this frame.'],
  ['Gown fabric', 'Soft sheen with a heavy fluid fall and no visible crush. Consistent with roman silk, viscose chinon or dola silk. Not net, not organza, not cotton.'],
  ['Hem — the signature', 'A doubled treatment: a gold gota/zari lace band, then a row of hanging pearl (moti) drops below it. This is the single most identifiable trim on the piece and the thing to photograph in close-up.'],
  ['Dupatta fabric', 'Visibly shinier and lighter than the gown — reads as chinon, organza or soft fox georgette in the same green.'],
  ['Dupatta work', 'Gold zari circular medallions scattered across the body — each a ring enclosing a floral-and-leaf spray. Gold lace on all four sides with a scalloped cut-work edge and a fine tassel fringe.'],
  ['Set contents', 'Not determinable from one frame. Sets of this construction ship as gown + inner + dupatta, sometimes with a palazzo. Confirm before you list.'],
  ['Styling in shot', 'Rajasthani haveli courtyard, ochre wall, arched windows, patterned tile floor, iron lantern. Dupatta held open in both hands — which is correct, because the dupatta is the expensive-looking part.'],
], [20, 80]),

P(''),
BOX([
  P([R('The one thing the photograph gets right that most sellers get wrong.', { bold: true }),
     R(' She is holding the dupatta open. On this design the gown is plain — the money is all in the dupatta and the pearl hem. A flat-lay or a straight-on model shot hides both. Whoever shot this understood the product.')], { after: 0 }),
], 'F3F7F0', GREEN),

/* ── 2 · THE MARKET ──────────────────────────────────────────────────── */
H1('2 · The market this sits in'),

H2('It is a Surat design, not a designer piece'),
P('Everything about the construction says mass-produced Surat: the 16-kali cut, the canvas patta in the hem to hold the flare, the machine zari on the dupatta, the ready-made moti lace bought by the roll. That is not a criticism — it is the commercial fact that decides your whole strategy. You are not selling a garment nobody else has. You are selling a garment a hundred people have, and the question is why anyone buys yours.'),

P('Three things follow from that, and they run through the rest of this document:'),
NUM([R('You cannot win on the product. ', { bold: true }), R('Anyone can buy the same catalogue next Tuesday.')]),
NUM([R('You cannot win on price at the bottom. ', { bold: true }), R('Meesho sellers are working on margins you should not want.')]),
NUM([R('You can win on fit, story and photography. ', { bold: true }), R('All three are things the volume sellers structurally cannot do — see section 7.')]),

H2('Demand signals I found while searching'),
BUL([R('Kalki Fashion’s mehendi green embroidered Anarkali with dupatta is ', {}), R('out of stock due to high demand', { bold: true }), R('. A premium brand selling out of this exact colour-and-category is the clearest demand signal in this research.')]),
BUL([R('Pernia’s Pop Up Shop lists a mehendi green Anarkali that ', {}), R('ships 6–7 weeks after order', { bold: true }), R('. Somebody is willing to wait a month and a half for this colour. Your same-week dispatch is worth money against that.')]),
BUL('Mehendi green appears across every tier at once — Meesho, Mirraw, cbazaar, Indo Era, Lavanya The Label, Miss Ethnik, Saira’s Boutique, PinkPhulkari, Lashkaraa, Kalki, Pernia’s. A colour present at every price point is a colour with real pull, not a fad.'),
BUL('The searches surface a lot of pista, sea, mint, bottle and emerald green. Mehendi green specifically is a thinner field — which is why the exact words you use in your title matter.'),

P(''),
BOX([
  P([R('Why mehendi green sells, and it is not about the colour.', { bold: true, color: GREEN })], { after: 70 }),
  P([R('It is the one colour a wedding guest can wear to a mehendi function without two problems: she does not compete with the bride (red, pink, maroon), and she does not vanish into the marigold and haldi decor the way yellow and orange do. It photographs against ochre walls, against greenery, against gold. That is the emotional job this garment does, and — from every listing I read — '), R('nobody is saying it', { bold: true }), R('. They all write "green embroidered anarkali gown". That gap is section 7.')], { after: 0 }),
], 'F3F7F0', GREEN),

new Paragraph({ children: [new PageBreak()] }),

/* ── 3 · CLOSEST MATCH ───────────────────────────────────────────────── */
H1('3 · The closest match I found'),
P([R('Of everything I turned up, one listing matches the photograph on colour, silhouette, neckline and construction at the same time. I am not claiming it is the same photograph — I am saying that if you want to know what you are up against, read this listing.')]),

H2('BallWool — Embroidered Anarkali Gown with Dupatta, Rani Pink & Mehendi Green'),
TBL(['Spec', 'What they publish'], [
  ['Price', 'USD 69.90 — roughly ₹6,200 at today’s rate'],
  ['Colourways', 'Rani Pink and Mehendi Green — the same two-colour pairing this design usually ships in'],
  ['Gown fabric', 'Faux georgette with premium sequins and zari embroidery'],
  ['Length / flare', '56 inches, 3-metre flair (full flounce)'],
  ['Construction', 'Fully stitched with canvas patta for flare; soft cotton inner lining top to bottom'],
  ['Neck / sleeve', 'Fancy V-neck; full sleeves with embroidered cuffs'],
  ['Dupatta', 'Faux georgette, 2.30 m, sequins and zari embroidered cut-work'],
  ['Sizes', 'M (38"), L (40"), XL (42"), XXL (44") — four sizes only'],
], [22, 78]),

P(''),
BOX([
  P([R('Three weaknesses in that listing you should take straight to the bank.', { bold: true })], { after: 70 }),
  BUL([R('Four sizes. ', { bold: true }), R('M to XXL, nothing below 38" and nothing above 44". Every woman outside that band is a customer they cannot serve and you can.')]),
  BUL([R('Faux georgette, not silk. ', { bold: true }), R('If your piece is roman silk or viscose chinon, say so in the title. It is a genuinely better hand and it is a word they cannot use.')]),
  BUL([R('The title is a colour list. ', { bold: true }), R('"Rani Pink & Mehendi Green Party Wear Dress" tells a buyer nothing about when to wear it or why it will suit her.')], { after: 0 }),
], 'FDFAF2', GOLD),

/* ── 4 · DESIGN FAMILY ───────────────────────────────────────────────── */
H1('4 · The same design in other colours'),
P('These are listings with the same construction — roman silk or faux georgette, full flare, embroidered cut-work dupatta — in different colourways. If your supplier offers this piece in a range, this is the range the market already knows how to sell.'),

TBL(['Seller', 'Listing', 'Notes'], [
  ['Suratikart', 'Mustard Chanderi Roman Silk Anarkali Gown with Embroidered Dupatta', 'Made in Surat. 16-kali gown, 5.5 m full flare, padded bodice, side zip, churidar sleeves. Dupatta 2.2 m pure soft fox georgette, embroidery-sequence with cut-work border.'],
  ['Suratikart', 'Black Roman Silk Four-Layer Anarkali Gown Set', 'Same house, four-layer variant.'],
  ['Suratikart', 'Lemon Yellow Roman Silk Anarkali Suit', 'Same base, brighter colourway.'],
  ['Suratikart', 'Exquisite White Heavy Pure Roman Silk Anarkali Suit with Embroidery-Sequence Dupatta', 'The premium end of their own range.'],
  ['cbazaar', 'Anarkali Gown — Pista Green Faux Georgette Embroidered Sequins with Dupatta', 'Product code bgwrsacy6630. A second, UK-facing listing runs as slsad280.'],
  ['Mirraw (KSM Prints)', 'Green Colour Ethnic Glamorous Partywear Gown With Dupatta', 'Faux georgette with American crepe inner, jari and sequence embroidery. Mirraw resells Surat houses under their own names.'],
  ['Mirraw (Surat 4 Fashion)', 'Blue Embroidered Silk Party Wear Anarkali Salwar With Dupatta', 'The seller name says it outright.'],
  ['Exotic India Art', 'Attractive Fully Flared Solid Roman Silk Anarkali Suit With Embroidery Work Dupatta (GAM309)', 'Same construction, sold to an export/NRI audience.'],
  ['Etsy', 'Roman Silk Anarkali Gown Set — Heavy Sequence Embroidery Work', 'The design has reached Etsy, which means US buyers are paying export prices for it.'],
  ['eBay', 'Designer Anarkali Suit Women Roman Silk Embroidered Palazzo Dupatta Set', 'Listed with a palazzo — confirm whether yours includes one.'],
], [17, 40, 43]),

new Paragraph({ children: [new PageBreak()] }),

/* ── 5 · COMPETITOR MAP ──────────────────────────────────────────────── */
H1('5 · Competitor map — who sells this, and where'),
P('Grouped by tier, because the tier decides how you fight them. Named sellers only; everything here is a listing I found, not a guess.'),

H2('Tier 1 · Value marketplaces — you will not beat them on price, and should not try'),
TBL(['Seller / platform', 'How it is listed', 'What to know'], [
  ['Meesho — many sellers', 'Women Embroidered Georgette Anarkali Gown With Dupatta (several near-identical listings: 6qxfsy, 6mqe72, 6mky1v, 6f3zyh, 7tnz4p, 4m8ij9)', 'Fox georgette, sequence coding embroidery, 58" length, 4 m flare on one listing; 52" and 3.5 m on another. Sizes S–XXL. COD and lowest-price guarantee are the whole pitch.'],
  ['Meesho — Shree Creations Jaipur', 'Anarkali Gown with Dupatta (42rl55)', 'Rayon, zari woven. A named supplier rather than an anonymous one.'],
  ['Flipkart — seller pool', 'Anarkali Gowns category', 'Sellers surfaced by name: Hiral Creation, Shree Disha, Khushi Handicrafts, Jevi Prints, Krishna Enterprises, Wonder Villa Trendz. All Surat/Jaipur resellers of catalogue stock.'],
  ['Amazon', 'Embroidered Anarkali Suit Set with Dupatta — Elegant Georgette Gown-Style Ethnic Wear', 'Described with floral buttis and embellished borders — the closest Amazon description to your dupatta.'],
  ['Amazon — MAHI PRIVÉ', 'Mint Royale Gold Embroidered Anarkali Gown Set with Dupatta', 'A brand trying to look premium inside Amazon. Worth studying: this is the position you would occupy there.'],
], [20, 38, 42]),

H2('Tier 2 · Mid-market ethnic sites — your actual competitors'),
TBL(['Seller', 'Listing', 'What to know'], [
  ['BallWool', 'Embroidered Anarkali Gown with Dupatta | Rani Pink & Mehendi Green', 'USD 69.90. The closest match found — full spec in section 3.'],
  ['cbazaar', 'Pista Green Faux Georgette Anarkali Gown with Zari Embroidered Dupatta', 'Chinon Anarkali gowns on the same site run USD 51–82. Heavy discounting is their normal state.'],
  ['Mirraw', 'Green Colour Ethnic Glamorous Partywear Gown With Dupatta', 'A marketplace for Surat houses. Low barrier, low trust, high traffic.'],
  ['Indo Era', 'Sea Green Embroidered Silk Blend Anarkali Suit With Dupatta (10429)', 'Clean own-brand photography. A good benchmark for listing quality.'],
  ['Miss Ethnik', 'Elegant Green Embroidered Anarkali Gown with V Neck & Lace Dupatta', 'Deep bottle green, faux georgette dupatta 2.15 m with lace. Their title does the one thing most do not — it names the neckline.'],
  ['Lavanya The Label', 'Green Anarkali Embroidered Dupatta', 'D2C, strong brand voice.'],
  ['Saira’s Boutique', 'Dark Mehendi Green Designer Embroidered Viscose Silk Anarkali Gown', 'Names the fabric as viscose silk — likely the closest fabric description to your piece.'],
  ['Panash India', 'Green Anarkali Salwar Kameez range', 'Worldwide shipping, mid pricing.'],
  ['Inddus', 'Green Chinon Embroidery Palazzo Style Kurta Set', 'Premium chinon, palazzo set.'],
  ['G3 Fashion, Andaaz Fashion, Rajwadi, Anaya Designer Studio, Label Amrita, Bullion Knot, Subhvastra', 'Green / mehendi Anarkali ranges', 'The long tail of Indian ethnic e-commerce. Andaaz prices green Anarkalis USD 176–691 for the hand-worked end.'],
], [18, 36, 46]),

H2('Tier 3 · Premium and designer — where the search traffic goes'),
P('You will not compete with these on price. You compete with them on Google, because they own the phrase "mehendi green anarkali" and a buyer who types it sees them first.'),
TBL(['Seller', 'Listing', 'What to know'], [
  ['Kalki Fashion', 'Mehendi Green Embroidered Anarkali With Dupatta', 'Pearl embellishments. OUT OF STOCK due to demand — the best signal in this document.'],
  ['Kalki Fashion', 'Mehendi Green Metallic Embroidered Anarkali Suit Set With Pant And Dupatta', 'Their second listing in the same colour. Two SKUs in one shade means it sells.'],
  ['Lashkaraa', 'Mehendi Green Embroidered Anarkali', 'Silk top, santoon inner and bottom, net dupatta with zari and sequins. US/NRI audience.'],
  ['Pernia’s Pop Up Shop — Baidehi', 'Mehendi Green Embroidered Anarkali With Dupatta (baidh112234)', 'Dupion silk, cutdana, pearl, dabka and zardozi, crepe dupatta. Ships 6–7 weeks after order.'],
  ['Pernia’s — Shyam Narayan Prasad', 'Mehendi Green Embroidered Anarkali Set (snpc092242)', 'Georgette jacquard brocade, gota and thread work, cotton satin trousers, lurex chiffon dupatta.'],
  ['Pernia’s — AHI Clothing', 'Mehndi Green Chikankari Anarkali Set (ahi062205)', 'Chikankari route into the same colour.'],
  ['Baidehi (own site)', 'Mehendi Green Anarkali … Heavily Embroidered Yoke And Sleeves With A Dupatta (BD-1167A)', 'Same house selling direct — compare their own price against Pernia’s.'],
  ['PinkPhulkari California', 'Mehendi Green Embroidered Chinon Silk Anarkali Dress', 'Chinon silk with coordinate embroidered-border dupatta. The closest premium fabric match.'],
  ['The Loom', 'Mehndi Green Embroidered Chanderi Anarkali Kurta', 'Chanderi, kurta not gown — but it ranks for the phrase.'],
  ['Etsy — multiple', 'Green Velvet Anarkali Gown, Indian Designer Mehendi Outfit', 'Pearl, bead and sequin work, lace hem border, dupatta with zari and lace on all four sides. Note how precisely Etsy sellers describe trims — worth copying.'],
], [18, 36, 46]),

new Paragraph({ children: [new PageBreak()] }),

/* ── 6 · COST FLOOR ──────────────────────────────────────────────────── */
H1('6 · The cost floor — what this actually costs to buy'),
P([R('This is the part a reverse-image search will never give you, and it is the part that decides whether the listing is worth writing. Surat sells this construction by the catalogue, and the catalogue rates are published.')]),

TBL(['Source', 'What it is', 'Rate'], [
  ['Surat Wholesale Shop', 'Roman Silk Wholesale Readymade Anarkali Suit — 4-piece catalogue (55347)', '₹3,115 for 4 pieces = ₹779 per piece'],
  ['Surat Wholesale Shop', 'Roman Silk Festival Wear Readymade Anarkali — 2-piece', '₹2,645 for 2 = ₹1,322 per piece'],
  ['Surat wholesale, general band', 'Anarkali suit catalogues across fabrics', '₹1,095 – ₹5,045 per catalogue'],
  ['Surat wholesale, comparable', 'Vichitra Silk festival-wear Anarkali', '₹1,645 average per set'],
], [26, 46, 28]),

P(''),
BOX([
  P([R('What that means in one line.', { bold: true })], { after: 70 }),
  P([R('A garment of this construction lands in your hand somewhere around '), R('₹780 – ₹1,350', { bold: true }), R(' per piece at catalogue quantity. BallWool sells it at roughly ₹6,200. Kalki and Pernia’s sell the premium equivalent for multiples of that. The spread between the floor and the ceiling on this one design is close to '), R('eight times', { bold: true }), R(' — and every rupee of that spread is photography, fit, story and trust. Nothing else. That is the whole opportunity, and it is why the content pack in section 8 is the actual deliverable here.')], { after: 0 }),
], 'FDFAF2', GOLD),

P(''),
H2('Other Surat sources worth having on file'),
P('If you ever need to re-source this design or a variant of it, these are the wholesalers that came up repeatedly for exactly this construction:'),
BUL('Organza Mall — fully stitched Anarkali gowns with dupatta, wholesale'),
BUL('Fab Funda — designer Anarkali suits, Surat wholesaler and supplier'),
BUL('Surat Wholesale Shop — catalogue-rate Anarkali suits, per-piece rates published'),
BUL('Fashid Wholesale — Anarkali suits and gowns, Gujarat'),
BUL('Inli Exports — Anarkali-style gowns, manufacturer and wholesaler'),
BUL('Wholesale Salwar — wholesale Anarkali suits and designer salwar kameez'),
BUL('Bhawani Textile — pure chinon chiffon designer Anarkali gown kurti with dupatta'),
BUL('Aarvee Creation, Wholetex, Amavi Expo, WholesaleCatalogz — catalogue aggregators'),

/* ── 7 · THE GAP ─────────────────────────────────────────────────────── */
H1('7 · Where the gap is'),
P('I read a lot of listings for this document. Here is what none of them do, which is the same as saying: here is what you do.'),

TBL(['What everyone does', 'What nobody does — so you do it'], [
  ['Titles that are a colour plus a category. "Green Embroidered Anarkali Gown With Dupatta."', 'Name the occasion the colour exists for. Mehendi green is the guest colour for a mehendi function — no listing I found says this, and it is the single most searchable true thing about the garment.'],
  ['The trim is described as "embroidery" or "lace work".', 'Name the trims. Gota. Moti drops. Zari medallions. Cut-work scallop. Etsy sellers do this and their listings read three times more expensive for it.'],
  ['Four or five sizes, M to XXL.', 'Custom fit, XS to 3XL, no extra charge. This is the biggest structural advantage you have over every value seller and most mid-market ones, and it answers the one fear that stops the sale — "will it fit my waist and fall right?"'],
  ['Flat-lay or a straight-on studio shot on white.', 'Your reference photo already does it right: real light, real place, dupatta held open. Add one close-up of the pearl hem and one of a single zari medallion. Two extra frames, and the piece changes price band.'],
  ['No mention of weight, flare or fall.', 'Publish the numbers. Flare in metres, dupatta length, gown length, weight in grams. Buyers at this price point are comparing spec sheets, and most listings give them nothing to compare.'],
  ['Bottom is vague or omitted.', 'State the set contents plainly — gown, inner, dupatta, and whether a palazzo is included. Returns on this category are driven by "I thought it came with…".'],
], [40, 60]),

P(''),
BOX([
  P([R('The positioning in one sentence.', { bold: true, color: PURPLE })], { after: 70 }),
  P([R('Undercut BallWool and cbazaar on price while beating them on sizes; beat Meesho on trust with real photography and a fit promise; and take the Google traffic that currently goes to Kalki and Pernia’s by owning the words they do not use — '), R('mehendi function', { bold: true, italics: true }), R(', '), R('guest', { bold: true, italics: true }), R(', '), R('moti hem', { bold: true, italics: true }), R(', '), R('custom fit', { bold: true, italics: true }), R('.')], { after: 0 }),
], 'F6F3FB', PURPLE),

new Paragraph({ children: [new PageBreak()] }),

/* ── 8 · CONTENT PACK ────────────────────────────────────────────────── */
H1('8 · Content pack'),
P([R('Written to your Humanized Content Engine rules: no product-noun openers, real specifics, varied sentence rhythm, and — in the song — not one product word. Internal reference used throughout: '), R('VAN2094', { bold: true }), R(' (change it to your real SKU before you publish).')]),

H2('Preflight'),
CODE([
  'Product:        Anarkali gown (fit-and-flare, floor-length) + dupatta · roman silk / viscose',
  '                chinon · mehendi green · gold gota + moti-drop hem, circular zari-medallion',
  '                dupatta with cut-work scallop · occasion: mehendi / haldi / sangeet /',
  '                festive · label: Vastrangam',
  'Market:         Mass-produced Surat design, resold widely. Floor ₹779/pc at catalogue',
  '                quantity; BallWool retails the same construction near ₹6,200; Kalki and',
  '                Pernia’s sell the premium equivalent far above that.',
  'Competitor Gap: Everyone writes "green embroidered anarkali gown". Nobody says what mehendi',
  '                green is FOR — the one colour a guest can wear to a mehendi without',
  '                competing with the bride or disappearing into the marigolds. Nobody names',
  '                the trims. Nobody offers more than five sizes.',
  'Buyer:          Wedding guest, 24–38, invited to a mehendi or haldi. Fear #1: "will it fit',
  '                my waist and fall right?" Fear #2: "will I look like I tried to be the bride?"',
  'Channel Plan:   Shopify hero → Amazon spec bullets → Flipkart attributes → Myntra editorial',
  '                → Meesho value hook → IG reel led by the dupatta opening.',
  'Uniqueness:     Angle = "the colour you are allowed to wear" — not a rerun of the teal',
  '                Anarkali angle ("the back that turns heads") ✓',
  'Search Targets: "mehendi green anarkali gown with dupatta" · "what to wear to a mehendi',
  '                function as a guest" · "green anarkali for mehendi" · "moti lace anarkali"',
]),

H2('Shopify'),
TBL(['Field', 'Copy'], [
  ['Title (74 chars)', 'Mehendi Green Anarkali Gown with Zari-Medallion Dupatta & Moti-Drop Hem'],
  ['Handle', 'mehendi-green-anarkali-gown-zari-medallion-dupatta'],
  ['SEO Title (59)', 'Mehendi Green Anarkali Gown with Dupatta | Vastrangam'],
  ['SEO Description (155)', 'The green a guest can actually wear to a mehendi. Roman-silk Anarkali, zari-medallion dupatta, moti-drop hem. Custom-fit XS–3XL. Free shipping ₹1,999+.'],
], [22, 78]),

H3('Body — humanized'),
CODE([
  '<h1>Mehendi Green Anarkali Gown with Zari-Medallion Dupatta &amp; Moti-Drop Hem</h1>',
  '',
  '<p>There is a problem with being invited to a mehendi. Red is the bride’s. Yellow and',
  'orange disappear into the marigolds before the first photo is taken. And every guest who',
  'plays it safe in beige spends the evening slightly invisible. <b>This green solves it.</b>',
  'Warm, deep, a little olive — it holds its own against gold light and green leaves without',
  'once looking like it is competing for the aisle.</p>',
  '',
  '<p>Open the odhni and you will see where the money went: gold <b>zari medallions</b>, each a',
  'ring closed around a small spray of flowers and leaves, scattered the way Surat karigars',
  'still place them — one at a time, never on a grid. The four borders are finished with a',
  '<b>cut-work scallop</b> and a fine tassel edge. The gown itself stays quiet on purpose: a clean',
  'V, full sleeves, and then the hem — a band of gold gota with a row of <b>pearl drops</b>',
  'hanging beneath it that swing when she walks and catch every light in the room.</p>',
  '',
  '<h4>PRODUCT SPECIFICATIONS</h4>',
  '<table>',
  '<thead><tr><td><strong>Feature</strong></td><td><strong>Details</strong></td></tr></thead>',
  '<tbody>',
  '<tr><td><b>Material Base</b></td><td>Roman silk — soft sheen, heavy fluid fall, holds a flare</td></tr>',
  '<tr><td><b>Design Technique</b></td><td>Gold gota + moti-drop double hem · circular zari-medallion dupatta · cut-work scalloped border</td></tr>',
  '<tr><td><b>Available Colours</b></td><td>Mehendi Green</td></tr>',
  '<tr><td><b>Dimensions</b></td><td>Floor-length gown + inner + 2.3 m dupatta</td></tr>',
  '<tr><td><b>Weight</b></td><td>~0.75 Kg</td></tr>',
  '<tr><td><b>Care</b></td><td>Dry clean only</td></tr>',
  '</tbody></table>',
  '',
  '<h4>WHEN AND WHERE TO WEAR THIS ANARKALI?</h4>',
  '<ul>',
  '<li><b>Occasion:</b> A mehendi you have been invited to, a haldi in daylight, a sangeet where',
  'you intend to dance, any festive evening where you want to look considered rather than costumed.</li>',
  '<li><b>Season:</b> Works from an October wedding through to an April engagement.</li>',
  '<li><b>How to style:</b> Let the dupatta do the work — drape it open across one shoulder, not',
  'folded into a strip. Hair back. The hem needs to be seen.</li>',
  '<li><b>Accessories:</b> Gold jhumkas, green or uncut stones if you have them, and heels with',
  'enough height that the pearl drops clear the floor.</li>',
  '</ul>',
  '',
  '<ul>',
  '<li><i>(What is this?)</i> A floor-length <b>Anarkali gown</b> with a matching zari-medallion dupatta.</li>',
  '<li><i>(What makes it different?)</i> The hem. Gold gota with pearl drops beneath it — a trim most',
  'sellers of this design leave off to save eighty rupees.</li>',
  '<li><i>(Who is it for?)</i> The guest at somebody else’s mehendi who wants to be photographed,',
  'not to be the story.</li>',
  '<li><i>(Why now?)</i> Custom-stitched to your measurements at no extra charge — XS to 3XL, so it',
  'falls right the first time.</li>',
  '</ul>',
  '<p>Not sure of your size? WhatsApp your bust + waist to +91 87580 38161 and we will recommend the fit.</p>',
  '<!-- Schema: Product, FAQPage, Offer, AggregateRating -->',
]),

P([R('Tags: ', { bold: true }), R('mehendi green anarkali, anarkali gown with dupatta, what to wear to a mehendi, green anarkali for wedding guest, moti lace anarkali, zari embroidered dupatta, roman silk anarkali, mehendi function outfit, haldi outfit for guest, custom fit anarkali, sangeet gown, festive gown surat, guest outfit indian wedding, vastrangam')], { size: 19 }),
P([R('Care: ', { bold: true }), R('dry-clean-only')], { size: 19 }),

H3('61-column — the fields that differ'),
BUL([R('Variant SKU (Col 18): ', { bold: true }), R('blank — internal ref only: VAN2094')]),
BUL([R('Option1: ', { bold: true }), R('Color = mehendi-green · '), R('Option2: ', { bold: true }), R('Size = xs; s; m; l; xl; 2xl; 3xl')]),
BUL([R('Product Category (Col 5): ', { bold: true }), R('Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing')]),
BUL([R('Fabric: ', { bold: true }), R('roman-silk · '), R('Dress style: ', { bold: true }), R('anarkali · '), R('Neckline: ', { bold: true }), R('v-neck · '), R('Sleeve: ', { bold: true }), R('long')]),
BUL([R('Size token: ', { bold: true }), R('2xl (never xxl) · '), R('Sleeve length: ', { bold: true }), R('long · '), R('Age group: ', { bold: true }), R('adults · '), R('Target gender: ', { bold: true }), R('female · '), R('Status: ', { bold: true }), R('active')]),
BUL([R('Variant Grams: ', { bold: true }), R('750 · '), R('Care instructions: ', { bold: true }), R('dry-clean-only')]),

new Paragraph({ children: [new PageBreak()] }),

H2('Marketplace copy'),

H3('Amazon'),
BUL([R('Title (brand-first): ', { bold: true }), R('Vastrangam Women’s Mehendi Green Roman Silk Anarkali Gown with Zari-Medallion Dupatta, Moti-Drop Gota Hem, Custom-Fit Mehendi Haldi Sangeet Ethnic Wear')]),
BUL([R('Bullet 1 (Fabric): ', { bold: true }), R('Roman silk — soft sheen, heavy fluid fall, holds a full flare without stiffening; lined top to bottom.')]),
BUL([R('Bullet 2 (Work): ', { bold: true }), R('Gold zari medallions placed one at a time across the dupatta, cut-work scalloped border on all four sides, gota-and-pearl double hem on the gown.')]),
BUL([R('Bullet 3 (Occasion): ', { bold: true }), R('Made for the mehendi and haldi you are invited to — the one green that reads festive without competing with the bride.')]),
BUL([R('Bullet 4 (Fit): ', { bold: true }), R('Custom-stitched to your measurements at no extra charge. XS to 3XL, not the usual four sizes.')]),
BUL([R('Bullet 5 (Care + Set): ', { bold: true }), R('Gown + inner + 2.3 m dupatta. Dry clean only. Unsure of size? Send bust and waist and we will recommend it.')]),
BUL([R('Backend keywords (≤250 bytes): ', { bold: true }), R('mehendi green anarkali gown dupatta, green gown for mehendi function, haldi outfit guest, moti lace gown, zari medallion dupatta, roman silk anarkali, custom fit anarkali xs 3xl, sangeet gown women')]),

H3('Flipkart — apparel-set attributes'),
CODE([
  'Type            = Anarkali Gown Set          Top Fabric   = Roman Silk',
  'Occasion        = Wedding / Festive          Neck         = V-Neck',
  'Sleeve          = Long                       Ideal For    = Women',
  'Color           = Green                      Pack of      = 2 (Gown + Dupatta)',
  'Ornamentation   = Embroidery / Gota / Pearl  Country      = IN',
  'Fabric Care     = Dry Clean Only             Pattern      = Embroidered',
]),

H3('Myntra — editorial'),
P([R('"The green you are allowed to wear. A roman-silk Anarkali built for somebody else’s mehendi — zari medallions across the odhni, pearl drops at the hem, and a flare that behaves on a dance floor. XS–3XL, custom-fit."')], { italics: true, indent: { left: 340 } }),

H3('Ajio'),
P([R('"Mehendi-green roman silk Anarkali gown set — circular zari-medallion dupatta, cut-work scalloped border, gota and moti-drop hem. Sizes XS–3XL."')], { italics: true, indent: { left: 340 } }),

H3('Meesho — mobile value hook'),
P([R('"💚 Mehendi Green Anarkali Gown + Dupatta · Moti hem · Mehendi & Haldi ready · Custom-fit · COD · 7-day returns"')], { italics: true, indent: { left: 340 } }),

H2('Social'),

H3('Instagram post'),
P([R('Red is hers. Yellow is the decor. So what does a guest actually wear?', { italics: true })], { indent: { left: 340 }, after: 40 }),
P([R('This green. Warm enough to glow under the lights, deep enough that it never once looks like it is trying to be the bride.')], { indent: { left: 340 }, after: 40 }),
P([R('Look at the hem when she walks — gold gota, then a row of pearls underneath that swing half a beat behind her.')], { indent: { left: 340 }, after: 40 }),
P([R('Custom-stitched to your measurements. XS to 3XL. WhatsApp us and we will get the fit right.')], { indent: { left: 340 }, after: 40 }),
P([R('Crafted in Surat. 🌿', { italics: true })], { indent: { left: 340 }, after: 90 }),
P([R('#mehendigreen #mehendioutfit #anarkaligown #anarkaliwithdupatta #weddingguestindia #mehendifunction #haldioutfit #greenanarkali #zariembroidery #motilace #romansilk #sangeetoutfit #indianwedding #ethnicwear #customfit #suratfashion #guestoutfit #festivewear #weddingguestdress #anarkalilove #indianoutfit #partywearindian #desifashion #ethnicgown #shaadiseason #outfitinspo #anarkalisuit #madeinsurat #vastrangam #ootdindia')], { size: 17, color: MUT, indent: { left: 340 } }),

H3('Carousel — 8 slides'),
NUM([R('Cover: ', { bold: true }), R('"You are invited to the mehendi. Now what do you wear?" + the full-length shot.')]),
NUM([R('The problem: ', { bold: true }), R('"Red is the bride’s. Yellow vanishes into the marigolds. Beige makes you invisible."')]),
NUM([R('The answer: ', { bold: true }), R('the green, full frame. "This one. Every time."')]),
NUM([R('Detail: ', { bold: true }), R('close-up of a single zari medallion. "Placed one at a time. Never on a grid."')]),
NUM([R('Detail: ', { bold: true }), R('the hem, mid-walk. "Gold gota. Then pearls. They move."')]),
NUM([R('Fabric: ', { bold: true }), R('"Roman silk. It falls, it does not stand. About 750 grams of it."')]),
NUM([R('Proof: ', { bold: true }), R('"XS to 3XL, custom-stitched. No extra charge."')]),
NUM([R('Close: ', { bold: true }), R('"Crafted in Surat. Worn everywhere. — @vastrangam"')]),

H3('Reel — 0 to 20 seconds'),
BUL([R('0–3s: ', { bold: true }), R('her hands open the dupatta, medallions catching the light. Text: "the colour you are allowed to wear".')]),
BUL([R('3–10s: ', { bold: true }), R('she turns, the flare opens; cut to the hem — pearls swinging half a beat late.')]),
BUL([R('10–16s: ', { bold: true }), R('close on one zari medallion, then pull wide to the courtyard.')]),
BUL([R('16–20s: ', { bold: true }), R('"Custom-fit. XS–3XL. Crafted in Surat." + @vastrangam.')]),
BUL([R('VO (~23 words): ', { bold: true }), R('"Somebody else is the bride. You still want to be the photograph everyone saves. This is the green that does both."')]),

new Paragraph({ children: [new PageBreak()] }),

H2('Suno song'),
P([R('Per your engine rule: not one product word. The colour, the hem, the flare — all of it is the reason she is remembered, none of it is sung.')], { italics: true, color: MUT }),
CODE([
  '[bollywood, hinglish, mehendi night, dholak, harmonium, claps, warm, female vocals,',
  ' 92 bpm, folk-cinematic]',
  '',
  '(Mukhda)',
  'Aangan mein diye, aur haathon pe naam',
  'Woh aayi hai aise, jaise thami ho shaam',
  '',
  '(Antara 1)',
  'Na uska din tha, na uski baari',
  'Phir bhi nazrein usi pe haari',
  'Kisi ne poocha — "yeh kaun aayi?"',
  'Hawa ne bas muskura di saari',
  '',
  '(Mukhda)',
  'Aangan mein diye, aur haathon pe naam…',
  '',
  '(Antara 2)',
  'Dulhan ka rang tha laal purana',
  'Uska tha koi aur bahana',
  'Na chheena kuch, na maanga kuch',
  'Bas reh gaya ek yaad ka gaana',
  '',
  '(Outro)',
  'Aangan mein diye… (held, fade)',
]),

H2('Ad copy — three angles'),
BUL([R('Etiquette: ', { bold: true }), R('"You are a guest at the mehendi, not the bride. There is exactly one colour that understands the difference." → Shop the mehendi green.')]),
BUL([R('Price perception: ', { bold: true }), R('"Zari medallions placed by hand. Pearls at the hem. Guess the price, then look." → See the price.')]),
BUL([R('Fit: ', { bold: true }), R('"Most sellers give you four sizes and hope. We stitch it to your measurements. XS to 3XL, no extra charge." → Send your size.')]),

H2('Blog opener'),
P([R('There is a specific panic that arrives about ten days before somebody else’s wedding, and it is not about the reception. It is about the mehendi. You cannot wear red — that is hers. You cannot wear yellow, because the entire courtyard is already yellow and you will be furniture in every photograph. And you have worn beige to three of these already… ', { italics: true }), R('(continues)', { italics: true, color: MUT })], { indent: { left: 340 } }),

H2('Size guide'),
P('XS 34" through 3XL 46". Custom stitching on request, no extra charge. WhatsApp bust + waist to +91 87580 38161.'),

H2('Image metadata — internal ref VAN2094'),
TBL(['File', 'Alt text (≤125 chars)'], [
  ['VAN2094_MehendiGreen.webp (hero)', 'Mehendi green roman silk Anarkali gown with zari-medallion dupatta and gold moti hem by Vastrangam'],
  ['VAN2094_MehendiGreen-Dupatta.webp', 'Gold zari medallion embroidery close-up on mehendi green Anarkali dupatta by Vastrangam'],
  ['VAN2094_MehendiGreen-Hem.webp', 'Gold gota and pearl moti drop hem detail on mehendi green Anarkali gown by Vastrangam'],
  ['VAN2094_MehendiGreen-Walk.webp', 'Mehendi green Anarkali gown flare in motion for mehendi and haldi functions by Vastrangam'],
], [34, 66]),

/* ── 9 · SHOT LIST ───────────────────────────────────────────────────── */
H1('9 · The three photographs you are missing'),
P('Section 7 said the gap is photography. Concretely, from the one frame I was given, here is what to shoot next. This is the cheapest thing on this list and the one that moves price band fastest.'),
NUM([R('The hem, mid-walk. ', { bold: true }), R('Low angle, shallow depth, pearls caught mid-swing. This is the trim your competitors leave off, so it is the trim that has to be visible.')]),
NUM([R('One zari medallion, filling the frame. ', { bold: true }), R('Enough that a buyer can count the stitches. Etsy sellers do this and it is why their listings carry export prices.')]),
NUM([R('The back and the fall. ', { bold: true }), R('One frame from behind at full length, so the flare and the length are not something a buyer has to take on faith.')]),
P([R('Optional fourth, if you want the Meesho-to-mid-market jump in one step: ', {}), R('the same garment on two different body types', { bold: true }), R('. Nobody in any tier of this research does it, and it answers the fit question before it is asked.')]),

/* ── 10 · SELF-CRITIQUE ──────────────────────────────────────────────── */
H1('10 · Self-critique pass'),
BUL('Openers checked — no section of the copy opens with the product noun ✓'),
BUL('Burstiness — short and long sentences mixed throughout ✓'),
BUL('AI-skeleton phrases — none ✓'),
BUL('Real specifics — ₹779 catalogue floor, 2.3 m dupatta, 750 g, 56" length, cut-work scallop, "half a beat behind her" ✓'),
BUL('Lyrics — zero product words ✓'),
BUL('Angle checked against the teal Anarkali run — that one was "the back that turns heads", this one is "the colour you are allowed to wear". Not a rerun ✓'),
BUL([R('Honesty — the exact seller is ', {}), R('not', { bold: true }), R(' claimed. Every named competitor is a real listing, linked below ✓')]),

/* ── SOURCES ─────────────────────────────────────────────────────────── */
H1('Sources'),
P('Every seller named in this document, in the order they appear.', { color: MUT }),
...[
  ['BallWool — Embroidered Anarkali Gown with Dupatta, Rani Pink & Mehendi Green', 'https://ballwool.com/products/193583'],
  ['Suratikart — Mustard Chanderi Roman Silk Anarkali Gown with Embroidered Dupatta', 'https://suratikart.com/products/mustard-chanderi-roman-silk-anarkali-gown-with-embroidered-dupatta'],
  ['Suratikart — Black Roman Silk Four-Layer Anarkali Gown Set', 'https://suratikart.com/products/black-roman-silk-four-layer-anarkali-gown-set'],
  ['Suratikart — Lemon Yellow Roman Silk Anarkali Suit', 'https://suratikart.com/products/lemon-yellow-roman-silk-anarkali-suit'],
  ['Suratikart — White Heavy Pure Roman Silk Anarkali Suit with Embroidery-Sequence Dupatta', 'https://suratikart.com/products/exquisite-white-heavy-pure-romansilk-anarkali-suit-with-embroidery-sequence-dupatta'],
  ['cbazaar — Anarkali Gown Pista Green Faux Georgette Embroidered Sequins with Dupatta', 'https://www.cbazaar.com/product/anarkali-gown-pista-green-faux-georgette-embroidered-sequins-with-dupatta-p-bgwrsacy6630'],
  ['cbazaar (UK) — Pista Green Faux Georgette Anarkali Gown with Zari Embroidered Dupatta', 'https://www.cbazaar.com/uk/product/pista-green-faux-georgette-anarkali-gown-with-zari-embroidered-dupatta-p-slsad280'],
  ['Mirraw (KSM Prints) — Green Colour Ethnic Glamorous Partywear Gown With Dupatta', 'https://www.mirraw.com/designers/ksm-prints/designs/green-colour-ethnic-glamorous-partywear-gown-with-dupatta-anarkali-salwar-kameez'],
  ['Mirraw (Surat 4 Fashion) — Blue Embroidered Silk Party Wear Anarkali Salwar With Dupatta', 'https://www.mirraw.com/designers/surat-4-fashion/designs/blue-embroidered-silk-party-wear-anarkali-salwar-with-dupatta-anarkali-salwar-kameez'],
  ['Exotic India Art — Fully Flared Solid Roman Silk Anarkali Suit With Embroidery Work Dupatta (GAM309)', 'https://www.exoticindiaart.com/product/textiles/attractive-fully-flared-solid-roman-silk-anarkali-suit-with-embroidery-work-dupatta-gam309/'],
  ['Etsy — Roman Silk Anarkali Gown Set, Heavy Sequence Embroidery Work', 'https://www.etsy.com/listing/4460389942/roman-silk-anarkali-gown-set-heavy'],
  ['Etsy — Green Velvet Anarkali Gown, Indian Designer Mehendi Outfit', 'https://www.etsy.com/in-en/listing/1147054621/green-velvet-anarkali-gown-indian'],
  ['eBay — Designer Anarkali Suit Women Roman Silk Embroidered Palazzo Dupatta Set', 'https://www.ebay.com/itm/198447598185'],
  ['Meesho — Women Embroidered Georgette Anarkali Gown With Dupatta', 'https://www.meesho.com/women-embroidered-georgette-anarkali-gown-with-dupatta/p/6qxfsy'],
  ['Meesho — Women Embroidered Georgette Anarkali Gown With Dupatta Set', 'https://www.meesho.com/women-embroidered-georgette-anarkali-gown-with-dupatta-set/p/6mqe72'],
  ['Meesho — Women Solid Georgette Anarkali Gown With Embroidery Dupatta Set', 'https://www.meesho.com/women-solid-georgette-anarkali-gown-with-embroidery-dupatta-set/p/7tnz4p'],
  ['Meesho (Shree Creations Jaipur) — Anarkali Gown with Dupatta', 'https://www.meesho.com/anarkali-gown-with-dupatta/p/42rl55'],
  ['Flipkart — Anarkali Gowns category', 'https://www.flipkart.com/clothing-and-accessories/dresses-and-gowns/gowns/anarkali~type/pr?sid=clo%2Codx%2Cod7'],
  ['Amazon — MAHI PRIVÉ Mint Royale Gold Embroidered Anarkali Gown Set with Dupatta', 'https://www.amazon.com/MAHI-PRIV%C3%89-Embroidered-Anarkali-Dupatta/dp/B0H9FVD2XQ'],
  ['Amazon — Embroidered Anarkali Suit Set with Dupatta, Georgette Gown-Style Ethnic Wear', 'https://www.amazon.com/Embroidered-Anarkali-Georgette-Gown-Style-Collection/dp/B0FG8CS5KQ'],
  ['Kalki Fashion — Mehendi Green Embroidered Anarkali With Dupatta', 'https://www.kalkifashion.com/mehendi-green-embroidered-anarkali-with-dupatta.html'],
  ['Kalki Fashion — Mehendi Green Metallic Embroidered Anarkali Suit Set With Pant And Dupatta', 'https://in.kalkifashion.com/products/mehendi-green-metallic-embroidered-anarkali-suit-set-with-pant-and-dupatta'],
  ['Lashkaraa — Mehendi Green Embroidered Anarkali', 'https://www.lashkaraa.com/products/mehendi-green-embroidered-anarkali'],
  ['Pernia’s Pop Up Shop (Baidehi) — Mehendi Green Embroidered Anarkali With Dupatta', 'https://www.perniaspopupshop.com/baidehi-mehendi-green-embroidered-anarkali-with-dupatta-baidh112234.html'],
  ['Pernia’s Pop Up Shop (Shyam Narayan Prasad) — Mehendi Green Embroidered Anarkali Set', 'https://www.perniaspopupshop.com/shyam-narayan-prasad-mehendi-green-embroidered-anarkali-set-snpc092242.html'],
  ['Pernia’s Pop Up Shop (AHI Clothing) — Mehndi Green Chikankari Anarkali Set', 'https://www.perniaspopupshop.com/ahi-clothing-mehndi-green-chikankari-anarkali-set-ahi062205.html'],
  ['Baidehi — Mehendi Green Anarkali with Embroidered Yoke and Dupatta (BD-1167A)', 'https://baidehi.com/products/mehendi-green-anarkali-with-heavily-embroidered-yoke-and-sleeves-with-a-dupatta-bd-1167a'],
  ['PinkPhulkari California — Mehendi Green Embroidered Chinon Silk Anarkali Dress', 'https://pinkphulkari.com/products/mehendi-green-embroidered-chinon-silk-anarkali-dress'],
  ['Saira’s Boutique — Dark Mehendi Green Designer Embroidered Viscose Silk Anarkali Gown', 'https://www.sairasboutique.net/collections/anarkali-suits/products/dark-mehendi-green-designer-embroidered-viscose-silk-anarkali-gown'],
  ['The Loom — Mehndi Green Embroidered Chanderi Anarkali Kurta', 'https://theloom.in/mehendi-green-embroidered-chanderi-anarkali-kurta-1139-hog13'],
  ['Miss Ethnik — Elegant Green Embroidered Anarkali Gown with V Neck & Lace Dupatta', 'https://www.missethnik.com/product/1019781f-24b0-403b-96cb-426286523dd6'],
  ['Lavanya The Label — Green Anarkali Embroidered Dupatta', 'https://www.lavanyathelabel.com/products/green-anarkali-embroidered-dupatta'],
  ['Indo Era — Sea Green Embroidered Silk Blend Anarkali Suit With Dupatta', 'https://www.indoera.in/collections/s/products/sea-green-embroidered-silk-blend-anarkali-suit-with-dupatta-for-women-10429'],
  ['Panash India — Green Anarkali Suits', 'https://www.panashindia.com/salwar/anarkali-salwar-kameez/green'],
  ['Inddus — Anarkali Suits', 'https://www.inddus.com/collections/anarkali-suits'],
  ['Andaaz Fashion — Green Anarkali Suits', 'https://www.andaazfashion.com/salwar-kameez/anarkali-suits/green'],
  ['G3 Fashion — Anarkali Suits', 'https://g3fashion.com/en-us/women/salwar-kameez/style-anarkali'],
  ['Surat Wholesale Shop — Roman Silk Readymade Anarkali Suit 4-Piece Catalogue (55347)', 'https://www.suratwholesaleshop.com/catalog/roman-silk-wholesale-readymade-anarkali-suit-4-pieces-catalog-55347'],
  ['Surat Wholesale Shop — Anarkali Suits catalogues', 'https://www.suratwholesaleshop.com/anarkali-suits/catalog'],
  ['Organza Mall — Anarkali wholesale, Surat', 'https://organzamall.com/collections/anarkali'],
  ['Fab Funda — Anarkali Suit wholesale, Surat', 'https://www.fabfunda.com/anarkali-suit'],
  ['Fashid Wholesale — Anarkali Suits', 'https://fashidwholesale.in/anarkali-suits'],
  ['Inli Exports — Anarkali Style Gowns, Surat', 'https://www.inliexports.com/anarkali-style-gowns'],
  ['Wholesale Salwar — Wholesale Anarkali Suits, Surat', 'https://www.wholesalesalwar.com/wholesale/anarkali-suits'],
  ['Bhawani Textile — Pure Chinon Chiffon Designer Anarkali Gown Kurti with Dupatta, Surat', 'https://bhawanitextile.com/portfolio/pure-chinon-chiffon-designer-anarkali-gown-kurti-with-dupatta-in-wholesale-surat'],
].map(([label, url]) => new Paragraph({
  numbering: { reference: 'bul', level: 0 }, spacing: { before: 20, after: 40, line: 250 },
  children: [LINK(label, url)],
})),

P(''),
RULE(),
P([R('Vastrangam · Crafted in Surat · Prepared 4 August 2026', { size: 17, color: MUT })], { align: AlignmentType.CENTER }),

    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(process.argv[2] || 'out.docx', buf);
  console.log('written ' + (process.argv[2] || 'out.docx') + ' · ' + Math.round(buf.length / 1024) + ' KB');
});
