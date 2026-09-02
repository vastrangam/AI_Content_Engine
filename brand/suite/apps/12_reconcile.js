(function(){
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
function db(){return K.DB;}
function net(p){return r2(num(p.expected)-num(p.fee));}
function variance(p){return r2(num(p.received)-net(p));}
function status(p){if(!num(p.received))return 'pending';return Math.abs(variance(p))<1?'matched':'short';}
function sum(DB,f,g){return r2((DB.payouts||[]).reduce(function(s,p){return s+num(g(p))*(f?f(p):1);},0));}
var SPEC={ id:'reconcile', name:'Reconciliation', tagline:'Marketplace payouts vs orders — every rupee of fee and shortfall, found.',
  about:'Match what a marketplace paid against what it owed. Expected minus commission is the net due; variance flags shorts. Fees, expected, received and total variance are all computed.',
  groups:[{label:'Finance',items:['dash','payouts','unmatched']}],
  nav:[{v:'dash',label:'Dashboard',icon:'grid'},{v:'payouts',label:'Payouts',icon:'coin'},{v:'unmatched',label:'Unmatched',icon:'scale'}],
  seed:function(DB){
    DB.payouts=[
      {id:'PO-9001',channel:'Flipkart',orderRef:'SO-5002',expected:4995,fee:749,received:4246},
      {id:'PO-9002',channel:'Myntra',orderRef:'SO-5003',expected:1995,fee:399,received:1596},
      {id:'PO-9003',channel:'Amazon',orderRef:'SO-5005',expected:3996,fee:640,received:3200},
      {id:'PO-9004',channel:'Flipkart',orderRef:'SO-4990',expected:2999,fee:450,received:0},
      {id:'PO-9005',channel:'Myntra',orderRef:'SO-4988',expected:5999,fee:900,received:5099}];
    DB.seq={n:5};
  },
  views:{
    dash:function(){var DB=db();var expected=sum(DB,null,function(p){return p.expected;});var received=sum(DB,null,function(p){return p.received;});
      var fees=sum(DB,null,function(p){return p.fee;});var vary=r2((DB.payouts||[]).filter(function(p){return num(p.received);}).reduce(function(s,p){return s+variance(p);},0));
      return H.head('Command · Dashboard','Reconciliation — live','Expected vs received across marketplaces, with fees and shortfall.')+
      H.kpis([
        {l:'Expected (gross)',v:money(expected),d:'order value',icon:'coin',tone:'teal'},
        {l:'Commission',v:money(fees),d:'marketplace fees',icon:'pct',tone:'peach'},
        {l:'Received',v:money(received),d:'settled to bank',icon:'check',tone:'green'},
        {l:'Variance',v:money(vary),d:'received − net due',cls:Math.abs(vary)<1?'g':'r',icon:'scale',tone:vary<0?'red':'blue'}],'')+
      H.panel('Settlement by channel',H.table([{label:'Channel',align:'l',k:'c'},{label:'Payouts',k:'n',cellcls:'mono'},{label:'Fees',k:'f',cellcls:'mono'},{label:'Received',k:'r',cellcls:'mono'}],
        ['Flipkart','Myntra','Amazon'].map(function(c){var ps=DB.payouts.filter(function(p){return p.channel===c;});return {c:c,n:ps.length,f:inr(ps.reduce(function(s,p){return s+p.fee;},0)),r:inr(ps.reduce(function(s,p){return s+p.received;},0))};})));
    },
    payouts:function(){var DB=db();
      return H.head('Finance · Payouts','All payouts','Net due is expected minus commission; variance is what actually landed.')+
      H.panel('Payouts <span class="badge">'+DB.payouts.length+'</span>',H.table([
        {label:'Ref',align:'l',k:'id',cellcls:'mono'},{label:'Channel',align:'l',k:'channel'},{label:'Order',align:'l',k:'orderRef',cellcls:'mono'},
        {label:'Expected',fmt:function(r){return inr(r.expected);},cellcls:'mono'},{label:'Fee',fmt:function(r){return inr(r.fee);},cellcls:'mono'},
        {label:'Net due',fmt:function(r){return inr(net(r));},cellcls:'mono'},{label:'Received',fmt:function(r){return inr(r.received);},cellcls:'mono'},
        {label:'Variance',fmt:function(r){return num(r.received)?inr(variance(r)):'—';},cellcls:function(r){return 'mono '+(num(r.received)&&variance(r)<0?'r':'');}},
        {label:'Status',align:'l',fmt:function(r){var s=status(r);return H.tag(s,s==='matched'?'grn':s==='short'?'red':'amb');}}],DB.payouts));
    },
    unmatched:function(){var DB=db();var un=DB.payouts.filter(function(p){return status(p)!=='matched';});
      return H.head('Finance · Unmatched','Needs attention','Pending settlements and shorts to chase with the marketplace.')+
      (un.length?'':H.note('Every payout is matched ✓'))+
      un.map(function(p){return H.panel(p.id+' — '+esc(p.channel)+'  '+H.tag(status(p),status(p)==='short'?'red':'amb'),
        '<div class="kv"><span>Net due</span><b>'+money(net(p))+'</b></div><div class="kv"><span>Received</span><b>'+money(p.received)+'</b></div>'+
        (status(p)==='pending'?'<div style="margin-top:10px"><button class="btn p" data-act="settle" data-id="'+p.id+'">Mark settled (net due)</button></div>':
          '<div class="kv"><span>Short by</span><b class="r">'+money(Math.abs(variance(p)))+'</b></div>'));}).join('')+'<div id="res"></div>';
    }
  },
  actions:{ settle:function(b){var DB=db();var p=DB.payouts.filter(function(x){return x.id===b.getAttribute('data-id');})[0];if(p)p.received=net(p);K.save();
    toast('Settled '+(p?p.id:'')+' ✓');setTimeout(function(){K.render();},500);} },
  tests:function(t,DB){
    t('net due = expected − fee',net(DB.payouts[0])===4995-749);
    t('variance = received − net due',variance(DB.payouts[0])===r2(4246-(4995-749)));
    t('zero-received payout is pending',status(DB.payouts[3])==='pending');
    var p=DB.payouts[3];p.received=net(p);t('settling at net due makes it matched',status(p)==='matched');}
};
if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
})();
