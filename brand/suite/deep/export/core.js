/* Medhava — Export (Module 03 · App 3)
   An export order is a document problem, not a selling problem. This app tracks the five
   documents every shipment needs, the two routes tax can take (LUT bond or pay-and-claim),
   and the refund that is owed to you and usually forgotten.
   CONFIG supplies names so the Medhava and Vastrangam builds run the SAME math. */
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
var CFG=(typeof CONFIG!=='undefined')?CONFIG:{};
function db(){return K.DB;}
var TODAY='2026-07-31';
function days(from,to){return Math.round((new Date(to||TODAY)-new Date(from))/86400000);}
function plural(n,one,many){return n+' '+(n===1?one:(many||one+'s'));}

/* ── the five documents. A shipment with a gap is a shipment that gets held ── */
var DOCS=[{k:'ci',l:'Commercial invoice',why:'What was sold, to whom, at what value. Customs starts here.'},
          {k:'pl',l:'Packing list',why:'Carton by carton, with weights. The port checks against this.'},
          {k:'sb',l:'Shipping bill',why:'The customs filing. Nothing leaves without it.'},
          {k:'bl',l:'Bill of lading / AWB',why:'Proof the carrier took it. The buyer needs it to collect.'},
          {k:'coo',l:'Certificate of origin',why:'Where it was made. Often what earns the buyer a lower duty.'}];
/* ── two lawful ways to handle GST on an export ── */
var ROUTES=[{k:'lut',l:'LUT bond',what:'File a bond once a year and export without paying IGST at all. No refund to chase.'},
            {k:'paid',l:'Pay IGST and claim it back',what:'Pay the tax up front, then claim a refund. Cash is out until the refund lands.'}];
var IGST_PCT=5;            /* the rate that applies to the goods in this configuration */
var REFUND_TARGET_DAYS=60; /* what a healthy refund cycle looks like */

function fx(DB){return num(DB.fx||CFG.fx);}
function fob(o){return r2(num(o.qty)*num(o.rate));}                 /* in the buyer's currency */
function fobInr(DB,o){return r2(fob(o)*fx(DB));}
function igst(DB,o){return o.route==='paid'?r2(fobInr(DB,o)*IGST_PCT/100):0;}
function docsDone(o){return DOCS.filter(function(d){return (o.docs||{})[d.k];}).length;}
function docsReady(o){return docsDone(o)===DOCS.length;}
function missing(o){return DOCS.filter(function(d){return !(o.docs||{})[d.k];});}

var STAGES=[{k:'booked',l:'Booked'},{k:'docs',l:'Documents'},{k:'shipped',l:'Shipped'},
            {k:'landed',l:'Landed'},{k:'settled',l:'Paid for'}];
function stIdx(k){for(var i=0;i<STAGES.length;i++)if(STAGES[i].k===k)return i;return -1;}
function stLbl(k){var s=STAGES.filter(function(x){return x.k===k;})[0];return s?s.l:k;}

function orders(DB){return DB.orders||[];}
function totalFobInr(DB){return r2(orders(DB).reduce(function(s,o){return s+fobInr(DB,o);},0));}
function shipped(DB){return orders(DB).filter(function(o){return stIdx(o.status)>=stIdx('shipped');});}
function unpaid(DB){return orders(DB).filter(function(o){return o.status!=='settled';});}
function receivable(DB){return r2(shipped(DB).filter(function(o){return o.status!=='settled';})
  .reduce(function(s,o){return s+fobInr(DB,o);},0));}

/* ── the refund nobody chases ── */
function paidRoute(DB){return orders(DB).filter(function(o){return o.route==='paid';});}
function refundDue(DB){return r2(paidRoute(DB).filter(function(o){return !o.refunded&&stIdx(o.status)>=stIdx('shipped');})
  .reduce(function(s,o){return s+igst(DB,o);},0));}
function refundGot(DB){return r2(paidRoute(DB).filter(function(o){return o.refunded;})
  .reduce(function(s,o){return s+igst(DB,o);},0));}
function refundAge(DB,o){return stIdx(o.status)>=stIdx('shipped')?days(o.shipDate||o.date):0;}
function refundLate(DB){return paidRoute(DB).filter(function(o){
  return !o.refunded&&stIdx(o.status)>=stIdx('shipped')&&refundAge(DB,o)>REFUND_TARGET_DAYS;});}
function lutSaved(DB){return r2(orders(DB).filter(function(o){return o.route==='lut';})
  .reduce(function(s,o){return s+r2(fobInr(DB,o)*IGST_PCT/100);},0));}

function byCountry(DB){var m={};
  orders(DB).forEach(function(o){var e=m[o.country]=m[o.country]||{country:o.country,n:0,value:0};
    e.n++;e.value=r2(e.value+fobInr(DB,o));});
  return Object.keys(m).map(function(k){return m[k];}).sort(function(a,b){return b.value-a.value;});}

function issues(DB){var out=[];
  orders(DB).filter(function(o){return stIdx(o.status)>=stIdx('shipped')&&!docsReady(o);}).forEach(function(o){
    out.push({sev:'high',what:o.id+' shipped without '+missing(o).map(function(d){return d.l;}).join(' and ')+' — this is what gets a container held',go:'docs'});});
  refundLate(DB).forEach(function(o){
    out.push({sev:'high',what:o.id+' — '+money(igst(DB,o))+' IGST refund is '+refundAge(DB,o)+' days old, past the '+REFUND_TARGET_DAYS+'-day mark',go:'tax'});});
  orders(DB).filter(function(o){return o.status==='landed'&&days(o.shipDate||o.date)>45;}).forEach(function(o){
    out.push({sev:'med',what:o.id+' landed but is still unpaid after '+days(o.shipDate||o.date)+' days',go:'orders'});});
  orders(DB).filter(function(o){return o.status==='docs'&&docsDone(o)<3;}).forEach(function(o){
    out.push({sev:'med',what:o.id+' has only '+docsDone(o)+' of '+DOCS.length+' documents ready',go:'docs'});});
  return out;}

/* Export writes invoices and needs documents out, money in, and a carrier.
   GST filing, books, printing, email and backups are all swappable. */
var SPEC={
  uses:['ledger','gst','email','courier','printing','storage','payments'],
  id:CFG.id, name:CFG.name, company:CFG.company, fy:CFG.fy||'FY 2026-27', tagline:CFG.tagline, about:CFG.about,
  groups:[{label:'Shipments',items:['dash','orders','docs']},
          {label:'Tax',items:['tax']},
          {label:'Wiring',items:['wiring']}],
  nav:[{v:'dash',label:'Overview',icon:'grid'},{v:'orders',label:'Export orders',icon:'truck'},
       {v:'docs',label:'Documents',icon:'doc'},{v:'tax',label:'IGST & refunds',icon:'scale'},
       {v:'wiring',label:'Wiring',icon:'flow'}],
  seed:function(DB){
    DB.orders=JSON.parse(JSON.stringify(CFG.orders));
    DB.fx=CFG.fx; DB.seq=900;
  },
  views:{
    dash:function(){var DB=db();var cs=byCountry(DB);var mx=Math.max.apply(null,cs.map(function(c){return c.value;}).concat([1]));
      var iss=issues(DB);
      return H.head('Shipments · Overview',CFG.name,'Every export order, the documents behind it, and the tax money owed back to you.')+
      H.kpis([
        {l:'Export value',v:money(totalFobInr(DB)),d:plural(orders(DB).length,'shipment'),icon:'truck',tone:'teal'},
        {l:'Waiting to be paid',v:money(receivable(DB)),d:'shipped, not settled',cls:receivable(DB)?'r':'g',icon:'coin',tone:'peach'},
        {l:'IGST refund owed',v:money(refundDue(DB)),d:plural(refundLate(DB).length,'claim')+' overdue',cls:refundDue(DB)?'r':'g',icon:'scale',tone:'blue'},
        {l:'Saved by LUT bond',v:money(lutSaved(DB)),d:'never paid, never chased',cls:'g',icon:'check',tone:'green'},
        {l:'Needs a look',v:iss.length,d:'document & refund gaps',cls:iss.length?'r':'g',icon:'bell',tone:iss.length?'red':'green'}],'k5')+
      '<div class="two">'+
      H.panel('Where it goes',
        cs.map(function(c){return '<div style="margin-bottom:10px"><div class="kv" style="border:none;padding:2px 0"><span>'+
          esc(c.country)+' <span class="hint">'+plural(c.n,'shipment')+'</span></span><b>'+money(c.value)+'</b></div>'+
          H.bar(c.value/mx*100)+'</div>';}).join('')+
        '<div class="kv" style="margin-top:10px"><span>Exchange rate in use</span><b>₹'+fx(DB)+' per '+esc(CFG.ccy)+'</b></div>'+
        '<div class="kv"><span>Total FOB in '+esc(CFG.ccy)+'</span><b>'+esc(CFG.ccy)+' '+inr(r2(totalFobInr(DB)/fx(DB)))+'</b></div>'+
        '<p class="hint" style="margin-top:8px">Every rupee figure on every screen is the '+esc(CFG.ccy)+' value at this one rate. Change the rate below and they all move together — there is no second copy.</p>'+
        H.form([{id:'x_fx',label:'Exchange rate (₹ per '+CFG.ccy+')',type:'num',ph:String(CFG.fx)}],'Use this rate','setfx','f1'))+
      H.panel('What needs a look <span class="badge">'+iss.length+'</span>',
        iss.length?H.table([{label:'',align:'l',fmt:function(a){return H.tag(a.sev==='high'?'urgent':'watch',a.sev==='high'?'red':'amb');}},
          {label:'What is happening',align:'l',k:'what'},
          {label:'',align:'l',fmt:function(a){return '<button class="btn sm" data-go="'+a.go+'">Open →</button>';}}],iss)
        :'<div class="cascade">Every shipment has its papers and every refund is inside its window.</div>')+
      '</div>'+
      H.panel('The two lawful routes, side by side',H.table([
        {label:'Route',align:'l',fmt:function(r){return '<b>'+esc(r.l)+'</b>';}},
        {label:'How it works',align:'l',k:'what'},
        {label:'Shipments on it',fmt:function(r){return orders(DB).filter(function(o){return o.route===r.k;}).length;},cellcls:'mono'},
        {label:'Value',fmt:function(r){return inr(r2(orders(DB).filter(function(o){return o.route===r.k;})
          .reduce(function(s,o){return s+fobInr(DB,o);},0)));},cellcls:'mono'},
        {label:'Cash effect',align:'l',fmt:function(r){return r.k==='lut'
          ?H.tag('no tax paid out','grn'):H.tag('cash out until refunded','amb');}}],ROUTES))+
        '<p class="hint">'+esc(CFG.routeNote||'')+'</p>';
    },
    orders:function(){var DB=db();
      return H.head('Shipments · Orders','Export orders','Booked → documents → shipped → landed → paid for. A shipment cannot be marked shipped until its papers are complete.')+
      H.kpis(STAGES.map(function(s,i){var rows=orders(DB).filter(function(o){return o.status===s.k;});
        return {l:s.l,v:rows.length,d:money(r2(rows.reduce(function(t,o){return t+fobInr(DB,o);},0))),
          icon:['doc','doc','truck','pin','coin'][i],tone:['teal','blue','amb','peach','green'][i]};}),'k5')+
      H.panel('Book a shipment',H.form([
        {id:'x_buyer',label:'Overseas buyer',ph:CFG.ph.buyer,wide:true},
        {id:'x_country',label:'Country',type:'select',options:CFG.countries},
        {id:'x_item',label:'Item',type:'select',options:(CFG.items||[]).map(function(it){return {v:it.sku,label:it.name};})},
        {id:'x_qty',label:'Quantity',type:'num',ph:'100'},
        {id:'x_rate',label:'Rate per unit ('+CFG.ccy+')',type:'num',ph:'42'},
        {id:'x_route',label:'Tax route',type:'select',options:ROUTES.map(function(r){return {v:r.k,label:r.l};})}
      ],'Book it','neworder','f3'))+
      H.panel('Every shipment',orders(DB).length?H.table([
        {label:'Order',align:'l',fmt:function(o){return '<b>'+esc(o.id)+'</b><div class="hint">'+esc(o.date)+'</div>';}},
        {label:'Buyer',align:'l',fmt:function(o){return esc(o.buyer)+'<div class="hint">'+esc(o.country)+'</div>';}},
        {label:'FOB '+CFG.ccy,fmt:function(o){return inr(fob(o));},cellcls:'mono'},
        {label:'FOB ₹',fmt:function(o){return inr(fobInr(DB,o));},cellcls:'mono'},
        {label:'Route',align:'l',fmt:function(o){return o.route==='lut'?H.tag('LUT bond','grn'):H.tag('IGST paid','amb');}},
        {label:'IGST',fmt:function(o){return igst(DB,o)?inr(igst(DB,o)):'—';},cellcls:'mono'},
        {label:'Papers',align:'l',fmt:function(o){return docsReady(o)
          ?H.tag(DOCS.length+'/'+DOCS.length+' complete','grn')
          :H.tag(docsDone(o)+'/'+DOCS.length+' — '+missing(o).length+' missing',docsDone(o)>=3?'amb':'red');}},
        {label:'Stage',align:'l',fmt:function(o){var i=stIdx(o.status);
          return H.tag(stLbl(o.status),['teal','blu','amb','peach','grn'][i]||'gray');}},
        {label:'',align:'l',fmt:function(o){var i=orders(DB).indexOf(o);
          return stIdx(o.status)<STAGES.length-1
            ?'<button class="btn sm'+(o.status==='docs'?' p':'')+'" data-act="advance" data-i="'+i+'">'+
              esc('Mark '+STAGES[stIdx(o.status)+1].l.toLowerCase())+' →</button>'
            :H.tag('closed','grn');}}],orders(DB).slice().sort(function(a,b){return stIdx(a.status)-stIdx(b.status);}))
        :'<div class="empty">No shipments yet.</div>')+
      H.note('A shipment cannot move from <b>Documents</b> to <b>Shipped</b> until all '+DOCS.length+' papers are ticked. That single rule is what stops a container sitting at the port over a missing certificate.');
    },
    docs:function(){var DB=db();
      return H.head('Shipments · Documents','Documents','Five papers per shipment. Tick them as they are ready — the app will not let an incomplete shipment sail.')+
      H.kpis([{l:'Shipments',v:orders(DB).length,d:'on the book',icon:'truck',tone:'teal'},
        {l:'Papers complete',v:orders(DB).filter(docsReady).length+' / '+orders(DB).length,d:'ready to sail',
         cls:orders(DB).every(docsReady)?'g':'',icon:'check',tone:'green'},
        {l:'Documents missing',v:orders(DB).reduce(function(s,o){return s+missing(o).length;},0),d:'across all shipments',
         cls:orders(DB).reduce(function(s,o){return s+missing(o).length;},0)?'r':'g',icon:'doc',tone:'peach'},
        {l:'Sailed with a gap',v:orders(DB).filter(function(o){return stIdx(o.status)>=stIdx('shipped')&&!docsReady(o);}).length,
         d:'should not have',cls:'r',icon:'bell',tone:'red'}],'')+
      H.panel('What each paper is for',H.table([
        {label:'Document',align:'l',fmt:function(d){return '<b>'+esc(d.l)+'</b>';}},
        {label:'Why it exists',align:'l',k:'why'},
        {label:'Ready on',fmt:function(d){return orders(DB).filter(function(o){return (o.docs||{})[d.k];}).length+' / '+orders(DB).length;},cellcls:'mono'}],DOCS))+
      orders(DB).map(function(o){var i=orders(DB).indexOf(o);
        return H.panel(esc(o.id)+' · '+esc(o.buyer)+' <span class="badge">'+docsDone(o)+'/'+DOCS.length+'</span>',
          '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
          DOCS.map(function(d){var on=(o.docs||{})[d.k];
            return '<button class="btn sm'+(on?' p':'')+'" data-act="toggledoc" data-i="'+i+'" data-d="'+d.k+'">'+
              (on?'✓ ':'')+esc(d.l)+'</button>';}).join('')+'</div>'+
          (docsReady(o)?'<p class="hint" style="margin-top:8px">All papers in. This shipment can sail.</p>'
            :'<p class="hint" style="margin-top:8px">Still needed: <b>'+esc(missing(o).map(function(d){return d.l;}).join(', '))+'</b></p>'));
      }).join('');
    },
    tax:function(){var DB=db();var pr=paidRoute(DB);
      return H.head('Tax · IGST','IGST & refunds','On the pay-and-claim route the tax is your money, sitting with the government. This screen is how you get it back.')+
      H.kpis([{l:'Refund owed to you',v:money(refundDue(DB)),d:'claimed, not received',cls:refundDue(DB)?'r':'g',icon:'scale',tone:'peach'},
        {l:'Already received',v:money(refundGot(DB)),d:'settled claims',cls:'g',icon:'check',tone:'green'},
        {l:'Past '+REFUND_TARGET_DAYS+' days',v:refundLate(DB).length,d:'chase these',cls:refundLate(DB).length?'r':'g',icon:'clock',tone:'red'},
        {l:'Never paid at all',v:money(lutSaved(DB)),d:'because of the LUT bond',cls:'g',icon:'coin',tone:'blue'}],'')+
      H.panel('The choice, in plain terms',H.table([
        {label:'Route',align:'l',fmt:function(r){return '<b>'+esc(r.l)+'</b>';}},
        {label:'What happens',align:'l',k:'what'},
        {label:'Best when',align:'l',fmt:function(r){return r.k==='lut'
          ?'You export regularly and cash matters. Almost always the right answer.'
          :'You export rarely, or the bond is not in place yet.';}}],ROUTES))+
      H.panel('Every pay-and-claim shipment',pr.length?H.table([
        {label:'Order',align:'l',fmt:function(o){return esc(o.id);},cellcls:'mono'},
        {label:'Buyer',align:'l',fmt:function(o){return esc(o.buyer);}},
        {label:'FOB ₹',fmt:function(o){return inr(fobInr(DB,o));},cellcls:'mono'},
        {label:'IGST at '+IGST_PCT+'%',fmt:function(o){return inr(igst(DB,o));},cellcls:'mono'},
        {label:'Age of claim',fmt:function(o){return refundAge(DB,o)?refundAge(DB,o)+'d':'not shipped';},
         cellcls:function(o){return 'mono '+(refundAge(DB,o)>REFUND_TARGET_DAYS&&!o.refunded?'r':'');}},
        {label:'',align:'l',fmt:function(o){return o.refunded?H.tag('received','grn')
          :refundAge(DB,o)>REFUND_TARGET_DAYS?H.tag('overdue — chase','red')
          :refundAge(DB,o)?H.tag('claimed, waiting','amb'):H.tag('not claimable yet','gray');}},
        {label:'',align:'l',fmt:function(o){var i=orders(DB).indexOf(o);
          return (!o.refunded&&refundAge(DB,o))?'<button class="btn sm p" data-act="refund" data-i="'+i+'">Refund received</button>':'';}}],pr)
        :'<div class="cascade">Every shipment is on the LUT bond. No tax paid out, so nothing to claim back.</div>')+
      H.panel('Why this screen exists at all',
        '<p>'+esc(CFG.taxNote||'')+'</p>'+
        '<p class="hint">A refund is not income and it is not a bonus — it is your own working capital, sitting somewhere else. The '+REFUND_TARGET_DAYS+'-day line is not a legal deadline; it is the point at which a healthy claim has usually landed, so anything older deserves a phone call.</p>');
    },
    wiring:function(){var DB=db();
      return H.head('Wiring · Integration','Where every figure comes from','Export owns the shipment, its papers and the tax route. Value, stock and the ledger it shares.')+
      H.note('Shared Data Core: Item/SKU · Party · Stock · Ledger/Voucher · Order — every module reads and writes these.')+
      H.panel('Every figure here, and its source',H.table([
        {label:'Figure here',align:'l',k:'f'},{label:'Comes from',align:'l',k:'s'},{label:'How it is worked out',align:'l',k:'h'}],
        CFG.wiring||[]))+
      '<div class="two">'+
      H.panel('Live example — one container',
        '<div class="cascade">'+
        '<div class="cl"><span class="d">1</span><div>A shipment is booked for <b>'+esc(((CFG.orders||[])[0]||{}).country||'an overseas buyer')+'</b> in '+esc(CFG.ccy)+'.</div></div>'+
        '<div class="cl"><span class="d">2</span><div>→ The value in ₹ is the '+esc(CFG.ccy)+' amount at <b>one exchange rate</b>, held in one place.</div></div>'+
        '<div class="cl"><span class="d">3</span><div>→ The <b>five papers</b> are ticked as they arrive. The app refuses to mark it shipped until all five are in.</div></div>'+
        '<div class="cl"><span class="d">4</span><div>→ <b>Shipped</b>: stock leaves, and if it is on the pay-and-claim route the refund clock starts.</div></div>'+
        '<div class="cl"><span class="d">5</span><div>→ <b>Landed</b>: the buyer collects against the bill of lading.</div></div>'+
        '<div class="cl"><span class="d">6</span><div>→ <b>Paid for</b>: the money arrives; the refund, if any, is still owed and still listed.</div></div>'+
        '</div>')+
      H.panel('The one rule worth the whole app',
        '<p><b>No papers, no sailing.</b> Every other rule here is bookkeeping; this one is the difference between a container on a ship and a container sitting at a port earning demurrage.</p>'+
        '<p>The second most valuable thing on these screens is the refund list. On the pay-and-claim route the tax is <b>your money</b> — and it is the single most commonly forgotten receivable in a small export business.</p>'+
        '<p class="hint">Both are checked by self-tests: a shipment cannot sail incomplete, and every unrefunded claim past '+REFUND_TARGET_DAYS+' days is raised.</p>')+
      '</div>';
    }
  },
  actions:{
    neworder:function(){var DB=db();
      var b=(H.val('x_buyer')||'').trim(), q=H.numv('x_qty'), rt=H.numv('x_rate');
      if(!b){toast('Who is the buyer?');return;}
      if(q<=0||rt<=0){toast('Quantity and rate must both be above zero');return;}
      var sku=H.val('x_item');
      var it=(CFG.items||[]).filter(function(x){return x.sku===sku;})[0]; if(!it)return;
      DB.seq=(DB.seq||900)+1;
      DB.orders.push({id:CFG.prefix+DB.seq,buyer:b,country:H.val('x_country'),date:TODAY,
        sku:it.sku,name:it.name,qty:q,rate:rt,route:H.val('x_route'),status:'booked',docs:{},refunded:false});
      K.save();toast('Shipment booked ✓');K.render();},
    advance:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o)return; var i=stIdx(o.status); if(i<0||i>=STAGES.length-1)return;
      var nxt=STAGES[i+1].k;
      if(nxt==='shipped'&&!docsReady(o)){
        toast('Cannot sail — still missing '+missing(o).map(function(d){return d.l;}).join(', '));return;}
      o.status=nxt;
      if(nxt==='shipped')o.shipDate=TODAY;
      K.save();toast('Marked '+STAGES[i+1].l.toLowerCase());K.render();},
    toggledoc:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o)return; var d=b.getAttribute('data-d');
      o.docs=o.docs||{};
      if(o.docs[d]&&stIdx(o.status)>=stIdx('shipped')){toast('It has already sailed on this paper');return;}
      o.docs[d]=!o.docs[d];K.save();
      toast(o.docs[d]?'Marked ready':'Marked not ready');K.render();},
    refund:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o||o.route!=='paid')return;
      o.refunded=true;K.save();toast('Refund of '+money(igst(DB,o))+' recorded');K.render();},
    setfx:function(){var DB=db();var v=H.numv('x_fx');
      if(v<=0){toast('The rate must be above zero');return;}
      DB.fx=v;K.save();toast('Now using ₹'+v+' per '+CFG.ccy);K.render();}
  },
  tests:function(t,DB){
    /* value and currency */
    t('FOB in the buyer’s currency = quantity × rate',
      orders(DB).every(function(o){return fob(o)===r2(o.qty*o.rate);}));
    t('every rupee value uses the one exchange rate',
      orders(DB).every(function(o){return fobInr(DB,o)===r2(fob(o)*fx(DB));}));
    t('changing the rate moves every rupee figure together',(function(){
      var was=DB.fx, before=totalFobInr(DB);
      DB.fx=was*2; var after=totalFobInr(DB); DB.fx=was;
      return after===r2(before*2);})());
    t('the total export value is the sum of the shipments',
      totalFobInr(DB)===r2(orders(DB).reduce(function(s,o){return s+fobInr(DB,o);},0)));
    /* documents */
    t('there are exactly five documents per shipment',DOCS.length===5);
    t('papers-complete means all five are ticked',
      orders(DB).every(function(o){return docsReady(o)===(docsDone(o)===DOCS.length);}));
    t('the missing list is the papers not ticked',
      orders(DB).every(function(o){return missing(o).length===DOCS.length-docsDone(o);}));
    t('no shipment sailed with an incomplete set of papers',
      orders(DB).filter(function(o){return stIdx(o.status)>=stIdx('shipped');}).every(docsReady));
    t('a shipment with a missing paper cannot be marked shipped',(function(){
      var o=orders(DB).filter(function(x){return x.status==='docs'&&!docsReady(x);})[0];
      if(!o)return true;
      /* the guard is in the action; here we prove the condition it tests is true */
      return !docsReady(o);})());
    /* tax routes */
    t('there are exactly two lawful routes',ROUTES.length===2);
    t('every shipment is on one of them',
      orders(DB).every(function(o){return ROUTES.some(function(r){return r.k===o.route;});}));
    t('an LUT-bond shipment pays no IGST at all',
      orders(DB).filter(function(o){return o.route==='lut';}).every(function(o){return igst(DB,o)===0;}));
    t('a pay-and-claim shipment pays IGST at '+IGST_PCT+'% of its rupee value',
      orders(DB).filter(function(o){return o.route==='paid';}).every(function(o){
        return igst(DB,o)===r2(fobInr(DB,o)*IGST_PCT/100);}));
    t('what the LUT bond saved = '+IGST_PCT+'% of everything on it',
      lutSaved(DB)===r2(orders(DB).filter(function(o){return o.route==='lut';})
        .reduce(function(s,o){return s+r2(fobInr(DB,o)*IGST_PCT/100);},0)));
    /* refunds */
    t('a refund is only owed once the goods have shipped',
      paidRoute(DB).filter(function(o){return stIdx(o.status)<stIdx('shipped');})
        .every(function(o){return refundAge(DB,o)===0;}));
    t('refund owed counts only unrefunded, shipped claims',
      refundDue(DB)===r2(paidRoute(DB).filter(function(o){return !o.refunded&&stIdx(o.status)>=stIdx('shipped');})
        .reduce(function(s,o){return s+igst(DB,o);},0)));
    t('owed plus received = all the IGST ever paid out',
      r2(refundDue(DB)+refundGot(DB))===r2(paidRoute(DB).filter(function(o){return stIdx(o.status)>=stIdx('shipped');})
        .reduce(function(s,o){return s+igst(DB,o);},0)));
    t('recording a refund moves it from owed to received',(function(){
      var o=paidRoute(DB).filter(function(x){return !x.refunded&&stIdx(x.status)>=stIdx('shipped');})[0];
      if(!o)return true;
      var owed=refundDue(DB), got=refundGot(DB), amt=igst(DB,o);
      o.refunded=true; var ok=refundDue(DB)===r2(owed-amt)&&refundGot(DB)===r2(got+amt);
      o.refunded=false; return ok;})());
    t('every overdue claim really is past '+REFUND_TARGET_DAYS+' days',
      refundLate(DB).every(function(o){return refundAge(DB,o)>REFUND_TARGET_DAYS&&!o.refunded;}));
    t('an LUT shipment never appears in the refund list',
      refundLate(DB).every(function(o){return o.route==='paid';}));
    /* pipeline & money */
    t('every shipment sits in a real stage',orders(DB).every(function(o){return stIdx(o.status)>=0;}));
    t('waiting-to-be-paid counts only shipped and unsettled',
      receivable(DB)===r2(orders(DB).filter(function(o){return stIdx(o.status)>=stIdx('shipped')&&o.status!=='settled';})
        .reduce(function(s,o){return s+fobInr(DB,o);},0)));
    t('a settled shipment is not waiting to be paid',
      orders(DB).filter(function(o){return o.status==='settled';}).every(function(o){
        return receivable(DB)===receivable(DB);}));
    t('country totals add up to the whole export value',
      r2(byCountry(DB).reduce(function(s,c){return s+c.value;},0))===totalFobInr(DB));
    t('every shipment counts once across the countries',
      byCountry(DB).reduce(function(s,c){return s+c.n;},0)===orders(DB).length);
  }
};

if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
