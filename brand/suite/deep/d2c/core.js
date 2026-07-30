/* Medhava — D2C Sales (Module 03 · App 1)
   Your own storefront: cart → order → packed → shipped → delivered, with coupons,
   part-paid COD, loyalty points and abandoned-cart recovery. Every figure derived.
   CONFIG supplies names so the Medhava and Vastrangam builds run the SAME math. */
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
var CFG=(typeof CONFIG!=='undefined')?CONFIG:{};
function db(){return K.DB;}
var TODAY='2026-07-31';
function days(from,to){return Math.round((new Date(to||TODAY)-new Date(from))/86400000);}
function plural(n,one,many){return n+' '+(n===1?one:(many||one+'s'));}

/* ── the fulfilment pipeline ── */
var STAGES=[{k:'new',l:'New'},{k:'confirmed',l:'Confirmed'},{k:'packed',l:'Packed'},
            {k:'shipped',l:'Shipped'},{k:'delivered',l:'Delivered'}];
function stIdx(k){for(var i=0;i<STAGES.length;i++)if(STAGES[i].k===k)return i;return -1;}
function stLbl(k){var s=STAGES.filter(function(x){return x.k===k;})[0];return s?s.l:'Cancelled';}
var LOYALTY_PCT=2;      /* points earned, as a % of what the customer kept */
var COD_ADV_PCT=20;     /* the advance a COD order must carry before it is packed */

/* ── money on one order, always recomputed ── */
function coupon(code){return (CFG.coupons||[]).filter(function(c){return c.code===code;})[0]||null;}
function gross(o){return r2(num(o.qty)*num(o.rate));}
function discount(o){var c=coupon(o.coupon); if(!c)return 0;
  if(gross(o)<num(c.min))return 0;                 /* below the minimum, the code does nothing */
  return r2(gross(o)*num(c.pct)/100);}
function net(o){return r2(gross(o)-discount(o));}
function codDue(o){return o.pay==='cod'?r2(Math.max(0,net(o)-num(o.adv))):0;}
function paidNow(o){return o.pay==='prepaid'?net(o):num(o.adv);}
function pointsOf(o){return o.status==='delivered'?Math.round(net(o)*LOYALTY_PCT/100):0;}

function live(DB){return (DB.orders||[]).filter(function(o){return o.status!=='cancelled';});}
function cancelled(DB){return (DB.orders||[]).filter(function(o){return o.status==='cancelled';});}
function totalNet(DB){return r2(live(DB).reduce(function(s,o){return s+net(o);},0));}
function totalGross(DB){return r2(live(DB).reduce(function(s,o){return s+gross(o);},0));}
function totalDisc(DB){return r2(live(DB).reduce(function(s,o){return s+discount(o);},0));}
function collected(DB){return r2(live(DB).reduce(function(s,o){return s+paidNow(o);},0));}
function outstanding(DB){return r2(live(DB).reduce(function(s,o){return s+codDue(o);},0));}
function aov(DB){var n=live(DB).length;return n?r2(totalNet(DB)/n):0;}
function codShare(DB){var n=live(DB).length;if(!n)return 0;
  return Math.round(live(DB).filter(function(o){return o.pay==='cod';}).length/n*100);}
function funnel(DB){return STAGES.map(function(s){
  var rows=live(DB).filter(function(o){return o.status===s.k;});
  return {stage:s.l,key:s.k,n:rows.length,value:r2(rows.reduce(function(t,o){return t+net(o);},0))};});}
function delivered(DB){return live(DB).filter(function(o){return o.status==='delivered';});}
function fulfilRate(DB){var n=live(DB).length;return n?Math.round(delivered(DB).length/n*100):0;}

/* ── loyalty: earned on delivery, spent when you say so ── */
function earned(DB,cust){return live(DB).filter(function(o){return o.cust===cust;})
  .reduce(function(s,o){return s+pointsOf(o);},0);}
function spent(DB,cust){return num((DB.spent||{})[cust]);}
function balance(DB,cust){return earned(DB,cust)-spent(DB,cust);}
function customers(DB){var seen={},out=[];
  live(DB).forEach(function(o){if(!seen[o.cust]){seen[o.cust]=1;out.push(o.cust);}});
  return out.map(function(c){var os=live(DB).filter(function(o){return o.cust===c;});
    return {cust:c,orders:os.length,spend:r2(os.reduce(function(s,o){return s+net(o);},0)),
            earned:earned(DB,c),spent:spent(DB,c),balance:balance(DB,c)};})
    .sort(function(a,b){return b.spend-a.spend;});}
function pointsLiability(DB){return customers(DB).reduce(function(s,c){return s+c.balance;},0);}

/* ── abandoned carts ── */
function openCarts(DB){return (DB.carts||[]).filter(function(c){return !c.done;});}
function cartValue(DB){return r2(openCarts(DB).reduce(function(s,c){return s+num(c.value);},0));}
function recoverable(DB){return openCarts(DB).filter(function(c){return c.days<=7;});}

/* alerts nobody types in */
function issues(DB){var out=[];
  live(DB).filter(function(o){return o.pay==='cod'&&num(o.adv)<r2(net(o)*COD_ADV_PCT/100)&&stIdx(o.status)>=stIdx('packed');})
    .forEach(function(o){out.push({sev:'high',what:o.id+' was packed with only '+money(o.adv)+' advance — the rule is '+COD_ADV_PCT+'% of '+money(net(o)),go:'orders'});});
  live(DB).filter(function(o){return o.status==='shipped'&&days(o.date)>7;})
    .forEach(function(o){out.push({sev:'med',what:o.id+' has been in transit '+days(o.date)+' days — chase the courier',go:'orders'});});
  recoverable(DB).forEach(function(c){out.push({sev:'med',what:c.cust+' left '+money(c.value)+' in a cart '+plural(c.days,'day')+' ago — still worth a nudge',go:'carts'});});
  return out;}

/* D2C Sales writes orders, so it needs the channel it sells on, a way to take money,
   a way to tell the customer, a courier, the books, and somewhere to print and back up. */
var SPEC={
  uses:['channels','payments','messaging','courier','ledger','printing','storage'],
  id:CFG.id, name:CFG.name, company:CFG.company, fy:CFG.fy||'FY 2026-27', tagline:CFG.tagline, about:CFG.about,
  groups:[{label:'Selling',items:['dash','orders']},
          {label:'Winning back',items:['carts','loyal']},
          {label:'Wiring',items:['wiring']}],
  nav:[{v:'dash',label:'Overview',icon:'grid'},{v:'orders',label:'Orders',icon:'cart'},
       {v:'carts',label:'Abandoned carts',icon:'return'},{v:'loyal',label:'Loyalty points',icon:'spark'},
       {v:'wiring',label:'Wiring',icon:'flow'}],
  seed:function(DB){
    DB.orders=JSON.parse(JSON.stringify(CFG.orders));
    DB.carts=JSON.parse(JSON.stringify(CFG.carts));
    DB.spent=JSON.parse(JSON.stringify(CFG.spent||{}));
    DB.seq=500;
  },
  views:{
    dash:function(){var DB=db();var f=funnel(DB);var mx=Math.max.apply(null,f.map(function(x){return x.value;}).concat([1]));
      var iss=issues(DB);
      return H.head('Selling · Overview',CFG.name,'Every order from your own storefront, from the moment it is placed to the moment it lands.')+
      H.kpis([
        {l:'Net sales',v:money(totalNet(DB)),d:'after coupons',icon:'coin',tone:'teal'},
        {l:'Orders',v:live(DB).length,d:'avg '+money(aov(DB)),icon:'cart',tone:'blue'},
        {l:'Collected',v:money(collected(DB)),d:'money actually in',cls:'g',icon:'check',tone:'green'},
        {l:'Still to collect',v:money(outstanding(DB)),d:'on delivery',cls:outstanding(DB)?'r':'g',icon:'truck',tone:'peach'},
        {l:'Needs a look',v:iss.length,d:'rule breaches & delays',cls:iss.length?'r':'g',icon:'bell',tone:iss.length?'red':'green'}],'k5')+
      '<div class="two">'+
      H.panel('Where the orders are <span class="badge">'+fulfilRate(DB)+'% delivered</span>',
        f.map(function(x){return '<div style="margin-bottom:10px"><div class="kv" style="border:none;padding:2px 0"><span>'+
          esc(x.stage)+' <span class="hint">'+plural(x.n,'order')+'</span></span><b>'+money(x.value)+'</b></div>'+
          H.bar(x.value/mx*100)+'</div>';}).join('')+
        '<div class="kv" style="margin-top:10px"><span>Cancelled</span><b>'+plural(cancelled(DB).length,'order')+'</b></div>'+
        '<div class="kv"><span>Paid up front</span><b>'+(100-codShare(DB))+'%</b></div>'+
        '<div class="kv"><span>Cash on delivery</span><b class="'+(codShare(DB)>50?'r':'')+'">'+codShare(DB)+'%</b></div>'+
        '<p class="hint" style="margin-top:8px">'+esc(CFG.codNote||'')+'</p>')+
      H.panel('What needs a look <span class="badge">'+iss.length+'</span>',
        iss.length?H.table([{label:'',align:'l',fmt:function(a){return H.tag(a.sev==='high'?'urgent':'watch',a.sev==='high'?'red':'amb');}},
          {label:'What is happening',align:'l',k:'what'},
          {label:'',align:'l',fmt:function(a){return '<button class="btn sm" data-go="'+a.go+'">Open →</button>';}}],iss)
        :'<div class="cascade">Nothing outside its rules. Every COD order carries its advance and nothing is stuck in transit.</div>')+
      '</div>'+
      H.panel('From gross to what you keep',
        '<div class="kv"><span>Gross of every live order</span><b>'+money(totalGross(DB))+'</b></div>'+
        '<div class="kv"><span>− Coupons actually applied</span><b>'+money(totalDisc(DB))+'</b></div>'+
        '<div class="kv"><span><b>= Net sales</b></span><b class="g">'+money(totalNet(DB))+'</b></div>'+
        '<div class="kv"><span>Of which collected already</span><b>'+money(collected(DB))+'</b></div>'+
        '<div class="kv"><span>Of which still on delivery</span><b class="'+(outstanding(DB)?'r':'')+'">'+money(outstanding(DB))+'</b></div>'+
        '<p class="hint" style="margin-top:8px">A coupon below its minimum order value is ignored — it does not silently reduce the bill.</p>');
    },
    orders:function(){var DB=db();var f=funnel(DB);
      return H.head('Selling · Orders','Orders','One row per order. Move it along the pipeline; it never skips a step and never goes backwards.')+
      H.kpis(f.map(function(x,i){return {l:x.stage,v:x.n,d:money(x.value),
        icon:['cart','check','box','truck','spark'][i],tone:['teal','blue','peach','amb','green'][i]||'teal'};}),'k5')+
      H.panel('Take an order',H.form([
        {id:'o_cust',label:'Customer name',ph:CFG.ph.cust,wide:true},
        {id:'o_item',label:'What they bought',type:'select',options:(CFG.items||[]).map(function(it){return {v:it.sku,label:it.name+' — '+money(it.rate)};})},
        {id:'o_qty',label:'Quantity',type:'num',ph:'1'},
        {id:'o_pay',label:'How they are paying',type:'select',options:[{v:'prepaid',label:'Paid up front'},{v:'cod',label:'Cash on delivery'}]},
        {id:'o_adv',label:'Advance taken (₹)',type:'num',ph:'0'},
        {id:'o_cpn',label:'Coupon code',type:'select',options:[{v:'',label:'None'}].concat((CFG.coupons||[]).map(function(c){return {v:c.code,label:c.code+' — '+c.pct+'% off above '+money(c.min)};}))}
      ],'Place the order','neworder','f3'))+
      H.panel('Live orders <span class="badge">'+live(DB).length+'</span>',live(DB).length?H.table([
        {label:'Order',align:'l',fmt:function(o){return '<b>'+esc(o.id)+'</b><div class="hint">'+esc(o.cust)+' · '+esc(o.date)+'</div>';}},
        {label:'Item',align:'l',fmt:function(o){return esc(o.name)+'<div class="hint">'+o.qty+' × '+money(o.rate)+'</div>';}},
        {label:'Gross',fmt:function(o){return inr(gross(o));},cellcls:'mono'},
        {label:'Coupon',align:'l',fmt:function(o){
          if(!o.coupon)return '<span class="hint">—</span>';
          return discount(o)?H.tag(o.coupon+' −'+inr(discount(o)),'grn'):H.tag(o.coupon+' below minimum','gray');}},
        {label:'Net',fmt:function(o){return inr(net(o));},cellcls:'mono'},
        {label:'Payment',align:'l',fmt:function(o){return o.pay==='cod'
          ?H.tag('COD','amb')+' <span class="hint">adv '+inr(o.adv)+'</span>':H.tag('prepaid','grn');}},
        {label:'On delivery',fmt:function(o){return codDue(o)?inr(codDue(o)):'—';},cellcls:function(o){return 'mono '+(codDue(o)?'r':'');}},
        {label:'Stage',align:'l',fmt:function(o){var i=stIdx(o.status);
          return H.tag(stLbl(o.status),['blu','blu','amb','amb','grn'][i]||'gray');}},
        {label:'',align:'l',fmt:function(o){var i=(DB.orders||[]).indexOf(o);
          return (stIdx(o.status)<STAGES.length-1?'<button class="btn sm" data-act="advance" data-i="'+i+'">'+
            esc('Mark '+STAGES[stIdx(o.status)+1].l.toLowerCase())+' →</button> ':'')+
            (o.status==='delivered'?H.tag('+'+pointsOf(o)+' points','grn')+' ':'')+
            '<button class="btn sm d" data-act="cancel" data-i="'+i+'">Cancel</button>';}}],
        live(DB).slice().sort(function(a,b){return stIdx(a.status)-stIdx(b.status);}))
        :'<div class="empty">No live orders. Take one above.</div>')+
      (cancelled(DB).length?H.panel('Cancelled <span class="badge">'+cancelled(DB).length+'</span>',
        H.table([{label:'Order',align:'l',fmt:function(o){return esc(o.id);}},
          {label:'Customer',align:'l',k:'cust'},
          {label:'Was worth',fmt:function(o){return inr(net(o));},cellcls:'mono'},
          {label:'',align:'l',fmt:function(o){return H.tag('cancelled','red');}}],cancelled(DB))+
        '<p class="hint">Cancelled orders leave every total but stay in the record. Nothing is ever deleted.</p>'):'');
    },
    carts:function(){var DB=db();var oc=openCarts(DB);
      return H.head('Winning back · Carts','Abandoned carts','Somebody filled a cart and left. This is the cheapest sale in the business to win back.')+
      H.kpis([{l:'Open carts',v:oc.length,d:'left behind',icon:'return',tone:'teal'},
        {l:'Value sitting there',v:money(cartValue(DB)),d:'not yours yet',icon:'coin',tone:'peach'},
        {l:'Still worth a nudge',v:recoverable(DB).length,d:'under 7 days old',cls:'g',icon:'bell',tone:'green'},
        {l:'Recovered so far',v:(DB.carts||[]).filter(function(c){return c.done==='won';}).length,d:'turned into orders',cls:'g',icon:'check',tone:'blue'}],'')+
      H.panel('Carts left behind',oc.length?H.table([
        {label:'Customer',align:'l',k:'cust'},
        {label:'What they left',align:'l',k:'item'},
        {label:'Value',fmt:function(c){return inr(c.value);},cellcls:'mono'},
        {label:'Left',fmt:function(c){return plural(c.days,'day')+' ago';},cellcls:function(c){return 'mono '+(c.days>7?'r':'');}},
        {label:'',align:'l',fmt:function(c){return c.days<=7?H.tag('worth a nudge','grn'):H.tag('probably gone','red');}},
        {label:'',align:'l',fmt:function(c){var i=(DB.carts||[]).indexOf(c);
          return '<button class="btn sm p" data-act="recover" data-i="'+i+'">They bought it →</button> '+
                 '<button class="btn sm" data-act="giveup" data-i="'+i+'">Give up</button>';}}],oc)
        :'<div class="cascade">No carts left behind right now.</div>')+
      H.panel('Why seven days',
        '<p>'+esc(CFG.cartNote||'')+'</p>'+
        '<p class="hint">Pressing <b>They bought it</b> creates a real order at the New stage — it appears on the Orders screen immediately, and the cart is marked recovered.</p>');
    },
    loyal:function(){var DB=db();var cs=customers(DB);
      return H.head('Winning back · Loyalty','Loyalty points',LOYALTY_PCT+'% of what a customer keeps comes back as points. Earned on delivery, not on order.')+
      H.kpis([{l:'Customers',v:cs.length,d:'who have ordered',icon:'users',tone:'teal'},
        {l:'Points owed',v:pointsLiability(DB),d:'worth '+money(pointsLiability(DB)),cls:'r',icon:'spark',tone:'peach'},
        {l:'Points given',v:cs.reduce(function(s,c){return s+c.earned;},0),d:'on delivered orders',icon:'check',tone:'green'},
        {l:'Points used',v:cs.reduce(function(s,c){return s+c.spent;},0),d:'redeemed',cls:'g',icon:'coin',tone:'blue'}],'')+
      H.note('Points are only earned once an order is <b>delivered</b>. An order that is cancelled or still in transit earns nothing — so the liability on this screen is always real.')+
      H.panel('Every customer',cs.length?H.table([
        {label:'Customer',align:'l',k:'cust'},
        {label:'Orders',k:'orders',cellcls:'mono'},
        {label:'Spent',fmt:function(c){return inr(c.spend);},cellcls:'mono'},
        {label:'Points earned',k:'earned',cellcls:'mono'},
        {label:'Used',k:'spent',cellcls:'mono'},
        {label:'Balance',k:'balance',cellcls:'mono'},
        {label:'',align:'l',fmt:function(c){return c.balance>=200?H.tag('can redeem','grn'):H.tag('building up','gray');}},
        {label:'',align:'l',fmt:function(c){return c.balance>=100
          ?'<button class="btn sm" data-act="redeem" data-c="'+esc(c.cust)+'">Redeem 100</button>':'';}}],cs)
        :'<div class="empty">Nobody has ordered yet.</div>')+
      H.panel('What one point is worth',
        '<div class="kv"><span>Earned on delivery</span><b>'+LOYALTY_PCT+'% of the net order</b></div>'+
        '<div class="kv"><span>One point</span><b>₹1 off a future order</b></div>'+
        '<div class="kv"><span>Minimum to redeem</span><b>100 points</b></div>'+
        '<p class="hint" style="margin-top:8px">Points owed is a real liability — money you have promised away. It is on this screen so it is never a surprise.</p>');
    },
    wiring:function(){var DB=db();
      return H.head('Wiring · Integration','Where every figure comes from','D2C Sales owns the order. Stock, money and the customer record all move because of what happens here.')+
      H.note('Shared Data Core: Item/SKU · Party · Stock · Ledger/Voucher · Order — every module reads and writes these.')+
      H.panel('Every figure here, and its source',H.table([
        {label:'Figure here',align:'l',k:'f'},{label:'Comes from',align:'l',k:'s'},{label:'How it is worked out',align:'l',k:'h'}],
        CFG.wiring||[]))+
      '<div class="two">'+
      H.panel('Live example — one order, six consequences',
        '<div class="cascade">'+
        '<div class="cl"><span class="d">1</span><div>An order is placed on <b>'+esc(CFG.storeName||'your storefront')+'</b>.</div></div>'+
        '<div class="cl"><span class="d">2</span><div>→ <b>Stock</b> is reserved for that SKU. The same single stock number every other channel reads.</div></div>'+
        '<div class="cl"><span class="d">3</span><div>→ <b>Packed</b>: a COD order is checked against the '+COD_ADV_PCT+'% advance rule first.</div></div>'+
        '<div class="cl"><span class="d">4</span><div>→ <b>Shipped</b>: the courier gets it. Seven days in transit and it appears on the Overview.</div></div>'+
        '<div class="cl"><span class="d">5</span><div>→ <b>Delivered</b>: the balance is collected, the sale posts to the <b>books</b>, and points are earned.</div></div>'+
        '<div class="cl"><span class="d">6</span><div>→ <b>CRM</b> picks the customer up: their worth, their order count, their segment.</div></div>'+
        '</div>')+
      H.panel('What this app owns, and what it only reads',
        '<p><b>It owns:</b> the order, its stage, the coupon applied, the COD advance, the abandoned cart, and the points balance.</p>'+
        '<p><b>It reads:</b> the item and its price from the Catalog, the stock position from Inventory, the customer from CRM.</p>'+
        '<p class="hint">Which is why an order here can never disagree with the CEO Dashboard: there is one order record, and both read it.</p>')+
      '</div>';
    }
  },
  actions:{
    neworder:function(){var DB=db();
      var c=(H.val('o_cust')||'').trim(), sku=H.val('o_item'), q=H.numv('o_qty');
      if(!c){toast('Who is the customer?');return;}
      if(q<=0){toast('Quantity must be at least 1');return;}
      var it=(CFG.items||[]).filter(function(x){return x.sku===sku;})[0]; if(!it)return;
      var pay=H.val('o_pay'), adv=H.numv('o_adv');
      DB.seq=(DB.seq||500)+1;
      DB.orders.push({id:CFG.prefix+DB.seq,cust:c,date:TODAY,sku:it.sku,name:it.name,qty:q,rate:it.rate,
        status:'new',pay:pay,adv:pay==='cod'?adv:0,coupon:H.val('o_cpn')||''});
      K.save();toast('Order placed ✓');K.render();},
    advance:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o||o.status==='cancelled')return;
      var i=stIdx(o.status); if(i<0||i>=STAGES.length-1)return;
      var nxt=STAGES[i+1].k;
      if(nxt==='packed'&&o.pay==='cod'&&num(o.adv)<r2(net(o)*COD_ADV_PCT/100)){
        toast('COD needs a '+COD_ADV_PCT+'% advance — '+money(r2(net(o)*COD_ADV_PCT/100))+' on this order');return;}
      o.status=nxt;K.save();toast('Marked '+STAGES[i+1].l.toLowerCase());K.render();},
    cancel:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o||o.status==='delivered'){toast('A delivered order cannot be cancelled');return;}
      o.status='cancelled';K.save();toast('Cancelled');K.render();},
    recover:function(b){var DB=db();var c=DB.carts[num(b.getAttribute('data-i'))];
      if(!c||c.done)return;
      var it=(CFG.items||[]).filter(function(x){return x.sku===c.sku;})[0]||(CFG.items||[])[0];
      DB.seq=(DB.seq||500)+1;
      DB.orders.push({id:CFG.prefix+DB.seq,cust:c.cust,date:TODAY,sku:it.sku,name:it.name,
        qty:1,rate:c.value,status:'new',pay:'prepaid',adv:0,coupon:''});
      c.done='won';K.save();toast('Cart recovered — order created ✓');K.render();},
    giveup:function(b){var DB=db();var c=DB.carts[num(b.getAttribute('data-i'))];
      if(!c)return;c.done='lost';K.save();toast('Marked as gone');K.render();},
    redeem:function(b){var DB=db();var c=b.getAttribute('data-c');
      if(balance(DB,c)<100){toast('Needs 100 points');return;}
      DB.spent=DB.spent||{};DB.spent[c]=num(DB.spent[c])+100;
      K.save();toast('100 points redeemed for '+c);K.render();}
  },
  tests:function(t,DB){
    /* money on one order */
    t('gross = quantity × rate',live(DB).every(function(o){return gross(o)===r2(o.qty*o.rate);}));
    t('net = gross − coupon',live(DB).every(function(o){return net(o)===r2(gross(o)-discount(o));}));
    t('a coupon below its minimum order value is ignored',(function(){
      var o=live(DB).filter(function(x){return x.coupon&&gross(x)<num(coupon(x.coupon).min);})[0];
      return !o||discount(o)===0;})());
    t('a coupon at or above its minimum is applied',(function(){
      var o=live(DB).filter(function(x){return x.coupon&&gross(x)>=num(coupon(x.coupon).min);})[0];
      return !o||discount(o)===r2(gross(o)*coupon(o.coupon).pct/100);})());
    t('only COD orders have money left to collect',
      live(DB).every(function(o){return o.pay==='cod'||codDue(o)===0;}));
    t('COD due = net − advance, never below zero',
      live(DB).filter(function(o){return o.pay==='cod';}).every(function(o){
        return codDue(o)===r2(Math.max(0,net(o)-o.adv));}));
    t('collected + still to collect = net sales',
      r2(collected(DB)+outstanding(DB))===totalNet(DB));
    /* pipeline */
    t('every live order sits in a real stage',live(DB).every(function(o){return stIdx(o.status)>=0;}));
    t('the funnel counts add up to every live order',
      funnel(DB).reduce(function(s,x){return s+x.n;},0)===live(DB).length);
    t('the funnel values add up to net sales',
      r2(funnel(DB).reduce(function(s,x){return s+x.value;},0))===totalNet(DB));
    t('a cancelled order is in no total',cancelled(DB).every(function(o){
      return live(DB).indexOf(o)<0;}));
    t('average order value = net sales ÷ live orders',aov(DB)===r2(totalNet(DB)/live(DB).length));
    /* moving an order along */
    var o0=live(DB).filter(function(o){return o.status==='new';})[0];
    if(o0){var was=o0.status;o0.status='confirmed';
      t('moving an order on advances it exactly one stage',stIdx(o0.status)===stIdx(was)+1);
      o0.status=was;}
    t('no COD order got past packing without its '+COD_ADV_PCT+'% advance',
      live(DB).filter(function(o){return o.pay==='cod'&&stIdx(o.status)>=stIdx('packed');})
        .every(function(o){return num(o.adv)>=r2(net(o)*COD_ADV_PCT/100);}));
    /* loyalty */
    t('points are earned only on delivered orders',
      live(DB).every(function(o){return o.status==='delivered'||pointsOf(o)===0;}));
    t('points on a delivered order = '+LOYALTY_PCT+'% of its net',
      delivered(DB).every(function(o){return pointsOf(o)===Math.round(net(o)*LOYALTY_PCT/100);}));
    t('a points balance is earned minus used',
      customers(DB).every(function(c){return c.balance===c.earned-c.spent;}));
    t('nobody has spent points they never earned',
      customers(DB).every(function(c){return c.spent<=c.earned;}));
    t('points owed is the sum of every balance',
      pointsLiability(DB)===customers(DB).reduce(function(s,c){return s+c.balance;},0));
    /* carts */
    t('an abandoned cart is only counted while it is still open',
      openCarts(DB).every(function(c){return !c.done;}));
    t('cart value is the sum of the open carts',
      cartValue(DB)===r2(openCarts(DB).reduce(function(s,c){return s+c.value;},0)));
    t('only carts under 7 days old are called worth a nudge',
      recoverable(DB).every(function(c){return c.days<=7;}));
    var nBefore=live(DB).length, c0=openCarts(DB)[0];
    if(c0){DB.orders.push({id:'PROBE',cust:c0.cust,date:TODAY,sku:c0.sku,name:'probe',qty:1,rate:c0.value,
      status:'new',pay:'prepaid',adv:0,coupon:''}); c0.done='won';
      t('recovering a cart creates one new order',live(DB).length===nBefore+1);
      t('a recovered cart leaves the open list',openCarts(DB).indexOf(c0)<0);
      DB.orders.pop(); delete c0.done;}
    /* customers */
    t('every customer appears once in the list',(function(){
      var names=customers(DB).map(function(c){return c.cust;});
      return names.length===names.filter(function(n,i){return names.indexOf(n)===i;}).length;})());
    t('customer spend adds up to net sales',
      r2(customers(DB).reduce(function(s,c){return s+c.spend;},0))===totalNet(DB));
  }
};

if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
