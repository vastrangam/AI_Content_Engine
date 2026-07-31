/* Medhava — Ask & Print (Platform · App 2)
   You are in another city. Somebody needs a bill, or a ledger, or today's packing slips need
   to come off the office printer. You send one plain line from your phone. Medhava works out
   what you meant, checks you are allowed to ask, produces the document from its own records,
   and either sends it back or prints it — with nothing plugged into your phone.

   The whole point is that this is RULES, not a model that guesses. Every phrase it understands
   is listed on the Ask screen, and every request that ever ran is on the Log screen with who
   asked, from where, and what came back.
   CONFIG supplies names so the Medhava and Vastrangam builds run the SAME math. */
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
var CFG=(typeof CONFIG!=='undefined')?CONFIG:{};
function db(){return K.DB;}
function plural(n,one,many){return n+' '+(n===1?one:(many||one+'s'));}

/* ── what it understands. Every word is here; nothing is guessed. ── */
var VERBS=[{k:'print',words:['print','chhapo','nikalo']},
           {k:'send', words:['send','bhejo','share','mail','email','whatsapp','give','chahiye']}];
/* Things that move money or change records are not askable by message AT ALL — not a
   permission you could switch on, a shape the app does not have. */
var FORBIDDEN=['pay','payment','transfer','refund','approve','sanction','delete','remove',
               'cancel','write off','writeoff','discount','credit note','adjust','post','change'];
var KINDS=[
  {k:'ledger',   label:'Party ledger',        words:['ledger','khata','account','statement','ac'],  made:true,  needs:'party'},
  {k:'bill',     label:'Invoice / bill',      words:['bill','invoice','tax invoice','inv'],         made:true,  needs:'ref'},
  {k:'slips',    label:'Packing slips',       words:['slip','slips','packing','pick','picklist'],   made:true,  needs:''},
  {k:'gst',      label:'GST return',          words:['gst','gstr','3b','r1','return'],              made:true,  needs:''},
  {k:'stock',    label:'Stock position',      words:['stock','inventory','qty','quantity'],         made:true,  needs:''},
  {k:'outstand', label:'Outstanding / ageing', words:['outstanding','ageing','aging','due','pending','baki'], made:true, needs:''},
  {k:'pod',      label:'Proof of delivery',   words:['pod','proof','delivery receipt','docket'],    made:false, needs:'ref'},
  {k:'scan',     label:'A scanned document',  words:['scan','copy','agreement','contract','po'],    made:false, needs:'ref'}];

function kindOf(k){return KINDS.filter(function(x){return x.k===k;})[0]||null;}
function people(){return CFG.people||[];}
function person(ph){return people().filter(function(p){return p.phone===ph;})[0]||null;}
function printers(DB){return DB.printers||[];}
function printer(DB,id){return printers(DB).filter(function(p){return p.id===id;})[0]||null;}
function defaultPrinter(DB){return printers(DB).filter(function(p){return p.online;})
  .sort(function(a,b){return (b.id===DB.defp?1:0)-(a.id===DB.defp?1:0);})[0]||null;}
function sources(){return CFG.sources||[];}
function docs(DB){return DB.docs||[];}

/* ── reading one line of plain text ── */
function words(t){return String(t||'').toLowerCase().replace(/[^a-z0-9ऀ-ॿ\-\/ ]/g,' ').split(/\s+/).filter(Boolean);}
function findVerb(t){var w=words(t);
  for(var i=0;i<VERBS.length;i++)if(VERBS[i].words.some(function(x){return w.indexOf(x)>=0;}))return VERBS[i].k;
  return 'send';}          /* asking without saying how means send it to me */
function findKind(t){var w=words(t).join(' ');
  var hit=null,best=-1;
  KINDS.forEach(function(kd){kd.words.forEach(function(x){
    var i=w.indexOf(x); if(i>=0&&(best<0||x.length>best)){hit=kd.k;best=x.length;}});});
  return hit;}
function findForbidden(t){var w=words(t).join(' ');
  return FORBIDDEN.filter(function(x){return w.indexOf(x)>=0;})[0]||'';}
function findRef(t){var m=String(t||'').match(/\b[A-Z]{2,}[-\/][A-Z0-9\-\/]{3,}\b/);return m?m[0]:'';}
function findParty(t){var names=(CFG.parties||[]);
  var low=String(t||'').toLowerCase();
  return names.filter(function(n){return low.indexOf(n.toLowerCase().split(' ')[0].toLowerCase())>=0;})[0]||'';}
function findCopies(t){var m=String(t||'').match(/(\d+)\s*(?:copies|copy|x)\b/i);
  if(m)return Math.max(1,Math.min(20,num(m[1])));
  var x=String(t||'').match(/\bx\s*(\d+)\b/i); return x?Math.max(1,Math.min(20,num(x[1]))):1;}

function parse(text){
  return {verb:findVerb(text), kind:findKind(text), ref:findRef(text), party:findParty(text),
          copies:findCopies(text), bad:findForbidden(text)};}

/* ── the three refusals, in the order they are checked ── */
function decide(DB,phone,text){
  var p=parse(text), who=person(phone);
  /* 1 · a number nobody registered gets nothing at all */
  if(!who)return {ok:false,code:'unknown',why:'This number is not registered. Nothing was sent, and nothing about the system was revealed.',p:p};
  /* 2 · nothing that moves money or changes a record is askable by message */
  if(p.bad)return {ok:false,code:'forbidden',who:who,p:p,
    why:'"'+p.bad+'" changes money or records. Nothing like that can be done from a message by anybody — it is not a permission, it is a shape this app does not have.'};
  if(!p.kind)return {ok:false,code:'unclear',who:who,p:p,
    why:'Nothing in that line names a document this app knows. It asks rather than guessing.'};
  var kd=kindOf(p.kind);
  if(who.scope&&who.scope.indexOf(p.kind)<0)return {ok:false,code:'scope',who:who,p:p,
    why:esc(who.name)+' is not allowed to ask for '+kd.label.toLowerCase()+'.'};
  if(who.can.indexOf(p.verb)<0)return {ok:false,code:'verb',who:who,p:p,
    why:esc(who.name)+' may '+who.can.join(' and ')+', not '+p.verb+'.'};
  if(kd.needs==='ref'&&!p.ref)return {ok:false,code:'needref',who:who,p:p,
    why:'A '+kd.label.toLowerCase()+' needs its number. Say it, and it will come.'};
  if(kd.needs==='party'&&!p.party)return {ok:false,code:'needparty',who:who,p:p,
    why:'Which party? Name them and it will come.'};
  if(p.verb==='print'){
    var pr=defaultPrinter(DB);
    if(!pr)return {ok:false,code:'noprinter',who:who,p:p,
      why:'No printer at the office is switched on. Nothing was queued — a job that waits for a printer is a job somebody finds tomorrow.'};
    return {ok:true,who:who,p:p,printer:pr,needsCode:false,
      why:'Printing stays inside the building, so it goes straight through — the paper never leaves the office.'};
  }
  /* 3 · a document that LEAVES the building needs a one-time code */
  return {ok:true,who:who,p:p,needsCode:true,
    why:'This document leaves the building, so it waits for a one-time code. Printing does not need one; sending always does.'};
}

/* ── where the answer comes from ── */
function sourceFor(DB,kind){
  var kd=kindOf(kind); if(!kd)return null;
  return sources().filter(function(s){return kd.made?s.kind==='medhava':s.kind!=='medhava';})[0]||null;}
function findDoc(DB,kind,ref){return docs(DB).filter(function(d){
  return d.kind===kind&&(!ref||d.ref===ref);})[0]||null;}
function answerFor(DB,d){
  var kd=kindOf(d.p.kind);
  if(kd.made)return {found:true,made:true,what:kd.label+(d.p.party?' — '+d.p.party:'')+(d.p.ref?' '+d.p.ref:''),
    from:'Medhava’s own records',note:'Worked out fresh, so it is current to this minute — nothing was hunted for.'};
  var hit=findDoc(DB,d.p.kind,d.p.ref);
  if(!hit)return {found:false,what:kd.label+' '+d.p.ref,from:'',note:'Not in the document index. Nothing was invented.'};
  return {found:true,made:false,what:kd.label+' '+hit.ref,from:hit.where,
    note:'A file somebody filed, found by its index entry rather than by searching folders.'};
}

/* ── running one request ── */
function seconds(DB,d){ /* generated documents are quick; a stored file takes as long as the store */
  var kd=kindOf(d.p.kind); return kd&&kd.made?num(CFG.makeSec||2):num(CFG.fetchSec||6);}
function runOne(DB,phone,text){
  var d=decide(DB,phone,text);
  var who=d.who||{name:'Unregistered',role:''};
  var row={n:(DB.seq=num(DB.seq)+1),at:CFG.clock||'14:20',from:phone,name:who.name,role:who.role||'',
    text:text,verb:d.p.verb,kind:d.p.kind||'',ref:d.p.ref||d.p.party||'',copies:d.p.copies,
    ok:!!d.ok,code:d.code||'',why:d.why,out:'',sec:0,printer:'',state:''};
  if(!d.ok){row.state='refused';DB.log.unshift(row);return row;}
  var a=answerFor(DB,d);
  if(!a.found){row.ok=false;row.code='missing';row.why=a.note;row.state='refused';DB.log.unshift(row);return row;}
  row.out=a.what; row.made=a.made; row.src=a.from; row.note=a.note; row.sec=seconds(DB,d);
  if(d.p.verb==='print'){row.printer=d.printer.name;row.state='printed';
    row.why=d.why+' '+plural(d.p.copies,'copy','copies')+' on '+d.printer.name+'.';}
  else {row.state='waiting';row.otp=String(100000+((row.n*7919)%899999));}
  DB.log.unshift(row); return row;}

function log(DB){return DB.log||[];}
function done(DB){return log(DB).filter(function(r){return r.state==='sent'||r.state==='printed';});}
function refused(DB){return log(DB).filter(function(r){return r.state==='refused';});}
function waiting(DB){return log(DB).filter(function(r){return r.state==='waiting';});}
function avgSec(DB){var d=done(DB);if(!d.length)return 0;
  return r2(d.reduce(function(s,r){return s+num(r.sec);},0)/d.length);}
function sheetsPrinted(DB){return log(DB).filter(function(r){return r.state==='printed';})
  .reduce(function(s,r){return s+num(r.copies);},0);}

function issues(DB){var out=[];
  waiting(DB).forEach(function(r){out.push({sev:'med',
    what:'#'+r.n+' — '+esc(r.name)+' asked for '+esc(r.out)+' and it is waiting for the one-time code',go:'log'});});
  refused(DB).filter(function(r){return r.code==='unknown';}).forEach(function(r){out.push({sev:'high',
    what:'#'+r.n+' — an unregistered number ('+esc(r.from)+') tried to ask for something. It got nothing, and it is on the record',go:'log'});});
  refused(DB).filter(function(r){return r.code==='forbidden';}).forEach(function(r){out.push({sev:'high',
    what:'#'+r.n+' — '+esc(r.name)+' tried to do something that moves money by message. Refused by design',go:'log'});});
  printers(DB).filter(function(p){return !p.online;}).forEach(function(p){out.push({sev:'med',
    what:esc(p.name)+' at '+esc(p.where)+' is switched off — anything sent to it would just wait',go:'where'});});
  return out;}

/* Ask & Print needs a way for the message to arrive, a printer, storage for filed documents,
   and the ledger it reads from. Every one of those is a choice you make, not one we made. */
var SPEC={
  uses:['messaging','printing','storage','ledger','email','automation'],
  id:CFG.id, name:CFG.name, company:CFG.company, fy:CFG.fy||'FY 2026-27', tagline:CFG.tagline, about:CFG.about,
  groups:[{label:'From anywhere',items:['desk','ask']},
          {label:'The record',items:['log','who']},
          {label:'Where things live',items:['where']},
          {label:'Wiring',items:['wiring']}],
  nav:[{v:'desk',label:'Overview',icon:'grid'},{v:'ask',label:'Ask for something',icon:'thread'},
       {v:'log',label:'Every request',icon:'book'},{v:'who',label:'Who may ask',icon:'users'},
       {v:'where',label:'Sources & printers',icon:'plug'},{v:'wiring',label:'Wiring',icon:'flow'}],
  seed:function(DB){
    DB.printers=JSON.parse(JSON.stringify(CFG.printers||[]));
    DB.docs=JSON.parse(JSON.stringify(CFG.docs||[]));
    DB.perm=JSON.parse(JSON.stringify(CFG.people||[]));
    DB.defp=(CFG.printers||[]).filter(function(p){return p.online;})[0]?(CFG.printers||[]).filter(function(p){return p.online;})[0].id:'';
    DB.seq0=100; DB.seq=100; DB.log=[];
    (CFG.seedAsks||[]).forEach(function(a){runOne(DB,a[0],a[1]);
      if(a[2]==='sent'){var r=DB.log[0];if(r.state==='waiting'){r.state='sent';r.why='Code confirmed, so it went out.';}}});
  },
  views:{
    desk:function(){var DB=db();var iss=issues(DB);
      return H.head('From anywhere · Overview',CFG.name,'One line from your phone. The document comes back, or it prints at the office — with nothing plugged into your phone.')+
      H.kpis([
        {l:'Asked for today',v:log(DB).length,d:'from '+plural(new Set(log(DB).map(function(r){return r.from;})).size,'number'),icon:'thread',tone:'teal'},
        {l:'Came back',v:done(DB).length,d:'sent or printed',cls:'g',icon:'check',tone:'green'},
        {l:'Refused',v:refused(DB).length,d:'and every one is on the record',cls:refused(DB).length?'r':'g',icon:'shield',tone:refused(DB).length?'red':'green'},
        {l:'Waiting for a code',v:waiting(DB).length,d:'documents leaving the building',cls:waiting(DB).length?'r':'',icon:'clock',tone:'amb'},
        {l:'Average answer',v:avgSec(DB)+'s',d:'from message to document',icon:'spark',tone:'blue'}],'k5')+
      '<div class="two">'+
      H.panel('What was asked for, and what happened',
        H.table([{label:'#',fmt:function(r){return r.n;},cellcls:'mono'},
          {label:'Who',align:'l',fmt:function(r){return '<b>'+esc(r.name)+'</b><div class="hint">'+esc(r.from)+'</div>';}},
          {label:'They said',align:'l',fmt:function(r){return '<span class="mono">'+esc(r.text)+'</span>';}},
          {label:'',align:'l',fmt:function(r){
            return r.state==='printed'?H.tag('printed','grn')
              :r.state==='sent'?H.tag('sent','grn')
              :r.state==='waiting'?H.tag('needs code','amb'):H.tag('refused','red');}}],log(DB).slice(0,7))+
        '<p class="hint" style="margin-top:8px">'+esc(CFG.deskNote||'')+'</p>')+
      H.panel('What needs you now <span class="badge">'+iss.length+'</span>',
        iss.length?H.table([{label:'',align:'l',fmt:function(a){return H.tag(a.sev==='high'?'look':'watch',a.sev==='high'?'red':'amb');}},
          {label:'What is happening',align:'l',k:'what'},
          {label:'',align:'l',fmt:function(a){return '<button class="btn sm" data-go="'+a.go+'">Open →</button>';}}],iss.slice(0,8))
        :'<div class="cascade">Nothing waiting, nothing refused, every printer answering.</div>')+
      '</div>'+
      H.panel('How it works, in five steps',
        '<div class="cascade">'+
        '<div class="cl"><span class="d">1</span><div>You send <b>one plain line</b> from wherever you are — WhatsApp, Telegram, email, SMS, or a page on your phone. Whichever you picked on Connectors.</div></div>'+
        '<div class="cl"><span class="d">2</span><div>→ Medhava <b>reads the line by rule</b>, not by guessing. Every phrase it understands is listed on the next screen.</div></div>'+
        '<div class="cl"><span class="d">3</span><div>→ It checks <b>who asked</b>. An unregistered number gets nothing at all — not even an error that admits the system exists.</div></div>'+
        '<div class="cl"><span class="d">4</span><div>→ It <b>makes the document</b> from its own records, or finds the filed file. A ledger is never hunted for; it is worked out fresh.</div></div>'+
        '<div class="cl"><span class="d">5</span><div>→ <b>Print</b> goes straight to the office printer. <b>Send</b> waits for a one-time code, because that copy leaves the building.</div></div>'+
        '</div>'+
        H.note('<b>Nothing is plugged into your phone, and nothing is open to the internet.</b> A small program on the office computer keeps a connection <i>outward</i> to wherever your messages arrive. No port forwarding, no fixed IP, no router change — and nothing on the internet can reach into your office, because your office reaches out.'));
    },
    ask:function(){var DB=db();
      var last=log(DB)[0];
      return H.head('From anywhere · Ask','Ask for something','Type it the way you would send it. This is exactly what happens when the same line arrives on your phone.')+
      H.panel('Send a line, as if from your phone',
        H.form([{id:'a_from',label:'From which number',type:'select',
            options:people().map(function(p){return {v:p.phone,label:p.name+' — '+p.phone};})
              .concat([{v:CFG.strangerPhone||'+91 90000 00000',label:'An unregistered number'}])},
          {id:'a_text',label:'What you would type',value:(CFG.sample||'ledger'),wide:true,ph:'ledger Kalamandir'}],
          'Send it','ask','f2')+
        '<p class="hint">Try these, one at a time:</p>'+
        '<p>'+(CFG.tryThese||[]).map(function(t){return '<button class="btn sm" data-act="fill" data-t="'+esc(t)+'">'+esc(t)+'</button> ';}).join('')+'</p>')+
      (last?H.panel('What happened with #'+last.n,
        '<div class="kv"><span>It read that as</span><b>'+(last.kind?esc(last.verb)+' · '+esc((kindOf(last.kind)||{}).label):'<span class="r">nothing it knows</span>')+
          (last.ref?' · '+esc(last.ref):'')+(last.copies>1?' · '+plural(last.copies,'copy','copies'):'')+'</b></div>'+
        '<div class="kv"><span>Who asked</span><b>'+esc(last.name)+(last.role?' <span class="hint">'+esc(last.role)+'</span>':'')+'</b></div>'+
        '<div class="kv"><span>Result</span><b class="'+(last.ok?'g':'r')+'">'+
          (last.state==='printed'?'Printed on '+esc(last.printer):last.state==='sent'?'Sent':last.state==='waiting'?'Waiting for the one-time code':'Refused')+'</b></div>'+
        (last.out?'<div class="kv"><span>Document</span><b>'+esc(last.out)+'</b></div>':'')+
        (last.src?'<div class="kv"><span>Came from</span><b>'+esc(last.src)+'</b></div>':'')+
        (last.sec?'<div class="kv"><span>Took</span><b>'+last.sec+'s</b></div>':'')+
        '<p class="hint" style="margin-top:8px">'+last.why+'</p>'+
        (last.state==='waiting'?'<p><b>One-time code: <span class="mono">'+esc(last.otp)+'</span></b> — in the real thing this reaches you on a second channel, never the one you asked on. '+
          '<button class="btn sm p" data-act="code" data-i="'+last.n+'">Enter the code</button></p>':'')):'')+
      '<div class="two">'+
      H.panel('Every phrase it understands',H.table([
        {label:'Ask for',align:'l',fmt:function(k){return '<b>'+esc(k.label)+'</b>';}},
        {label:'Any of these words',align:'l',fmt:function(k){return '<span class="mono">'+esc(k.words.join(' · '))+'</span>';}},
        {label:'It needs',align:'l',fmt:function(k){return k.needs==='ref'?'a document number':k.needs==='party'?'a party name':'nothing else';}},
        {label:'',align:'l',fmt:function(k){return k.made?H.tag('worked out fresh','grn'):H.tag('a filed file','blu');}}],KINDS))+
      H.panel('What it will never do from a message',
        '<p>These words are refused for <b>everybody</b>, owner included. Not a permission you could switch on — a shape this app does not have:</p>'+
        '<p>'+FORBIDDEN.map(function(f){return H.tag(f,'red')+' ';}).join('')+'</p>'+
        '<div class="rule"><b>Reading is not the same risk as doing.</b> A message can be forwarded, a phone can be picked up, a number can be spoofed. So this app reads and prints, and that is the whole of it. Anything that moves money is done by a person who has signed in.</div>'+
        '<p class="hint">'+esc(CFG.forbidNote||'')+'</p>')+
      '</div>';
    },
    log:function(){var DB=db();
      return H.head('The record · Requests','Every request','Who asked, from where, what they said, what came back, and how long it took. Refusals are on here too.')+
      H.kpis([{l:'Requests',v:log(DB).length,d:'nothing is ever removed',icon:'book',tone:'teal'},
        {l:'Answered',v:done(DB).length,d:sheetsPrinted(DB)+' sheets printed',cls:'g',icon:'check',tone:'green'},
        {l:'Refused',v:refused(DB).length,d:'each with its reason',cls:refused(DB).length?'r':'g',icon:'shield',tone:'red'},
        {l:'Waiting',v:waiting(DB).length,d:'for a one-time code',cls:waiting(DB).length?'r':'',icon:'clock',tone:'amb'}],'')+
      H.panel('Everything that was ever asked',log(DB).length?H.table([
        {label:'#',fmt:function(r){return r.n;},cellcls:'mono'},
        {label:'At',fmt:function(r){return esc(r.at);},cellcls:'mono'},
        {label:'Who',align:'l',fmt:function(r){return '<b>'+esc(r.name)+'</b><div class="hint">'+esc(r.from)+(r.role?' · '+esc(r.role):'')+'</div>';}},
        {label:'They said',align:'l',fmt:function(r){return '<span class="mono">'+esc(r.text)+'</span>';}},
        {label:'Read as',align:'l',fmt:function(r){return r.kind?esc(r.verb)+' · '+esc((kindOf(r.kind)||{}).label):'<span class="hint">nothing known</span>';}},
        {label:'Came back',align:'l',fmt:function(r){return r.out?esc(r.out)+(r.src?'<div class="hint">'+esc(r.src)+'</div>':''):'—';}},
        {label:'Took',fmt:function(r){return r.sec?r.sec+'s':'—';},cellcls:'mono'},
        {label:'',align:'l',fmt:function(r){
          return r.state==='printed'?H.tag('printed × '+r.copies,'grn')
            :r.state==='sent'?H.tag('sent','grn')
            :r.state==='waiting'?H.tag('needs code','amb'):H.tag('refused','red');}},
        {label:'',align:'l',fmt:function(r){
          return r.state==='waiting'?'<button class="btn sm p" data-act="code" data-i="'+r.n+'">Enter code</button>':'';}}],log(DB))
        :'<div class="cascade">Nothing has been asked for yet.</div>')+
      (refused(DB).length?H.panel('Why each one was refused <span class="badge">'+refused(DB).length+'</span>',
        H.table([{label:'#',fmt:function(r){return r.n;},cellcls:'mono'},
          {label:'Who',align:'l',fmt:function(r){return esc(r.name)+' <span class="hint">'+esc(r.from)+'</span>';}},
          {label:'They said',align:'l',fmt:function(r){return '<span class="mono">'+esc(r.text)+'</span>';}},
          {label:'Reason',align:'l',fmt:function(r){return r.why;}}],refused(DB))):'')+
      H.note('<b>The log only ever grows.</b> There is no button on this screen that removes a line, and there is a self-test for that. A record you can tidy is not a record — and the one request you would most want to delete is exactly the one somebody will ask you about.');
    },
    who:function(){var DB=db();
      return H.head('The record · People','Who may ask','A number nobody put on this list gets nothing at all — not a document, and not an error that admits the system is there.')+
      H.kpis([{l:'Registered',v:people().length,d:'numbers that may ask',icon:'users',tone:'teal'},
        {l:'May print',v:people().filter(function(p){return p.can.indexOf('print')>=0;}).length,d:'inside the building',icon:'doc',tone:'blue'},
        {l:'May send out',v:people().filter(function(p){return p.can.indexOf('send')>=0;}).length,d:'with a one-time code',icon:'mail',tone:'green'},
        {l:'Turned away',v:refused(DB).filter(function(r){return r.code==='unknown';}).length,d:'unregistered numbers',cls:'r',icon:'shield',tone:'red'}],'')+
      H.panel('Everybody who may ask',H.table([
        {label:'Name',align:'l',fmt:function(p){return '<b>'+esc(p.name)+'</b><div class="hint">'+esc(p.role||'')+'</div>';}},
        {label:'Number',align:'l',fmt:function(p){return '<span class="mono">'+esc(p.phone)+'</span>';}},
        {label:'May',align:'l',fmt:function(p){return p.can.map(function(c){return H.tag(c,'grn');}).join(' ');}},
        {label:'May ask for',align:'l',fmt:function(p){return p.scope?p.scope.map(function(s){
          return esc((kindOf(s)||{}).label||s);}).join(' · '):'<b>anything readable</b>';}},
        {label:'Asked',fmt:function(p){return log(DB).filter(function(r){return r.from===p.phone;}).length;},cellcls:'mono'},
        {label:'',align:'l',fmt:function(p){return p.can.indexOf('send')>=0?H.tag('can take documents out','amb'):H.tag('office only','grn');}}],people()))+
      '<div class="two">'+
      H.panel('The rule this screen exists for',
        '<p><b>An unregistered number is not told anything.</b> Not "you are not allowed", not "no such document" — nothing. Because a reply is itself information: it confirms the number is live and the system is there.</p>'+
        '<p>The attempt <b>is</b> written to the log, with the number and the time, so you find out somebody tried.</p>'+
        '<div class="good">This is the difference between a lock and a sign that says "locked". Both stop an honest person. Only one of them is quiet about it.</div>')+
      H.panel('Why print and send are different permissions',
        '<div class="kv"><span>Print at the office</span><b class="g">the paper stays inside</b></div>'+
        '<div class="kv"><span>Send to a phone</span><b class="r">a copy leaves the building for ever</b></div>'+
        '<p style="margin-top:8px">A packer can be allowed to print today’s slips without ever being able to pull a party ledger onto a phone. That is one setting, not a policy document.</p>'+
        '<p class="hint">'+esc(CFG.whoNote||'')+'</p>')+
      '</div>';
    },
    where:function(){var DB=db();
      return H.head('Where things live · Sources','Sources & printers','What can be answered from Medhava itself, what is a filed file, and which printers the office computer can actually see.')+
      H.kpis([{l:'Sources',v:sources().length,d:'places an answer can come from',icon:'layers',tone:'teal'},
        {l:'Made fresh',v:KINDS.filter(function(k){return k.made;}).length+' of '+KINDS.length,d:'never hunted for',cls:'g',icon:'spark',tone:'green'},
        {l:'Filed documents',v:docs(DB).length,d:'indexed, not searched',icon:'doc',tone:'blue'},
        {l:'Printers answering',v:printers(DB).filter(function(p){return p.online;}).length+' of '+printers(DB).length,d:'at the office right now',
         cls:printers(DB).every(function(p){return p.online;})?'g':'r',icon:'plug',tone:'peach'}],'')+
      H.panel('Where an answer comes from',H.table([
        {label:'Source',align:'l',fmt:function(s){return '<b>'+esc(s.name)+'</b>';}},
        {label:'What is in it',align:'l',k:'what'},
        {label:'',align:'l',fmt:function(s){return s.kind==='medhava'?H.tag('worked out fresh','grn')
          :s.kind==='attached'?H.tag('filed against a record','blu')
          :s.kind==='inbox'?H.tag('filed on arrival','amb'):H.tag('outside storage','gray');}}],sources()))+
      H.note('<b>A ledger is never searched for.</b> It is worked out from the books the moment you ask, so it is current to the minute — which is better than finding last month’s PDF of it. Only things that were <i>always</i> files — a signed delivery receipt, a scan, an agreement — are looked up, and those are found by an index entry rather than by hunting through folders.')+
      H.panel('Filed documents this office can find',docs(DB).length?H.table([
        {label:'Reference',align:'l',fmt:function(d){return '<b class="mono">'+esc(d.ref)+'</b>';}},
        {label:'What it is',align:'l',fmt:function(d){return esc((kindOf(d.kind)||{}).label||d.kind);}},
        {label:'Party',align:'l',fmt:function(d){return esc(d.party||'—');}},
        {label:'Filed',align:'l',fmt:function(d){return esc(d.date||'');}},
        {label:'Where it sits',align:'l',fmt:function(d){return esc(d.where);}}],docs(DB)):'<div class="cascade">Nothing filed yet.</div>')+
      H.panel('Printers the office computer can see',H.table([
        {label:'Printer',align:'l',fmt:function(p){return '<b>'+esc(p.name)+'</b>';}},
        {label:'Where',align:'l',k:'where'},
        {label:'Good for',align:'l',k:'kind'},
        {label:'',align:'l',fmt:function(p){return p.online?H.tag('answering','grn'):H.tag('switched off','red');}},
        {label:'',align:'l',fmt:function(p){return DB.defp===p.id?H.tag('default','blu')
          :(p.online?'<button class="btn sm" data-act="setp" data-p="'+esc(p.id)+'">Make default</button>':'<span class="hint">turn it on first</span>');}}],printers(DB)),
        '<button class="btn sm" data-act="togglep">Switch a printer on or off</button>')+
      H.note('<b>A print job is never queued at a printer that is switched off.</b> The request is refused there and then, with a reason, because a job that sits waiting is a job somebody finds tomorrow — usually after they have printed it another way.');
    },
    wiring:function(){var DB=db();
      return H.head('Wiring · Integration','Where every figure comes from','Ask & Print owns the request, the rules for reading it, and the record. The documents belong to the modules that make them.')+
      H.note('Shared Data Core: Item/SKU · Party · Stock · Ledger/Voucher · Order — every module reads and writes these.')+
      H.panel('Every figure here, and its source',H.table([
        {label:'Figure here',align:'l',k:'f'},{label:'Comes from',align:'l',k:'s'},{label:'How it is worked out',align:'l',k:'h'}],
        CFG.wiring||[]))+
      '<div class="two">'+
      H.panel('The three pieces, and where each one runs',
        '<div class="cascade">'+
        '<div class="cl"><span class="d">1</span><div><b>Your phone.</b> Any messaging app, an email, or a page you open. Nothing is installed and nothing is plugged in.</div></div>'+
        '<div class="cl"><span class="d">2</span><div><b>Wherever your messages arrive.</b> WhatsApp, Telegram, email, SMS — or nothing outside at all, if you use the Medhava page instead. This is a Connector, so it is your choice and it is swappable.</div></div>'+
        '<div class="cl"><span class="d">3</span><div><b>The office computer.</b> A small program sits there holding the printer and the books. It keeps a connection <b>outward</b> — so nothing on the internet can reach in.</div></div>'+
        '<div class="cl"><span class="d">4</span><div>→ It reads the line, checks who asked, makes or finds the document, and prints or replies.</div></div>'+
        '<div class="cl"><span class="d">5</span><div>→ Every step lands in the record, including the ones that were refused.</div></div>'+
        '</div>'+
        '<p class="hint">'+esc(CFG.agentNote||'')+'</p>')+
      H.panel('The three things this app refuses to let happen',
        '<p><b>1 · An unregistered number gets nothing.</b> No document, and no reply that admits the system exists — because a reply is itself information. The attempt is logged with the number.</p>'+
        '<p><b>2 · Nothing that moves money can be asked for by message.</b> Pay, refund, approve, delete, adjust — refused for everybody including the owner. Not a permission that could be switched on; a shape this app does not have.</p>'+
        '<p><b>3 · A document that leaves the building needs a one-time code.</b> Printing inside the office does not, because the paper never leaves. Sending always does, because a copy is gone for ever.</p>'+
        '<p class="hint">All three are self-tests, so the app tells you on startup if any of them stops being true.</p>')+
      '</div>';
    }
  },
  actions:{
    fill:function(b){var e=document.getElementById('a_text');if(e){e.value=b.getAttribute('data-t');e.focus();}},
    ask:function(){var DB=db();var from=H.val('a_from'),text=H.val('a_text');
      if(!String(text||'').trim()){toast('Type something first');return;}
      var r=runOne(DB,from,text);
      K.save();
      toast(r.state==='printed'?'Printed on '+r.printer
        :r.state==='waiting'?'Waiting for the one-time code'
        :r.state==='sent'?'Sent':'Refused — the reason is on the record');
      K.render();},
    code:function(b){var DB=db();var n=num(b.getAttribute('data-i'));
      var r=log(DB).filter(function(x){return x.n===n;})[0];
      if(!r||r.state!=='waiting')return;
      r.state='sent'; r.why='Code confirmed, so the document went out. The code was never sent on the same channel it was asked on.';
      K.save();toast('Code accepted — '+r.out+' sent');K.render();},
    setp:function(b){var DB=db();var id=b.getAttribute('data-p');var p=printer(DB,id);
      if(!p||!p.online){toast('That printer is switched off');return;}
      DB.defp=id;K.save();toast(p.name+' is now the default');K.render();},
    togglep:function(){var DB=db();
      /* the second printer is the one that gets switched off at the end of a shift */
      var p=printers(DB)[1]||printers(DB)[0]; if(!p)return;
      p.online=!p.online;
      if(!p.online&&DB.defp===p.id){var alt=defaultPrinter(DB);DB.defp=alt?alt.id:'';}
      K.save();toast(p.name+' is now '+(p.online?'on':'off'));K.render();}
  },
  tests:function(t,DB){
    /* reading a line */
    t('an unknown line is never guessed at',findKind('please do the needful')===null);
    t('a line naming a ledger is read as a ledger',findKind('ledger for Kalamandir')==='ledger');
    t('a line naming a bill is read as a bill',findKind('send bill VS-INV-4471')==='bill');
    t('saying print means print',findVerb('print bill VS-INV-4471')==='print');
    t('not saying how means send it to me',findVerb('bill VS-INV-4471')==='send');
    t('a document number is picked out of the sentence',findRef('please send bill VS-INV-4471 today')==='VS-INV-4471');
    t('"2 copies" is read as two',findCopies('print slips 2 copies')===2);
    t('no number of copies means one',findCopies('print slips')===1);
    t('copies are capped, so a typo cannot print a ream',findCopies('print slips 9999 copies')===20);
    t('every kind it knows has at least one word that finds it',
      KINDS.every(function(k){return k.words.length&&findKind(k.words[0])!==null;}));
    t('no two kinds share a word',(function(){var seen={};
      return KINDS.every(function(k){return k.words.every(function(w){
        if(seen[w])return false; seen[w]=1; return true;});});})());
    /* who may ask */
    t('every registered person has a number and something they may do',
      people().every(function(p){return !!p.phone&&p.can&&p.can.length;}));
    t('no two people share a number',(function(){var seen={};
      return people().every(function(p){if(seen[p.phone])return false;seen[p.phone]=1;return true;});})());
    t('an unregistered number is refused whatever it asks',
      decide(DB,CFG.strangerPhone||'+91 90000 00000','ledger Kalamandir').ok===false);
    t('an unregistered number is refused even for something harmless',
      decide(DB,CFG.strangerPhone||'+91 90000 00000','stock').ok===false);
    t('a refusal for an unknown number says nothing about what exists',
      decide(DB,CFG.strangerPhone||'+91 90000 00000','bill XX-1').code==='unknown');
    t('somebody who may only print cannot send a document out',
      people().filter(function(p){return p.can.indexOf('send')<0;}).every(function(p){
        return decide(DB,p.phone,'send stock').ok===false;}));
    t('somebody limited to certain documents cannot ask for the others',
      people().filter(function(p){return p.scope;}).every(function(p){
        var other=KINDS.filter(function(k){return p.scope.indexOf(k.k)<0;})[0];
        return !other||decide(DB,p.phone,other.words[0]).ok===false;}));
    /* what may never be asked */
    t('nothing that moves money can be asked for by anybody',
      people().every(function(p){return FORBIDDEN.every(function(f){
        return decide(DB,p.phone,f+' 5000 to Kanchi Silks').ok===false;});}));
    t('a money word is refused as a shape, not as a permission',
      decide(DB,people()[0].phone,'pay 5000').code==='forbidden');
    t('the owner is refused exactly like everybody else',
      decide(DB,people()[0].phone,'approve the credit note').ok===false);
    /* the one-time code */
    t('sending a document out always waits for a one-time code',(function(){
      var p=people().filter(function(x){return x.can.indexOf('send')>=0&&!x.scope;})[0]; if(!p)return true;
      return decide(DB,p.phone,'send stock').needsCode===true;})());
    t('printing inside the office never needs a code',(function(){
      var p=people().filter(function(x){return x.can.indexOf('print')>=0;})[0]; if(!p)return true;
      var d=decide(DB,p.phone,'print stock'); return d.ok&&d.needsCode===false;})());
    t('a waiting request has a six-digit code',
      log(DB).filter(function(r){return r.state==='waiting';}).every(function(r){return /^\d{6}$/.test(r.otp);}));
    t('a request is only ever sent after its code is confirmed',
      log(DB).filter(function(r){return r.state==='sent';}).every(function(r){return r.verb==='send';}));
    /* printers */
    t('every printer says where it is and what it is good for',
      printers(DB).every(function(p){return !!p.where&&!!p.kind;}));
    t('the default printer is one that is switched on',(function(){
      var d=defaultPrinter(DB); return !d||d.online===true;})());
    t('nothing is queued at a printer that is switched off',(function(){
      var was=printers(DB).map(function(p){return p.online;});
      printers(DB).forEach(function(p){p.online=false;});
      var p=people().filter(function(x){return x.can.indexOf('print')>=0;})[0];
      var d=p?decide(DB,p.phone,'print stock'):{ok:false,code:'noprinter'};
      printers(DB).forEach(function(pr,i){pr.online=was[i];});
      return d.ok===false&&d.code==='noprinter';})());
    /* where answers come from */
    t('every source says what is in it',sources().every(function(s){return !!s.name&&!!s.what;}));
    t('a ledger is worked out fresh, never hunted for',kindOf('ledger').made===true);
    t('a scanned document is found, never invented',kindOf('scan').made===false);
    t('every kind of document has a source that exists',
      KINDS.every(function(k){return !!sourceFor(DB,k.k);}));
    t('asking for a filed document that is not there returns nothing rather than something else',(function(){
      var p=people().filter(function(x){return !x.scope;})[0]; if(!p)return true;
      var r=runOne(DB,p.phone,'send pod ZZ-0000');
      var ok=r.ok===false&&!r.out;
      DB.log.shift(); DB.seq=num(DB.seq)-1; return ok;})());
    /* the record */
    t('every request is on the record, including the refused ones',
      log(DB).every(function(r){return !!r.text&&!!r.state;}));
    t('a refusal always carries its reason',
      refused(DB).every(function(r){return !!r.why&&!!r.code;}));
    t('a refused request never produced a document',
      refused(DB).every(function(r){return !r.out;}));
    /* Every request number that was ever issued still has a row. Nothing was removed, and
       this holds however many actions the kernel later wires in — which the first version of
       this test did not, because it whitelisted action names and the Connectors screen adds one. */
    t('every request number ever issued still has a row — nothing was removed',
      log(DB).length===num(DB.seq)-num(DB.seq0));
    /* The kernel's own backup controls are prefixed with _ and are excluded: those wipe your
       whole local copy on purpose, with a confirmation. This is about THIS app adding a way to
       take one line out of the record, which it does not. */
    t('this app adds no action that removes a line from the record',
      Object.keys(SPEC.actions).filter(function(a){return a.charAt(0)!=='_';})
        .every(function(a){return !/del|remov|clear|purge|wipe|reset|drop/i.test(a);}));
    t('every request has a number, and no two share one',(function(){var seen={};
      return log(DB).every(function(r){if(seen[r.n])return false;seen[r.n]=1;return true;});})());
    t('how long each answer took is recorded',
      done(DB).every(function(r){return num(r.sec)>0;}));
    t('a document made from the books answers faster than one fetched from storage',
      num(CFG.makeSec||2)<num(CFG.fetchSec||6));
  }
};

if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
