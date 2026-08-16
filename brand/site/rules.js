'use strict';
/* THE RULEBOOK — the canonical list, in the same spirit as modules.js.

   WHAT A RULE IS HERE
   Not a feature. A feature says what the software does; a rule says what it
   REFUSES to do, which is the only half a business can actually rely on.
   So every entry carries four things:

     when   the trigger — the moment the rule applies
     then   what the system does
     never  what it will not do instead, however convenient that would be
     state  ENFORCED (a test proves it today) or SPECIFIED (designed, not built)

   An entry with no `never` is a description wearing a rule’s clothes, and
   checkrules.js rejects it. An entry marked ENFORCED must name a file that
   exists and, where it names a test, that exact test string must be findable
   in that file — so a rule cannot claim a proof it does not have.

   THE HONEST PART
   Most of this reads SPECIFIED. That is not a failure of the document, it is
   the measurement the document exists to make: it says exactly how much of
   this business the software enforces today, so the number can go up build by
   build and be counted rather than claimed.

   Straight apostrophes break the sibling files and read wrong in the PDF —
   use the typographic ’ throughout. checkrules.js enforces that too. */

const CORE = 'core/tests/core.test.js';
const STUDIO = 'brand/suite/studio/verify_studio.js';
const ROUTER = 'brand/suite/router.js';
const MOTION = 'brand/suite/studio/motion_render.js';
const SCHEMA = 'core/tests/schema.test.js';

/* shorthand so a rule reads as a rule and not as punctuation */
const E = (by) => ({ state: 'ENFORCED', by });
const S = { state: 'SPECIFIED', by: '—' };

module.exports = [

/* ══ 01 · PLATFORM ══════════════════════════════════════════════════════ */

{ id:'R01.1', mod:'01', title:'Every business record names the company it belongs to',
  when:'any record is written — a sale, a movement, a voucher, an employee',
  then:'its company is stored on the row itself',
  never:'inferring the company from who happens to be logged in, which silently mis-files every record made by someone who works across two of them',
  ...E(`${CORE} › the schema loads and the three companies keep three different codes`) },

{ id:'R01.2', mod:'01', title:'One company cannot read another company’s records',
  when:'a query runs for a user scoped to one company',
  then:'rows belonging to any other company are not returned at all',
  never:'filtering in the screen while the data is already loaded — a filter can be removed, a scope cannot',
  ...E(`${CORE} › one company cannot read another company`) },

{ id:'R01.3', mod:'01', title:'The audit trail has no off switch',
  when:'anything touching money, stock, price, tax, pay or master data changes',
  then:'the change and its before-image are written in the same transaction as the change itself',
  never:'allowing a setting, a role or a migration to disable it — either both land or neither does',
  ...E(`${CORE} › an audited insert leaves a before/after trail`) },

{ id:'R01.4', mod:'01', title:'An update records what it was, not only what it became',
  when:'a row is changed',
  then:'the current row is read first so the before-image is what was really there',
  never:'trusting the caller’s idea of the old value, which makes the trail a record of intentions rather than of facts',
  ...E(`${CORE} › an update records what it was as well as what it became`) },

{ id:'R01.5', mod:'01', title:'A table nobody thought to audit is refused',
  when:'code writes to a table that is not on the audited list',
  then:'the write is refused and the table is named',
  never:'letting it through quietly, which is how a money column ends up outside the trail without anyone deciding that',
  ...E(`${CORE} › a table nobody thought to audit is refused, rather than slipping through`) },

{ id:'R01.6', mod:'01', title:'Deletion is a reversal, never a removal',
  when:'a user deletes anything',
  then:'the record is voided, marked, and still readable with the reason',
  never:'removing the row — eight years of trail cannot survive a DELETE',
  ...E(`${CORE} › voiding is the only removal, and it is reversible`) },

{ id:'R01.7', mod:'01', title:'A module that is not in the canonical list cannot join the bus',
  when:'code subscribes to a business event',
  then:'the module number is checked against modules.js and refused if unknown',
  never:'letting an unregistered listener attach, which is how a cascade gains a step nobody can find later',
  ...E(`${CORE} › a module not in modules.js cannot subscribe`) },

{ id:'R01.8', mod:'01', title:'A cascade is all of it or none of it',
  when:'one business event fans out to stock, ledger, customer and documents',
  then:'every step commits together, or the whole thing is rolled back',
  never:'leaving stock moved and the ledger unposted, which is the exact state no report can ever explain',
  ...E(`${CORE} › a sale moves stock and posts to the ledger, or does neither`) },

{ id:'R01.9', mod:'01', title:'A handler that throws takes the transaction with it',
  when:'any subscriber to an event fails',
  then:'the emitting transaction fails too',
  never:'swallowing the error so the originating action appears to have succeeded',
  ...E(`${CORE} › a handler that throws takes the whole transaction with it`) },

{ id:'R01.10', mod:'01', title:'No capability depends on a single outside service',
  when:'any capability is used — books, courier, payments, AI, storage, GST',
  then:'an ordered list of interchangeable providers is tried, ending on one that needs nothing connected',
  never:'having one provider whose outage stops the work, however good that provider is',
  ...E(`${ROUTER} › no spend ceiling can exhaust any cascade (a free option is always in it)`) },

{ id:'R01.11', mod:'01', title:'A failing provider is taken out of the list, not hammered',
  when:'a provider fails repeatedly',
  then:'it is tripped open, skipped entirely, and retried once after a cooldown',
  never:'retrying into a dead service on every call while a working alternative sits further down the list',
  ...E(`${ROUTER} › three consecutive failures trip the breaker open`) },

{ id:'R01.12', mod:'01', title:'A spend ceiling refuses, it does not warn',
  when:'a paid call would take spending past the ceiling set for it',
  then:'that provider is refused and the work completes on a free one',
  never:'letting it through with a warning nobody reads, and never refusing only the first provider while the same spend reroutes to the next',
  ...E(`${ROUTER} › a ceiling below the price refuses every paid option, not just the first`) },

{ id:'R01.13', mod:'01', title:'The system never asks for a marketplace, bank or account password',
  when:'any integration is connected, by any module, including a chatbot or an agent',
  then:'a scoped, revocable key is requested instead, cancellable from the provider’s side without changing the login',
  never:'accepting, storing, echoing or transmitting an account password — there is no screen, no import and no support flow that takes one',
  ...S },

{ id:'R01.14', mod:'01', title:'Card and bank credentials never reach application code',
  when:'a payment needs a card or bank detail',
  then:'the provider’s own secured field takes it directly',
  never:'passing it through this system, even in transit, even unlogged — what is never received cannot be leaked',
  ...S },

{ id:'R01.15', mod:'01', title:'Consent and retention are two different clocks',
  when:'a person’s data is held',
  then:'why it may be used and how long it is kept are tracked separately, and an erasure request is resolved against both',
  never:'treating a legal retention period as consent to keep using the data for anything else',
  ...S },

/* ══ 02 · DESIGN & SAMPLING ═════════════════════════════════════════════ */

{ id:'R02.1', mod:'02', title:'A style becomes a SKU only after sign-off',
  when:'someone tries to create a catalogue record for a design',
  then:'the design must already have passed sample sign-off',
  never:'letting a SKU exist for something with no agreed specification, which puts an unmakeable item on sale',
  ...S },

{ id:'R02.2', mod:'02', title:'Every version of a specification is kept',
  when:'a sample round changes a measurement, a fabric or a trim',
  then:'a new version is written and the old one stays readable',
  never:'editing the specification in place — a karigar paid against last month’s spec must still be able to show what it said',
  ...S },

{ id:'R02.3', mod:'02', title:'A costed trial carries the date its rates came from',
  when:'a sample is costed',
  then:'the rate and the date it was in force are both stored on the trial',
  never:'recosting an old trial with today’s rates and presenting the result as what it cost then',
  ...S },

{ id:'R02.4', mod:'02', title:'A design with no ownership record is flagged, not blocked',
  when:'a design reaches sign-off with no trademark or copyright status on file',
  then:'it proceeds and is listed as unprotected',
  never:'silently treating it as protected, which is only discovered when a near-identical listing appears and there is nothing to act on',
  ...S },

{ id:'R02.5', mod:'02', title:'The first-shown date is recorded when it happens',
  when:'a design is first shown publicly — an exhibition, a listing, a lookbook',
  then:'that date is stamped and never editable afterwards',
  never:'backdating it later, which is precisely the field a dispute turns on',
  ...S },

{ id:'R02.6', mod:'02', title:'A rejected sample keeps its reason',
  when:'a sample round is rejected',
  then:'the reason is recorded against the version',
  never:'closing it with a status alone, which loses the only information that stops the same mistake in the next round',
  ...S },

{ id:'R02.7', mod:'02', title:'A specification cannot be deleted while stock exists against it',
  when:'someone removes a design that has ever been made',
  then:'it is archived and stays linked to every piece produced from it',
  never:'orphaning finished stock from the specification it was made to',
  ...S },

/* ══ 03 · INVENTORY & CATALOG ═══════════════════════════════════════════ */

{ id:'R03.1', mod:'03', title:'Stock is one number per SKU, per location, per stage',
  when:'any module asks how much there is',
  then:'it reads the one quantity, with the channel recorded on the movement rather than on the stock',
  never:'keeping a separate stock figure per channel — the last piece sold on one marketplace has to vanish from the other ten at the same instant, which per-channel inventory cannot do',
  ...E(`${CORE} › stock is one number per SKU, with the channel recorded on the movement`) },

{ id:'R03.2', mod:'03', title:'Negative stock is a fault, not a state',
  when:'an issue would take a quantity below zero',
  then:'the issue is refused',
  never:'recording a negative balance and leaving someone to explain it at month-end',
  ...E(`${CORE} › issuing more than exists is refused — negative stock is a fault, not a state`) },

{ id:'R03.3', mod:'03', title:'Selling a kit decrements every component',
  when:'a kit or combo SKU is sold',
  then:'each component SKU is decremented at order time',
  never:'decrementing only the kit, which leaves the components sellable twice',
  ...E(`${CORE} › selling a kit decrements every component`) },

{ id:'R03.4', mod:'03', title:'A kit with no components is refused',
  when:'an item is marked a kit but lists nothing',
  then:'the record is refused and named',
  never:'accepting it and silently decrementing nothing on every sale',
  ...E(`${CORE} › a kit that lists no components is refused, not silently sold as nothing`) },

{ id:'R03.5', mod:'03', title:'Stock value ties to the item cost, always',
  when:'stock is valued',
  then:'the value is computed from the quantity and the item cost',
  never:'storing a valuation that can drift from the quantity it is supposed to describe',
  ...E(`${CORE} › stock value ties to the item cost`) },

{ id:'R03.6', mod:'03', title:'Every movement has a source, a destination, or both',
  when:'a stock movement is recorded',
  then:'at least one end is named',
  never:'accepting a movement from nowhere to nowhere, which is how quantity appears without a cause',
  ...E(`${CORE} › a movement with neither a source nor a destination is refused`) },

{ id:'R03.7', mod:'03', title:'A quantity is a whole number above zero',
  when:'a movement is written',
  then:'a non-integer or non-positive quantity is refused',
  never:'accepting a negative movement as a shorthand for a reversal — a reversal is its own movement with its own reason',
  ...E(`${CORE} › a quantity must be a whole number above zero`) },

{ id:'R03.8', mod:'03', title:'Goods in someone else’s warehouse are still yours',
  when:'stock sits in a channel’s own warehouse under consignment or sale-or-return',
  then:'that warehouse is a location like any other and the stock is counted, valued and aged there',
  never:'letting it drop off the books until it sells, which understates both stock and exposure',
  ...S },

{ id:'R03.9', mod:'03', title:'Fabric in metres and pieces in numbers share one item master',
  when:'an item is defined',
  then:'its unit of measure is a property of the item',
  never:'building a second item master for a second unit, which splits the one stock number this module exists to protect',
  ...S },

{ id:'R03.10', mod:'03', title:'A listing needs the packed size and weight before it can go out',
  when:'a product is pushed to a channel',
  then:'packed dimensions and weight must be present',
  never:'listing without them, because that is the field every courier weight dispute is settled on',
  ...S },

{ id:'R03.11', mod:'03', title:'The channel’s own code for a product is mapped, not assumed',
  when:'a product exists on a marketplace',
  then:'that channel’s identifier is stored against ours',
  never:'matching on name or on a code we invented, which mis-posts every settlement line for that product',
  ...S },

{ id:'R03.12', mod:'03', title:'A duplicate master record is merged, never left as two',
  when:'the same customer, vendor or design is detected twice',
  then:'they are merged and both old identifiers keep resolving',
  never:'leaving two live records, which splits every total that record appears in',
  ...S },

{ id:'R03.13', mod:'03', title:'A price is per channel and dated',
  when:'a channel price is set',
  then:'it is stored against that channel with the date it takes effect',
  never:'holding one price and reading it as if it applied everywhere and always',
  ...S },

{ id:'R03.14', mod:'03', title:'Dead stock is named as dead stock',
  when:'an item has not moved for the period set for it',
  then:'it appears on the dead-stock register with its age and carrying value',
  never:'leaving it inside the general stock figure where it reads as healthy inventory',
  ...S },

/* ══ 04 · CRM ═══════════════════════════════════════════════════════════ */

{ id:'R04.1', mod:'04', title:'One customer, one record, whichever channel they arrived by',
  when:'the same person orders on a marketplace and later at the counter',
  then:'both land on one record with the channel noted on each order',
  never:'creating a second customer per channel, which makes lifetime value meaningless',
  ...S },

{ id:'R04.2', mod:'04', title:'A document is filed against the record it belongs to',
  when:'any agreement, receipt, certificate or scan is stored',
  then:'it is attached to the order, party, case or employee it concerns',
  never:'filing it in a folder that has to be remembered rather than found',
  ...S },

{ id:'R04.3', mod:'04', title:'A signed copy files itself back',
  when:'a document sent for signature is signed',
  then:'the signed version returns to the same record automatically',
  never:'leaving the signed copy in an inbox while the record still shows it as pending',
  ...S },

{ id:'R04.4', mod:'04', title:'A ticket carries the order it is about',
  when:'a question arrives by chat, email or phone',
  then:'it is tied to the order or account it concerns, with the history already on screen',
  never:'opening a ticket with no link, which makes the first reply a request to explain again',
  ...S },

{ id:'R04.5', mod:'04', title:'Feedback attaches to the item, not only the buyer',
  when:'a rating or complaint arrives after delivery',
  then:'it is attached to the design or item it is actually about',
  never:'holding it only against the customer, which hides a complaint-prone item as a scatter of unrelated gripes',
  ...S },

{ id:'R04.6', mod:'04', title:'A customer’s consent travels with their data',
  when:'a customer record is used for marketing or profiling',
  then:'the consent captured at the point it was given is checked first',
  never:'assuming that having the data implies permission to use it for anything',
  ...S },

{ id:'R04.7', mod:'04', title:'A merged customer keeps both histories',
  when:'two customer records are merged',
  then:'every order, ticket and document from both survives on the surviving record',
  never:'discarding the shorter history to make the merge simple',
  ...S },

{ id:'R04.8', mod:'04', title:'Credit state is read at the moment of the order',
  when:'a B2B order is placed',
  then:'the customer’s outstanding and limit are evaluated then',
  never:'using a figure cached from the last sync, which is how a party goes past its limit between refreshes',
  ...S },

{ id:'R04.9', mod:'04', title:'A closed ticket keeps what resolved it',
  when:'a ticket is closed',
  then:'the resolution is recorded on it',
  never:'closing with a status alone, which loses the answer the next identical question needs',
  ...S },

/* ══ 05 · SALES ═════════════════════════════════════════════════════════ */

{ id:'R05.1', mod:'05', title:'Every sale carries its company and its channel',
  when:'an order is created on any channel',
  then:'both are written on the order',
  never:'leaving either to be inferred later from the document number or the warehouse',
  ...E(`${CORE} › every one of the hundred cells posted its own figure, channel by channel`) },

{ id:'R05.2', mod:'05', title:'A sale posts stock and ledger together',
  when:'a sale is confirmed',
  then:'stock is deducted, the invoice is raised, and the ledger is posted in one transaction',
  never:'invoicing without moving stock, or moving stock without posting',
  ...E(`${CORE} › a sale moves stock and posts to the ledger, or does neither`) },

{ id:'R05.3', mod:'05', title:'If the ledger refuses, the stock never moved',
  when:'the posting half of a sale fails',
  then:'the stock movement is rolled back with it',
  never:'leaving the goods gone and the books untouched',
  ...E(`${CORE} › and if the ledger refuses, the stock never moved`) },

{ id:'R05.4', mod:'05', title:'A quote becomes an order without being retyped',
  when:'a quotation is accepted',
  then:'the order is created from it, carrying the same lines and prices',
  never:'re-entering the lines, which is where the price on the quote and the price on the invoice start to differ',
  ...S },

{ id:'R05.5', mod:'05', title:'A price below the floor needs an approval, not a note',
  when:'a line is priced under the floor set for it',
  then:'the order waits in the approvals queue with the rule that stopped it named',
  never:'letting it through with a comment box, which is a discount policy nobody can enforce',
  ...S },

{ id:'R05.6', mod:'05', title:'An export invoice knows it is an export',
  when:'an order ships outside the country',
  then:'the LUT or IGST treatment, currency and shipping terms are set on the order itself',
  never:'treating it as a domestic invoice and correcting the tax afterwards',
  ...S },

{ id:'R05.7', mod:'05', title:'A counter sale is the same order record',
  when:'someone buys at the counter',
  then:'the same order table records it, with the counter as the channel',
  never:'running the till on a separate book that has to be merged later',
  ...S },

{ id:'R05.8', mod:'05', title:'A credit sale reserves the credit at the moment it is taken',
  when:'a B2B order is accepted on credit',
  then:'the exposure is committed against the party immediately',
  never:'counting it only when the invoice is raised, which lets several orders each fit inside the same limit',
  ...S },

{ id:'R05.9', mod:'05', title:'A dispatch cannot exceed what was ordered',
  when:'a shipment is prepared',
  then:'quantities are checked against the order line',
  never:'shipping over, which becomes an invoice the customer never agreed to',
  ...S },

{ id:'R05.10', mod:'05', title:'A cancelled order releases what it held',
  when:'an order is cancelled',
  then:'reserved stock and committed credit are both released',
  never:'leaving stock reserved against a dead order, which shows the business as out of goods it actually has',
  ...S },

{ id:'R05.11', mod:'05', title:'An AWB belongs to the shipment, not the courier integration',
  when:'a tracking number is recorded, typed in or fetched',
  then:'it is stored on the shipment',
  never:'making the number reachable only through whichever courier API produced it, which loses it the day that courier is dropped',
  ...S },

{ id:'R05.12', mod:'05', title:'A subscription renewal is a new order',
  when:'a subscription renews',
  then:'a fresh order is created with its own stock, invoice and posting',
  never:'extending the original order, which makes the revenue of two periods indistinguishable',
  ...S },

{ id:'R05.13', mod:'05', title:'A sale to a sister company is marked as one',
  when:'the counterparty is another company in the group',
  then:'the counterparty company is recorded on the entry',
  never:'posting it as an ordinary outside sale, which inflates the group turnover by trade it never did',
  ...E(`${CORE} › an entry cannot be its own counterparty`) },

/* ══ 06 · PLANNING & REQUIREMENTS (MRP) ═════════════════════════════════ */

{ id:'R06.1', mod:'06', title:'A forecast is labelled a forecast wherever it appears',
  when:'a projected figure is shown beside actuals',
  then:'it is visually and structurally distinct',
  never:'letting a forecast total sit in the same column as a real one, which is how a plan becomes a reported result',
  ...S },

{ id:'R06.2', mod:'06', title:'A requirement run reads live stock, not a snapshot',
  when:'the MRP run explodes requirements',
  then:'it reads the current quantity at the moment it runs',
  never:'planning against a nightly copy, which orders material the business already has',
  ...S },

{ id:'R06.3', mod:'06', title:'A requirement names what caused it',
  when:'the run produces a shortfall',
  then:'the order, forecast or reorder level that generated it is recorded on the line',
  never:'producing a bare quantity nobody can trace back to a demand',
  ...S },

{ id:'R06.4', mod:'06', title:'Stock already on order counts against the shortfall',
  when:'the run computes what to buy',
  then:'open purchase orders are netted off first',
  never:'ignoring them and ordering the same material twice',
  ...S },

{ id:'R06.5', mod:'06', title:'A budget ceiling refuses, it does not warn',
  when:'a proposed purchase would exceed the open-to-buy ceiling',
  then:'it is held for approval with the ceiling named',
  never:'raising it with a warning, which makes the ceiling advisory and therefore not a ceiling',
  ...S },

{ id:'R06.6', mod:'06', title:'A lead time is per vendor and per item',
  when:'a run works out when to order',
  then:'it uses the lead time recorded for that vendor and that item',
  never:'applying one global lead time, which under-orders the slow lines and over-orders the fast ones',
  ...S },

{ id:'R06.7', mod:'06', title:'A run is kept, not overwritten',
  when:'the MRP run executes again',
  then:'the previous run stays readable with its inputs',
  never:'replacing it, which makes it impossible to see why last week’s decision was taken',
  ...S },

{ id:'R06.8', mod:'06', title:'A seasonal signal cannot silently become a permanent one',
  when:'a festival or season inflates demand',
  then:'the period it applies to is stored with the signal',
  never:'folding a spike into the baseline, which keeps ordering for a festival all year',
  ...S },

/* ══ 07 · PURCHASE ══════════════════════════════════════════════════════ */

{ id:'R07.1', mod:'07', title:'Nothing is paid without a three-way match',
  when:'a vendor invoice is approved',
  then:'the purchase order, the goods received note and the invoice must agree',
  never:'paying on the invoice alone, which pays for goods that never arrived',
  ...S },

{ id:'R07.2', mod:'07', title:'A short or damaged receipt is recorded as received short',
  when:'the GRN quantity is below the PO quantity',
  then:'the difference is recorded with its reason and the payable follows the received quantity',
  never:'receiving the full quantity to make the match pass',
  ...S },

{ id:'R07.3', mod:'07', title:'Input tax credit is claimed against a real document',
  when:'ITC is taken on a purchase',
  then:'the vendor invoice and its tax detail are on file',
  never:'claiming credit from a payment record alone, which is the claim that fails reconciliation',
  ...S },

{ id:'R07.4', mod:'07', title:'Landed cost reaches the item, not just the P&L',
  when:'freight, duty or insurance is attached to a purchase',
  then:'it is apportioned into the cost of the items received',
  never:'expensing it separately, which understates the cost of every piece made from that material',
  ...S },

{ id:'R07.5', mod:'07', title:'A vendor price is dated',
  when:'a rate is agreed with a supplier',
  then:'it is stored with the date it takes effect',
  never:'overwriting the old rate, which makes last month’s purchase look mispriced',
  ...S },

{ id:'R07.6', mod:'07', title:'A purchase order over its approval level waits',
  when:'a PO exceeds the value a role may approve',
  then:'it goes to the approvals queue naming the rule and the level',
  never:'splitting it into smaller orders to fit under the limit — the split is detected and the parts are assessed together',
  ...S },

{ id:'R07.7', mod:'07', title:'A vendor with no active record cannot be paid',
  when:'a payment is raised',
  then:'the vendor must exist, be active, and have its bank detail verified',
  never:'paying to detail typed onto the payment itself, which is the single most common route for payment fraud',
  ...S },

{ id:'R07.8', mod:'07', title:'A change to vendor bank detail is treated as high risk',
  when:'a vendor’s bank account is changed',
  then:'the change is approved by a second person and the old detail is kept',
  never:'accepting a change from an email instruction alone',
  ...S },

{ id:'R07.9', mod:'07', title:'A job-work despatch stays on the books',
  when:'material is sent to a contractor',
  then:'it moves to a job-work location and remains this company’s stock',
  never:'writing it out on despatch, which loses material the business still owns',
  ...S },

{ id:'R07.10', mod:'07', title:'An insurance policy is linked to what it covers',
  when:'a policy is recorded',
  then:'the stock, premises or shipment it covers is named on it',
  never:'holding policies as documents with no link, which is discovered only at the moment of a claim',
  ...S },

/* ══ 08 · MANUFACTURING ═════════════════════════════════════════════════
   The karigar rules are the ones this business is paid or overpaid by, so
   most of them are enforced against the owner’s own workbooks rather than
   asserted. A wrong rule here is a wrong payment to a real person. */

{ id:'R08.1', mod:'08', title:'Sets are pooled across every karigar before the minimum is taken',
  when:'completed sets are counted for a design',
  then:'every karigar’s pieces for that design are pooled first, and the set count is the minimum across the populated member columns of the pool',
  never:'counting sets per karigar row and adding them up, which loses every set completed by two people between them',
  ...E(`${STUDIO} › pooling happens before the minimum, not per karigar row`) },

{ id:'R08.2', mod:'08', title:'A surplus piece is paid for, and is not a set',
  when:'a karigar makes more of one garment than the set needs',
  then:'the extra is named individually and paid at its own piece rate',
  never:'adding it to the set count, and never leaving it unpaid because it did not complete a set — the person made it either way',
  ...E(`${STUDIO} › a surplus piece is named, is still paid for, and is never added to the sets`) },

{ id:'R08.3', mod:'08', title:'A design counts on the garments it actually has',
  when:'a design is made of fewer garment types than the usual set',
  then:'it is counted on the members it does have',
  never:'returning zero because an optional member is absent, which silently unpays a whole design',
  ...E(`${STUDIO} › an Anarkali-only design counts on what it has, not zero`) },

{ id:'R08.4', mod:'08', title:'A missing rate posts zero and is flagged, never guessed',
  when:'a design has no entry in the stitching rate master',
  then:'it costs zero and the design is named in the summary',
  never:'inferring a rate from a similar design — a guessed rate is a wrong payment to a real person',
  ...E(`${STUDIO} › a missing rate posts zero and is flagged, never guessed`) },

{ id:'R08.5', mod:'08', title:'A two-row heading is read as two rows',
  when:'the production grid uses a merged heading over garment columns',
  then:'both header rows are read so repeated garment names stay distinct columns',
  never:'reading only the first row, which collapses three Dupatta columns into one and undercounts the work',
  ...E(`${STUDIO} › the two-row heading is read, so three Dupatta columns stay three garments`) },

{ id:'R08.6', mod:'08', title:'A karigar written as a pair stays one unit',
  when:'two names share one row as a working pair',
  then:'they are treated as a single paying unit',
  never:'splitting them into two karigars, which halves each person’s recorded output and breaks the payout',
  ...E(`${STUDIO} › a karigar written as a pair stays one unit`) },

{ id:'R08.7', mod:'08', title:'Several years of grids pool into one set of figures',
  when:'more than one production workbook is supplied',
  then:'their grids pool into a single costing',
  never:'reporting each file separately, which double-counts nothing but hides the sets completed across a year boundary',
  ...E(`${STUDIO} › several years of grids pool into one set of figures`) },

{ id:'R08.8', mod:'08', title:'Cost per piece is independent of set completion',
  when:'the cost of a design is worked out',
  then:'each raw piece is costed at its own rate',
  never:'costing by completed sets, which values an unfinished set at nothing while the labour has already been spent',
  ...E(`${STUDIO} › the grand total is the sum of the designs, and of the karigars`) },

{ id:'R08.9', mod:'08', title:'A production report moves stock and pay together',
  when:'a karigar production report is accepted',
  then:'finished stock comes in, the payout is raised in HR, wages post to the ledger, and the design cost updates — in one transaction',
  never:'taking the stock in and settling the pay in a separate pass, which is how the two disagree',
  ...S },

{ id:'R08.10', mod:'08', title:'Material issued to production leaves raw stock at the moment it is issued',
  when:'a production order consumes material',
  then:'raw stock is reduced and work in progress increases',
  never:'consuming at completion, which shows material as available while it is already cut',
  ...S },

{ id:'R08.11', mod:'08', title:'A bill of materials is versioned with the design',
  when:'a production order is created',
  then:'it captures the BOM version in force at that moment',
  never:'reading the current BOM when costing an old order, which recosts history',
  ...S },

{ id:'R08.12', mod:'08', title:'Wastage is recorded, not absorbed',
  when:'consumption exceeds the BOM',
  then:'the excess is recorded as wastage against the order with its reason',
  never:'quietly increasing the BOM to match what was used, which destroys the only signal that something is going wrong',
  ...S },

{ id:'R08.13', mod:'08', title:'A stage cannot be skipped without being recorded as skipped',
  when:'work moves past a defined stage without that stage being marked',
  then:'the skip is recorded on the order',
  never:'letting the stage silently complete, which makes every stage-time figure fiction',
  ...S },

{ id:'R08.14', mod:'08', title:'An advance to a karigar is a balance, not a deduction from nowhere',
  when:'an advance is paid',
  then:'it is held against that karigar and recovered from later payouts, with the running balance visible',
  never:'deducting an amount at payout time that cannot be traced to a specific advance',
  ...S },

{ id:'R08.15', mod:'08', title:'A rework carries the cost of the rework',
  when:'a piece is returned to a stage to be redone',
  then:'the additional labour is costed to the design that caused it',
  never:'costing it as new production, which makes a failing design look as profitable as a good one',
  ...S },

/* ══ 09 · QUALITY & COMPLIANCE ══════════════════════════════════════════ */

{ id:'R09.1', mod:'09', title:'A failed check blocks the next stage',
  when:'an inspection fails',
  then:'the batch cannot progress until it is passed, reworked or written off',
  never:'letting it move with the failure noted, which sends a known defect to a customer',
  ...S },

{ id:'R09.2', mod:'09', title:'A check names the person who did it',
  when:'any inspection is recorded',
  then:'the inspector, the time and the sample size are stored',
  never:'accepting an anonymous pass, which cannot be investigated when the complaints arrive',
  ...S },

{ id:'R09.3', mod:'09', title:'An expiring certificate warns before it expires',
  when:'a certificate approaches its expiry',
  then:'it is raised while there is still time to renew',
  never:'discovering the lapse at the moment a buyer asks for it',
  ...S },

{ id:'R09.4', mod:'09', title:'A rejected batch cannot be sold as first quality',
  when:'a batch is rejected',
  then:'it is marked and can only be sold through a channel that accepts seconds',
  never:'letting it re-enter the ordinary sellable pool',
  ...S },

{ id:'R09.5', mod:'09', title:'A defect is attached to the design and the stage',
  when:'a defect is recorded',
  then:'both the design and the stage that produced it are named',
  never:'recording it against the batch alone, which loses the pattern that would have prevented the next one',
  ...S },

{ id:'R09.6', mod:'09', title:'A compliance document is evidence, not a checkbox',
  when:'a compliance requirement is marked met',
  then:'the document proving it is attached',
  never:'accepting a tick with nothing behind it, which is what fails an audit',
  ...S },

{ id:'R09.7', mod:'09', title:'A sustainability figure comes from the same evidence',
  when:'an ESG figure is reported',
  then:'it is computed from the certificate and audit records already on file',
  never:'assembling it separately once a year from numbers nobody can trace',
  ...S },

/* ══ 10 · WAREHOUSE ═════════════════════════════════════════════════════ */

{ id:'R10.1', mod:'10', title:'A pick is confirmed against the bin it came from',
  when:'an item is picked',
  then:'the bin is recorded on the movement',
  never:'decrementing a warehouse total with no bin, which makes the next cycle count unexplainable',
  ...S },

{ id:'R10.2', mod:'10', title:'A short pick stops the pack, it does not silently reduce the order',
  when:'the picker cannot find the full quantity',
  then:'the shortage is raised against the order and the pack waits',
  never:'packing what was found and invoicing for it as though that was the order',
  ...S },

{ id:'R10.3', mod:'10', title:'A scan is the same event as a keyed entry',
  when:'a code is captured by scanner, phone camera or typing',
  then:'the same movement is written',
  never:'having a scanning path that writes different records from the manual path',
  ...S },

{ id:'R10.4', mod:'10', title:'A cycle count adjustment names a reason',
  when:'a count differs from the system',
  then:'the adjustment records the reason and the person',
  never:'writing the system down to the counted figure with no explanation, which hides theft and damage equally well',
  ...S },

{ id:'R10.5', mod:'10', title:'The packing video is linked to the shipment',
  when:'a parcel is recorded on video at packing',
  then:'the recording is attached to that shipment',
  never:'keeping the footage in a folder by date, which makes it unusable in the dispute it exists for',
  ...S },

{ id:'R10.6', mod:'10', title:'A bin holds a location, not a guess',
  when:'stock is put away',
  then:'the destination bin is captured at put-away',
  never:'assigning a default bin so the step can be skipped',
  ...S },

{ id:'R10.7', mod:'10', title:'A dispatch cut-off is per channel',
  when:'a channel has a handover deadline',
  then:'the queue is ordered and warned against that channel’s own cut-off',
  never:'applying one cut-off to all of them, which misses the earliest and idles for the latest',
  ...S },

{ id:'R10.8', mod:'10', title:'A returned parcel is inspected before it is anything else',
  when:'a return arrives at the warehouse',
  then:'it is booked into a return-inspection location first',
  never:'restocking on arrival, which puts an unchecked item back on sale',
  ...S },

/* ══ 11 · LOGISTICS ═════════════════════════════════════════════════════ */

{ id:'R11.1', mod:'11', title:'The courier rate is checked against the packed weight',
  when:'a courier bills for a shipment',
  then:'the billed weight is compared with the packed weight recorded at packing',
  never:'accepting the courier’s weight without comparison, which is the most consistently overcharged line in the business',
  ...S },

{ id:'R11.2', mod:'11', title:'A weight dispute is raised with the evidence attached',
  when:'billed and packed weight differ beyond tolerance',
  then:'a dispute is raised carrying the packing record',
  never:'absorbing the difference because each one is small',
  ...S },

{ id:'R11.3', mod:'11', title:'An undelivered parcel is chased before it becomes a return',
  when:'a delivery attempt fails',
  then:'the NDR is actioned within the window the courier allows',
  never:'letting it lapse into a return, which costs the freight twice and the sale once',
  ...S },

{ id:'R11.4', mod:'11', title:'COD collected is a receivable until it is remitted',
  when:'a COD parcel is delivered',
  then:'the amount is a receivable from the courier',
  never:'treating delivery as payment, which reports cash the business does not have',
  ...S },

{ id:'R11.5', mod:'11', title:'A remittance is matched parcel by parcel',
  when:'a courier remits COD',
  then:'each parcel in the remittance is matched individually',
  never:'accepting the total, which is how short remittances go unnoticed for months',
  ...S },

{ id:'R11.6', mod:'11', title:'A manifest is a record, not a printout',
  when:'parcels are handed over',
  then:'the handover is recorded against each shipment with the time and the person',
  never:'keeping only a signed sheet, which cannot be queried when a parcel is disputed',
  ...S },

{ id:'R11.7', mod:'11', title:'An RTO parcel is stock again only after inspection',
  when:'a return to origin is received',
  then:'it goes through inspection before it can be sold',
  never:'restocking it automatically on scan',
  ...S },

{ id:'R11.8', mod:'11', title:'Freight cost reaches the order it belongs to',
  when:'a shipment is costed',
  then:'the freight is attributed to the order',
  never:'holding freight only as a monthly expense, which makes per-order and per-channel profit fiction',
  ...S },

{ id:'R11.9', mod:'11', title:'A courier can be changed without losing history',
  when:'a courier is switched off',
  then:'every past shipment, AWB and dispute stays readable',
  never:'making history depend on an integration that is still connected',
  ...S },

{ id:'R11.10', mod:'11', title:'A zone and rate card are dated',
  when:'courier rates change',
  then:'the new card is stored with its effective date',
  never:'overwriting the card, which makes every past shipment look mischarged',
  ...S },

/* ══ 12 · ACCOUNTING & GST ══════════════════════════════════════════════ */

{ id:'R12.1', mod:'12', title:'Money is an integer count of paise',
  when:'any amount is held, added or compared',
  then:'it is an integer number of paise, becoming a decimal string only where a person reads it',
  never:'holding money in a floating-point number, where ₹0.10 + ₹0.20 is not ₹0.30 and a trial balance stops balancing',
  ...E(`${CORE} › the classic float error cannot happen here`) },

{ id:'R12.2', mod:'12', title:'An amount finer than a paisa is refused, not rounded',
  when:'a computation produces a fraction of a paisa',
  then:'it is refused and the caller must round deliberately',
  never:'rounding silently, which is how two sides of the same figure drift apart and nobody can say which is right',
  ...E(`${CORE} › an amount finer than a paisa is refused rather than silently rounded`) },

{ id:'R12.3', mod:'12', title:'A split sums back to the original, exactly',
  when:'an amount is divided — across lines, across companies, across periods',
  then:'the parts add back to the whole, with the round-off returned as its own figure',
  never:'losing or inventing a paisa in the split, and never hiding the remainder inside the largest part',
  ...E(`${CORE} › a split always sums back to the original — no paisa lost or invented`) },

{ id:'R12.4', mod:'12', title:'An unbalanced entry is refused, with the gap named',
  when:'a voucher is posted whose debits and credits differ',
  then:'it is refused and the difference is stated',
  never:'posting it to a suspense account to make it balance, which converts an error into a permanent record',
  ...E(`${CORE} › an unbalanced entry is refused, with the gap named`) },

{ id:'R12.5', mod:'12', title:'A line cannot be a debit and a credit at once',
  when:'a posting line carries both',
  then:'it is refused',
  never:'netting the two into whichever is larger',
  ...E(`${CORE} › a line cannot be a debit and a credit at once`) },

{ id:'R12.6', mod:'12', title:'The trial balance is computed, never stored',
  when:'the trial balance is asked for',
  then:'it is summed from the posting lines at that moment',
  never:'reading a maintained total, which is a number that can be wrong without anything looking wrong',
  ...E(`${CORE} › the trial balance is computed from the lines, never stored`) },

{ id:'R12.7', mod:'12', title:'A locked period refuses a backdated entry',
  when:'a voucher is dated inside a closed period',
  then:'it is refused and the lock that stopped it is named',
  never:'posting it into the current period instead, which silently moves last year’s result into this one',
  ...E(`${CORE} › a locked period refuses a backdated entry`) },

{ id:'R12.8', mod:'12', title:'Unlocking a period is itself recorded',
  when:'a closed period is reopened',
  then:'who reopened it, when and why is written to the trail',
  never:'allowing a quiet reopen, which is the one action that could undo every other guarantee here',
  ...E(`${CORE} › unlocking a period is itself recorded`) },

{ id:'R12.9', mod:'12', title:'A tax rate resolves on the date of the document',
  when:'tax is computed for any invoice',
  then:'the rate in force on that document’s date is used',
  never:'applying today’s rate to an old invoice, which makes correct history look like an error',
  ...E(`${CORE} › a tax rate resolves on a date, so old invoices stay correct`) },

{ id:'R12.10', mod:'12', title:'Two rates covering one date is ambiguous, not a coin toss',
  when:'two effective-dated rows overlap for the same date',
  then:'the resolution is refused and the overlap is named',
  never:'picking the newer one, which makes the answer depend on insertion order',
  ...E(`${CORE} › two rows covering one month is ambiguous, not a coin toss`) },

{ id:'R12.11', mod:'12', title:'A voided entry is reversed, never erased',
  when:'a posted voucher is wrong',
  then:'a reversing entry is posted and both stay visible',
  never:'editing or deleting the original, which is the difference between a correction and a cover-up',
  ...E(`${CORE} › voiding is the only removal, and it is reversible`) },

{ id:'R12.12', mod:'12', title:'Every figure clicks down to the record that produced it',
  when:'any total appears on any screen',
  then:'it is a live query that can be opened down to its vouchers and their documents',
  never:'showing a figure that cannot be traced — an untraceable number is a defect, not a rounding difference',
  ...E(`${CORE} › the trial balance is computed from the lines, never stored`) },

{ id:'R12.13', mod:'12', title:'An invoice number is sequential per company and per series',
  when:'an invoice is raised',
  then:'it takes the next number in that company’s series',
  never:'reusing, skipping or back-filling a number, which is the first thing a tax audit tests',
  ...S },

{ id:'R12.14', mod:'12', title:'A GST return is built from vouchers, not from a summary',
  when:'GSTR-1 or 3B is prepared',
  then:'it is computed from the underlying invoices',
  never:'accepting a typed summary figure, which cannot be reconciled when the portal disagrees',
  ...S },

{ id:'R12.15', mod:'12', title:'ITC is claimed only where the supplier has filed',
  when:'input credit is taken',
  then:'it is matched against the supplier’s filed data and the unmatched part is held',
  never:'claiming everything and reversing later, which turns a reconciliation into a liability',
  ...S },

{ id:'R12.16', mod:'12', title:'A place of supply decides the tax, not the billing address',
  when:'GST is computed',
  then:'the place of supply determines CGST/SGST or IGST',
  never:'defaulting to the billing address, which mis-splits the tax on every drop-ship',
  ...S },

{ id:'R12.17', mod:'12', title:'A credit note references the invoice it reverses',
  when:'a credit note is raised',
  then:'the original invoice is named on it',
  never:'issuing a free-standing credit note, which cannot be matched in either set of books',
  ...S },

{ id:'R12.18', mod:'12', title:'Depreciation is posted, not just calculated',
  when:'a period closes',
  then:'depreciation is posted as an entry like any other',
  never:'showing it as a computed figure on a report while the ledger disagrees',
  ...S },

{ id:'R12.19', mod:'12', title:'A company with no tax registration is still a company',
  when:'a group company has no registration of its own',
  then:'it keeps its own books and joins the group figures',
  never:'dragging it into a return it does not belong in, and never leaving it out of the group result',
  ...S },

{ id:'R12.20', mod:'12', title:'Year-end close locks, and the lock is the record',
  when:'a financial year is closed',
  then:'the period is locked and the closing balances are carried forward as an entry',
  never:'leaving the year open indefinitely so late entries can drift in unnoticed',
  ...E(`${CORE} › a locked period refuses a backdated entry`) },

/* ══ 13 · TREASURY & FINANCIAL PLANNING ═════════════════════════════════ */

{ id:'R13.1', mod:'13', title:'A forecast never posts to the ledger',
  when:'a cash-flow projection is produced',
  then:'it is held as a projection, separate from posted entries',
  never:'writing an expected receipt into the books, which reports money that has not arrived',
  ...S },

{ id:'R13.2', mod:'13', title:'A bank line is matched to a voucher, not to a total',
  when:'a bank statement is reconciled',
  then:'each line is matched to the entry that caused it',
  never:'reconciling on the closing balance alone, which hides two errors that happen to cancel',
  ...S },

{ id:'R13.3', mod:'13', title:'An unmatched bank line stays visible until it is explained',
  when:'a statement line cannot be matched',
  then:'it stays on the unreconciled list with its age',
  never:'writing it off to a sundry account to clear the screen',
  ...S },

{ id:'R13.4', mod:'13', title:'A PDC is a commitment before it is cash',
  when:'a post-dated cheque is received',
  then:'it is tracked as a commitment until it clears',
  never:'recognising it as cash on receipt',
  ...S },

{ id:'R13.5', mod:'13', title:'Budget versus actual compares like with like',
  when:'a variance is shown',
  then:'both sides use the same period, company and account basis',
  never:'comparing a full-year budget against a part-year actual without saying so',
  ...S },

{ id:'R13.6', mod:'13', title:'A cash forecast names its assumptions',
  when:'a projection is produced',
  then:'the collection and payment assumptions behind it are stored with it',
  never:'presenting a projection whose basis cannot be recovered a month later',
  ...S },

{ id:'R13.7', mod:'13', title:'Inter-company funding is recorded on both sides',
  when:'one group company funds another',
  then:'both companies post it, naming each other as counterparty',
  never:'recording it in one set of books only, which leaves the group permanently out of balance',
  ...E(`${CORE} › an entry cannot be its own counterparty`) },

{ id:'R13.8', mod:'13', title:'A currency amount keeps the rate it was converted at',
  when:'a foreign-currency transaction is recorded',
  then:'the original amount, the currency and the rate used are all stored',
  never:'storing only the converted figure, which cannot be revalued or explained afterwards',
  ...S },

/* ══ 14 · SETTLEMENT ════════════════════════════════════════════════════ */

{ id:'R14.1', mod:'14', title:'A payout is matched line by line to orders',
  when:'a marketplace settlement file arrives',
  then:'every line is matched to the order it belongs to',
  never:'accepting the net credited amount, which is how a short payment becomes invisible',
  ...S },

{ id:'R14.2', mod:'14', title:'Every deduction is identified before the payout is accepted',
  when:'commission, shipping, penalty, TCS or TDS is deducted',
  then:'each is posted to its own account',
  never:'posting the deductions as one lump, which makes an overcharge impossible to find',
  ...S },

{ id:'R14.3', mod:'14', title:'A variance beyond tolerance raises a claim',
  when:'the settled amount differs from the expected amount',
  then:'a claim is raised carrying the order, the expectation and the difference',
  never:'absorbing it because it is small — the small ones are the recurring ones',
  ...S },

{ id:'R14.4', mod:'14', title:'A claim has a deadline and the deadline is tracked',
  when:'a claim is raised',
  then:'the channel’s filing window is stored and warned on',
  never:'letting a valid claim expire unfiled',
  ...S },

{ id:'R14.5', mod:'14', title:'An expected settlement exists from the moment of the sale',
  when:'an order is confirmed on a marketplace',
  then:'a settlement expectation is created then',
  never:'waiting for the payout to discover what should have arrived',
  ...S },

{ id:'R14.6', mod:'14', title:'TCS and TDS are receivables, not costs',
  when:'a marketplace deducts tax at source',
  then:'it is posted as a receivable against the tax authority',
  never:'expensing it, which understates profit and loses the credit',
  ...S },

{ id:'R14.7', mod:'14', title:'A settlement is reconciled to the bank, not just to the file',
  when:'a payout is recorded',
  then:'it is matched to the actual bank credit',
  never:'treating the settlement report as proof that the money arrived',
  ...S },

{ id:'R14.8', mod:'14', title:'A re-sent settlement file does not double-post',
  when:'the same settlement file is imported twice',
  then:'already-matched lines are recognised and skipped',
  never:'posting them again, which doubles both revenue and deductions',
  ...S },

{ id:'R14.9', mod:'14', title:'A fee schedule is dated and compared against',
  when:'a commission is deducted',
  then:'it is checked against the agreed rate in force on that date',
  never:'accepting whatever rate the file states, which is the single largest silent leak in marketplace trade',
  ...S },

{ id:'R14.10', mod:'14', title:'A settled order is profitable or unprofitable at the SKU',
  when:'a payout is fully matched',
  then:'the true net per SKU is computed after every deduction',
  never:'judging profitability on the listed price, which ignores the third of it that never arrives',
  ...S },

{ id:'R14.11', mod:'14', title:'A claim that is paid closes against the original variance',
  when:'a channel credits a claim',
  then:'it is matched back to the variance it settles',
  never:'posting the credit as unrelated income, which leaves the variance open forever',
  ...S },

{ id:'R14.12', mod:'14', title:'A settlement figure never overwrites a sale figure',
  when:'the settlement disagrees with the order',
  then:'both are kept and the difference is the variance',
  never:'adjusting the original sale to match the payout, which erases the evidence of the shortfall',
  ...S },

/* ══ 15 · E-COMMERCE / OMS ══════════════════════════════════════════════ */

{ id:'R15.1', mod:'15', title:'Companies and channels are read from the data, never from a list in the code',
  when:'orders or sheets from any number of companies and channels are processed',
  then:'the companies and channels present are discovered and each gets its own columns',
  never:'writing a fixed set of companies or channels into the software, which caps the business at whatever it happened to have on the day the code was written',
  ...E(`${STUDIO} › the companies are found from the sheets, not from a hardcoded list`) },

{ id:'R15.2', mod:'15', title:'A tenth or eleventh channel needs no code change',
  when:'a new marketplace or company is added',
  then:'it is a row, and every figure, column and consolidation follows',
  never:'requiring a release to sell somewhere new',
  ...E(`${CORE} › an eleventh company and an eleventh channel need no code change`) },

{ id:'R15.3', mod:'15', title:'A channel belongs to a company',
  when:'two companies both sell on the same marketplace',
  then:'each has its own channel record, and both may use the same short code',
  never:'sharing one channel across companies, which merges two companies’ sales into one figure',
  ...E(`${CORE} › a channel belongs to a company — two companies may both call one AMZN`) },

{ id:'R15.4', mod:'15', title:'A price is never invented for an item that has none',
  when:'an item has no price on file',
  then:'it is reported as having no price and named in the summary',
  never:'substituting an average or a similar item’s price, which quietly fabricates revenue',
  ...E(`${STUDIO} › the price status matches, and no price was ever invented`) },

{ id:'R15.5', mod:'15', title:'Net is sale minus return, and inventory is net plus wrong return',
  when:'quantities are rolled up',
  then:'net sale is sale minus return, and the inventory figure adds back the wrong returns',
  never:'treating a wrong return as ordinary saleable stock, because it is not the item that was sent out',
  ...E(`${STUDIO} › sale minus return is the net, and net plus wrong return is the inventory`) },

{ id:'R15.6', mod:'15', title:'A blank cell is blank, not a value',
  when:'a column contains only whitespace',
  then:'it is read as empty',
  never:'treating a lone space as a marked entry, which converts formatting into business fact',
  ...E(`${STUDIO} › a lone space in the Wrong Return column is not a wrong return`) },

{ id:'R15.7', mod:'15', title:'An item that only ever came back is still reported',
  when:'an item has returns but no sales in the period',
  then:'it appears with its returns',
  never:'dropping it because it has no sale line, which hides the worst-performing items entirely',
  ...E(`${STUDIO} › an item that only ever came back is still reported`) },

{ id:'R15.8', mod:'15', title:'A totals row is the sum of the rows above it',
  when:'a report shows a total',
  then:'it equals the rows it sits under',
  never:'computing the total by a different route from the detail, which is how a report disagrees with itself',
  ...E(`${STUDIO} › the totals row is the sum of the rows above it`) },

{ id:'R15.9', mod:'15', title:'A marketplace order pull creates a real order',
  when:'orders are fetched from a channel',
  then:'a sales order is created, stock is reserved, and the pick list follows',
  never:'holding channel orders in a staging area that has to be re-entered to become real',
  ...S },

{ id:'R15.10', mod:'15', title:'A cancelled channel order releases its reservation',
  when:'the channel cancels an order',
  then:'the reservation is released and the cancellation recorded',
  never:'leaving stock reserved against an order the channel has already dropped',
  ...S },

{ id:'R15.11', mod:'15', title:'A wrong return is dead stock, not stock',
  when:'a return is inspected and found to be a different or damaged item',
  then:'it is written to dead stock with its cost recognised as a loss',
  never:'restocking it as first quality, which sells a customer the same problem twice',
  ...S },

{ id:'R15.12', mod:'15', title:'A listing rejected by a channel says why',
  when:'a push to a channel fails',
  then:'the rejection and its reason are reported back against the listing',
  never:'reporting a push as successful when part of it failed, which leaves the business believing it is present where it is not',
  ...S },

{ id:'R15.13', mod:'15', title:'A manual data check is a recorded step, not a habit',
  when:'figures are checked by hand before a cycle closes',
  then:'the check, the person and the outcome are recorded',
  never:'relying on someone remembering to look',
  ...S },

{ id:'R15.14', mod:'15', title:'A channel-specific SKU code never becomes the master code',
  when:'a channel uses its own identifier',
  then:'it is stored as a mapping against our SKU',
  never:'adopting the channel’s code as the item code, which breaks the moment a second channel does the same',
  ...S },

{ id:'R15.15', mod:'15', title:'A size recommendation is advice, never a silent substitution',
  when:'a fit suggestion is offered',
  then:'it is shown as a recommendation the customer chooses',
  never:'changing the size on an order on the customer’s behalf',
  ...S },

{ id:'R15.16', mod:'15', title:'An order held past its cut-off is escalated, not queued',
  when:'an order approaches the channel’s dispatch deadline',
  then:'it is raised to the person who can act, naming the deadline',
  never:'letting it age quietly into a penalty',
  ...S },

/* ══ 16 · HR & PAYROLL ══════════════════════════════════════════════════
   Effective dating is the whole subject here. A pay figure that cannot be
   resolved as at a date is a pay figure that cannot be defended. */

{ id:'R16.1', mod:'16', title:'A raise closes the old row, it does not overwrite it',
  when:'a salary or rate changes',
  then:'the row in force is closed on the day before, and a new row opens',
  never:'editing the existing figure, which rewrites what the person was actually paid last year',
  ...E(`${CORE} › a raise closes the open row instead of overwriting it`) },

{ id:'R16.2', mod:'16', title:'History resolves to what was actually in force',
  when:'a past month is recomputed',
  then:'the rate in force in that month is used',
  never:'recomputing an old payslip at today’s rate',
  ...E(`${CORE} › history still resolves to what was actually in force`) },

{ id:'R16.3', mod:'16', title:'A future-dated raise activates by itself',
  when:'a raise is entered with a future date',
  then:'it takes effect when that month arrives, with nobody remembering to apply it',
  never:'requiring a manual step, which is how an agreed raise is missed',
  ...E(`${CORE} › a future-dated raise activates by itself when that month arrives`) },

{ id:'R16.4', mod:'16', title:'A month with nothing in force raises, and never returns zero',
  when:'no rate covers the month being computed',
  then:'the computation is refused and the gap is named',
  never:'returning zero, which pays a real person nothing and looks like a valid answer',
  ...E(`${CORE} › a nothing-in-force month raises, and never returns zero`) },

{ id:'R16.5', mod:'16', title:'Backdating over an open row is refused',
  when:'a change is entered with a date inside a period already settled',
  then:'it is refused',
  never:'silently rewriting history that has already been paid and posted',
  ...E(`${CORE} › backdating over an open row is refused — that would rewrite history`) },

{ id:'R16.6', mod:'16', title:'A person can leave and come back',
  when:'someone rejoins after a break',
  then:'the spell log holds both periods and the gap between them',
  never:'creating a second employee record, which splits their history and their service',
  ...E(`${CORE} › a spell log lets a person leave and come back`) },

{ id:'R16.7', mod:'16', title:'Month spans handle February and the year end',
  when:'a period is computed across month or year boundaries',
  then:'the real calendar is used',
  never:'assuming thirty-day months, which is wrong twelve times a year and badly wrong in February',
  ...E(`${CORE} › month spans handle February and the year end`) },

{ id:'R16.8', mod:'16', title:'Staff and piece-rate workers sit in one register',
  when:'payroll is prepared',
  then:'monthly staff and piece-rate karigars are computed in the same run and paid from the same register',
  never:'running two payrolls that have to be added together by hand',
  ...S },

{ id:'R16.9', mod:'16', title:'An advance is recovered against a named advance',
  when:'a deduction is made at payout',
  then:'it names the advance it is recovering and reduces that balance',
  never:'deducting an amount that cannot be traced to a specific advance',
  ...S },

{ id:'R16.10', mod:'16', title:'Attendance drives pay, and both are visible together',
  when:'a payout is computed',
  then:'the attendance it was computed from is shown beside it',
  never:'presenting a pay figure whose basis the person being paid cannot see',
  ...S },

{ id:'R16.11', mod:'16', title:'Identity documents are read, never stored in a file that leaves',
  when:'Aadhaar, PAN, bank or UPI detail is used for a computation',
  then:'it is used and not serialised into any exported or committed artifact',
  never:'writing personal identifiers into a report, a backup file or a repository',
  ...S },

{ id:'R16.12', mod:'16', title:'A payout that fails to post does not mark as paid',
  when:'the bank transfer or the ledger posting fails',
  then:'the payout stays unpaid and the failure is raised',
  never:'marking it paid on submission, which loses a real person’s wages in the gap',
  ...S },

/* ══ 17 · MARKETING ═════════════════════════════════════════════════════ */

{ id:'R17.1', mod:'17', title:'A campaign is measured on revenue, not on opens',
  when:'campaign performance is reported',
  then:'it is attributed to actual orders',
  never:'reporting opens and clicks as the result, which measures the message rather than the business',
  ...S },

{ id:'R17.2', mod:'17', title:'A repricing rule shows what it did',
  when:'a rule changes a price',
  then:'the change, the rule that made it and the effect on orders are recorded together',
  never:'changing prices with no record, which makes a bad rule impossible to identify or reverse',
  ...S },

{ id:'R17.3', mod:'17', title:'A price floor is a floor',
  when:'a repricing rule would go below the floor set for a SKU',
  then:'it stops at the floor',
  never:'undercutting to match a competitor below cost',
  ...S },

{ id:'R17.4', mod:'17', title:'A markdown starts before the stock is dead, not after',
  when:'stock reaches the age set for it',
  then:'the markdown schedule begins',
  never:'waiting until it is unsellable, which converts a lower-margin sale into a write-off',
  ...S },

{ id:'R17.5', mod:'17', title:'A campaign cannot message someone who has not consented',
  when:'a marketing send is prepared',
  then:'the recipient list is filtered by consent at send time',
  never:'sending to a list captured before the consent was checked',
  ...S },

{ id:'R17.6', mod:'17', title:'A published page reads live catalogue data',
  when:'a page shows a price or a stock state',
  then:'it reads the same record the order screen reads',
  never:'pasting a figure into the page, which goes stale the first time the price changes',
  ...S },

{ id:'R17.7', mod:'17', title:'An exhibition is a channel',
  when:'leads and sales come from a trade show',
  then:'they land in CRM and the order book against that channel',
  never:'collecting them on paper to be entered later, which is where they are lost',
  ...S },

{ id:'R17.8', mod:'17', title:'A marketing automation cannot move money',
  when:'a campaign rule fires',
  then:'it may message, tag, schedule or reprice within its limits',
  never:'issuing a refund, a credit note or a payment — that is not what this engine is allowed to do',
  ...S },

{ id:'R17.9', mod:'17', title:'A scheduled post that fails is reported as failed',
  when:'a scheduled publication does not go out',
  then:'it is raised with the reason',
  never:'showing it as published in the calendar while nothing was posted',
  ...S },

/* ══ 18 · AI CONTENT ENGINE ═════════════════════════════════════════════ */

{ id:'R18.1', mod:'18', title:'Content is written from the catalogue, not about the category',
  when:'a listing or description is generated',
  then:'it is generated from that product’s own attributes',
  never:'writing plausible copy about the kind of thing it is, which is how a listing describes features the product does not have',
  ...S },

{ id:'R18.2', mod:'18', title:'Structured fields get keywords; anything a human reads gets feeling',
  when:'text is produced for a back-end field versus a caption',
  then:'each is written for its own reader',
  never:'writing both the same way, which is the clearest signal of machine-written content',
  ...S },

{ id:'R18.3', mod:'18', title:'Product nouns are banned from creative surfaces',
  when:'a caption or a hook is written',
  then:'the product noun is excluded',
  never:'letting search vocabulary bleed into copy meant to be felt',
  ...S },

{ id:'R18.4', mod:'18', title:'The engine criticises its own draft before anyone sees it',
  when:'a draft is produced',
  then:'it is put through the self-critique pass and the second draft is what is shown',
  never:'showing the first attempt, which is rarely the best one',
  ...S },

{ id:'R18.5', mod:'18', title:'A render is seeked, never recorded',
  when:'a video is produced from a page',
  then:'the clock is driven by hand and each frame is captured at its exact instant',
  never:'playing the animation and recording the screen, which bakes whatever else the machine was doing into the customer’s reel',
  ...E(`${MOTION} › a second render produces frame-for-frame identical images`) },

{ id:'R18.6', mod:'18', title:'The same scene renders to the same file',
  when:'a render is repeated',
  then:'the output is identical to the byte',
  never:'producing a different file each time, which makes the output impossible to check or approve',
  ...E(`${MOTION} › and a byte-identical MP4`) },

{ id:'R18.7', mod:'18', title:'A generated asset is labelled as generated',
  when:'an image or video is produced by a model',
  then:'it carries that fact in the asset record',
  never:'letting a generated image become indistinguishable from a photograph of the actual product',
  ...S },

{ id:'R18.8', mod:'18', title:'Generation stays badged a mockup until a real provider is wired',
  when:'a capability is demonstrated without a live provider behind it',
  then:'it is labelled a mockup wherever it appears',
  never:'showing a simulated render as a finished one',
  ...S },

{ id:'R18.9', mod:'18', title:'Image generation states that it needs a graphics card',
  when:'the image generation slot is opened with no provider attached',
  then:'it says so plainly and produces nothing',
  never:'presenting a finished-looking screen that cannot generate anything',
  ...S },

{ id:'R18.10', mod:'18', title:'A cloned voice needs the consent of the person it came from',
  when:'a voice is cloned for narration',
  then:'that person’s recorded consent is on file against them',
  never:'cloning from a recording merely because it was available',
  ...S },

{ id:'R18.11', mod:'18', title:'A publish reports what actually went live',
  when:'content is pushed to several destinations',
  then:'each result comes back individually, with reasons for rejections',
  never:'reporting one overall success, which leaves the business absent where it believes it is present',
  ...S },

/* ══ 19 · SEO, AEO & AIO ════════════════════════════════════════════════ */

{ id:'R19.1', mod:'19', title:'Structured data describes what is actually on the page',
  when:'schema markup is generated',
  then:'it is generated from the same record the page renders',
  never:'marking up a price or availability that differs from the page, which is penalised and deserved',
  ...S },

{ id:'R19.2', mod:'19', title:'A ranking figure names where it was measured',
  when:'a position or citation is reported',
  then:'the engine, the query and the date are stored with it',
  never:'reporting a bare position, which cannot be compared with anything',
  ...S },

{ id:'R19.3', mod:'19', title:'An answer-shaped page still says the same thing as the product record',
  when:'content is shaped to be quoted by an answer box',
  then:'the claims match the catalogue',
  never:'writing a more quotable claim than the product supports',
  ...S },

{ id:'R19.4', mod:'19', title:'A technical fix is verified on the live page',
  when:'a technical SEO issue is marked resolved',
  then:'the live page is re-fetched and re-checked',
  never:'closing it because the change was deployed',
  ...S },

{ id:'R19.5', mod:'19', title:'AI-engine visibility is tracked over time, not sampled once',
  when:'citation in an AI answer is measured',
  then:'it is measured repeatedly and stored as a series',
  never:'quoting a single lucky result as the position',
  ...S },

{ id:'R19.6', mod:'19', title:'A sitemap lists only pages that exist and are meant to be found',
  when:'a sitemap is generated',
  then:'it contains live, indexable pages',
  never:'listing archived or blocked pages, which wastes the crawl on nothing',
  ...S },

/* ══ 20 · PROJECTS & COLLABORATION ══════════════════════════════════════ */

{ id:'R20.1', mod:'20', title:'Billable time becomes an invoice line without retyping',
  when:'approved time exists against a project',
  then:'the rate card turns it into an invoice line and a real cost',
  never:'re-entering hours into an invoice, which is where the two figures start to differ',
  ...S },

{ id:'R20.2', mod:'20', title:'Billable and non-billable are separated at entry',
  when:'time is recorded',
  then:'it is marked billable or not as it is entered',
  never:'deciding at invoice time, which quietly turns unbillable work into a charge',
  ...S },

{ id:'R20.3', mod:'20', title:'An approval shows the rule that demanded it',
  when:'anything lands in the approvals queue',
  then:'the rule that sent it there is displayed beside it',
  never:'presenting a request with no stated reason, which makes approval a formality',
  ...S },

{ id:'R20.4', mod:'20', title:'An approval decision goes to the audit trail',
  when:'a request is approved or refused',
  then:'the decision, the person and the time are recorded',
  never:'recording only the outcome on the record, which loses who accepted the risk',
  ...E(`${CORE} › an update records what it was as well as what it became`) },

{ id:'R20.5', mod:'20', title:'An automation run is kept step by step',
  when:'a rule fires',
  then:'what triggered it, each step, and what each step returned are stored',
  never:'keeping only the outcome — an automation nobody can inspect afterwards is a rule the business cannot trust with its money',
  ...S },

{ id:'R20.6', mod:'20', title:'An automation acts within a named scope',
  when:'a rule is built',
  then:'the records it may read and write are declared on it',
  never:'letting a rule reach anywhere in the system because it happens to run as an administrator',
  ...S },

{ id:'R20.7', mod:'20', title:'A project cost includes the time and the material',
  when:'project profitability is computed',
  then:'labour, material and expenses booked to it are all included',
  never:'reporting on revenue and time alone, which shows a loss-making project as profitable',
  ...S },

{ id:'R20.8', mod:'20', title:'A decision is recorded where the decision was made',
  when:'a discussion resolves something',
  then:'it is attached to the record it concerns',
  never:'leaving the reasoning in a chat thread that will not be found in a year',
  ...S },

{ id:'R20.9', mod:'20', title:'A procedure is scoped to the role it applies to',
  when:'a standard procedure is published',
  then:'it is scoped to the role that performs it',
  never:'publishing one undifferentiated manual that nobody reads',
  ...S },

/* ══ 21 · DASHBOARD & BI ════════════════════════════════════════════════ */

{ id:'R21.1', mod:'21', title:'The group figure is the sum minus inter-company trade',
  when:'several companies are consolidated',
  then:'entries naming a counterparty inside the group are eliminated, and gross, eliminated and group are all shown',
  never:'presenting the plain sum as the group result, which inflates turnover by trade the group never did with the outside world',
  ...E(`${CORE} › the group is the sum MINUS what the companies sold each other`) },

{ id:'R21.2', mod:'21', title:'An entry cannot be its own counterparty',
  when:'an entry names a counterparty company',
  then:'it is refused if that is the same company',
  never:'allowing a company to trade with itself, which eliminates a figure that was never doubled',
  ...E(`${CORE} › an entry cannot be its own counterparty`) },

{ id:'R21.3', mod:'21', title:'The number of companies is data, not a constant',
  when:'the group grows',
  then:'a company is a row and every consolidation follows',
  never:'building around a fixed number of companies or channels',
  ...E(`${CORE} › ten companies and ten channels each is a hundred channels, not a limit`) },

{ id:'R21.4', mod:'21', title:'Every dashboard figure is a live query',
  when:'a KPI is displayed',
  then:'it is computed from the ledger and the stock table at that moment',
  never:'reading a maintained summary table, which can be wrong without looking wrong',
  ...E(`${CORE} › the trial balance is computed from the lines, never stored`) },

{ id:'R21.5', mod:'21', title:'A consolidated row is a formula over the company rows',
  when:'a workbook or report shows a consolidated figure',
  then:'it is computed from the company rows beside it',
  never:'typing a separate consolidated total, which is a second copy that will disagree',
  ...E(`${STUDIO} › the totals row is the sum of the rows above it`) },

{ id:'R21.6', mod:'21', title:'A figure a user may not see is not returned',
  when:'a report runs for a scoped user',
  then:'out-of-scope rows are excluded from the query',
  never:'computing the full figure and hiding part of it in the display',
  ...E(`${CORE} › one company cannot read another company`) },

{ id:'R21.7', mod:'21', title:'An exported report says when it was taken',
  when:'a report is exported',
  then:'the as-at time and the filters are printed on it',
  never:'producing an undated export, which is quoted months later as though it were current',
  ...S },

{ id:'R21.8', mod:'21', title:'A saved report keeps its definition, not its results',
  when:'a report is saved and re-run',
  then:'the definition re-runs against current data',
  never:'storing a snapshot and presenting it as live',
  ...S },

{ id:'R21.9', mod:'21', title:'A figure with no drill-down is a defect',
  when:'any total is shown',
  then:'it opens to the records beneath it',
  never:'shipping a number that cannot be explained by clicking it',
  ...S },

/* ══ 22 · AI ASSISTANT, AGENTS & AUTOMATION ═════════════════════════════
   The rules here are mostly about refusal. Everything else in this system
   gets its integrity from arithmetic; this module gets it from knowing what
   it is not allowed to do. */

{ id:'R22.1', mod:'22', title:'An answer carries the records it came from',
  when:'the assistant answers a question about a figure',
  then:'the rows it used are attached and each one opens to its record',
  never:'giving a bare number, which cannot be checked and therefore cannot be trusted',
  ...S },

{ id:'R22.2', mod:'22', title:'An unknown answer is said, never estimated',
  when:'the assistant cannot find the figure',
  then:'it says so and shows what it looked at',
  never:'producing a plausible number — a confident wrong figure costs far more than an honest blank',
  ...S },

{ id:'R22.3', mod:'22', title:'The assistant answers only from what the asker may already see',
  when:'a question is asked by a scoped user',
  then:'retrieval is filtered to that user’s permissions before the answer is composed',
  never:'letting the assistant become a way around permissions that every other screen enforces',
  ...S },

{ id:'R22.4', mod:'22', title:'An agent cannot widen its own scope',
  when:'an agent runs',
  then:'it works within the records and the spend it was given',
  never:'expanding its scope mid-run, however sensible the next step would be',
  ...S },

{ id:'R22.5', mod:'22', title:'Money never moves without a human yes',
  when:'an agent proposes a refund, a payment, a payout or a credit note',
  then:'it stops and waits for a person',
  never:'executing it, no matter how confident or how small the amount',
  ...S },

{ id:'R22.6', mod:'22', title:'A customer is never messaged by an agent without approval',
  when:'an agent drafts a message to a real customer',
  then:'a person approves it before it is sent',
  never:'sending on the agent’s own judgement',
  ...S },

{ id:'R22.7', mod:'22', title:'A price is never changed by an agent alone',
  when:'an agent proposes a price change',
  then:'it enters the approvals queue with the reasoning attached',
  never:'writing the new price directly',
  ...S },

{ id:'R22.8', mod:'22', title:'Every agent run is replayable step by step',
  when:'an agent finishes, stops or fails',
  then:'what started it, what it read, what it proposed and what was approved are all recorded',
  never:'keeping only the outcome — an unexplained change made by software is worse than one made by a person',
  ...S },

{ id:'R22.9', mod:'22', title:'Agent spending goes through the same ceiling as everything else',
  when:'an agent calls a paid provider',
  then:'it is routed through the Provider Router and refused past the ceiling',
  never:'giving an agent its own unmetered budget',
  ...E(`${ROUTER} › the third call would break the ceiling and is refused`) },

{ id:'R22.10', mod:'22', title:'The chatbot hands over rather than guessing about money',
  when:'a customer asks about a refund, a charge or a complaint',
  then:'it hands to a person with the whole conversation attached',
  never:'answering from a general idea of the policy',
  ...S },

{ id:'R22.11', mod:'22', title:'The chatbot never asks a customer for a credential',
  when:'a customer is identified in a chat',
  then:'identity is established through the order and the contact already on file',
  never:'asking for a card number, a bank detail or a password — the promise made everywhere else does not get a chatbot-shaped exception',
  ...S },

{ id:'R22.12', mod:'22', title:'A handover lands in the existing queue',
  when:'a conversation is passed to a person',
  then:'it enters the Module 04 Helpdesk queue with its history',
  never:'creating a second inbox that someone has to remember to watch',
  ...S },

{ id:'R22.13', mod:'22', title:'An agent is not a hidden actor in the audit trail',
  when:'an agent changes anything',
  then:'the change is attributed to the agent, its run, and the person who approved it',
  never:'recording it under a service account, which makes an automated change indistinguishable from a human one',
  ...E(`${CORE} › an audited insert leaves a before/after trail`) },

{ id:'R22.14', mod:'22', title:'A retrieved document does not become an instruction',
  when:'the assistant reads a document, a review or a message while answering',
  then:'that content is treated as data to report on',
  never:'following instructions found inside retrieved content, which is how a supplier’s PDF ends up steering the system',
  ...S },

/* ═══════════════════════════════════════════════════════════════════════════
   THE FORMULAS
   Everything above states a behaviour. What follows states an ARITHMETIC —
   drawn from the master spec’s own business-rule index and from the logic
   already locked in the working tools. These are the rules a wrong answer
   shows up in as a wrong payment or a wrong tax figure, which is why they are
   written as formulas rather than as descriptions: a formula can be checked.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── 01 · platform ─────────────────────────────────────────────────────── */

{ id:'R01.16', mod:'01', title:'A scoped key is revocable without touching the login',
  when:'an outside service is connected',
  then:'a key limited to what that capability needs is stored, and the connection records which capability it serves',
  never:'storing a credential that can do more than the capability requires, because the day it leaks is the day that difference matters',
  ...S },

{ id:'R01.17', mod:'01', title:'A webhook is verified, idempotent and never silently dropped',
  when:'a payment, courier, storefront or messaging provider calls in',
  then:'the signature is checked, the external id makes a repeat delivery a no-op, and a failure is logged with its payload for retry',
  never:'trusting an unsigned call, and never processing the same external id twice — a duplicated payout or a duplicated order is indistinguishable from a real one afterwards',
  ...S },

/* ── 05 · sales ────────────────────────────────────────────────────────── */

{ id:'R05.14', mod:'05', title:'A quote or proforma number carries its type and financial year',
  when:'a quotation or proforma is raised',
  then:'it is numbered Q-{FY}-#### or PI-{FY}-####, sequential within that company and year',
  never:'sharing one sequence between quotations and proformas, which makes a proforma indistinguishable from a quote in the register',
  ...S },

{ id:'R05.15', mod:'05', title:'A quote line with no description, no quantity or a negative rate is not a line',
  when:'a quotation is totalled',
  then:'only lines with a description, a quantity above zero and a rate of zero or more are counted',
  never:'letting a half-filled row contribute a number to the total',
  ...S },

{ id:'R05.16', mod:'05', title:'An export line carries no GST',
  when:'a quotation or invoice is marked export under LUT',
  then:'the GST percentage is zero and the document says why',
  never:'applying the domestic rate and correcting it after the buyer queries the total',
  ...S },

{ id:'R05.17', mod:'05', title:'A made-to-measure order has two money legs, and both are visible',
  when:'a customisation order is accepted',
  then:'the advance and the balance are recorded as separate amounts with their own dates, and the balance stays owed until dispatch',
  never:'showing one payment at the end, which hides money already taken and work already owed',
  ...S },

{ id:'R05.18', mod:'05', title:'A customisation quote keeps every round of the negotiation',
  when:'a price is revised during a bespoke enquiry',
  then:'each quoted figure is kept in order with what changed',
  never:'overwriting the earlier figure, which is the one the customer remembers agreeing to',
  ...S },

/* ── 07 · purchase ─────────────────────────────────────────────────────── */

{ id:'R07.11', mod:'07', title:'The three-way match is arithmetic, not a judgement',
  when:'a vendor invoice is checked',
  then:'the payable equals the received quantity × the purchase-order rate, and the purchase order, the goods receipt and the invoice must all agree on quantity and value',
  never:'passing an invoice whose value exceeds received quantity × agreed rate, and never letting an override happen without recording who made it and why',
  ...S },

{ id:'R07.12', mod:'07', title:'A material is sourced down a ranked list, not from whoever answers',
  when:'a material has to be bought',
  then:'the vendors ranked for that material are approached in their priority order',
  never:'defaulting to the last vendor used, which is how a price rise becomes permanent without anyone deciding',
  ...S },

/* ── 08 · manufacturing ────────────────────────────────────────────────── */

{ id:'R08.16', mod:'08', title:'Material consumed is the average per piece times the pieces made',
  when:'consumption is costed against a production run',
  then:'consumption equals the average consumption per piece × pieces produced, and the difference against the bill of materials is recorded as wastage',
  never:'back-fitting the average to whatever was issued, which makes wastage mathematically impossible to see',
  ...S },

{ id:'R08.17', mod:'08', title:'A set type comes from the rate master, and an inferred one says so',
  when:'a design is classified into a set type',
  then:'the rate master’s Set column decides it; when the design is absent, the type is inferred from which garment columns actually carry pieces and the design is flagged as inferred',
  never:'presenting an inferred classification as though it came from the master',
  ...E(`${STUDIO} › the two-row heading is read, so three Dupatta columns stay three garments`) },

{ id:'R08.18', mod:'08', title:'An alteration caused by the karigar’s own mistake is unpaid',
  when:'a piece is reworked because of an error by the person who made it',
  then:'the alteration hours are recorded and paid at zero',
  never:'paying for the rework at the standard alteration rate, and never leaving the hours unrecorded — the time still happened and the design still bore the cost',
  ...S },

{ id:'R08.19', mod:'08', title:'Alteration time is paid at the alteration rate, not the piece rate',
  when:'admin-assigned alteration hours are settled',
  then:'they are paid at the hourly alteration rate in force and added to that karigar’s payout',
  never:'folding alteration hours into the piece count, which corrupts both the production figure and the earnings figure at once',
  ...S },

{ id:'R08.20', mod:'08', title:'A contract worker paid by the hour has no attendance row',
  when:'a contract role is settled',
  then:'payment is hours worked × the agreed hourly rate, recorded against the person without an attendance record',
  never:'forcing a contract worker through the salaried attendance model, which produces a monthly figure nobody agreed to',
  ...S },

/* ── 11 · logistics ────────────────────────────────────────────────────── */

{ id:'R11.11', mod:'11', title:'A partial-COD order has two collections and both are tracked',
  when:'an order is placed with an advance online and the balance on delivery',
  then:'the advance is a receipt now and the balance is a receivable from the courier until it is remitted',
  never:'treating the advance as the whole payment, which makes every such order look settled while most of the money is still outstanding',
  ...S },

/* ── 12 · accounting & GST ─────────────────────────────────────────────── */

{ id:'R12.21', mod:'12', title:'Every voucher type posts through one engine',
  when:'a sale, purchase, credit note, debit note, payment, receipt, journal, contra or counter sale is recorded',
  then:'all nine post through the same ledger routine',
  never:'giving a voucher type its own posting logic — this is where home-built accounting breaks and the modules stop agreeing about the same figure',
  ...E(`${CORE} › a balanced entry posts`) },

{ id:'R12.22', mod:'12', title:'Net GST is input against output, per period, per company',
  when:'the GST position for a period is computed',
  then:'it is output tax less eligible input credit for that company and that period',
  never:'netting across companies, which offsets one registration’s liability with another’s credit and is not a return anyone may file',
  ...S },

{ id:'R12.23', mod:'12', title:'Money never becomes a float, in any layer',
  when:'an amount is stored, moved between the engine and the database, or exported',
  then:'it stays an integer count of paise end to end, converted for display only',
  never:'a real, double, float or an unlabelled decimal column anywhere a money value lives',
  ...E(`${SCHEMA} › no money column is a float, in either schema`) },

{ id:'R12.24', mod:'12', title:'A money column says what unit it is in',
  when:'a column holds an amount',
  then:'its name ends in paise',
  never:'a column called total, amount or cost with no unit — the same name read as rupees by one developer and paise by the next is a factor of a hundred in the books',
  ...E(`${SCHEMA} › no column is named amount/price/cost without saying what unit it is in`) },

/* ── 14 · settlement ───────────────────────────────────────────────────── */

{ id:'R14.13', mod:'14', title:'The realisation on a marketplace sale is the price minus every deduction',
  when:'what a channel sale actually earned is computed',
  then:'it is the selling price less shipping, commission, fixed fee, GST on those fees, TCS and TDS — each taken from the settlement file',
  never:'judging a sale on its listed price, which ignores the part of it that never arrives, and never applying an assumed commission percentage when the file states the real one',
  ...S },

/* ── 15 · e-commerce / OMS ─────────────────────────────────────────────── */

{ id:'R15.17', mod:'15', title:'Closing stock is opening plus in minus out',
  when:'a stock position is computed for a period',
  then:'closing = opening + receipts − issues, from the movements themselves',
  never:'carrying a maintained closing figure that can drift from the movements that produced it',
  ...E(`${CORE} › a receipt then an issue leaves the right number`) },

{ id:'R15.18', mod:'15', title:'Courier return, customer return and wrong return cost three different things',
  when:'a return is processed',
  then:'a courier return costs repacking only, a customer return costs alteration plus iron plus packing at the rate set for that design, and a wrong return is written off at the full selling price',
  never:'applying one blended return cost to all three, which hides the expensive kind inside the cheap kind',
  ...S },

{ id:'R15.19', mod:'15', title:'A wrong return is never added back to stock',
  when:'a return is found to be a different item from the one sent',
  then:'it becomes dead stock and the selling price is recognised as a loss',
  never:'restocking it, at any value, however sellable it looks',
  ...E(`${STUDIO} › sale minus return is the net, and net plus wrong return is the inventory`) },

/* ── 16 · HR & payroll ─────────────────────────────────────────────────── */

{ id:'R16.13', mod:'16', title:'The daily rate is the monthly salary divided by twenty-seven',
  when:'a day of attendance is priced',
  then:'the daily rate is that month’s salary ÷ 27, using the salary in force in that month',
  never:'using calendar days, working days, or a rate carried over from a month with a different salary',
  ...S },

{ id:'R16.14', mod:'16', title:'Attendance codes have fixed multipliers and a blank is absent',
  when:'earned pay is computed from attendance',
  then:'present, holiday, on-duty and paid leave count 1, a half day counts 0.5, absent and unpaid leave count 0, and an empty cell counts as absent',
  never:'treating a blank as present, or as unknown to be filled in later — a blank that pays is a blank that will be left blank',
  ...S },

{ id:'R16.15', mod:'16', title:'Threshold hours do not move when salary moves',
  when:'a raise takes effect',
  then:'the monthly hour threshold for that role stays as it was',
  never:'scaling the threshold with the salary, which silently changes what the person is expected to work in exchange for a raise',
  ...S },

{ id:'R16.16', mod:'16', title:'Productivity cost is that month’s salary over the threshold, times hours worked',
  when:'the cost of a person’s time is charged to work',
  then:'it is (salary in force that month ÷ threshold hours) × the hours actually active',
  never:'using a single annual figure, which misprices every month on either side of a raise',
  ...S },

{ id:'R16.17', mod:'16', title:'A holiday is paid and produces no hours',
  when:'a holiday is marked',
  then:'it pays a full day and contributes zero productive hours',
  never:'counting holiday hours as production, which flatters every efficiency figure that reads them',
  ...S },

{ id:'R16.18', mod:'16', title:'A half day is half the hours, from the same start',
  when:'a half day is marked',
  then:'it starts at the normal in-time and its hours are half the full shift for that person’s pattern',
  never:'assuming a fixed midday finish for everyone, when the male and female shift lengths differ',
  ...S },

{ id:'R16.19', mod:'16', title:'The festival flag drives leave and nothing else',
  when:'a religion is recorded against a person',
  then:'it is used only to match a festival-leave request',
  never:'using it as a filter, a grouping or a report dimension anywhere else in the system',
  ...S },

{ id:'R16.20', mod:'16', title:'A geofence failure flags, it does not refuse',
  when:'attendance is marked outside the radius set for the unit, or outside the grace window',
  then:'it is recorded with the flag and raised to the manager',
  never:'refusing the mark — a system that locks someone out of being paid for standing at the wrong gate has failed at its actual job',
  ...S },

{ id:'R16.22', mod:'16', title:'A shared document carries the pay rules, never the pay roster',
  when:'a plan, a specification or any document that leaves this building is generated',
  then:'it carries the formulas, thresholds and effective-dating that decide pay, and refers to the roster rather than reproducing it',
  never:'printing an individual’s name beside their salary, or their religion at all, into a document that is committed to a repository and travels with every copy — the software needs those fields, a reader of the plan does not',
  ...S },

{ id:'R16.21', mod:'16', title:'An override is allowed and is always recorded',
  when:'an administrator corrects attendance, a geofence flag or a payroll figure',
  then:'the change, the person and the reason go to the audit trail',
  never:'an override that leaves no trace, which is indistinguishable from the system having been wrong',
  ...E(`${CORE} › an update records what it was as well as what it became`) },

/* ── 17 · marketing ────────────────────────────────────────────────────── */

{ id:'R17.10', mod:'17', title:'Return on ad spend is measured against real orders',
  when:'campaign performance is computed',
  then:'it is revenue from attributed orders ÷ spend actually incurred',
  never:'using a platform’s own reported conversions as the revenue figure, which counts orders this system has no record of',
  ...S },

/* ── 22 · the AI layer ─────────────────────────────────────────────────── */

{ id:'R22.15', mod:'22', title:'An assistant answer is reproducible from the records it cites',
  when:'the assistant states a figure',
  then:'re-running the same query over the same records gives the same figure',
  never:'an answer that cannot be reproduced, which is a guess with citations attached',
  ...S },

];
