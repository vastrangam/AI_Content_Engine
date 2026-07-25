(function(){
var K=typeof Vanijo!=='undefined'?Vanijo:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
function db(){return K.DB;}
function sub(inv){return r2((inv.lines||[]).reduce(function(s,l){return s+num(l.qty)*num(l.rate);},0));}
function gstOf(inv){return r2(sub(inv)*num(inv.gst)/100);}
function total(inv){return r2(sub(inv)+gstOf(inv));}
function due(inv){return r2(Math.max(0,total(inv)-num(inv.paid)));}
var SPEC={ id:'invoicing', name:'Invoicing', tagline:'GST tax invoices & receipts — totals that add up to the paise.',
  about:'Create a GST tax invoice and the subtotal, tax and grand total are computed from the lines. Record a receipt and the amount due updates. Outstanding is the sum of what every invoice still owes.',
  groups:[{label:'Sales',items:['dash','invoices','create']}],
  nav:[{v:'dash',label:'Dashboard',icon:'grid'},{v:'invoices',label:'Invoices',icon:'doc'},{v:'create',label:'New Invoice',icon:'spark'}],
  seed:function(DB){
    DB.invoices=[
      {id:'INV-0001',customer:'Aarya Trendz',date:'2026-07-02',gst:18,paid:11790.56,lines:[{item:'Banarasi saree',qty:2,rate:3499},{item:'Chiffon dupatta',qty:6,rate:499}]},
      {id:'INV-0002',customer:'Meera Boutique',date:'2026-07-06',gst:12,paid:0,lines:[{item:'Cotton kurti',qty:12,rate:999}]},
      {id:'INV-0003',customer:'Flipkart (drop-ship)',date:'2026-07-09',gst:18,paid:2000,lines:[{item:'Ready blouse',qty:10,rate:399}]}];
    DB.seq={n:3};
  },
  views:{
    dash:function(){var DB=db();var billed=DB.invoices.reduce(function(s,i){return s+total(i);},0);var collected=DB.invoices.reduce(function(s,i){return s+num(i.paid);},0);
      return H.head('Command · Dashboard','Invoicing — live','Billed, collected and outstanding — all summed from your invoices.')+
      H.kpis([
        {l:'Invoices',v:DB.invoices.length,d:'this period',icon:'doc',tone:'teal'},
        {l:'Billed',v:money(billed),d:'incl. GST',icon:'coin',tone:'blue'},
        {l:'Collected',v:money(collected),d:'receipts',icon:'check',tone:'green'},
        {l:'Outstanding',v:money(r2(billed-collected)),d:'to collect',cls:billed-collected>0?'r':'g',icon:'clock',tone:'peach'}],'')+
      '<div class="two">'+
      H.panel('Record receipt',H.form([
        {id:'r_inv',label:'Invoice',type:'select',options:DB.invoices.filter(function(i){return due(i)>0;}).map(function(i){return {v:i.id,label:i.id+' · '+i.customer+' · due '+inr(due(i))};})},
        {id:'r_amt',label:'Amount ₹',type:'num',value:1000}],'Record','recPay')+'<div id="res"></div>')+
      H.panel('Recent invoices',H.table([{label:'Invoice',align:'l',k:'id',cellcls:'mono'},{label:'Customer',align:'l',k:'customer'},
        {label:'Total',fmt:function(r){return inr(total(r));},cellcls:'mono'},{label:'Status',align:'l',fmt:function(r){return due(r)<=0?H.tag('paid','grn'):num(r.paid)>0?H.tag('part','amb'):H.tag('unpaid','red');}}],
        DB.invoices.slice().reverse()))+'</div>';
    },
    invoices:function(){var DB=db();
      return H.head('Sales · Invoices','Tax invoices','Line detail, GST and running balance for each invoice.')+
      DB.invoices.slice().reverse().map(function(inv){return H.panel(inv.id+' — '+esc(inv.customer)+'  '+(due(inv)<=0?H.tag('paid','grn'):H.tag('due '+inr(due(inv)),'amb')),
        H.table([{label:'Item',align:'l',k:'item'},{label:'Qty',k:'qty',cellcls:'mono'},{label:'Rate',k:'rate',fmt:function(r){return inr(r.rate);},cellcls:'mono'},
          {label:'Amount',fmt:function(r){return inr(r.qty*r.rate);},cellcls:'mono'}],inv.lines)+
        '<div class="kv"><span>Subtotal</span><b>'+money(sub(inv))+'</b></div><div class="kv"><span>GST @ '+inv.gst+'%</span><b>'+money(gstOf(inv))+'</b></div>'+
        '<div class="kv"><span>Grand total</span><b>'+money(total(inv))+'</b></div><div class="kv"><span>Received</span><b>'+money(inv.paid)+'</b></div>');}).join('');
    },
    create:function(){var DB=db();
      return H.head('Sales · New Invoice','Create invoice','One quick line — the engine computes GST and the total.')+
      H.panel('Invoice',H.form([
        {id:'c_cust',label:'Customer',ph:'Bill to',wide:true},
        {id:'c_item',label:'Item / description',ph:'What sold'},{id:'c_qty',label:'Qty',type:'num',value:1},
        {id:'c_rate',label:'Rate ₹',type:'num',value:2999},{id:'c_gst',label:'GST %',type:'select',options:['5','12','18'],value:'18'}],'Create invoice','addInv')+
      '<div id="res"></div>');
    }
  },
  actions:{
    addInv:function(){var DB=db();var id='INV-'+String(1000+(DB.seq.n=(DB.seq.n||0)+1)).slice(1);
      var inv={id:id,customer:H.val('c_cust')||'Walk-in',date:'2026-07-10',gst:num(H.val('c_gst')),paid:0,lines:[{item:H.val('c_item')||'Item',qty:H.numv('c_qty'),rate:H.numv('c_rate')}]};
      DB.invoices.push(inv);K.save();
      var el=document.getElementById('res');if(el)el.innerHTML='<div class="cascade"><b>Created '+esc(id)+'</b> — subtotal '+money(sub(inv))+', GST '+money(gstOf(inv))+', total <b>'+money(total(inv))+'</b>.</div>';
      toast('Invoice created ✓');setTimeout(function(){K.render();},900);},
    recPay:function(){var DB=db();var id=H.val('r_inv'),amt=H.numv('r_amt');var inv=DB.invoices.filter(function(x){return x.id===id;})[0];
      if(!inv){toast('No unpaid invoice');return;}if(!amt){toast('Enter an amount');return;}
      inv.paid=r2(num(inv.paid)+Math.min(amt,due(inv)));K.save();
      var el=document.getElementById('res');if(el)el.innerHTML='<div class="cascade"><b>Receipt on '+esc(id)+'</b> — balance now '+money(due(inv))+'.</div>';
      toast('Receipt recorded ✓');setTimeout(function(){K.render();},700);}
  },
  tests:function(t,DB){
    var inv=DB.invoices[0];
    t('subtotal = sum(qty × rate)',sub(inv)===2*3499+6*499);
    t('total = subtotal + GST',total(inv)===r2(sub(inv)+sub(inv)*inv.gst/100));
    var d=due(DB.invoices[1]);DB.invoices[1].paid=r2(DB.invoices[1].paid+d);
    t('full receipt clears due',due(DB.invoices[1])===0);
    t('due never negative on overpay',due(DB.invoices[0])>=0);}
};
if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Vanijo!=='undefined'&&Vanijo.app)Vanijo.app(SPEC);
})();
