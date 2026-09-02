(function(){
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
function db(){return K.DB;}
var FLOW=['booked','in-transit','delivered'];
function next(st){var i=FLOW.indexOf(st);return i>=0&&i<FLOW.length-1?FLOW[i+1]:st;}
function delivered(DB){return (DB.ship||[]).filter(function(s){return s.status==='delivered';});}
function rto(DB){return (DB.ship||[]).filter(function(s){return s.status==='rto';});}
function rtoRate(DB){var n=(DB.ship||[]).length;return n?Math.round(rto(DB).length/n*100):0;}
function cost(DB){return r2((DB.ship||[]).reduce(function(s,x){return s+num(x.cost);},0));}
function courierStats(DB){var m={};(DB.ship||[]).forEach(function(s){var c=m[s.courier]=m[s.courier]||{n:0,del:0,rto:0,cost:0};c.n++;c.cost+=num(s.cost);if(s.status==='delivered')c.del++;if(s.status==='rto')c.rto++;});return m;}
var SPEC={ id:'shipping', name:'Shipping', tagline:'AWBs, couriers & delivery status — track RTO and freight in one board.',
  about:'A dispatch board. Shipments move booked → in-transit → delivered (or RTO). Delivery count, RTO rate and freight cost are computed live, with per-courier performance.',
  groups:[{label:'Logistics',items:['dash','shipments','couriers']}],
  nav:[{v:'dash',label:'Dashboard',icon:'grid'},{v:'shipments',label:'Shipments',icon:'truck'},{v:'couriers',label:'Couriers',icon:'store'}],
  seed:function(DB){
    DB.ship=[
      {id:'SHP-701',order:'SO-5001',courier:'Delhivery',awb:'DLV0099231',status:'delivered',cost:65,weight:0.8},
      {id:'SHP-702',order:'SO-5002',courier:'Bluedart',awb:'BD77120041',status:'in-transit',cost:95,weight:1.2},
      {id:'SHP-703',order:'SO-5003',courier:'Delhivery',awb:'DLV0099244',status:'booked',cost:60,weight:0.5},
      {id:'SHP-704',order:'SO-4990',courier:'Xpressbees',awb:'XB55010022',status:'delivered',cost:55,weight:0.6},
      {id:'SHP-705',order:'SO-4988',courier:'Delhivery',awb:'DLV0099180',status:'rto',cost:70,weight:0.9},
      {id:'SHP-706',order:'SO-4985',courier:'Bluedart',awb:'BD77119900',status:'delivered',cost:110,weight:1.5}];
    DB.seq={n:6};
  },
  views:{
    dash:function(){var DB=db();
      return H.head('Command · Dashboard','Shipping — live','Freight cost and delivery health across couriers.')+
      H.kpis([
        {l:'Shipments',v:DB.ship.length,d:'all',icon:'truck',tone:'teal'},
        {l:'In transit',v:DB.ship.filter(function(s){return s.status==='booked'||s.status==='in-transit';}).length,d:'on the way',icon:'sync',tone:'blue'},
        {l:'Delivered',v:delivered(DB).length,d:'completed',cls:'g',icon:'check',tone:'green'},
        {l:'RTO rate',v:rtoRate(DB)+'%',d:rto(DB).length+' returned',cls:rtoRate(DB)>15?'r':'',icon:'return',tone:'peach'},
        {l:'Freight cost',v:money(cost(DB)),d:'total paid',icon:'coin',tone:'blue'}],'k5')+
      H.panel('Book shipment',H.form([
        {id:'s_order',label:'Order ref',ph:'SO-xxxx'},{id:'s_courier',label:'Courier',type:'select',options:['Delhivery','Bluedart','Xpressbees','India Post']},
        {id:'s_cost',label:'Freight ₹',type:'num',value:65},{id:'s_wt',label:'Weight kg',type:'num',value:0.7}],'Book','book')+'<div id="res"></div>');
    },
    shipments:function(){var DB=db();
      return H.head('Logistics · Shipments','Shipments','Advance a shipment as it moves to the customer.')+
      H.panel('Shipments <span class="badge">'+DB.ship.length+'</span>',H.table([
        {label:'Ref',align:'l',k:'id',cellcls:'mono'},{label:'Order',align:'l',k:'order',cellcls:'mono'},{label:'Courier',align:'l',k:'courier'},{label:'AWB',align:'l',k:'awb',cellcls:'mono'},
        {label:'Freight',fmt:function(r){return inr(r.cost);},cellcls:'mono'},
        {label:'Status',align:'l',fmt:function(r){return r.status==='rto'?H.tag('RTO','red'):r.status==='delivered'?H.tag('delivered','grn'):H.tag(r.status,'amb');}},
        {label:'',align:'l',fmt:function(r){return (r.status!=='delivered'&&r.status!=='rto')?'<button class="btn sm" data-act="advance" data-id="'+r.id+'">→ '+next(r.status)+'</button>':'';}}],DB.ship.slice().reverse()))+'<div id="res"></div>';
    },
    couriers:function(){var DB=db();var m=courierStats(DB);
      return H.head('Logistics · Couriers','Courier performance','Volume, delivery success and average freight per courier.')+
      H.panel('Couriers',H.table([{label:'Courier',align:'l',k:'c'},{label:'Shipments',k:'n',cellcls:'mono'},{label:'Delivered',k:'del',cellcls:'mono'},
        {label:'RTO',k:'rto',cellcls:'mono'},{label:'Success',k:'sr',cellcls:'mono'},{label:'Avg freight',k:'af',cellcls:'mono'}],
        Object.keys(m).map(function(c){var x=m[c];return {c:c,n:x.n,del:x.del,rto:x.rto,sr:Math.round(x.del/x.n*100)+'%',af:inr(r2(x.cost/x.n))};})));
    }
  },
  actions:{
    book:function(){var DB=db();var id='SHP-'+String(700+(DB.seq.n=(DB.seq.n||0)+1));
      DB.ship.push({id:id,order:H.val('s_order')||'SO-0000',courier:H.val('s_courier'),awb:'AWB'+Math.floor(Math.random()*9e7+1e7),status:'booked',cost:H.numv('s_cost'),weight:H.numv('s_wt')});K.save();
      var el=document.getElementById('res');if(el)el.innerHTML='<div class="cascade"><b>Booked '+esc(id)+'</b> via '+esc(H.val('s_courier'))+' — freight '+money(H.numv('s_cost'))+'.</div>';
      toast('Shipment booked ✓');setTimeout(function(){K.render();},800);},
    advance:function(b){var DB=db();var s=DB.ship.filter(function(x){return x.id===b.getAttribute('data-id');})[0];if(s)s.status=next(s.status);K.save();
      toast('Now '+(s?s.status:'')+' ✓');setTimeout(function(){K.render();},400);}
  },
  tests:function(t,DB){
    t('freight cost = sum(cost)',cost(DB)===r2(DB.ship.reduce(function(s,x){return s+x.cost;},0)));
    t('RTO rate = rto / total',rtoRate(DB)===Math.round(rto(DB).length/DB.ship.length*100));
    var s=DB.ship.filter(function(x){return x.status==='booked';})[0];s.status=next(s.status);
    t('booked advances to in-transit',s.status==='in-transit');
    var m=courierStats(DB);t('per-courier counts sum to total',Object.keys(m).reduce(function(a,c){return a+m[c].n;},0)===DB.ship.length);}
};
if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
})();
