(function(){
var K=typeof Vanijo!=='undefined'?Vanijo:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
function db(){return K.DB;}
function post(DB,id,narr,lines,date){var dr=0,cr=0;lines.forEach(function(l){dr+=num(l.dr);cr+=num(l.cr);});DB.vouchers.push({id:id,date:date,narr:narr,lines:lines,dr:r2(dr)});}
function trial(DB){var m={};(DB.vouchers||[]).forEach(function(v){v.lines.forEach(function(l){m[l.acct]=r2((m[l.acct]||0)+num(l.dr)-num(l.cr));});});return m;}
function grp(DB,n){var a=(DB.accounts||[]).filter(function(x){return x.name===n;})[0];return a?a.group:'';}
function pnl(DB){var tb=trial(DB),inc=0,exp=0;(DB.accounts||[]).forEach(function(a){var b=tb[a.name]||0;if(a.group==='Income')inc=r2(inc-b);if(a.group==='Expense')exp=r2(exp+b);});return {income:inc,expense:exp,net:r2(inc-exp)};}
function gst(DB){var tb=trial(DB);var out=r2(-(tb['GST Output']||0)),inp=r2(tb['GST Input']||0);return {out:out,inp:inp,net:r2(out-inp)};}
function cash(DB){var tb=trial(DB);return r2((tb['Cash']||0)+(tb['Bank']||0));}

var SPEC={ id:'accounting', name:'Accounting', tagline:'Double-entry books, GST & P&L — every voucher balances.',
  about:'A real double-entry ledger. Post a voucher and the Trial Balance always balances; the P&L and GST are computed from the postings, not typed in.',
  groups:[{label:'Books',items:['dash','journal','tb','gst']}],
  nav:[{v:'dash',label:'Dashboard',icon:'grid'},{v:'journal',label:'Journal',icon:'book'},{v:'tb',label:'Trial Balance',icon:'scale'},{v:'gst',label:'GST',icon:'coin'}],
  seed:function(DB){
    DB.accounts=[{name:'Sales',group:'Income'},{name:'Purchases',group:'Expense'},{name:'Salaries',group:'Expense'},{name:'Rent',group:'Expense'},
      {name:'Cash',group:'Asset'},{name:'Bank',group:'Asset'},{name:'Debtors',group:'Asset'},{name:'Creditors',group:'Liability'},
      {name:'GST Output',group:'Liability'},{name:'GST Input',group:'Asset'},{name:'Capital',group:'Equity'}];
    DB.vouchers=[]; DB.seq={n:1};
    post(DB,'JV-0001','Opening capital',[{acct:'Bank',dr:500000},{acct:'Capital',cr:500000}],'2026-04-01');
    post(DB,'SL-0001','Sale — Aarya Trendz',[{acct:'Debtors',dr:11800},{acct:'Sales',cr:10000},{acct:'GST Output',cr:1800}],'2026-07-02');
    post(DB,'PU-0001','Purchase — Jagdamba Tex',[{acct:'Purchases',dr:8000},{acct:'GST Input',dr:1440},{acct:'Creditors',cr:9440}],'2026-07-03');
    post(DB,'SL-0002','Sale — Flipkart payout',[{acct:'Bank',dr:5900},{acct:'Sales',cr:5000},{acct:'GST Output',cr:900}],'2026-07-05');
    post(DB,'EX-0001','Salaries — July',[{acct:'Salaries',dr:15000},{acct:'Bank',cr:15000}],'2026-07-07');
    post(DB,'EX-0002','Shop rent',[{acct:'Rent',dr:12000},{acct:'Bank',cr:12000}],'2026-07-07');
  },
  views:{
    dash:function(){var DB=db();var p=pnl(DB),g=gst(DB);
      var recent=(DB.vouchers||[]).slice(-6).reverse();
      return H.head('Command · Dashboard','Accounting — live','Every figure is computed by the engine from your vouchers.')+
      H.kpis([
        {l:'Income',v:money(p.income),d:'sales',icon:'coin',tone:'teal'},
        {l:'Expense',v:money(p.expense),d:'purchases + costs',icon:'doc',tone:'peach'},
        {l:'Net Profit',v:money(p.net),d:'income − expense',cls:p.net>=0?'g':'r',icon:'chart',tone:'green'},
        {l:'GST payable',v:money(g.net),d:'output − input',icon:'coin',tone:'blue'},
        {l:'Cash + Bank',v:money(cash(DB)),d:'liquid',icon:'book',tone:'teal'}],'k5')+
      '<div class="two">'+H.panel('Recent vouchers',H.table([
        {label:'Vch',align:'l',k:'id',cellcls:'mono'},{label:'Date',align:'l',k:'date',cellcls:'mono'},
        {label:'Narration',align:'l',k:'narr'},{label:'Amount',k:'dr',fmt:function(r){return inr(r.dr);},cellcls:'mono'}],recent))+
      H.panel('Post a voucher',H.form([
        {id:'v_date',label:'Date',value:'2026-07-10'},{id:'v_narr',label:'Narration',ph:'Sale / expense…',wide:true},
        {id:'v_dr',label:'Debit account',type:'select',options:DB.accounts.map(function(a){return a.name;})},
        {id:'v_cr',label:'Credit account',type:'select',options:DB.accounts.map(function(a){return a.name;}),value:'Sales'},
        {id:'v_amt',label:'Amount ₹',type:'num',value:1000}],'Post voucher','addVoucher')+
      '<div id="res"></div>')+'</div>';
    },
    journal:function(){var DB=db();
      return H.head('Books · Journal','Journal','Every posting, newest first.')+
      H.panel('Vouchers <span class="badge">'+DB.vouchers.length+'</span>',H.table([
        {label:'Vch',align:'l',k:'id',cellcls:'mono'},{label:'Date',align:'l',k:'date',cellcls:'mono'},{label:'Narration',align:'l',k:'narr'},
        {label:'Debit',fmt:function(r){return r.lines.filter(function(l){return num(l.dr);}).map(function(l){return esc(l.acct);}).join(', ');},align:'l'},
        {label:'Credit',fmt:function(r){return r.lines.filter(function(l){return num(l.cr);}).map(function(l){return esc(l.acct);}).join(', ');},align:'l'},
        {label:'Amount',k:'dr',fmt:function(r){return inr(r.dr);},cellcls:'mono'}],DB.vouchers.slice().reverse()));
    },
    tb:function(){var DB=db();var tb=trial(DB);var dr=0,cr=0;
      var rows=DB.accounts.map(function(a){var b=tb[a.name]||0;var d=b>0?b:0,c=b<0?-b:0;dr=r2(dr+d);cr=r2(cr+c);return {name:a.name,group:a.group,dr:d?inr(d):'',cr:c?inr(c):''};});
      rows.push({name:'—',group:'',dr:'<b>'+inr(dr)+'</b>',cr:'<b>'+inr(cr)+'</b>'});
      return H.head('Books · Trial Balance','Trial Balance','Debits equal credits — always.')+
      H.panel(Math.abs(dr-cr)<0.01?'Balanced <span class="badge">Dr = Cr</span>':'Out of balance',H.table([
        {label:'Account',align:'l',k:'name'},{label:'Group',align:'l',k:'group'},{label:'Debit',k:'dr',cellcls:'mono'},{label:'Credit',k:'cr',cellcls:'mono'}],rows));
    },
    gst:function(){var DB=db();var g=gst(DB);
      return H.head('Books · GST','GST summary','Output tax collected, input credit, net payable.')+
      H.kpis([{l:'Output GST',v:money(g.out),d:'collected on sales',icon:'coin',tone:'teal'},
        {l:'Input GST',v:money(g.inp),d:'credit on purchases',icon:'coin',tone:'green'},
        {l:'Net payable',v:money(g.net),d:'output − input',cls:g.net>=0?'':'g',icon:'scale',tone:'blue'}],'k3');
    }
  },
  actions:{ addVoucher:function(){var DB=db();var dr=H.val('v_dr'),cr=H.val('v_cr'),amt=H.numv('v_amt');
    if(dr===cr){toast('Debit and credit must differ');return;} if(!amt){toast('Enter an amount');return;}
    var id='JV-'+String(1000+(DB.seq.n=(DB.seq.n||0)+1));
    post(DB,id,H.val('v_narr')||'Voucher',[{acct:dr,dr:amt},{acct:cr,cr:amt}],H.val('v_date')||'2026-07-10');
    K.save();var el=document.getElementById('res');if(el)el.innerHTML='<div class="cascade"><b>Posted '+esc(id)+'</b> — '+esc(dr)+' Dr '+money(amt)+' · '+esc(cr)+' Cr '+money(amt)+'. Trial Balance still balances.</div>';
    toast('Voucher posted ✓');setTimeout(function(){K.render();},700);} },
  tests:function(t,DB){var tb=trial(DB),sum=0;Object.keys(tb).forEach(function(k){sum=r2(sum+tb[k]);});
    t('trial balance sums to zero',Math.abs(sum)<0.01);
    t('net profit = -20000 (income 15000 − expense 35000)',pnl(DB).net===-20000);
    t('GST payable = 1260 (2700 − 1440)',gst(DB).net===1260);
    t('cash+bank computed',cash(DB)===500000+5900-15000-12000);}
};
if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Vanijo!=='undefined'&&Vanijo.app)Vanijo.app(SPEC);
})();
