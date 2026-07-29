/* Medhava Suite kernel — shared UI runtime + components + store + self-tests.
   An app is a spec: { id,name,company,fy, groups?, nav[], seed(DB), views{}, actions{}, tests(t,DB) }. */
(function(){
  var r2=function(n){return Math.round((Number(n)+Number.EPSILON)*100)/100;};
  var num=function(n){return (n==null||n===''||isNaN(n))?0:Number(n);};
  var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
  var money=function(n){n=r2(n);return (n<0?'-':'')+'₹'+Math.abs(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});};
  var inr=function(n){return Number(r2(n)).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});};
  var $=function(id){return document.getElementById(id);};

  var SPEC=null, state={view:null}, DB={}, KEY='';
  function toast(m){var t=$('toast');if(!t)return;t.textContent=m;t.className='toast show';clearTimeout(t._t);t._t=setTimeout(function(){t.className='toast';},2000);}
  function setStatus(s){var p=$('statusPill');if(p)p.textContent=s;}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(DB));setStatus('saved ✓');}catch(e){setStatus('session only');}}
  function clearDB(){Object.keys(DB).forEach(function(k){delete DB[k];});}

  var H={
    esc:esc, money:money, inr:inr, r2:r2, num:num, toast:toast, val:function(id){var e=$(id);return e?e.value:'';}, numv:function(id){return num(H.val(id));},
    head:function(crumb,h1,sub,actions){return '<div class="crumb">'+esc(crumb)+'</div><div class="h1row"><div><h1>'+esc(h1)+'</h1><div class="sub">'+esc(sub||'')+'</div></div><div>'+(actions||'')+'</div></div>';},
    note:function(t){return '<div class="note">'+t+'</div>';},
    kpis:function(arr,cls){return '<div class="kpis '+(cls||'')+'">'+arr.map(function(k){
      var chip=k.icon?'<div class="kchip c-'+(k.tone||'teal')+'"><svg class="i"><use href="#s-'+k.icon+'"/></svg></div>':'';
      return '<div class="kc"><div class="kchead"><div class="l">'+esc(k.l)+'</div>'+chip+'</div><div class="v '+(k.cls||'')+'">'+k.v+'</div><div class="l" style="margin-top:4px;text-transform:none">'+esc(k.d||'')+'</div></div>';}).join('')+'</div>';},
    /* title is trusted markup (may contain badges/tags); callers must esc() any dynamic data placed in it. */
    panel:function(title,body,actions){return '<div class="panel"><h3>'+title+(actions?'<span>'+actions+'</span>':'')+'</h3>'+body+'</div>';},
    table:function(cols,rows){
      var th=cols.map(function(c){return '<th class="'+(c.align||'')+'">'+esc(c.label||'')+'</th>';}).join('');
      var body=rows.length?rows.map(function(row){return '<tr>'+cols.map(function(c){
        var v=c.fmt?c.fmt(row):row[c.k]; var cls=(c.align||'')+(c.cellcls?' '+(typeof c.cellcls==='function'?c.cellcls(row):c.cellcls):'');
        return '<td class="'+cls+'">'+(v==null?'':v)+'</td>';}).join('')+'</tr>';}).join('')
        :'<tr><td class="l" colspan="'+cols.length+'"><div class="empty">No rows yet.</div></td></tr>';
      return '<table><thead><tr>'+th+'</tr></thead><tbody>'+body+'</tbody></table>';
    },
    tag:function(text,tone){return '<span class="tag t-'+(tone||'gray')+'">'+esc(text)+'</span>';},
    bar:function(pct){pct=Math.max(0,Math.min(100,pct));return '<div class="bar"><i style="width:'+pct+'%"></i></div>';},
    fields:function(fields){return fields.map(function(f){
      if(f.type==='select'){var opts=(f.options||[]).map(function(o){var v=typeof o==='object'?o.v:o,l=typeof o==='object'?o.label:o;return '<option value="'+esc(v)+'"'+(f.value==v?' selected':'')+'>'+esc(l)+'</option>';}).join('');
        return '<div class="fld'+(f.wide?' wide':'')+(f.full?' full':'')+'"><label>'+esc(f.label)+'</label><select id="'+f.id+'">'+opts+'</select></div>';}
      if(f.type==='textarea') return '<div class="fld full"><label>'+esc(f.label)+'</label><textarea id="'+f.id+'">'+esc(f.value||'')+'</textarea></div>';
      return '<div class="fld'+(f.wide?' wide':'')+(f.full?' full':'')+'"><label>'+esc(f.label)+'</label><input id="'+f.id+'" type="'+(f.type==='num'?'number':(f.type||'text'))+'" value="'+esc(f.value==null?'':f.value)+'" '+(f.type==='num'?'step="0.01"':'')+' placeholder="'+esc(f.ph||'')+'"></div>';
    }).join('');},
    form:function(fields,submitLabel,act,cls){return '<div class="form '+(cls||'f2')+'">'+H.fields(fields)+'<div class="fld full" style="align-items:flex-end"><button class="btn p" data-act="'+act+'">'+esc(submitLabel)+'</button></div></div>';},
    go:function(v){go(v);}, save:function(){save();}, render:function(){render();}
  };

  function buildShell(){
    var groups=SPEC.groups||[{label:SPEC.name,items:SPEC.nav.map(function(n){return n.v;})}];
    var navMap={}; SPEC.nav.forEach(function(n){navMap[n.v]=n;});
    var nav=groups.map(function(g){return '<div class="gg">'+esc(g.label)+'</div>'+g.items.map(function(v){var n=navMap[v];return n?'<a data-v="'+v+'"><svg class="i"><use href="#s-'+(n.icon||'grid')+'"/></svg> '+esc(n.label)+'</a>':'';}).join('');}).join('');
    $('root').innerHTML='<div class="app" id="appRoot"><div class="top">'+
      '<button class="hamb" id="hamb"><svg class="i" style="width:22px;height:22px;stroke-width:2"><use href="#s-menu"/></svg></button>'+
      '<div class="logo"><span class="sm"><svg width="18" height="18" viewBox="0 0 40 40"><path d="M8 30V11l12 12 12-12v19" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="9" r="2.6" fill="#fff"/></svg></span> <b>Medhava</b> <span class="ap">'+esc(SPEC.name)+'</span></div>'+
      '<div class="tpill">'+esc(SPEC.company||'Vastrangam')+'</div><div class="tpill">'+esc(SPEC.fy||'FY 2026-27')+'</div>'+
      '<span class="sp"></span><div class="tpill" id="statusPill">saved ✓</div><div class="tavatar">P</div></div>'+
      '<nav class="side" id="nav">'+nav+'</nav><main class="main" id="main"></main><div class="navback" id="navback"></div></div>';
    var root=$('appRoot');
    $('nav').addEventListener('click',function(e){var a=e.target.closest('a[data-v]');if(a)go(a.getAttribute('data-v'));});
    $('hamb').onclick=function(){root.classList.toggle('navopen');};
    $('navback').onclick=function(){root.classList.remove('navopen');};
    $('main').addEventListener('click',function(e){
      var g=e.target.closest('[data-go]'); if(g){go(g.getAttribute('data-go'));return;}
      var b=e.target.closest('[data-act]'); if(b){var fn=SPEC.actions[b.getAttribute('data-act')]; if(fn)fn(b); }
    });
  }
  function go(v){ if(v!=='backup'&&!(SPEC.views&&SPEC.views[v]))v=SPEC.nav[0].v; state.view=v; var r=$('appRoot'); if(r)r.classList.remove('navopen');
    [].forEach.call(document.querySelectorAll('#nav a[data-v]'),function(a){a.className=a.getAttribute('data-v')===v?'on':'';});
    render(); window.scrollTo(0,0);
  }
  function render(){ var v=state.view; $('main').innerHTML = v==='backup'?backupView():(SPEC.views[v]||SPEC.views[SPEC.nav[0].v])(); }

  function backupView(){
    var t=window.__selftest||{pass:0,fail:0,log:[]};
    var rows=t.log.map(function(l){return {s:l.ok?'<span class="tag t-grn">pass</span>':'<span class="tag t-red">fail</span>',n:esc(l.name)};});
    return H.head('System · Backup','Backup & Health','Your data lives in this browser. Export a JSON backup any time.')+
      H.panel('Data','<div style="display:flex;gap:9px;flex-wrap:wrap">'+
        '<button class="btn p" data-act="_export"><svg class="i"><use href="#s-save"/></svg> Export JSON</button>'+
        '<button class="btn" data-act="_import"><svg class="i"><use href="#s-sync"/></svg> Import JSON</button>'+
        '<button class="btn" data-act="_reseed">Reload demo data</button>'+
        '<button class="btn d" data-act="_wipe">Wipe all</button></div>')+
      H.panel('Self-tests <span class="badge">'+t.pass+'/'+(t.pass+t.fail)+' pass</span>',
        rows.length?H.table([{label:'',align:'l',k:'s'},{label:'Check',align:'l',k:'n'}],rows):'<div class="empty">No self-tests defined.</div>');
  }
  function download(name,text){var b=new Blob([text],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();}
  function pickFile(cb){var inp=$('fileIn');inp.value='';inp.onchange=function(){var f=inp.files[0];if(!f)return;var rd=new FileReader();rd.onload=function(){cb(rd.result);};rd.readAsText(f);};inp.click();}
  var builtins={
    _export:function(){download((SPEC.id||'medhava')+'-backup.json',JSON.stringify(DB,null,2));toast('Backup exported');},
    _import:function(){pickFile(function(txt){try{var o=JSON.parse(txt);clearDB();Object.assign(DB,o);save();toast('Imported ✓');go(SPEC.nav[0].v);}catch(e){toast('Bad file');}});},
    _reseed:function(){if(confirm('Reload demo data? This replaces current data.')){clearDB();SPEC.seed(DB);save();toast('Demo reloaded');go(SPEC.nav[0].v);}},
    _wipe:function(){if(confirm('Wipe ALL data?')){clearDB();save();toast('Wiped');go(SPEC.nav[0].v);}}
  };
  function runTests(){var log=[],pass=0,fail=0;function t(name,cond){var ok=!!cond;log.push({name:name,ok:ok});ok?pass++:fail++;}
    /* tests run against a deep COPY — a self-test must never mutate live data */
    var probe; try{probe=JSON.parse(JSON.stringify(DB));}catch(e){probe=DB;}
    try{if(SPEC.tests)SPEC.tests(t,probe);}catch(e){log.push({name:'tests threw: '+e.message,ok:false});fail++;}
    window.__selftest={pass:pass,fail:fail,log:log};}
  function boot(){
    KEY='medhava_'+(SPEC.id||'app')+'_v1'; var raw=null; try{raw=localStorage.getItem(KEY);}catch(e){}
    if(raw){try{var o=JSON.parse(raw);Object.assign(DB,o);}catch(e){}}
    if(!Object.keys(DB).length) SPEC.seed(DB);
    if(!SPEC.nav.some(function(n){return n.v==='backup';})) SPEC.nav.push({v:'backup',label:'Backup & Health',icon:'save'});
    if(SPEC.groups&&!SPEC.groups.some(function(g){return g.items.indexOf('backup')>=0;})) SPEC.groups.push({label:'System',items:['backup']});
    Medhava.DB=DB; runTests(); buildShell(); go(SPEC.nav[0].v); save();
  }
  window.Medhava={ H:H, esc:esc, money:money, inr:inr, r2:r2, num:num, toast:toast, DB:DB, save:save, go:go, render:render,
    app:function(spec){ SPEC=spec; spec.actions=Object.assign({},builtins,spec.actions||{}); Medhava.SPEC=spec;
      if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot(); } };
})();
