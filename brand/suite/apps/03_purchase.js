(function(){
var K=typeof Vanijo!=='undefined'?Vanijo:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
function db(){return K.DB;}
function total(po){return r2((po.lines||[]).reduce(function(s,l){return s+num(l.qty)*num(l.rate);},0));}
function withGst(po){return r2(total(po)*1.05);}
function stat(po){return po.status;}
var SPEC={ id:'purchase', name:'Purchase', tagline:'Purchase orders, goods receipt & bill matching — from indent to inwards.',
  about:'Raise a purchase order, receive it, and the value flows to a supplier bill. Totals and GST are computed from the order lines, and receiving an order marks stock inwards.',
  groups:[{label:'Buying',items:['dash','orders','receive']}],
  nav:[{v:'dash',label:'Dashboard',icon:'grid'},{v:'orders',label:'Purchase Orders',icon:'cart'},{v:'receive',label:'Goods Receipt',icon:'truck'}],
  seed:function(DB){
    DB.pos=[
      {id:'PO-1001',vendor:'Jagdamba Textiles',date:'2026-07-01',status:'received',lines:[{item:'Banarasi silk saree',qty:10,rate:1400},{item:'Chiffon dupatta',qty:30,rate:180}]},
      {id:'PO-1002',vendor:'Kanchi Silks',date:'2026-07-04',status:'open',lines:[{item:'Kanjivaram saree',qty:6,rate:2200}]},
      {id:'PO-1003',vendor:'Surat Cotton Mills',date:'2026-07-08',status:'open',lines:[{item:'Cotton kurti',qty:40,rate:380},{item:'Ready blouse',qty:25,rate:150}]}];
    DB.seq={n:3};
  },
  views:{
    dash:function(){var DB=db();var open=DB.pos.filter(function(p){return p.status==='open';});var rec=DB.pos.filter(function(p){return p.status==='received';});
      var openVal=open.reduce(function(s,p){return s+total(p);},0);
      return H.head('Command · Dashboard','Purchase — live','Open commitments and received value, computed from order lines.')+
      H.kpis([
        {l:'Purchase orders',v:DB.pos.length,d:'all time',icon:'cart',tone:'teal'},
        {l:'Open POs',v:open.length,d:'awaiting receipt',icon:'clock',tone:'peach'},
        {l:'Open value',v:money(openVal),d:'committed spend',icon:'coin',tone:'blue'},
        {l:'Received value',v:money(rec.reduce(function(s,p){return s+total(p);},0)),d:'inwards done',icon:'truck',tone:'green'}],'')+
      '<div class="two">'+
      H.panel('Create purchase order',H.form([
        {id:'p_vendor',label:'Vendor',ph:'Supplier name',wide:true},
        {id:'p_item',label:'Item',ph:'What are you buying'},{id:'p_qty',label:'Qty',type:'num',value:10},
        {id:'p_rate',label:'Rate ₹',type:'num',value:500}],'Raise PO','addPO')+'<div id="res"></div>')+
      H.panel('Recent POs',H.table([{label:'PO',align:'l',k:'id',cellcls:'mono'},{label:'Vendor',align:'l',k:'vendor'},
        {label:'Status',align:'l',k:'status',fmt:function(r){return H.tag(r.status,r.status==='received'?'grn':'amb');}},
        {label:'Value',fmt:function(r){return inr(total(r));},cellcls:'mono'}],DB.pos.slice().reverse()))+'</div>';
    },
    orders:function(){var DB=db();
      return H.head('Buying · Orders','Purchase orders','Every PO with its lines, GST-inclusive value and status.')+
      DB.pos.slice().reverse().map(function(p){return H.panel(p.id+' — '+esc(p.vendor)+'  '+H.tag(p.status,p.status==='received'?'grn':'amb'),
        H.table([{label:'Item',align:'l',k:'item'},{label:'Qty',k:'qty',cellcls:'mono'},{label:'Rate',k:'rate',fmt:function(r){return inr(r.rate);},cellcls:'mono'},
          {label:'Amount',fmt:function(r){return inr(r.qty*r.rate);},cellcls:'mono'}],p.lines)+
        '<div class="kv"><span>Subtotal</span><b>'+money(total(p))+'</b></div><div class="kv"><span>With GST 5%</span><b>'+money(withGst(p))+'</b></div>');}).join('');
    },
    receive:function(){var DB=db();var open=DB.pos.filter(function(p){return p.status==='open';});
      return H.head('Buying · Goods Receipt','Receive goods','Mark an open PO as received — its value posts to inwards.')+
      (open.length?'':H.note('No open POs to receive ✓'))+
      open.map(function(p){return H.panel(p.id+' — '+esc(p.vendor),
        '<div class="kv"><span>Lines</span><b>'+p.lines.length+'</b></div><div class="kv"><span>Value with GST</span><b>'+money(withGst(p))+'</b></div>'+
        '<div style="margin-top:10px"><button class="btn p" data-act="receivePO" data-id="'+p.id+'"><svg class="i"><use href="#s-check"/></svg> Receive '+p.id+'</button></div>');}).join('')+
      '<div id="res"></div>';
    }
  },
  actions:{
    addPO:function(){var DB=db();var v=H.val('p_vendor')||'New vendor',item=H.val('p_item')||'Item',qty=H.numv('p_qty'),rate=H.numv('p_rate');
      var id='PO-'+String(1000+(DB.seq.n=(DB.seq.n||0)+1));DB.pos.push({id:id,vendor:v,date:'2026-07-10',status:'open',lines:[{item:item,qty:qty,rate:rate}]});K.save();
      var el=document.getElementById('res');if(el)el.innerHTML='<div class="cascade"><b>Raised '+esc(id)+'</b> to '+esc(v)+' — value '+money(r2(qty*rate))+'.</div>';
      toast('PO raised ✓');setTimeout(function(){K.render();},700);},
    receivePO:function(b){var DB=db();var id=b.getAttribute('data-id');var p=DB.pos.filter(function(x){return x.id===id;})[0];if(p)p.status='received';K.save();
      toast(id+' received ✓');setTimeout(function(){K.render();},500);}
  },
  tests:function(t,DB){
    t('PO total = sum(qty × rate)',total(DB.pos[0])===10*1400+30*180);
    t('GST-inclusive = subtotal × 1.05',withGst(DB.pos[0])===r2(total(DB.pos[0])*1.05));
    var openBefore=DB.pos.filter(function(p){return p.status==='open';}).length;
    DB.pos.filter(function(p){return p.status==='open';})[0].status='received';
    t('receiving reduces open count',DB.pos.filter(function(p){return p.status==='open';}).length===openBefore-1);
    t('every PO has at least one line',DB.pos.every(function(p){return p.lines.length>0;}));}
};
if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Vanijo!=='undefined'&&Vanijo.app)Vanijo.app(SPEC);
})();
