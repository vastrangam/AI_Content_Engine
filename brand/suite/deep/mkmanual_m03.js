'use strict';
/* Generates MANUAL.md for all five apps × both formats of Module 03 · Sales. */
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

const D2C = (c) => HDR(c, `Six screens in four groups:
                  SELLING       Overview · Orders
                  WINNING BACK  Abandoned carts · Loyalty points
                  WIRING        Wiring
                  CONNECTORS    Connectors
                  SYSTEM        Backup & Health`) + `

════════════════════════════════════════════════════════════════════════
PART 3 · SCREEN BY SCREEN
════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────
SCREEN 1 · OVERVIEW
──────────────────────────────────────────────
FIVE CARDS
  Net sales          What you sold after coupons. Not the gross.
  Orders             How many live orders, and the average size.
  Collected          Money actually in — prepaid orders in full, plus the
                     advance taken on each COD order.
  Still to collect   The COD balances the courier has yet to bring back.
  Needs a look       Rule breaches and delays. Red the moment there is one.

WHERE THE ORDERS ARE
  A bar per stage — New, Confirmed, Packed, Shipped, Delivered — with the
  count and the value. Below it: how many were cancelled, and the split
  between paid-up-front and cash-on-delivery.

  THE COD SHARE IS THE NUMBER TO WATCH. It turns red above 50%.
  ${c.codLine}

FROM GROSS TO WHAT YOU KEEP  (bottom panel)
       Gross of every live order
     − Coupons actually applied
     = Net sales
       of which collected already
       of which still on delivery

  "Coupons ACTUALLY applied" is deliberate wording. A coupon below its
  minimum order value is ignored — it does not silently cut the bill.

──────────────────────────────────────────────
SCREEN 2 · ORDERS  (where you work)
──────────────────────────────────────────────
FIVE CARDS — one per stage, with the value sitting at each.

TAKE AN ORDER  (six boxes)
  Customer name        Required.
  What they bought     Picked from your catalogue — the price comes with it.
  Quantity             Must be at least 1.
  How they are paying  Paid up front, or cash on delivery.
  Advance taken        Only matters for COD. See the rule below.
  Coupon code          Optional. Each one shows its minimum order value.

THE ORDER TABLE, COLUMN BY COLUMN
  Order         Number, customer and date.
  Item          What it is, and quantity × rate.
  Gross         Before any coupon.
  Coupon        Green with the amount if it qualified; grey and marked
                "below minimum" if it did not. Nothing is hidden.
  Net           What the customer actually pays.
  Payment       "prepaid", or "COD" with the advance shown.
  On delivery   What the courier still has to collect. Red if there is any.
  Stage         Where it is in the pipeline.

  BUTTONS ON EVERY ROW
    "Mark confirmed / packed / shipped / delivered →"
        Moves it exactly one step. It never skips and never goes backwards.
    "Cancel"
        Takes it out of every total. A DELIVERED order cannot be cancelled.

THE ONE RULE THAT SAVES REAL MONEY
  A cash-on-delivery order CANNOT BE PACKED until it carries a 20% advance.
  Press "Mark packed" on a COD order with too small an advance and the app
  refuses, and tells you the figure it needs.

  Why: a refused COD parcel costs you the courier fee both ways and the
  goods come back handled. A customer who has paid something almost always
  accepts the parcel. This one rule is the cheapest defence there is.

──────────────────────────────────────────────
SCREEN 3 · ABANDONED CARTS
──────────────────────────────────────────────
Somebody filled a cart and left. This is the cheapest sale in the business
to win back, and almost nobody chases it.

  Open carts             How many were left behind.
  Value sitting there    Not yours yet.
  Still worth a nudge    Under 7 days old.
  Recovered so far       Turned into real orders.

  The table shows the customer, what they left, the value, and how many
  days ago. Under 7 days it says "worth a nudge"; over that, "probably gone".

  TWO BUTTONS
    "They bought it →"  Creates a REAL order at the New stage, immediately.
                        Go to Orders and it is there. The cart is marked
                        recovered.
    "Give up"           Marks it gone, so it stops cluttering the list.

  ${c.cartLine}

──────────────────────────────────────────────
SCREEN 4 · LOYALTY POINTS
──────────────────────────────────────────────
2% of what a customer keeps comes back to them as points.

  EARNED ON DELIVERY, NEVER ON ORDER. An order still in transit, or one that
  was cancelled, earns nothing. Which means "points owed" on this screen is
  always a real liability rather than a hopeful guess.

  One point = ₹1 off a future order. Minimum to redeem: 100 points.

  The table shows every customer: orders, spend, points earned, points used
  and the balance. Anybody at 200 or more is tagged "can redeem", and a
  "Redeem 100" button appears once they reach 100.

  POINTS OWED IS MONEY YOU HAVE PROMISED AWAY. It is on this screen, in a
  card, so it is never a surprise at the end of a quarter.

──────────────────────────────────────────────
SCREEN 5 · WIRING
──────────────────────────────────────────────
Every figure, its source, and the arithmetic — plus a worked example that
follows one order through its six consequences: stock reserved, COD rule
checked, courier, delivery, books, points, and the customer record in CRM.

──────────────────────────────────────────────
SCREEN 6 · CONNECTORS   ·   SCREEN 7 · BACKUP & HEALTH
──────────────────────────────────────────────
Covered in PART 4, PART 5 and PART 6 below.
`;

const B2B = (c) => HDR(c, `Six screens in four groups:
                  ORDER BOOK    Overview · Orders
                  MONEY         Credit limits · Ageing
                  WIRING        Wiring
                  CONNECTORS    Connectors
                  SYSTEM        Backup & Health`) + `

════════════════════════════════════════════════════════════════════════
PART 3 · SCREEN BY SCREEN
════════════════════════════════════════════════════════════════════════

THE TWO IDEAS BEHIND THIS APP

  1. THE PRICE IS THE TIER, NOT A NEGOTIATION.
     Every buyer sits on a tier — A, B or C — and the tier decides the
     discount off your list price. You never type a rate, so nobody can
     quietly give a better one, and the price list cannot fall apart.

  2. THE CREDIT CHECK IS A GATE, NOT A WARNING.
     A warning gets clicked through on a busy afternoon. Over the limit,
     an order goes ON HOLD. It is not lost, and it is not silently
     approved either. Somebody has to make a real decision.

──────────────────────────────────────────────
SCREEN 1 · OVERVIEW
──────────────────────────────────────────────
FIVE CARDS
  Order book        Everything not yet paid for.
  Credit out        What the trade owes you, as a % of every limit given.
                    Red above 80%.
  Invoiced, unpaid  Money you have billed and not received.
  Past terms        Of that, how much is already late.
  On hold           Orders the credit check refused.

HOW OLD THE UNPAID MONEY IS
  Five buckets: Not yet due · 1–30 · 31–60 · 61–90 · over 90 days.

  AGE IS COUNTED AGAINST EACH BUYER'S OWN AGREED TERMS. A 45-day buyer is
  not called late on day 31, and a 15-day buyer is not given 30 days by
  accident. Most software uses one fixed number for everybody and quietly
  gets both wrong.

WHAT TIER PRICING IS COSTING YOU  (bottom panel)
  Per tier: the discount, how many buyers are on it, and how much you gave
  away this period. This is the number nobody usually adds up.

──────────────────────────────────────────────
SCREEN 2 · ORDERS
──────────────────────────────────────────────
RAISE AN ORDER  (three boxes)
  Buyer      The dropdown shows how much credit each one has left.
  Item       From your price list.
  Quantity   Must be at least 1.

  You do not type a price. It is worked out from the buyer's tier.

  If the order fits inside the buyer's remaining credit → it is raised as a
  DRAFT. If it does not → it goes straight ON HOLD, and the app tells you by
  how much it would have gone over.

THE TABLE
  List price · Tier price · You gave up — side by side on every row, so the
  cost of the discount is never invisible.

  "Mark approved →" runs the credit check again at the moment of approval.
  Then Dispatched → Invoiced → Paid, one step at a time.

ON HOLD  (a panel appears only when there is something in it)
  Every refused order, with exactly why. Collect something, or raise the
  limit on the Credit screen, then press "Try again". Nothing is lost.

──────────────────────────────────────────────
SCREEN 3 · CREDIT LIMITS
──────────────────────────────────────────────
  Total limits given · Credit out · Headroom left · Over the limit

CHANGE A LIMIT
  Pick a buyer, type a new limit, press Set. Raising a limit is a real
  decision — it is money you are choosing to risk — and the Overview flags
  anybody who goes over.

EVERY BUYER
  Tier and discount, agreed terms, limit, what they owe now, what is left,
  and their worst outstanding invoice.

  THE VERDICT COLUMN LOOKS AT BOTH RISKS, not just headroom:
      over limit — stop                 they already owe too much
      90+ days late — stop supply       old money, whatever the headroom
      badly late — hold dispatches      over 60 days
      late — chase before selling more  anything past terms
      nearly full                       under 20% headroom left
      room to sell                      nothing late, headroom available

  A buyer with plenty of room left and a 90-day-old invoice is still
  stopped. Headroom on its own is a half-answer.

──────────────────────────────────────────────
SCREEN 4 · AGEING
──────────────────────────────────────────────
Every unpaid invoice, oldest against its own terms first, with a tag saying
what to do — and a "Mark paid" button.

  WHAT EACH BUCKET MEANS FOR WHAT YOU DO NEXT
    Not yet due    Nothing. You agreed to this. Do not chase.
    1–30 days      One call. Usually paperwork, not money.
    31–60 days     A pattern. Stop extending; get a date in writing.
    61–90 days     Real risk. No new dispatches to that buyer.
    Over 90 days   Assume you will have to fight for it. Stop supply.

──────────────────────────────────────────────
SCREEN 5 · WIRING   ·   6 · CONNECTORS   ·   7 · BACKUP & HEALTH
──────────────────────────────────────────────
Wiring names the source of every figure. The other two are covered in
PART 4, PART 5 and PART 6 below.
`;

const EXP = (c) => HDR(c, `Six screens in four groups:
                  SHIPMENTS     Overview · Export orders · Documents
                  TAX           IGST & refunds
                  WIRING        Wiring
                  CONNECTORS    Connectors
                  SYSTEM        Backup & Health`) + `

════════════════════════════════════════════════════════════════════════
PART 3 · SCREEN BY SCREEN
════════════════════════════════════════════════════════════════════════

THE IDEA BEHIND THIS APP

  AN EXPORT ORDER IS A DOCUMENT PROBLEM, NOT A SELLING PROBLEM.

  Five papers travel with every shipment. Miss one and a container sits at
  a port earning demurrage while somebody emails a scan. So this app will
  not let a shipment be marked shipped until all five are ticked.

  The second thing it does is chase the tax money back. On the
  pay-and-claim route the IGST you paid is YOUR working capital sitting
  with the government — and it is the most commonly forgotten receivable
  in a small export business, because nobody owns the list.

──────────────────────────────────────────────
SCREEN 1 · OVERVIEW
──────────────────────────────────────────────
FIVE CARDS
  Export value          Everything on the book, in ₹.
  Waiting to be paid    Shipped and not yet settled.
  IGST refund owed      Claimed and not received, with how many are overdue.
  Saved by LUT bond     Tax never paid out at all, because of the bond.
  Needs a look          Document gaps and overdue refunds.

WHERE IT GOES — a bar per country.

ONE EXCHANGE RATE, IN ONE PLACE
  Below the countries: the rate in use, and a box to change it. Change it
  and EVERY rupee figure on every screen moves together, because there is
  only one copy of it. No screen can be using last week's rate.

THE TWO LAWFUL ROUTES  (bottom panel)
  LUT bond                  File a bond once a year, export without paying
                            IGST at all. Nothing to claim back.
  Pay IGST and claim it back Pay up front, claim a refund. Cash is out until
                            the refund lands.

  ${c.routeLine}

──────────────────────────────────────────────
SCREEN 2 · EXPORT ORDERS
──────────────────────────────────────────────
Booked → Documents → Shipped → Landed → Paid for.

BOOK A SHIPMENT
  Overseas buyer · Country · Item · Quantity · Rate per unit (in ${c.ccy}) ·
  Tax route.

THE TABLE
  FOB in ${c.ccy} and FOB in ₹ side by side, the route, the IGST if any, and
  a "Papers" column showing how many of the five are in.

  "Mark shipped" IS REFUSED unless all five papers are ticked. The app names
  exactly which ones are missing.

──────────────────────────────────────────────
SCREEN 3 · DOCUMENTS
──────────────────────────────────────────────
  WHAT EACH PAPER IS FOR
    Commercial invoice       What was sold, to whom, at what value.
                             Customs starts here.
    Packing list             Carton by carton, with weights.
    Shipping bill            The customs filing. Nothing leaves without it.
    Bill of lading / AWB     Proof the carrier took it. The buyer needs it.
    Certificate of origin    Where it was made. Often earns the buyer a
                             lower duty.

  Then one panel per shipment with five buttons. Press one to tick it;
  press again to untick. The panel tells you what is still needed.

  A shipment that has already sailed will not let you untick a paper it
  sailed on.

──────────────────────────────────────────────
SCREEN 4 · IGST & REFUNDS
──────────────────────────────────────────────
  Refund owed to you · Already received · Past 60 days · Never paid at all

  Every pay-and-claim shipment with the age of its claim, and a tag:
      not claimable yet    it has not shipped
      claimed, waiting     inside 60 days
      overdue — chase      past 60 days
      received             done

  "Refund received" moves it from owed to received.

  60 DAYS IS NOT A LEGAL DEADLINE. It is the point by which a healthy claim
  has usually landed, so anything older deserves a phone call.

──────────────────────────────────────────────
SCREEN 5 · WIRING   ·   6 · CONNECTORS   ·   7 · BACKUP & HEALTH
──────────────────────────────────────────────
Covered in PART 4, PART 5 and PART 6 below.
`;

const POS = (c) => HDR(c, `Six screens in four groups:
                  COUNTER       Till · Today's bills
                  END OF DAY    Day close · Counter stock
                  WIRING        Wiring
                  CONNECTORS    Connectors
                  SYSTEM        Backup & Health`) + `

════════════════════════════════════════════════════════════════════════
PART 3 · SCREEN BY SCREEN
════════════════════════════════════════════════════════════════════════

THREE RULES THAT MAKE A TILL TRUSTWORTHY

  1. THE PRICE IS NOT TYPED. It comes from the catalogue, so the counter
     cannot quietly undercut the website.
  2. THE DISCOUNT HAS A CEILING — 50% — and it is printed on the bill.
  3. THE DRAWER IS COUNTED EVERY DAY. A ₹200 gap found today is a
     question; the same gap found in a monthly audit is an argument.

──────────────────────────────────────────────
SCREEN 1 · TILL  (where you ring things up)
──────────────────────────────────────────────
FOUR CARDS
  In the cart · Tendered · Still due · Change to give

ADD TO THE CART
  One button per item, each showing its price and how many are left.
  A BUTTON GREYS OUT WHEN THE COUNTER HAS NONE LEFT. You cannot sell what
  is not there — the same rule the website obeys, on the same stock number.

THE CART
  Each line with − and + buttons and Remove, then the bill built up:
       Gross
     − Discount %
     = Taxable
     + GST 5%
     = Total

  GST IS WORKED OUT ON THE DISCOUNTED VALUE, NEVER ON THE GROSS.

DISCOUNT AND PAYMENT  (five boxes)
  Discount % · Cash · UPI · Card · On account. Press Apply.

  Split it however the customer wants. THE BILL WILL NOT PRINT UNTIL THE
  FULL AMOUNT IS COVERED — press it short and the app tells you what is
  still due. Overpay and it shows the change to give.

  "Print the bill" takes the stock down, files the bill, and clears the cart.

──────────────────────────────────────────────
SCREEN 2 · TODAY'S BILLS
──────────────────────────────────────────────
  Takings · Average bill · Discount given · GST collected

HOW THE MONEY CAME IN
  A row per method with a share bar and a tag:
      in the till       cash — expected in the drawer
      into the bank     UPI and card
      not money yet     on account — a receivable, not cash

  Then every bill, with what it was paid by. A discount over 20% shows red.

──────────────────────────────────────────────
SCREEN 3 · DAY CLOSE
──────────────────────────────────────────────
  Opening float · Cash taken · Should be in the drawer · Over / short

COUNT THE DRAWER
  Type what is actually in it and press "Close the day". The app tells you
  whether it matches, and by how much if it does not.

  ONLY CASH IS EXPECTED IN THE DRAWER. UPI and card went to the bank; an
  on-account bill is not money at all. They are listed separately for
  exactly this reason.

  "Count it again" reopens it if you miscounted.

THE DAY, LINE BY LINE
  Float, then every method (the ones not in the drawer greyed), then what
  should be there, what you counted, and the difference.

  ${c.closeLine}

──────────────────────────────────────────────
SCREEN 4 · COUNTER STOCK
──────────────────────────────────────────────
  Lines on the counter · Pieces on hand · Sold today · Running out

  Every item with price, on hand, reorder point, sold today, and a tag:
  "out of stock" · "reorder" · "low" · "ok".

  ONE STOCK NUMBER, NOT ONE PER CHANNEL. The quantity here is the same
  record the website, the marketplaces and the wholesale order book read.
  Sell the last piece at the counter and the website cannot sell it thirty
  seconds later. Almost every oversell in a multi-channel business comes
  from keeping a separate figure per channel and reconciling "later".

──────────────────────────────────────────────
SCREEN 5 · WIRING   ·   6 · CONNECTORS   ·   7 · BACKUP & HEALTH
──────────────────────────────────────────────
Covered in PART 4, PART 5 and PART 6 below.
`;

const QT = (c) => HDR(c, `Five screens in three groups:
                  QUOTING       Overview · All quotes · One quote
                  WIRING        Wiring
                  CONNECTORS    Connectors
                  SYSTEM        Backup & Health`) + `

════════════════════════════════════════════════════════════════════════
PART 3 · SCREEN BY SCREEN
════════════════════════════════════════════════════════════════════════

TWO RULES THAT PAY FOR THE WHOLE APP

  1. A QUOTE EXPIRES BY ITSELF.
     The expiry is worked out from the date and the validity you chose. It
     is not a field somebody has to update, so nobody can honour a
     three-month-old price by accident because "we did quote it".

  2. EVERY REVISION IS KEPT.
     The customer only ever sees the latest. You can always see the first.
     Without that, "what did discounting cost us this quarter" is
     unanswerable — which is why almost nobody asks it.

──────────────────────────────────────────────
SCREEN 1 · OVERVIEW
──────────────────────────────────────────────
FIVE CARDS
  Out with customers  · Accepted (with your win rate)
  Expired unanswered  · Lost to haggling  · Needs a decision

WHERE THE QUOTES ARE — a bar per stage, then expired, lost and the average.

WHAT THE HAGGLING COST  (bottom panel)
  Per revised quote: revisions, first price, price now, what came off, and
  a tag — "held the price" / "some given away" / "over 10% given away".

  ${c.slipLine}

──────────────────────────────────────────────
SCREEN 2 · ALL QUOTES
──────────────────────────────────────────────
RAISE A QUOTE
  Customer · Item · Quantity · Discount % · Valid for (7/15/30/45 days).

THE TABLE
  Revision number under the quote number. An "Expires" column that counts
  down and turns amber under 7 days, red under 3, and says "expired Nd ago"
  once it has gone.

  BUTTONS
    "Sent → / Accepted → / Proforma → / Confirmed order →"
        One click each. NOTHING IS RE-TYPED — the proforma carries the same
        lines, the same discount and the same total as the quote the
        customer said yes to.
    "Lost"      Only until it becomes a proforma.
    "Re-quote"  On an expired quote: raises a fresh one at today's date with
                the same lines, and marks the old one lost.

  AN EXPIRED QUOTE CANNOT BE ADVANCED. The app tells you to re-quote it.

──────────────────────────────────────────────
SCREEN 3 · ONE QUOTE
──────────────────────────────────────────────
Reached with "Open" from the list. "← All quotes" goes back.

  Total now · Stage · Days left · Given away so far

WHAT IS ON IT — the lines, then gross, discount, taxable, GST, total.

REVISE IT — new quantity and new discount, saved as the next revision.
  Only while the quote is still open; an accepted one is frozen.

EVERY REVISION — each one with its pieces, discount, total and why, and the
  current one tagged. The first row never changes, whatever happens after.

──────────────────────────────────────────────
SCREEN 4 · WIRING   ·   5 · CONNECTORS   ·   6 · BACKUP & HEALTH
──────────────────────────────────────────────
Covered in PART 4, PART 5 and PART 6 below.
`;

/* ─────────── the ten builds ─────────── */
const base = { module: 'Module 03 · Sales', liveFrom: 'your other systems' };
const V = {
  D2C_ERP: { app: 'D2C Sales', co: 'Acme Corp', file: 'D2C_Sales.html', kb: 72, tests: 35,
    key: 'medhava_d2c_erp_v1', edition: 'Unified ERP — any industry', companion: 'B2B & Credit · Export · POS · Quotes & Proforma',
    module: 'Module 03 · Sales — App 1 of 5', capCount: 7, altCount: 71, liveFrom: 'your other systems',
    codLine: 'Every COD parcel can be refused at the door, and you pay the courier both ways.',
    cartLine: 'A cart abandoned in the last week is still warm — the person remembers what they wanted and why. After a week the reason has usually gone.',
    testEg: '  · "a coupon below its minimum order value is ignored"\n  · "no COD order got past packing without its 20% advance"\n  · "points are earned only on delivered orders"',
    screens: D2C,
    intro: ['Every order from your own storefront in one pipeline: New → Confirmed →', 'Packed → Shipped → Delivered.', '',
      'Four things it insists on, and each one saves real money:', '',
      '  · A coupon below its minimum order value is IGNORED, not quietly applied.',
      '  · A cash-on-delivery order cannot be PACKED without a 20% advance.',
      '  · Loyalty points are earned on DELIVERY, never on order — so the points',
      '    you owe is always a real liability.',
      '  · Every abandoned cart is listed with its age, because a cart left three',
      '    days ago is the cheapest sale in the business to win back.'] },
  REST: null,
};
V.D2C_VAS = Object.assign({}, V.D2C_ERP, { co: 'Vastrangam', key: 'medhava_d2c_vastrangam_v1',
  edition: 'Vastrangam — ethnic-wear D2C + marketplace',
  codLine: 'In ethnic wear a refused parcel costs the courier fee both ways and the piece comes back creased.',
  cartLine: 'A saree left in a cart this week is still warm — she remembers the wedding she wanted it for. After a week the occasion has usually passed.',
  intro: V.D2C_ERP.intro.concat(['', 'For Vastrangam this is the channel worth protecting: no marketplace',
    'commission, no 14% return rate, and the customer is yours rather than the', 'platform’s.']) });

const B = (id, app, file, kb, tests, n, cap, alt, screens, intro, extra) => {
  const g = Object.assign({ app, file, kb, tests, screens, intro,
    module: 'Module 03 · Sales — App ' + n + ' of 5', capCount: cap, altCount: alt,
    companion: ['D2C Sales', 'B2B & Credit', 'Export', 'POS', 'Quotes & Proforma'].filter(x => x !== app).join(' · '),
    liveFrom: 'your other systems' }, extra || {});
  V[id + '_ERP'] = Object.assign({}, g, { co: 'Acme Corp', key: 'medhava_' + id.toLowerCase() + '_erp_v1',
    edition: 'Unified ERP — any industry' });
  V[id + '_VAS'] = Object.assign({}, g, { co: 'Vastrangam', key: 'medhava_' + id.toLowerCase() + '_vastrangam_v1',
    edition: 'Vastrangam — ethnic-wear D2C + marketplace' });
};

B('B2B', 'B2B & Credit', 'B2B_Credit.html', 74, 35, 2, 7, 74, B2B,
  ['The buy-in-bulk side of selling, and two rules that decide whether it makes', 'money or quietly loses it.', '',
   '  · THE PRICE IS THE TIER, NOT A NEGOTIATION. Every buyer sits on a tier and',
   '    the tier decides the discount. Nobody types a rate, so the price list',
   '    cannot fall apart.', '',
   '  · THE CREDIT CHECK IS A GATE, NOT A WARNING. An order that would take a',
   '    buyer over their limit goes ON HOLD. It is not lost, and it is not',
   '    silently approved either.', '',
   'Ageing is measured against each buyer’s OWN agreed terms, so a 45-day buyer',
   'is never called late on day 31 and a 15-day buyer is not given 30 days by',
   'accident. And a buyer with headroom left but a 90-day-old invoice is still',
   'stopped — headroom on its own is a half-answer.'],
  { testEg: '  · "an order that would break the limit is refused, not approved"\n  · "age is measured against each buyer’s own terms"\n  · "a buyer with room left but a 90-day-old invoice is still stopped"' });

B('EXP', 'Export', 'Export.html', 73, 34, 3, 7, 76, EXP,
  ['An export order is a DOCUMENT problem, not a selling problem.', '',
   'Five papers travel with every shipment — commercial invoice, packing list,',
   'shipping bill, bill of lading, certificate of origin. Miss one and a',
   'container sits at a port earning demurrage. So this app refuses to mark a',
   'shipment shipped until all five are ticked.', '',
   'It also handles the two lawful ways to deal with GST on an export: file an',
   'LUT bond and pay no IGST at all, or pay it and claim it back. On the second',
   'route the tax is YOUR working capital sitting with the government — the most',
   'commonly forgotten receivable in a small export business, because nobody',
   'owns the list. Every unclaimed refund here is shown with its age.', '',
   'And every rupee figure comes from ONE exchange rate held in one place.'],
  { ccy: 'USD', routeLine: 'If you export more than a few times a year the LUT bond is almost always right: one filing, and the tax money stays in your account.',
    testEg: '  · "no shipment sailed with an incomplete set of papers"\n  · "an LUT-bond shipment pays no IGST at all"\n  · "changing the rate moves every rupee figure together"' });

B('POS', 'POS', 'POS.html', 72, 33, 4, 6, 61, POS,
  ['A till that cannot lie to the rest of the business.', '',
   '  · The price comes from the catalogue, not from whoever is at the counter,',
   '    so the shop cannot quietly undercut the website.',
   '  · The discount is capped at 50% and printed on the bill.',
   '  · GST is worked out on the discounted value, never on the gross.',
   '  · Payment can be split any way the customer wants — and the bill will not',
   '    print until the full amount is covered.',
   '  · Stock comes off the ONE shared number every channel reads, so selling',
   '    the last piece at the counter stops the website selling it thirty',
   '    seconds later.',
   '  · At close, only the cash is expected in the drawer — so a gap is found',
   '    the same day rather than in a monthly audit.'],
  { closeLine: 'Counting the drawer takes two minutes and it is the only moment in the day when the money and the paperwork are forced to agree.',
    testEg: '  · "GST is never charged on the discount"\n  · "counting less than expected shows short, not over"\n  · "stock on hand = what was stocked less what was sold"' });

B('QT', 'Quotes & Proforma', 'Quotes_Proforma.html', 73, 34, 5, 6, 62, QT,
  ['Send a quote, revise it as the customer haggles, and turn the accepted one',
   'into a proforma and then a confirmed order in one click each — with nothing',
   're-typed.', '',
   'Two things make this worth having.', '',
   '  · A QUOTE EXPIRES BY ITSELF the day its validity runs out. Nobody has to',
   '    remember, and nobody can honour a three-month-old price by accident.', '',
   '  · EVERY REVISION IS KEPT. The customer only sees the latest; you can',
   '    always see the first. That is the only way to answer "what did',
   '    discounting cost us this quarter".'],
  { slipLine: 'One quote losing 10% is a negotiation. Every quote losing 10% is a price list that is 10% too high — and nobody notices unless somebody keeps the first offer.',
    testEg: '  · "a quote past its validity reads as expired on its own"\n  · "adding a revision does not change the first one"\n  · "a proforma carries the same total as the accepted quote"' });

delete V.REST;
const order = ['D2C_ERP', 'D2C_VAS', 'B2B_ERP', 'B2B_VAS', 'EXP_ERP', 'EXP_VAS', 'POS_ERP', 'POS_VAS', 'QT_ERP', 'QT_VAS'];
for (const k of order) {
  const c = V[k];
  c.intro = c.intro.join('\n');
  const md = manual(c, c.screens);
  fs.writeFileSync(path.join(OUT, k + '_MANUAL.md'), md);
  console.log(k.padEnd(9), Math.round(md.length / 1024) + 'KB', md.split('\n').length + ' lines');
}
