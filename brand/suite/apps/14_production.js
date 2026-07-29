(function(){
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
function db(){return K.DB;}
var STAGES=['cutting','stitching','finishing','done'];
function next(st){var i=STAGES.indexOf(st);return i>=0&&i<STAGES.length-1?STAGES[i+1]:st;}
function wage(w){return r2(num(w.qty)*num(w.rate));}
function wip(DB){return (DB.wos||[]).filter(function(w){return w.stage!=='done';});}
function payable(DB){return r2((DB.wos||[]).filter(function(w){return w.stage==='done';}).reduce(function(s,w){return s+wage(w);},0));}
function output(DB){return (DB.wos||[]).filter(function(w){return w.stage==='done';}).reduce(function(s,w){return s+num(w.qty);},0);}
function byKarigar(DB){var m={};(DB.wos||[]).forEach(function(w){var k=m[w.karigar]=m[w.karigar]||{pieces:0,wages:0,done:0};k.pieces+=num(w.qty);if(w.stage==='done'){k.wages+=wage(w);k.done+=num(w.qty);}});return m;}
var SPEC={ id:'production', name:'Production', tagline:'Karigar work orders & piece-rate wages — WIP to finished, wages that add up.',
  about:'A production floor for artisans. Work orders move cutting → stitching → finishing → done; piece-rate wages become payable only when done. WIP, output and per-karigar wages are computed.',
  groups:[{label:'Making',items:['dash','workorders','karigars']}],
  nav:[{v:'dash',label:'Dashboard',icon:'grid'},{v:'workorders',label:'Work Orders',icon:'wrench'},{v:'karigars',label:'Karigars',icon:'users'}],
  seed:function(DB){
    DB.wos=[
      {id:'WO-101',karigar:'Ramesh Tailor',product:'Blouse stitching',qty:20,rate:60,stage:'done'},
      {id:'WO-102',karigar:'Sunita Devi',product:'Kurti stitching',qty:15,rate:90,stage:'finishing'},
      {id:'WO-103',karigar:'Ramesh Tailor',product:'Saree fall & pico',qty:30,rate:25,stage:'done'},
      {id:'WO-104',karigar:'Imran Khan',product:'Lehenga embroidery',qty:4,rate:850,stage:'stitching'},
      {id:'WO-105',karigar:'Sunita Devi',product:'Dupatta tasseling',qty:25,rate:20,stage:'cutting'},
      {id:'WO-106',karigar:'Imran Khan',product:'Bridal finishing',qty:2,rate:1200,stage:'done'}];
    DB.seq={n:6};
  },
  views:{
    dash:function(){var DB=db();
      return H.head('Command · Dashboard','Production — live','Work in progress and piece-rate wages payable on finished work.')+
      H.kpis([
        {l:'Work orders',v:DB.wos.length,d:'on floor',icon:'wrench',tone:'teal'},
        {l:'In progress',v:wip(DB).length,d:'not yet done',cls:'r',icon:'clock',tone:'peach'},
        {l:'Pieces done',v:output(DB),d:'finished output',cls:'g',icon:'check',tone:'green'},
        {l:'Wages payable',v:money(payable(DB)),d:'on completed WOs',icon:'coin',tone:'blue'}],'')+
      H.panel('Work-in-progress by stage',STAGES.map(function(st){var ws=DB.wos.filter(function(w){return w.stage===st;});var pieces=ws.reduce(function(s,w){return s+num(w.qty);},0);var max=Math.max.apply(null,STAGES.map(function(s){return DB.wos.filter(function(w){return w.stage===s;}).reduce(function(a,w){return a+num(w.qty);},0);}))||1;
        return '<div style="margin-bottom:9px"><div class="kv" style="border:none;padding:2px 0"><span>'+st+' <span class="pill">'+ws.length+' WO</span></span><b>'+pieces+' pcs</b></div>'+H.bar(pieces/max*100)+'</div>';}).join(''));
    },
    workorders:function(){var DB=db();
      return H.head('Making · Work Orders','Work orders','Advance a work order through the stages — wages accrue when it hits done.')+
      H.panel('Work orders <span class="badge">'+DB.wos.length+'</span>',H.table([
        {label:'WO',align:'l',k:'id',cellcls:'mono'},{label:'Karigar',align:'l',k:'karigar'},{label:'Product',align:'l',k:'product'},
        {label:'Qty',k:'qty',cellcls:'mono'},{label:'Rate',fmt:function(r){return inr(r.rate);},cellcls:'mono'},{label:'Wage',fmt:function(r){return inr(wage(r));},cellcls:'mono'},
        {label:'Stage',align:'l',fmt:function(r){return r.stage==='done'?H.tag('done','grn'):H.tag(r.stage,'amb');}},
        {label:'',align:'l',fmt:function(r){return r.stage!=='done'?'<button class="btn sm" data-act="advance" data-id="'+r.id+'">→ '+next(r.stage)+'</button>':'';}}],DB.wos.slice().reverse()))+'<div id="res"></div>';
    },
    karigars:function(){var DB=db();var m=byKarigar(DB);
      return H.head('Making · Karigars','Karigar ledger','Pieces assigned, finished output and wages earned per artisan.')+
      H.panel('Artisans',H.table([{label:'Karigar',align:'l',k:'k'},{label:'Pieces assigned',k:'p',cellcls:'mono'},{label:'Pieces done',k:'d',cellcls:'mono'},{label:'Wages earned',k:'w',cellcls:'mono'}],
        Object.keys(m).map(function(k){return {k:k,p:m[k].pieces,d:m[k].done,w:inr(m[k].wages)};})));
    }
  },
  actions:{ advance:function(b){var DB=db();var w=DB.wos.filter(function(x){return x.id===b.getAttribute('data-id');})[0];if(w)w.stage=next(w.stage);K.save();
    toast(w&&w.stage==='done'?w.id+' done — wage '+money(wage(w)):'Moved to '+(w?w.stage:'')+' ✓');setTimeout(function(){K.render();},450);} },
  tests:function(t,DB){
    t('wage = qty × rate',wage(DB.wos[0])===20*60);
    t('payable counts only done WOs',payable(DB)===20*60+30*25+2*1200);
    var w=DB.wos.filter(function(x){return x.stage==='finishing';})[0];w.stage=next(w.stage);
    t('finishing advances to done',w.stage==='done');
    var m=byKarigar(DB);t('per-karigar pieces sum to grand total',Object.keys(m).reduce(function(a,k){return a+m[k].pieces;},0)===DB.wos.reduce(function(s,w){return s+w.qty;},0));}
};
if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
})();
