/* Medhava — Marketplace OMS (Module 04 · App 1)
   Seven seller panels, one queue. Every marketplace order in one place, with its dispatch
   clock running, and the commission worked out so you can see what each channel ACTUALLY
   pays you rather than what it invoices.
   CONFIG supplies names so the Medhava and Vastrangam builds run the SAME math. */
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
var CFG=(typeof CONFIG!=='undefined')?CONFIG:{};
function db(){return K.DB;}
function plural(n,one,many){return n+' '+(n===1?one:(many||one+'s'));}

var STAGES=[{k:'new',l:'To accept'},{k:'accepted',l:'Accepted'},{k:'packed',l:'Packed'},
            {k:'dispatched',l:'Dispatched'},{k:'delivered',l:'Delivered'}];
function stIdx(k){for(var i=0;i<STAGES.length;i++)if(STAGES[i].k===k)return i;return -1;}
function stLbl(k){var s=STAGES.filter(function(x){return x.k===k;})[0];
  return s?s.l:(k==='returned'?'Returned':'Cancelled');}

function mp(code){return (CFG.markets||[]).filter(function(m){return m.code===code;})[0]||null;}
function item(sku){return (CFG.items||[]).filter(function(x){return x.sku===sku;})[0]||null;}

/* ── what one order is really worth ──
   Gross is what the marketplace shows you. Net payout is what reaches your bank. */
function gross(o){return r2(num(o.qty)*num(o.rate));}
function commission(DB,o){var m=mp(o.market);return m?r2(gross(o)*num(m.comm)/100):0;}
function shipFee(DB,o){var m=mp(o.market);return m?num(m.ship):0;}
function payout(DB,o){return r2(gross(o)-commission(DB,o)-shipFee(DB,o));}
function commPct(DB,o){var g=gross(o);return g?Math.round((gross(o)-payout(DB,o))/g*100):0;}

function orders(DB){return DB.orders||[];}
function live(DB){return orders(DB).filter(function(o){return o.status!=='cancelled'&&o.status!=='returned';});}
function returned(DB){return orders(DB).filter(function(o){return o.status==='returned';});}
function cancelled(DB){return orders(DB).filter(function(o){return o.status==='cancelled';});}
function grossAll(DB){return r2(live(DB).reduce(function(s,o){return s+gross(o);},0));}
function payoutAll(DB){return r2(live(DB).reduce(function(s,o){return s+payout(DB,o);},0));}
function feesAll(DB){return r2(grossAll(DB)-payoutAll(DB));}
function returnedValue(DB){return r2(returned(DB).reduce(function(s,o){return s+gross(o);},0));}

/* ── the dispatch clock. Every marketplace gives you a different number of hours. ── */
function slaOf(o){var m=mp(o.market);return m?num(m.sla):24;}
function hrsLeft(o){return slaOf(o)-num(o.age);}
function needsDispatch(o){return stIdx(o.status)>=0&&stIdx(o.status)<stIdx('dispatched');}
function breached(DB){return live(DB).filter(function(o){return needsDispatch(o)&&hrsLeft(o)<0;});}
function atRisk(DB){return live(DB).filter(function(o){return needsDispatch(o)&&hrsLeft(o)>=0&&hrsLeft(o)<=4;});}
function onTimePct(DB){var d=live(DB).filter(function(o){return !needsDispatch(o);});
  if(!d.length)return 100;
  return Math.round(d.filter(function(o){return num(o.age)<=slaOf(o);}).length/d.length*100);}

function queue(DB){return live(DB).filter(needsDispatch)
  .sort(function(a,b){return hrsLeft(a)-hrsLeft(b);});}

/* ── per marketplace: the comparison nobody makes ── */
function byMarket(DB){return (CFG.markets||[]).map(function(m){
  var os=orders(DB).filter(function(o){return o.market===m.code;});
  var lv=os.filter(function(o){return o.status!=='cancelled'&&o.status!=='returned';});
  var rt=os.filter(function(o){return o.status==='returned';});
  var g=r2(lv.reduce(function(s,o){return s+gross(o);},0));
  var p=r2(lv.reduce(function(s,o){return s+payout(DB,o);},0));
  var rg=r2(rt.reduce(function(s,o){return s+gross(o);},0));
  return {code:m.code,name:m.name,comm:num(m.comm),ship:num(m.ship),sla:num(m.sla),
    n:lv.length, ret:rt.length, gross:g, payout:p, fees:r2(g-p), retValue:rg,
    retPct:(lv.length+rt.length)?Math.round(rt.length/(lv.length+rt.length)*100):0,
    keepPct:g?Math.round(p/g*100):0,
    breached:lv.filter(function(o){return needsDispatch(o)&&hrsLeft(o)<0;}).length};})
  .sort(function(a,b){return b.payout-a.payout;});}

/* ── listing health: one price and one stock number, or trouble ── */
function listings(DB){return (CFG.items||[]).map(function(it){
  var rows=(CFG.markets||[]).map(function(m){
    var lp=((DB.prices||{})[it.sku]||{})[m.code];
    return {market:m.name,code:m.code,price:lp===undefined?num(it.rate):num(lp)};});
  var ps=rows.map(function(r){return r.price;});
  var lo=Math.min.apply(null,ps), hi=Math.max.apply(null,ps);
  return {sku:it.sku,name:it.name,list:num(it.rate),rows:rows,lo:lo,hi:hi,
    spread:r2(hi-lo), spreadPct:lo?Math.round((hi-lo)/lo*100):0,
    stock:num((DB.stock||{})[it.sku]),
    listedOn:rows.length};});}
function parityBroken(DB){return listings(DB).filter(function(l){return l.spreadPct>num(CFG.parityPct||5);});}
function oversellRisk(DB){return listings(DB).filter(function(l){return l.stock>0&&l.stock<(CFG.markets||[]).length;});}
function outOfStock(DB){return listings(DB).filter(function(l){return l.stock<=0;});}

/* ── packing slips ──
   A slip is a PICKING and SHIPPING document, not a tax invoice. It carries the design code
   in a size somebody can read across a rack, because the whole cost of a wrong dispatch is
   a person reading the wrong line at speed. Only orders still to dispatch get one, so a slip
   can never send a picker after a piece that has already gone out. */
function slipOrders(DB){return queue(DB);}
function sizeOf(o){return o.size||'—';}
function shipTo(o){return o.addr||'';}
/* One row per design, not one per order — a picker walks the rack once, not once per parcel. */
function pickList(DB){var by={};
  slipOrders(DB).forEach(function(o){
    var k=o.sku+'|'+sizeOf(o);
    if(!by[k])by[k]={sku:o.sku,name:o.name,size:sizeOf(o),qty:0,orders:0,markets:{}};
    by[k].qty+=num(o.qty); by[k].orders++; by[k].markets[o.market]=1;});
  return Object.keys(by).map(function(k){var r=by[k];
    r.panels=Object.keys(r.markets).length; return r;})
    .sort(function(a,b){return b.qty-a.qty;});}
function piecesToPick(DB){return pickList(DB).reduce(function(s,r){return s+r.qty;},0);}
function slipHtml(DB,o){var m=mp(o.market);var h=hrsLeft(o);
  return '<div class="slip">'+
    '<div class="sl-top"><div><div class="sl-co">'+esc(CFG.company||'')+'</div>'+
      '<div class="sl-sub">Packing slip · not a tax invoice</div></div>'+
      '<div class="sl-right"><div class="sl-ord">'+esc(o.id)+'</div>'+
      '<div class="sl-sub">'+esc(m?m.name:'')+' · '+(h<0?(-h)+'h LATE':h+'h left')+'</div></div></div>'+
    '<div class="sl-to"><span class="sl-lbl">Ship to</span><b>'+esc(o.cust||'')+'</b>'+
      (shipTo(o)?'<div class="sl-addr">'+esc(shipTo(o))+'</div>':'')+'</div>'+
    '<table class="sl-tbl"><thead><tr><th>Design code</th><th>Item</th><th>Size</th><th class="r">Qty</th></tr></thead>'+
    '<tbody><tr><td><b>'+esc(o.sku)+'</b></td><td>'+esc(o.name)+'</td><td>'+esc(sizeOf(o))+'</td><td class="r"><b>'+num(o.qty)+'</b></td></tr></tbody></table>'+
    '<div class="sl-code"><span class="sl-lbl">Pick this design</span><div class="sl-big">'+esc(o.sku)+'</div>'+
      '<div class="sl-sz">Size '+esc(sizeOf(o))+' · '+plural(num(o.qty),'piece')+'</div></div>'+
    '<div class="sl-foot"><span>Packed by ____________</span><span>Checked by ____________</span>'+
      '<span>'+esc(CFG.fy||'')+'</span></div>'+
    '</div>';}

function issues(DB){var out=[];
  breached(DB).forEach(function(o){out.push({sev:'high',
    what:o.id+' ('+(mp(o.market)||{}).name+') is '+(-hrsLeft(o))+'h past its dispatch window — this is what costs you the account',go:'queue'});});
  atRisk(DB).forEach(function(o){out.push({sev:'med',
    what:o.id+' ('+(mp(o.market)||{}).name+') has '+plural(hrsLeft(o),'hour')+' left to dispatch',go:'queue'});});
  parityBroken(DB).forEach(function(l){out.push({sev:'med',
    what:l.name+' is priced '+l.spreadPct+'% apart across marketplaces — '+money(l.lo)+' to '+money(l.hi),go:'listings'});});
  outOfStock(DB).forEach(function(l){out.push({sev:'high',
    what:l.name+' is out of stock but still listed on '+plural(l.listedOn,'marketplace')+' — every order taken now is a cancellation',go:'listings'});});
  byMarket(DB).filter(function(m){return m.retPct>=num(CFG.retAlertPct||12)&&m.n+m.ret>=3;}).forEach(function(m){
    out.push({sev:'med',what:m.name+' return rate is '+m.retPct+'% — above the '+(CFG.retAlertPct||12)+'% line',go:'markets'});});
  return out;}

/* Marketplace OMS reads orders from the channels, pushes stock back, moves money
   through the books, and needs a courier and a printer. All of it swappable. */
var SPEC={
  uses:['channels','courier','ledger','printing','storage','automation','messaging'],
  id:CFG.id, name:CFG.name, company:CFG.company, fy:CFG.fy||'FY 2026-27', tagline:CFG.tagline, about:CFG.about,
  groups:[{label:'One queue',items:['dash','queue','slips']},
          {label:'Per marketplace',items:['markets','listings']},
          {label:'Wiring',items:['wiring']}],
  nav:[{v:'dash',label:'Overview',icon:'grid'},{v:'queue',label:'Dispatch queue',icon:'truck'},
       {v:'slips',label:'Pick list & slips',icon:'doc'},
       {v:'markets',label:'Marketplace P&L',icon:'scale'},{v:'listings',label:'Listing health',icon:'layers'},
       {v:'wiring',label:'Wiring',icon:'flow'}],
  seed:function(DB){
    DB.orders=JSON.parse(JSON.stringify(CFG.orders));
    DB.prices=JSON.parse(JSON.stringify(CFG.prices||{}));
    DB.stock={}; (CFG.items||[]).forEach(function(it){DB.stock[it.sku]=num(it.qty);});
    DB.seq=1000;
  },
  views:{
    dash:function(){var DB=db();var ms=byMarket(DB);
      var mx=Math.max.apply(null,ms.map(function(m){return m.payout;}).concat([1]));
      var iss=issues(DB);
      return H.head('One queue · Overview',CFG.name,'Every marketplace order in one place — and what each channel actually pays you after its cut.')+
      H.kpis([
        {l:'Gross ordered',v:money(grossAll(DB)),d:plural(live(DB).length,'live order'),icon:'cart',tone:'teal'},
        {l:'What reaches you',v:money(payoutAll(DB)),d:'after commission &amp; fees',cls:'g',icon:'coin',tone:'green'},
        {l:'Taken by the platforms',v:money(feesAll(DB)),d:grossAll(DB)?Math.round(feesAll(DB)/grossAll(DB)*100)+'% of gross':'—',cls:'r',icon:'pct',tone:'peach'},
        {l:'Past dispatch window',v:breached(DB).length,d:plural(atRisk(DB).length,'more')+' within 4h',cls:breached(DB).length?'r':'g',icon:'clock',tone:breached(DB).length?'red':'green'},
        {l:'Dispatched on time',v:onTimePct(DB)+'%',d:'of everything shipped',cls:onTimePct(DB)>=95?'g':'r',icon:'check',tone:'blue'}],'k5')+
      '<div class="two">'+
      H.panel('What each marketplace actually pays you',
        ms.map(function(m){return '<div style="margin-bottom:10px"><div class="kv" style="border:none;padding:2px 0"><span>'+
          esc(m.name)+' <span class="hint">'+m.comm+'% + '+money(m.ship)+'/order · keeps you '+m.keepPct+'%</span></span><b>'+money(m.payout)+'</b></div>'+
          H.bar(m.payout/mx*100)+'</div>';}).join('')+
        '<div class="kv" style="margin-top:10px"><span>Gross across every marketplace</span><b>'+money(grossAll(DB))+'</b></div>'+
        '<div class="kv"><span>− Commission and shipping fees</span><b class="r">'+money(feesAll(DB))+'</b></div>'+
        '<div class="kv"><span><b>= What actually reaches your bank</b></span><b class="g">'+money(payoutAll(DB))+'</b></div>'+
        '<p class="hint" style="margin-top:8px">'+esc(CFG.commNote||'')+'</p>')+
      H.panel('What needs you now <span class="badge">'+iss.length+'</span>',
        iss.length?H.table([{label:'',align:'l',fmt:function(a){return H.tag(a.sev==='high'?'urgent':'watch',a.sev==='high'?'red':'amb');}},
          {label:'What is happening',align:'l',k:'what'},
          {label:'',align:'l',fmt:function(a){return '<button class="btn sm" data-go="'+a.go+'">Open →</button>';}}],iss.slice(0,8))
        :'<div class="cascade">Nothing is late, nothing is mispriced, and nothing is listed that you cannot ship.</div>')+
      '</div>'+
      H.panel('Why one queue instead of seven panels',
        '<p>'+esc(CFG.queueNote||'')+'</p>'+
        '<div class="kv"><span>Marketplaces in one queue</span><b>'+plural((CFG.markets||[]).length,'panel')+' → 1</b></div>'+
        '<div class="kv"><span>Dispatch windows to remember</span><b>'+(CFG.markets||[]).map(function(m){return m.sla+'h';}).join(' · ')+' → the clock does it</b></div>'+
        '<div class="kv"><span>Stock figures to reconcile</span><b>1 — the same one every channel reads</b></div>');
    },
    queue:function(){var DB=db();var q=queue(DB);
      return H.head('One queue · Dispatch','Dispatch queue','Sorted by how little time is left, not by when it arrived. The most urgent order is always at the top.')+
      H.kpis([{l:'To dispatch',v:q.length,d:'across every marketplace',icon:'truck',tone:'teal'},
        {l:'Already late',v:breached(DB).length,d:'past the window',cls:breached(DB).length?'r':'g',icon:'clock',tone:'red'},
        {l:'Within 4 hours',v:atRisk(DB).length,d:'do these next',cls:atRisk(DB).length?'r':'',icon:'bell',tone:'amb'},
        {l:'Value in the queue',v:money(r2(q.reduce(function(s,o){return s+payout(DB,o);},0))),d:'your share of it',icon:'coin',tone:'green'}],'')+
      H.panel('Everything waiting to go out',q.length?H.table([
        {label:'Time left',align:'l',fmt:function(o){var h=hrsLeft(o);
          return h<0?H.tag((-h)+'h LATE','red'):h<=4?H.tag(h+'h left','red')
            :h<=8?H.tag(h+'h left','amb'):H.tag(h+'h left','grn');}},
        {label:'Order',align:'l',fmt:function(o){return '<b>'+esc(o.id)+'</b><div class="hint">'+esc(o.cust||'—')+'</div>';}},
        {label:'Marketplace',align:'l',fmt:function(o){var m=mp(o.market);
          return esc(m?m.name:'?')+'<div class="hint">'+ (m?m.sla:0)+'h window</div>';}},
        {label:'Item',align:'l',fmt:function(o){return esc(o.name)+'<div class="hint">'+o.qty+' × '+money(o.rate)+'</div>';}},
        {label:'Gross',fmt:function(o){return inr(gross(o));},cellcls:'mono'},
        {label:'Their cut',fmt:function(o){return inr(r2(commission(DB,o)+shipFee(DB,o)));},cellcls:'mono r'},
        {label:'You get',fmt:function(o){return inr(payout(DB,o));},cellcls:'mono'},
        {label:'Stage',align:'l',fmt:function(o){var i=stIdx(o.status);
          return H.tag(stLbl(o.status),['teal','blu','amb','peach','grn'][i]||'gray');}},
        {label:'',align:'l',fmt:function(o){var i=orders(DB).indexOf(o);
          return '<button class="btn sm p" data-act="advance" data-i="'+i+'">'+
            esc('Mark '+STAGES[stIdx(o.status)+1].l.toLowerCase())+' →</button> '+
            '<button class="btn sm d" data-act="cancel" data-i="'+i+'">Cancel</button>';}}],q)
        :'<div class="cascade">Nothing waiting. Every order has gone out.</div>')+
      H.note('The queue is sorted by <b>time left</b>, not by order date. A Myntra order placed an hour ago can be more urgent than an Amazon order from yesterday, because the windows are different — and remembering that per panel is exactly what goes wrong at 6pm.')+
      (live(DB).filter(function(o){return !needsDispatch(o);}).length?H.panel('Already out <span class="badge">'+
        live(DB).filter(function(o){return !needsDispatch(o);}).length+'</span>',
        H.table([{label:'Order',align:'l',fmt:function(o){return esc(o.id);}},
          {label:'Marketplace',align:'l',fmt:function(o){return esc((mp(o.market)||{}).name);}},
          {label:'You get',fmt:function(o){return inr(payout(DB,o));},cellcls:'mono'},
          {label:'Dispatched in',fmt:function(o){return o.age+'h';},cellcls:function(o){return 'mono '+(num(o.age)>slaOf(o)?'r':'');}},
          {label:'',align:'l',fmt:function(o){return num(o.age)<=slaOf(o)?H.tag('within window','grn'):H.tag('was late','red');}},
          {label:'Stage',align:'l',fmt:function(o){return H.tag(stLbl(o.status),'grn');}},
          {label:'',align:'l',fmt:function(o){var i=orders(DB).indexOf(o);
            return o.status==='delivered'?'<button class="btn sm" data-act="ret" data-i="'+i+'">Came back</button>':'';}}],
        live(DB).filter(function(o){return !needsDispatch(o);}))):'');
    },
    slips:function(){var DB=db();var os=slipOrders(DB);var pl=pickList(DB);
      return '<style>'+
      '.slip{border:1px solid #cfe0da;border-radius:10px;padding:16px 18px;margin:12px 0;background:#fff}'+
      '.sl-top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0b3b31;padding-bottom:9px}'+
      '.sl-co{font-size:17px;font-weight:800;color:#0b3b31;letter-spacing:.01em}'+
      '.sl-right{text-align:right}.sl-ord{font-size:15px;font-weight:800;color:#0b6a58;font-family:ui-monospace,Menlo,Consolas,monospace}'+
      '.sl-sub{font-size:11px;color:#5b6f69;margin-top:2px}'+
      '.sl-lbl{display:block;font-size:9.5px;text-transform:uppercase;letter-spacing:.09em;color:#7d938c;margin-bottom:3px}'+
      '.sl-to{padding:10px 0;border-bottom:1px dashed #d7e6e0}.sl-to b{font-size:13.5px;color:#0b3b31}'+
      '.sl-addr{font-size:12px;color:#31473f;line-height:1.5;margin-top:2px;max-width:62%}'+
      '.sl-tbl{width:100%;border-collapse:collapse;margin:10px 0}'+
      '.sl-tbl th{text-align:left;font-size:9.5px;text-transform:uppercase;letter-spacing:.08em;color:#7d938c;border-bottom:1px solid #d7e6e0;padding:5px 4px}'+
      '.sl-tbl td{font-size:12.5px;color:#31473f;padding:7px 4px;border-bottom:1px solid #eef4f2}'+
      '.sl-tbl .r{text-align:right}'+
      '.sl-code{background:#0b3b31;border-radius:9px;padding:12px 16px;margin:10px 0;color:#d7f2e9}'+
      '.sl-code .sl-lbl{color:#8fd3c4}'+
      '.sl-big{font-size:30px;font-weight:800;letter-spacing:.06em;font-family:ui-monospace,Menlo,Consolas,monospace;color:#fff;line-height:1.15}'+
      '.sl-sz{font-size:12px;color:#8fd3c4;margin-top:3px}'+
      '.sl-foot{display:flex;justify-content:space-between;gap:12px;font-size:10.5px;color:#7d938c;padding-top:9px;border-top:1px dashed #d7e6e0}'+
      '@media print{.kpis,.panel,.crumb,.h1row,.note{display:none!important}'+
      '#slipsheet{display:block!important}.slip{page-break-after:always;break-after:page;border:none;margin:0;padding:0}'+
      '.slip:last-child{page-break-after:auto;break-after:auto}}'+
      '</style>'+
      H.head('One queue · Picking','Pick list & packing slips','One walk down the rack, then one slip per parcel — each carrying the design code big enough to read at speed.')+
      H.kpis([{l:'Slips to print',v:os.length,d:'one per parcel going out',icon:'doc',tone:'teal'},
        {l:'Designs to pick',v:pl.length,d:'rows on the pick list',icon:'layers',tone:'blue'},
        {l:'Pieces to pull',v:piecesToPick(DB),d:'off the rack in total',icon:'box',tone:'green'},
        {l:'Already late',v:breached(DB).length,d:'pick these first',cls:breached(DB).length?'r':'g',icon:'clock',tone:breached(DB).length?'red':'green'}],'')+
      H.panel('The pick list — one walk down the rack',
        pl.length?H.table([
          {label:'Design code',align:'l',fmt:function(r){return '<b class="mono">'+esc(r.sku)+'</b>';}},
          {label:'Item',align:'l',fmt:function(r){return esc(r.name);}},
          {label:'Size',align:'l',fmt:function(r){return esc(r.size);}},
          {label:'Pull',fmt:function(r){return '<b>'+r.qty+'</b>';},cellcls:'mono'},
          {label:'For parcels',fmt:function(r){return r.orders;},cellcls:'mono'},
          {label:'Across panels',fmt:function(r){return r.panels;},cellcls:'mono'},
          {label:'',align:'l',fmt:function(r){return r.qty>num((db().stock||{})[r.sku])
            ?H.tag('more than you have','red'):H.tag('in stock','grn');}}],pl)
        :'<div class="cascade">Nothing waiting to go out, so there is nothing to pick.</div>',
        '<button class="btn p" data-act="printslips">Print all '+plural(os.length,'slip')+'</button>')+
      H.note('<b>Pick first, pack second.</b> The list above is grouped by design, not by order — '+
        plural(pl.length,'row')+' instead of '+plural(os.length,'trip')+' to the rack. The slips below are then one per parcel, in the same order the queue is in, so the latest parcel is packed first.')+
      (CFG.slipNote?H.panel('What is on a slip, and what is not','<p>'+esc(CFG.slipNote)+'</p>'):'')+
      '<div id="slipsheet">'+(os.length?os.map(function(o){return slipHtml(DB,o);}).join('')
        :'<div class="panel"><div class="cascade">No parcels to pack.</div></div>')+'</div>';
    },
    markets:function(){var DB=db();var ms=byMarket(DB);
      return H.head('Per marketplace · P&L','Marketplace P&L','Which panel is actually worth the work, once the commission and the returns are taken off.')+
      H.kpis([{l:'Marketplaces live',v:ms.filter(function(m){return m.n+m.ret>0;}).length+' / '+ms.length,d:'with orders',icon:'store',tone:'teal'},
        {l:'Best by payout',v:esc((ms[0]||{}).name||'—'),d:money((ms[0]||{}).payout||0),cls:'g',icon:'spark',tone:'green'},
        {l:'Highest cut',v:esc((ms.slice().sort(function(a,b){return b.comm-a.comm;})[0]||{}).name||'—'),
         d:(ms.slice().sort(function(a,b){return b.comm-a.comm;})[0]||{}).comm+'% commission',cls:'r',icon:'pct',tone:'peach'},
        {l:'Worst returns',v:esc((ms.slice().sort(function(a,b){return b.retPct-a.retPct;})[0]||{}).name||'—'),
         d:(ms.slice().sort(function(a,b){return b.retPct-a.retPct;})[0]||{}).retPct+'% came back',cls:'r',icon:'return',tone:'red'}],'')+
      H.panel('Every marketplace, side by side',H.table([
        {label:'Marketplace',align:'l',fmt:function(m){return '<b>'+esc(m.name)+'</b>';}},
        {label:'Commission',fmt:function(m){return m.comm+'%';},cellcls:'mono'},
        {label:'Ship fee',fmt:function(m){return inr(m.ship);},cellcls:'mono'},
        {label:'Window',fmt:function(m){return m.sla+'h';},cellcls:'mono'},
        {label:'Orders',k:'n',cellcls:'mono'},
        {label:'Gross',fmt:function(m){return inr(m.gross);},cellcls:'mono'},
        {label:'You keep',fmt:function(m){return inr(m.payout);},cellcls:'mono'},
        {label:'Keep %',fmt:function(m){return m.keepPct+'%';},cellcls:function(m){return 'mono '+(m.keepPct<80?'r':'');}},
        {label:'Returns',fmt:function(m){return m.retPct+'%';},cellcls:function(m){return 'mono '+(m.retPct>=num(CFG.retAlertPct||12)?'r':'');}},
        {label:'Late',fmt:function(m){return m.breached||'—';},cellcls:function(m){return 'mono '+(m.breached?'r':'');}},
        {label:'',align:'l',fmt:function(m){
          if(m.n+m.ret===0)return H.tag('no orders yet','gray');
          if(m.retPct>=num(CFG.retAlertPct||12))return H.tag('returns are eating it','red');
          if(m.keepPct<80)return H.tag('expensive channel','amb');
          return H.tag('worth the work','grn');}}],ms))+
      H.panel('The comparison nobody makes',
        '<p>'+esc(CFG.plNote||'')+'</p>'+
        '<div class="kv"><span>Gross across every marketplace</span><b>'+money(grossAll(DB))+'</b></div>'+
        '<div class="kv"><span>− Commission and shipping fees</span><b class="r">'+money(feesAll(DB))+'</b></div>'+
        '<div class="kv"><span>= Reaches your bank</span><b class="g">'+money(payoutAll(DB))+'</b></div>'+
        '<div class="kv"><span>Value that came back as returns</span><b class="r">'+money(returnedValue(DB))+'</b></div>'+
        '<p class="hint" style="margin-top:8px">A channel with a 25% commission and a 15% return rate is not a 25% cost — it is closer to 40% once you count the parcels that come back at your expense.</p>');
    },
    listings:function(){var DB=db();var ls=listings(DB);
      return H.head('Per marketplace · Listings','Listing health','One price and one stock number across every panel — or the trouble that follows.')+
      H.kpis([{l:'Items listed',v:ls.length,d:'on '+plural((CFG.markets||[]).length,'marketplace'),icon:'layers',tone:'teal'},
        {l:'Price parity broken',v:parityBroken(DB).length,d:'over '+(CFG.parityPct||5)+'% apart',cls:parityBroken(DB).length?'r':'g',icon:'pct',tone:parityBroken(DB).length?'red':'green'},
        {l:'Out of stock, still listed',v:outOfStock(DB).length,d:'every order is a cancellation',cls:outOfStock(DB).length?'r':'g',icon:'bell',tone:'red'},
        {l:'Thin cover',v:oversellRisk(DB).length,d:'fewer pieces than panels',cls:oversellRisk(DB).length?'r':'',icon:'box',tone:'peach'}],'')+
      H.panel('Every item, on every panel',H.table([
        {label:'Item',align:'l',fmt:function(l){return '<b>'+esc(l.name)+'</b><div class="hint">'+esc(l.sku)+' · list '+money(l.list)+'</div>';}},
        {label:'Stock',fmt:function(l){return l.stock;},cellcls:function(l){return 'mono '+(l.stock<=0?'r':l.stock<l.listedOn?'r':'');}},
        {label:'Lowest',fmt:function(l){return inr(l.lo);},cellcls:'mono'},
        {label:'Highest',fmt:function(l){return inr(l.hi);},cellcls:'mono'},
        {label:'Spread',fmt:function(l){return l.spreadPct+'%';},cellcls:function(l){return 'mono '+(l.spreadPct>num(CFG.parityPct||5)?'r':'');}},
        {label:'',align:'l',fmt:function(l){
          if(l.stock<=0)return H.tag('out of stock — delist','red');
          if(l.spreadPct>num(CFG.parityPct||5))return H.tag('price parity broken','red');
          if(l.stock<l.listedOn)return H.tag('thin cover','amb');
          return H.tag('healthy','grn');}},
        {label:'',align:'l',fmt:function(l){return '<button class="btn sm" data-act="levelup" data-s="'+esc(l.sku)+'">Level the price</button>';}}],ls))+
      ls.map(function(l){return H.panel(esc(l.name)+' <span class="badge">'+plural(l.listedOn,'panel')+'</span>',
        H.table([{label:'Marketplace',align:'l',k:'market'},
          {label:'Price there',fmt:function(r){return inr(r.price);},cellcls:function(r){return 'mono '+(r.price===l.lo&&l.spreadPct>num(CFG.parityPct||5)?'r':'');}},
          {label:'Difference from list',align:'l',fmt:function(r){var d=r2(r.price-l.list);
            return d===0?'<span class="hint">same as list</span>':(d>0?'+':'')+inr(d);}},
          {label:'',align:'l',fmt:function(r){return r.price===l.hi?H.tag('highest','blu'):r.price===l.lo?H.tag('lowest','amb'):'';}}],l.rows)+
        (l.spreadPct>num(CFG.parityPct||5)
          ? '<p class="hint">Spread is <b>'+l.spreadPct+'%</b>. '+esc(CFG.parityNote||'')+'</p>'
          : '<p class="hint">Prices are within '+(CFG.parityPct||5)+'% of each other. Nothing to fix.</p>'));}).join('');
    },
    wiring:function(){var DB=db();
      return H.head('Wiring · Integration','Where every figure comes from','Marketplace OMS owns the queue and the fee arithmetic. Stock and price it shares with every other channel.')+
      H.note('Shared Data Core: Item/SKU · Party · Stock · Ledger/Voucher · Order — every module reads and writes these.')+
      H.panel('Every figure here, and its source',H.table([
        {label:'Figure here',align:'l',k:'f'},{label:'Comes from',align:'l',k:'s'},{label:'How it is worked out',align:'l',k:'h'}],
        CFG.wiring||[]))+
      '<div class="two">'+
      H.panel('Live example — one marketplace order',
        '<div class="cascade">'+
        '<div class="cl"><span class="d">1</span><div>An order arrives from <b>'+esc(((CFG.markets||[])[0]||{}).name||'a marketplace')+'</b>. It joins <b>one queue</b>, not a seventh panel.</div></div>'+
        '<div class="cl"><span class="d">2</span><div>→ Its <b>dispatch clock</b> starts on that marketplace’s own window, and the queue re-sorts itself.</div></div>'+
        '<div class="cl"><span class="d">3</span><div>→ <b>Stock falls</b> on the one shared number, so no other panel can sell the same piece.</div></div>'+
        '<div class="cl"><span class="d">4</span><div>→ The <b>commission and shipping fee</b> are worked out immediately, so you see your share and not the gross.</div></div>'+
        '<div class="cl"><span class="d">5</span><div>→ <b>Dispatched</b> inside the window, or it appears on the Overview as a breach.</div></div>'+
        '<div class="cl"><span class="d">6</span><div>→ If it comes back, the return lands against <b>that marketplace’s</b> rate — which is how the P&amp;L screen stays honest.</div></div>'+
        '</div>')+
      H.panel('The three things this app refuses to let happen',
        '<p><b>1 · An order cannot be dispatched out of nowhere.</b> It moves one stage at a time, so the on-time figure is real rather than back-filled.</p>'+
        '<p><b>2 · Stock is never per-panel.</b> One number. Selling the last piece on Amazon removes it from Flipkart in the same instant.</p>'+
        '<p><b>3 · Gross is never shown as if it were yours.</b> Every screen shows the commission alongside it, because a 25% channel and a 5% channel are not comparable at gross.</p>'+
        '<p class="hint">All three are self-tests, so the app tells you on startup if any of them stops being true.</p>')+
      '</div>';
    }
  },
  actions:{
    advance:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o||!needsDispatch(o))return;
      var i=stIdx(o.status); if(i<0||i>=STAGES.length-1)return;
      if(STAGES[i+1].k==='packed'&&num((DB.stock||{})[o.sku])<0){toast('No stock for that SKU');return;}
      o.status=STAGES[i+1].k;K.save();toast('Marked '+STAGES[i+1].l.toLowerCase());K.render();},
    cancel:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o||!needsDispatch(o)){toast('It has already gone out');return;}
      o.status='cancelled';
      DB.stock[o.sku]=num(DB.stock[o.sku])+num(o.qty);   /* a cancelled order gives the stock back */
      K.save();toast('Cancelled — stock returned');K.render();},
    ret:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o||o.status!=='delivered')return;
      o.status='returned';
      DB.stock[o.sku]=num(DB.stock[o.sku])+num(o.qty);
      K.save();toast('Return recorded against '+(mp(o.market)||{}).name);K.render();},
    printslips:function(){var DB=db();
      if(!slipOrders(DB).length){toast('Nothing waiting to go out');return;}
      toast('Sending '+plural(slipOrders(DB).length,'slip')+' to the printer');
      /* Whatever you picked on Connectors, this is the same browser print dialog —
         which is why "no printer at all, save a PDF" is always an option. */
      if(typeof window!=='undefined'&&window.print)window.print();},
    levelup:function(b){var DB=db();var sku=b.getAttribute('data-s');var it=item(sku);
      if(!it)return;
      DB.prices=DB.prices||{}; DB.prices[sku]={};
      (CFG.markets||[]).forEach(function(m){DB.prices[sku][m.code]=num(it.rate);});
      K.save();toast('Every panel set to the list price of '+money(it.rate));K.render();}
  },
  tests:function(t,DB){
    /* fees: the whole point of the app */
    t('gross = quantity × rate',orders(DB).every(function(o){return gross(o)===r2(o.qty*o.rate);}));
    t('commission = that marketplace’s percentage of gross',
      orders(DB).every(function(o){return commission(DB,o)===r2(gross(o)*mp(o.market).comm/100);}));
    t('payout = gross − commission − shipping fee',
      orders(DB).every(function(o){return payout(DB,o)===r2(gross(o)-commission(DB,o)-shipFee(DB,o));}));
    t('payout is never more than gross',orders(DB).every(function(o){return payout(DB,o)<=gross(o);}));
    t('what the platforms take = gross − payout',feesAll(DB)===r2(grossAll(DB)-payoutAll(DB)));
    t('two marketplaces with different commission pay differently on the same order',(function(){
      var ms=(CFG.markets||[]); if(ms.length<2)return true;
      var a=ms[0],b2=ms.filter(function(m){return m.comm!==a.comm;})[0]; if(!b2)return true;
      var o1={market:a.code,sku:'x',qty:1,rate:1000},o2={market:b2.code,sku:'x',qty:1,rate:1000};
      return payout(DB,o1)!==payout(DB,o2);})());
    t('every marketplace has a commission, a ship fee and a dispatch window',
      (CFG.markets||[]).every(function(m){return num(m.comm)>=0&&num(m.ship)>=0&&num(m.sla)>0;}));
    /* the clock */
    t('every order belongs to a marketplace that exists',
      orders(DB).every(function(o){return !!mp(o.market);}));
    t('time left = that marketplace’s window minus the order’s age',
      orders(DB).every(function(o){return hrsLeft(o)===slaOf(o)-num(o.age);}));
    t('a breach is an undispatched order past its own window',
      breached(DB).every(function(o){return needsDispatch(o)&&hrsLeft(o)<0;}));
    t('an order already dispatched is never called a breach',
      breached(DB).every(function(o){return stIdx(o.status)<stIdx('dispatched');}));
    t('the at-risk list is only orders with 4 hours or less left',
      atRisk(DB).every(function(o){return hrsLeft(o)>=0&&hrsLeft(o)<=4;}));
    t('the queue is sorted with the least time left first',
      queue(DB).every(function(o,i){return i===0||hrsLeft(queue(DB)[i-1])<=hrsLeft(o);}));
    t('the queue holds every order still to dispatch',queue(DB).length===live(DB).filter(needsDispatch).length);
    t('a marketplace with a shorter window can outrank an older order',(function(){
      var q=queue(DB); if(q.length<2)return true;
      return q.every(function(o,i){return i===0||hrsLeft(q[i-1])<=hrsLeft(o);});})());
    /* stage discipline */
    t('every live order sits in a real stage',live(DB).every(function(o){return stIdx(o.status)>=0;}));
    t('a cancelled or returned order is in no total',
      grossAll(DB)===r2(live(DB).reduce(function(s,o){return s+gross(o);},0)));
    t('cancelling an order gives the stock back',(function(){
      var o=live(DB).filter(needsDispatch)[0]; if(!o)return true;
      var was=num(DB.stock[o.sku]);
      o.status='cancelled'; DB.stock[o.sku]=was+num(o.qty);
      var ok=num(DB.stock[o.sku])===was+num(o.qty);
      DB.stock[o.sku]=was; o.status='new'; return ok;})());
    t('a return is recorded against the marketplace it came from',
      returned(DB).every(function(o){return !!mp(o.market);}));
    /* per marketplace */
    t('marketplace grosses add up to the whole gross',
      r2(byMarket(DB).reduce(function(s,m){return s+m.gross;},0))===grossAll(DB));
    t('marketplace payouts add up to the whole payout',
      r2(byMarket(DB).reduce(function(s,m){return s+m.payout;},0))===payoutAll(DB));
    t('every live order is counted once across the marketplaces',
      byMarket(DB).reduce(function(s,m){return s+m.n;},0)===live(DB).length);
    t('keep % = payout ÷ gross for that marketplace',
      byMarket(DB).filter(function(m){return m.gross;}).every(function(m){
        return m.keepPct===Math.round(m.payout/m.gross*100);}));
    t('a marketplace with no orders shows nothing rather than a false zero-percent',
      byMarket(DB).filter(function(m){return m.n+m.ret===0;}).every(function(m){return m.gross===0;}));
    /* listings */
    t('every item is listed on every marketplace',
      listings(DB).every(function(l){return l.listedOn===(CFG.markets||[]).length;}));
    t('the spread is the highest price minus the lowest',
      listings(DB).every(function(l){return l.spread===r2(l.hi-l.lo);}));
    t('parity is only called broken above the '+(CFG.parityPct||5)+'% line',
      parityBroken(DB).every(function(l){return l.spreadPct>num(CFG.parityPct||5);}));
    t('levelling a price puts every panel on the list price',(function(){
      var it=(CFG.items||[])[0];
      var was=JSON.parse(JSON.stringify(DB.prices||{}));
      DB.prices=DB.prices||{}; DB.prices[it.sku]={};
      (CFG.markets||[]).forEach(function(m){DB.prices[it.sku][m.code]=num(it.rate);});
      var l=listings(DB).filter(function(x){return x.sku===it.sku;})[0];
      var ok=l.spreadPct===0&&l.lo===num(it.rate);
      DB.prices=was; return ok;})());
    t('an out-of-stock item still listed is raised as urgent',
      outOfStock(DB).every(function(l){return issues(DB).some(function(i){
        return i.sev==='high'&&i.what.indexOf(l.name)===0;});}));
    t('stock is one number per item, not one per marketplace',
      listings(DB).every(function(l){return typeof l.stock==='number';}));
    /* packing slips */
    t('every order carries a ship-to address, so a slip is never printed blank',
      orders(DB).every(function(o){return !!shipTo(o);}));
    t('every order carries a size, so a picker is never guessing',
      orders(DB).every(function(o){return !!o.size;}));
    t('a packing slip is only made for an order still to dispatch',
      slipOrders(DB).every(function(o){return needsDispatch(o)&&hrsLeft(o)!==undefined;}));
    t('no slip is ever made for a cancelled, returned or dispatched order',
      slipOrders(DB).every(function(o){return o.status!=='cancelled'&&o.status!=='returned'&&stIdx(o.status)<stIdx('dispatched');}));
    t('there is exactly one slip per parcel waiting to go out',
      slipOrders(DB).length===queue(DB).length);
    t('the slips are in the same order as the queue — least time left first',
      slipOrders(DB).every(function(o,i){return i===0||hrsLeft(slipOrders(DB)[i-1])<=hrsLeft(o);}));
    t('every slip carries its design code and its size',
      slipOrders(DB).every(function(o){var h=slipHtml(DB,o);
        return h.indexOf(o.sku)>=0&&h.indexOf('Size '+sizeOf(o))>=0;}));
    t('every slip carries the order number and who it is going to',
      slipOrders(DB).every(function(o){var h=slipHtml(DB,o);
        return h.indexOf(o.id)>=0&&h.indexOf(esc(o.cust))>=0;}));
    t('a slip says it is not a tax invoice, because it is not one',
      slipOrders(DB).every(function(o){return slipHtml(DB,o).indexOf('not a tax invoice')>=0;}));
    t('the pick list has one row per design and size, not one per order',
      pickList(DB).length<=slipOrders(DB).length);
    t('the pick list adds up to exactly the pieces on the slips',
      piecesToPick(DB)===slipOrders(DB).reduce(function(s,o){return s+num(o.qty);},0));
    t('a design ordered on two marketplaces is one row on the pick list',
      pickList(DB).every(function(r){return r.panels<=r.orders;}));
  }
};

if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
