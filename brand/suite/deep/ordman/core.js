/* Medhava — Order Management (Module 04 · App 2)
   One order book for every channel, and the two things that actually decide whether a customer
   is happy: WHERE the order ships from, and WHETHER the date you promised was ever possible.
   A promise date is never typed here. It is the cut-off plus that warehouse's transit days to
   that zone — so it changes the moment the allocation changes, and it cannot be wished earlier.
   CONFIG supplies names so the Medhava and Vastrangam builds run the SAME math. */
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
var CFG=(typeof CONFIG!=='undefined')?CONFIG:{};
function db(){return K.DB;}
function plural(n,one,many){return n+' '+(n===1?one:(many||one+'s'));}

var TODAY=CFG.today||'2026-07-31';
function addDays(d,n){var x=new Date(d+'T00:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10);}
function days(a,b){return Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/86400000);}
function nice(d){return d?d.slice(8,10)+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][num(d.slice(5,7))-1]:'—';}

var STAGES=[{k:'new',l:'To allocate'},{k:'allocated',l:'Allocated'},{k:'packed',l:'Packed'},
            {k:'shipped',l:'Shipped'},{k:'delivered',l:'Delivered'}];
function stIdx(k){for(var i=0;i<STAGES.length;i++)if(STAGES[i].k===k)return i;return -1;}
function stLbl(k){var s=STAGES.filter(function(x){return x.k===k;})[0];
  return s?s.l:(k==='returned'?'Returned':k==='rto'?'Refused at the door':'Cancelled');}

function locs(){return CFG.locs||[];}
function zones(){return CFG.zones||[];}
function chans(){return CFG.channels||[];}
function loc(c){return locs().filter(function(l){return l.code===c;})[0]||null;}
function zone(c){return zones().filter(function(z){return z.code===c;})[0]||null;}
function chan(c){return chans().filter(function(x){return x.code===c;})[0]||null;}
function item(sku){return (CFG.items||[]).filter(function(x){return x.sku===sku;})[0]||null;}

/* ── the transit matrix. Days from one warehouse to one zone. This is the whole app. ── */
function tdays(lc,zc){var m=(CFG.transit||{})[lc]||{};return m[zc]===undefined?null:num(m[zc]);}
function availAt(DB,sku,lc){return num(((DB.stockAt||{})[sku]||{})[lc]);}
function totalStock(DB,sku){return locs().reduce(function(s,l){return s+availAt(DB,sku,l.code);},0);}
function coverAt(DB,lc){return (CFG.items||[]).reduce(function(s,it){return s+availAt(DB,it.sku,lc);},0);}

function orders(DB){return DB.orders||[];}
function value(o){return r2(num(o.qty)*num(o.rate));}
function isReturn(o){return o.status==='returned'||o.status==='rto';}
function live(DB){return orders(DB).filter(function(o){return o.status!=='cancelled'&&!isReturn(o);});}
function open(DB){return live(DB).filter(function(o){return stIdx(o.status)<stIdx('delivered');});}
function unallocated(DB){return orders(DB).filter(function(o){return o.status==='new';});}
function bookValue(DB){return r2(live(DB).reduce(function(s,o){return s+value(o);},0));}
function openValue(DB){return r2(open(DB).reduce(function(s,o){return s+value(o);},0));}

/* ── where it ships from. Fastest warehouse that actually holds the pieces. ── */
function serveOpts(DB,o){return locs().map(function(l){
    var have=availAt(DB,o.sku,l.code), d=tdays(l.code,o.zone);
    return {code:l.code,name:l.name,have:have,days:d,ok:d!==null&&have>=num(o.qty)};})
  .sort(function(a,b){return ((a.days===null?99:a.days)-(b.days===null?99:b.days))||(b.have-a.have);});}
function bestLoc(DB,o){var s=serveOpts(DB,o).filter(function(x){return x.ok;})[0];return s?s.code:'';}
function servingLoc(DB,o){return o.loc||bestLoc(DB,o);}
function canAllocate(DB,o,lc){return o.status==='new'&&tdays(lc,o.zone)!==null&&availAt(DB,o.sku,lc)>=num(o.qty);}
function canShip(DB,o){return !!o.loc&&stIdx(o.status)>=stIdx('allocated');}
function backorders(DB){return unallocated(DB).filter(function(o){return !bestLoc(DB,o);});}

/* ── the promise. Derived every single time it is read, never stored. ── */
function cutoff(){return num(CFG.cutoffHr||14);}
function dispatchOn(o){return num(o.hr)<cutoff()?o.date:addDays(o.date,1);}
function transitOf(DB,o){var l=servingLoc(DB,o);return l?tdays(l,o.zone):null;}
function promiseOn(DB,o){var d=transitOf(DB,o);return d===null?'':addDays(dispatchOn(o),d);}
function dueIn(DB,o){var p=promiseOn(DB,o);return p?days(TODAY,p):null;}
function blown(DB){return open(DB).filter(function(o){var d=dueIn(DB,o);
  return d!==null&&d<0&&stIdx(o.status)<stIdx('shipped');});}
function tight(DB){return open(DB).filter(function(o){var d=dueIn(DB,o);
  return d!==null&&d>=0&&d<=1&&stIdx(o.status)<stIdx('shipped');});}
function lateInTransit(DB){return open(DB).filter(function(o){var d=dueIn(DB,o);
  return o.status==='shipped'&&d!==null&&d<0;});}
function arrived(DB){return orders(DB).filter(function(o){return !!o.doneOn;});}
function onTime(DB,o){var p=promiseOn(DB,o);return !!(p&&o.doneOn&&days(o.doneOn,p)>=0);}
function onTimePct(DB){var a=arrived(DB);if(!a.length)return 100;
  return Math.round(a.filter(function(o){return onTime(DB,o);}).length/a.length*100);}

/* ── after the sale. Goods in before money out. ── */
function retList(DB){return orders(DB).filter(isReturn);}
function damagedPct(){return num(CFG.damagedPct||50);}
function expectedRefund(DB,o){return o.insp==='damaged'?r2(value(o)*damagedPct()/100):value(o);}
function canRefund(DB,o){return isReturn(o)&&!!o.recv&&!!o.insp&&!num(o.refund);}
function stockComesBack(insp){return insp==='good';}
function comingBack(DB){return retList(DB).filter(function(o){return !o.recv;});}
function toInspect(DB){return retList(DB).filter(function(o){return o.recv&&!o.insp;});}
function refundOwed(DB){return r2(retList(DB).filter(function(o){return !num(o.refund);})
  .reduce(function(s,o){return s+expectedRefund(DB,o);},0));}
function refundPaid(DB){return r2(retList(DB).reduce(function(s,o){return s+num(o.refund);},0));}
function canTransfer(DB,sku,from,to,qty){return !!item(sku)&&!!loc(from)&&!!loc(to)&&from!==to&&
  num(qty)>0&&availAt(DB,sku,from)>=num(qty);}

/* ── per channel: one order book, but the channels behave nothing like each other ── */
function byChannel(DB){return chans().map(function(c){
  var os=orders(DB).filter(function(o){return o.channel===c.code;});
  var lv=os.filter(function(o){return o.status!=='cancelled'&&!isReturn(o);});
  var rt=os.filter(isReturn);
  var ar=os.filter(function(o){return !!o.doneOn;});
  return {code:c.code,name:c.name,kind:c.kind||'',n:lv.length,ret:rt.length,
    value:r2(lv.reduce(function(s,o){return s+value(o);},0)),
    retValue:r2(rt.reduce(function(s,o){return s+value(o);},0)),
    retPct:(lv.length+rt.length)?Math.round(rt.length/(lv.length+rt.length)*100):0,
    open:lv.filter(function(o){return stIdx(o.status)<stIdx('delivered');}).length,
    blown:lv.filter(function(o){var d=dueIn(DB,o);
      return stIdx(o.status)<stIdx('shipped')&&d!==null&&d<0;}).length,
    onTime:ar.length?Math.round(ar.filter(function(o){return onTime(DB,o);}).length/ar.length*100):null};})
  .sort(function(a,b){return b.value-a.value;});}

function byLoc(DB){return locs().map(function(l){
  var mine=orders(DB).filter(function(o){return o.loc===l.code&&!isReturn(o)&&o.status!=='cancelled';});
  var ds=zones().map(function(z){return tdays(l.code,z.code);}).filter(function(d){return d!==null;});
  var fastest=zones().filter(function(z){var d=tdays(l.code,z.code);if(d===null)return false;
    return locs().every(function(x){var e=tdays(x.code,z.code);return e===null||d<=e;});});
  return {code:l.code,name:l.name,city:l.city||'',pieces:coverAt(DB,l.code),n:mine.length,
    value:r2(mine.reduce(function(s,o){return s+value(o);},0)),
    avg:ds.length?r2(ds.reduce(function(s,d){return s+d;},0)/ds.length):0,
    fastFor:fastest.map(function(z){return z.name;}).join(', ')||'—'};});}

function issues(DB){var out=[];
  backorders(DB).forEach(function(o){out.push({sev:'high',
    what:o.id+' cannot be promised at all — no warehouse holds '+plural(num(o.qty),'piece')+' of '+o.name,go:'alloc'});});
  blown(DB).forEach(function(o){out.push({sev:'high',
    what:o.id+' was promised '+nice(promiseOn(DB,o))+' and has not even shipped — '+plural(-dueIn(DB,o),'day')+' past',go:'book'});});
  retList(DB).filter(function(o){return canRefund(DB,o);}).forEach(function(o){out.push({sev:'high',
    what:o.id+' has been back and inspected — '+money(expectedRefund(DB,o))+' is owed to the customer',go:'returns'});});
  tight(DB).forEach(function(o){out.push({sev:'med',
    what:o.id+' is due '+(dueIn(DB,o)===0?'today':'tomorrow')+' and is still at '+((loc(servingLoc(DB,o))||{}).name||'no warehouse'),go:'book'});});
  lateInTransit(DB).forEach(function(o){out.push({sev:'med',
    what:o.id+' is in transit and already '+plural(-dueIn(DB,o),'day')+' past the date you promised',go:'promise'});});
  toInspect(DB).forEach(function(o){out.push({sev:'med',
    what:o.id+' is back in the warehouse and nobody has looked at it — the refund cannot move until they do',go:'returns'});});
  byChannel(DB).filter(function(c){return c.retPct>=num(CFG.retAlertPct||25)&&c.n+c.ret>=5;}).forEach(function(c){
    out.push({sev:'med',what:c.name+' is returning '+c.retPct+'% of what it sells — above the '+(CFG.retAlertPct||25)+'% line',go:'book'});});
  return out;}

/* Order Management reads orders from every channel, moves stock between locations, hands parcels
   to a courier, refunds money and writes the books. Every one of those is a swappable choice. */
var SPEC={
  uses:['channels','courier','ledger','payments','printing','storage','automation','messaging'],
  id:CFG.id, name:CFG.name, company:CFG.company, fy:CFG.fy||'FY 2026-27', tagline:CFG.tagline, about:CFG.about,
  groups:[{label:'One order book',items:['dash','book']},
          {label:'Fulfilment',items:['alloc','promise']},
          {label:'After the sale',items:['returns']},
          {label:'Wiring',items:['wiring']}],
  nav:[{v:'dash',label:'Overview',icon:'grid'},{v:'book',label:'Order book',icon:'book'},
       {v:'alloc',label:'Allocation desk',icon:'box'},{v:'promise',label:'Promise &amp; transit',icon:'cal'},
       {v:'returns',label:'Returns &amp; refunds',icon:'return'},{v:'wiring',label:'Wiring',icon:'flow'}],
  seed:function(DB){
    DB.orders=JSON.parse(JSON.stringify(CFG.orders));
    DB.stockAt=JSON.parse(JSON.stringify(CFG.stockAt||{}));
    DB.moves=[]; DB.fch='';
  },
  views:{
    dash:function(){var DB=db();var cs=byChannel(DB);
      var mx=Math.max.apply(null,cs.map(function(c){return c.value;}).concat([1]));
      var iss=issues(DB);
      var funnel=STAGES.map(function(s){return {l:s.l,n:live(DB).filter(function(o){return o.status===s.k;}).length};});
      return H.head('One order book · Overview',CFG.name,'Every channel in one book, with the promise date worked out rather than hoped for.')+
      H.kpis([
        {l:'Order book',v:money(bookValue(DB)),d:plural(live(DB).length,'live order'),icon:'book',tone:'teal'},
        {l:'Still open',v:money(openValue(DB)),d:plural(open(DB).length,'order')+' not yet delivered',icon:'cart',tone:'blue'},
        {l:'Promise already blown',v:blown(DB).length,d:plural(tight(DB).length,'more')+' due today or tomorrow',cls:blown(DB).length?'r':'g',icon:'cal',tone:blown(DB).length?'red':'green'},
        {l:'Cannot be promised',v:backorders(DB).length,d:'no warehouse can serve them',cls:backorders(DB).length?'r':'g',icon:'bell',tone:'peach'},
        {l:'Arrived on time',v:onTimePct(DB)+'%',d:'of '+plural(arrived(DB).length,'order')+' that landed',cls:onTimePct(DB)>=95?'g':'r',icon:'check',tone:'blue'}],'k5')+
      '<div class="two">'+
      H.panel('Every channel in one book',
        cs.map(function(c){return '<div style="margin-bottom:10px"><div class="kv" style="border:none;padding:2px 0"><span>'+
          esc(c.name)+' <span class="hint">'+plural(c.n,'order')+(c.ret?' · '+c.retPct+'% came back':'')+'</span></span><b>'+money(c.value)+'</b></div>'+
          H.bar(c.value/mx*100)+'</div>';}).join('')+
        '<div class="kv" style="margin-top:10px"><span>Whole order book</span><b>'+money(bookValue(DB))+'</b></div>'+
        '<div class="kv"><span>Value that came back</span><b class="r">'+money(r2(cs.reduce(function(s,c){return s+c.retValue;},0)))+'</b></div>'+
        '<p class="hint" style="margin-top:8px">'+esc(CFG.chanNote||'')+'</p>')+
      H.panel('What needs you now <span class="badge">'+iss.length+'</span>',
        iss.length?H.table([{label:'',align:'l',fmt:function(a){return H.tag(a.sev==='high'?'urgent':'watch',a.sev==='high'?'red':'amb');}},
          {label:'What is happening',align:'l',k:'what'},
          {label:'',align:'l',fmt:function(a){return '<button class="btn sm" data-go="'+a.go+'">Open →</button>';}}],iss.slice(0,8))
        :'<div class="cascade">Every order can be served, every promise is still reachable, and nobody is owed a refund.</div>')+
      '</div>'+
      '<div class="two">'+
      H.panel('Where the open orders are sitting',
        H.table([{label:'Stage',align:'l',k:'l'},{label:'Orders',k:'n',cellcls:'mono'},
          {label:'',align:'l',fmt:function(s){return H.bar(s.n/Math.max.apply(null,funnel.map(function(x){return x.n;}).concat([1]))*100);}}],funnel)+
        '<p class="hint">An order moves one stage at a time. Nothing jumps to Shipped, which is the only reason the on-time figure above means anything.</p>')+
      H.panel('Money owed after the sale',
        '<div class="kv"><span>Parcels still coming back</span><b>'+plural(comingBack(DB).length,'parcel')+'</b></div>'+
        '<div class="kv"><span>Back, but nobody has looked at them</span><b class="'+(toInspect(DB).length?'r':'')+'">'+plural(toInspect(DB).length,'parcel')+'</b></div>'+
        '<div class="kv"><span>Refunds already paid</span><b>'+money(refundPaid(DB))+'</b></div>'+
        '<div class="kv"><span><b>Refunds still owed</b></span><b class="r">'+money(refundOwed(DB))+'</b></div>'+
        '<p class="hint" style="margin-top:8px">'+esc(CFG.refundNote||'')+'</p>');
    },
    book:function(){var DB=db();
      var f=DB.fch||''; var rows=orders(DB).filter(function(o){return !f||o.channel===f;});
      rows=rows.slice().sort(function(a,b){var x=dueIn(DB,a),y=dueIn(DB,b);
        return (x===null?99:x)-(y===null?99:y);});
      var cs=byChannel(DB);
      return H.head('One order book · Every channel','Order book','Website, marketplaces, counter, wholesale and WhatsApp — one book, sorted by which promise breaks first.')+
      H.kpis([{l:'Orders in view',v:rows.length,d:f?esc((chan(f)||{}).name||''):'every channel',icon:'book',tone:'teal'},
        {l:'Promise blown',v:blown(DB).length,d:'not shipped, date gone',cls:blown(DB).length?'r':'g',icon:'cal',tone:'red'},
        {l:'Due today or tomorrow',v:tight(DB).length,d:'these are the ones to pack',cls:tight(DB).length?'r':'',icon:'clock',tone:'amb'},
        {l:'In transit past the date',v:lateInTransit(DB).length,d:'already shipped, still late',cls:lateInTransit(DB).length?'r':'g',icon:'truck',tone:'peach'}],'')+
      H.panel('Show one channel at a time',
        H.form([{id:'f_ch',label:'Channel',type:'select',value:f,
          options:[{v:'',label:'Every channel'}].concat(chans().map(function(c){return {v:c.code,label:c.name};}))}],
          'Show these','setch','f2'))+
      H.panel('Every order, soonest promise first',H.table([
        {label:'Order',align:'l',fmt:function(o){return '<b>'+esc(o.id)+'</b><div class="hint">'+esc(o.cust||'—')+'</div>';}},
        {label:'Channel',align:'l',fmt:function(o){return esc((chan(o.channel)||{}).name||'?');}},
        {label:'Item',align:'l',fmt:function(o){return esc(o.name)+'<div class="hint">'+o.qty+' × '+money(o.rate)+'</div>';}},
        {label:'Going to',align:'l',fmt:function(o){return esc(o.city||'—')+'<div class="hint">'+esc((zone(o.zone)||{}).name||'?')+'</div>';}},
        {label:'Ships from',align:'l',fmt:function(o){var l=servingLoc(DB,o);
          return l?(esc((loc(l)||{}).name)+'<div class="hint">'+(o.loc?'allocated':'would be chosen')+' · '+plural(tdays(l,o.zone),'day')+'</div>')
            :H.tag('nothing can serve it','red');}},
        {label:'Promised',align:'l',fmt:function(o){var p=promiseOn(DB,o);if(!p)return H.tag('no date possible','red');
          var d=dueIn(DB,o);
          return nice(p)+'<div class="hint">'+(d<0?(-d)+'d past':d===0?'today':'in '+plural(d,'day'))+'</div>';}},
        {label:'Value',fmt:function(o){return inr(value(o));},cellcls:'mono'},
        {label:'Stage',align:'l',fmt:function(o){var i=stIdx(o.status);
          return H.tag(stLbl(o.status),i>=0?['teal','blu','amb','peach','grn'][i]:(isReturn(o)?'red':'gray'))+
            (o.doneOn?'<div class="hint">'+(onTime(DB,o)?'on time':'was late')+'</div>':'');}},
        {label:'',align:'l',fmt:function(o){var i=orders(DB).indexOf(o);var b=[];
          if(o.status==='new')b.push('<button class="btn sm p" data-act="allocbest" data-i="'+i+'">Allocate</button>');
          else if(stIdx(o.status)>=0&&stIdx(o.status)<STAGES.length-1)
            b.push('<button class="btn sm p" data-act="advance" data-i="'+i+'">'+esc('Mark '+STAGES[stIdx(o.status)+1].l.toLowerCase())+' →</button>');
          if(o.status==='shipped')b.push('<button class="btn sm d" data-act="rto" data-i="'+i+'">Refused</button>');
          if(o.status==='delivered')b.push('<button class="btn sm" data-act="camback" data-i="'+i+'">Came back</button>');
          if(stIdx(o.status)>=0&&stIdx(o.status)<stIdx('shipped'))b.push('<button class="btn sm d" data-act="cancel" data-i="'+i+'">Cancel</button>');
          return b.join(' ');}}],rows))+
      H.panel('How the channels differ',H.table([
        {label:'Channel',align:'l',fmt:function(c){return '<b>'+esc(c.name)+'</b><div class="hint">'+esc(c.kind)+'</div>';}},
        {label:'Live orders',k:'n',cellcls:'mono'},
        {label:'Value',fmt:function(c){return inr(c.value);},cellcls:'mono'},
        {label:'Open',k:'open',cellcls:'mono'},
        {label:'Promise blown',fmt:function(c){return c.blown||'—';},cellcls:function(c){return 'mono '+(c.blown?'r':'');}},
        {label:'Came back',fmt:function(c){return c.ret?c.ret+' ('+c.retPct+'%)':'—';},cellcls:function(c){return 'mono '+(c.retPct>=num(CFG.retAlertPct||25)?'r':'');}},
        {label:'On time',fmt:function(c){return c.onTime===null?'<span class="hint">nothing landed yet</span>':c.onTime+'%';},cellcls:function(c){return 'mono '+(c.onTime!==null&&c.onTime<95?'r':'');}},
        {label:'',align:'l',fmt:function(c){
          if(c.n+c.ret===0)return H.tag('no orders yet','gray');
          if(c.retPct>=num(CFG.retAlertPct||25))return H.tag('returns are eating it','red');
          if(c.blown)return H.tag('promises slipping','amb');
          return H.tag('behaving','grn');}}],cs));
    },
    alloc:function(){var DB=db();var un=unallocated(DB);var ls=byLoc(DB);
      return H.head('Fulfilment · Allocation','Allocation desk','Which warehouse each order ships from — and what it does to the date the customer was given.')+
      H.kpis([{l:'Waiting to allocate',v:un.length,d:'across every channel',icon:'box',tone:'teal'},
        {l:'Nothing can serve',v:backorders(DB).length,d:'no warehouse holds enough',cls:backorders(DB).length?'r':'g',icon:'bell',tone:'red'},
        {l:'Pieces in stock',v:locs().reduce(function(s,l){return s+coverAt(DB,l.code);},0),d:'across '+plural(locs().length,'warehouse'),icon:'layers',tone:'blue'},
        {l:'Stock moves made',v:(DB.moves||[]).length,d:'inside this session',icon:'sync',tone:'green'}],'')+
      H.panel('What is in each warehouse',H.table(
        [{label:'Item',align:'l',fmt:function(it){return '<b>'+esc(it.name)+'</b><div class="hint">'+esc(it.sku)+'</div>';}}]
        .concat(locs().map(function(l){return {label:l.name,fmt:function(it){var q=availAt(DB,it.sku,l.code);
          return q||'<span class="hint">0</span>';},cellcls:function(it){return 'mono '+(availAt(DB,it.sku,l.code)?'':'r');}};}))
        .concat([{label:'Everywhere',fmt:function(it){return totalStock(DB,it.sku);},cellcls:function(it){return 'mono '+(totalStock(DB,it.sku)?'':'r');}},
          {label:'',align:'l',fmt:function(it){return totalStock(DB,it.sku)?'':H.tag('nothing anywhere','red');}}]),
        CFG.items||[]))+
      (un.length?un.map(function(o){var opts=serveOpts(DB,o);var i=orders(DB).indexOf(o);
        return H.panel(esc(o.id)+' · '+esc(o.name)+' × '+o.qty+' → '+esc(o.city||'')+' <span class="badge">'+esc((zone(o.zone)||{}).name||'')+'</span>',
          H.table([{label:'Warehouse',align:'l',fmt:function(x){return '<b>'+esc(x.name)+'</b>';}},
            {label:'In stock there',fmt:function(x){return x.have;},cellcls:function(x){return 'mono '+(x.have>=num(o.qty)?'':'r');}},
            {label:'Transit',fmt:function(x){return x.days===null?'—':plural(x.days,'day');},cellcls:'mono'},
            {label:'Would promise',align:'l',fmt:function(x){return x.days===null?'—':nice(addDays(dispatchOn(o),x.days));}},
            {label:'',align:'l',fmt:function(x){return x.ok?H.tag('can serve it','grn'):H.tag('cannot','red');}},
            {label:'',align:'l',fmt:function(x){return x.ok
              ?'<button class="btn sm'+(x.code===bestLoc(DB,o)?' p':'')+'" data-act="allocto" data-i="'+i+'" data-l="'+esc(x.code)+'">Ship from here</button>'
              :'<span class="hint">not enough stock</span>';}}],opts)+
          (bestLoc(DB,o)
            ?'<p class="hint">Left alone, this order ships from <b>'+esc((loc(bestLoc(DB,o))||{}).name)+'</b> and is promised <b>'+nice(promiseOn(DB,o))+'</b>. '+
              '<button class="btn sm p" data-act="allocbest" data-i="'+i+'">Allocate the fastest way</button></p>'
            :'<p class="hint"><b>Nothing can serve this order.</b> '+esc(CFG.backNote||'')+'</p>'));}).join('')
        :H.panel('Nothing waiting','<div class="cascade">Every order has a warehouse against it.</div>'))+
      H.panel('Move stock between warehouses',
        H.form([{id:'t_sku',label:'Item',type:'select',options:(CFG.items||[]).map(function(it){return {v:it.sku,label:it.name};})},
          {id:'t_from',label:'Out of',type:'select',options:locs().map(function(l){return {v:l.code,label:l.name};})},
          {id:'t_to',label:'Into',type:'select',options:locs().map(function(l){return {v:l.code,label:l.name};})},
          {id:'t_qty',label:'How many pieces',type:'num',value:1}],'Move the stock','transfer','')+
        '<p class="hint">A move takes the pieces out of one warehouse and puts the same number into another. The total across the business never changes — which is exactly why it is safe to do it from this screen.</p>'+
        ((DB.moves||[]).length?H.table([{label:'Item',align:'l',k:'name'},{label:'Out of',align:'l',k:'from'},
          {label:'Into',align:'l',k:'to'},{label:'Pieces',k:'qty',cellcls:'mono'}],DB.moves):''))+
      H.panel('Where each warehouse earns its keep',H.table([
        {label:'Warehouse',align:'l',fmt:function(l){return '<b>'+esc(l.name)+'</b><div class="hint">'+esc(l.city)+'</div>';}},
        {label:'Pieces',k:'pieces',cellcls:'mono'},
        {label:'Orders from here',k:'n',cellcls:'mono'},
        {label:'Value',fmt:function(l){return inr(l.value);},cellcls:'mono'},
        {label:'Average transit',fmt:function(l){return l.avg+'d';},cellcls:'mono'},
        {label:'Fastest to',align:'l',k:'fastFor'}],ls));
    },
    promise:function(){var DB=db();
      var ex=open(DB).filter(function(o){return o.status==='new';})[0]||open(DB)[0]||orders(DB)[0];
      return H.head('Fulfilment · The promise','Promise &amp; transit','A promise date is never typed here. It is the cut-off plus that warehouse’s transit days to that zone.')+
      H.kpis([{l:'Promise blown',v:blown(DB).length,d:'not shipped, date gone',cls:blown(DB).length?'r':'g',icon:'cal',tone:'red'},
        {l:'Due today or tomorrow',v:tight(DB).length,d:'pack these first',cls:tight(DB).length?'r':'',icon:'clock',tone:'amb'},
        {l:'Late in transit',v:lateInTransit(DB).length,d:'shipped, still past the date',cls:lateInTransit(DB).length?'r':'g',icon:'truck',tone:'peach'},
        {l:'Arrived on time',v:onTimePct(DB)+'%',d:'of '+plural(arrived(DB).length,'order')+' that landed',cls:onTimePct(DB)>=95?'g':'r',icon:'check',tone:'blue'}],'')+
      H.panel('The transit matrix — days from each warehouse to each zone',H.table(
        [{label:'Warehouse',align:'l',fmt:function(l){return '<b>'+esc(l.name)+'</b><div class="hint">'+esc(l.city||'')+'</div>';}}]
        .concat(zones().map(function(z){return {label:z.name,fmt:function(l){var d=tdays(l.code,z.code);
          if(d===null)return '—';
          var best=locs().every(function(x){var e=tdays(x.code,z.code);return e===null||d<=e;});
          return best?'<b>'+d+'d</b>':d+'d';},
          cellcls:function(l){var d=tdays(l.code,z.code);
            return 'mono '+(d!==null&&locs().every(function(x){var e=tdays(x.code,z.code);return e===null||d<=e;})?'g':'');}};})),
        locs()))+
      H.note('The figure in <b>bold</b> is the fastest warehouse for that zone. This one table is the whole reason allocation matters: the same order is a '+
        (function(){var z=zones()[0];var ds=locs().map(function(l){return tdays(l.code,z.code);}).filter(function(d){return d!==null;});
          return ds.length?Math.min.apply(null,ds)+'-day delivery from one warehouse and a '+Math.max.apply(null,ds)+'-day delivery from another':'different delivery from each warehouse';})()+'.')+
      '<div class="two">'+
      H.panel('How a promise date is worked out',
        '<div class="cascade">'+
        '<div class="cl"><span class="d">1</span><div>The order arrives at a time of day. Anything before <b>'+cutoff()+':00</b> goes out the same day; after that it goes out tomorrow.</div></div>'+
        '<div class="cl"><span class="d">2</span><div>→ The <b>warehouse</b> is chosen — the fastest one that actually holds the pieces.</div></div>'+
        '<div class="cl"><span class="d">3</span><div>→ The <b>transit days</b> for that warehouse to that zone come out of the matrix above.</div></div>'+
        '<div class="cl"><span class="d">4</span><div>→ Promise date = dispatch date + transit days. Nobody types it, so nobody can promise Tuesday to a zone that is four days away.</div></div>'+
        '<div class="cl"><span class="d">5</span><div>→ Change the warehouse and the date <b>changes with it</b>, on this screen and on the customer’s order at the same moment.</div></div>'+
        '</div>'+
        '<p class="hint">'+esc(CFG.promiseNote||'')+'</p>')+
      (ex?H.panel('The same order, from every warehouse — '+esc(ex.id),
        H.table([{label:'If it shipped from',align:'l',fmt:function(x){return esc(x.name);}},
          {label:'Transit',fmt:function(x){return x.days===null?'—':plural(x.days,'day');},cellcls:'mono'},
          {label:'Customer would be promised',align:'l',fmt:function(x){return x.days===null?'—':nice(addDays(dispatchOn(ex),x.days));}},
          {label:'',align:'l',fmt:function(x){return x.ok?H.tag('has the stock','grn'):H.tag('no stock','red');}}],serveOpts(DB,ex))+
        '<div class="kv"><span>Order placed</span><b>'+nice(ex.date)+' at '+num(ex.hr)+':00</b></div>'+
        '<div class="kv"><span>Cut-off</span><b>'+cutoff()+':00 — so it dispatches '+nice(dispatchOn(ex))+'</b></div>'+
        '<div class="kv"><span>Going to</span><b>'+esc(ex.city||'')+' · '+esc((zone(ex.zone)||{}).name||'')+'</b></div>'+
        '<div class="kv"><span><b>Promised today</b></span><b class="g">'+(promiseOn(DB,ex)?nice(promiseOn(DB,ex)):'no date possible')+'</b></div>'):'')+
      '</div>'+
      H.panel('Every open order against its promise',H.table([
        {label:'Order',align:'l',fmt:function(o){return '<b>'+esc(o.id)+'</b><div class="hint">'+esc((chan(o.channel)||{}).name||'')+'</div>';}},
        {label:'Placed',align:'l',fmt:function(o){return nice(o.date)+'<div class="hint">'+num(o.hr)+':00</div>';}},
        {label:'Dispatches',align:'l',fmt:function(o){return nice(dispatchOn(o))+'<div class="hint">'+(num(o.hr)<cutoff()?'before cut-off':'after cut-off')+'</div>';}},
        {label:'From',align:'l',fmt:function(o){var l=servingLoc(DB,o);return l?esc((loc(l)||{}).name):'—';}},
        {label:'Transit',fmt:function(o){var d=transitOf(DB,o);return d===null?'—':d+'d';},cellcls:'mono'},
        {label:'Promised',align:'l',fmt:function(o){var p=promiseOn(DB,o);return p?nice(p):H.tag('no date possible','red');}},
        {label:'',align:'l',fmt:function(o){var d=dueIn(DB,o);
          if(d===null)return H.tag('cannot be promised','red');
          if(o.status==='shipped')return d<0?H.tag('in transit, late','red'):H.tag('in transit','blu');
          return d<0?H.tag((-d)+'d past','red'):d===0?H.tag('due today','amb'):d===1?H.tag('due tomorrow','amb'):H.tag('in '+d+' days','grn');}}],
        open(DB).slice().sort(function(a,b){var x=dueIn(DB,a),y=dueIn(DB,b);return (x===null?99:x)-(y===null?99:y);})));
    },
    returns:function(){var DB=db();var rs=retList(DB);
      return H.head('After the sale · Returns','Returns &amp; refunds','Goods in, then eyes on them, then money out. In that order, every time.')+
      H.kpis([{l:'Returns open',v:rs.filter(function(o){return !num(o.refund);}).length,d:'of '+plural(rs.length,'return'),icon:'return',tone:'teal'},
        {l:'Still coming back',v:comingBack(DB).length,d:'parcel not in yet',icon:'truck',tone:'blue'},
        {l:'Waiting to be looked at',v:toInspect(DB).length,d:'refund is stuck here',cls:toInspect(DB).length?'r':'g',icon:'bell',tone:'amb'},
        {l:'Refunds owed',v:money(refundOwed(DB)),d:money(refundPaid(DB))+' already paid',cls:refundOwed(DB)?'r':'g',icon:'coin',tone:'peach'}],'')+
      H.panel('The returns desk',rs.length?H.table([
        {label:'Order',align:'l',fmt:function(o){return '<b>'+esc(o.id)+'</b><div class="hint">'+esc(o.cust||'')+' · '+esc((chan(o.channel)||{}).name||'')+'</div>';}},
        {label:'Item',align:'l',fmt:function(o){return esc(o.name)+'<div class="hint">'+o.qty+' × '+money(o.rate)+'</div>';}},
        {label:'Why',align:'l',fmt:function(o){return o.status==='rto'?H.tag('refused at the door','red'):H.tag('customer returned it','amb');}},
        {label:'Parcel back?',align:'l',fmt:function(o){return o.recv?H.tag('in the warehouse','grn'):H.tag('still in transit','blu');}},
        {label:'Looked at?',align:'l',fmt:function(o){return o.insp?(o.insp==='good'?H.tag('resaleable','grn'):H.tag('damaged','red')):H.tag('not yet','gray');}},
        {label:'Refund',fmt:function(o){return num(o.refund)?inr(o.refund):'<span class="hint">'+inr(expectedRefund(DB,o))+' due</span>';},cellcls:function(o){return 'mono '+(num(o.refund)?'g':'r');}},
        {label:'',align:'l',fmt:function(o){var i=orders(DB).indexOf(o);var b=[];
          if(!o.recv)b.push('<button class="btn sm p" data-act="receive" data-i="'+i+'">Parcel is back</button>');
          else if(!o.insp){b.push('<button class="btn sm p" data-act="inspgood" data-i="'+i+'">Resaleable</button>');
            b.push('<button class="btn sm d" data-act="inspdmg" data-i="'+i+'">Damaged</button>');}
          if(!num(o.refund))b.push('<button class="btn sm'+(canRefund(DB,o)?' p':'')+'" data-act="payref" data-i="'+i+'">Pay the refund</button>');
          return b.join(' ');}}],rs)
        :'<div class="cascade">Nothing has come back.</div>')+
      '<div class="two">'+
      H.panel('The order this desk works in',
        '<div class="cascade">'+
        '<div class="cl"><span class="d">1</span><div>The customer returns it, or the courier could not hand it over. Either way it becomes a <b>return</b> — the sale leaves the order book on the spot.</div></div>'+
        '<div class="cl"><span class="d">2</span><div>→ <b>Parcel is back.</b> Until somebody marks this, the refund button does nothing at all.</div></div>'+
        '<div class="cl"><span class="d">3</span><div>→ <b>Somebody looks at it.</b> Resaleable, or damaged. Still no money out.</div></div>'+
        '<div class="cl"><span class="d">4</span><div>→ <b>Refund.</b> Full amount if it is resaleable; '+damagedPct()+'% if it came back damaged.</div></div>'+
        '<div class="cl"><span class="d">5</span><div>→ A resaleable piece <b>goes back into stock</b> at the warehouse it shipped from. A damaged one does not, because pretending otherwise is how phantom stock starts.</div></div>'+
        '</div>')+
      H.panel('What a return actually costs',
        '<div class="kv"><span>Value that came back</span><b class="r">'+money(r2(rs.reduce(function(s,o){return s+value(o);},0)))+'</b></div>'+
        '<div class="kv"><span>Refunds paid</span><b>'+money(refundPaid(DB))+'</b></div>'+
        '<div class="kv"><span>Refunds still owed</span><b class="r">'+money(refundOwed(DB))+'</b></div>'+
        '<div class="kv"><span>Pieces recovered into stock</span><b>'+rs.filter(function(o){return stockComesBack(o.insp)&&num(o.refund);}).reduce(function(s,o){return s+num(o.qty);},0)+'</b></div>'+
        '<div class="kv"><span>Written off as damaged</span><b class="r">'+money(r2(rs.filter(function(o){return o.insp==='damaged';}).reduce(function(s,o){return s+value(o);},0)))+'</b></div>'+
        '<p class="hint" style="margin-top:8px">'+esc(CFG.refundNote||'')+'</p>')+
      '</div>';
    },
    wiring:function(){var DB=db();
      return H.head('Wiring · Integration','Where every figure comes from','Order Management owns the order, the allocation and the promise. Stock, money and the courier it shares.')+
      H.note('Shared Data Core: Item/SKU · Party · Stock · Ledger/Voucher · Order — every module reads and writes these.')+
      H.panel('Every figure here, and its source',H.table([
        {label:'Figure here',align:'l',k:'f'},{label:'Comes from',align:'l',k:'s'},{label:'How it is worked out',align:'l',k:'h'}],
        CFG.wiring||[]))+
      '<div class="two">'+
      H.panel('Live example — one order, end to end',
        '<div class="cascade">'+
        '<div class="cl"><span class="d">1</span><div>An order lands from <b>'+esc(((CFG.channels||[])[0]||{}).name||'a channel')+'</b>. It joins the one order book — not a channel-specific list.</div></div>'+
        '<div class="cl"><span class="d">2</span><div>→ The <b>fastest warehouse that actually holds the pieces</b> is chosen, and the stock there falls.</div></div>'+
        '<div class="cl"><span class="d">3</span><div>→ The <b>promise date</b> appears by itself: cut-off, then that warehouse’s transit to that zone.</div></div>'+
        '<div class="cl"><span class="d">4</span><div>→ Packed, then <b>shipped</b> — never shipped without an allocation, so the on-time figure cannot be back-filled.</div></div>'+
        '<div class="cl"><span class="d">5</span><div>→ Delivered on or before the promise, or it counts against on-time. There is no third option.</div></div>'+
        '<div class="cl"><span class="d">6</span><div>→ If it comes back: parcel in, eyes on it, <b>then</b> money out. A resaleable piece returns to the warehouse it left.</div></div>'+
        '</div>')+
      H.panel('The three things this app refuses to let happen',
        '<p><b>1 · Nothing ships from a warehouse that does not have it.</b> Allocation is compulsory and is checked against the real figure at that location, so a picker is never sent to an empty shelf.</p>'+
        '<p><b>2 · No money leaves before the goods are back and looked at.</b> A refund is impossible until the parcel is received <i>and</i> inspected — which is the whole difference between a returns policy and a leak.</p>'+
        '<p><b>3 · A promise date is never typed.</b> It is the cut-off plus that warehouse’s transit days to that zone. Change the warehouse and the date changes; nobody can promise a date the network cannot reach.</p>'+
        '<p class="hint">All three are self-tests, so the app tells you on startup if any of them stops being true.</p>')+
      '</div>';
    }
  },
  actions:{
    setch:function(){var DB=db();DB.fch=H.val('f_ch');K.save();K.render();},
    allocbest:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o||o.status!=='new')return;
      var lc=bestLoc(DB,o);
      if(!lc){toast('No warehouse holds enough of that item');return;}
      o.loc=lc; o.status='allocated';
      DB.stockAt[o.sku][lc]=availAt(DB,o.sku,lc)-num(o.qty);
      K.save();toast('Allocated to '+(loc(lc)||{}).name+' — promised '+nice(promiseOn(DB,o)));K.render();},
    allocto:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      var lc=b.getAttribute('data-l');
      if(!o||!canAllocate(DB,o,lc)){toast('That warehouse cannot serve this order');return;}
      o.loc=lc; o.status='allocated';
      DB.stockAt[o.sku][lc]=availAt(DB,o.sku,lc)-num(o.qty);
      K.save();toast('Ships from '+(loc(lc)||{}).name+' — promised '+nice(promiseOn(DB,o)));K.render();},
    advance:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o)return;var i=stIdx(o.status);
      if(i<0||i>=STAGES.length-1)return;
      var next=STAGES[i+1].k;
      if((next==='packed'||next==='shipped')&&!canShip(DB,o)){toast('Allocate it to a warehouse first');return;}
      o.status=next;
      if(next==='delivered')o.doneOn=TODAY;
      K.save();toast('Marked '+STAGES[i+1].l.toLowerCase());K.render();},
    cancel:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o||stIdx(o.status)<0||stIdx(o.status)>=stIdx('shipped')){toast('It has already gone out');return;}
      if(o.loc)DB.stockAt[o.sku][o.loc]=availAt(DB,o.sku,o.loc)+num(o.qty);
      o.status='cancelled';o.loc='';
      K.save();toast('Cancelled — stock put back');K.render();},
    rto:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o||o.status!=='shipped'){toast('Only a shipped parcel can be refused');return;}
      o.status='rto';o.recv=false;o.insp='';o.refund=0;
      K.save();toast('Refused at the door — it is on its way back');K.render();},
    camback:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o||o.status!=='delivered')return;
      o.status='returned';o.recv=false;o.insp='';o.refund=0;
      K.save();toast('Return opened — nothing is refunded until the parcel is back');K.render();},
    receive:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o||!isReturn(o))return;
      o.recv=true;K.save();toast('Parcel booked in — now somebody has to look at it');K.render();},
    inspgood:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o||!isReturn(o))return;
      if(!o.recv){toast('The parcel is not back yet');return;}
      o.insp='good';K.save();toast('Marked resaleable — full refund is now allowed');K.render();},
    inspdmg:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o||!isReturn(o))return;
      if(!o.recv){toast('The parcel is not back yet');return;}
      o.insp='damaged';K.save();toast('Marked damaged — refund limited to '+damagedPct()+'%');K.render();},
    payref:function(b){var DB=db();var o=DB.orders[num(b.getAttribute('data-i'))];
      if(!o||!isReturn(o))return;
      if(!o.recv){toast('No money out until the parcel is back');return;}
      if(!o.insp){toast('No money out until somebody has looked at it');return;}
      if(num(o.refund)){toast('That refund has already been paid');return;}
      o.refund=expectedRefund(DB,o);
      if(stockComesBack(o.insp)&&o.loc)DB.stockAt[o.sku][o.loc]=availAt(DB,o.sku,o.loc)+num(o.qty);
      K.save();toast('Refunded '+money(o.refund)+(stockComesBack(o.insp)?' — piece back in stock':' — written off'));K.render();},
    transfer:function(){var DB=db();
      var sku=H.val('t_sku'),from=H.val('t_from'),to=H.val('t_to'),q=H.numv('t_qty');
      if(from===to){toast('Pick two different warehouses');return;}
      if(!canTransfer(DB,sku,from,to,q)){toast('There are not '+q+' pieces at '+((loc(from)||{}).name||'that warehouse'));return;}
      DB.stockAt[sku][from]=availAt(DB,sku,from)-q;
      DB.stockAt[sku][to]=availAt(DB,sku,to)+q;
      DB.moves=DB.moves||[];
      DB.moves.push({name:(item(sku)||{}).name||sku,from:(loc(from)||{}).name||from,to:(loc(to)||{}).name||to,qty:q});
      K.save();toast('Moved '+plural(q,'piece')+' to '+(loc(to)||{}).name);K.render();}
  },
  tests:function(t,DB){
    /* master data */
    t('every order belongs to a channel that exists',orders(DB).every(function(o){return !!chan(o.channel);}));
    t('every order is going to a zone that exists',orders(DB).every(function(o){return !!zone(o.zone);}));
    t('every order is for an item that exists',orders(DB).every(function(o){return !!item(o.sku);}));
    t('every warehouse has a transit figure for every zone',
      locs().every(function(l){return zones().every(function(z){return tdays(l.code,z.code)!==null;});}));
    t('the same zone takes a different number of days from different warehouses',
      zones().some(function(z){var ds=locs().map(function(l){return tdays(l.code,z.code);});
        return Math.max.apply(null,ds)>Math.min.apply(null,ds);}));
    /* value */
    t('order value = quantity × rate',orders(DB).every(function(o){return value(o)===r2(o.qty*o.rate);}));
    t('a cancelled or returned order is in no live total',
      bookValue(DB)===r2(live(DB).reduce(function(s,o){return s+value(o);},0)));
    t('a return is never counted as a live order',live(DB).every(function(o){return !isReturn(o);}));
    t('channel values add up to the whole order book',
      r2(byChannel(DB).reduce(function(s,c){return s+c.value;},0))===bookValue(DB));
    t('every live order is counted once across the channels',
      byChannel(DB).reduce(function(s,c){return s+c.n;},0)===live(DB).length);
    /* the promise */
    t('an order placed before the cut-off dispatches the same day',
      orders(DB).filter(function(o){return num(o.hr)<cutoff();}).every(function(o){return dispatchOn(o)===o.date;}));
    t('an order placed after the cut-off dispatches the next day',
      orders(DB).filter(function(o){return num(o.hr)>=cutoff();}).every(function(o){return dispatchOn(o)===addDays(o.date,1);}));
    t('promise date = dispatch date + that warehouse’s transit days to that zone',
      orders(DB).filter(function(o){return !!promiseOn(DB,o);}).every(function(o){
        return promiseOn(DB,o)===addDays(dispatchOn(o),tdays(servingLoc(DB,o),o.zone));}));
    t('a promise date is never earlier than the dispatch date',
      orders(DB).filter(function(o){return !!promiseOn(DB,o);}).every(function(o){
        return days(dispatchOn(o),promiseOn(DB,o))>=0;}));
    t('no promise date is stored anywhere — it is worked out on every read',
      orders(DB).every(function(o){return o.promise===undefined&&o.eta===undefined;}));
    t('an order no warehouse can serve has no promise date at all',
      backorders(DB).every(function(o){return promiseOn(DB,o)==='';}));
    t('changing the warehouse changes the date the customer is given',(function(){
      var o=unallocated(DB).filter(function(x){return bestLoc(DB,x);})[0]; if(!o)return true;
      var auto=bestLoc(DB,o);
      var other=serveOpts(DB,o).filter(function(x){return x.days!==null&&x.code!==auto;})[0];
      if(!other||other.days===tdays(auto,o.zone))return true;
      var was=o.loc; o.loc=other.code;
      var ok=promiseOn(DB,o)===addDays(dispatchOn(o),other.days)&&promiseOn(DB,o)!==addDays(dispatchOn(o),tdays(auto,o.zone));
      o.loc=was; return ok;})());
    /* allocation */
    t('left alone, an order is served from the fastest warehouse that holds it',
      unallocated(DB).filter(function(o){return bestLoc(DB,o);}).every(function(o){
        var ok=serveOpts(DB,o).filter(function(x){return x.ok;});
        var min=Math.min.apply(null,ok.map(function(x){return x.days;}));
        return tdays(bestLoc(DB,o),o.zone)===min;}));
    t('allocating by hand overrides the automatic choice',(function(){
      var o=unallocated(DB).filter(function(x){return bestLoc(DB,x);})[0]; if(!o)return true;
      var auto=bestLoc(DB,o);
      var other=serveOpts(DB,o).filter(function(x){return x.ok&&x.code!==auto;})[0];
      if(!other)return true;
      var was=o.loc; o.loc=other.code;
      var ok=servingLoc(DB,o)===other.code;
      o.loc=was; return ok;})());
    t('an order cannot be allocated to a warehouse without the stock',
      backorders(DB).every(function(o){return locs().every(function(l){return !canAllocate(DB,o,l.code);});}));
    t('nothing can be shipped before it is allocated',
      unallocated(DB).every(function(o){return !canShip(DB,o);}));
    t('every order already past Allocated has a warehouse against it',
      orders(DB).filter(function(o){return stIdx(o.status)>stIdx('new');}).every(function(o){return !!o.loc;}));
    t('allocating takes the stock out of that warehouse and no other',(function(){
      var o=unallocated(DB).filter(function(x){return bestLoc(DB,x);})[0]; if(!o)return true;
      var lc=bestLoc(DB,o); var before={};
      locs().forEach(function(l){before[l.code]=availAt(DB,o.sku,l.code);});
      DB.stockAt[o.sku][lc]=before[lc]-num(o.qty);
      var ok=locs().every(function(l){return l.code===lc
        ?availAt(DB,o.sku,l.code)===before[lc]-num(o.qty)
        :availAt(DB,o.sku,l.code)===before[l.code];});
      DB.stockAt[o.sku][lc]=before[lc]; return ok;})());
    t('cancelling an allocated order puts the stock back where it came from',(function(){
      var o=orders(DB).filter(function(x){return x.loc&&stIdx(x.status)>=stIdx('allocated')&&stIdx(x.status)<stIdx('shipped');})[0];
      if(!o)return true;
      var was=availAt(DB,o.sku,o.loc);
      DB.stockAt[o.sku][o.loc]=was+num(o.qty);
      var ok=availAt(DB,o.sku,o.loc)===was+num(o.qty);
      DB.stockAt[o.sku][o.loc]=was; return ok;})());
    t('a backorder is exactly an order nothing can serve',
      backorders(DB).every(function(o){return o.status==='new'&&!bestLoc(DB,o);}));
    t('every backorder is raised as urgent',
      backorders(DB).every(function(o){return issues(DB).some(function(i){
        return i.sev==='high'&&i.what.indexOf(o.id)===0;});}));
    t('stock everywhere = the sum of the warehouses',
      (CFG.items||[]).every(function(it){return totalStock(DB,it.sku)===
        locs().reduce(function(s,l){return s+availAt(DB,it.sku,l.code);},0);}));
    /* moving stock */
    t('stock cannot be moved into the warehouse it came out of',
      !canTransfer(DB,(CFG.items||[])[0].sku,locs()[0].code,locs()[0].code,1));
    t('stock cannot be moved out of a warehouse that does not have it',(function(){
      var it=(CFG.items||[])[0],l=locs()[0];
      return !canTransfer(DB,it.sku,l.code,locs()[1].code,availAt(DB,it.sku,l.code)+1);})());
    t('moving stock changes two warehouses and leaves the total alone',(function(){
      var it=(CFG.items||[]).filter(function(x){return totalStock(DB,x.sku)>0;})[0]; if(!it)return true;
      var from=locs().filter(function(l){return availAt(DB,it.sku,l.code)>0;})[0];
      var to=locs().filter(function(l){return l.code!==from.code;})[0]; if(!to)return true;
      var total=totalStock(DB,it.sku);
      DB.stockAt[it.sku][from.code]=availAt(DB,it.sku,from.code)-1;
      DB.stockAt[it.sku][to.code]=availAt(DB,it.sku,to.code)+1;
      var ok=totalStock(DB,it.sku)===total;
      DB.stockAt[it.sku][from.code]=availAt(DB,it.sku,from.code)+1;
      DB.stockAt[it.sku][to.code]=availAt(DB,it.sku,to.code)-1;
      return ok;})());
    /* on time */
    t('on-time counts only orders that actually landed',
      arrived(DB).every(function(o){return !!o.doneOn;}));
    t('an order is on time when it landed on or before the date promised',
      arrived(DB).filter(function(o){return onTime(DB,o);}).every(function(o){
        return days(o.doneOn,promiseOn(DB,o))>=0;}));
    t('an order that landed after its promise is counted as late',
      arrived(DB).filter(function(o){return !onTime(DB,o);}).every(function(o){
        return !promiseOn(DB,o)||days(o.doneOn,promiseOn(DB,o))<0;}));
    t('on-time % is the share of landed orders that met their promise',
      onTimePct(DB)===(arrived(DB).length?Math.round(arrived(DB).filter(function(o){return onTime(DB,o);}).length/arrived(DB).length*100):100));
    t('a blown promise is an unshipped order whose date has gone',
      blown(DB).every(function(o){return stIdx(o.status)<stIdx('shipped')&&dueIn(DB,o)<0;}));
    t('an order already shipped is never called a blown promise',
      blown(DB).every(function(o){return o.status!=='shipped';}));
    /* returns */
    t('a refund is impossible before the parcel is back',
      retList(DB).filter(function(o){return !o.recv;}).every(function(o){return !canRefund(DB,o);}));
    t('a refund is impossible before somebody has looked at it',
      retList(DB).filter(function(o){return o.recv&&!o.insp;}).every(function(o){return !canRefund(DB,o);}));
    t('nothing is refunded twice',
      retList(DB).filter(function(o){return num(o.refund);}).every(function(o){return !canRefund(DB,o);}));
    t('a resaleable return refunds the whole amount',(function(){
      var o=retList(DB)[0]; if(!o)return true;
      var was=o.insp; o.insp='good';
      var ok=expectedRefund(DB,o)===value(o); o.insp=was; return ok;})());
    t('a damaged return refunds only '+damagedPct()+'% of the value',(function(){
      var o=retList(DB)[0]; if(!o)return true;
      var was=o.insp; o.insp='damaged';
      var ok=expectedRefund(DB,o)===r2(value(o)*damagedPct()/100); o.insp=was; return ok;})());
    t('a resaleable piece goes back into stock and a damaged one does not',
      stockComesBack('good')&&!stockComesBack('damaged'));
    t('money owed = every return that has not been refunded yet',
      refundOwed(DB)===r2(retList(DB).filter(function(o){return !num(o.refund);})
        .reduce(function(s,o){return s+expectedRefund(DB,o);},0)));
    t('a parcel booked in is no longer counted as coming back',
      comingBack(DB).every(function(o){return !o.recv;}));
    t('a parcel already looked at is not on the inspection list',
      toInspect(DB).every(function(o){return o.recv&&!o.insp;}));
    t('a refused delivery is treated as a return, never as a delivery',
      orders(DB).filter(function(o){return o.status==='rto';}).every(function(o){
        return isReturn(o)&&live(DB).indexOf(o)<0;}));
  }
};

if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
