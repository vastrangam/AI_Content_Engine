(function(){
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
function db(){return K.DB;}
var STAGES=['New','Qualified','Proposal','Won','Lost'];
function stageVal(DB,st){return r2((DB.leads||[]).filter(function(l){return l.stage===st;}).reduce(function(s,l){return s+num(l.value);},0));}
function openVal(DB){return r2((DB.leads||[]).filter(function(l){return l.stage!=='Won'&&l.stage!=='Lost';}).reduce(function(s,l){return s+num(l.value);},0));}
function wonVal(DB){return stageVal(DB,'Won');}
function nextStage(st){var i=STAGES.indexOf(st);return i>=0&&i<3?STAGES[i+1]:st;}
var SPEC={ id:'crm', name:'CRM', tagline:'Leads, pipeline & stages — see weighted value move from New to Won.',
  about:'A sales pipeline. Leads carry a value and a stage; advancing a lead moves it toward Won. Pipeline value, won value and win-rate are all computed from the lead set.',
  groups:[{label:'Sales',items:['dash','pipeline','leads']}],
  nav:[{v:'dash',label:'Dashboard',icon:'grid'},{v:'pipeline',label:'Pipeline',icon:'flow'},{v:'leads',label:'Leads',icon:'users'}],
  seed:function(DB){
    DB.leads=[
      {id:'L-01',name:'Priya Sharma',company:'Aarya Trendz',value:45000,stage:'Proposal',src:'Instagram'},
      {id:'L-02',name:'Ravi Menon',company:'Meera Boutique',value:28000,stage:'Qualified',src:'Referral'},
      {id:'L-03',name:'Anjali Rao',company:'Silk Route Exports',value:120000,stage:'New',src:'Website'},
      {id:'L-04',name:'Karan Shah',company:'Fabindia franchise',value:60000,stage:'Won',src:'Trade show'},
      {id:'L-05',name:'Neha Gupta',company:'Boutique Bliss',value:18000,stage:'Won',src:'Instagram'},
      {id:'L-06',name:'Amit Verma',company:'Cotton Junction',value:22000,stage:'Lost',src:'Cold call'}];
    DB.seq={n:6};
  },
  views:{
    dash:function(){var DB=db();var won=DB.leads.filter(function(l){return l.stage==='Won';}).length,lost=DB.leads.filter(function(l){return l.stage==='Lost';}).length;
      var wr=won+lost?Math.round(won/(won+lost)*100):0;
      return H.head('Command · Dashboard','CRM — live','Pipeline value, closed value and win-rate — computed from your leads.')+
      H.kpis([
        {l:'Open pipeline',v:money(openVal(DB)),d:'not yet closed',icon:'flow',tone:'blue'},
        {l:'Won value',v:money(wonVal(DB)),d:'closed-won',icon:'coin',tone:'green'},
        {l:'Leads',v:DB.leads.length,d:'total',icon:'users',tone:'teal'},
        {l:'Win rate',v:wr+'%',d:won+' won / '+lost+' lost',icon:'pct',tone:'peach'}],'')+
      H.panel('Value by stage',STAGES.map(function(st){var v=stageVal(DB,st);var max=Math.max.apply(null,STAGES.map(function(s){return stageVal(DB,s);}))||1;
        return '<div style="margin-bottom:9px"><div class="kv" style="border:none;padding:2px 0"><span>'+st+' <span class="pill">'+DB.leads.filter(function(l){return l.stage===st;}).length+'</span></span><b>'+money(v)+'</b></div>'+H.bar(v/max*100)+'</div>';}).join(''));
    },
    pipeline:function(){var DB=db();
      return H.head('Sales · Pipeline','Pipeline','Advance a lead to push it toward Won.')+
      STAGES.filter(function(s){return s!=='Lost';}).map(function(st){var ls=DB.leads.filter(function(l){return l.stage===st;});
        return H.panel(st+' <span class="badge">'+money(stageVal(DB,st))+'</span>',ls.length?H.table([
          {label:'Lead',align:'l',k:'name'},{label:'Company',align:'l',k:'company'},{label:'Value',fmt:function(r){return inr(r.value);},cellcls:'mono'},
          {label:'',align:'l',fmt:function(r){return st==='Won'?H.tag('won','grn'):'<button class="btn sm" data-act="advance" data-id="'+r.id+'">→ '+nextStage(st)+'</button>';}}],ls):'<div class="empty">No leads in this stage.</div>');
      }).join('')+'<div id="res"></div>';
    },
    leads:function(){var DB=db();
      return H.head('Sales · Leads','All leads','Source, value and current stage for every lead.')+
      '<div class="two"><div>'+H.panel('Add lead',H.form([
        {id:'l_name',label:'Contact',ph:'Person'},{id:'l_co',label:'Company',ph:'Business'},
        {id:'l_val',label:'Value ₹',type:'num',value:25000},{id:'l_src',label:'Source',type:'select',options:['Instagram','Referral','Website','Trade show','Cold call']}],'Add lead','addLead','f2')+'<div id="res"></div>')+'</div>'+
      '<div>'+H.panel('Leads <span class="badge">'+DB.leads.length+'</span>',H.table([
        {label:'Lead',align:'l',k:'name'},{label:'Company',align:'l',k:'company'},{label:'Value',fmt:function(r){return inr(r.value);},cellcls:'mono'},
        {label:'Stage',align:'l',fmt:function(r){return H.tag(r.stage,r.stage==='Won'?'grn':r.stage==='Lost'?'red':'blu');}}],DB.leads))+'</div></div>';
    }
  },
  actions:{
    addLead:function(){var DB=db();var id='L-'+String(10+(DB.seq.n=(DB.seq.n||0)+1)).slice(1);
      DB.leads.push({id:id,name:H.val('l_name')||'New contact',company:H.val('l_co')||'—',value:H.numv('l_val'),stage:'New',src:H.val('l_src')});K.save();
      var el=document.getElementById('res');if(el)el.innerHTML='<div class="cascade"><b>Added '+esc(id)+'</b> in New — pipeline now '+money(openVal(DB))+'.</div>';
      toast('Lead added ✓');setTimeout(function(){K.render();},700);},
    advance:function(b){var DB=db();var l=DB.leads.filter(function(x){return x.id===b.getAttribute('data-id');})[0];if(l)l.stage=nextStage(l.stage);K.save();
      toast('Advanced to '+(l?l.stage:'')+' ✓');setTimeout(function(){K.render();},400);}
  },
  tests:function(t,DB){
    t('open pipeline excludes Won/Lost',openVal(DB)===r2(DB.leads.filter(function(l){return l.stage!=='Won'&&l.stage!=='Lost';}).reduce(function(s,l){return s+l.value;},0)));
    t('won value = 78000',wonVal(DB)===60000+18000);
    var l=DB.leads.filter(function(x){return x.stage==='Proposal';})[0];l.stage=nextStage(l.stage);
    t('advancing Proposal reaches Won',l.stage==='Won');
    t('every lead has a valid stage',DB.leads.every(function(l){return STAGES.indexOf(l.stage)>=0;}));}
};
if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
})();
