(function(){
var K=typeof Vanijo!=='undefined'?Vanijo:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
function db(){return K.DB;}
function picked(pl){return (pl.bins||[]).reduce(function(s,b){return s+num(b.picked);},0);}
function needed(pl){return (pl.bins||[]).reduce(function(s,b){return s+num(b.qty);},0);}
function progress(pl){var n=needed(pl);return n?Math.round(picked(pl)/n*100):0;}
function done(pl){return picked(pl)>=needed(pl);}
function open(DB){return (DB.picks||[]).filter(function(p){return !done(p);});}
var SPEC={ id:'warehouse', name:'Warehouse', tagline:'Bin-level pick lists — pick progress and accuracy on one board.',
  about:'A picking board. Each order becomes a pick list of bin/SKU lines; picking increments the picked count and a list auto-completes when every line is filled. Progress and open-pick counts are computed.',
  groups:[{label:'Warehouse',items:['dash','picklists','bins']}],
  nav:[{v:'dash',label:'Dashboard',icon:'grid'},{v:'picklists',label:'Pick Lists',icon:'box'},{v:'bins',label:'Bin Map',icon:'layers'}],
  seed:function(DB){
    DB.picks=[
      {id:'PK-401',order:'SO-5002',status:'open',bins:[{sku:'KUR-COT-03',bin:'A-12',qty:3,picked:3},{sku:'DUP-CHF-05',bin:'C-04',qty:2,picked:1}]},
      {id:'PK-402',order:'SO-5003',status:'open',bins:[{sku:'BLU-RDY-06',bin:'B-08',qty:5,picked:0}]},
      {id:'PK-403',order:'SO-5004',status:'open',bins:[{sku:'SAR-KAN-02',bin:'A-01',qty:1,picked:0}]},
      {id:'PK-400',order:'SO-5001',status:'open',bins:[{sku:'SAR-BAN-01',bin:'A-03',qty:2,picked:2}]}];
    DB.seq={n:401};
  },
  views:{
    dash:function(){var DB=db();var toPick=DB.picks.reduce(function(s,p){return s+(needed(p)-picked(p));},0);
      var totalNeed=DB.picks.reduce(function(s,p){return s+needed(p);},0),totalPicked=DB.picks.reduce(function(s,p){return s+picked(p);},0);
      return H.head('Command · Dashboard','Warehouse — live','Open pick lists and units still to pick across the floor.')+
      H.kpis([
        {l:'Pick lists',v:DB.picks.length,d:'in queue',icon:'box',tone:'teal'},
        {l:'Open picks',v:open(DB).length,d:'not complete',cls:open(DB).length?'r':'g',icon:'clock',tone:'peach'},
        {l:'Units to pick',v:toPick,d:'remaining lines',icon:'layers',tone:'blue'},
        {l:'Fill rate',v:(totalNeed?Math.round(totalPicked/totalNeed*100):0)+'%',d:'picked / needed',cls:'g',icon:'check',tone:'green'}],'')+
      H.panel('Progress by pick list',DB.picks.map(function(p){return '<div style="margin-bottom:10px"><div class="kv" style="border:none;padding:2px 0"><span><b class="mono">'+p.id+'</b> · '+esc(p.order)+' '+(done(p)?H.tag('done','grn'):H.tag('open','amb'))+'</span><b>'+picked(p)+'/'+needed(p)+'</b></div>'+H.bar(progress(p))+'</div>';}).join(''));
    },
    picklists:function(){var DB=db();
      return H.head('Warehouse · Pick Lists','Pick lists','Pick a line to increment it — the list closes when all lines are filled.')+
      DB.picks.slice().reverse().map(function(p){return H.panel(p.id+' — '+esc(p.order)+'  '+(done(p)?H.tag('done','grn'):H.tag(progress(p)+'%','amb')),
        H.table([{label:'SKU',align:'l',k:'sku',cellcls:'mono'},{label:'Bin',align:'l',k:'bin',cellcls:'mono'},{label:'Need',k:'qty',cellcls:'mono'},{label:'Picked',k:'picked',cellcls:'mono'},
          {label:'',align:'l',fmt:function(b){return num(b.picked)<num(b.qty)?'<button class="btn sm" data-act="pick" data-pl="'+p.id+'" data-sku="'+b.sku+'">Pick 1</button>':H.tag('full','grn');}}],p.bins));}).join('')+'<div id="res"></div>';
    },
    bins:function(){var DB=db();var bins={};DB.picks.forEach(function(p){p.bins.forEach(function(b){bins[b.bin]=bins[b.bin]||[];bins[b.bin].push({sku:b.sku,order:p.order,qty:b.qty});});});
      return H.head('Warehouse · Bin Map','Bin map','Where each SKU is being picked from, grouped by bin.')+
      H.panel('Bins',H.table([{label:'Bin',align:'l',k:'bin',cellcls:'mono'},{label:'SKU',align:'l',k:'sku',cellcls:'mono'},{label:'Order',align:'l',k:'order',cellcls:'mono'},{label:'Qty',k:'qty',cellcls:'mono'}],
        Object.keys(bins).sort().reduce(function(rows,bin){bins[bin].forEach(function(x){rows.push({bin:bin,sku:x.sku,order:x.order,qty:x.qty});});return rows;},[])));
    }
  },
  actions:{ pick:function(b){var DB=db();var p=DB.picks.filter(function(x){return x.id===b.getAttribute('data-pl');})[0];if(!p)return;
    var line=p.bins.filter(function(x){return x.sku===b.getAttribute('data-sku');})[0];if(line&&num(line.picked)<num(line.qty))line.picked=num(line.picked)+1;
    if(done(p))p.status='done';K.save();toast(done(p)?p.id+' complete ✓':'Picked ✓');setTimeout(function(){K.render();},350);} },
  tests:function(t,DB){
    t('progress = picked/needed %',progress(DB.picks[0])===Math.round(4/5*100));
    t('fully-picked list is done',done(DB.picks[3])===true);
    var p=DB.picks[1];p.bins[0].picked=p.bins[0].qty;
    t('picking all lines completes the list',done(p)===true);
    t('open list has an unfilled line',open(DB).every(function(p){return picked(p)<needed(p);}));}
};
if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Vanijo!=='undefined'&&Vanijo.app)Vanijo.app(SPEC);
})();
