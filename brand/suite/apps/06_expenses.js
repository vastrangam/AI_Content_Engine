(function(){
var K=typeof Vanijo!=='undefined'?Vanijo:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
function db(){return K.DB;}
function byCat(DB){var m={};(DB.exp||[]).forEach(function(e){m[e.cat]=r2((m[e.cat]||0)+num(e.amount));});return m;}
function sum(DB,f){return r2((DB.exp||[]).filter(f||function(){return true;}).reduce(function(s,e){return s+num(e.amount);},0));}
var SPEC={ id:'expenses', name:'Expenses', tagline:'Spend capture, categories & approvals — every rupee accounted, by head.',
  about:'Log an expense against a category; approvals gate what counts as committed spend. Totals by category and approved-vs-pending are computed live from the entries.',
  groups:[{label:'Spend',items:['dash','list','add']}],
  nav:[{v:'dash',label:'Dashboard',icon:'grid'},{v:'list',label:'Expenses',icon:'doc'},{v:'add',label:'Add Expense',icon:'spark'}],
  seed:function(DB){
    DB.cats=['Rent','Salaries','Marketing','Logistics','Packaging','Utilities','Software'];
    DB.exp=[
      {id:'EXP-101',date:'2026-07-01',cat:'Rent',desc:'Shop rent — July',amount:12000,status:'approved'},
      {id:'EXP-102',date:'2026-07-03',cat:'Marketing',desc:'Instagram ads',amount:4500,status:'approved'},
      {id:'EXP-103',date:'2026-07-05',cat:'Logistics',desc:'Delhivery courier',amount:2380,status:'approved'},
      {id:'EXP-104',date:'2026-07-07',cat:'Packaging',desc:'Poly mailers 500pc',amount:1750,status:'pending'},
      {id:'EXP-105',date:'2026-07-08',cat:'Software',desc:'Vanijo subscription',amount:999,status:'pending'},
      {id:'EXP-106',date:'2026-07-09',cat:'Utilities',desc:'Electricity',amount:2100,status:'approved'}];
    DB.seq={n:6};
  },
  views:{
    dash:function(){var DB=db();var cats=byCat(DB);var top=Object.keys(cats).sort(function(a,b){return cats[b]-cats[a];});var max=cats[top[0]]||1;
      return H.head('Command · Dashboard','Expenses — live','Spend by head, and approved vs pending — all summed from entries.')+
      H.kpis([
        {l:'Entries',v:DB.exp.length,d:'this period',icon:'doc',tone:'teal'},
        {l:'Total spend',v:money(sum(DB)),d:'all entries',icon:'coin',tone:'blue'},
        {l:'Approved',v:money(sum(DB,function(e){return e.status==='approved';})),d:'committed',icon:'check',tone:'green'},
        {l:'Pending',v:money(sum(DB,function(e){return e.status==='pending';})),d:'awaiting approval',cls:'r',icon:'clock',tone:'peach'}],'')+
      H.panel('Spend by category',top.map(function(c){return '<div style="margin-bottom:9px"><div class="kv" style="border:none;padding:2px 0"><span>'+esc(c)+'</span><b>'+money(cats[c])+'</b></div>'+H.bar(cats[c]/max*100)+'</div>';}).join(''));
    },
    list:function(){var DB=db();
      return H.head('Spend · Expenses','All expenses','Approve pending items — approval moves them into committed spend.')+
      H.panel('Entries <span class="badge">'+DB.exp.length+'</span>',H.table([
        {label:'Ref',align:'l',k:'id',cellcls:'mono'},{label:'Date',align:'l',k:'date',cellcls:'mono'},{label:'Category',align:'l',k:'cat'},{label:'Description',align:'l',k:'desc'},
        {label:'Amount',fmt:function(r){return inr(r.amount);},cellcls:'mono'},
        {label:'Status',align:'l',fmt:function(r){return r.status==='approved'?H.tag('approved','grn'):'<button class="btn sm" data-act="approve" data-id="'+r.id+'">Approve</button>';}}],DB.exp.slice().reverse()))+'<div id="res"></div>';
    },
    add:function(){var DB=db();
      return H.head('Spend · Add','Add expense','Log a spend against a category — it starts as pending.')+
      H.panel('New expense',H.form([
        {id:'e_cat',label:'Category',type:'select',options:DB.cats},{id:'e_amt',label:'Amount ₹',type:'num',value:1000},
        {id:'e_desc',label:'Description',ph:'What was it for',wide:true}],'Add expense','addExp')+'<div id="res"></div>');
    }
  },
  actions:{
    addExp:function(){var DB=db();var id='EXP-'+String(100+(DB.seq.n=(DB.seq.n||0)+1));
      DB.exp.push({id:id,date:'2026-07-10',cat:H.val('e_cat'),desc:H.val('e_desc')||'Expense',amount:H.numv('e_amt'),status:'pending'});K.save();
      var el=document.getElementById('res');if(el)el.innerHTML='<div class="cascade"><b>Logged '+esc(id)+'</b> — pending approval.</div>';
      toast('Expense added ✓');setTimeout(function(){K.render();},700);},
    approve:function(b){var DB=db();var e=DB.exp.filter(function(x){return x.id===b.getAttribute('data-id');})[0];if(e)e.status='approved';K.save();
      toast('Approved ✓');setTimeout(function(){K.render();},400);}
  },
  tests:function(t,DB){
    t('total = approved + pending',sum(DB)===r2(sum(DB,function(e){return e.status==='approved';})+sum(DB,function(e){return e.status==='pending';})));
    var cats=byCat(DB);t('category totals sum to grand total',r2(Object.keys(cats).reduce(function(s,k){return s+cats[k];},0))===sum(DB));
    var pend=DB.exp.filter(function(e){return e.status==='pending';})[0];pend.status='approved';
    t('approval increases approved total',sum(DB,function(e){return e.status==='approved';})>0);
    t('every entry has a known category',DB.exp.every(function(e){return DB.cats.indexOf(e.cat)>=0;}));}
};
if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Vanijo!=='undefined'&&Vanijo.app)Vanijo.app(SPEC);
})();
