/* Medhava — CRM & Customer 360 (Module 02 · App 1)
   Lead → contacted → quoted → negotiation → won/lost, then the whole customer lifetime:
   every order, every return, what they are actually worth, and what to offer them next.
   CONFIG supplies names so the Medhava and Vastrangam builds run the SAME math and pass
   the SAME self-tests. */
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
var CFG=(typeof CONFIG!=='undefined')?CONFIG:{};
function db(){return K.DB;}
var TODAY='2026-07-31';

/* ── the pipeline: five stages, each with a real probability of closing ── */
var STAGES=[{k:'new',l:'New',p:10},{k:'contacted',l:'Contacted',p:25},
            {k:'quoted',l:'Quoted',p:50},{k:'negotiation',l:'Negotiation',p:75}];
function stageOf(k){return STAGES.filter(function(s){return s.k===k;})[0]||STAGES[0];}
function stageIdx(k){for(var i=0;i<STAGES.length;i++)if(STAGES[i].k===k)return i;return -1;}

function days(from,to){return Math.round((new Date(to||TODAY)-new Date(from))/86400000);}
function plural(n,one,many){return n+' '+(n===1?one:(many||one+'s'));}

/* ── pipeline maths ── */
function openLeads(DB){return (DB.leads||[]).filter(function(l){return l.status==='open';});}
function wonLeads(DB){return (DB.leads||[]).filter(function(l){return l.status==='won';});}
function lostLeads(DB){return (DB.leads||[]).filter(function(l){return l.status==='lost';});}
function pipelineValue(DB){return r2(openLeads(DB).reduce(function(s,l){return s+num(l.value);},0));}
function weightedPipeline(DB){return r2(openLeads(DB).reduce(function(s,l){return s+num(l.value)*stageOf(l.stage).p/100;},0));}
function wonValue(DB){return r2(wonLeads(DB).reduce(function(s,l){return s+num(l.value);},0));}
function winRate(DB){var w=wonLeads(DB).length,l=lostLeads(DB).length;return (w+l)?Math.round(w/(w+l)*100):0;}
function avgDeal(DB){var w=wonLeads(DB);return w.length?r2(wonValue(DB)/w.length):0;}
function byStage(DB){return STAGES.map(function(s){
  var rows=openLeads(DB).filter(function(l){return l.stage===s.k;});
  return {stage:s.l,key:s.k,prob:s.p,n:rows.length,
          value:r2(rows.reduce(function(t,l){return t+num(l.value);},0)),
          weighted:r2(rows.reduce(function(t,l){return t+num(l.value)*s.p/100;},0))};});}
function lostReasons(DB){var m={};lostLeads(DB).forEach(function(l){var r=l.reason||'Not given';
  m[r]=m[r]||{reason:r,n:0,value:0};m[r].n++;m[r].value=r2(m[r].value+num(l.value));});
  return Object.keys(m).map(function(k){return m[k];}).sort(function(a,b){return b.value-a.value;});}

/* ── customer maths: everything derived, nothing stored ── */
function ordersOf(DB,cid){return (DB.orders||[]).filter(function(o){return o.cust===cid;});}
function profile(DB,c){
  var os=ordersOf(DB,c.id);
  var gross=r2(os.reduce(function(s,o){return s+num(o.amount);},0));
  var ret=r2(os.reduce(function(s,o){return s+num(o.returned);},0));
  var last=os.length?os.map(function(o){return o.date;}).sort().slice(-1)[0]:null;
  return {id:c.id,name:c.name,type:c.type,city:c.city,since:c.since,
    orders:os.length, gross:gross, returns:ret, value:r2(gross-ret),
    aov:os.length?r2((gross-ret)/os.length):0,
    rr:gross?Math.round(ret/gross*100):0,
    last:last, lastAge:last?days(last):9999,
    age:days(c.since)};
}
function profiles(DB){return (DB.customers||[]).map(function(c){return profile(DB,c);});}
function channelMix(DB,cid){var m={};
  ordersOf(DB,cid).forEach(function(o){var e=m[o.channel]=m[o.channel]||{channel:o.channel,n:0,gross:0,ret:0};
    e.n++;e.gross=r2(e.gross+num(o.amount));e.ret=r2(e.ret+num(o.returned));});
  return Object.keys(m).map(function(k){var e=m[k];e.kept=r2(e.gross-e.ret);
    e.rr=e.gross?Math.round(e.ret/e.gross*100):0;return e;}).sort(function(a,b){return b.kept-a.kept;});}

/* ── segments: one rule set, tested, and every customer lands in exactly one ── */
var SEGMENTS=['Champion','Loyal','Needs attention','At risk','Sleeping','New'];
function segmentOf(p){
  if(p.orders===0) return 'New';
  if(p.lastAge>180) return 'Sleeping';
  if(p.lastAge>90)  return 'At risk';
  if(p.orders>=4 && p.lastAge<=45) return 'Champion';
  if(p.orders>=2) return p.lastAge<=60?'Loyal':'Needs attention';
  return 'New';
}
function segCounts(DB){var m={};SEGMENTS.forEach(function(s){m[s]={seg:s,n:0,value:0};});
  profiles(DB).forEach(function(p){var s=segmentOf(p);m[s].n++;m[s].value=r2(m[s].value+p.value);});
  return SEGMENTS.map(function(s){return m[s];});}
function offerFor(seg){return (CFG.offers||{})[seg]||'—';}

function totalValue(DB){return r2(profiles(DB).reduce(function(s,p){return s+p.value;},0));}
function repeatRate(DB){var ps=profiles(DB).filter(function(p){return p.orders>0;});
  return ps.length?Math.round(ps.filter(function(p){return p.orders>=2;}).length/ps.length*100):0;}
function atRisk(DB){return profiles(DB).filter(function(p){return segmentOf(p)==='At risk'||segmentOf(p)==='Sleeping';});}
function notesOf(DB,cid){return (DB.notes||[]).filter(function(n){return n.cust===cid;})
  .sort(function(a,b){return a.date<b.date?1:-1;});}

function tag(seg){var t={'Champion':'grn','Loyal':'grn','Needs attention':'amb','At risk':'red','Sleeping':'red','New':'blu'};
  return H.tag(seg,t[seg]||'gray');}

/* CRM reads orders from the channels and payments from the books, and reaches customers
     by message or email. Follow-ups can be automated. All of it swappable. */
var SPEC={
  uses:['channels','ledger','messaging','email','storage','automation'],
  id:CFG.id, name:CFG.name, company:CFG.company, fy:CFG.fy||'FY 2026-27', tagline:CFG.tagline, about:CFG.about,
  groups:[{label:'Winning work',items:['dash','pipe']},
          {label:'Customers',items:['cust','person','segs']},
          {label:'Wiring',items:['wiring']}],
  nav:[{v:'dash',label:'Overview',icon:'grid'},{v:'pipe',label:'Pipeline',icon:'flow'},
       {v:'cust',label:'Customers',icon:'users'},{v:'person',label:'Customer 360',icon:'doc'},
       {v:'segs',label:'Segments & offers',icon:'spark'},{v:'wiring',label:'Wiring',icon:'flow'}],
  seed:function(DB){
    DB.leads=JSON.parse(JSON.stringify(CFG.leads));
    DB.customers=JSON.parse(JSON.stringify(CFG.customers));
    DB.orders=JSON.parse(JSON.stringify(CFG.orders));
    DB.notes=JSON.parse(JSON.stringify(CFG.notes||[]));
    DB.sel=DB.customers[0].id; DB.seg='all'; DB.seq=100;
  },
  views:{
    dash:function(){var DB=db();var st=byStage(DB);var mx=Math.max.apply(null,st.map(function(s){return s.value;}).concat([1]));
      var ar=atRisk(DB);
      return H.head('Winning work · Overview',CFG.name,'Everything you are chasing, and everyone you have already won — on one screen.')+
      H.kpis([
        {l:'Open pipeline',v:money(pipelineValue(DB)),d:plural(openLeads(DB).length,'live deal'),icon:'flow',tone:'teal'},
        {l:'Likely to close',v:money(weightedPipeline(DB)),d:'value × stage odds',cls:'g',icon:'scale',tone:'green'},
        {l:'Win rate',v:winRate(DB)+'%',d:wonLeads(DB).length+' won / '+lostLeads(DB).length+' lost',icon:'check',tone:'blue'},
        {l:'Customer value',v:money(totalValue(DB)),d:(DB.customers||[]).length+' customers',icon:'users',tone:'peach'},
        {l:'Going cold',v:ar.length,d:'no order in 90 days',cls:ar.length?'r':'g',icon:'bell',tone:ar.length?'red':'green'}],'k5')+
      '<div class="two">'+
      H.panel('Pipeline by stage',
        st.map(function(s){return '<div style="margin-bottom:10px"><div class="kv" style="border:none;padding:2px 0"><span>'+
          esc(s.stage)+' <span class="hint">'+plural(s.n,'deal')+' · '+s.prob+'% odds</span></span><b>'+money(s.value)+'</b></div>'+
          H.bar(s.value/mx*100)+'</div>';}).join('')+
        '<div class="kv" style="margin-top:10px"><span>Total open</span><b>'+money(pipelineValue(DB))+'</b></div>'+
        '<div class="kv"><span>Weighted by stage odds</span><b class="g">'+money(weightedPipeline(DB))+'</b></div>'+
        '<p class="hint" style="margin-top:8px">The weighted figure is the honest one. A deal sitting at "New" is worth a tenth of a deal in "Negotiation", and this treats it that way.</p>')+
      H.panel('Who needs a call <span class="badge">'+ar.length+'</span>',
        ar.length?H.table([{label:'Customer',align:'l',fmt:function(p){return esc(p.name);}},
          {label:'Worth',fmt:function(p){return inr(p.value);},cellcls:'mono'},
          {label:'Silent for',fmt:function(p){return p.lastAge+'d';},cellcls:'mono r'},
          {label:'',align:'l',fmt:function(p){return tag(segmentOf(p));}},
          {label:'',align:'l',fmt:function(p){return '<button class="btn sm" data-act="open" data-id="'+esc(p.id)+'">Open</button>';}}],
          ar.sort(function(a,b){return b.value-a.value;}))
        :'<div class="cascade">Everybody has ordered recently. Nothing going cold.</div>')+
      '</div>'+
      H.panel('Where deals are being lost',lostReasons(DB).length?H.table([
        {label:'Reason',align:'l',k:'reason'},{label:'Deals',k:'n',cellcls:'mono'},
        {label:'Value lost',fmt:function(r){return inr(r.value);},cellcls:'mono r'}],lostReasons(DB))
        :'<div class="empty">No lost deals yet.</div>');
    },
    pipe:function(){var DB=db();var st=byStage(DB);
      return H.head('Winning work · Pipeline','Pipeline','Move a deal one stage at a time. Mark it won and the customer appears in Customer 360 straight away.')+
      H.kpis(st.map(function(s){return {l:s.stage,v:money(s.value),d:plural(s.n,'deal')+' · '+s.prob+'% odds',
        icon:'flow',tone:['teal','blue','peach','green'][stageIdx(s.key)]||'teal'};}),'')+
      H.panel('Add a lead',H.form([
        {id:'l_name',label:'Contact / buyer name',ph:CFG.ph.name,wide:true},
        {id:'l_co',label:CFG.ph.coLabel,ph:CFG.ph.co,wide:true},
        {id:'l_src',label:'Where did it come from',type:'select',options:CFG.sources},
        {id:'l_val',label:'Deal value (₹)',type:'num',ph:'250000'}
      ],'Add to pipeline','addlead','f4'))+
      H.panel('Open deals <span class="badge">'+openLeads(DB).length+'</span>',
        openLeads(DB).length?H.table([
        {label:'Deal',align:'l',fmt:function(l){return '<b>'+esc(l.name)+'</b><div class="hint">'+esc(l.co)+'</div>';}},
        {label:'Source',align:'l',k:'src'},
        {label:'Value',fmt:function(l){return inr(l.value);},cellcls:'mono'},
        {label:'Stage',align:'l',fmt:function(l){var s=stageOf(l.stage);
          return H.tag(s.l,['blu','blu','amb','grn'][stageIdx(l.stage)]||'gray')+' <span class="hint">'+s.p+'%</span>';}},
        {label:'Worth × odds',fmt:function(l){return inr(r2(num(l.value)*stageOf(l.stage).p/100));},cellcls:'mono'},
        {label:'Age',fmt:function(l){return days(l.created)+'d';},cellcls:function(l){return 'mono '+(days(l.created)>45?'r':'');}},
        {label:'',align:'l',fmt:function(l){
          var i=(DB.leads||[]).indexOf(l), nxt=stageIdx(l.stage)<STAGES.length-1;
          return (nxt?'<button class="btn sm" data-act="advance" data-i="'+i+'">Move on →</button> ':'')+
                 '<button class="btn sm p" data-act="win" data-i="'+i+'">Won</button> '+
                 '<button class="btn sm d" data-act="lose" data-i="'+i+'">Lost</button>';}}],
        openLeads(DB).slice().sort(function(a,b){return b.value-a.value;}))
        :'<div class="empty">No open deals. Add one above.</div>')+
      '<div class="two">'+
      H.panel('Won <span class="badge">'+money(wonValue(DB))+'</span>',
        wonLeads(DB).length?H.table([{label:'Deal',align:'l',fmt:function(l){return esc(l.name);}},
          {label:'Value',fmt:function(l){return inr(l.value);},cellcls:'mono'},
          {label:'',align:'l',fmt:function(){return H.tag('won','grn');}}],wonLeads(DB))
        :'<div class="empty">Nothing won yet.</div>')+
      H.panel('Lost',lostLeads(DB).length?H.table([{label:'Deal',align:'l',fmt:function(l){return esc(l.name);}},
          {label:'Value',fmt:function(l){return inr(l.value);},cellcls:'mono'},
          {label:'Reason',align:'l',fmt:function(l){return esc(l.reason||'Not given');}}],lostLeads(DB))
        :'<div class="empty">Nothing lost yet.</div>')+
      '</div>';
    },
    cust:function(){var DB=db();var ps=profiles(DB);
      if(DB.seg&&DB.seg!=='all')ps=ps.filter(function(p){return segmentOf(p)===DB.seg;});
      ps.sort(function(a,b){return b.value-a.value;});
      var all=profiles(DB);
      return H.head('Customers · List','Customers','Everybody you have won, what they are actually worth, and who has gone quiet.')+
      H.kpis([{l:'Customers',v:all.length,d:'on the books',icon:'users',tone:'teal'},
        {l:'Total worth',v:money(totalValue(DB)),d:'orders minus returns',cls:'g',icon:'coin',tone:'green'},
        {l:'Repeat rate',v:repeatRate(DB)+'%',d:'ordered 2+ times',icon:'sync',tone:'blue'},
        {l:'Best customer',v:esc(all.slice().sort(function(a,b){return b.value-a.value;})[0].name.split(' ')[0]),
         d:money(all.slice().sort(function(a,b){return b.value-a.value;})[0].value),icon:'spark',tone:'peach'}],'')+
      H.panel('Show only <span class="badge">'+ps.length+' shown</span>',
        '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
        ['all'].concat(SEGMENTS).map(function(s){
          return '<button class="btn sm'+(DB.seg===s?' p':'')+'" data-act="seg" data-s="'+esc(s)+'">'+
                 esc(s==='all'?'Everyone':s)+'</button>';}).join('')+'</div>')+
      H.panel('Customers',ps.length?H.table([
        {label:'Customer',align:'l',fmt:function(p){return '<b>'+esc(p.name)+'</b><div class="hint">'+esc(p.type)+' · '+esc(p.city)+'</div>';}},
        {label:'Orders',k:'orders',cellcls:'mono'},
        {label:'Gross',fmt:function(p){return inr(p.gross);},cellcls:'mono'},
        {label:'Returns',fmt:function(p){return inr(p.returns);},cellcls:function(p){return 'mono '+(p.rr>=15?'r':'');}},
        {label:'Worth',fmt:function(p){return inr(p.value);},cellcls:'mono'},
        {label:'Avg order',fmt:function(p){return inr(p.aov);},cellcls:'mono'},
        {label:'Last order',fmt:function(p){return p.orders?p.lastAge+'d ago':'never';},
         cellcls:function(p){return 'mono '+(p.lastAge>90?'r':'');}},
        {label:'',align:'l',fmt:function(p){return tag(segmentOf(p));}},
        {label:'',align:'l',fmt:function(p){return '<button class="btn sm" data-act="open" data-id="'+esc(p.id)+'">Open 360 →</button>';}}],ps)
        :'<div class="empty">Nobody in this segment.</div>');
    },
    person:function(){var DB=db();
      var c=(DB.customers||[]).filter(function(x){return x.id===DB.sel;})[0];
      if(!c)return H.head('Customers','Customer 360','Pick somebody from the Customers list.')+
        '<button class="btn p" data-go="cust">← Back to customers</button>';
      var p=profile(DB,c), seg=segmentOf(p), os=ordersOf(DB,c.id).slice().sort(function(a,b){return a.date<b.date?1:-1;});
      var mix=channelMix(DB,c.id);
      var ns=notesOf(DB,c.id);
      return H.head('Customers · 360',c.name,esc(c.type)+' · '+esc(c.city)+' · with you since '+esc(c.since)+' ('+p.age+' days)',
        '<button class="btn" data-go="cust">← All customers</button>')+
      H.kpis([{l:'Worth to you',v:money(p.value),d:'orders minus returns',cls:'g',icon:'coin',tone:'teal'},
        {l:'Orders',v:p.orders,d:'avg '+money(p.aov),icon:'cart',tone:'blue'},
        {l:'Returns',v:money(p.returns),d:p.rr+'% of gross',cls:p.rr>=15?'r':'',icon:'return',tone:'peach'},
        {l:'Last order',v:p.orders?p.lastAge+'d':'—',d:p.orders?'ago':'never ordered',cls:p.lastAge>90?'r':'g',icon:'clock',tone:'green'}],'')+
      H.panel('Where they stand '+tag(seg),
        '<div class="kv"><span>Segment</span><b>'+esc(seg)+'</b></div>'+
        '<div class="kv"><span>Why they are in it</span><b>'+esc(whySeg(p,seg))+'</b></div>'+
        H.note('<b>What to offer next:</b> '+esc(offerFor(seg))))+
      (mix.length?H.panel('What they buy, and where it comes back',H.table([
        {label:'Channel',align:'l',k:'channel'},
        {label:'Orders',fmt:function(x){return x.n;},cellcls:'mono'},
        {label:'Ordered',fmt:function(x){return inr(x.gross);},cellcls:'mono'},
        {label:'Sent back',fmt:function(x){return x.ret?inr(x.ret):'—';},cellcls:function(x){return 'mono '+(x.ret?'r':'');}},
        {label:'Return %',fmt:function(x){return x.rr+'%';},cellcls:function(x){return 'mono '+(x.rr>=12?'r':'');}},
        {label:'Kept',fmt:function(x){return inr(x.kept);},cellcls:'mono'},
        {label:'',align:'l',fmt:function(x){return x.rr>=12?H.tag('returns high','red'):H.tag('healthy','grn');}}],mix)):'')+
      '<div class="two">'+
      H.panel('Every order <span class="badge">'+os.length+'</span>',os.length?H.table([
        {label:'Order',align:'l',fmt:function(o){return esc(o.id);},cellcls:'mono'},
        {label:'Date',align:'l',k:'date'},{label:'Channel',align:'l',k:'channel'},
        {label:'Amount',fmt:function(o){return inr(o.amount);},cellcls:'mono'},
        {label:'Returned',fmt:function(o){return num(o.returned)?inr(o.returned):'—';},cellcls:function(o){return 'mono '+(num(o.returned)?'r':'');}},
        {label:'Kept',fmt:function(o){return inr(r2(num(o.amount)-num(o.returned)));},cellcls:'mono'}],os)
        :'<div class="empty">No orders yet.</div>')+
      H.panel('Conversation',
        H.form([{id:'n_text',label:'Log a call, a visit, a promise made',ph:CFG.ph.note,full:true}],'Add to the record','addnote','f1')+
        (ns.length?ns.map(function(n){return '<div class="kv"><span>'+esc(n.date)+' · <b>'+esc(n.kind)+'</b><br>'+esc(n.text)+'</span></div>';}).join('')
          :'<p class="hint">Nothing logged yet. Every call you record here is one you will not have to remember.</p>'))+
      '</div>';
    },
    segs:function(){var DB=db();var sc=segCounts(DB);var tot=totalValue(DB)||1;
      return H.head('Customers · Segments','Segments & offers','Every customer falls into exactly one group, by the same rule, every time. No guessing, no manual tagging.')+
      H.note('Segments are worked out from behaviour — how many times they bought and how long ago — not from anybody’s opinion.')+
      H.panel('The rules, in plain words',H.table([
        {label:'Segment',align:'l',fmt:function(r){return tag(r.seg);}},
        {label:'A customer lands here when',align:'l',k:'rule'},
        {label:'Customers',k:'n',cellcls:'mono'},
        {label:'Worth',fmt:function(r){return inr(r.value);},cellcls:'mono'},
        {label:'Share of value',align:'l',fmt:function(r){return '<div style="min-width:120px">'+H.bar(r.value/tot*100)+'</div>';}}],
        sc.map(function(s){s.rule=SEGRULE[s.seg];return s;})))+
      H.panel('What to say to each group',H.table([
        {label:'Segment',align:'l',fmt:function(r){return tag(r.seg);}},
        {label:'Customers',k:'n',cellcls:'mono'},
        {label:'What to offer next',align:'l',fmt:function(r){return esc(offerFor(r.seg));}},
        {label:'',align:'l',fmt:function(r){return '<button class="btn sm" data-act="seg" data-s="'+esc(r.seg)+'" data-go="cust">See the '+r.n+' →</button>';}}],sc))+
      H.panel('Why this matters',
        '<p>'+esc(CFG.segWhy||'')+'</p>'+
        '<p class="hint">Change nothing and the segments still update themselves — the moment somebody orders, or stops ordering, they move group on their own.</p>');
    },
    wiring:function(){var DB=db();
      return H.head('Wiring · Integration','Where CRM gets its facts, and what it gives back','CRM owns the lead and the conversation. Everything about money and orders it reads from the rest of the business.')+
      H.note('Shared Data Core: Item/SKU · Party · Stock · Ledger/Voucher · Order — every module reads and writes these.')+
      H.panel('Every figure here, and its source',H.table([
        {label:'Figure here',align:'l',k:'f'},{label:'Comes from',align:'l',k:'s'},{label:'How it is worked out',align:'l',k:'h'}],
        CFG.wiring||[]))+
      '<div class="two">'+
      H.panel('Live example — one deal becomes a customer',
        '<div class="cascade">'+
        '<div class="cl"><span class="d">1</span><div>A lead arrives from <b>'+esc((CFG.sources||[])[0]||'a source')+'</b> and sits at <b>New</b>.</div></div>'+
        '<div class="cl"><span class="d">2</span><div>You move it along. At each stage the <b>weighted pipeline</b> changes, because the odds changed.</div></div>'+
        '<div class="cl"><span class="d">3</span><div>You mark it <b>Won</b> → it leaves the open pipeline and joins the won total. <b>Win rate</b> moves.</div></div>'+
        '<div class="cl"><span class="d">4</span><div>Their first order is recorded in <b>Sales</b> → it appears on their Customer 360 by itself.</div></div>'+
        '<div class="cl"><span class="d">5</span><div>A return comes back → their <b>worth</b> drops, because worth is orders minus returns.</div></div>'+
        '<div class="cl"><span class="d">6</span><div>They go quiet for 90 days → they move to <b>At risk</b> on their own and appear on the Overview.</div></div>'+
        '</div>')+
      H.panel('What CRM owns, and what it never touches',
        '<p><b>It owns:</b> the lead, its stage, why it was lost, and every note you log against a customer.</p>'+
        '<p><b>It never touches:</b> orders, invoices, stock or the ledger. Worth, returns and last-order date are <b>read</b> from Sales — never typed in here.</p>'+
        '<p class="hint">That is why the customer value on this screen can never disagree with what Sales says. There is only one copy of it.</p>')+
      '</div>';
    }
  },
  actions:{
    addlead:function(){var DB=db();
      var n=(H.val('l_name')||'').trim(), v=H.numv('l_val');
      if(!n){toast('Give the lead a name');return;}
      if(v<=0){toast('Put a value on it');return;}
      DB.seq=(DB.seq||100)+1;
      DB.leads.push({id:'L'+DB.seq,name:n,co:(H.val('l_co')||'').trim()||'—',src:H.val('l_src'),
        value:v,stage:'new',status:'open',created:TODAY});
      K.save();toast('Lead added to pipeline ✓');K.render();},
    advance:function(b){var DB=db();var l=DB.leads[num(b.getAttribute('data-i'))];
      if(!l||l.status!=='open')return;
      var i=stageIdx(l.stage); if(i<STAGES.length-1){l.stage=STAGES[i+1].k;K.save();
        toast('Moved to '+STAGES[i+1].l);K.render();}},
    win:function(b){var DB=db();var l=DB.leads[num(b.getAttribute('data-i'))];
      if(!l||l.status!=='open')return;
      l.status='won';
      DB.seq=(DB.seq||100)+1;
      DB.customers.push({id:'C'+DB.seq,name:l.co&&l.co!=='—'?l.co:l.name,type:CFG.wonType,city:CFG.wonCity,since:TODAY});
      K.save();toast('Won — customer created ✓');K.render();},
    lose:function(b){var DB=db();var l=DB.leads[num(b.getAttribute('data-i'))];
      if(!l||l.status!=='open')return;
      l.status='lost'; l.reason=(CFG.lossReasons||['Not given'])[Math.min(stageIdx(l.stage),(CFG.lossReasons||[]).length-1)]||'Not given';
      K.save();toast('Marked lost');K.render();},
    open:function(b){var DB=db();DB.sel=b.getAttribute('data-id');K.save();K.go('person');},
    seg:function(b){var DB=db();DB.seg=b.getAttribute('data-s');K.save();
      if(b.getAttribute('data-go'))K.go('cust');else K.render();},
    addnote:function(){var DB=db();var t=(H.val('n_text')||'').trim();
      if(!t){toast('Type something first');return;}
      DB.notes.push({cust:DB.sel,date:TODAY,kind:'Note',text:t});
      K.save();toast('Logged ✓');K.render();}
  },
  tests:function(t,DB){
    /* pipeline */
    t('every open deal sits in a real stage',openLeads(DB).every(function(l){return stageIdx(l.stage)>=0;}));
    t('open pipeline = the open deals added up',
      pipelineValue(DB)===r2(openLeads(DB).reduce(function(s,l){return s+l.value;},0)));
    t('weighted pipeline = each deal × its stage odds',
      weightedPipeline(DB)===r2(openLeads(DB).reduce(function(s,l){return s+l.value*stageOf(l.stage).p/100;},0)));
    t('weighted pipeline is never more than the raw pipeline',weightedPipeline(DB)<=pipelineValue(DB));
    t('stage totals add up to the whole pipeline',
      r2(byStage(DB).reduce(function(s,x){return s+x.value;},0))===pipelineValue(DB));
    t('win rate = won ÷ (won + lost)',
      winRate(DB)===Math.round(wonLeads(DB).length/(wonLeads(DB).length+lostLeads(DB).length)*100));
    t('a lost deal is never counted in the pipeline',
      openLeads(DB).every(function(l){return l.status!=='lost';}));
    /* moving a deal */
    var open0=openLeads(DB)[0], before=open0.stage, bIdx=stageIdx(before);
    if(bIdx<STAGES.length-1){open0.stage=STAGES[bIdx+1].k;
      t('moving a deal on advances it exactly one stage',stageIdx(open0.stage)===bIdx+1);
      t('moving a deal on raises its weighted value',stageOf(open0.stage).p>stageOf(before).p);
      open0.stage=before;}
    var pipeBefore=pipelineValue(DB), w0=wonValue(DB);
    var target=openLeads(DB)[0], tval=target.value;
    target.status='won';
    t('winning a deal takes it out of the open pipeline',pipelineValue(DB)===r2(pipeBefore-tval));
    t('winning a deal adds its value to the won total',wonValue(DB)===r2(w0+tval));
    target.status='open';
    /* customers */
    t('a customer’s worth = their orders minus their returns',
      profiles(DB).every(function(p){return p.value===r2(p.gross-p.returns);}));
    t('order count matches the order list',
      profiles(DB).every(function(p){return p.orders===DB.orders.filter(function(o){return o.cust===p.id;}).length;}));
    t('total customer worth = every order minus every return',
      totalValue(DB)===r2(DB.orders.reduce(function(s,o){return s+o.amount-o.returned;},0)));
    t('average order value = worth ÷ number of orders',
      profiles(DB).filter(function(p){return p.orders;}).every(function(p){return p.aov===r2(p.value/p.orders);}));
    t('return rate is always between 0 and 100',
      profiles(DB).every(function(p){return p.rr>=0&&p.rr<=100;}));
    t('nobody has a negative last-order age',profiles(DB).every(function(p){return p.lastAge>=0;}));
    t('repeat rate = customers who bought twice ÷ customers who bought',
      repeatRate(DB)===Math.round(profiles(DB).filter(function(p){return p.orders>=2;}).length/
                                  profiles(DB).filter(function(p){return p.orders>0;}).length*100));
    /* segments */
    t('every customer lands in exactly one segment',
      profiles(DB).every(function(p){return SEGMENTS.indexOf(segmentOf(p))>=0;}));
    t('segment counts add up to the number of customers',
      segCounts(DB).reduce(function(s,x){return s+x.n;},0)===DB.customers.length);
    t('segment values add up to the total customer worth',
      r2(segCounts(DB).reduce(function(s,x){return s+x.value;},0))===totalValue(DB));
    t('a Champion has bought 4+ times and bought recently',
      profiles(DB).filter(function(p){return segmentOf(p)==='Champion';})
        .every(function(p){return p.orders>=4&&p.lastAge<=45;}));
    t('an At-risk customer has not ordered in 90 days',
      profiles(DB).filter(function(p){return segmentOf(p)==='At risk';})
        .every(function(p){return p.lastAge>90;}));
    t('a Sleeping customer has not ordered in 180 days',
      profiles(DB).filter(function(p){return segmentOf(p)==='Sleeping';})
        .every(function(p){return p.lastAge>180;}));
    t('every segment has an offer written for it',SEGMENTS.every(function(s){return offerFor(s)!=='—';}));
    /* notes */
    t('a customer’s channel mix adds up to their gross',DB.customers.every(function(c){
      return r2(channelMix(DB,c.id).reduce(function(s,x){return s+x.gross;},0))===profile(DB,c).gross;}));
    t('a customer’s channel mix adds up to their worth',DB.customers.every(function(c){
      return r2(channelMix(DB,c.id).reduce(function(s,x){return s+x.kept;},0))===profile(DB,c).value;}));
    var c0=DB.customers[0].id, n0=notesOf(DB,c0).length;
    DB.notes.push({cust:c0,date:TODAY,kind:'Note',text:'probe'});
    t('a logged note appears on that customer',notesOf(DB,c0).length===n0+1);
    t('a logged note appears on nobody else',
      DB.customers.slice(1).every(function(c){return !notesOf(DB,c.id).some(function(n){return n.text==='probe';});}));
  }
};

var SEGRULE={
  'Champion':'Bought 4 or more times, and bought in the last 45 days',
  'Loyal':'Bought 2 or more times, and bought in the last 60 days',
  'Needs attention':'Bought 2 or more times, but has been quiet 60–90 days',
  'At risk':'Has not bought in 90 days',
  'Sleeping':'Has not bought in 180 days',
  'New':'Bought once, or not yet at all'};
function whySeg(p,seg){
  if(seg==='New')return p.orders?'One order so far':'No orders yet';
  if(seg==='Sleeping')return 'Nothing for '+p.lastAge+' days';
  if(seg==='At risk')return p.orders+' orders, but silent '+p.lastAge+' days';
  if(seg==='Champion')return p.orders+' orders, last one '+p.lastAge+' days ago';
  if(seg==='Loyal')return p.orders+' orders, last one '+p.lastAge+' days ago';
  return p.orders+' orders, quiet for '+p.lastAge+' days';
}

if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
