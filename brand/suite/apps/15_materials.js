(function(){
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
function db(){return K.DB;}
function mat(DB,name){return (DB.materials||[]).filter(function(m){return m.name===name;})[0];}
function matValue(DB){return r2((DB.materials||[]).reduce(function(s,m){return s+num(m.stock)*num(m.cost);},0));}
function low(DB){return (DB.materials||[]).filter(function(m){return num(m.stock)<=num(m.rop);});}
function bomCost(DB,bom){return r2((bom.lines||[]).reduce(function(s,l){var m=mat(DB,l.material);return s+(m?num(m.cost)*num(l.qty):0);},0));}
var SPEC={ id:'materials', name:'Materials / BOM', tagline:'Raw materials & bills of materials — costed product recipes from live rates.',
  about:'A materials store plus product recipes. Material value is stock × cost; each BOM rolls up to a product cost from current material rates, so a rate change reprices every product that uses it.',
  groups:[{label:'Materials',items:['dash','stock','bom']}],
  nav:[{v:'dash',label:'Dashboard',icon:'grid'},{v:'stock',label:'Material Stock',icon:'box'},{v:'bom',label:'Bill of Materials',icon:'layers'}],
  seed:function(DB){
    DB.materials=[
      {name:'Silk fabric',unit:'m',stock:120,cost:280,rop:40},
      {name:'Cotton fabric',unit:'m',stock:300,cost:90,rop:80},
      {name:'Zari thread',unit:'reel',stock:25,cost:150,rop:30},
      {name:'Lining',unit:'m',stock:200,cost:35,rop:60},
      {name:'Hooks & fasteners',unit:'set',stock:500,cost:6,rop:200},
      {name:'Chiffon',unit:'m',stock:45,cost:110,rop:50}];
    DB.boms=[
      {product:'Banarasi silk saree',lines:[{material:'Silk fabric',qty:5.5},{material:'Zari thread',qty:2},{material:'Lining',qty:1}]},
      {product:'Cotton kurti',lines:[{material:'Cotton fabric',qty:2.2},{material:'Hooks & fasteners',qty:1}]},
      {product:'Chiffon dupatta',lines:[{material:'Chiffon',qty:2.5},{material:'Zari thread',qty:0.5}]}];
    DB.seq={n:1};
  },
  views:{
    dash:function(){var DB=db();
      return H.head('Command · Dashboard','Materials / BOM — live','Store value and shortages, plus costed product recipes.')+
      H.kpis([
        {l:'Materials',v:DB.materials.length,d:'in store',icon:'box',tone:'teal'},
        {l:'Store value',v:money(matValue(DB)),d:'stock × cost',icon:'coin',tone:'blue'},
        {l:'Low materials',v:low(DB).length,d:'at/below reorder',cls:low(DB).length?'r':'g',icon:'bell',tone:low(DB).length?'red':'green'},
        {l:'Recipes',v:DB.boms.length,d:'products costed',icon:'layers',tone:'teal'}],'')+
      '<div class="two">'+
      H.panel('Adjust material stock',H.form([
        {id:'m_name',label:'Material',type:'select',options:DB.materials.map(function(m){return m.name;})},
        {id:'m_qty',label:'Change (+ in / − out)',type:'num',value:10}],'Post','adjust','f2')+'<div id="res"></div>')+
      H.panel('Product cost (from BOM)',H.table([{label:'Product',align:'l',k:'p'},{label:'Material cost',k:'c',cellcls:'mono'}],
        DB.boms.map(function(b){return {p:b.product,c:inr(bomCost(DB,b))};})))+'</div>';
    },
    stock:function(){var DB=db();
      return H.head('Materials · Stock','Material store','On-hand, unit rate and value for every raw material.')+
      H.panel('Materials <span class="badge">'+DB.materials.length+'</span>',H.table([
        {label:'Material',align:'l',k:'name'},{label:'Unit',align:'l',k:'unit'},{label:'Stock',k:'stock',cellcls:'mono'},
        {label:'Rate',fmt:function(r){return inr(r.cost);},cellcls:'mono'},{label:'Value',fmt:function(r){return inr(r.stock*r.cost);},cellcls:'mono'},
        {label:'Status',align:'l',fmt:function(r){return num(r.stock)<=num(r.rop)?H.tag('reorder','red'):H.tag('ok','grn');}}],DB.materials));
    },
    bom:function(){var DB=db();
      return H.head('Materials · BOM','Bills of materials','Each recipe with quantities and rolled-up cost at current rates.')+
      DB.boms.map(function(b){return H.panel(esc(b.product)+' <span class="badge">'+money(bomCost(DB,b))+'</span>',
        H.table([{label:'Material',align:'l',k:'material'},{label:'Qty',k:'qty',cellcls:'mono'},{label:'Rate',fmt:function(l){var m=mat(DB,l.material);return m?inr(m.cost):'—';},cellcls:'mono'},
          {label:'Line cost',fmt:function(l){var m=mat(DB,l.material);return m?inr(r2(m.cost*l.qty)):'—';},cellcls:'mono'}],b.lines));}).join('');
    }
  },
  actions:{ adjust:function(){var DB=db();var m=mat(DB,H.val('m_name'));var q=H.numv('m_qty');if(!m){toast('Pick a material');return;}
    m.stock=Math.max(0,num(m.stock)+q);K.save();
    var el=document.getElementById('res');if(el)el.innerHTML='<div class="cascade"><b>'+esc(m.name)+'</b> stock now <b>'+m.stock+' '+esc(m.unit)+'</b> — value '+money(r2(m.stock*m.cost))+'.</div>';
    toast('Stock updated ✓');setTimeout(function(){K.render();},700);} },
  tests:function(t,DB){
    t('store value = sum(stock × cost)',matValue(DB)===r2(DB.materials.reduce(function(s,m){return s+m.stock*m.cost;},0)));
    var b=DB.boms[0];t('BOM cost = sum(qty × material rate)',bomCost(DB,b)===r2(5.5*280+2*150+1*35));
    mat(DB,'Zari thread').stock=999;t('reorder clears when restocked',low(DB).indexOf(mat(DB,'Zari thread'))<0);
    t('low list only at/below reorder',low(DB).every(function(m){return m.stock<=m.rop;}));}
};
if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
})();
