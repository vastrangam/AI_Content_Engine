(function(){
var K=typeof Vanijo!=='undefined'?Vanijo:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
function db(){return K.DB;}
var FIELDS=['title','desc','mrp','price','images','fabric','color','size','hsn'];
function score(p){var have=FIELDS.filter(function(f){var v=p[f];return f==='images'?num(v)>0:(v!==''&&v!=null&&v!==0);}).length;return Math.round(have/FIELDS.length*100);}
function ready(p){return score(p)>=100;}
function avg(DB){var ps=DB.products||[];return ps.length?Math.round(ps.reduce(function(s,p){return s+score(p);},0)/ps.length):0;}
var SPEC={ id:'catalog', name:'Catalog / PIM', tagline:'One product record, every channel — completeness scored before you list.',
  about:'A product information hub. Each product is scored on the nine attributes a marketplace needs; only 100%-complete products are channel-ready. Add a product and watch its score compute from what you fill.',
  groups:[{label:'Products',items:['dash','catalog','readiness']}],
  nav:[{v:'dash',label:'Dashboard',icon:'grid'},{v:'catalog',label:'Catalog',icon:'layers'},{v:'readiness',label:'Readiness',icon:'check'}],
  seed:function(DB){
    DB.products=[
      {sku:'SAR-BAN-01',title:'Banarasi Silk Saree',desc:'Handwoven pure silk with zari border',mrp:3499,price:2799,images:5,fabric:'Silk',color:'Maroon',size:'Free',hsn:'5007'},
      {sku:'KUR-COT-03',title:'Indigo Cotton Kurti',desc:'Block-printed cotton, straight cut',mrp:999,price:799,images:4,fabric:'Cotton',color:'Indigo',size:'S-XXL',hsn:'6109'},
      {sku:'LEH-BRD-04',title:'Bridal Lehenga',desc:'',mrp:15999,price:12999,images:2,fabric:'Velvet',color:'Red',size:'M',hsn:''},
      {sku:'DUP-CHF-05',title:'Chiffon Dupatta',desc:'Lightweight with gold trim',mrp:499,price:0,images:0,fabric:'Chiffon',color:'Gold',size:'Free',hsn:'6214'},
      {sku:'BLU-RDY-06',title:'Ready Blouse',desc:'',mrp:399,price:299,images:1,fabric:'',color:'Black',size:'',hsn:''}];
    DB.seq={n:6};
  },
  views:{
    dash:function(){var DB=db();var rdy=DB.products.filter(ready).length;
      return H.head('Command · Dashboard','Catalog / PIM — live','Average completeness and channel-readiness, scored from product attributes.')+
      H.kpis([
        {l:'Products',v:DB.products.length,d:'in catalog',icon:'layers',tone:'teal'},
        {l:'Avg completeness',v:avg(DB)+'%',d:'across catalog',icon:'pct',tone:'blue'},
        {l:'Channel-ready',v:rdy,d:'100% complete',cls:'g',icon:'check',tone:'green'},
        {l:'Needs work',v:DB.products.length-rdy,d:'missing fields',cls:'r',icon:'wrench',tone:'peach'}],'')+
      H.panel('Completeness by product',DB.products.map(function(p){var s=score(p);
        return '<div style="margin-bottom:9px"><div class="kv" style="border:none;padding:2px 0"><span><b class="mono">'+esc(p.sku)+'</b> · '+esc(p.title)+'</span><b>'+s+'%</b></div>'+H.bar(s)+'</div>';}).join(''));
    },
    catalog:function(){var DB=db();
      return H.head('Products · Catalog','Catalog','SKU, pricing, images and completeness for every product.')+
      H.panel('Products <span class="badge">'+DB.products.length+'</span>',H.table([
        {label:'SKU',align:'l',k:'sku',cellcls:'mono'},{label:'Title',align:'l',k:'title'},{label:'MRP',fmt:function(r){return inr(r.mrp);},cellcls:'mono'},
        {label:'Price',fmt:function(r){return r.price?inr(r.price):'—';},cellcls:'mono'},{label:'Imgs',k:'images',cellcls:'mono'},
        {label:'Score',align:'l',fmt:function(r){var s=score(r);return H.tag(s+'%',s>=100?'grn':s>=60?'amb':'red');}}],DB.products));
    },
    readiness:function(){var DB=db();
      return H.head('Products · Readiness','Channel readiness','What each not-ready product is still missing before it can list.')+
      '<div class="two"><div>'+H.panel('Add product',H.form([
        {id:'p_sku',label:'SKU',ph:'e.g. SAR-NEW-09'},{id:'p_title',label:'Title',ph:'Product name'},
        {id:'p_mrp',label:'MRP ₹',type:'num',value:1999},{id:'p_price',label:'Price ₹',type:'num',value:1499},
        {id:'p_img',label:'Images',type:'num',value:3},{id:'p_fab',label:'Fabric',ph:'Silk / Cotton'}],'Add product','addProd','f2')+'<div id="res"></div>')+'</div>'+
      '<div>'+(DB.products.filter(function(p){return !ready(p);}).map(function(p){var miss=FIELDS.filter(function(f){var v=p[f];return f==='images'?!num(v):(v===''||v==null||v===0);});
        return H.panel(p.sku+' — '+score(p)+'%',H.tag('missing','red')+' '+miss.map(function(m){return '<span class="pill">'+m+'</span>';}).join(''));}).join('')||H.note('Every product is channel-ready ✓'))+'</div></div>';
    }
  },
  actions:{ addProd:function(){var DB=db();var p={sku:H.val('p_sku')||'SKU-'+(DB.seq.n=(DB.seq.n||0)+1),title:H.val('p_title')||'New product',desc:'',
      mrp:H.numv('p_mrp'),price:H.numv('p_price'),images:H.numv('p_img'),fabric:H.val('p_fab'),color:'',size:'',hsn:''};
    DB.products.push(p);K.save();
    var el=document.getElementById('res');if(el)el.innerHTML='<div class="cascade"><b>Added '+esc(p.sku)+'</b> — completeness '+score(p)+'%. Fill fabric/color/size/HSN to reach channel-ready.</div>';
    toast('Product added ✓');setTimeout(function(){K.render();},900);} },
  tests:function(t,DB){
    t('fully-filled product scores 100',score(DB.products[0])===100);
    t('product 0 is channel-ready',ready(DB.products[0])===true);
    t('product with empty fields is <100',score(DB.products[2])<100);
    t('avg completeness in 0..100',avg(DB)>=0&&avg(DB)<=100);}
};
if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Vanijo!=='undefined'&&Vanijo.app)Vanijo.app(SPEC);
})();
