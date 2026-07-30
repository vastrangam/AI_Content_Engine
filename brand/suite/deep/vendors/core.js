/* Medhava Vendor Management — deep engine.
   Vendor 360 · ledger & payables · aging · risk scoring · performance-based sourcing.
   CONFIG (defined before this file) supplies names/flavour so the generic-ERP and Vastrangam
   builds run the SAME math and pass the SAME self-tests. */
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
var CFG=(typeof CONFIG!=='undefined')?CONFIG:{};
function db(){return K.DB;}
var TODAY='2026-07-25';
var BUCKETS=['current','1-30','31-60','60+'];

/* ---------- shared transactional seed (identical numbers in both formats) ---------- */
function seedTxns(){
  return {
    bills:[
      {id:'BILL-9001',vendor:'V1',date:'2026-06-05',due:'2026-07-05',amount:203700,paid:203700},
      {id:'BILL-9002',vendor:'V1',date:'2026-06-28',due:'2026-07-28',amount:148900,paid:50000},
      {id:'BILL-9003',vendor:'V2',date:'2026-06-10',due:'2026-06-25',amount:92400,paid:0},
      {id:'BILL-9004',vendor:'V3',date:'2026-07-02',due:'2026-08-16',amount:189500,paid:0},
      {id:'BILL-9005',vendor:'V4',date:'2026-04-20',due:'2026-05-10',amount:64000,paid:0},
      {id:'BILL-9006',vendor:'V5',date:'2026-07-10',due:'2026-07-10',amount:44000,paid:44000},
      {id:'BILL-9007',vendor:'V2',date:'2026-07-15',due:'2026-07-30',amount:57800,paid:0}],
    // delivery history feeds performance; qty in the config's unit
    deliveries:[
      {vendor:'V1',ordered:100,received:100,accepted:96,onTime:true},
      {vendor:'V1',ordered:60,received:60,accepted:60,onTime:true},
      {vendor:'V2',ordered:50,received:50,accepted:50,onTime:false},
      {vendor:'V2',ordered:80,received:72,accepted:70,onTime:false},
      {vendor:'V3',ordered:300,received:300,accepted:297,onTime:true},
      {vendor:'V4',ordered:200,received:180,accepted:180,onTime:true},
      {vendor:'V5',ordered:20,received:20,accepted:19,onTime:true}],
    seq:{b:9007}
  };
}

/* ---------- pure engine ---------- */
function vendorOf(DB,id){return (DB.vendors||[]).filter(function(v){return v.id===id;})[0]||{id:id,name:id};}
function outstanding(b){return r2(Math.max(0,num(b.amount)-num(b.paid)));}
function days(a,b){return Math.round((new Date(b)-new Date(a))/86400000);}
function daysLate(b){return days(b.due,TODAY);}
function bucket(b){ if(outstanding(b)<=0) return 'paid'; var d=daysLate(b);
  return d<=0?'current':d<=30?'1-30':d<=60?'31-60':'60+'; }
function payable(DB,vid){return r2((DB.bills||[]).filter(function(b){return !vid||b.vendor===vid;})
  .reduce(function(s,b){return s+outstanding(b);},0));}
function overdue(DB,vid){return (DB.bills||[]).filter(function(b){return (!vid||b.vendor===vid)&&outstanding(b)>0&&daysLate(b)>0;});}
function bucketTotal(DB,bk){return r2((DB.bills||[]).filter(function(b){return bucket(b)===bk;}).reduce(function(s,b){return s+outstanding(b);},0));}
function spend(DB,vid){return r2((DB.bills||[]).filter(function(b){return b.vendor===vid;}).reduce(function(s,b){return s+num(b.amount);},0));}
function totalSpend(DB){return r2((DB.bills||[]).reduce(function(s,b){return s+num(b.amount);},0));}
function sharePct(DB,vid){var t=totalSpend(DB);return t?Math.round(spend(DB,vid)/t*100):0;}

// performance from delivery history (null when no history)
function perf(DB,vid){
  var ds=(DB.deliveries||[]).filter(function(d){return d.vendor===vid;});
  if(!ds.length) return {n:0,onTime:null,quality:null,fill:null,score:null};
  var ord=ds.reduce(function(s,d){return s+num(d.ordered);},0);
  var rec=ds.reduce(function(s,d){return s+num(d.received);},0);
  var acc=ds.reduce(function(s,d){return s+num(d.accepted);},0);
  var ot=ds.filter(function(d){return d.onTime;}).length;
  var onTime=Math.round(ot/ds.length*100), quality=rec?Math.round(acc/rec*100):null, fill=ord?Math.round(rec/ord*100):null;
  var parts=[onTime,quality,fill].filter(function(x){return x!=null;});
  return {n:ds.length,onTime:onTime,quality:quality,fill:fill,score:Math.round(parts.reduce(function(a,b){return a+b;},0)/parts.length)};
}
// risk = performance risk + concentration risk + payment-discipline risk (0 best .. 100 worst)
function risk(DB,vid){
  var p=perf(DB,vid); var r=0;
  r += p.score==null?25:Math.round((100-p.score)*0.5);      // up to 50 from performance
  r += Math.min(30,Math.round(sharePct(DB,vid)*0.6));        // up to 30 from spend concentration
  var od=overdue(DB,vid).length; r += Math.min(20,od*10);    // up to 20 from overdue bills
  return Math.min(100,r);
}
function riskBand(x){return x<=25?'low':x<=50?'medium':'high';}
function rated(DB){return (DB.vendors||[]).map(function(v){var p=perf(DB,v.id);
  return {v:v,p:p,payable:payable(DB,v.id),spend:spend(DB,v.id),share:sharePct(DB,v.id),risk:risk(DB,v.id)};});}
function preferred(DB,cat){
  var list=rated(DB).filter(function(r){return !cat||r.v.cat===cat;}).filter(function(r){return r.p.score!=null;});
  list.sort(function(a,b){return b.p.score-a.p.score;});
  return list[0]||null;
}

/* Vendor management reads bills from the books and contacts suppliers. */
var SPEC={
  uses:['ledger','email','storage','messaging'],
  id:CFG.id, name:CFG.name, company:CFG.company, fy:CFG.fy||'FY 2026-27', tagline:CFG.tagline, about:CFG.about,
  groups:[
    {label:'Vendors',items:['dash','directory','v360']},
    {label:'Money',items:['ledger','aging']},
    {label:'Control & Wiring',items:['risk','sourcing','wiring']}],
  nav:[
    {v:'dash',label:'Dashboard',icon:'grid'},{v:'directory',label:'Vendor Directory',icon:'store'},
    {v:'v360',label:'Vendor 360',icon:'users'},{v:'ledger',label:'Bills & Payments',icon:'doc'},
    {v:'aging',label:'Aging',icon:'clock'},{v:'risk',label:'Risk',icon:'bell'},
    {v:'sourcing',label:'Sourcing',icon:'chart'},{v:'wiring',label:'Wiring',icon:'flow'}],
  seed:function(DB){
    DB.vendors=JSON.parse(JSON.stringify(CFG.vendors));
    var t=seedTxns(); DB.bills=t.bills; DB.deliveries=t.deliveries; DB.seq=t.seq;
    DB.sel=DB.vendors[0].id;
  },
  views:{
    dash:function(){var DB=db();var od=overdue(DB);
      return H.head('Command · Dashboard',CFG.name+' — live','Payables, overdue exposure and supplier risk — every figure computed from your bills and delivery history.')+
      H.kpis([
        {l:'Vendors',v:DB.vendors.length,d:'active suppliers',icon:'store',tone:'teal'},
        {l:'Total payable',v:money(payable(DB)),d:'outstanding',icon:'coin',tone:'blue'},
        {l:'Overdue bills',v:od.length,d:'past due date',cls:od.length?'r':'g',icon:'bell',tone:od.length?'red':'green'},
        {l:'Overdue value',v:money(r2(od.reduce(function(s,b){return s+outstanding(b);},0))),d:'needs action',icon:'clock',tone:'peach'},
        {l:'High-risk vendors',v:rated(DB).filter(function(r){return riskBand(r.risk)==='high';}).length,d:'score > 50',cls:'r',icon:'scale',tone:'red'}],'k5')+
      '<div class="two">'+
      H.panel('Aging summary',H.table([{label:'Bucket',align:'l',k:'b'},{label:'Outstanding',k:'v',cellcls:'mono'}],
        BUCKETS.map(function(bk){return {b:bk,v:inr(bucketTotal(DB,bk))};})))+
      H.panel('Record a payment',H.form([
        {id:'p_bill',label:'Bill',type:'select',options:DB.bills.filter(function(b){return outstanding(b)>0;}).map(function(b){return {v:b.id,label:b.id+' · '+vendorOf(DB,b.vendor).name+' · owing '+inr(outstanding(b))};})},
        {id:'p_amt',label:'Amount ₹',type:'num',value:25000}],'Pay','payBill','f2')+'<div id="res"></div>')+'</div>';
    },
    directory:function(){var DB=db();var rs=rated(DB);
      return H.head('Vendors · Directory','Vendor directory','Every supplier with GSTIN, terms, spend share, payable and live performance score.')+
      H.panel('Suppliers <span class="badge">'+DB.vendors.length+'</span>',H.table([
        {label:'ID',align:'l',fmt:function(r){return '<span class="mono">'+esc(r.v.id)+'</span>';}},
        {label:'Vendor',align:'l',fmt:function(r){return esc(r.v.name);}},
        {label:'Category',align:'l',fmt:function(r){return esc(r.v.cat);}},
        {label:'GSTIN',align:'l',fmt:function(r){return '<span class="mono">'+esc(r.v.gstin)+'</span>';}},
        {label:'Terms',align:'l',fmt:function(r){return esc(r.v.terms);}},
        {label:'Spend',fmt:function(r){return inr(r.spend);},cellcls:'mono'},
        {label:'Share',fmt:function(r){return r.share+'%';},cellcls:'mono'},
        {label:'Payable',fmt:function(r){return inr(r.payable);},cellcls:'mono'},
        {label:'Score',align:'l',fmt:function(r){return r.p.score==null?H.tag('no data','gray'):H.tag(r.p.score+'%',r.p.score>=90?'grn':r.p.score>=70?'amb':'red');}},
        {label:'',align:'l',fmt:function(r){return '<button class="btn sm" data-act="select" data-id="'+r.v.id+'">360 →</button>';}}],rs))+'<div id="res"></div>';
    },
    v360:function(){var DB=db();var vid=DB.sel||DB.vendors[0].id;var v=vendorOf(DB,vid);var p=perf(DB,vid);
      var bills=DB.bills.filter(function(b){return b.vendor===vid;});
      var rk=risk(DB,vid);
      return H.head('Vendors · 360','Vendor 360 — '+esc(v.name),'Everything about one supplier on one screen: terms, spend, bills, performance and risk.')+
      H.panel('Choose vendor',H.form([{id:'s_v',label:'Vendor',type:'select',value:vid,options:DB.vendors.map(function(x){return {v:x.id,label:x.name};})}],'Open 360','open360','f2'))+
      H.kpis([
        {l:'Total spend',v:money(spend(DB,vid)),d:sharePct(DB,vid)+'% of all spend',icon:'coin',tone:'blue'},
        {l:'Payable now',v:money(payable(DB,vid)),d:'outstanding',icon:'doc',tone:'peach'},
        {l:'Performance',v:p.score==null?'—':p.score+'%',d:p.n+' deliveries',cls:p.score>=90?'g':'',icon:'chart',tone:'green'},
        {l:'Risk',v:rk,d:riskBand(rk),cls:riskBand(rk)==='high'?'r':'',icon:'scale',tone:riskBand(rk)==='high'?'red':'teal'}],'')+
      '<div class="two">'+
      H.panel('Profile','<div class="kv"><span>Category</span><b>'+esc(v.cat)+'</b></div>'+
        '<div class="kv"><span>GSTIN</span><b class="mono">'+esc(v.gstin)+'</b></div>'+
        '<div class="kv"><span>Payment terms</span><b>'+esc(v.terms)+'</b></div>'+
        '<div class="kv"><span>Location</span><b>'+esc(v.loc||'—')+'</b></div>'+
        '<div class="kv"><span>On-time</span><b>'+(p.onTime==null?'—':p.onTime+'%')+'</b></div>'+
        '<div class="kv"><span>Quality (accept rate)</span><b>'+(p.quality==null?'—':p.quality+'%')+'</b></div>'+
        '<div class="kv"><span>Fill rate</span><b>'+(p.fill==null?'—':p.fill+'%')+'</b></div>')+
      H.panel('Bills',H.table([
        {label:'Bill',align:'l',k:'id',cellcls:'mono'},{label:'Due',align:'l',k:'due',cellcls:'mono'},
        {label:'Amount',fmt:function(b){return inr(b.amount);},cellcls:'mono'},
        {label:'Owing',fmt:function(b){return inr(outstanding(b));},cellcls:'mono'},
        {label:'Status',align:'l',fmt:function(b){var bk=bucket(b);return H.tag(bk,bk==='paid'?'grn':bk==='current'?'blu':'red');}}],bills))+'</div>';
    },
    ledger:function(){var DB=db();
      return H.head('Money · Bills & Payments','Bills & payments','Every supplier bill with what is still owed. Paying reduces the balance live.')+
      H.panel('Bills <span class="badge">'+DB.bills.length+'</span>',H.table([
        {label:'Bill',align:'l',k:'id',cellcls:'mono'},
        {label:'Vendor',align:'l',fmt:function(b){return esc(vendorOf(DB,b.vendor).name);}},
        {label:'Date',align:'l',k:'date',cellcls:'mono'},{label:'Due',align:'l',k:'due',cellcls:'mono'},
        {label:'Amount',fmt:function(b){return inr(b.amount);},cellcls:'mono'},
        {label:'Paid',fmt:function(b){return inr(b.paid);},cellcls:'mono'},
        {label:'Owing',fmt:function(b){return inr(outstanding(b));},cellcls:function(b){return 'mono '+(outstanding(b)>0?'r':'g');}},
        {label:'Status',align:'l',fmt:function(b){var bk=bucket(b);return H.tag(bk,bk==='paid'?'grn':bk==='current'?'blu':'red');}}],DB.bills))+
      H.panel('Add a bill',H.form([
        {id:'b_v',label:'Vendor',type:'select',options:DB.vendors.map(function(x){return {v:x.id,label:x.name};})},
        {id:'b_amt',label:'Amount ₹',type:'num',value:50000},
        {id:'b_due',label:'Due date',value:'2026-08-25'}],'Add bill','addBill')+'<div id="res"></div>');
    },
    aging:function(){var DB=db();var open=DB.bills.filter(function(b){return outstanding(b)>0;});
      var max=Math.max.apply(null,BUCKETS.map(function(bk){return bucketTotal(DB,bk);}))||1;
      return H.head('Money · Aging','Aging analysis','Outstanding grouped by how overdue each bill is against '+TODAY+'.')+
      H.kpis(BUCKETS.map(function(bk){return {l:bk,v:money(bucketTotal(DB,bk)),d:'payable',icon:'clock',
        tone:bk==='current'?'blue':bk==='60+'?'red':'peach',cls:bk==='60+'&&bucketTotal(DB,bk)>0?'r':''};}),'')+
      H.panel('Bucket distribution',BUCKETS.map(function(bk){var v=bucketTotal(DB,bk);
        return '<div style="margin-bottom:9px"><div class="kv" style="border:none;padding:2px 0"><span>'+bk+'</span><b>'+money(v)+'</b></div>'+H.bar(v/max*100)+'</div>';}).join(''))+
      H.panel('Open bills — oldest first',H.table([
        {label:'Bill',align:'l',k:'id',cellcls:'mono'},{label:'Vendor',align:'l',fmt:function(b){return esc(vendorOf(DB,b.vendor).name);}},
        {label:'Due',align:'l',k:'due',cellcls:'mono'},
        {label:'Days late',fmt:function(b){var d=daysLate(b);return d>0?('<b class="r">'+d+'</b>'):String(d);},cellcls:'mono'},
        {label:'Owing',fmt:function(b){return inr(outstanding(b));},cellcls:'mono'},
        {label:'Bucket',align:'l',fmt:function(b){var bk=bucket(b);return H.tag(bk,bk==='current'?'blu':'red');}}],
        open.slice().sort(function(a,b){return daysLate(b)-daysLate(a);})));
    },
    risk:function(){var DB=db();var rs=rated(DB).slice().sort(function(a,b){return b.risk-a.risk;});
      return H.head('Control · Risk','Supplier risk','Risk blends three real signals — weak performance, spend concentration, and overdue bills.')+
      H.note('Risk = (100 − performance) × 0.5  +  spend share × 0.6 (max 30)  +  10 per overdue bill (max 20). Lower is better.')+
      H.panel('Ranked by risk',H.table([
        {label:'Vendor',align:'l',fmt:function(r){return esc(r.v.name);}},
        {label:'Performance',fmt:function(r){return r.p.score==null?'—':r.p.score+'%';},cellcls:'mono'},
        {label:'Spend share',fmt:function(r){return r.share+'%';},cellcls:'mono'},
        {label:'Overdue',fmt:function(r){return overdue(DB,r.v.id).length;},cellcls:'mono'},
        {label:'Risk',fmt:function(r){return r.risk;},cellcls:'mono'},
        {label:'Band',align:'l',fmt:function(r){var b=riskBand(r.risk);return H.tag(b,b==='low'?'grn':b==='medium'?'amb':'red');}}],rs))+
      H.panel('Concentration — is too much spend with one supplier?',rs.slice().sort(function(a,b){return b.share-a.share;}).map(function(r){
        return '<div style="margin-bottom:9px"><div class="kv" style="border:none;padding:2px 0"><span>'+esc(r.v.name)+'</span><b>'+r.share+'%</b></div>'+H.bar(r.share)+'</div>';}).join(''));
    },
    sourcing:function(){var DB=db();
      var cats=DB.vendors.map(function(v){return v.cat;}).filter(function(c,i,a){return a.indexOf(c)===i;});
      return H.head('Control · Sourcing','Performance-based sourcing','For each category the engine names the best-performing supplier — sourcing follows evidence, not habit.')+
      H.panel('Preferred vendor by category',H.table([
        {label:'Category',align:'l',k:'c'},{label:'Preferred vendor',align:'l',k:'n'},
        {label:'Score',k:'s',cellcls:'mono'},{label:'Risk',align:'l',k:'r'}],
        cats.map(function(c){var p=preferred(DB,c);
          return {c:c,n:p?esc(p.v.name):'— no rated vendor —',s:p?p.p.score+'%':'—',
            r:p?H.tag(riskBand(p.risk),riskBand(p.risk)==='low'?'grn':riskBand(p.risk)==='medium'?'amb':'red'):''};})))+
      '<div class="two">'+
      H.panel('Best overall',(function(){var b=preferred(DB);return b?
        '<div class="cascade"><b>'+esc(b.v.name)+'</b> is your strongest supplier at <b>'+b.p.score+'%</b> — on-time '+b.p.onTime+'%, quality '+b.p.quality+'%, fill '+b.p.fill+'%. Route new orders here first.</div>':'<div class="empty">No rated vendors.</div>';})())+
      H.panel('Watchlist',(function(){var w=rated(DB).filter(function(r){return riskBand(r.risk)!=='low';});
        return w.length?H.table([{label:'Vendor',align:'l',fmt:function(r){return esc(r.v.name);}},
          {label:'Why',align:'l',fmt:function(r){var why=[];if(r.p.score!=null&&r.p.score<90)why.push('performance '+r.p.score+'%');
            if(r.share>=25)why.push('concentration '+r.share+'%');if(overdue(DB,r.v.id).length)why.push(overdue(DB,r.v.id).length+' overdue');
            return esc(why.join(' · '));}}],w):'<div class="empty">All vendors low-risk ✓</div>';})())+'</div>';
    },
    wiring:function(){var DB=db();
      return H.head('Wiring · Integration','How Vendor Management wires into the rest of the ERP','The vendor master is a Data Core entity — Party. Every module that touches a supplier reads and writes it here.')+
      H.note('Shared Data Core: Item/SKU · Party (vendor) · Stock · Ledger/Voucher · Order — every module reads and writes these.')+
      H.panel('Outbound data flows (this app → others)',H.table([
        {label:'Trigger (here)',align:'l',k:'from'},{label:'Flows to',align:'l',k:'to'},{label:'What moves',align:'l',k:'what'}],CFG.wiring||[]))+
      '<div class="two">'+
      H.panel('Live example — '+esc(vendorOf(DB,'V2').name),'<div class="cascade">'+
        '<div class="cl"><span class="d">1</span><div><b>Two late deliveries</b> drop on-time to '+perf(DB,'V2').onTime+'%.</div></div>'+
        '<div class="cl"><span class="d">2</span><div>→ <b>Risk</b>: score rises to '+risk(DB,'V2')+' ('+riskBand(risk(DB,'V2'))+') — overdue bills add to it.</div></div>'+
        '<div class="cl"><span class="d">3</span><div>→ <b>Sourcing</b>: this vendor loses preferred status in its category.</div></div>'+
        '<div class="cl"><span class="d">4</span><div>→ <b>Procurement</b>: the next RFQ routes to the higher-scoring supplier instead.</div></div>'+
        '<div class="cl"><span class="d">5</span><div>→ <b>Finance</b>: '+money(payable(DB,'V2'))+' payable, '+overdue(DB,'V2').length+' bill(s) overdue, flagged for the payment run.</div></div>'+
        '</div>')+
      H.panel('Inbound (others → Vendor Management)',H.table([{label:'From',align:'l',k:'from'},{label:'What',align:'l',k:'what'}],CFG.wiringIn||[]))+'</div>';
    }
  },
  actions:{
    payBill:function(){var DB=db();var id=H.val('p_bill'),amt=H.numv('p_amt');
      var b=DB.bills.filter(function(x){return x.id===id;})[0];
      if(!b){toast('No open bill selected');return;} if(!amt){toast('Enter an amount');return;}
      b.paid=r2(num(b.paid)+Math.min(amt,outstanding(b)));K.save();
      var el=document.getElementById('res');if(el)el.innerHTML='<div class="cascade"><b>Paid '+esc(id)+'</b> — balance now '+money(outstanding(b))+'. Total payable '+money(payable(DB))+'.</div>';
      toast('Payment recorded ✓');setTimeout(function(){K.render();},800);},
    addBill:function(){var DB=db();var id='BILL-'+String(9000+(DB.seq.b=(DB.seq.b||9000)+1)).slice(1);
      id='BILL-'+String(DB.seq.b);
      DB.bills.push({id:id,vendor:H.val('b_v'),date:TODAY,due:H.val('b_due')||'2026-08-25',amount:H.numv('b_amt'),paid:0});K.save();
      var el=document.getElementById('res');if(el)el.innerHTML='<div class="cascade"><b>Added '+esc(id)+'</b> — total payable now '+money(payable(DB))+'.</div>';
      toast('Bill added ✓');setTimeout(function(){K.render();},800);},
    select:function(b){var DB=db();DB.sel=b.getAttribute('data-id');K.save();K.go('v360');},
    open360:function(){var DB=db();DB.sel=H.val('s_v');K.save();K.render();}
  },
  tests:function(t,DB){
    t('outstanding = amount − paid',outstanding(DB.bills[1])===148900-50000);
    t('fully paid bill is bucket "paid"',bucket(DB.bills[0])==='paid');
    t('total payable = sum of outstanding',payable(DB)===r2(DB.bills.reduce(function(s,b){return s+outstanding(b);},0)));
    t('bucket totals sum to total payable',r2(BUCKETS.reduce(function(s,bk){return s+bucketTotal(DB,bk);},0))===payable(DB));
    var v5=DB.bills.filter(function(b){return b.id==='BILL-9005';})[0];
    t('BILL-9005 is 60+ days overdue',bucket(v5)==='60+'&&daysLate(v5)>60);
    var p1=perf(DB,'V1');
    t('V1 on-time = 100% (2 of 2)',p1.onTime===100);
    t('V1 quality = 97.5% → 98 (156 accepted / 160 received)',p1.quality===Math.round(156/160*100));
    var p2=perf(DB,'V2');
    t('V2 on-time = 0% (0 of 2 on time)',p2.onTime===0);
    t('V4 fill rate = 90% (180 of 200)',perf(DB,'V4').fill===90);
    t('spend shares sum to ~100%',Math.abs(DB.vendors.reduce(function(s,v){return s+sharePct(DB,v.id);},0)-100)<=2);
    t('risk is bounded 0..100',DB.vendors.every(function(v){var r=risk(DB,v.id);return r>=0&&r<=100;}));
    t('a late + overdue vendor scores higher risk than a clean one',risk(DB,'V2')>risk(DB,'V3'));
    t('preferred vendor is the highest-scoring rated one',preferred(DB).p.score===Math.max.apply(null,DB.vendors.map(function(v){var p=perf(DB,v.id);return p.score==null?-1:p.score;})));
    var before=payable(DB); var b=DB.bills.filter(function(x){return outstanding(x)>0;})[0];
    var owed=outstanding(b); b.paid=r2(num(b.paid)+owed);
    t('paying a bill reduces total payable by exactly that amount',payable(DB)===r2(before-owed));
  }
};
if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
