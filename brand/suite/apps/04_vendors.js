(function(){
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
function db(){return K.DB;}
function outstanding(b){return r2(num(b.amount)-num(b.paid));}
function payable(DB){return r2((DB.bills||[]).reduce(function(s,b){return s+outstanding(b);},0));}
function daysLate(b){var due=new Date(b.due),today=new Date('2026-07-25');return Math.round((today-due)/86400000);}
function bucket(b){if(outstanding(b)<=0)return 'paid';var d=daysLate(b);return d<=0?'current':d<=30?'1-30':d<=60?'31-60':'60+';}
var SPEC={ id:'vendors', name:'Vendors', tagline:'Vendor master, payables & aging — know exactly whom you owe, and when.',
  about:'A supplier ledger with bills and payments. Outstanding is amount minus payments; aging buckets each bill by how overdue it is against today, and payments reduce the balance live.',
  groups:[{label:'Payables',items:['dash','vendors','aging']}],
  nav:[{v:'dash',label:'Dashboard',icon:'grid'},{v:'vendors',label:'Vendors',icon:'store'},{v:'aging',label:'Aging',icon:'clock'}],
  seed:function(DB){
    DB.vendors=[{name:'Jagdamba Textiles',gstin:'24ABCDE1234F1Z5',terms:'30 days'},{name:'Kanchi Silks',gstin:'33KANCH5678K1Z2',terms:'15 days'},
      {name:'Surat Cotton Mills',gstin:'24SURAT9012M1Z8',terms:'45 days'},{name:'Zari Works Jaipur',gstin:'08ZARI3456J1Z1',terms:'COD'}];
    DB.bills=[
      {id:'BILL-201',vendor:'Jagdamba Textiles',amount:19400,paid:19400,due:'2026-06-30'},
      {id:'BILL-202',vendor:'Jagdamba Textiles',amount:14200,paid:5000,due:'2026-07-15'},
      {id:'BILL-203',vendor:'Kanchi Silks',amount:13860,paid:0,due:'2026-07-05'},
      {id:'BILL-204',vendor:'Surat Cotton Mills',amount:18950,paid:0,due:'2026-08-20'},
      {id:'BILL-205',vendor:'Zari Works Jaipur',amount:6400,paid:0,due:'2026-05-10'}];
    DB.seq={n:5};
  },
  views:{
    dash:function(){var DB=db();var over=DB.bills.filter(function(b){return outstanding(b)>0&&daysLate(b)>0;});
      return H.head('Command · Dashboard','Vendors — live','Total payable and overdue exposure, computed from open bills.')+
      H.kpis([
        {l:'Vendors',v:DB.vendors.length,d:'active suppliers',icon:'store',tone:'teal'},
        {l:'Total payable',v:money(payable(DB)),d:'outstanding',icon:'coin',tone:'blue'},
        {l:'Overdue bills',v:over.length,d:'past due date',cls:over.length?'r':'g',icon:'bell',tone:over.length?'red':'green'},
        {l:'Overdue value',v:money(over.reduce(function(s,b){return s+outstanding(b);},0)),d:'needs attention',icon:'clock',tone:'peach'}],'')+
      '<div class="two">'+
      H.panel('Record a payment',H.form([
        {id:'p_bill',label:'Bill',type:'select',options:DB.bills.filter(function(b){return outstanding(b)>0;}).map(function(b){return {v:b.id,label:b.id+' · '+b.vendor+' · owing '+inr(outstanding(b))};})},
        {id:'p_amt',label:'Amount ₹',type:'num',value:5000}],'Pay','payBill')+'<div id="res"></div>')+
      H.panel('Open bills',H.table([{label:'Bill',align:'l',k:'id',cellcls:'mono'},{label:'Vendor',align:'l',k:'vendor'},
        {label:'Owing',fmt:function(r){return inr(outstanding(r));},cellcls:'mono'},{label:'Bucket',align:'l',fmt:function(r){var bk=bucket(r);return H.tag(bk,bk==='current'?'blu':bk==='paid'?'grn':'red');}}],
        DB.bills.filter(function(b){return outstanding(b)>0;})))+'</div>';
    },
    vendors:function(){var DB=db();
      var rows=DB.vendors.map(function(v){var owe=DB.bills.filter(function(b){return b.vendor===v.name;}).reduce(function(s,b){return s+outstanding(b);},0);
        return {name:v.name,gstin:v.gstin,terms:v.terms,owe:inr(owe),tag:owe>0?H.tag('owing','amb'):H.tag('clear','grn')};});
      return H.head('Payables · Vendors','Vendor master','GSTIN, payment terms and current balance per supplier.')+
      H.panel('Suppliers <span class="badge">'+DB.vendors.length+'</span>',H.table([
        {label:'Vendor',align:'l',k:'name'},{label:'GSTIN',align:'l',k:'gstin',cellcls:'mono'},{label:'Terms',align:'l',k:'terms'},
        {label:'Outstanding',k:'owe',cellcls:'mono'},{label:'',k:'tag',align:'l'}],rows));
    },
    aging:function(){var DB=db();var buckets=['current','1-30','31-60','60+'];
      var sums=buckets.map(function(bk){var v=DB.bills.filter(function(b){return bucket(b)===bk;}).reduce(function(s,b){return s+outstanding(b);},0);return {bk:bk,v:v};});
      return H.head('Payables · Aging','Aging analysis','Outstanding grouped by how overdue each bill is against 25 Jul 2026.')+
      H.kpis(sums.map(function(s){return {l:s.bk,v:money(s.v),d:'payable',icon:'clock',tone:s.bk==='current'?'blue':s.bk==='60+'?'red':'peach'};}),'')+
      H.panel('Bills by bucket',H.table([{label:'Bill',align:'l',k:'id',cellcls:'mono'},{label:'Vendor',align:'l',k:'vendor'},{label:'Due',align:'l',k:'due',cellcls:'mono'},
        {label:'Owing',fmt:function(r){return inr(outstanding(r));},cellcls:'mono'},{label:'Bucket',align:'l',fmt:function(r){var bk=bucket(r);return H.tag(bk,bk==='current'?'blu':'red');}}],
        DB.bills.filter(function(b){return outstanding(b)>0;}).sort(function(a,b){return daysLate(b)-daysLate(a);})));
    }
  },
  actions:{ payBill:function(){var DB=db();var id=H.val('p_bill'),amt=H.numv('p_amt');var b=DB.bills.filter(function(x){return x.id===id;})[0];
    if(!b){toast('No open bill selected');return;}if(!amt){toast('Enter an amount');return;}
    b.paid=r2(num(b.paid)+Math.min(amt,outstanding(b)));K.save();
    var el=document.getElementById('res');if(el)el.innerHTML='<div class="cascade"><b>Paid '+esc(id)+'</b> — balance now '+money(outstanding(b))+'.</div>';
    toast('Payment recorded ✓');setTimeout(function(){K.render();},700);} },
  tests:function(t,DB){
    t('total payable = sum(amount − paid) of open bills',payable(DB)===r2(DB.bills.reduce(function(s,b){return s+outstanding(b);},0)));
    t('fully paid bill is bucket "paid"',bucket(DB.bills[0])==='paid');
    var b=DB.bills[2];var owe=outstanding(b);b.paid=r2(b.paid+owe);
    t('payment clears outstanding',outstanding(b)===0);
    t('overpay is capped at outstanding',outstanding(DB.bills[0])>=0);}
};
if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
})();
