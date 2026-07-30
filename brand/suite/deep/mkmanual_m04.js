'use strict';
/* Generates MANUAL.md for both apps × both editions of Module 04 · E-commerce / OMS. */
const fs = require('fs'), path = require('path');
const { manual } = require('./manualparts.js');
const OUT = path.join(__dirname, 'manuals');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const HDR = (c, menu) => `
════════════════════════════════════════════════════════════════════════
PART 2 · THE PARTS OF THE SCREEN
════════════════════════════════════════════════════════════════════════

  TOP BAR       The Medhava mark, the app name, then two grey pills:
                the company (${c.co}) and the financial year (FY 2026-27).
                On the right, "saved ✓" — this appears every time your work
                is written to disk. If it says "session only", your browser
                is blocking storage (usually Private mode).

  LEFT MENU     ${menu}
                On a phone this menu hides behind the ☰ button.

  CARDS         The coloured boxes across the top of each screen. Big number,
                small line underneath telling you what it means.

  PANELS        The white boxes below — tables, bars, forms and buttons.

  TAGS          The little coloured pills. Green is fine, amber means look at
                it this week, red means today.
`;

/* ══════════════════ APP 1 · MARKETPLACE OMS ══════════════════ */
const OMS = (c) => HDR(c, `Seven screens in three groups:
                  ONE QUEUE        Overview · Dispatch queue · Pick list & slips
                  PER MARKETPLACE  Marketplace P&L · Listing health
                  WIRING           Wiring
                  CONNECTORS       Connectors
                  SYSTEM           Backup & Health`) + `

════════════════════════════════════════════════════════════════════════
PART 3 · SCREEN BY SCREEN
════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────
SCREEN 1 · OVERVIEW
──────────────────────────────────────────────
FIVE CARDS
  Gross ordered           What the marketplaces show you. NOT your money.
  What reaches you        After every commission and shipping fee. This one
                          is your money.
  Taken by the platforms  The gap between the two, and what share of gross
                          it is. On fashion panels this is often a quarter.
  Past dispatch window    Orders that have gone past THEIR OWN panel's
                          window. Red the moment there is one.
  Dispatched on time      Of everything already shipped, how much made it
                          inside the window.

WHAT EACH MARKETPLACE ACTUALLY PAYS YOU
  One bar per panel, sized by what reaches your bank. Beside each name:
  the commission percentage, the flat shipping fee, and "keeps you N%".

  ${c.grossLine}

WHAT NEEDS YOU NOW
  Every problem the app can see, worst first, each with a button that
  takes you to the screen where you fix it. Red = today. Amber = this week.

WHY ONE QUEUE INSTEAD OF SEVEN PANELS
  A short panel at the bottom that spells out the arithmetic: how many
  panels became one queue, how many different dispatch windows the clock
  is now remembering for you, and how many stock figures there are (one).

──────────────────────────────────────────────
SCREEN 2 · DISPATCH QUEUE
──────────────────────────────────────────────
THIS IS THE SCREEN YOU LIVE ON.

Everything still to go out, from every panel, in ONE list.

  IT IS SORTED BY HOW LITTLE TIME IS LEFT — NOT BY ORDER DATE.

  That is the whole point. ${c.windowLine}
  An order that arrived an hour ago can be more urgent than one from
  yesterday, and no human being sorts that correctly across seven browser
  tabs at six in the evening.

THE COLUMNS
  Time left      Green over 8 hours. Amber 5–8. Red under 4, or "Nh LATE"
                 in red once the window has gone.
  Order          The marketplace's own order number, and the customer.
  Marketplace    Which panel, and how many hours that panel gives you.
  Item           What it is, how many, at what rate.
  Gross          Quantity × rate. What the panel shows.
  Their cut      Commission plus the shipping fee, in red.
  You get        What actually reaches your bank.
  Stage          To accept → Accepted → Packed → Dispatched → Delivered.

THE BUTTONS
  "Mark accepted →"     Moves the order ONE stage. The button always names
  "Mark packed →"       the next stage, so nobody has to remember the order
  "Mark dispatched →"   they go in. Nothing ever jumps straight to
                        dispatched — which is the only reason the on-time
                        figure on the Overview means anything.
  Cancel                Cancels it AND puts the stock back, in the same
                        click. It leaves every money total immediately.

ALREADY OUT
  A second table underneath: everything dispatched or delivered, with how
  many hours it actually took, and a green "within window" or a red "was
  late" tag. Delivered orders get a "Came back" button for returns.

──────────────────────────────────────────────
SCREEN 3 · PICK LIST & PACKING SLIPS
──────────────────────────────────────────────
THE SCREEN THE PACKING TABLE WORKS FROM.

FOUR CARDS
  Slips to print    One per parcel going out.
  Designs to pick   How many rows are on the pick list.
  Pieces to pull    The total coming off the rack.
  Already late      Pick these first.

THE PICK LIST — ONE WALK DOWN THE RACK
  Grouped by DESIGN AND SIZE, not by order. So five parcels of the same
  kurta in size L is ONE row saying "pull 5", not five separate trips.

  Design code · Item · Size · Pull · For parcels · Across panels

  If the pick list asks for more pieces than you actually have, that row
  turns red and says "more than you have" — before anybody walks anywhere.

"PRINT ALL N SLIPS"
  One button, top right of the pick list. It opens your normal browser
  print dialogue. Print on paper, or "Save as PDF" — both work, and this
  is why "no printer at all" is a valid choice on the Connectors screen.

  Each slip prints on its own page.

WHAT IS ON ONE SLIP
  ${c.co}                                    ORDER NUMBER
  Packing slip · not a tax invoice           Panel · time left

  SHIP TO
  Customer name
  Full delivery address

  DESIGN CODE | ITEM | SIZE | QTY

  ┌───────────────────────────────────┐
  │ PICK THIS DESIGN                  │
  │ ${c.egCode.padEnd(20)}       │   ← large enough to read across a rack
  │ Size L · 2 pieces                 │
  └───────────────────────────────────┘

  Packed by __________   Checked by __________

WHAT IS DELIBERATELY *NOT* ON IT
  NO PRICES. ${c.slipWhy}

  A packing slip is a picking and shipping document. The tax invoice is a
  different piece of paper with a different job.

THE RULE THIS SCREEN ENFORCES
  A SLIP IS ONLY EVER MADE FOR A PARCEL STILL TO GO OUT.

  Cancel an order and its slip disappears from this sheet in the same
  instant. Mark one dispatched and it disappears too. So nobody is ever
  sent to the rack after a piece that has already left the building.

──────────────────────────────────────────────
SCREEN 4 · MARKETPLACE P&L
──────────────────────────────────────────────
THE COMPARISON NOBODY MAKES.

Every panel side by side: commission %, shipping fee, dispatch window,
live orders, gross, what you keep, keep %, return %, and how many are
late right now.

  IT IS SORTED BY WHAT REACHES YOUR BANK, NOT BY GROSS.

  ${c.plLine}

THE VERDICT COLUMN
  "worth the work"          Keeps you 80%+ and returns are under control.
  "expensive channel"       You keep less than 80% of gross there.
  "returns are eating it"   Return rate is over the alert line.
  "no orders yet"           Listed, but nothing has sold.

  A channel with a 25% commission and a 15% return rate is not a 25% cost.
  It is closer to 40% once you count the parcels that come back at your
  expense — which is why the return column sits next to the commission
  column and not on some other screen.

──────────────────────────────────────────────
SCREEN 5 · LISTING HEALTH
──────────────────────────────────────────────
FOUR CARDS
  Items listed              How many designs, on how many panels.
  Price parity broken       The same item priced too far apart across
                            panels. Red if there is even one.
  Out of stock, still listed  Every order taken now becomes a cancellation.
  Thin cover                Fewer pieces in stock than panels selling them.

THE TABLE
  Each item with its stock, the lowest price anywhere, the highest, and
  the spread as a percentage. Over the parity line the spread turns red.

"LEVEL THE PRICE"
  One button per item. It puts EVERY panel back on the catalogue list
  price in one click.

  ${c.parityLine}

PER-ITEM PANELS
  Below the table, one panel per item showing the price on every single
  panel, how far each is from the list price, and which is highest and
  lowest. This is where you see exactly which panel drifted.

──────────────────────────────────────────────
SCREEN 6 · WIRING   ·   7 · CONNECTORS   ·   8 · BACKUP & HEALTH
──────────────────────────────────────────────
Covered in PART 4, PART 5 and PART 6 below.
`;

/* ══════════════════ APP 2 · ORDER MANAGEMENT ══════════════════ */
const ORD = (c) => HDR(c, `Seven screens in four groups:
                  ONE ORDER BOOK   Overview · Order book
                  FULFILMENT       Allocation desk · Promise & transit
                  AFTER THE SALE   Returns & refunds
                  WIRING           Wiring
                  CONNECTORS       Connectors
                  SYSTEM           Backup & Health`) + `

════════════════════════════════════════════════════════════════════════
PART 3 · SCREEN BY SCREEN
════════════════════════════════════════════════════════════════════════

BEFORE ANY OF IT — THE ONE IDEA

  NOBODY TYPES A DELIVERY DATE IN THIS APP.

  The date a customer is promised is worked out, every single time it is
  shown, from two things:

     1. WHEN IT DISPATCHES.  Orders placed before the ${c.cut}:00 cut-off go
        out the same day. After it, the next day.
     2. HOW FAR THE WAREHOUSE IS.  Each warehouse has its own number of
        transit days to each zone. ${c.transitLine}

     Promise date = dispatch date + transit days.

  So the date changes by itself when the warehouse changes — and no
  salesperson can promise Tuesday to a place the courier reaches on Friday.

──────────────────────────────────────────────
SCREEN 1 · OVERVIEW
──────────────────────────────────────────────
FIVE CARDS
  Order book              Every live order, at value. Cancellations and
                          returns are already out of it.
  Still open              What has not been delivered yet.
  Promise already blown   Orders that have not even shipped and whose date
                          has passed. This is the number a customer is
                          about to phone about.
  Cannot be promised      Orders no warehouse can serve. They have NO date,
                          on purpose.
  Arrived on time         Of everything that has landed, how much met the
                          date it was given.

EVERY CHANNEL IN ONE BOOK
  A bar per channel by value, with its return rate beside it, and the
  value that came back underneath.

WHAT NEEDS YOU NOW
  Every problem, worst first, each with a button to the right screen.

MONEY OWED AFTER THE SALE
  Parcels still coming back · parcels back that nobody has looked at ·
  refunds already paid · refunds still owed. That last figure is a real
  liability worked out from parcels that exist.

──────────────────────────────────────────────
SCREEN 2 · ORDER BOOK
──────────────────────────────────────────────
Every order from every channel, sorted by WHICH PROMISE BREAKS FIRST.

THE COLUMNS WORTH KNOWING
  Ships from    On an allocated order, the warehouse it is going from.
                On one that is NOT yet allocated it says "would be
                chosen" — the warehouse the app WOULD pick if you left
                it alone, with the transit days beside it. The decision
                is visible before anybody makes it.
  Promised      The date, and underneath it "in 3 days", "today", or
                "2d past". If nothing can serve the order it says
                "no date possible" in red instead of inventing one.
  Stage         To allocate → Allocated → Packed → Shipped → Delivered.
                Delivered orders also say "on time" or "was late".

SHOW ONE CHANNEL AT A TIME
  A dropdown at the top. Pick a channel, press "Show these", and the whole
  table narrows to it. Pick "Every channel" to go back.

THE BUTTONS
  Allocate               Only on unallocated orders. Sends it to the
                         fastest warehouse that actually has the stock.
  "Mark packed →" etc.   One stage at a time.
  Refused                On a shipped order — the customer would not take
                         it. It becomes a return.
  Came back              On a delivered order — she returned it.
  Cancel                 Before it ships. Puts the stock back where it came
                         from.

HOW THE CHANNELS DIFFER
  A table underneath comparing every channel on open orders, blown
  promises, return rate and on-time percentage. ${c.chanLine}

──────────────────────────────────────────────
SCREEN 3 · ALLOCATION DESK
──────────────────────────────────────────────
WHAT IS IN EACH WAREHOUSE
  Every item as a row, every warehouse as a column, plus a total. A zero
  shows red. An item with nothing anywhere is tagged "nothing anywhere".

ONE PANEL PER WAITING ORDER
  For each order still to allocate, a small table listing EVERY warehouse:

     In stock there   ·   Transit   ·   WOULD PROMISE   ·   can it serve it

  You are choosing between DATES, not between warehouse codes. Under it,
  a line saying which warehouse it would go from if left alone, and a
  button to accept that.

  "Ship from here"              Allocates it to that particular warehouse.
  "Allocate the fastest way"    Takes the app's own choice.

  IF NOTHING CAN SERVE IT, THERE ARE NO BUTTONS. The panel says so plainly.
  ${c.backLine}

MOVE STOCK BETWEEN WAREHOUSES
  Item · out of · into · how many pieces · "Move the stock".

  A move takes pieces out of one warehouse and puts the same number into
  another. THE TOTAL ACROSS THE BUSINESS NEVER CHANGES — there is a
  self-test for exactly that, which is why it is safe to do from this
  screen instead of through a paperwork cycle.

  TRY THIS ONCE. Move a piece to a warehouse nearer the customer, then go
  back to the Order book. The promised date on that order will have
  changed by itself. You did not edit a date; you moved a piece of stock.

WHERE EACH WAREHOUSE EARNS ITS KEEP
  Pieces held, orders shipping from it, value, average transit, and which
  zones it is the fastest warehouse for.

──────────────────────────────────────────────
SCREEN 4 · PROMISE & TRANSIT
──────────────────────────────────────────────
THE TRANSIT MATRIX
  Rows are warehouses, columns are zones, and each cell is the number of
  days. The BOLD figure in a column is the fastest warehouse for that zone.

  This one small table is the reason allocation matters at all.

HOW A PROMISE DATE IS WORKED OUT
  Five numbered steps, in the app, in plain language. Read it once.

THE SAME ORDER, FROM EVERY WAREHOUSE
  One real order from your own data, showing what date each warehouse
  would promise and which ones actually have the stock. Underneath: when
  it was placed, the cut-off, where it is going, and what it is promised
  today.

EVERY OPEN ORDER AGAINST ITS PROMISE
  Placed · dispatches · from · transit · promised · and a tag: "in 4 days",
  "due tomorrow", "due today", "2d past", "in transit", "in transit, late",
  or "cannot be promised".

──────────────────────────────────────────────
SCREEN 5 · RETURNS & REFUNDS
──────────────────────────────────────────────
THE ORDER NEVER BENDS: PARCEL BACK → SOMEBODY LOOKS AT IT → MONEY OUT.

FOUR CARDS
  Returns open              Not yet refunded.
  Still coming back         The parcel has not arrived.
  Waiting to be looked at   It is here and the refund is stuck on this.
  Refunds owed              Money a customer is waiting for.

THE DESK
  Each return with why it came back ("customer returned it" or "refused at
  the door"), whether the parcel is in, whether anybody has looked at it,
  and what is owed.

THE BUTTONS, IN THE ORDER THEY APPEAR
  1. "Parcel is back"     Books it into the warehouse. Until you press
                          this, the refund button does NOTHING AT ALL.
  2. "Resaleable" or      Somebody has to actually open it and decide.
     "Damaged"            Still no money out.
  3. "Pay the refund"     Full amount if resaleable; ${c.dmg}% if damaged.

  A RESALEABLE PIECE GOES BACK INTO STOCK at the warehouse it shipped
  from. A DAMAGED ONE DOES NOT. ${c.dmgLine}

WHAT A RETURN ACTUALLY COSTS
  Value that came back · refunds paid · refunds owed · pieces recovered
  into stock · value written off as damaged.

──────────────────────────────────────────────
SCREEN 6 · WIRING   ·   7 · CONNECTORS   ·   8 · BACKUP & HEALTH
──────────────────────────────────────────────
Covered in PART 4, PART 5 and PART 6 below.
`;

/* ─────────── the four builds ─────────── */
const V = {};
const B = (id, app, file, kb, tests, n, cap, alt, screens, intro, erpExtra, vasExtra) => {
  const g = { app, file, kb, tests, screens,
    module: 'Module 04 · E-commerce / OMS — App ' + n + ' of 2', capCount: cap, altCount: alt,
    companion: ['Marketplace OMS', 'Order Management'].filter(x => x !== app).join(' · '),
    liveFrom: 'your other systems' };
  V[id + '_ERP'] = Object.assign({}, g, erpExtra, { co: 'Acme Corp',
    key: 'medhava_' + id.toLowerCase() + '_erp_v1', edition: 'Unified ERP — any industry',
    intro: intro.concat(erpExtra.introMore || []) });
  V[id + '_VAS'] = Object.assign({}, g, erpExtra, vasExtra, { co: 'Vastrangam',
    key: 'medhava_' + id.toLowerCase() + '_vastrangam_v1', edition: 'Vastrangam — ethnic-wear D2C + marketplace',
    intro: intro.concat(vasExtra.introMore || []) });
};

B('OMS', 'Marketplace OMS', 'Marketplace_OMS.html', 89, 51, 1, 7, 73, OMS,
  ['Every marketplace order in ONE queue, sorted by how little time is left',
   'before that panel\'s dispatch window closes — not by when it arrived.', '',
   'Three things it insists on:', '',
   '  · GROSS IS NEVER SHOWN AS IF IT WERE YOURS. The commission and the',
   '    shipping fee are worked out on every order the moment it lands.',
   '  · STOCK IS ONE NUMBER, not one per panel. Selling the last piece on one',
   '    marketplace removes it from the others in the same instant.',
   '  · NOTHING JUMPS STRAIGHT TO DISPATCHED. One stage at a time, so the',
   '    on-time figure is real rather than back-filled.', '',
   'And it prints what the packing table needs: a pick list grouped by design',
   'so the rack is walked once, then one packing slip per parcel with the design',
   'code set large enough to read at arm\'s length.'],
  { testEg: '  · "the queue is sorted with the least time left first"\n  · "payout = gross − commission − shipping fee"\n  · "every slip carries its design code and its size"',
    egCode: 'FG-101',
    slipWhy: 'The marketplace prints its own invoice for the customer. A second price on a second piece of paper is how a dispute starts.',
    grossLine: 'A panel that sells the most is frequently not the panel that pays the most. This is the only screen in most businesses where those two are shown together.',
    windowLine: 'One panel gives you 12 hours; another gives you 48.',
    plLine: 'The ranking here is almost never the ranking by gross, which is exactly why it is worth having.',
    parityLine: 'Marketplaces read each other\'s prices. The same item listed materially cheaper on one panel gets the dearer listings suppressed — on a channel you are paying a high commission to be visible on.',
    introMore: [] },
  { windowLine: 'Amazon gives you 12 hours. Flipkart and Myntra give you 24. Ajio and Nykaa give you 48.',
    egCode: 'VS-KUR-01',
    slipWhy: 'Myntra and Amazon print their own invoice for the customer. A second price on a second piece of paper is how a dispute starts — and a Banarasi saree and a Kanjivaram look identical from four feet away, which is why the design code is the biggest thing on the page.',
    grossLine: '₹4,999 on Myntra is not ₹4,999. Less 30% commission and ₹79 shipping, it is about ₹3,424 — and that is before a single parcel comes back.',
    plLine: 'Myntra will almost always be biggest by gross. After 30% commission and a 20% return rate it is frequently not biggest by money in the bank. Meesho at 12% often beats it.',
    parityLine: 'A saree left at ₹4,499 from a Myntra event while Ajio still shows ₹5,299 gets the Ajio listing pushed down — and Ajio is a 28% channel you are paying to be visible on.',
    introMore: ['', 'For Vastrangam this is seven panels — Myntra, Amazon, Flipkart, Ajio,',
      'Nykaa Fashion, Meesho and Tata Cliq — collapsed into one working screen.'] });

B('ORD', 'Order Management', 'Order_Management.html', 103, 55, 2, 8, 82, ORD,
  ['One order book for every channel — website, marketplaces, the counter,',
   'wholesale and WhatsApp. Two decisions decide whether the customer is happy,',
   'and this app makes both of them in the open.', '',
   '  · WHERE IT SHIPS FROM. The fastest warehouse that actually holds the',
   '    pieces, checked against the real figure on that shelf.',
   '  · WHAT DATE SHE WAS GIVEN. Nobody types it. It is the cut-off plus that',
   '    warehouse\'s transit days to her zone — so moving the stock nearer',
   '    changes her date by itself.', '',
   'And after the sale the sequence never bends: parcel back, then somebody',
   'looks at it, THEN the money goes out.'],
  { cut: 14, dmg: 50,
    testEg: '  · "no promise date is stored anywhere — it is worked out on every read"\n  · "a refund is impossible before somebody has looked at it"\n  · "moving stock changes two warehouses and leaves the total alone"',
    transitLine: 'One warehouse is 1 day from a zone; another is 4 days from the same zone.',
    chanLine: 'They behave nothing like each other, and one "orders" screen that treats them the same is how a business stops being able to tell which channel is working.',
    backLine: 'An order nothing can serve needs a purchase or a production order, not a promise — and nothing is gained by giving the customer a date in the meantime.',
    dmgLine: 'A damaged piece added back to stock is phantom inventory: it will be promised to somebody, allocated, picked, and then not be there.',
    introMore: [] },
  { transitLine: 'Bengaluru is 1 day from Hyderabad; Delhi is 4 days from it.',
    chanLine: 'A showroom sale is finished the moment it is paid for; a Myntra order comes back one time in four; a boutique order is a credit decision before it is a fulfilment one.',
    dmgLine: 'A saree back with a pulled zari or a make-up mark on the pallu is not resaleable at ₹4,999, and adding it back at full value is how a healthy-looking inventory turns out to be worth half of what the report says.',
    introMore: ['', 'For Vastrangam that means three warehouses — Delhi, Mumbai and Bengaluru —',
      'and five channels, all writing to the same book.'] });

const order = ['OMS_ERP', 'OMS_VAS', 'ORD_ERP', 'ORD_VAS'];
for (const k of order) {
  const c = V[k];
  c.intro = c.intro.join('\n');
  const md = manual(c, c.screens);
  fs.writeFileSync(path.join(OUT, k + '_MANUAL.md'), md);
  console.log(k.padEnd(9), Math.round(md.length / 1024) + 'KB', md.split('\n').length + ' lines');
}
