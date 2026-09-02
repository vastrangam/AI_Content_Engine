/* Medhava Procurement — deep engine (RFQ → PO → GRN → 3-way match → vendor scorecard).
   Shared logic; CONFIG (defined before this file) supplies names/labels/seed flavour so the
   generic-ERP build and the Vastrangam build run the SAME math and pass the SAME self-tests. */
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
var CFG=(typeof CONFIG!=='undefined')?CONFIG:{};
function db(){return K.DB;}
var TOL=0.005; // 0.5% price tolerance for 3-way match

/* ---------- transactional seed (identical numbers in both formats; only names differ via CFG) ---------- */
function seedTxns(){
  return {
    // Purchase orders — reference vendor ids (V1..V5) and item codes (ITM-01..05)
    pos:[
      {id:'PO-1001',vendor:'V1',date:'2026-06-28',expected:'2026-07-03',status:'received',
        lines:[{item:'ITM-01',qty:100,rate:280,tax:5}]},
      {id:'PO-1002',vendor:'V2',date:'2026-06-30',expected:'2026-07-04',status:'received',
        lines:[{item:'ITM-03',qty:50,rate:150,tax:12}]},
      {id:'PO-1003',vendor:'V3',date:'2026-07-05',expected:'2026-07-12',status:'approved',
        lines:[{item:'ITM-02',qty:300,rate:90,tax:5}]},
      {id:'PO-1004',vendor:'V4',date:'2026-07-02',expected:'2026-07-08',status:'partial',
        lines:[{item:'ITM-04',qty:200,rate:35,tax:5}]}],
    // Goods receipts — received/accepted/rejected against a PO
    grns:[
      {id:'GRN-501',po:'PO-1001',date:'2026-07-02',onTime:true,
        lines:[{item:'ITM-01',ordered:100,received:100,accepted:96,rejected:4}]},
      {id:'GRN-502',po:'PO-1002',date:'2026-07-06',onTime:false,
        lines:[{item:'ITM-03',ordered:50,received:50,accepted:50,rejected:0}]},
      {id:'GRN-503',po:'PO-1004',date:'2026-07-07',onTime:true,
        lines:[{item:'ITM-04',ordered:200,received:180,accepted:180,rejected:0}]}],
    // Supplier invoices/bills — billed qty & rate (one price-mismatch, one over-billing on rejects)
    invoices:[
      {id:'BILL-9001',po:'PO-1001',vendor:'V1',date:'2026-07-03',
        lines:[{item:'ITM-01',qty:100,rate:280,tax:5}]},   // price OK, but bills 100 vs 96 accepted → qty exception
      {id:'BILL-9002',po:'PO-1002',vendor:'V2',date:'2026-07-07',
        lines:[{item:'ITM-03',qty:50,rate:165,tax:12}]}],  // rate 165 vs PO 150 → price exception
    // Open RFQ with competing quotes → award lowest
    rfqs:[
      {id:'RFQ-01',item:'ITM-05',qty:20,status:'open',date:'2026-07-09',
        quotes:[{vendor:'V5',rate:220,lead:7},{vendor:'V1',rate:240,lead:5},{vendor:'V3',rate:210,lead:9}],
        awarded:null}]
  };
}

/* ---------- pure engine ---------- */
function itemOf(DB,code){return (DB.items||[]).filter(function(i){return i.code===code;})[0]||{code:code,name:code,uom:'',stdRate:0};}
function vendorOf(DB,id){return (DB.vendors||[]).filter(function(v){return v.id===id;})[0]||{id:id,name:id};}
function lineNet(l){return r2(num(l.qty)*num(l.rate));}
function lineTax(l){return r2(num(l.qty)*num(l.rate)*num(l.tax)/100);}
function poNet(po){return r2((po.lines||[]).reduce(function(s,l){return s+lineNet(l);},0));}
function poTax(po){return r2((po.lines||[]).reduce(function(s,l){return s+lineTax(l);},0));}
function poGross(po){return r2(poNet(po)+poTax(po));}
function grnOf(DB,poId){return (DB.grns||[]).filter(function(g){return g.po===poId;})[0];}
function invOf(DB,poId){return (DB.invoices||[]).filter(function(v){return v.po===poId;})[0];}
function received(g){return (g.lines||[]).reduce(function(s,l){return s+num(l.received);},0);}
function accepted(g){return (g.lines||[]).reduce(function(s,l){return s+num(l.accepted);},0);}
function rejected(g){return (g.lines||[]).reduce(function(s,l){return s+num(l.rejected);},0);}
// Input Tax Credit is claimable only on ACCEPTED value
function itc(DB){return r2((DB.grns||[]).reduce(function(s,g){var po=poOf(DB,g.po);if(!po)return s;
  return s+g.lines.reduce(function(a,l){var pl=poLine(po,l.item);return a+(pl?num(l.accepted)*num(pl.rate)*num(pl.tax)/100:0);},0);},0));}
function poOf(DB,id){return (DB.pos||[]).filter(function(p){return p.id===id;})[0];}
function poLine(po,code){return (po.lines||[]).filter(function(l){return l.item===code;})[0];}
function payable(DB){return r2((DB.invoices||[]).reduce(function(s,v){return s+v.lines.reduce(function(a,l){return a+lineNet(l)+lineTax(l);},0);},0));}

// 3-way match: compare PO ↔ GRN ↔ Invoice; return exceptions per PO
function matchRows(DB){
  return (DB.invoices||[]).map(function(inv){
    var po=poOf(DB,inv.po),g=grnOf(DB,inv.po);var ex=[];
    (inv.lines||[]).forEach(function(il){
      var pl=po&&poLine(po,il.item); var gl=g&&g.lines.filter(function(x){return x.item===il.item;})[0];
      if(pl&&Math.abs(num(il.rate)-num(pl.rate))/num(pl.rate)>TOL) ex.push('price '+inr(pl.rate)+'→'+inr(il.rate));
      if(gl&&num(il.qty)>num(gl.accepted)) ex.push('billed '+il.qty+' > accepted '+gl.accepted);
      if(pl&&num(il.qty)>num(pl.qty)) ex.push('billed '+il.qty+' > ordered '+pl.qty);
    });
    return {inv:inv,po:po,grn:g,exceptions:ex,ok:ex.length===0};
  });
}
function exceptions(DB){return matchRows(DB).filter(function(m){return !m.ok;});}

// Vendor scorecard from GRN/PO history
function scorecard(DB){
  return (DB.vendors||[]).map(function(v){
    var gs=(DB.grns||[]).filter(function(g){return poOf(DB,g.po)&&poOf(DB,g.po).vendor===v.id;});
    var recv=gs.reduce(function(s,g){return s+received(g);},0);
    var acc=gs.reduce(function(s,g){return s+accepted(g);},0);
    var ord=gs.reduce(function(s,g){return s+g.lines.reduce(function(a,l){return a+num(l.ordered);},0);},0);
    var onT=gs.filter(function(g){return g.onTime;}).length;
    var otp=gs.length?Math.round(onT/gs.length*100):null;
    var qual=recv?Math.round(acc/recv*100):null;
    var fill=ord?Math.round(recv/ord*100):null;
    // overall = mean of available metrics
    var parts=[otp,qual,fill].filter(function(x){return x!=null;});
    var score=parts.length?Math.round(parts.reduce(function(a,b){return a+b;},0)/parts.length):null;
    return {vendor:v,deliveries:gs.length,onTime:otp,quality:qual,fill:fill,score:score};
  });
}
function awardRFQ(rfq){var best=null;(rfq.quotes||[]).forEach(function(q){if(!best||q.rate<best.rate)best=q;});return best;}

/* ---------- SPEC ---------- */
/* Procurement posts to the books and sends POs out. */
var SPEC={
  uses:['ledger','email','storage','printing','automation'],
  id:CFG.id, name:CFG.name, company:CFG.company, fy:CFG.fy||'FY 2026-27', tagline:CFG.tagline, about:CFG.about,
  groups:[
    {label:'Buying',items:['dash','rfq','po','grn']},
    {label:'Control',items:['match','scorecard']},
    {label:'Master & Wiring',items:['vendors','wiring']}],
  nav:[
    {v:'dash',label:'Dashboard',icon:'grid'},{v:'rfq',label:'RFQ & Quotes',icon:'doc'},
    {v:'po',label:'Purchase Orders',icon:'cart'},{v:'grn',label:'Goods Receipt',icon:'truck'},
    {v:'match',label:'3-Way Match',icon:'scale'},{v:'scorecard',label:'Vendor Scorecard',icon:'chart'},
    {v:'vendors',label:'Vendors',icon:'store'},{v:'wiring',label:'Wiring',icon:'flow'}],
  seed:function(DB){
    DB.vendors=JSON.parse(JSON.stringify(CFG.vendors));
    DB.items=JSON.parse(JSON.stringify(CFG.items));
    var t=seedTxns();DB.pos=t.pos;DB.grns=t.grns;DB.invoices=t.invoices;DB.rfqs=t.rfqs;
    DB.seq={po:1004,grn:503,rfq:1};
  },
  views:{
    dash:function(){var DB=db();var openPO=DB.pos.filter(function(p){return p.status!=='received'&&p.status!=='closed';});
      var pendingGRN=DB.pos.filter(function(p){return (p.status==='approved'||p.status==='partial');});
      return H.head('Command · Dashboard',CFG.name+' — live','Open commitments, receipts pending, and 3-way exceptions — all computed from your documents.')+
      H.kpis([
        {l:'Open POs',v:openPO.length,d:'awaiting full receipt',icon:'cart',tone:'teal'},
        {l:'Open PO value',v:money(openPO.reduce(function(s,p){return s+poGross(p);},0)),d:'committed spend',icon:'coin',tone:'blue'},
        {l:'Pending GRN',v:pendingGRN.length,d:'to receive',cls:pendingGRN.length?'r':'g',icon:'truck',tone:'peach'},
        {l:'3-way exceptions',v:exceptions(DB).length,d:'blocked bills',cls:exceptions(DB).length?'r':'g',icon:'scale',tone:exceptions(DB).length?'red':'green'},
        {l:'ITC claimable',v:money(itc(DB)),d:'on accepted value',icon:'pct',tone:'teal'}],'k5')+
      '<div class="two">'+
      H.panel('Recent purchase orders',H.table([
        {label:'PO',align:'l',k:'id',cellcls:'mono'},{label:'Vendor',align:'l',fmt:function(r){return esc(vendorOf(DB,r.vendor).name);}},
        {label:'Status',align:'l',fmt:function(r){return H.tag(r.status,r.status==='received'?'grn':r.status==='partial'?'amb':'blu');}},
        {label:'Gross',fmt:function(r){return inr(poGross(r));},cellcls:'mono'}],DB.pos.slice().reverse()))+
      H.panel('Raise a quick PO',H.form([
        {id:'q_vendor',label:'Vendor',type:'select',options:DB.vendors.map(function(v){return {v:v.id,label:v.name};})},
        {id:'q_item',label:CFG.itemWord||'Item',type:'select',options:DB.items.map(function(i){return {v:i.code,label:i.name};})},
        {id:'q_qty',label:'Qty',type:'num',value:50},{id:'q_rate',label:'Rate ₹',type:'num',value:100},
        {id:'q_tax',label:'GST %',type:'select',options:['0','5','12','18'],value:'5'}],'Create PO','addPO')+'<div id="res"></div>')+'</div>';
    },
    rfq:function(){var DB=db();
      return H.head('Buying · RFQ','RFQ & quote comparison','Invite quotes, compare landed rate, and award to the best vendor — that award becomes a PO.')+
      DB.rfqs.map(function(rfq){var best=awardRFQ(rfq);var it=itemOf(DB,rfq.item);
        return H.panel('RFQ '+rfq.id+' — '+esc(it.name)+' × '+rfq.qty+' '+esc(it.uom)+'  '+(rfq.awarded?H.tag('awarded '+rfq.awarded,'grn'):H.tag('open','amb')),
        H.table([{label:'Vendor',align:'l',fmt:function(q){return esc(vendorOf(DB,q.vendor).name);}},
          {label:'Quoted rate',fmt:function(q){return inr(q.rate);},cellcls:'mono'},{label:'Lead days',k:'lead',cellcls:'mono'},
          {label:'Line value',fmt:function(q){return inr(r2(q.rate*rfq.qty));},cellcls:'mono'},
          {label:'',align:'l',fmt:function(q){return q.vendor===(best&&best.vendor)?H.tag('lowest','grn'):'';}}],rfq.quotes)+
        (rfq.awarded?'':'<div style="margin-top:10px"><button class="btn p" data-act="award" data-id="'+rfq.id+'">Award lowest → create PO</button></div>'));}).join('')+'<div id="res"></div>';
    },
    po:function(){var DB=db();
      return H.head('Buying · Purchase Orders','Purchase orders','Each PO with lines, tax and gross. Approve draft POs; receive them under Goods Receipt.')+
      DB.pos.slice().reverse().map(function(po){return H.panel(po.id+' — '+esc(vendorOf(DB,po.vendor).name)+'  '+H.tag(po.status,po.status==='received'?'grn':po.status==='partial'?'amb':'blu'),
        H.table([{label:CFG.itemWord||'Item',align:'l',fmt:function(l){return esc(itemOf(DB,l.item).name);}},
          {label:'Qty',k:'qty',cellcls:'mono'},{label:'Rate',fmt:function(l){return inr(l.rate);},cellcls:'mono'},{label:'GST%',k:'tax',cellcls:'mono'},
          {label:'Net',fmt:function(l){return inr(lineNet(l));},cellcls:'mono'},{label:'Tax',fmt:function(l){return inr(lineTax(l));},cellcls:'mono'}],po.lines)+
        '<div class="kv"><span>Net</span><b>'+money(poNet(po))+'</b></div><div class="kv"><span>GST</span><b>'+money(poTax(po))+'</b></div>'+
        '<div class="kv"><span>Gross</span><b>'+money(poGross(po))+'</b></div><div class="kv"><span>Expected</span><b>'+esc(po.expected)+'</b></div>');}).join('');
    },
    grn:function(){var DB=db();
      return H.head('Buying · Goods Receipt','Goods receipt (GRN)','Received, accepted and rejected against each PO. Accepted quantity is what posts to Stock and earns ITC.')+
      DB.grns.slice().reverse().map(function(g){var po=poOf(DB,g.po);return H.panel(g.id+' — '+g.po+' ('+esc(po?vendorOf(DB,po.vendor).name:'')+')  '+(g.onTime?H.tag('on-time','grn'):H.tag('late','red')),
        H.table([{label:CFG.itemWord||'Item',align:'l',fmt:function(l){return esc(itemOf(DB,l.item).name);}},
          {label:'Ordered',k:'ordered',cellcls:'mono'},{label:'Received',k:'received',cellcls:'mono'},
          {label:'Accepted',k:'accepted',cellcls:'mono'},{label:'Rejected',k:'rejected',cellcls:function(l){return 'mono '+(num(l.rejected)?'r':'');}}],g.lines)+
        '<div class="kv"><span>→ Stock IN (accepted)</span><b>'+accepted(g)+'</b></div>'+
        (rejected(g)?'<div class="kv"><span>→ Rejected (debit note)</span><b class="r">'+rejected(g)+'</b></div>':''));}).join('')+
      H.panel('Receive an approved PO',H.form([
        {id:'g_po',label:'PO',type:'select',options:DB.pos.filter(function(p){return p.status==='approved';}).map(function(p){return {v:p.id,label:p.id+' · '+vendorOf(DB,p.vendor).name};})},
        {id:'g_recv',label:'Received qty',type:'num',value:0},{id:'g_rej',label:'Rejected qty',type:'num',value:0}],'Post GRN','addGRN')+'<div id="res"></div>');
    },
    match:function(DB){DB=db();var rows=matchRows(DB);
      return H.head('Control · 3-Way Match','Three-way match','PO ↔ GRN ↔ Invoice. A bill only passes when price, received and ordered quantities all agree.')+
      H.kpis([{l:'Bills checked',v:rows.length,d:'with invoice',icon:'doc',tone:'teal'},
        {l:'Matched',v:rows.filter(function(m){return m.ok;}).length,d:'ready to pay',cls:'g',icon:'check',tone:'green'},
        {l:'Exceptions',v:rows.filter(function(m){return !m.ok;}).length,d:'blocked',cls:'r',icon:'bell',tone:'red'}],'k3')+
      rows.map(function(m){return H.panel(m.inv.id+' — '+esc(vendorOf(DB,m.inv.vendor).name)+'  '+(m.ok?H.tag('matched','grn'):H.tag('exception','red')),
        H.table([{label:'Doc',align:'l',k:'d'},{label:'Qty',k:'q',cellcls:'mono'},{label:'Rate',k:'r',cellcls:'mono'}],[
          {d:'PO '+(m.po?m.po.id:'—'),q:m.po?m.po.lines[0].qty:'—',r:m.po?inr(m.po.lines[0].rate):'—'},
          {d:'GRN '+(m.grn?m.grn.id:'—'),q:m.grn?m.grn.lines[0].accepted+' acc':'—',r:'—'},
          {d:'Invoice '+m.inv.id,q:m.inv.lines[0].qty,r:inr(m.inv.lines[0].rate)}])+
        (m.ok?'<div class="cascade">✓ Price, received and ordered all agree — safe to pass for payment.</div>':
          '<div class="cascade" style="background:#fdeceb;border-color:#f2c9c9"><b>Held:</b> '+m.exceptions.map(esc).join(' · ')+'</div>'));}).join('');
    },
    scorecard:function(){var DB=db();var sc=scorecard(DB);
      return H.head('Control · Vendor Scorecard','Vendor scorecard','On-time, quality (accept rate) and fill rate — computed from receipt history, not opinions.')+
      H.panel('Ranked vendors',H.table([
        {label:'Vendor',align:'l',fmt:function(r){return esc(r.vendor.name);}},{label:'Deliveries',k:'deliveries',cellcls:'mono'},
        {label:'On-time',fmt:function(r){return r.onTime==null?'—':r.onTime+'%';},cellcls:'mono'},
        {label:'Quality',fmt:function(r){return r.quality==null?'—':r.quality+'%';},cellcls:'mono'},
        {label:'Fill rate',fmt:function(r){return r.fill==null?'—':r.fill+'%';},cellcls:'mono'},
        {label:'Score',align:'l',fmt:function(r){return r.score==null?H.tag('no data','gray'):H.tag(r.score+'%',r.score>=90?'grn':r.score>=70?'amb':'red');}}],
        sc.slice().sort(function(a,b){return (b.score||-1)-(a.score||-1);})))+
      H.panel('Quality (accept rate) by vendor',sc.filter(function(r){return r.quality!=null;}).map(function(r){
        return '<div style="margin-bottom:9px"><div class="kv" style="border:none;padding:2px 0"><span>'+esc(r.vendor.name)+'</span><b>'+r.quality+'%</b></div>'+H.bar(r.quality)+'</div>';}).join(''));
    },
    vendors:function(){var DB=db();
      return H.head('Master · Vendors','Vendor master','GSTIN, category and payment terms — the single source every PO and bill draws from.')+
      H.panel('Vendors <span class="badge">'+DB.vendors.length+'</span>',H.table([
        {label:'ID',align:'l',k:'id',cellcls:'mono'},{label:'Vendor',align:'l',k:'name'},{label:'GSTIN',align:'l',k:'gstin',cellcls:'mono'},
        {label:'Category',align:'l',k:'cat'},{label:'Terms',align:'l',k:'terms'}],DB.vendors))+
      H.panel(CFG.itemWord?('Item master ('+CFG.itemWord+'s)'):'Item master',H.table([
        {label:'Code',align:'l',k:'code',cellcls:'mono'},{label:'Name',align:'l',k:'name'},{label:'UoM',align:'l',k:'uom'},
        {label:'Std rate',fmt:function(r){return inr(r.stdRate);},cellcls:'mono'}],DB.items));
    },
    wiring:function(){var DB=db();
      var rows=CFG.wiring||[];
      return H.head('Wiring · Integration','How Procurement wires into the rest of the ERP','Procurement never stands alone. Each event here writes to the shared Data Core, so one action cascades everywhere.')+
      H.note('Shared Data Core: Item/SKU · Party (vendor) · Stock · Ledger/Voucher · Order — every module reads and writes these.')+
      H.panel('Outbound data flows (this app → others)',H.table([
        {label:'Trigger (here)',align:'l',k:'from'},{label:'Flows to',align:'l',k:'to'},{label:'What moves',align:'l',k:'what'}],rows))+
      '<div class="two">'+
      H.panel('Live example — GRN-501 cascade','<div class="cascade">'+
        '<div class="cl"><span class="d">1</span><div><b>Goods Receipt GRN-501</b> — 96 accepted, 4 rejected.</div></div>'+
        '<div class="cl"><span class="d">2</span><div>→ <b>Inventory</b>: Stock IN +96 '+esc(itemOf(DB,'ITM-01').name)+' at the receiving location.</div></div>'+
        '<div class="cl"><span class="d">3</span><div>→ <b>Finance / Ledger</b>: payable to '+esc(vendorOf(DB,'V1').name)+' + ITC on accepted value ('+money(r2(96*280*0.05))+').</div></div>'+
        '<div class="cl"><span class="d">4</span><div>→ <b>Quality</b>: 4 rejected raise a debit note to the vendor + a quality flag on the scorecard.</div></div>'+
        '<div class="cl"><span class="d">5</span><div>→ <b>Vendor Scorecard</b>: on-time + accept-rate recomputed from this receipt.</div></div>'+
        '</div>')+
      H.panel('Inbound (others → Procurement)',H.table([{label:'From',align:'l',k:'from'},{label:'What',align:'l',k:'what'}],
        (CFG.wiringIn||[])))+'</div>';
    }
  },
  actions:{
    addPO:function(){var DB=db();var id='PO-'+String(1000+(DB.seq.po=(DB.seq.po||1000)+1));
      DB.pos.push({id:id,vendor:H.val('q_vendor'),date:'2026-07-10',expected:'2026-07-17',status:'approved',
        lines:[{item:H.val('q_item'),qty:H.numv('q_qty'),rate:H.numv('q_rate'),tax:num(H.val('q_tax'))}]});K.save();
      var po=poOf(DB,id);var el=document.getElementById('res');if(el)el.innerHTML='<div class="cascade"><b>Created '+esc(id)+'</b> — gross '+money(poGross(po))+'. It now appears under Goods Receipt to receive.</div>';
      toast('PO created ✓');setTimeout(function(){K.render();},900);},
    award:function(b){var DB=db();var rfq=DB.rfqs.filter(function(r){return r.id===b.getAttribute('data-id');})[0];if(!rfq)return;
      var best=awardRFQ(rfq);rfq.awarded=best.vendor;var id='PO-'+String(1000+(DB.seq.po=(DB.seq.po||1000)+1));
      DB.pos.push({id:id,vendor:best.vendor,date:'2026-07-10',expected:'2026-07-17',status:'approved',lines:[{item:rfq.item,qty:rfq.qty,rate:best.rate,tax:5}]});K.save();
      var el=document.getElementById('res');if(el)el.innerHTML='<div class="cascade"><b>Awarded '+esc(rfq.id)+'</b> to '+esc(vendorOf(DB,best.vendor).name)+' at '+money(best.rate)+' → created '+esc(id)+'.</div>';
      toast('Awarded → PO created ✓');setTimeout(function(){K.render();},900);},
    addGRN:function(){var DB=db();var poId=H.val('g_po');var po=poOf(DB,poId);if(!po){toast('Pick an approved PO');return;}
      var recv=H.numv('g_recv'),rej=H.numv('g_rej');if(!recv){toast('Enter received qty');return;}
      var ordered=po.lines[0].qty;recv=Math.min(recv,ordered);rej=Math.min(rej,recv);
      var id='GRN-'+String(500+(DB.seq.grn=(DB.seq.grn||500)+1));
      DB.grns.push({id:id,po:poId,date:'2026-07-11',onTime:true,lines:[{item:po.lines[0].item,ordered:ordered,received:recv,accepted:recv-rej,rejected:rej}]});
      po.status=(recv>=ordered)?'received':'partial';K.save();
      var el=document.getElementById('res');if(el)el.innerHTML='<div class="cascade"><b>Posted '+esc(id)+'</b> — '+(recv-rej)+' accepted → Stock IN; '+rej+' rejected. PO now '+po.status+'.</div>';
      toast('GRN posted ✓');setTimeout(function(){K.render();},900);}
  },
  tests:function(t,DB){
    var po=poOf(DB,'PO-1001');
    t('PO net = qty × rate',poNet(po)===100*280);
    t('PO tax = qty × rate × gst%',poTax(po)===r2(100*280*0.05));
    t('PO gross = net + tax',poGross(po)===r2(poNet(po)+poTax(po)));
    var g=grnOf(DB,'PO-1001');
    t('GRN accepted + rejected = received',accepted(g)+rejected(g)===received(g));
    t('GRN received ≤ ordered',received(g)<=g.lines[0].ordered);
    t('ITC computed on accepted value only',itc(DB)===r2(96*280*0.05+50*150*0.12+180*35*0.05));
    var ex=exceptions(DB);
    t('3-way flags the price mismatch (BILL-9002)',ex.some(function(m){return m.inv.id==='BILL-9002';}));
    t('3-way flags over-billing vs accepted (BILL-9001)',ex.some(function(m){return m.inv.id==='BILL-9001';}));
    t('exactly 2 bills, both exceptions',matchRows(DB).length===2&&ex.length===2);
    var sc=scorecard(DB);var v1=sc.filter(function(s){return s.vendor.id==='V1';})[0];
    t('V1 quality = 96% (96 accepted / 100 received)',v1.quality===96);
    t('V1 on-time = 100%',v1.onTime===100);
    var v2=sc.filter(function(s){return s.vendor.id==='V2';})[0];
    t('V2 on-time = 0% (late delivery)',v2.onTime===0);
    var v4=sc.filter(function(s){return s.vendor.id==='V4';})[0];
    t('V4 fill rate = 90% (180 received / 200 ordered)',v4.fill===90);
    t('RFQ award picks lowest quote (V3 @ 210)',awardRFQ(DB.rfqs[0]).vendor==='V3');
  }
};
if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
