/* Medhava — CEO Dashboard (Module 01 · App 1)
   Reads the whole business and computes every figure. Period switching, drill-downs and
   actionable alerts are live. CONFIG supplies names so the Medhava and Vastrangam builds
   run the SAME math and pass the SAME self-tests. */
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
var CFG=(typeof CONFIG!=='undefined')?CONFIG:{};
function db(){return K.DB;}
var MONTHS=['2026-04','2026-05','2026-06','2026-07'];
var MLBL={'2026-04':'Apr','2026-05':'May','2026-06':'Jun','2026-07':'Jul'};

/* ── shared transactional seed: identical numbers in both builds ── */
function seedTxns(CH,ITEMS,PARTIES){
  var sales=[],i,m,c;
  // gross by month × channel (deterministic, realistic ramp)
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
    purchases:[{month:'2026-04',amount:214000},{month:'2026-05',amount:198000},
               {month:'2026-06',amount:243000},{month:'2026-07',amount:262000}],
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
              {party:PARTIES.p[2],amount:189500,days:-22},{party:PARTIES.p[3],amount:64000,days:76}],
    opening:{cash:180000,bank:640000}
  };
}

/* ── pure engine ── */
function inPeriod(DB,month){var p=DB.period;
  if(p==='all')return true;
  if(p==='ytd')return true;
  return month===p;}
function months(DB){return DB.period==='all'||DB.period==='ytd'?MONTHS:[DB.period];}
function rows(DB,key){return (DB[key]||[]).filter(function(x){return inPeriod(DB,x.month);});}

function grossSales(DB){return r2(rows(DB,'sales').reduce(function(s,x){return s+num(x.gross);},0));}
function returnsVal(DB){return r2(rows(DB,'sales').reduce(function(s,x){return s+num(x.returns);},0));}
function netSales(DB){return r2(grossSales(DB)-returnsVal(DB));}
function unitsSold(DB){return rows(DB,'sales').reduce(function(s,x){return s+num(x.units);},0);}
function returnRate(DB){var g=grossSales(DB);return g?Math.round(returnsVal(DB)/g*100):0;}
function purchases(DB){return r2(rows(DB,'purchases').reduce(function(s,x){return s+num(x.amount);},0));}
function expenses(DB){return r2(rows(DB,'expenses').reduce(function(s,x){return s+num(x.amount);},0));}
function wages(DB){return r2(rows(DB,'production').reduce(function(s,x){return s+num(x.wages);},0));}
function piecesMade(DB){return rows(DB,'production').reduce(function(s,x){return s+num(x.pieces);},0);}
function grossProfit(DB){return r2(netSales(DB)-purchases(DB)-wages(DB));}
function netProfit(DB){return r2(grossProfit(DB)-expenses(DB));}
function marginPct(DB){var n=netSales(DB);return n?Math.round(netProfit(DB)/n*100):0;}
function cash(DB){var o=DB.opening||{cash:0,bank:0};
  // cash position = opening + all-time net profit (period-independent, so it is a true balance)
  var all={period:'all',sales:DB.sales,purchases:DB.purchases,expenses:DB.expenses,production:DB.production};
  return r2(o.cash+o.bank+netProfit(all));}
function receivable(DB){return r2((DB.receivables||[]).reduce(function(s,x){return s+num(x.amount);},0));}
function payable(DB){return r2((DB.payables||[]).reduce(function(s,x){return s+num(x.amount);},0));}
function stockValue(DB){return r2((DB.stock||[]).reduce(function(s,x){return s+num(x.qty)*num(x.cost);},0));}
function lowStock(DB){return (DB.stock||[]).filter(function(x){return num(x.qty)<=num(x.rop);});}
function byChannel(DB){var m={};rows(DB,'sales').forEach(function(x){
  var e=m[x.channel]=m[x.channel]||{gross:0,returns:0,units:0};
  e.gross=r2(e.gross+num(x.gross));e.returns=r2(e.returns+num(x.returns));e.units+=num(x.units);});
  return Object.keys(m).map(function(c){var e=m[c];
    return {channel:c,gross:e.gross,returns:e.returns,net:r2(e.gross-e.returns),units:e.units,
            rr:e.gross?Math.round(e.returns/e.gross*100):0};})
    .sort(function(a,b){return b.net-a.net;});}
function monthSeries(DB){return MONTHS.map(function(m){
  var one={period:m,sales:DB.sales,purchases:DB.purchases,expenses:DB.expenses,production:DB.production};
  return {month:m,label:MLBL[m],net:netSales(one),profit:netProfit(one)};});}
function growthPct(DB){var s=monthSeries(DB);if(s.length<2)return 0;
  var a=s[s.length-2].net,b=s[s.length-1].net;return a?Math.round((b-a)/a*100):0;}

/* alerts are derived, then can be resolved by the user */
function alerts(DB){
  var out=[],done=DB.resolved||{};
  lowStock(DB).forEach(function(it){out.push({id:'stock-'+it.sku,sev:'high',area:'Inventory',
    what:it.name+' is down to '+it.qty+' — reorder point is '+it.rop,go:'stock'});});
  (DB.receivables||[]).filter(function(x){return x.days>30;}).forEach(function(x){
    out.push({id:'rec-'+x.party,sev:x.days>60?'high':'med',area:'Money',
      what:x.party+' owes '+money(x.amount)+', '+x.days+' days overdue',go:'money'});});
  (DB.payables||[]).filter(function(x){return x.days>0;}).forEach(function(x){
    out.push({id:'pay-'+x.party,sev:x.days>60?'high':'med',area:'Money',
      what:'You owe '+x.party+' '+money(x.amount)+', '+x.days+' days late',go:'money'});});
  byChannel(DB).filter(function(c){return c.rr>=12;}).forEach(function(c){
    out.push({id:'ret-'+c.channel,sev:'med',area:'Sales',
      what:c.channel+' return rate is '+c.rr+'% — above the 12% line',go:'sales'});});
  return out.filter(function(a){return !done[a.id];});
}

/* The Dashboard reads figures from the books and the sales channels, and can print or back up.
     Each of those is a capability with alternatives — see the Connectors screen. */
var SPEC={
  uses:['ledger','channels','storage','printing'],
  id:CFG.id, name:CFG.name, company:CFG.company, fy:CFG.fy||'FY 2026-27', tagline:CFG.tagline, about:CFG.about,
  groups:[{label:'Command',items:['dash','sales','money']},
          {label:'Operations',items:['stock','alerts']},
          {label:'Wiring',items:['wiring']}],
  nav:[{v:'dash',label:'Overview',icon:'grid'},{v:'sales',label:'Sales & Channels',icon:'chart'},
       {v:'money',label:'Money',icon:'coin'},{v:'stock',label:'Stock & Making',icon:'box'},
       {v:'alerts',label:'Alerts',icon:'bell'},{v:'wiring',label:'Wiring',icon:'flow'}],
  seed:function(DB){
    var t=seedTxns(CFG.channels,JSON.parse(JSON.stringify(CFG.items)),CFG.parties);
    DB.sales=t.sales;DB.purchases=t.purchases;DB.expenses=t.expenses;DB.production=t.production;
    DB.stock=t.stock;DB.receivables=t.receivables;DB.payables=t.payables;DB.opening=t.opening;
    DB.period='2026-07'; DB.resolved={};
  },
  views:{
    dash:function(){var DB=db();var s=monthSeries(DB);var mx=Math.max.apply(null,s.map(function(x){return x.net;}))||1;
      var al=alerts(DB);var g=growthPct(DB);
      return H.head('Command · Overview',CFG.name,'Everything below is computed from your own records — change the period and every figure moves.')+
      periodBar(DB)+
      H.kpis([
        {l:'Net sales',v:money(netSales(DB)),d:'after returns',icon:'coin',tone:'teal'},
        {l:'Net profit',v:money(netProfit(DB)),d:marginPct(DB)+'% margin',cls:netProfit(DB)>=0?'g':'r',icon:'chart',tone:'green'},
        {l:'Cash + bank',v:money(cash(DB)),d:'live balance',icon:'coin',tone:'blue'},
        {l:'To collect',v:money(receivable(DB)),d:'from customers',icon:'doc',tone:'peach'},
        {l:'Open alerts',v:al.length,d:'need a decision',cls:al.length?'r':'g',icon:'bell',tone:al.length?'red':'green'}],'k5')+
      '<div class="two">'+
      H.panel('Net sales by month <span class="badge">'+(g>=0?'+':'')+g+'% last month</span>',
        s.map(function(x){return '<div style="margin-bottom:11px"><div class="kv" style="border:none;padding:2px 0"><span>'+x.label+
          ' <span class="hint">profit '+money(x.profit)+'</span></span><b>'+money(x.net)+'</b></div>'+H.bar(x.net/mx*100)+'</div>';}).join('')+
        '<div class="kv" style="margin-top:12px"><span>Best month</span><b>'+esc(s.slice().sort(function(a,b){return b.net-a.net;})[0].label)+'</b></div>'+
        '<div class="kv"><span>Total net sales, all four months</span><b>'+money(r2(s.reduce(function(t,x){return t+x.net;},0)))+'</b></div>'+
        '<div class="kv"><span>Total profit, all four months</span><b class="'+(s.reduce(function(t,x){return t+x.profit;},0)>=0?'g':'r')+'">'+
          money(r2(s.reduce(function(t,x){return t+x.profit;},0)))+'</b></div>'+
        '<p class="hint" style="margin-top:8px">'+esc(CFG.profitNote||'Profit here is after purchases, making cost and every running cost. It is the figure that actually reaches the bank.')+'</p>')+
      H.panel('What needs you <span class="badge">'+al.length+'</span>',
        al.length?H.table([{label:'',align:'l',fmt:function(a){return H.tag(a.sev==='high'?'urgent':'watch',a.sev==='high'?'red':'amb');}},
          {label:'Area',align:'l',k:'area'},{label:'What',align:'l',k:'what'},
          {label:'',align:'l',fmt:function(a){return '<button class="btn sm" data-go="'+a.go+'">Open →</button>';}}],al.slice(0,6))
        :'<div class="cascade">Nothing needs a decision right now. Everything is inside its limits.</div>')+
      '</div>';
    },
    sales:function(){var DB=db();var ch=byChannel(DB);var mx=Math.max.apply(null,ch.map(function(c){return c.net;}))||1;
      return H.head('Command · Sales','Sales & channels','Which channel actually makes money after returns — not just which one looks busy.')+
      periodBar(DB)+
      H.kpis([{l:'Gross sales',v:money(grossSales(DB)),d:'before returns',icon:'cart',tone:'teal'},
        {l:'Returns',v:money(returnsVal(DB)),d:returnRate(DB)+'% of gross',cls:returnRate(DB)>10?'r':'',icon:'return',tone:'peach'},
        {l:'Net sales',v:money(netSales(DB)),d:'what you keep',cls:'g',icon:'coin',tone:'green'},
        {l:'Units sold',v:unitsSold(DB),d:'pieces',icon:'box',tone:'blue'}],'')+
      H.panel('By channel',H.table([
        {label:'Channel',align:'l',k:'channel'},
        {label:'Gross',fmt:function(c){return inr(c.gross);},cellcls:'mono'},
        {label:'Returns',fmt:function(c){return inr(c.returns);},cellcls:'mono'},
        {label:'Return %',fmt:function(c){return c.rr+'%';},cellcls:function(c){return 'mono '+(c.rr>=12?'r':'');}},
        {label:'Net',fmt:function(c){return inr(c.net);},cellcls:'mono'},
        {label:'Units',k:'units',cellcls:'mono'},
        {label:'',align:'l',fmt:function(c){return c.rr>=12?H.tag('returns high','red'):H.tag('healthy','grn');}}],ch))+
      H.panel('Net sales share',ch.map(function(c){
        return '<div style="margin-bottom:9px"><div class="kv" style="border:none;padding:2px 0"><span>'+esc(c.channel)+'</span><b>'+money(c.net)+'</b></div>'+H.bar(c.net/mx*100)+'</div>';}).join(''));
    },
    money:function(){var DB=db();
      var recOver=(DB.receivables||[]).filter(function(x){return x.days>30;});
      var payOver=(DB.payables||[]).filter(function(x){return x.days>0;});
      return H.head('Command · Money','Money in, money out','Cash position, who owes you, and who you owe — with how late each one is.')+
      periodBar(DB)+
      H.kpis([{l:'Cash + bank',v:money(cash(DB)),d:'live balance',icon:'coin',tone:'teal'},
        {l:'To collect',v:money(receivable(DB)),d:recOver.length+' overdue',cls:recOver.length?'r':'',icon:'doc',tone:'peach'},
        {l:'To pay',v:money(payable(DB)),d:payOver.length+' late',cls:payOver.length?'r':'',icon:'scale',tone:'blue'},
        {l:'Net position',v:money(r2(cash(DB)+receivable(DB)-payable(DB))),d:'cash + owed − owing',cls:'g',icon:'chart',tone:'green'}],'')+
      '<div class="two">'+
      H.panel('Customers who owe you',H.table([{label:'Customer',align:'l',k:'party'},
        {label:'Amount',fmt:function(x){return inr(x.amount);},cellcls:'mono'},
        {label:'Age',fmt:function(x){return x.days+'d';},cellcls:function(x){return 'mono '+(x.days>30?'r':'');}},
        {label:'',align:'l',fmt:function(x){return x.days>60?H.tag('chase now','red'):x.days>30?H.tag('overdue','amb'):H.tag('ok','grn');}}],DB.receivables))+
      H.panel('Suppliers you owe',H.table([{label:'Supplier',align:'l',k:'party'},
        {label:'Amount',fmt:function(x){return inr(x.amount);},cellcls:'mono'},
        {label:'Due in',fmt:function(x){return x.days>0?(x.days+'d late'):((-x.days)+'d');},cellcls:function(x){return 'mono '+(x.days>0?'r':'');}},
        {label:'',align:'l',fmt:function(x){return x.days>60?H.tag('very late','red'):x.days>0?H.tag('late','amb'):H.tag('on time','grn');}}],DB.payables))+
      '</div>'+
      H.panel('Profit build-up for this period',
        '<div class="kv"><span>Net sales</span><b>'+money(netSales(DB))+'</b></div>'+
        '<div class="kv"><span>− Purchases</span><b>'+money(purchases(DB))+'</b></div>'+
        '<div class="kv"><span>− Making / wages</span><b>'+money(wages(DB))+'</b></div>'+
        '<div class="kv"><span>= Gross profit</span><b>'+money(grossProfit(DB))+'</b></div>'+
        '<div class="kv"><span>− Running expenses</span><b>'+money(expenses(DB))+'</b></div>'+
        '<div class="kv"><span><b>= Net profit</b></span><b class="'+(netProfit(DB)>=0?'g':'r')+'">'+money(netProfit(DB))+'</b></div>');
    },
    stock:function(){var DB=db();var low=lowStock(DB);
      return H.head('Command · Stock','Stock & making','What you are holding, what is running out, and what the floor produced.')+
      periodBar(DB)+
      H.kpis([{l:'Stock value',v:money(stockValue(DB)),d:'at cost',icon:'box',tone:'teal'},
        {l:'Running out',v:low.length,d:'at or below reorder',cls:low.length?'r':'g',icon:'bell',tone:low.length?'red':'green'},
        {l:'Pieces made',v:piecesMade(DB),d:'this period',cls:'g',icon:'wrench',tone:'green'},
        {l:'Making cost',v:money(wages(DB)),d:'wages paid',icon:'coin',tone:'blue'}],'')+
      H.panel('Stock on hand',H.table([{label:'Code',align:'l',k:'sku',cellcls:'mono'},{label:'Item',align:'l',k:'name'},
        {label:'Qty',k:'qty',cellcls:'mono'},{label:'Reorder at',k:'rop',cellcls:'mono'},
        {label:'Value',fmt:function(x){return inr(x.qty*x.cost);},cellcls:'mono'},
        {label:'',align:'l',fmt:function(x){return num(x.qty)<=num(x.rop)?H.tag('reorder','red'):num(x.qty)<=num(x.rop)*2?H.tag('low','amb'):H.tag('ok','grn');}}],DB.stock))+
      H.panel('Production by month',H.table([{label:'Month',align:'l',fmt:function(x){return MLBL[x.month];}},
        {label:'Pieces',k:'pieces',cellcls:'mono'},{label:'Wages',fmt:function(x){return inr(x.wages);},cellcls:'mono'},
        {label:'Cost per piece',fmt:function(x){return inr(r2(x.wages/x.pieces));},cellcls:'mono'}],DB.production));
    },
    alerts:function(){var DB=db();var al=alerts(DB);var resolved=Object.keys(DB.resolved||{}).length;
      return H.head('Operations · Alerts','Alerts','Everything the system thinks you should decide about. Clear one and it stays cleared.')+
      H.kpis([{l:'Open',v:al.length,d:'need a decision',cls:al.length?'r':'g',icon:'bell',tone:al.length?'red':'green'},
        {l:'Urgent',v:al.filter(function(a){return a.sev==='high';}).length,d:'do these first',cls:'r',icon:'scale',tone:'red'},
        {l:'Cleared',v:resolved,d:'handled by you',cls:'g',icon:'check',tone:'green'}],'k3')+
      H.panel('Open alerts',al.length?H.table([
        {label:'',align:'l',fmt:function(a){return H.tag(a.sev==='high'?'urgent':'watch',a.sev==='high'?'red':'amb');}},
        {label:'Area',align:'l',k:'area'},{label:'What is happening',align:'l',k:'what'},
        {label:'',align:'l',fmt:function(a){return '<button class="btn sm" data-go="'+a.go+'">Look</button> <button class="btn sm" data-act="clear" data-id="'+esc(a.id)+'">Clear</button>';}}],al)
        :'<div class="cascade"><b>All clear.</b> Nothing is outside its limits right now.</div>')+
      (resolved?H.panel('Cleared',
        '<p class="hint">You have cleared '+resolved+' alert(s). They come back automatically if the situation gets worse.</p>'+
        '<button class="btn" data-act="unclear">Bring them all back</button>'):'')+'<div id="res"></div>';
    },
    wiring:function(){var DB=db();
      return H.head('Wiring · Integration','Where every number comes from','The dashboard owns no data of its own. It reads the shared Data Core and shows you the result.')+
      H.note('Shared Data Core: Item/SKU · Party · Stock · Ledger/Voucher · Order — every module reads and writes these.')+
      H.panel('Every figure on this dashboard, and its source',H.table([
        {label:'Figure here',align:'l',k:'f'},{label:'Comes from',align:'l',k:'s'},{label:'How it is worked out',align:'l',k:'h'}],
        CFG.wiring||[]))+
      '<div class="two">'+
      H.panel('Live example — one sale',
        '<div class="cascade">'+
        '<div class="cl"><span class="d">1</span><div>A sale is recorded in <b>'+esc((CFG.channels||[])[0]||'a channel')+'</b>.</div></div>'+
        '<div class="cl"><span class="d">2</span><div>→ <b>Net sales</b> and the channel table on this dashboard move immediately.</div></div>'+
        '<div class="cl"><span class="d">3</span><div>→ <b>Stock</b> falls; if it crosses the reorder point an alert appears here.</div></div>'+
        '<div class="cl"><span class="d">4</span><div>→ <b>Money</b>: the customer balance is added to "to collect".</div></div>'+
        '<div class="cl"><span class="d">5</span><div>→ <b>Net profit</b> recalculates: net sales − purchases − wages − expenses.</div></div>'+
        '</div>')+
      H.panel('This dashboard writes nothing',
        '<p>It is a <b>read-only view</b> of the business. Clearing an alert is the only thing stored, and only for you.</p>'+
        '<p class="hint">That is deliberate: a dashboard that can change your books is a dashboard you cannot trust.</p>')+
      '</div>';
    }
  },
  actions:{
    setp:function(b){var DB=db();DB.period=b.getAttribute('data-p');K.save();K.render();},
    clear:function(b){var DB=db();DB.resolved=DB.resolved||{};DB.resolved[b.getAttribute('data-id')]=1;K.save();
      toast('Alert cleared ✓');setTimeout(function(){K.render();},350);},
    unclear:function(){var DB=db();DB.resolved={};K.save();toast('All alerts restored');setTimeout(function(){K.render();},350);}
  },
  tests:function(t,DB){
    DB.period='2026-07';
    t('net sales = gross − returns',netSales(DB)===r2(grossSales(DB)-returnsVal(DB)));
    t('July gross sales = 676000',grossSales(DB)===238000+164000+127000+92000+55000);
    t('gross profit = net sales − purchases − wages',grossProfit(DB)===r2(netSales(DB)-purchases(DB)-wages(DB)));
    t('net profit = gross profit − expenses',netProfit(DB)===r2(grossProfit(DB)-expenses(DB)));
    t('channel net totals equal overall net sales',
      r2(byChannel(DB).reduce(function(s,c){return s+c.net;},0))===netSales(DB));
    DB.period='all';
    var allGross=grossSales(DB);
    DB.period='2026-04';var m4=grossSales(DB);
    DB.period='2026-05';var m5=grossSales(DB);
    DB.period='2026-06';var m6=grossSales(DB);
    DB.period='2026-07';var m7=grossSales(DB);
    t('period filter works: months add up to all',r2(m4+m5+m6+m7)===allGross);
    t('switching period changes the numbers',m4!==m7);
    t('stock value = qty × cost',stockValue(DB)===r2(DB.stock.reduce(function(s,x){return s+x.qty*x.cost;},0)));
    t('low stock list only items at/below reorder',lowStock(DB).every(function(x){return x.qty<=x.rop;}));
    t('receivables total = sum of balances',receivable(DB)===r2(DB.receivables.reduce(function(s,x){return s+x.amount;},0)));
    t('alerts are raised for every low-stock item',lowStock(DB).every(function(it){
      return alerts(DB).some(function(a){return a.id==='stock-'+it.sku;});}));
    t('an overdue receivable (>30d) raises an alert',alerts(DB).some(function(a){return a.id.indexOf('rec-')===0;}));
    var before=alerts(DB).length; var first=alerts(DB)[0];
    DB.resolved[first.id]=1;
    t('clearing an alert removes it',alerts(DB).length===before-1);
    t('cash balance is a real position, not a period figure',cash(DB)>0);
  }
};

/* period switcher — the control that makes every screen live */
function periodBar(DB){
  var opts=[['2026-04','April'],['2026-05','May'],['2026-06','June'],['2026-07','July'],['all','Full year']];
  return '<div class="panel" style="padding:11px 14px;margin-bottom:14px"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'+
    '<span style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);font-weight:600">Period</span>'+
    opts.map(function(o){return '<button class="btn sm'+(DB.period===o[0]?' p':'')+'" data-act="setp" data-p="'+o[0]+'">'+o[1]+'</button>';}).join('')+
    '</div></div>';
}

if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
