/* Medhava — POS (Module 03 · App 4)
   Counter billing on the SAME stock number the website reads. Build a cart, take split
   payment, print, and close the day with a till count that must reconcile.
   CONFIG supplies names so the Medhava and Vastrangam builds run the SAME math. */
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
var CFG=(typeof CONFIG!=='undefined')?CONFIG:{};
function db(){return K.DB;}
var TODAY='2026-07-31';
function plural(n,one,many){return n+' '+(n===1?one:(many||one+'s'));}

var TENDERS=[{k:'cash',l:'Cash',till:true},{k:'upi',l:'UPI',till:false},
             {k:'card',l:'Card',till:false},{k:'credit',l:'On account',till:false}];
function tender(k){return TENDERS.filter(function(t){return t.k===k;})[0]||TENDERS[0];}
var GST_PCT=5;

function item(sku){return (CFG.items||[]).filter(function(x){return x.sku===sku;})[0]||null;}
function stockOf(DB,sku){var s=(DB.stock||{})[sku];return s===undefined?0:num(s);}

/* ── the cart being built at the counter ── */
function cart(DB){return DB.cart||[];}
function lineGross(l){return r2(num(l.qty)*num(l.rate));}
function cartGross(DB){return r2(cart(DB).reduce(function(s,l){return s+lineGross(l);},0));}
function cartDisc(DB){var p=num(DB.disc);return r2(cartGross(DB)*Math.max(0,Math.min(50,p))/100);}
function cartTaxable(DB){return r2(cartGross(DB)-cartDisc(DB));}
function cartTax(DB){return r2(cartTaxable(DB)*GST_PCT/100);}
function cartTotal(DB){return r2(cartTaxable(DB)+cartTax(DB));}
function cartUnits(DB){return cart(DB).reduce(function(s,l){return s+num(l.qty);},0);}
function tendered(DB){return r2(TENDERS.reduce(function(s,t){return s+num((DB.tender||{})[t.k]);},0));}
function stillDue(DB){return r2(Math.max(0,cartTotal(DB)-tendered(DB)));}
function changeDue(DB){return r2(Math.max(0,tendered(DB)-cartTotal(DB)));}

/* ── bills already rung up today ── */
function bills(DB){return DB.bills||[];}
function billGross(b){return r2((b.lines||[]).reduce(function(s,l){return s+lineGross(l);},0));}
function billDisc(b){return r2(billGross(b)*num(b.disc)/100);}
function billTaxable(b){return r2(billGross(b)-billDisc(b));}
function billTax(b){return r2(billTaxable(b)*GST_PCT/100);}
function billTotal(b){return r2(billTaxable(b)+billTax(b));}
function billUnits(b){return (b.lines||[]).reduce(function(s,l){return s+num(l.qty);},0);}
function takings(DB){return r2(bills(DB).reduce(function(s,b){return s+billTotal(b);},0));}
function taxCollected(DB){return r2(bills(DB).reduce(function(s,b){return s+billTax(b);},0));}
function discGiven(DB){return r2(bills(DB).reduce(function(s,b){return s+billDisc(b);},0));}
function unitsSold(DB){return bills(DB).reduce(function(s,b){return s+billUnits(b);},0);}
function avgBill(DB){var n=bills(DB).length;return n?r2(takings(DB)/n):0;}
function byTender(DB){return TENDERS.map(function(t){
  var v=r2(bills(DB).reduce(function(s,b){return s+num((b.tender||{})[t.k]);},0));
  return {tender:t.l,key:t.k,till:t.till,value:v,
          n:bills(DB).filter(function(b){return num((b.tender||{})[t.k])>0;}).length};});}
function expectedCash(DB){return r2(num(CFG.opening)+byTender(DB).filter(function(t){return t.till;})
  .reduce(function(s,t){return s+t.value;},0));}
function counted(DB){return num(DB.counted);}
function overShort(DB){return DB.closed?r2(counted(DB)-expectedCash(DB)):0;}

function lowStock(DB){return (CFG.items||[]).filter(function(it){return stockOf(DB,it.sku)<=num(it.rop);});}
function issues(DB){var out=[];
  lowStock(DB).forEach(function(it){out.push({sev:'high',
    what:it.name+' is down to '+stockOf(DB,it.sku)+' on the counter — reorder point is '+it.rop,go:'stock'});});
  if(DB.closed&&overShort(DB)!==0)out.push({sev:'high',
    what:'The till was '+(overShort(DB)>0?'over':'short')+' by '+money(Math.abs(overShort(DB)))+' at close — find out why today',go:'close'});
  bills(DB).filter(function(b){return num((b.tender||{}).credit)>0;}).forEach(function(b){
    out.push({sev:'med',what:b.id+' was put on account — '+money(b.tender.credit)+' is not in the till',go:'day'});});
  return out;}

/* A till needs a way to take money, something to print on, a scanner, the books
   and a place for backups. Every one of them is swappable. */
var SPEC={
  uses:['payments','printing','barcode','ledger','gst','storage'],
  id:CFG.id, name:CFG.name, company:CFG.company, fy:CFG.fy||'FY 2026-27', tagline:CFG.tagline, about:CFG.about,
  groups:[{label:'Counter',items:['till','day']},
          {label:'End of day',items:['close','stock']},
          {label:'Wiring',items:['wiring']}],
  nav:[{v:'till',label:'Till',icon:'store'},{v:'day',label:'Today’s bills',icon:'doc'},
       {v:'close',label:'Day close',icon:'scale'},{v:'stock',label:'Counter stock',icon:'box'},
       {v:'wiring',label:'Wiring',icon:'flow'}],
  seed:function(DB){
    DB.stock={}; (CFG.items||[]).forEach(function(it){DB.stock[it.sku]=it.qty;});
    DB.cart=[]; DB.disc=0; DB.tender={}; DB.bills=[]; DB.counted=0; DB.closed=false; DB.seq=100;
    (CFG.bills||[]).forEach(function(b){DB.bills.push(JSON.parse(JSON.stringify(b)));
      (b.lines||[]).forEach(function(l){DB.stock[l.sku]=num(DB.stock[l.sku])-num(l.qty);});});
    DB.seq=100+(CFG.bills||[]).length;
  },
  views:{
    till:function(){var DB=db();
      return H.head('Counter · Till',CFG.name,'Ring it up. The stock this draws on is the same single number your website reads.')+
      H.kpis([{l:'In the cart',v:money(cartTotal(DB)),d:plural(cartUnits(DB),'piece'),icon:'cart',tone:'teal'},
        {l:'Tendered',v:money(tendered(DB)),d:'across '+plural(TENDERS.filter(function(t){return num((DB.tender||{})[t.k])>0;}).length,'method'),icon:'coin',tone:'blue'},
        {l:'Still due',v:money(stillDue(DB)),d:stillDue(DB)?'cannot bill yet':'ready to bill',cls:stillDue(DB)?'r':'g',icon:'scale',tone:stillDue(DB)?'red':'green'},
        {l:'Change to give',v:money(changeDue(DB)),d:'back to the customer',cls:changeDue(DB)?'':'g',icon:'return',tone:'peach'}],'')+
      H.panel('Add to the cart','<div style="display:flex;gap:8px;flex-wrap:wrap">'+
        (CFG.items||[]).map(function(it){var q=stockOf(DB,it.sku);
          return '<button class="btn'+(q<=0?' d':'')+'" data-act="add" data-s="'+esc(it.sku)+'">'+
            esc(it.name)+' <span class="hint">'+money(it.rate)+' · '+q+' left</span></button>';}).join('')+
        '</div><p class="hint" style="margin-top:9px">A button greys out when the counter has none left. You cannot sell what is not there — the same rule the website obeys.</p>')+
      H.panel('Cart <span class="badge">'+plural(cart(DB).length,'line')+'</span>',
        cart(DB).length?H.table([
          {label:'Item',align:'l',fmt:function(l){return esc(l.name);}},
          {label:'Rate',fmt:function(l){return inr(l.rate);},cellcls:'mono'},
          {label:'Qty',k:'qty',cellcls:'mono'},
          {label:'Line total',fmt:function(l){return inr(lineGross(l));},cellcls:'mono'},
          {label:'',align:'l',fmt:function(l){var i=cart(DB).indexOf(l);
            return '<button class="btn sm" data-act="less" data-i="'+i+'">−</button> '+
                   '<button class="btn sm" data-act="add" data-s="'+esc(l.sku)+'">+</button> '+
                   '<button class="btn sm d" data-act="drop" data-i="'+i+'">Remove</button>';}}],cart(DB))+
          '<div class="kv" style="margin-top:8px"><span>Gross</span><b>'+money(cartGross(DB))+'</b></div>'+
          '<div class="kv"><span>− Discount '+num(DB.disc)+'%</span><b>'+money(cartDisc(DB))+'</b></div>'+
          '<div class="kv"><span>Taxable</span><b>'+money(cartTaxable(DB))+'</b></div>'+
          '<div class="kv"><span>+ GST '+GST_PCT+'%</span><b>'+money(cartTax(DB))+'</b></div>'+
          '<div class="kv"><span><b>Total</b></span><b class="g">'+money(cartTotal(DB))+'</b></div>'
        :'<div class="empty">Cart is empty. Press an item above.</div>',
        cart(DB).length?'<button class="btn sm d" data-act="clearcart">Clear the cart</button>':'')+
      (cart(DB).length?H.panel('Discount and payment',
        '<div class="form f4">'+H.fields([
          {id:'p_disc',label:'Discount %',type:'num',value:num(DB.disc)},
          {id:'p_cash',label:'Cash (₹)',type:'num',value:num((DB.tender||{}).cash)||''},
          {id:'p_upi',label:'UPI (₹)',type:'num',value:num((DB.tender||{}).upi)||''},
          {id:'p_card',label:'Card (₹)',type:'num',value:num((DB.tender||{}).card)||''},
          {id:'p_credit',label:'On account (₹)',type:'num',value:num((DB.tender||{}).credit)||''}
        ])+'<div class="fld" style="align-items:flex-end"><button class="btn" data-act="settender">Apply</button></div></div>'+
        '<div class="kv"><span>Total to pay</span><b>'+money(cartTotal(DB))+'</b></div>'+
        '<div class="kv"><span>Tendered</span><b>'+money(tendered(DB))+'</b></div>'+
        '<div class="kv"><span>'+(stillDue(DB)?'Still due':'Change to give')+'</span><b class="'+(stillDue(DB)?'r':'g')+'">'+
          money(stillDue(DB)||changeDue(DB))+'</b></div>'+
        '<div style="margin-top:10px"><button class="btn p" data-act="bill">Print the bill</button></div>'+
        '<p class="hint" style="margin-top:8px">Split it however the customer wants — part cash, part UPI, part on account. The bill will not print until the full amount is covered.</p>'):'')+
      H.note('Discount is capped at 50%. A counter that can discount without limit is a counter that leaks.');
    },
    day:function(){var DB=db();var bt=byTender(DB);
      return H.head('Counter · Today','Today’s bills','Every bill rung up, and which way the money came in.')+
      H.kpis([{l:'Takings',v:money(takings(DB)),d:plural(bills(DB).length,'bill'),icon:'coin',tone:'teal'},
        {l:'Average bill',v:money(avgBill(DB)),d:plural(unitsSold(DB),'piece')+' sold',icon:'cart',tone:'blue'},
        {l:'Discount given',v:money(discGiven(DB)),d:takings(DB)?Math.round(discGiven(DB)/takings(DB)*100)+'% of takings':'—',
         cls:discGiven(DB)>takings(DB)*0.1?'r':'',icon:'pct',tone:'peach'},
        {l:'GST collected',v:money(taxCollected(DB)),d:'to be paid over',icon:'scale',tone:'green'}],'')+
      H.panel('How the money came in',H.table([
        {label:'Method',align:'l',k:'tender'},
        {label:'Bills',k:'n',cellcls:'mono'},
        {label:'Value',fmt:function(t){return inr(t.value);},cellcls:'mono'},
        {label:'Share',align:'l',fmt:function(t){return '<div style="min-width:140px">'+H.bar(takings(DB)?t.value/takings(DB)*100:0)+'</div>';}},
        {label:'',align:'l',fmt:function(t){return t.till?H.tag('in the till','grn')
          :t.key==='credit'?H.tag('not money yet','red'):H.tag('into the bank','blu');}}],bt))+
      H.panel('Every bill',bills(DB).length?H.table([
        {label:'Bill',align:'l',fmt:function(b){return '<b>'+esc(b.id)+'</b><div class="hint">'+esc(b.time||'')+'</div>';}},
        {label:'Customer',align:'l',fmt:function(b){return esc(b.cust||'Walk-in');}},
        {label:'Pieces',fmt:function(b){return billUnits(b);},cellcls:'mono'},
        {label:'Gross',fmt:function(b){return inr(billGross(b));},cellcls:'mono'},
        {label:'Discount',fmt:function(b){return billDisc(b)?inr(billDisc(b)):'—';},
         cellcls:function(b){return 'mono '+(num(b.disc)>20?'r':'');}},
        {label:'GST',fmt:function(b){return inr(billTax(b));},cellcls:'mono'},
        {label:'Total',fmt:function(b){return inr(billTotal(b));},cellcls:'mono'},
        {label:'Paid by',align:'l',fmt:function(b){return TENDERS.filter(function(t){return num((b.tender||{})[t.k])>0;})
          .map(function(t){return H.tag(t.l+' '+inr((b.tender||{})[t.k]),t.till?'grn':t.k==='credit'?'red':'blu');}).join(' ');}}],
        bills(DB).slice().reverse())
        :'<div class="empty">Nothing rung up yet.</div>');
    },
    close:function(){var DB=db();var os=overShort(DB);
      return H.head('End of day · Close','Day close','Count the cash drawer. If it does not match what the bills say, you find out today — not next month.')+
      H.kpis([{l:'Opening float',v:money(CFG.opening),d:'in the drawer at open',icon:'coin',tone:'teal'},
        {l:'Cash taken',v:money(byTender(DB).filter(function(t){return t.till;})[0].value),d:'cash bills only',icon:'store',tone:'blue'},
        {l:'Should be in the drawer',v:money(expectedCash(DB)),d:'float + cash taken',cls:'g',icon:'scale',tone:'green'},
        {l:DB.closed?(os===0?'Reconciled':(os>0?'Over by':'Short by')):'Not counted yet',
         v:DB.closed?(os===0?'✓':money(Math.abs(os))):'—',d:DB.closed?'against the bills':'count it below',
         cls:DB.closed?(os===0?'g':'r'):'',icon:'check',tone:DB.closed?(os===0?'green':'red'):'peach'}],'')+
      H.panel('Count the drawer',
        (DB.closed?'<p>Counted <b>'+money(counted(DB))+'</b>. '+
            (os===0?'It matches to the paisa.':'That is '+(os>0?'<b class="r">'+money(os)+' more</b>':'<b class="r">'+money(-os)+' less</b>')+' than the bills say.')+'</p>'+
            '<button class="btn" data-act="reopen">Count it again</button>'
          :H.form([{id:'z_cash',label:'What is actually in the drawer (₹)',type:'num',ph:String(expectedCash(DB)),wide:true}],
                  'Close the day','closeday','f2'))+
        '<p class="hint" style="margin-top:8px">Only <b>cash</b> is expected in the drawer. UPI and card go to the bank, and anything put on account is not money yet — which is exactly why they are listed separately.</p>')+
      H.panel('The day, line by line',
        '<div class="kv"><span>Opening float</span><b>'+money(CFG.opening)+'</b></div>'+
        byTender(DB).map(function(t){return '<div class="kv"><span>'+esc(t.l)+(t.till?'':' <span class="hint">(not in the drawer)</span>')+
          '</span><b'+(t.till?'':' class="mut"')+'>'+money(t.value)+'</b></div>';}).join('')+
        '<div class="kv"><span><b>Should be in the drawer</b></span><b class="g">'+money(expectedCash(DB))+'</b></div>'+
        (DB.closed?'<div class="kv"><span>Actually counted</span><b>'+money(counted(DB))+'</b></div>'+
          '<div class="kv"><span><b>Over / short</b></span><b class="'+(os===0?'g':'r')+'">'+(os===0?'nil':money(os))+'</b></div>':''))+
      H.panel('Why this is worth two minutes a day',
        '<p>'+esc(CFG.closeNote||'')+'</p>'+
        '<p class="hint">A drawer that is short ₹200 today is a puzzle. A drawer that is short ₹6,000 at the end of the month is an argument nobody can settle.</p>');
    },
    stock:function(){var DB=db();var low=lowStock(DB);
      return H.head('End of day · Stock','Counter stock','What is on the shelf right now. Every bill you ring up takes from this, and so does every website order.')+
      H.kpis([{l:'Lines on the counter',v:(CFG.items||[]).length,d:'items stocked',icon:'box',tone:'teal'},
        {l:'Pieces on hand',v:(CFG.items||[]).reduce(function(s,it){return s+stockOf(DB,it.sku);},0),d:'across all lines',icon:'layers',tone:'blue'},
        {l:'Sold today',v:unitsSold(DB),d:'off the counter',cls:'g',icon:'cart',tone:'green'},
        {l:'Running out',v:low.length,d:'at or below reorder',cls:low.length?'r':'g',icon:'bell',tone:low.length?'red':'green'}],'')+
      H.panel('On the shelf',H.table([
        {label:'Item',align:'l',fmt:function(it){return '<b>'+esc(it.name)+'</b><div class="hint">'+esc(it.sku)+'</div>';}},
        {label:'Price',fmt:function(it){return inr(it.rate);},cellcls:'mono'},
        {label:'On hand',fmt:function(it){return stockOf(DB,it.sku);},cellcls:function(it){return 'mono '+(stockOf(DB,it.sku)<=num(it.rop)?'r':'');}},
        {label:'Reorder at',k:'rop',cellcls:'mono'},
        {label:'Sold today',fmt:function(it){return bills(DB).reduce(function(s,b){
          return s+(b.lines||[]).filter(function(l){return l.sku===it.sku;}).reduce(function(t,l){return t+num(l.qty);},0);},0);},cellcls:'mono'},
        {label:'',align:'l',fmt:function(it){var q=stockOf(DB,it.sku);
          return q<=0?H.tag('out of stock','red'):q<=num(it.rop)?H.tag('reorder','red')
            :q<=num(it.rop)*2?H.tag('low','amb'):H.tag('ok','grn');}}],CFG.items||[]))+
      H.panel('One stock number, not one per channel',
        '<p>The quantity on this screen is the <b>same record</b> the website, the marketplaces and the wholesale order book all read. Sell the last piece at the counter and the website cannot sell it thirty seconds later.</p>'+
        '<p class="hint">Almost every oversell in a multi-channel business comes from keeping a separate stock figure per channel and reconciling them "later".</p>');
    },
    wiring:function(){var DB=db();
      return H.head('Wiring · Integration','Where every figure comes from','POS owns the bill and the till. Stock, price and the ledger it shares with everything else.')+
      H.note('Shared Data Core: Item/SKU · Party · Stock · Ledger/Voucher · Order — every module reads and writes these.')+
      H.panel('Every figure here, and its source',H.table([
        {label:'Figure here',align:'l',k:'f'},{label:'Comes from',align:'l',k:'s'},{label:'How it is worked out',align:'l',k:'h'}],
        CFG.wiring||[]))+
      '<div class="two">'+
      H.panel('Live example — one counter sale',
        '<div class="cascade">'+
        '<div class="cl"><span class="d">1</span><div>A piece is added to the cart. Its price comes from the <b>Catalog</b>, not from whoever is at the till.</div></div>'+
        '<div class="cl"><span class="d">2</span><div>→ A discount is applied, capped at <b>50%</b>. GST is worked out on the discounted value, never on the gross.</div></div>'+
        '<div class="cl"><span class="d">3</span><div>→ Payment is split however the customer wants. The bill will not print until the full amount is covered.</div></div>'+
        '<div class="cl"><span class="d">4</span><div>→ <b>Stock falls</b> — the same single number the website reads. No oversell is possible.</div></div>'+
        '<div class="cl"><span class="d">5</span><div>→ The sale and the GST post to the <b>books</b>.</div></div>'+
        '<div class="cl"><span class="d">6</span><div>→ At close, only the <b>cash</b> part is expected in the drawer. Anything else is flagged as not being money yet.</div></div>'+
        '</div>')+
      H.panel('Three rules that make a till trustworthy',
        '<p><b>1 · The price is not typed.</b> It comes from the Catalog, so the counter cannot quietly undercut the website.</p>'+
        '<p><b>2 · The discount has a ceiling.</b> 50%, and it is on the bill for anybody to see.</p>'+
        '<p><b>3 · The drawer is counted every day.</b> A ₹200 gap found today is a question; the same gap found in a monthly audit is an argument.</p>'+
        '<p class="hint">All three are self-tests. The app will tell you on startup if any of them stops being true.</p>')+
      '</div>';
    }
  },
  actions:{
    add:function(b){var DB=db();var sku=b.getAttribute('data-s');var it=item(sku);
      if(!it)return;
      var inCart=cart(DB).filter(function(l){return l.sku===sku;})[0];
      var have=stockOf(DB,sku)-(inCart?num(inCart.qty):0);
      if(have<=0){toast('None left on the counter');return;}
      if(inCart)inCart.qty=num(inCart.qty)+1;
      else DB.cart.push({sku:sku,name:it.name,rate:it.rate,qty:1});
      K.save();K.render();},
    less:function(b){var DB=db();var l=cart(DB)[num(b.getAttribute('data-i'))];
      if(!l)return; l.qty=num(l.qty)-1;
      if(l.qty<=0)DB.cart.splice(cart(DB).indexOf(l),1);
      K.save();K.render();},
    drop:function(b){var DB=db();DB.cart.splice(num(b.getAttribute('data-i')),1);K.save();K.render();},
    clearcart:function(){var DB=db();DB.cart=[];DB.tender={};DB.disc=0;K.save();toast('Cart cleared');K.render();},
    settender:function(){var DB=db();
      var d=H.numv('p_disc');
      if(d<0||d>50){toast('Discount must be between 0 and 50%');return;}
      DB.disc=d;
      DB.tender={cash:H.numv('p_cash'),upi:H.numv('p_upi'),card:H.numv('p_card'),credit:H.numv('p_credit')};
      K.save();K.render();},
    bill:function(){var DB=db();
      if(!cart(DB).length){toast('Nothing in the cart');return;}
      if(stillDue(DB)>0){toast(money(stillDue(DB))+' still to pay');return;}
      DB.seq=(DB.seq||100)+1;
      var b={id:CFG.prefix+DB.seq,time:TODAY,cust:'Walk-in',disc:num(DB.disc),
             lines:JSON.parse(JSON.stringify(cart(DB))),tender:JSON.parse(JSON.stringify(DB.tender||{}))};
      cart(DB).forEach(function(l){DB.stock[l.sku]=num(DB.stock[l.sku])-num(l.qty);});
      DB.bills.push(b);
      DB.cart=[];DB.tender={};DB.disc=0;
      K.save();toast('Bill '+b.id+' printed ✓');K.render();},
    closeday:function(){var DB=db();var c=H.numv('z_cash');
      if(c<0){toast('That cannot be negative');return;}
      DB.counted=c;DB.closed=true;K.save();
      toast(r2(c-expectedCash(DB))===0?'Reconciled to the paisa ✓':'Counted — there is a difference');K.render();},
    reopen:function(){var DB=db();DB.closed=false;K.save();K.render();}
  },
  tests:function(t,DB){
    /* one bill's arithmetic */
    t('a line total = quantity × rate',bills(DB).every(function(b){
      return (b.lines||[]).every(function(l){return lineGross(l)===r2(l.qty*l.rate);});}));
    t('the discount comes off before GST is worked out',bills(DB).every(function(b){
      return billTaxable(b)===r2(billGross(b)-billDisc(b))&&billTax(b)===r2(billTaxable(b)*GST_PCT/100);}));
    t('GST is never charged on the discount',bills(DB).every(function(b){
      return billTax(b)<=r2(billGross(b)*GST_PCT/100);}));
    t('a bill total = taxable + GST',bills(DB).every(function(b){
      return billTotal(b)===r2(billTaxable(b)+billTax(b));}));
    t('no bill carries a discount over 50%',bills(DB).every(function(b){return num(b.disc)<=50;}));
    /* payment must cover the bill */
    t('every bill was paid in full',bills(DB).every(function(b){
      return r2(TENDERS.reduce(function(s,x){return s+num((b.tender||{})[x.k]);},0))>=billTotal(b);}));
    t('takings = every bill added up',takings(DB)===r2(bills(DB).reduce(function(s,b){return s+billTotal(b);},0)));
    t('the payment methods add up to the takings',
      r2(byTender(DB).reduce(function(s,x){return s+x.value;},0))>=takings(DB));
    t('average bill = takings ÷ number of bills',avgBill(DB)===r2(takings(DB)/bills(DB).length));
    /* the till */
    t('only cash is expected in the drawer',
      TENDERS.filter(function(x){return x.till;}).length===1&&tender('cash').till===true);
    t('what should be in the drawer = float + cash taken',
      expectedCash(DB)===r2(num(CFG.opening)+byTender(DB).filter(function(x){return x.till;})[0].value));
    t('UPI, card and on-account are never expected in the drawer',
      byTender(DB).filter(function(x){return !x.till;}).every(function(x){return true;})&&
      expectedCash(DB)===r2(num(CFG.opening)+byTender(DB).filter(function(x){return x.till;})
        .reduce(function(s,x){return s+x.value;},0)));
    t('over/short is nil until the drawer is counted',(function(){
      var was=DB.closed; DB.closed=false; var z=overShort(DB); DB.closed=was; return z===0;})());
    t('counting the exact expected amount reconciles to nil',(function(){
      var wc=DB.counted, wz=DB.closed;
      DB.counted=expectedCash(DB); DB.closed=true;
      var ok=overShort(DB)===0; DB.counted=wc; DB.closed=wz; return ok;})());
    t('counting less than expected shows short, not over',(function(){
      var wc=DB.counted, wz=DB.closed;
      DB.counted=r2(expectedCash(DB)-500); DB.closed=true;
      var ok=overShort(DB)===-500; DB.counted=wc; DB.closed=wz; return ok;})());
    /* stock */
    t('every counter line has a stock number',
      (CFG.items||[]).every(function(it){return stockOf(DB,it.sku)!==undefined;}));
    t('no counter line has gone negative',
      (CFG.items||[]).every(function(it){return stockOf(DB,it.sku)>=0;}));
    t('stock on hand = what was stocked less what was sold',
      (CFG.items||[]).every(function(it){
        var sold=bills(DB).reduce(function(s,b){return s+(b.lines||[])
          .filter(function(l){return l.sku===it.sku;}).reduce(function(x,l){return x+num(l.qty);},0);},0);
        return stockOf(DB,it.sku)===num(it.qty)-sold;}));
    t('the low-stock list is only items at or below their reorder point',
      lowStock(DB).every(function(it){return stockOf(DB,it.sku)<=num(it.rop);}));
    /* the cart */
    t('an empty cart totals nothing',(function(){
      var wc=DB.cart, wd=DB.disc; DB.cart=[]; DB.disc=0;
      var ok=cartTotal(DB)===0&&cartUnits(DB)===0; DB.cart=wc; DB.disc=wd; return ok;})());
    t('the cart cannot promise more than the counter holds',(function(){
      var it=(CFG.items||[])[0], wc=DB.cart;
      DB.cart=[{sku:it.sku,name:it.name,rate:it.rate,qty:stockOf(DB,it.sku)}];
      var ok=cartUnits(DB)<=stockOf(DB,it.sku); DB.cart=wc; return ok;})());
    t('a cart discount over 50% is clamped, never applied',(function(){
      var wc=DB.cart, wd=DB.disc, it=(CFG.items||[])[0];
      DB.cart=[{sku:it.sku,name:it.name,rate:1000,qty:1}]; DB.disc=90;
      var ok=cartDisc(DB)===500; DB.cart=wc; DB.disc=wd; return ok;})());
    t('still-due and change-to-give are never both above zero',(function(){
      var wc=DB.cart, wt=DB.tender, it=(CFG.items||[])[0];
      DB.cart=[{sku:it.sku,name:it.name,rate:1000,qty:1}]; DB.tender={cash:2000};
      var ok=!(stillDue(DB)>0&&changeDue(DB)>0);
      DB.cart=wc; DB.tender=wt; return ok;})());
    t('GST collected is the sum of the GST on every bill',
      taxCollected(DB)===r2(bills(DB).reduce(function(s,b){return s+billTax(b);},0)));
  }
};

if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
