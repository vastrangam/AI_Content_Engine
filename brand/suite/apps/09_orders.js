(function(){
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
function db(){return K.DB;}
var FLOW=['new','packed','shipped','delivered'];
var CHAN=['Website','Flipkart','Myntra','Amazon','Retail'];
function total(o){return r2((o.lines||[]).reduce(function(s,l){return s+num(l.qty)*num(l.rate);},0));}
function next(st){var i=FLOW.indexOf(st);return i>=0&&i<FLOW.length-1?FLOW[i+1]:st;}
function unfulfilled(DB){return (DB.orders||[]).filter(function(o){return o.status==='new'||o.status==='packed';});}
function chanRev(DB,c){return r2((DB.orders||[]).filter(function(o){return o.channel===c&&o.status!=='cancelled';}).reduce(function(s,o){return s+total(o);},0));}
var SPEC={ id:'orders', name:'Sales Orders', tagline:'Every channel, one order book — capture to delivered, value at each step.',
  about:'A channel-agnostic order book. Orders flow new → packed → shipped → delivered; order value is computed from lines, and revenue splits by channel add up to the whole.',
  groups:[{label:'Fulfillment',items:['dash','orders','fulfil']}],
  nav:[{v:'dash',label:'Dashboard',icon:'grid'},{v:'orders',label:'Orders',icon:'cart'},{v:'fulfil',label:'To Fulfil',icon:'box'}],
  seed:function(DB){
    DB.orders=[
      {id:'SO-5001',customer:'Aarya Trendz',channel:'Website',date:'2026-07-02',status:'delivered',lines:[{item:'Banarasi saree',qty:2,rate:3499}]},
      {id:'SO-5002',customer:'Flipkart order',channel:'Flipkart',date:'2026-07-04',status:'shipped',lines:[{item:'Cotton kurti',qty:3,rate:999},{item:'Chiffon dupatta',qty:2,rate:499}]},
      {id:'SO-5003',customer:'Myntra order',channel:'Myntra',date:'2026-07-06',status:'packed',lines:[{item:'Ready blouse',qty:5,rate:399}]},
      {id:'SO-5004',customer:'Meera Boutique',channel:'Retail',date:'2026-07-08',status:'new',lines:[{item:'Kanjivaram saree',qty:1,rate:5999}]},
      {id:'SO-5005',customer:'Amazon order',channel:'Amazon',date:'2026-07-09',status:'new',lines:[{item:'Cotton kurti',qty:4,rate:999}]},
      {id:'SO-5006',customer:'Walk-in',channel:'Retail',date:'2026-07-09',status:'cancelled',lines:[{item:'Bridal lehenga',qty:1,rate:15999}]}];
    DB.seq={n:6};
  },
  views:{
    dash:function(){var DB=db();var live=DB.orders.filter(function(o){return o.status!=='cancelled';});
      return H.head('Command · Dashboard','Sales Orders — live','Order value and fulfilment backlog, computed from your order lines.')+
      H.kpis([
        {l:'Orders',v:live.length,d:'excl. cancelled',icon:'cart',tone:'teal'},
        {l:'Order value',v:money(live.reduce(function(s,o){return s+total(o);},0)),d:'gross',icon:'coin',tone:'blue'},
        {l:'To fulfil',v:unfulfilled(DB).length,d:'new + packed',cls:unfulfilled(DB).length?'r':'g',icon:'box',tone:'peach'},
        {l:'Delivered',v:DB.orders.filter(function(o){return o.status==='delivered';}).length,d:'completed',cls:'g',icon:'check',tone:'green'}],'')+
      '<div class="two">'+
      H.panel('Revenue by channel',H.table([{label:'Channel',align:'l',k:'c'},{label:'Orders',k:'n',cellcls:'mono'},{label:'Revenue',k:'v',cellcls:'mono'}],
        CHAN.map(function(c){return {c:c,n:DB.orders.filter(function(o){return o.channel===c&&o.status!=='cancelled';}).length,v:inr(chanRev(DB,c))};})))+
      H.panel('New order',H.form([
        {id:'o_cust',label:'Customer',ph:'Bill to',wide:true},{id:'o_chan',label:'Channel',type:'select',options:CHAN},
        {id:'o_item',label:'Item',ph:'What sold'},{id:'o_qty',label:'Qty',type:'num',value:1},{id:'o_rate',label:'Rate ₹',type:'num',value:1999}],'Create order','addOrder')+'<div id="res"></div>')+'</div>';
    },
    orders:function(){var DB=db();
      return H.head('Fulfillment · Orders','All orders','Advance an order to push it toward delivered.')+
      H.panel('Orders <span class="badge">'+DB.orders.length+'</span>',H.table([
        {label:'Order',align:'l',k:'id',cellcls:'mono'},{label:'Customer',align:'l',k:'customer'},{label:'Channel',align:'l',k:'channel'},
        {label:'Value',fmt:function(r){return inr(total(r));},cellcls:'mono'},
        {label:'Status',align:'l',fmt:function(r){return r.status==='cancelled'?H.tag('cancelled','red'):r.status==='delivered'?H.tag('delivered','grn'):H.tag(r.status,'amb');}},
        {label:'',align:'l',fmt:function(r){return (r.status!=='delivered'&&r.status!=='cancelled')?'<button class="btn sm" data-act="advance" data-id="'+r.id+'">→ '+next(r.status)+'</button>':'';}}],DB.orders.slice().reverse()))+'<div id="res"></div>';
    },
    fulfil:function(){var DB=db();var uf=unfulfilled(DB);
      return H.head('Fulfillment · To Fulfil','Fulfilment queue','Orders still to pack and ship — oldest first.')+
      (uf.length?'':H.note('Nothing pending — all orders shipped ✓'))+
      uf.map(function(o){return H.panel(o.id+' — '+esc(o.customer)+'  '+H.tag(o.status,'amb'),
        H.table([{label:'Item',align:'l',k:'item'},{label:'Qty',k:'qty',cellcls:'mono'},{label:'Amount',fmt:function(r){return inr(r.qty*r.rate);},cellcls:'mono'}],o.lines)+
        '<div style="margin-top:10px"><button class="btn p" data-act="advance" data-id="'+o.id+'">Mark '+next(o.status)+'</button></div>');}).join('')+'<div id="res"></div>';
    }
  },
  actions:{
    addOrder:function(){var DB=db();var id='SO-'+String(5000+(DB.seq.n=(DB.seq.n||0)+1));
      DB.orders.push({id:id,customer:H.val('o_cust')||'Walk-in',channel:H.val('o_chan'),date:'2026-07-10',status:'new',lines:[{item:H.val('o_item')||'Item',qty:H.numv('o_qty'),rate:H.numv('o_rate')}]});K.save();
      var el=document.getElementById('res');if(el)el.innerHTML='<div class="cascade"><b>Created '+esc(id)+'</b> on '+esc(H.val('o_chan'))+' — value '+money(r2(H.numv('o_qty')*H.numv('o_rate')))+'.</div>';
      toast('Order created ✓');setTimeout(function(){K.render();},800);},
    advance:function(b){var DB=db();var o=DB.orders.filter(function(x){return x.id===b.getAttribute('data-id');})[0];if(o)o.status=next(o.status);K.save();
      toast('Moved to '+(o?o.status:'')+' ✓');setTimeout(function(){K.render();},400);}
  },
  tests:function(t,DB){
    t('order total = sum(qty × rate)',total(DB.orders[1])===3*999+2*499);
    t('channel revenue sums to live total',r2(CHAN.reduce(function(s,c){return s+chanRev(DB,c);},0))===r2(DB.orders.filter(function(o){return o.status!=='cancelled';}).reduce(function(s,o){return s+total(o);},0)));
    var o=DB.orders.filter(function(x){return x.status==='new';})[0];o.status=next(o.status);
    t('advancing new → packed',o.status==='packed');
    t('unfulfilled excludes shipped/delivered/cancelled',unfulfilled(DB).every(function(o){return o.status==='new'||o.status==='packed';}));}
};
if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
})();
