/* Medhava — Report Builder (Module 01 · App 2)
   Pick a source, group it, filter it, sort it, run it. Every report is computed live from the
   same records the CEO Dashboard reads. Reports can be saved, re-run and exported to CSV.
   CONFIG supplies names and ready-made reports so the Medhava and Vastrangam builds run the
   SAME math and pass the SAME self-tests. */
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
var CFG=(typeof CONFIG!=='undefined')?CONFIG:{};
function db(){return K.DB;}
var MONTHS=['2026-04','2026-05','2026-06','2026-07'];
var MLBL={'2026-04':'Apr 2026','2026-05':'May 2026','2026-06':'Jun 2026','2026-07':'Jul 2026'};

/* ── shared transactional seed: identical numbers in both builds ── */
function seedTxns(CH,ITEMS,PARTIES){
  var sales=[],i,c;
  var base={};
  base[CH[0]]=[182000,196000,211000,238000];
  base[CH[1]]=[128000,141000,133000,164000];
  base[CH[2]]=[96000,104000,118000,127000];
  base[CH[3]]=[74000,69000,81000,92000];
  base[CH[4]]=[52000,58000,61000,55000];
  var retPct={};retPct[CH[0]]=0.06;retPct[CH[1]]=0.14;retPct[CH[2]]=0.11;retPct[CH[3]]=0.09;retPct[CH[4]]=0.02;
  for(i=0;i<MONTHS.length;i++){ for(c=0;c<CH.length;c++){
    var g=base[CH[c]][i];
    sales.push({month:MONTHS[i],channel:CH[c],gross:g,returns:r2(g*retPct[CH[c]]),units:Math.round(g/1450)});
  }}
  return {
    sales:sales,
    expenses:[
      {month:'2026-04',cat:'Rent',amount:42000},{month:'2026-04',cat:'Salaries',amount:96000},
      {month:'2026-04',cat:'Marketing',amount:31000},{month:'2026-04',cat:'Logistics',amount:26000},
      {month:'2026-05',cat:'Rent',amount:42000},{month:'2026-05',cat:'Salaries',amount:98000},
      {month:'2026-05',cat:'Marketing',amount:38000},{month:'2026-05',cat:'Logistics',amount:29000},
      {month:'2026-06',cat:'Rent',amount:42000},{month:'2026-06',cat:'Salaries',amount:101000},
      {month:'2026-06',cat:'Marketing',amount:44000},{month:'2026-06',cat:'Logistics',amount:31000},
      {month:'2026-07',cat:'Rent',amount:42000},{month:'2026-07',cat:'Salaries',amount:104000},
      {month:'2026-07',cat:'Marketing',amount:52000},{month:'2026-07',cat:'Logistics',amount:34000}],
    production:[{month:'2026-04',pieces:410,wages:74000},{month:'2026-05',pieces:445,wages:79000},
                {month:'2026-06',pieces:498,wages:88000},{month:'2026-07',pieces:534,wages:95000}],
    stock:ITEMS,
    receivables:[{party:PARTIES.r[0],amount:186400,days:12},{party:PARTIES.r[1],amount:94200,days:38},
                 {party:PARTIES.r[2],amount:212800,days:5},{party:PARTIES.r[3],amount:61500,days:72}],
    payables:[{party:PARTIES.p[0],amount:148900,days:-3},{party:PARTIES.p[1],amount:92400,days:30},
              {party:PARTIES.p[2],amount:189500,days:-22},{party:PARTIES.p[3],amount:64000,days:76}]
  };
}

/* ── the five things you can report on ──
   Each source flattens its records into plain rows so grouping, filtering and sorting
   work exactly the same way whatever you are looking at. */
var SRC={
  sales:{label:'Sales',icon:'cart',
    note:'One row per channel per month. Returns are already taken off before "Net".',
    dims:[{k:'channel',l:'Channel'},{k:'monthLabel',l:'Month'}],
    measures:[{k:'gross',l:'Gross',money:1},{k:'returns',l:'Returns',money:1},{k:'net',l:'Net sales',money:1},{k:'units',l:'Units'}],
    rows:function(DB){return (DB.sales||[]).map(function(r){
      return {channel:r.channel,monthLabel:MLBL[r.month],month:r.month,
              gross:num(r.gross),returns:num(r.returns),net:r2(num(r.gross)-num(r.returns)),units:num(r.units)};});}},
  money:{label:'Money owed',icon:'coin',
    note:'Customers who owe you and suppliers you owe, side by side, aged in days.',
    dims:[{k:'party',l:'Party'},{k:'type',l:'Direction'},{k:'status',l:'Status'}],
    measures:[{k:'amount',l:'Amount',money:1},{k:'days',l:'Days'}],
    rows:function(DB){
      var out=[];
      (DB.receivables||[]).forEach(function(x){out.push({party:x.party,type:'To collect',days:num(x.days),
        amount:num(x.amount),status:x.days>60?'Very overdue':x.days>30?'Overdue':'On time'});});
      (DB.payables||[]).forEach(function(x){out.push({party:x.party,type:'To pay',days:num(x.days),
        amount:num(x.amount),status:x.days>60?'Very late':x.days>0?'Late':'On time'});});
      return out;}},
  stock:{label:'Stock',icon:'box',
    note:'What you are holding right now, valued at cost, with anything below its reorder point flagged.',
    dims:[{k:'name',l:'Item'},{k:'status',l:'Status'}],
    measures:[{k:'qty',l:'Quantity'},{k:'value',l:'Value at cost',money:1}],
    rows:function(DB){return (DB.stock||[]).map(function(x){
      return {sku:x.sku,name:x.name,qty:num(x.qty),rop:num(x.rop),cost:num(x.cost),value:r2(num(x.qty)*num(x.cost)),
              status:num(x.qty)<=num(x.rop)?'Reorder now':num(x.qty)<=num(x.rop)*2?'Getting low':'Comfortable'};});}},
  expenses:{label:'Running costs',icon:'scale',
    note:'Everything spent to keep the business running — not the cost of goods.',
    dims:[{k:'cat',l:'Cost head'},{k:'monthLabel',l:'Month'}],
    measures:[{k:'amount',l:'Amount',money:1}],
    rows:function(DB){return (DB.expenses||[]).map(function(x){
      return {cat:x.cat,monthLabel:MLBL[x.month],month:x.month,amount:num(x.amount)};});}},
  production:{label:'Production',icon:'wrench',
    note:'What the floor actually finished each month, and what it cost in wages.',
    dims:[{k:'monthLabel',l:'Month'}],
    measures:[{k:'pieces',l:'Pieces made'},{k:'wages',l:'Wages',money:1}],
    rows:function(DB){return (DB.production||[]).map(function(x){
      return {monthLabel:MLBL[x.month],month:x.month,pieces:num(x.pieces),wages:num(x.wages),
              cpp:r2(num(x.wages)/num(x.pieces))};});}}
};
var SRCKEYS=['sales','money','stock','expenses','production'];

function fieldsOf(src){var S=SRC[src];return S.dims.concat(S.measures);}
function isMeasure(src,k){return SRC[src].measures.some(function(m){return m.k===k;});}
function labelOf(src,k){var f=fieldsOf(src).filter(function(x){return x.k===k;})[0];return f?f.l:k;}

/* ── the report engine: one pure function, no screen involved ── */
function passes(row,f,src){
  var v=row[f.field];
  if(isMeasure(src,f.field)){
    var a=num(v),b=num(f.val);
    if(f.op==='>=')return a>=b; if(f.op==='<=')return a<=b;
    if(f.op==='>')return a>b;  if(f.op==='<')return a<b;
    return a===b;
  }
  var s=String(v==null?'':v).toLowerCase(), q=String(f.val==null?'':f.val).toLowerCase();
  if(f.op==='is')return s===q;
  if(f.op==='is not')return s!==q;
  return s.indexOf(q)>=0; /* contains */
}
function report(DB,def){
  var S=SRC[def.src]||SRC.sales, ms=S.measures;
  var all=S.rows(DB);
  var kept=all.filter(function(r){return (def.filters||[]).every(function(f){return passes(r,f,def.src);});});
  var out;
  if(def.group==='none'){
    out=kept.map(function(r){
      var v={};ms.forEach(function(m){v[m.k]=num(r[m.k]);});
      return {label:S.dims.map(function(d){return r[d.k];}).join(' · '),n:1,v:v};});
  }else{
    var map={},order=[];
    kept.forEach(function(r){
      var k=String(r[def.group]);
      if(!map[k]){map[k]={label:k,n:0,v:{}};ms.forEach(function(m){map[k].v[m.k]=0;});order.push(k);}
      map[k].n++; ms.forEach(function(m){map[k].v[m.k]=r2(map[k].v[m.k]+num(r[m.k]));});});
    out=order.map(function(k){return map[k];});
  }
  var sk=def.sort||ms[0].k, dir=def.dir==='asc'?1:-1;
  out.sort(function(a,b){
    if(sk==='label')return a.label<b.label?-dir:a.label>b.label?dir:0;
    if(sk==='n')return (a.n-b.n)*dir;
    return (num(a.v[sk])-num(b.v[sk]))*dir;});
  var total={label:'Total',n:kept.length,v:{}};
  ms.forEach(function(m){total.v[m.k]=r2(kept.reduce(function(s,r){return s+num(r[m.k]);},0));});
  var shown=out, limited=false;
  if(num(def.limit)>0&&out.length>num(def.limit)){shown=out.slice(0,num(def.limit));limited=true;}
  return {rows:shown,allRows:out,total:total,measures:ms,matched:kept.length,scanned:all.length,limited:limited};
}
function csv(rep,def){
  var head=[def.group==='none'?'Row':labelOf(def.src,def.group)].concat(rep.measures.map(function(m){return m.l;})).concat(['Records']);
  var lines=[head.map(q).join(',')];
  rep.rows.forEach(function(r){
    lines.push([q(r.label)].concat(rep.measures.map(function(m){return r.v[m.k];})).concat([r.n]).join(','));});
  lines.push([q('TOTAL')].concat(rep.measures.map(function(m){return rep.total.v[m.k];})).concat([rep.total.n]).join(','));
  return lines.join('\n');
  function q(s){s=String(s==null?'':s);return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
}
function fmtv(m,v){return m.money?money(v):String(v);}

function defaultDef(src){
  var S=SRC[src];
  return {src:src,group:S.dims[0].k,sort:S.measures[0].k,dir:'desc',limit:0,filters:[]};
}

/* Reports read the books and the channels, and go out as a file, an email or a print. */
var SPEC={
  uses:['ledger','channels','storage','email','printing'],
  id:CFG.id, name:CFG.name, company:CFG.company, fy:CFG.fy||'FY 2026-27', tagline:CFG.tagline, about:CFG.about,
  groups:[{label:'Reports',items:['build','lib','saved']},
          {label:'Wiring',items:['wiring']}],
  nav:[{v:'build',label:'Build a report',icon:'chart'},{v:'lib',label:'Ready-made',icon:'book'},
       {v:'saved',label:'My saved reports',icon:'save'},{v:'wiring',label:'Wiring',icon:'flow'}],
  seed:function(DB){
    var t=seedTxns(CFG.channels,JSON.parse(JSON.stringify(CFG.items)),CFG.parties);
    DB.sales=t.sales;DB.expenses=t.expenses;DB.production=t.production;
    DB.stock=t.stock;DB.receivables=t.receivables;DB.payables=t.payables;
    DB.draft=defaultDef('sales'); DB.saved=[];
  },
  views:{
    build:function(){var DB=db();var d=DB.draft||defaultDef('sales');var S=SRC[d.src];var rep=report(DB,d);
      var mx=Math.max.apply(null,rep.rows.map(function(r){return Math.abs(num(r.v[S.measures[0].k]));}).concat([1]))||1;
      var ff=fieldsOf(d.src);
      return H.head('Reports · Builder','Build a report','Pick what to look at, how to group it, and what to leave out. The answer appears straight away.')+
      /* 1 · source */
      H.panel('1 · What do you want to look at?',
        '<div style="display:flex;gap:8px;flex-wrap:wrap">'+SRCKEYS.map(function(k){
          return '<button class="btn'+(d.src===k?' p':'')+'" data-act="setsrc" data-s="'+k+'"><svg class="i"><use href="#s-'+SRC[k].icon+'"/></svg> '+esc(SRC[k].label)+'</button>';}).join('')+
        '</div><p class="hint" style="margin-top:9px">'+esc(S.note)+'</p>')+
      /* 2 · shape */
      H.panel('2 · How should it be arranged?',
        '<div class="form f4">'+H.fields([
          {id:'r_group',label:'Group the rows by',type:'select',value:d.group,
            options:S.dims.map(function(x){return {v:x.k,label:x.l};}).concat([{v:'none',label:'Do not group — show every record'}])},
          {id:'r_sort',label:'Sort by',type:'select',value:d.sort,
            options:[{v:'label',label:'Name (A–Z)'}].concat(S.measures.map(function(m){return {v:m.k,label:m.l};})).concat([{v:'n',label:'Number of records'}])},
          {id:'r_dir',label:'Order',type:'select',value:d.dir,options:[{v:'desc',label:'Biggest first'},{v:'asc',label:'Smallest first'}]},
          {id:'r_limit',label:'Show only top',type:'select',value:String(d.limit),
            options:[{v:'0',label:'All rows'},{v:'3',label:'Top 3'},{v:'5',label:'Top 5'},{v:'10',label:'Top 10'}]}
        ])+'<div class="fld full" style="align-items:flex-end"><button class="btn p" data-act="run"><svg class="i"><use href="#s-sync"/></svg> Run this report</button></div></div>')+
      /* 3 · filters */
      H.panel('3 · Leave anything out? <span class="badge">'+(d.filters||[]).length+' filter(s)</span>',
        '<div class="form f4">'+H.fields([
          {id:'f_field',label:'Field',type:'select',options:ff.map(function(x){return {v:x.k,label:x.l};})},
          {id:'f_op',label:'Condition',type:'select',options:['is','is not','contains','>=','<=','>','<']},
          {id:'f_val',label:'Value',type:'text',ph:'e.g. '+esc(String(S.rows(DB)[0]?S.rows(DB)[0][S.dims[0].k]:''))}
        ])+'<div class="fld" style="align-items:flex-end"><button class="btn" data-act="addf">Add filter</button></div></div>'+
        ((d.filters||[]).length
          ? '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">'+d.filters.map(function(f,i){
              return '<span class="tag t-blu">'+esc(labelOf(d.src,f.field)+' '+f.op+' '+f.val)+' <button class="btn sm" data-act="delf" data-i="'+i+'" style="padding:0 6px;margin-left:4px">×</button></span>';}).join('')+
            ' <button class="btn sm" data-act="clearf">Remove all filters</button></div>'
          : '<p class="hint" style="margin-top:6px">No filters — every record is included.</p>'))+
      /* result */
      H.panel('Result <span class="badge">'+rep.matched+' of '+rep.scanned+' records</span>',
        H.table([{label:d.group==='none'?'Record':labelOf(d.src,d.group),align:'l',fmt:function(r){return esc(r.label);}}]
          .concat(S.measures.map(function(m){return {label:m.l,fmt:function(r){return fmtv(m,r.v[m.k]);},cellcls:'mono'};}))
          .concat([{label:'Records',k:'n',cellcls:'mono'},
                   {label:esc(S.measures[0].l)+' — share',align:'l',fmt:function(r){
                     return '<div style="min-width:150px">'+H.bar(Math.abs(num(r.v[S.measures[0].k]))/mx*100)+'</div>';}}]),rep.rows)+
        '<div class="kv" style="margin-top:8px"><span><b>Total</b>'+(rep.limited?' <span class="hint">(all '+rep.allRows.length+' rows, not just the ones shown)</span>':'')+'</span><b>'+
          S.measures.map(function(m){return esc(m.l)+': '+fmtv(m,rep.total.v[m.k]);}).join(' &nbsp;·&nbsp; ')+'</b></div>',
        '<button class="btn sm" data-act="csvdl">Download CSV</button>')+
      H.panel('Keep this report',
        '<div class="form f2">'+H.fields([{id:'r_name',label:'Give it a name',type:'text',ph:'e.g. Best channels this quarter',wide:true}])+
        '<div class="fld" style="align-items:flex-end"><button class="btn p" data-act="savedef">Save report</button></div></div>'+
        '<p class="hint">Saved reports remember the source, grouping, filters and sort — not the numbers. Run one next month and it recalculates on the new data.</p>');
    },
    lib:function(){var DB=db();
      return H.head('Reports · Ready-made','Ready-made reports','Questions most owners ask. One click loads it into the builder — then change anything you like.')+
      H.note('These are starting points, not fixed reports. Load one, then add a filter or change the grouping and it is yours.')+
      '<div class="two">'+(CFG.templates||[]).map(function(t,i){
        return H.panel(esc(t.name),
          '<p>'+esc(t.why)+'</p>'+
          '<p class="hint">Looks at <b>'+esc(SRC[t.def.src].label)+'</b>, grouped by <b>'+esc(t.def.group==='none'?'nothing':labelOf(t.def.src,t.def.group))+'</b>'+
          ((t.def.filters||[]).length?', filtered on '+esc(t.def.filters.map(function(f){return labelOf(t.def.src,f.field)+' '+f.op+' '+f.val;}).join(' and ')):'')+'.</p>'+
          '<button class="btn p" data-act="tpl" data-i="'+i+'">Load &amp; run →</button>');}).join('')+'</div>';
    },
    saved:function(){var DB=db();var sv=DB.saved||[];
      return H.head('Reports · Saved','My saved reports','Your own reports. They recalculate every time you run them.')+
      H.kpis([{l:'Saved reports',v:sv.length,d:'built by you',icon:'save',tone:'teal'},
        {l:'Sources available',v:SRCKEYS.length,d:'to report on',icon:'layers',tone:'blue'},
        {l:'Records on file',v:SRCKEYS.reduce(function(s,k){return s+SRC[k].rows(DB).length;},0),d:'across all sources',icon:'doc',tone:'green'}],'k3')+
      H.panel('Saved reports',sv.length?H.table([
        {label:'Name',align:'l',fmt:function(r){return esc(r.name);}},
        {label:'Source',align:'l',fmt:function(r){return esc(SRC[r.def.src].label);}},
        {label:'Grouped by',align:'l',fmt:function(r){return esc(r.def.group==='none'?'—':labelOf(r.def.src,r.def.group));}},
        {label:'Filters',fmt:function(r){return (r.def.filters||[]).length;},cellcls:'mono'},
        {label:'Rows',fmt:function(r){return report(db(),r.def).allRows.length;},cellcls:'mono'},
        {label:'Answer if you run it now',align:'l',fmt:function(r){
          var rp=report(db(),r.def);var m=rp.measures.filter(function(x){return x.money;})[0]||rp.measures[0];
          return '<span class="mono">'+esc(m.l)+' '+fmtv(m,rp.total.v[m.k])+'</span>';}},
        {label:'',align:'l',fmt:function(r){var i=sv.indexOf(r);
          return '<button class="btn sm p" data-act="runsaved" data-i="'+i+'">Run</button> <button class="btn sm d" data-act="delsaved" data-i="'+i+'">Delete</button>';}}],sv)
        :'<div class="empty">Nothing saved yet. Build a report and press <b>Save report</b>, or load a ready-made one.</div>');
    },
    wiring:function(){var DB=db();
      return H.head('Wiring · Integration','Where every report gets its numbers','The Report Builder stores no figures of its own. It reads the shared Data Core live, every single time you press Run.')+
      H.note('Shared Data Core: Item/SKU · Party · Stock · Ledger/Voucher · Order — every module reads and writes these.')+
      H.panel('The five sources and what feeds them',H.table([
        {label:'Source',align:'l',k:'f'},{label:'Fed by',align:'l',k:'s'},{label:'What one row means',align:'l',k:'h'}],
        CFG.wiring||[]))+
      '<div class="two">'+
      H.panel('What happens when you press Run',
        '<div class="cascade">'+
        '<div class="cl"><span class="d">1</span><div>The chosen <b>source</b> is read fresh from the Data Core — never from a stored copy.</div></div>'+
        '<div class="cl"><span class="d">2</span><div>Your <b>filters</b> drop the rows you did not want.</div></div>'+
        '<div class="cl"><span class="d">3</span><div>What is left is <b>grouped</b> and each measure is added up.</div></div>'+
        '<div class="cl"><span class="d">4</span><div>The result is <b>sorted</b> and trimmed to your Top N — but the Total line still counts every matching row.</div></div>'+
        '<div class="cl"><span class="d">5</span><div>Saving keeps the <b>question</b>, not the answer. Next month the same report shows next month’s numbers.</div></div>'+
        '</div>')+
      H.panel('Why the numbers always agree with the dashboard',
        '<p>Both apps read the <b>same records</b> and use the <b>same rules</b>. A report grouped by channel with no filters adds up to exactly the net sales figure on the CEO Dashboard for the same period.</p>'+
        '<p class="hint">This is checked automatically — see <b>Backup &amp; Health</b>, where the self-tests prove that grouping never changes a total.</p>')+
      '</div>';
    }
  },
  actions:{
    setsrc:function(b){var DB=db();DB.draft=defaultDef(b.getAttribute('data-s'));K.save();K.render();},
    run:function(){var DB=db();var d=DB.draft;
      d.group=H.val('r_group');d.sort=H.val('r_sort');d.dir=H.val('r_dir');d.limit=num(H.val('r_limit'));
      K.save();toast('Report run ✓');K.render();},
    addf:function(){var DB=db();var d=DB.draft;var f={field:H.val('f_field'),op:H.val('f_op'),val:H.val('f_val')};
      if(f.val===''){toast('Type a value first');return;}
      d.filters=d.filters||[];d.filters.push(f);K.save();toast('Filter added');K.render();},
    delf:function(b){var DB=db();DB.draft.filters.splice(num(b.getAttribute('data-i')),1);K.save();K.render();},
    clearf:function(){var DB=db();DB.draft.filters=[];K.save();toast('Filters removed');K.render();},
    savedef:function(){var DB=db();var n=(H.val('r_name')||'').trim();
      if(!n){toast('Give the report a name');return;}
      DB.saved=DB.saved||[];DB.saved.push({name:n,def:JSON.parse(JSON.stringify(DB.draft))});
      K.save();toast('Saved ✓');K.go('saved');},
    runsaved:function(b){var DB=db();var s=DB.saved[num(b.getAttribute('data-i'))];
      if(!s)return;DB.draft=JSON.parse(JSON.stringify(s.def));K.save();toast('Loaded “'+s.name+'”');K.go('build');},
    delsaved:function(b){var DB=db();DB.saved.splice(num(b.getAttribute('data-i')),1);K.save();toast('Deleted');K.render();},
    tpl:function(b){var DB=db();var t=(CFG.templates||[])[num(b.getAttribute('data-i'))];
      if(!t)return;DB.draft=JSON.parse(JSON.stringify(t.def));K.save();toast('Loaded “'+t.name+'”');K.go('build');},
    csvdl:function(){var DB=db();var txt=csv(report(DB,DB.draft),DB.draft);
      try{var bl=new Blob([txt],{type:'text/csv'});var a=document.createElement('a');
        a.href=URL.createObjectURL(bl);a.download=(SPEC.id||'report')+'.csv';a.click();toast('CSV downloaded');}
      catch(e){toast('Download not available here');}}
  },
  tests:function(t,DB){
    var d=defaultDef('sales');
    var rep=report(DB,d);
    t('sales source has one row per channel per month',SRC.sales.rows(DB).length===CFG.channels.length*MONTHS.length);
    t('grouping by channel gives one row per channel',rep.rows.length===CFG.channels.length);
    t('grouped totals equal the ungrouped total',
      r2(rep.rows.reduce(function(s,r){return s+r.v.net;},0))===rep.total.v.net);
    t('net = gross − returns on every row',
      SRC.sales.rows(DB).every(function(r){return r.net===r2(r.gross-r.returns);}));
    t('sorted biggest first',rep.rows.every(function(r,i){return i===0||rep.rows[i-1].v.net>=r.v.net;}));
    var asc=report(DB,{src:'sales',group:'channel',sort:'net',dir:'asc',limit:0,filters:[]});
    t('sorting smallest first reverses the order',asc.rows[0].label===rep.rows[rep.rows.length-1].label);
    var top3=report(DB,{src:'sales',group:'channel',sort:'net',dir:'desc',limit:3,filters:[]});
    t('Top 3 shows exactly 3 rows',top3.rows.length===3);
    t('Top 3 still totals ALL matching rows, not just 3',top3.total.v.net===rep.total.v.net);
    var f1=report(DB,{src:'sales',group:'channel',sort:'net',dir:'desc',limit:0,
      filters:[{field:'channel',op:'is',val:CFG.channels[0]}]});
    t('a filter cuts the records down',f1.matched<rep.matched&&f1.matched>0);
    t('filtering to one channel leaves one group',f1.rows.length===1);
    var f2=report(DB,{src:'sales',group:'monthLabel',sort:'net',dir:'desc',limit:0,
      filters:[{field:'gross',op:'>=',val:150000}]});
    t('a number filter (gross ≥ 1,50,000) works',f2.matched>0&&f2.matched<rep.scanned);
    t('"contains" matches part of a word',
      report(DB,{src:'sales',group:'channel',sort:'net',dir:'desc',limit:0,
        filters:[{field:'channel',op:'contains',val:String(CFG.channels[0]).slice(0,4).toLowerCase()}]}).matched>0);
    t('"is not" is the opposite of "is"',
      report(DB,{src:'sales',group:'channel',sort:'net',dir:'desc',limit:0,
        filters:[{field:'channel',op:'is not',val:CFG.channels[0]}]}).matched===rep.scanned-f1.matched);
    var mo=report(DB,{src:'money',group:'type',sort:'amount',dir:'desc',limit:0,filters:[]});
    t('money report: "to collect" equals the receivables total',
      mo.rows.filter(function(r){return r.label==='To collect';})[0].v.amount===
      r2(DB.receivables.reduce(function(s,x){return s+x.amount;},0)));
    var st=report(DB,{src:'stock',group:'name',sort:'value',dir:'desc',limit:0,filters:[]});
    t('stock report values every item at qty × cost',
      st.total.v.value===r2(DB.stock.reduce(function(s,x){return s+x.qty*x.cost;},0)));
    t('items at or below reorder are flagged "Reorder now"',
      SRC.stock.rows(DB).filter(function(r){return r.status==='Reorder now';}).length===
      DB.stock.filter(function(x){return x.qty<=x.rop;}).length);
    var ex=report(DB,{src:'expenses',group:'cat',sort:'amount',dir:'desc',limit:0,filters:[]});
    t('running costs by head add up to the same total',
      r2(ex.rows.reduce(function(s,r){return s+r.v.amount;},0))===ex.total.v.amount);
    var ung=report(DB,{src:'sales',group:'none',sort:'net',dir:'desc',limit:0,filters:[]});
    t('"do not group" shows every single record',ung.rows.length===rep.scanned);
    t('ungrouped and grouped give the same total',ung.total.v.net===rep.total.v.net);
    var lines=csv(rep,d).split('\n');
    t('CSV has a header, every row, and a total line',lines.length===rep.rows.length+2);
    t('CSV wraps anything containing a comma in quotes',
      csv(report(DB,{src:'money',group:'party',sort:'amount',dir:'desc',limit:0,filters:[]}),
          {src:'money',group:'party'}).indexOf('"')>=0||CFG.parties.r.join('').indexOf(',')<0);
    t('every ready-made report runs without error',(CFG.templates||[]).every(function(tp){
      try{return report(DB,tp.def).matched>=0;}catch(e){return false;}}));
    t('every ready-made report returns at least one row',(CFG.templates||[]).every(function(tp){
      return report(DB,tp.def).rows.length>0;}));
    DB.saved=DB.saved||[];DB.saved.push({name:'probe',def:defaultDef('sales')});
    t('a saved report reruns to the same answer',
      report(DB,DB.saved[DB.saved.length-1].def).total.v.net===rep.total.v.net);
    t('all five sources return rows',SRCKEYS.every(function(k){return SRC[k].rows(DB).length>0;}));
  }
};

if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
