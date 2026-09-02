(function(){
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
function db(){return K.DB;}
var LOCS=['Store','Warehouse','Online'];
function onhand(it){return LOCS.reduce(function(s,l){return s+num(it.loc[l]);},0);}
function value(DB){return r2((DB.items||[]).reduce(function(s,it){return s+onhand(it)*num(it.cost);},0));}
function retail(DB){return r2((DB.items||[]).reduce(function(s,it){return s+onhand(it)*num(it.price);},0));}
function low(DB){return (DB.items||[]).filter(function(it){return onhand(it)<=num(it.rop);});}
function move(DB,sku,loc,qty,kind,note){var it=(DB.items||[]).filter(function(x){return x.sku===sku;})[0];if(!it)return;
  it.loc[loc]=Math.max(0,num(it.loc[loc])+qty);DB.moves.push({id:'MV-'+String(1000+(DB.seq.n=(DB.seq.n||0)+1)),sku:sku,loc:loc,qty:qty,kind:kind,note:note||'',date:'2026-07-10'});}
function transfer(DB,sku,from,to,qty){var it=(DB.items||[]).filter(function(x){return x.sku===sku;})[0];if(!it)return;var q=Math.min(qty,num(it.loc[from]));
  it.loc[from]=num(it.loc[from])-q;it.loc[to]=num(it.loc[to])+q;DB.moves.push({id:'MV-'+String(1000+(DB.seq.n=(DB.seq.n||0)+1)),sku:sku,loc:from+'→'+to,qty:q,kind:'transfer',note:'',date:'2026-07-10'});}

var SPEC={ id:'inventory', name:'Inventory', tagline:'Multi-location stock, valuation & reorder — quantities that always reconcile.',
  about:'A real stock ledger across three locations. On-hand, valuation (at cost) and retail value are computed from item balances; every adjustment writes a move, and transfers conserve total quantity.',
  groups:[{label:'Stock',items:['dash','stock','moves','reorder']}],
  nav:[{v:'dash',label:'Dashboard',icon:'grid'},{v:'stock',label:'Stock',icon:'box'},{v:'moves',label:'Movements',icon:'sync'},{v:'reorder',label:'Reorder',icon:'bell'}],
  seed:function(DB){
    DB.items=[
      {sku:'SAR-BAN-01',name:'Banarasi silk saree — maroon',cost:1400,price:3499,rop:6,loc:{Store:4,Warehouse:10,Online:3}},
      {sku:'SAR-KAN-02',name:'Kanjivaram saree — teal',cost:2200,price:5999,rop:4,loc:{Store:2,Warehouse:3,Online:1}},
      {sku:'KUR-COT-03',name:'Cotton kurti — indigo',cost:380,price:999,rop:15,loc:{Store:8,Warehouse:5,Online:6}},
      {sku:'LEH-BRD-04',name:'Bridal lehenga — red',cost:6800,price:15999,rop:2,loc:{Store:1,Warehouse:1,Online:0}},
      {sku:'DUP-CHF-05',name:'Chiffon dupatta — gold',cost:180,price:499,rop:20,loc:{Store:12,Warehouse:9,Online:14}},
      {sku:'BLU-RDY-06',name:'Ready blouse — black',cost:150,price:399,rop:25,loc:{Store:6,Warehouse:4,Online:2}}];
    DB.moves=[];DB.seq={n:1};
    move(DB,'SAR-BAN-01','Warehouse',10,'purchase','GRN from Jagdamba Tex');
    move(DB,'KUR-COT-03','Online',-3,'sale','Flipkart orders');
    move(DB,'DUP-CHF-05','Store',-5,'sale','counter sales');
  },
  views:{
    dash:function(){var DB=db();var lo=low(DB);
      return H.head('Command · Dashboard','Inventory — live','Stock value and shortages computed from item balances across '+LOCS.length+' locations.')+
      H.kpis([
        {l:'SKUs',v:DB.items.length,d:'active items',icon:'box',tone:'teal'},
        {l:'Units on hand',v:inr(DB.items.reduce(function(s,it){return s+onhand(it);},0)).split('.')[0],d:'all locations',icon:'layers',tone:'blue'},
        {l:'Stock value (cost)',v:money(value(DB)),d:'inventory asset',icon:'coin',tone:'green'},
        {l:'Retail value',v:money(retail(DB)),d:'at selling price',icon:'tag',tone:'teal'},
        {l:'Low stock',v:lo.length,d:'at/below reorder',cls:lo.length?'r':'g',icon:'bell',tone:lo.length?'red':'green'}],'k5')+
      '<div class="two">'+
      H.panel('Location split',H.table([{label:'Location',align:'l',k:'l'},{label:'Units',k:'u',cellcls:'mono'},{label:'Value',k:'v',cellcls:'mono'}],
        LOCS.map(function(l){var u=DB.items.reduce(function(s,it){return s+num(it.loc[l]);},0);var val=DB.items.reduce(function(s,it){return s+num(it.loc[l])*num(it.cost);},0);return {l:l,u:u,v:inr(val)};})))+
      H.panel('Record movement',H.form([
        {id:'m_sku',label:'Item',type:'select',options:DB.items.map(function(i){return {v:i.sku,label:i.sku+' · '+i.name};})},
        {id:'m_loc',label:'Location',type:'select',options:LOCS},
        {id:'m_qty',label:'Qty (+ in / − out)',type:'num',value:5},
        {id:'m_note',label:'Note',ph:'GRN / sale / adjustment'}],'Post movement','addMove')+'<div id="res"></div>')+'</div>';
    },
    stock:function(){var DB=db();
      var rows=DB.items.map(function(it){var oh=onhand(it);return {sku:it.sku,name:it.name,st:it.loc.Store,wh:it.loc.Warehouse,on:it.loc.Online,oh:oh,
        val:inr(oh*it.cost),tag:oh<=it.rop?H.tag('reorder','red'):oh<=it.rop*2?H.tag('low','amb'):H.tag('ok','grn')};});
      return H.head('Stock · Ledger','Stock on hand','On-hand per location, valuation at cost, reorder status.')+
      H.panel('Items <span class="badge">'+DB.items.length+'</span>',H.table([
        {label:'SKU',align:'l',k:'sku',cellcls:'mono'},{label:'Name',align:'l',k:'name'},
        {label:'Store',k:'st',cellcls:'mono'},{label:'WH',k:'wh',cellcls:'mono'},{label:'Online',k:'on',cellcls:'mono'},
        {label:'On hand',k:'oh',cellcls:'mono'},{label:'Value',k:'val',cellcls:'mono'},{label:'Status',k:'tag',align:'l'}],rows));
    },
    moves:function(){var DB=db();
      return H.head('Stock · Movements','Movement ledger','Every in, out and transfer — newest first.')+
      H.panel('Movements <span class="badge">'+DB.moves.length+'</span>',H.table([
        {label:'Ref',align:'l',k:'id',cellcls:'mono'},{label:'Date',align:'l',k:'date',cellcls:'mono'},{label:'SKU',align:'l',k:'sku',cellcls:'mono'},
        {label:'Location',align:'l',k:'loc'},{label:'Kind',align:'l',k:'kind',fmt:function(r){return H.tag(r.kind,r.qty<0?'amb':'grn');}},
        {label:'Qty',k:'qty',cellcls:function(r){return 'mono '+(r.qty<0?'r':'g');}},{label:'Note',align:'l',k:'note'}],DB.moves.slice().reverse()));
    },
    reorder:function(){var DB=db();var lo=low(DB);
      var rows=lo.map(function(it){var oh=onhand(it);var sug=Math.max(it.rop*2-oh,it.rop);return {sku:it.sku,name:it.name,oh:oh,rop:it.rop,sug:sug,cost:inr(sug*it.cost)};});
      return H.head('Stock · Reorder','Reorder suggestions','Items at or below their reorder point, with a suggested purchase quantity.')+
      (lo.length?'':H.note('All items above reorder point ✓'))+
      H.panel('To reorder <span class="badge">'+lo.length+'</span>',H.table([
        {label:'SKU',align:'l',k:'sku',cellcls:'mono'},{label:'Name',align:'l',k:'name'},{label:'On hand',k:'oh',cellcls:'mono'},
        {label:'Reorder pt',k:'rop',cellcls:'mono'},{label:'Suggest qty',k:'sug',cellcls:'mono'},{label:'Est. cost',k:'cost',cellcls:'mono'}],rows));
    }
  },
  actions:{ addMove:function(){var DB=db();var sku=H.val('m_sku'),loc=H.val('m_loc'),qty=H.numv('m_qty');
    if(!qty){toast('Enter a non-zero quantity');return;}
    move(DB,sku,loc,qty,qty<0?'sale':'purchase',H.val('m_note'));K.save();
    var it=DB.items.filter(function(x){return x.sku===sku;})[0];
    var el=document.getElementById('res');if(el)el.innerHTML='<div class="cascade"><b>'+esc(sku)+'</b> '+(qty<0?'−':'+')+Math.abs(qty)+' at '+esc(loc)+'. On hand now <b>'+onhand(it)+'</b>.</div>';
    toast('Movement posted ✓');setTimeout(function(){K.render();},700);} },
  tests:function(t,DB){
    t('valuation = sum(onhand × cost)',value(DB)===r2(DB.items.reduce(function(s,it){return s+onhand(it)*it.cost;},0)));
    var before=DB.items.reduce(function(s,it){return s+onhand(it);},0);transfer(DB,'SAR-BAN-01','Warehouse','Store',3);
    var after=DB.items.reduce(function(s,it){return s+onhand(it);},0);
    t('transfer conserves total units',before===after);
    move(DB,'BLU-RDY-06','Online',-999,'sale','oversell guard');
    var it=DB.items.filter(function(x){return x.sku==='BLU-RDY-06';})[0];
    t('stock never goes negative',it.loc.Online>=0);
    t('low-stock list only items at/below ROP',low(DB).every(function(i){return onhand(i)<=i.rop;}));}
};
if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
})();
