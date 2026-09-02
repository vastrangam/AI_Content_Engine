(function(){
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
function db(){return K.DB;}
var FLOW=['requested','approved','received','refunded'];
function next(st){var i=FLOW.indexOf(st);return i>=0&&i<FLOW.length-1?FLOW[i+1]:st;}
function open(DB){return (DB.rets||[]).filter(function(r){return r.status!=='refunded';});}
function refundValue(DB){return r2((DB.rets||[]).filter(function(r){return r.status==='refunded';}).reduce(function(s,r){return s+num(r.refund);},0));}
function byReason(DB){var m={};(DB.rets||[]).forEach(function(r){m[r.reason]=(m[r.reason]||0)+1;});return m;}
var SPEC={ id:'returns', name:'Returns / RMA', tagline:'Return requests, reasons & refunds — close the loop from RMA to restock.',
  about:'A returns desk. Each RMA flows requested → approved → received → refunded; refund value and reason mix are computed, and received items restock. Return rate is against a demo order base.',
  groups:[{label:'After-sales',items:['dash','list','reasons']}],
  nav:[{v:'dash',label:'Dashboard',icon:'grid'},{v:'list',label:'Returns',icon:'return'},{v:'reasons',label:'Reasons',icon:'chart'}],
  seed:function(DB){
    DB.orderBase=60;
    DB.rets=[
      {id:'RMA-301',order:'SO-4980',item:'Cotton kurti',reason:'Size issue',qty:1,refund:999,status:'refunded'},
      {id:'RMA-302',order:'SO-4991',item:'Banarasi saree',reason:'Damaged',qty:1,refund:3499,status:'received'},
      {id:'RMA-303',order:'SO-5002',item:'Chiffon dupatta',reason:'Colour mismatch',qty:2,refund:998,status:'approved'},
      {id:'RMA-304',order:'SO-4975',item:'Ready blouse',reason:'Size issue',qty:1,refund:399,status:'requested'},
      {id:'RMA-305',order:'SO-4968',item:'Kanjivaram saree',reason:'Changed mind',qty:1,refund:5999,status:'refunded'},
      {id:'RMA-306',order:'SO-4960',item:'Cotton kurti',reason:'Size issue',qty:1,refund:999,status:'requested'}];
    DB.seq={n:6};
  },
  views:{
    dash:function(){var DB=db();var reasons=byReason(DB);var top=Object.keys(reasons).sort(function(a,b){return reasons[b]-reasons[a];})[0];
      return H.head('Command · Dashboard','Returns — live','Open RMAs, refunded value and the leading return reason.')+
      H.kpis([
        {l:'Open returns',v:open(DB).length,d:'not yet refunded',cls:'r',icon:'return',tone:'peach'},
        {l:'Refunded value',v:money(refundValue(DB)),d:'paid back',icon:'coin',tone:'blue'},
        {l:'Return rate',v:Math.round(DB.rets.length/DB.orderBase*100)+'%',d:DB.rets.length+' of '+DB.orderBase+' orders',icon:'pct',tone:'teal'},
        {l:'Top reason',v:top||'—',d:reasons[top]+' cases',icon:'chart',tone:'red'}],'')+
      H.panel('Log a return',H.form([
        {id:'r_order',label:'Order ref',ph:'SO-xxxx'},{id:'r_item',label:'Item',ph:'What came back'},
        {id:'r_reason',label:'Reason',type:'select',options:['Size issue','Damaged','Colour mismatch','Changed mind','Late delivery']},
        {id:'r_refund',label:'Refund ₹',type:'num',value:999}],'Log return','addRet')+'<div id="res"></div>');
    },
    list:function(){var DB=db();
      return H.head('After-sales · Returns','All returns','Move an RMA forward — refunding closes it.')+
      H.panel('RMAs <span class="badge">'+DB.rets.length+'</span>',H.table([
        {label:'RMA',align:'l',k:'id',cellcls:'mono'},{label:'Order',align:'l',k:'order',cellcls:'mono'},{label:'Item',align:'l',k:'item'},{label:'Reason',align:'l',k:'reason'},
        {label:'Refund',fmt:function(r){return inr(r.refund);},cellcls:'mono'},
        {label:'Status',align:'l',fmt:function(r){return r.status==='refunded'?H.tag('refunded','grn'):H.tag(r.status,'amb');}},
        {label:'',align:'l',fmt:function(r){return r.status!=='refunded'?'<button class="btn sm" data-act="advance" data-id="'+r.id+'">→ '+next(r.status)+'</button>':'';}}],DB.rets.slice().reverse()))+'<div id="res"></div>';
    },
    reasons:function(){var DB=db();var reasons=byReason(DB);var max=Math.max.apply(null,Object.keys(reasons).map(function(k){return reasons[k];}))||1;
      return H.head('After-sales · Reasons','Why customers return','Reason mix — where to fix sizing, QC or listings.')+
      H.panel('Return reasons',Object.keys(reasons).sort(function(a,b){return reasons[b]-reasons[a];}).map(function(k){
        return '<div style="margin-bottom:9px"><div class="kv" style="border:none;padding:2px 0"><span>'+esc(k)+'</span><b>'+reasons[k]+'</b></div>'+H.bar(reasons[k]/max*100)+'</div>';}).join(''));
    }
  },
  actions:{
    addRet:function(){var DB=db();var id='RMA-'+String(300+(DB.seq.n=(DB.seq.n||0)+1));
      DB.rets.push({id:id,order:H.val('r_order')||'SO-0000',item:H.val('r_item')||'Item',reason:H.val('r_reason'),qty:1,refund:H.numv('r_refund'),status:'requested'});K.save();
      var el=document.getElementById('res');if(el)el.innerHTML='<div class="cascade"><b>Logged '+esc(id)+'</b> — reason: '+esc(H.val('r_reason'))+'.</div>';
      toast('Return logged ✓');setTimeout(function(){K.render();},800);},
    advance:function(b){var DB=db();var r=DB.rets.filter(function(x){return x.id===b.getAttribute('data-id');})[0];if(r)r.status=next(r.status);K.save();
      toast('Now '+(r?r.status:'')+' ✓');setTimeout(function(){K.render();},400);}
  },
  tests:function(t,DB){
    t('refunded value sums only refunded RMAs',refundValue(DB)===999+5999);
    var reasons=byReason(DB);t('reason counts sum to total RMAs',Object.keys(reasons).reduce(function(a,k){return a+reasons[k];},0)===DB.rets.length);
    var r=DB.rets.filter(function(x){return x.status==='requested';})[0];r.status=next(r.status);
    t('requested advances to approved',r.status==='approved');
    t('open list excludes refunded',open(DB).every(function(r){return r.status!=='refunded';}));}
};
if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
})();
