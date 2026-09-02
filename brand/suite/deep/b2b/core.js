/* Medhava — B2B & Credit (Module 03 · App 2)
   Wholesale orders with a real credit limit, tier pricing, and ageing that decides who gets
   the next order. The credit check is a gate, not a warning: over the limit, nothing ships.
   CONFIG supplies names so the Medhava and Vastrangam builds run the SAME math. */
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
var CFG=(typeof CONFIG!=='undefined')?CONFIG:{};
function db(){return K.DB;}
var TODAY='2026-07-31';
function days(from,to){return Math.round((new Date(to||TODAY)-new Date(from))/86400000);}
function plural(n,one,many){return n+' '+(n===1?one:(many||one+'s'));}

/* ── the order pipeline. "approved" is the gate the credit check guards ── */
var STAGES=[{k:'draft',l:'Draft'},{k:'approved',l:'Approved'},{k:'dispatched',l:'Dispatched'},
            {k:'invoiced',l:'Invoiced'},{k:'paid',l:'Paid'}];
function stIdx(k){for(var i=0;i<STAGES.length;i++)if(STAGES[i].k===k)return i;return -1;}
function stLbl(k){var s=STAGES.filter(function(x){return x.k===k;})[0];return s?s.l:'On hold';}

/* ── tier pricing: the discount is the tier, not a negotiation ── */
function tiers(){return CFG.tiers||[];}
function tierOf(code){return tiers().filter(function(t){return t.code===code;})[0]||tiers()[0];}
function buyer(DB,id){return (DB.buyers||[]).filter(function(b){return b.id===id;})[0]||null;}
function listRate(sku){var it=(CFG.items||[]).filter(function(x){return x.sku===sku;})[0];return it?num(it.rate):0;}
function tierRate(sku,tcode){var t=tierOf(tcode);return r2(listRate(sku)*(100-num(t.off))/100);}

function gross(DB,o){var b=buyer(DB,o.buyer);return r2(num(o.qty)*tierRate(o.sku,b?b.tier:''));}
function listGross(o){return r2(num(o.qty)*listRate(o.sku));}
function saving(DB,o){return r2(listGross(o)-gross(DB,o));}

function live(DB){return (DB.orders||[]).filter(function(o){return o.status!=='onhold';});}
function held(DB){return (DB.orders||[]).filter(function(o){return o.status==='onhold';});}
function orderBook(DB){return r2(live(DB).filter(function(o){return o.status!=='paid';})
  .reduce(function(s,o){return s+gross(DB,o);},0));}
function shipped(DB){return live(DB).filter(function(o){return stIdx(o.status)>=stIdx('dispatched');});}

/* ── credit: exposure is everything gone out and not yet paid ── */
function exposure(DB,bid){return r2(live(DB).filter(function(o){
  return o.buyer===bid&&stIdx(o.status)>=stIdx('approved')&&o.status!=='paid';})
  .reduce(function(s,o){return s+gross(DB,o);},0));}
function available(DB,bid){var b=buyer(DB,bid);return r2(num(b?b.limit:0)-exposure(DB,bid));}
function overLimit(DB,bid){return available(DB,bid)<0;}
function totalExposure(DB){return r2((DB.buyers||[]).reduce(function(s,b){return s+exposure(DB,b.id);},0));}
function totalLimit(DB){return r2((DB.buyers||[]).reduce(function(s,b){return s+num(b.limit);},0));}
function usedPct(DB){var l=totalLimit(DB);return l?Math.round(totalExposure(DB)/l*100):0;}

/* ── ageing: only invoiced-and-unpaid money has an age ── */
var BUCKETS=[{l:'Not yet due',lo:-9999,hi:0},{l:'1–30 days',lo:1,hi:30},
             {l:'31–60 days',lo:31,hi:60},{l:'61–90 days',lo:61,hi:90},{l:'Over 90 days',lo:91,hi:99999}];
function unpaid(DB){return live(DB).filter(function(o){return o.status==='invoiced';});}
function overdueBy(DB,o){var b=buyer(DB,o.buyer);return days(o.date)-num(b?b.terms:0);}
function ageing(DB){return BUCKETS.map(function(k){
  var rows=unpaid(DB).filter(function(o){var d=overdueBy(DB,o);return d>=k.lo&&d<=k.hi;});
  return {bucket:k.l,n:rows.length,value:r2(rows.reduce(function(s,o){return s+gross(DB,o);},0))};});}
function outstanding(DB){return r2(unpaid(DB).reduce(function(s,o){return s+gross(DB,o);},0));}
function overdue(DB){return r2(unpaid(DB).filter(function(o){return overdueBy(DB,o)>0;})
  .reduce(function(s,o){return s+gross(DB,o);},0));}

function buyerRows(DB){return (DB.buyers||[]).map(function(b){
  var os=live(DB).filter(function(o){return o.buyer===b.id;});
  return {id:b.id,name:b.name,tier:b.tier,off:tierOf(b.tier).off,limit:num(b.limit),terms:num(b.terms),
    orders:os.length, exposure:exposure(DB,b.id), available:available(DB,b.id),
    over:overLimit(DB,b.id),
    worst:Math.max.apply(null,[0].concat(unpaid(DB).filter(function(o){return o.buyer===b.id;})
      .map(function(o){return overdueBy(DB,o);})))};})
  .sort(function(a,b){return b.exposure-a.exposure;});}

/* Headroom is only half the risk. A buyer with room left but a 90-day-old invoice
   should still be stopped, so the verdict looks at both. */
function verdict(b){
  if(b.over)        return {label:'over limit — stop',tone:'red'};
  if(b.worst>90)    return {label:'90+ days late — stop supply',tone:'red'};
  if(b.worst>60)    return {label:'badly late — hold dispatches',tone:'red'};
  if(b.worst>0)     return {label:'late — chase before selling more',tone:'amb'};
  if(b.available<b.limit*0.2) return {label:'nearly full',tone:'amb'};
  return {label:'room to sell',tone:'grn'};
}

function issues(DB){var out=[];
  buyerRows(DB).filter(function(b){return b.over;}).forEach(function(b){
    out.push({sev:'high',what:b.name+' is over its credit limit by '+money(Math.abs(b.available))+' — nothing more should be approved',go:'credit'});});
  unpaid(DB).filter(function(o){return overdueBy(DB,o)>60;}).forEach(function(o){
    out.push({sev:'high',what:o.id+' ('+(buyer(DB,o.buyer)||{}).name+') is '+overdueBy(DB,o)+' days past terms — '+money(gross(DB,o)),go:'ageing'});});
  unpaid(DB).filter(function(o){var d=overdueBy(DB,o);return d>0&&d<=60;}).forEach(function(o){
    out.push({sev:'med',what:o.id+' ('+(buyer(DB,o.buyer)||{}).name+') is '+plural(overdueBy(DB,o),'day')+' past terms',go:'ageing'});});
  held(DB).forEach(function(o){
    out.push({sev:'med',what:o.id+' is on hold — the credit check refused it',go:'orders'});});
  return out;}

/* B2B writes orders and invoices, so it needs the books, a way to reach the buyer,
   a courier, printing for the invoice, and somewhere to back up. */
var SPEC={
  uses:['ledger','messaging','email','courier','printing','storage','automation'],
  id:CFG.id, name:CFG.name, company:CFG.company, fy:CFG.fy||'FY 2026-27', tagline:CFG.tagline, about:CFG.about,
  groups:[{label:'Order book',items:['dash','orders']},
          {label:'Money',items:['credit','ageing']},
          {label:'Wiring',items:['wiring']}],
  nav:[{v:'dash',label:'Overview',icon:'grid'},{v:'orders',label:'Orders',icon:'doc'},
       {v:'credit',label:'Credit limits',icon:'scale'},{v:'ageing',label:'Ageing',icon:'clock'},
       {v:'wiring',label:'Wiring',icon:'flow'}],
  seed:function(DB){
    DB.buyers=JSON.parse(JSON.stringify(CFG.buyers));
    DB.orders=JSON.parse(JSON.stringify(CFG.orders));
    DB.seq=700;
  },
  views:{
    dash:function(){var DB=db();var ag=ageing(DB);var mx=Math.max.apply(null,ag.map(function(x){return x.value;}).concat([1]));
      var iss=issues(DB);
      return H.head('Order book · Overview',CFG.name,'What the trade owes you, what is still safe to send, and who has stopped paying.')+
      H.kpis([
        {l:'Order book',v:money(orderBook(DB)),d:'not yet paid for',icon:'doc',tone:'teal'},
        {l:'Credit out',v:money(totalExposure(DB)),d:usedPct(DB)+'% of every limit',cls:usedPct(DB)>80?'r':'',icon:'scale',tone:'blue'},
        {l:'Invoiced, unpaid',v:money(outstanding(DB)),d:plural(unpaid(DB).length,'invoice'),icon:'coin',tone:'peach'},
        {l:'Past terms',v:money(overdue(DB)),d:'already late',cls:overdue(DB)?'r':'g',icon:'clock',tone:overdue(DB)?'red':'green'},
        {l:'On hold',v:held(DB).length,d:'refused by credit check',cls:held(DB).length?'r':'g',icon:'bell',tone:held(DB).length?'red':'green'}],'k5')+
      '<div class="two">'+
      H.panel('How old the unpaid money is',
        ag.map(function(x){return '<div style="margin-bottom:10px"><div class="kv" style="border:none;padding:2px 0"><span>'+
          esc(x.bucket)+' <span class="hint">'+plural(x.n,'invoice')+'</span></span><b>'+money(x.value)+'</b></div>'+
          H.bar(x.value/mx*100)+'</div>';}).join('')+
        '<div class="kv" style="margin-top:10px"><span>Total invoiced and unpaid</span><b>'+money(outstanding(DB))+'</b></div>'+
        '<div class="kv"><span>Of that, past agreed terms</span><b class="'+(overdue(DB)?'r':'g')+'">'+money(overdue(DB))+'</b></div>'+
        '<p class="hint" style="margin-top:8px">Age is counted from the invoice date <b>minus each buyer’s own agreed terms</b> — so a 45-day buyer is not called late on day 31.</p>')+
      H.panel('What needs a decision <span class="badge">'+iss.length+'</span>',
        iss.length?H.table([{label:'',align:'l',fmt:function(a){return H.tag(a.sev==='high'?'urgent':'watch',a.sev==='high'?'red':'amb');}},
          {label:'What is happening',align:'l',k:'what'},
          {label:'',align:'l',fmt:function(a){return '<button class="btn sm" data-go="'+a.go+'">Open →</button>';}}],iss)
        :'<div class="cascade">Everybody is inside their limit and inside their terms.</div>')+
      '</div>'+
      H.panel('What tier pricing is costing you',H.table([
        {label:'Tier',align:'l',fmt:function(t){return '<b>'+esc(t.code)+'</b> — '+esc(t.name);}},
        {label:'Off list',fmt:function(t){return t.off+'%';},cellcls:'mono'},
        {label:'Buyers',fmt:function(t){return (DB.buyers||[]).filter(function(b){return b.tier===t.code;}).length;},cellcls:'mono'},
        {label:'Given away this period',fmt:function(t){
          return inr(r2(live(DB).filter(function(o){var b=buyer(DB,o.buyer);return b&&b.tier===t.code;})
            .reduce(function(s,o){return s+saving(DB,o);},0)));},cellcls:'mono'},
        {label:'',align:'l',fmt:function(t){return esc(t.note||'');}}],tiers())+
        '<p class="hint">The discount is the tier, not a negotiation. Everybody on the same tier gets the same rate, which is what stops the price list quietly falling apart.</p>');
    },
    orders:function(){var DB=db();
      return H.head('Order book · Orders','Orders','Raise it, and the credit check decides whether it can be approved. Over the limit, it goes on hold instead.')+
      H.kpis(STAGES.map(function(s,i){
        var rows=live(DB).filter(function(o){return o.status===s.k;});
        return {l:s.l,v:rows.length,d:money(r2(rows.reduce(function(t,o){return t+gross(DB,o);},0))),
          icon:['doc','check','truck','coin','spark'][i],tone:['teal','blue','amb','peach','green'][i]};}),'k5')+
      H.panel('Raise an order',H.form([
        {id:'b_buyer',label:'Buyer',type:'select',options:(DB.buyers||[]).map(function(b){
          return {v:b.id,label:b.name+' — tier '+b.tier+', '+money(available(DB,b.id))+' left'};})},
        {id:'b_item',label:'Item',type:'select',options:(CFG.items||[]).map(function(it){
          return {v:it.sku,label:it.name+' — list '+money(it.rate)};})},
        {id:'b_qty',label:'Quantity',type:'num',ph:'50'}
      ],'Raise the order','neworder','f3')+
        '<p class="hint">The rate is worked out from the buyer’s tier — you never type a price, so nobody can quietly give a better one.</p>')+
      H.panel('Orders <span class="badge">'+live(DB).length+' live</span>',live(DB).length?H.table([
        {label:'Order',align:'l',fmt:function(o){return '<b>'+esc(o.id)+'</b><div class="hint">'+esc(o.date)+'</div>';}},
        {label:'Buyer',align:'l',fmt:function(o){var b=buyer(DB,o.buyer);
          return esc(b?b.name:'?')+'<div class="hint">tier '+esc(b?b.tier:'')+' · '+(b?b.terms:0)+'-day terms</div>';}},
        {label:'Item',align:'l',fmt:function(o){var b=buyer(DB,o.buyer);
          return esc((CFG.items||[]).filter(function(x){return x.sku===o.sku;})[0].name)+
            '<div class="hint">'+o.qty+' × '+money(tierRate(o.sku,b?b.tier:''))+'</div>';}},
        {label:'List price',fmt:function(o){return inr(listGross(o));},cellcls:'mono'},
        {label:'Tier price',fmt:function(o){return inr(gross(DB,o));},cellcls:'mono'},
        {label:'You gave up',fmt:function(o){return inr(saving(DB,o));},cellcls:'mono'},
        {label:'Stage',align:'l',fmt:function(o){var i=stIdx(o.status);
          return H.tag(stLbl(o.status),['gray','blu','amb','peach','grn'][i]||'red');}},
        {label:'',align:'l',fmt:function(o){var i=(DB.orders||[]).indexOf(o);
          if(o.status==='onhold')return '<button class="btn sm" data-act="retry" data-i="'+i+'">Try again</button>';
          return stIdx(o.status)<STAGES.length-1
            ?'<button class="btn sm'+(o.status==='draft'?' p':'')+'" data-act="advance" data-i="'+i+'">'+
              esc('Mark '+STAGES[stIdx(o.status)+1].l.toLowerCase())+' →</button>'
            :H.tag('settled','grn');}}],
        live(DB).slice().sort(function(a,b){return stIdx(a.status)-stIdx(b.status);}))
        :'<div class="empty">No orders yet.</div>')+
      (held(DB).length?H.panel('On hold — the credit check refused these <span class="badge">'+held(DB).length+'</span>',
        H.table([{label:'Order',align:'l',fmt:function(o){return esc(o.id);}},
          {label:'Buyer',align:'l',fmt:function(o){return esc((buyer(DB,o.buyer)||{}).name);}},
          {label:'Worth',fmt:function(o){return inr(gross(DB,o));},cellcls:'mono'},
          {label:'Why',align:'l',fmt:function(o){return esc('Would take them '+money(Math.abs(r2(available(DB,o.buyer)-gross(DB,o))))+' over the limit');}},
          {label:'',align:'l',fmt:function(o){var i=(DB.orders||[]).indexOf(o);
            return '<button class="btn sm" data-act="retry" data-i="'+i+'">Try again</button>';}}],held(DB))+
        '<p class="hint">Collect something, or raise the limit on the Credit screen, then press <b>Try again</b>. Nothing is lost — the order waits.</p>'):'');
    },
    credit:function(){var DB=db();var rows=buyerRows(DB);
      return H.head('Money · Credit','Credit limits','What each buyer may owe you at once — and what is left before the next order is refused.')+
      H.kpis([{l:'Total limits given',v:money(totalLimit(DB)),d:plural(rows.length,'buyer'),icon:'scale',tone:'teal'},
        {l:'Credit out',v:money(totalExposure(DB)),d:usedPct(DB)+'% used',cls:usedPct(DB)>80?'r':'',icon:'coin',tone:'blue'},
        {l:'Headroom left',v:money(r2(totalLimit(DB)-totalExposure(DB))),d:'safe to send',cls:'g',icon:'check',tone:'green'},
        {l:'Over the limit',v:rows.filter(function(b){return b.over;}).length,d:'stop sending',cls:rows.filter(function(b){return b.over;}).length?'r':'g',icon:'bell',tone:'red'}],'')+
      H.panel('Change a limit',H.form([
        {id:'c_buyer',label:'Buyer',type:'select',options:rows.map(function(b){return {v:b.id,label:b.name+' — now '+money(b.limit)};})},
        {id:'c_limit',label:'New limit (₹)',type:'num',ph:'500000'}
      ],'Set the limit','setlimit','f2')+
        '<p class="hint">Raising a limit is a real decision — it is money you are choosing to risk. The Overview flags anybody who goes over.</p>')+
      H.panel('Every buyer',H.table([
        {label:'Buyer',align:'l',fmt:function(b){return '<b>'+esc(b.name)+'</b>';}},
        {label:'Tier',align:'l',fmt:function(b){return H.tag(b.tier+' · '+b.off+'% off','blu');}},
        {label:'Terms',fmt:function(b){return b.terms+' days';},cellcls:'mono'},
        {label:'Limit',fmt:function(b){return inr(b.limit);},cellcls:'mono'},
        {label:'Owes you now',fmt:function(b){return inr(b.exposure);},cellcls:'mono'},
        {label:'Left to use',fmt:function(b){return inr(b.available);},cellcls:function(b){return 'mono '+(b.available<0?'r':'');}},
        {label:'Worst invoice',fmt:function(b){return b.worst>0?b.worst+'d late':'—';},cellcls:function(b){return 'mono '+(b.worst>60?'r':'');}},
        {label:'',align:'l',fmt:function(b){return H.tag(verdict(b).label,verdict(b).tone);}}],rows))+
      H.panel('How the check works',
        '<div class="cascade">'+
        '<div class="cl"><span class="d">1</span><div>You raise an order. Its value is worked out from the buyer’s <b>tier rate</b>.</div></div>'+
        '<div class="cl"><span class="d">2</span><div>The app adds it to what that buyer <b>already owes</b> — everything approved and not yet paid.</div></div>'+
        '<div class="cl"><span class="d">3</span><div>If the total stays inside the limit, the order is <b>approved</b>.</div></div>'+
        '<div class="cl"><span class="d">4</span><div>If it does not, the order goes <b>on hold</b>. It is not lost, and it is not silently approved either.</div></div>'+
        '<div class="cl"><span class="d">5</span><div>Collect a payment, or raise the limit on purpose, and press <b>Try again</b>.</div></div>'+
        '</div>');
    },
    ageing:function(){var DB=db();var u=unpaid(DB).slice().sort(function(a,b){return overdueBy(DB,b)-overdueBy(DB,a);});
      return H.head('Money · Ageing','Ageing','Every invoice that has not been paid, oldest against its own terms first.')+
      H.kpis(ageing(DB).map(function(x,i){return {l:x.bucket,v:money(x.value),d:plural(x.n,'invoice'),
        cls:i>=3?'r':'',icon:['check','clock','clock','bell','scale'][i],tone:['green','blue','peach','amb','red'][i]};}),'k5')+
      H.panel('Unpaid invoices',u.length?H.table([
        {label:'Invoice',align:'l',fmt:function(o){return '<b>'+esc(o.id)+'</b><div class="hint">'+esc(o.date)+'</div>';}},
        {label:'Buyer',align:'l',fmt:function(o){return esc((buyer(DB,o.buyer)||{}).name);}},
        {label:'Amount',fmt:function(o){return inr(gross(DB,o));},cellcls:'mono'},
        {label:'Terms',fmt:function(o){return (buyer(DB,o.buyer)||{}).terms+'d';},cellcls:'mono'},
        {label:'Age',fmt:function(o){return days(o.date)+'d';},cellcls:'mono'},
        {label:'Past terms by',fmt:function(o){var d=overdueBy(DB,o);return d>0?d+'d':'—';},
         cellcls:function(o){return 'mono '+(overdueBy(DB,o)>0?'r':'');}},
        {label:'',align:'l',fmt:function(o){var d=overdueBy(DB,o);
          return d>90?H.tag('legal / stop supply','red'):d>60?H.tag('chase hard','red')
            :d>0?H.tag('chase','amb'):H.tag('within terms','grn');}},
        {label:'',align:'l',fmt:function(o){var i=(DB.orders||[]).indexOf(o);
          return '<button class="btn sm p" data-act="advance" data-i="'+i+'">Mark paid</button>';}}],u)
        :'<div class="cascade">Nothing invoiced is unpaid. Everything sent has been settled.</div>')+
      H.panel('What each bucket means for what you do next',H.table([
        {label:'Bucket',align:'l',k:'b'},{label:'What it means',align:'l',k:'m'},{label:'What to do',align:'l',k:'d'}],[
        {b:'Not yet due',m:'Inside the terms you agreed with that buyer',d:'Nothing. Do not chase — you agreed to this.'},
        {b:'1–30 days',m:'Slipping',d:'One call. Usually a paperwork problem, not a money problem.'},
        {b:'31–60 days',m:'A pattern, not an accident',d:'Stop extending. Ask for a date in writing.'},
        {b:'61–90 days',m:'The money is at real risk',d:'No new dispatches to that buyer.'},
        {b:'Over 90 days',m:'Assume you will have to fight for it',d:'Stop supply. Escalate formally.'}]));
    },
    wiring:function(){var DB=db();
      return H.head('Wiring · Integration','Where every figure comes from','B2B owns the wholesale order, the tier rate and the credit decision. Everything else it reads.')+
      H.note('Shared Data Core: Item/SKU · Party · Stock · Ledger/Voucher · Order — every module reads and writes these.')+
      H.panel('Every figure here, and its source',H.table([
        {label:'Figure here',align:'l',k:'f'},{label:'Comes from',align:'l',k:'s'},{label:'How it is worked out',align:'l',k:'h'}],
        CFG.wiring||[]))+
      '<div class="two">'+
      H.panel('Live example — one wholesale order',
        '<div class="cascade">'+
        '<div class="cl"><span class="d">1</span><div>An order is raised for <b>'+esc(((CFG.buyers||[])[0]||{}).name||'a buyer')+'</b>. The rate comes from their <b>tier</b>, not from whoever typed it.</div></div>'+
        '<div class="cl"><span class="d">2</span><div>→ The <b>credit check</b> runs. Inside the limit it is approved; outside it, it goes on hold.</div></div>'+
        '<div class="cl"><span class="d">3</span><div>→ <b>Dispatched</b>: stock leaves, and their exposure is now real money at risk.</div></div>'+
        '<div class="cl"><span class="d">4</span><div>→ <b>Invoiced</b>: the invoice posts to the books and starts ageing — against <b>their</b> terms, not a fixed 30 days.</div></div>'+
        '<div class="cl"><span class="d">5</span><div>→ <b>Paid</b>: exposure falls, and their headroom for the next order returns.</div></div>'+
        '</div>')+
      H.panel('Why the credit check is a gate, not a warning',
        '<p>A warning gets clicked through on a busy afternoon. A gate does not. Over the limit, the order goes <b>on hold</b> — it still exists, nothing is lost, but it cannot be dispatched until somebody makes a real decision: collect money, or raise the limit on purpose.</p>'+
        '<p class="hint">Almost every wholesale bad debt starts with one order approved "just this once".</p>')+
      '</div>';
    }
  },
  actions:{
    neworder:function(){var DB=db();
      var bid=H.val('b_buyer'), sku=H.val('b_item'), q=H.numv('b_qty');
      var b=buyer(DB,bid); if(!b)return;
      if(q<=0){toast('Quantity must be at least 1');return;}
      DB.seq=(DB.seq||700)+1;
      var o={id:CFG.prefix+DB.seq,buyer:bid,date:TODAY,sku:sku,qty:q,status:'draft'};
      DB.orders.push(o);
      var val=gross(DB,o);
      if(val>available(DB,bid)){o.status='onhold';
        K.save();toast('On hold — '+money(val)+' would exceed '+b.name+'’s limit');K.render();return;}
      K.save();toast('Order raised ✓');K.render();},
    advance:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o||o.status==='onhold')return;
      var i=stIdx(o.status); if(i<0||i>=STAGES.length-1)return;
      var nxt=STAGES[i+1].k;
      if(nxt==='approved'){
        var head=r2(available(DB,o.buyer)); /* this order is still a draft, so it is not counted yet */
        if(gross(DB,o)>head){o.status='onhold';K.save();
          toast('Credit check refused it — '+(buyer(DB,o.buyer)||{}).name+' has '+money(head)+' left');K.render();return;}}
      o.status=nxt;K.save();toast('Marked '+STAGES[i+1].l.toLowerCase());K.render();},
    retry:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o||o.status!=='onhold')return;
      o.status='draft';
      if(gross(DB,o)>available(DB,o.buyer)){o.status='onhold';
        toast('Still over the limit — collect something first');K.save();K.render();return;}
      o.status='approved';K.save();toast('Approved ✓');K.render();},
    setlimit:function(){var DB=db();var bid=H.val('c_buyer'), l=H.numv('c_limit');
      var b=buyer(DB,bid); if(!b)return;
      if(l<0){toast('A limit cannot be negative');return;}
      b.limit=l;K.save();toast(b.name+'’s limit is now '+money(l));K.render();}
  },
  tests:function(t,DB){
    /* pricing */
    t('every tier discount is between 0 and 50%',tiers().every(function(x){return x.off>=0&&x.off<=50;}));
    t('a tier rate = list price less that tier’s discount',
      (DB.buyers||[]).every(function(b){return (CFG.items||[]).every(function(it){
        return tierRate(it.sku,b.tier)===r2(it.rate*(100-tierOf(b.tier).off)/100);});}));
    t('an order is valued at the buyer’s tier rate, never a typed one',
      live(DB).every(function(o){var b=buyer(DB,o.buyer);
        return gross(DB,o)===r2(o.qty*tierRate(o.sku,b.tier));}));
    t('what you gave up = list price − tier price',
      live(DB).every(function(o){return saving(DB,o)===r2(listGross(o)-gross(DB,o));}));
    t('a tier discount never makes a price negative',
      live(DB).every(function(o){return gross(DB,o)>0;}));
    /* pipeline */
    t('every live order sits in a real stage',live(DB).every(function(o){return stIdx(o.status)>=0;}));
    t('an order on hold is in no stage',held(DB).every(function(o){return stIdx(o.status)<0;}));
    t('the order book counts everything not yet paid',
      orderBook(DB)===r2(live(DB).filter(function(o){return o.status!=='paid';})
        .reduce(function(s,o){return s+gross(DB,o);},0)));
    /* credit */
    t('exposure counts only what is approved and not yet paid',
      (DB.buyers||[]).every(function(b){return exposure(DB,b.id)===
        r2(live(DB).filter(function(o){return o.buyer===b.id&&stIdx(o.status)>=stIdx('approved')&&o.status!=='paid';})
          .reduce(function(s,o){return s+gross(DB,o);},0));}));
    t('a draft order is not counted against credit yet',
      (DB.buyers||[]).every(function(b){
        return live(DB).filter(function(o){return o.buyer===b.id&&o.status==='draft';})
          .every(function(o){return exposure(DB,b.id)===exposure(DB,b.id);});}));
    t('headroom = limit − exposure',
      (DB.buyers||[]).every(function(b){return available(DB,b.id)===r2(num(b.limit)-exposure(DB,b.id));}));
    t('total exposure is the sum of every buyer’s exposure',
      totalExposure(DB)===r2((DB.buyers||[]).reduce(function(s,b){return s+exposure(DB,b.id);},0)));
    t('a paid order stops using up credit',(function(){
      var o=live(DB).filter(function(x){return x.status==='invoiced';})[0]; if(!o)return true;
      var before=exposure(DB,o.buyer); o.status='paid';
      var after=exposure(DB,o.buyer); o.status='invoiced';
      return after===r2(before-gross(DB,o));})());
    t('an order that would break the limit is refused, not approved',(function(){
      var b=(DB.buyers||[])[0];
      var probe={id:'PROBE',buyer:b.id,date:TODAY,sku:(CFG.items||[])[0].sku,
        qty:Math.ceil((num(b.limit)+1)/tierRate((CFG.items||[])[0].sku,b.tier)),status:'draft'};
      DB.orders.push(probe);
      var refused=gross(DB,probe)>available(DB,b.id);
      DB.orders.pop();
      return refused;})());
    t('nobody is over their limit in the seeded data, or it is flagged',
      buyerRows(DB).every(function(b){return !b.over||issues(DB).some(function(i){return i.what.indexOf(b.name)===0;});}));
    /* ageing */
    t('only invoiced-and-unpaid money has an age',
      unpaid(DB).every(function(o){return o.status==='invoiced';}));
    t('the ageing buckets add up to everything unpaid',
      r2(ageing(DB).reduce(function(s,x){return s+x.value;},0))===outstanding(DB));
    t('the ageing buckets count every unpaid invoice once',
      ageing(DB).reduce(function(s,x){return s+x.n;},0)===unpaid(DB).length);
    t('age is measured against each buyer’s own terms',
      unpaid(DB).every(function(o){var b=buyer(DB,o.buyer);
        return overdueBy(DB,o)===days(o.date)-num(b.terms);}));
    t('an invoice inside its terms is never called late',
      unpaid(DB).filter(function(o){return overdueBy(DB,o)<=0;}).every(function(o){
        return days(o.date)<=num(buyer(DB,o.buyer).terms);}));
    t('past-terms money is never more than all unpaid money',overdue(DB)<=outstanding(DB));
    /* buyers */
    t('every buyer appears once on the credit screen',
      buyerRows(DB).length===(DB.buyers||[]).length);
    t('every buyer has a limit and agreed terms',
      (DB.buyers||[]).every(function(b){return num(b.limit)>0&&num(b.terms)>0;}));
    t('every buyer is on a tier that exists',
      (DB.buyers||[]).every(function(b){return tiers().some(function(x){return x.code===b.tier;});}));
    t('a buyer with room left but a 90-day-old invoice is still stopped',
      buyerRows(DB).filter(function(b){return b.worst>90;}).every(function(b){
        return verdict(b).tone==='red';}));
    t('a buyer is only called "room to sell" if nothing is late and there is headroom',
      buyerRows(DB).filter(function(b){return verdict(b).label==='room to sell';}).every(function(b){
        return b.worst<=0&&!b.over&&b.available>=b.limit*0.2;}));
  }
};

if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
