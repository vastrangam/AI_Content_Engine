/* Medhava — Quotes & Proforma (Module 03 · App 5)
   A quote is a promise with an expiry date. This app keeps every revision, expires a quote
   on its own, turns an accepted one into a proforma and then into a confirmed order — in
   one click, with nothing re-typed.
   CONFIG supplies names so the Medhava and Vastrangam builds run the SAME math. */
var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
var CFG=(typeof CONFIG!=='undefined')?CONFIG:{};
function db(){return K.DB;}
var TODAY='2026-07-31';
function days(from,to){return Math.round((new Date(to||TODAY)-new Date(from))/86400000);}
function addDays(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x.toISOString().slice(0,10);}
function plural(n,one,many){return n+' '+(n===1?one:(many||one+'s'));}

var GST_PCT=5;
var STAGES=[{k:'draft',l:'Draft'},{k:'sent',l:'Sent'},{k:'accepted',l:'Accepted'},
            {k:'proforma',l:'Proforma'},{k:'order',l:'Confirmed order'}];
function stIdx(k){for(var i=0;i<STAGES.length;i++)if(STAGES[i].k===k)return i;return -1;}
function stLbl(k){var s=STAGES.filter(function(x){return x.k===k;})[0];return s?s.l:(k==='expired'?'Expired':'Lost');}

function item(sku){return (CFG.items||[]).filter(function(x){return x.sku===sku;})[0]||null;}
/* ── one quote's money. The revision you are looking at is always the latest one. ── */
function rev(q){return (q.revs||[]).length?q.revs[q.revs.length-1]:{lines:[],disc:0};}
function revNo(q){return (q.revs||[]).length;}
function lineGross(l){return r2(num(l.qty)*num(l.rate));}
function gross(q){return r2((rev(q).lines||[]).reduce(function(s,l){return s+lineGross(l);},0));}
function disc(q){return r2(gross(q)*Math.max(0,Math.min(50,num(rev(q).disc)))/100);}
function taxable(q){return r2(gross(q)-disc(q));}
function tax(q){return r2(taxable(q)*GST_PCT/100);}
function total(q){return r2(taxable(q)+tax(q));}
function units(q){return (rev(q).lines||[]).reduce(function(s,l){return s+num(l.qty);},0);}

function expiresOn(q){return addDays(q.date,num(q.validity));}
function daysLeft(q){return days(TODAY,expiresOn(q));}
/* a quote expires by itself — nobody has to remember */
function isExpired(q){return stIdx(q.status)>=0&&stIdx(q.status)<stIdx('accepted')&&daysLeft(q)<0;}
function state(q){return q.status==='lost'?'lost':(isExpired(q)?'expired':q.status);}

function quotes(DB){return DB.quotes||[];}
function open(DB){return quotes(DB).filter(function(q){var s=state(q);
  return s==='draft'||s==='sent';});}
function expired(DB){return quotes(DB).filter(function(q){return state(q)==='expired';});}
function won(DB){return quotes(DB).filter(function(q){return stIdx(q.status)>=stIdx('accepted')&&q.status!=='lost';});}
function lost(DB){return quotes(DB).filter(function(q){return q.status==='lost';});}
function converted(DB){return quotes(DB).filter(function(q){return q.status==='order';});}

function openValue(DB){return r2(open(DB).reduce(function(s,q){return s+total(q);},0));}
function wonValue(DB){return r2(won(DB).reduce(function(s,q){return s+total(q);},0));}
function lostValue(DB){return r2(lost(DB).reduce(function(s,q){return s+total(q);},0));}
function expiredValue(DB){return r2(expired(DB).reduce(function(s,q){return s+total(q);},0));}
function decided(DB){return won(DB).length+lost(DB).length;}
function winRate(DB){return decided(DB)?Math.round(won(DB).length/decided(DB)*100):0;}
function avgQuote(DB){var n=quotes(DB).length;return n?r2(quotes(DB).reduce(function(s,q){return s+total(q);},0)/n):0;}
function expiringSoon(DB){return open(DB).filter(function(q){return daysLeft(q)>=0&&daysLeft(q)<=3;});}
/* how much the haggling actually cost, across every revision */
function firstTotal(q){var r=(q.revs||[])[0]; if(!r)return 0;
  var g=r2((r.lines||[]).reduce(function(s,l){return s+lineGross(l);},0));
  var d=r2(g*Math.max(0,Math.min(50,num(r.disc)))/100);
  return r2((g-d)*(100+GST_PCT)/100);}
function slippage(q){return r2(firstTotal(q)-total(q));}
function totalSlippage(DB){return r2(quotes(DB).filter(function(q){return revNo(q)>1;})
  .reduce(function(s,q){return s+slippage(q);},0));}

function funnel(DB){return STAGES.map(function(s){
  var rows=quotes(DB).filter(function(q){return state(q)===s.k;});
  return {stage:s.l,key:s.k,n:rows.length,value:r2(rows.reduce(function(t,q){return t+total(q);},0))};});}

function issues(DB){var out=[];
  expiringSoon(DB).forEach(function(q){out.push({sev:'high',
    what:q.id+' ('+q.cust+') expires in '+plural(daysLeft(q),'day')+' — '+money(total(q))+' still undecided',go:'list'});});
  expired(DB).forEach(function(q){out.push({sev:'med',
    what:q.id+' ('+q.cust+') expired '+plural(-daysLeft(q),'day')+' ago — re-quote it or mark it lost',go:'list'});});
  quotes(DB).filter(function(q){return revNo(q)>=3;}).forEach(function(q){out.push({sev:'med',
    what:q.id+' is on revision '+revNo(q)+' — '+money(slippage(q))+' has come off since the first price',go:'list'});});
  quotes(DB).filter(function(q){return q.status==='accepted'&&days(q.acceptedOn||q.date)>7;}).forEach(function(q){
    out.push({sev:'med',what:q.id+' was accepted '+plural(days(q.acceptedOn||q.date),'day')+' ago and is still not an order',go:'list'});});
  return out;}

/* A quote goes out by email or message, gets printed, and becomes a ledger document
   once it is an order. All of those are swappable. */
var SPEC={
  uses:['email','messaging','printing','ledger','storage','automation'],
  id:CFG.id, name:CFG.name, company:CFG.company, fy:CFG.fy||'FY 2026-27', tagline:CFG.tagline, about:CFG.about,
  groups:[{label:'Quoting',items:['dash','list','one']},
          {label:'Wiring',items:['wiring']}],
  nav:[{v:'dash',label:'Overview',icon:'grid'},{v:'list',label:'All quotes',icon:'doc'},
       {v:'one',label:'One quote',icon:'book'},{v:'wiring',label:'Wiring',icon:'flow'}],
  seed:function(DB){
    DB.quotes=JSON.parse(JSON.stringify(CFG.quotes));
    DB.sel=DB.quotes[0].id; DB.seq=300;
  },
  views:{
    dash:function(){var DB=db();var f=funnel(DB);var mx=Math.max.apply(null,f.map(function(x){return x.value;}).concat([1]));
      var iss=issues(DB);
      return H.head('Quoting · Overview',CFG.name,'Every quote out there, what it is worth, and which ones are about to go stale.')+
      H.kpis([
        {l:'Out with customers',v:money(openValue(DB)),d:plural(open(DB).length,'quote'),icon:'doc',tone:'teal'},
        {l:'Accepted',v:money(wonValue(DB)),d:winRate(DB)+'% of decided',cls:'g',icon:'check',tone:'green'},
        {l:'Expired unanswered',v:money(expiredValue(DB)),d:plural(expired(DB).length,'quote'),cls:expired(DB).length?'r':'g',icon:'clock',tone:'peach'},
        {l:'Lost to haggling',v:money(totalSlippage(DB)),d:'across every revision',cls:totalSlippage(DB)?'r':'g',icon:'pct',tone:'blue'},
        {l:'Needs a decision',v:iss.length,d:'expiring or stalled',cls:iss.length?'r':'g',icon:'bell',tone:iss.length?'red':'green'}],'k5')+
      '<div class="two">'+
      H.panel('Where the quotes are',
        f.map(function(x){return '<div style="margin-bottom:10px"><div class="kv" style="border:none;padding:2px 0"><span>'+
          esc(x.stage)+' <span class="hint">'+plural(x.n,'quote')+'</span></span><b>'+money(x.value)+'</b></div>'+
          H.bar(x.value/mx*100)+'</div>';}).join('')+
        '<div class="kv" style="margin-top:10px"><span>Expired on its own</span><b class="'+(expired(DB).length?'r':'')+'">'+
          plural(expired(DB).length,'quote')+' · '+money(expiredValue(DB))+'</b></div>'+
        '<div class="kv"><span>Marked lost</span><b>'+plural(lost(DB).length,'quote')+' · '+money(lostValue(DB))+'</b></div>'+
        '<div class="kv"><span>Average quote</span><b>'+money(avgQuote(DB))+'</b></div>'+
        '<p class="hint" style="margin-top:8px">A quote expires by itself the day its validity runs out. Nobody has to remember, and an old price can never be honoured by accident.</p>')+
      H.panel('What needs a decision <span class="badge">'+iss.length+'</span>',
        iss.length?H.table([{label:'',align:'l',fmt:function(a){return H.tag(a.sev==='high'?'urgent':'watch',a.sev==='high'?'red':'amb');}},
          {label:'What is happening',align:'l',k:'what'},
          {label:'',align:'l',fmt:function(a){return '<button class="btn sm" data-go="'+a.go+'">Open →</button>';}}],iss)
        :'<div class="cascade">Nothing is about to expire and nothing has stalled.</div>')+
      '</div>'+
      H.panel('What the haggling cost',quotes(DB).filter(function(q){return revNo(q)>1;}).length?H.table([
        {label:'Quote',align:'l',fmt:function(q){return '<b>'+esc(q.id)+'</b><div class="hint">'+esc(q.cust)+'</div>';}},
        {label:'Revisions',fmt:function(q){return revNo(q);},cellcls:function(q){return 'mono '+(revNo(q)>=3?'r':'');}},
        {label:'First price',fmt:function(q){return inr(firstTotal(q));},cellcls:'mono'},
        {label:'Price now',fmt:function(q){return inr(total(q));},cellcls:'mono'},
        {label:'Came off',fmt:function(q){return inr(slippage(q));},cellcls:function(q){return 'mono '+(slippage(q)>0?'r':'');}},
        {label:'',align:'l',fmt:function(q){return slippage(q)>firstTotal(q)*0.1
          ?H.tag('over 10% given away','red'):slippage(q)>0?H.tag('some given away','amb'):H.tag('held the price','grn');}}],
        quotes(DB).filter(function(q){return revNo(q)>1;}).sort(function(a,b){return slippage(b)-slippage(a);}))
        :'<div class="cascade">No quote has been revised. Every price was accepted as first offered.</div>')+
        '<p class="hint">'+esc(CFG.slipNote||'')+'</p>';
    },
    list:function(){var DB=db();
      return H.head('Quoting · All quotes','All quotes','Send it, revise it, accept it, and turn it into an order — without typing anything twice.')+
      H.kpis(STAGES.map(function(s,i){var rows=quotes(DB).filter(function(q){return state(q)===s.k;});
        return {l:s.l,v:rows.length,d:money(r2(rows.reduce(function(t,q){return t+total(q);},0))),
          icon:['doc','mail','check','book','cart'][i],tone:['teal','blue','green','peach','amb'][i]};}),'k5')+
      H.panel('Raise a quote',H.form([
        {id:'q_cust',label:'Customer',ph:CFG.ph.cust,wide:true},
        {id:'q_item',label:'Item',type:'select',options:(CFG.items||[]).map(function(it){return {v:it.sku,label:it.name+' — '+money(it.rate)};})},
        {id:'q_qty',label:'Quantity',type:'num',ph:'20'},
        {id:'q_disc',label:'Discount %',type:'num',ph:'0'},
        {id:'q_val',label:'Valid for (days)',type:'select',options:[{v:'7',label:'7 days'},{v:'15',label:'15 days'},{v:'30',label:'30 days'},{v:'45',label:'45 days'}]}
      ],'Raise the quote','newquote','f3'))+
      H.panel('Every quote',quotes(DB).length?H.table([
        {label:'Quote',align:'l',fmt:function(q){return '<b>'+esc(q.id)+'</b><div class="hint">'+esc(q.date)+' · rev '+revNo(q)+'</div>';}},
        {label:'Customer',align:'l',fmt:function(q){return esc(q.cust);}},
        {label:'Pieces',fmt:function(q){return units(q);},cellcls:'mono'},
        {label:'Total',fmt:function(q){return inr(total(q));},cellcls:'mono'},
        {label:'Valid',fmt:function(q){return q.validity+'d';},cellcls:'mono'},
        {label:'Expires',align:'l',fmt:function(q){
          if(stIdx(q.status)>=stIdx('accepted'))return '<span class="hint">accepted</span>';
          var d=daysLeft(q);
          return d<0?H.tag('expired '+(-d)+'d ago','red'):d<=3?H.tag(plural(d,'day')+' left','red')
            :d<=7?H.tag(plural(d,'day')+' left','amb'):H.tag(plural(d,'day')+' left','grn');}},
        {label:'Stage',align:'l',fmt:function(q){var s=state(q);
          return H.tag(stLbl(s),s==='expired'||s==='lost'?'red':['teal','blu','grn','peach','amb'][stIdx(s)]||'gray');}},
        {label:'',align:'l',fmt:function(q){var i=quotes(DB).indexOf(q);var s=state(q);
          var b='<button class="btn sm" data-act="open" data-i="'+i+'">Open</button> ';
          if(s==='expired')return b+'<button class="btn sm p" data-act="requote" data-i="'+i+'">Re-quote</button> '+
            '<button class="btn sm d" data-act="lose" data-i="'+i+'">Lost</button>';
          if(s==='lost')return b;
          if(stIdx(s)<STAGES.length-1)return b+'<button class="btn sm p" data-act="advance" data-i="'+i+'">'+
            esc(STAGES[stIdx(s)+1].l)+' →</button>'+(stIdx(s)<stIdx('accepted')
              ?' <button class="btn sm d" data-act="lose" data-i="'+i+'">Lost</button>':'');
          return b+H.tag('done','grn');}}],quotes(DB).slice().sort(function(a,b){return stIdx(state(a))-stIdx(state(b));}))
        :'<div class="empty">No quotes yet.</div>')+
      H.note('<b>Accepted → Proforma → Confirmed order</b> is one click each, and nothing is re-typed. The proforma carries the same lines, the same discount and the same total as the quote the customer said yes to.');
    },
    one:function(){var DB=db();
      var q=quotes(DB).filter(function(x){return x.id===DB.sel;})[0];
      if(!q)return H.head('Quoting','One quote','Pick a quote from the list.')+'<button class="btn p" data-go="list">← All quotes</button>';
      var i=quotes(DB).indexOf(q), s=state(q);
      return H.head('Quoting · '+esc(q.id),q.cust,
        'Raised '+q.date+' · valid '+q.validity+' days · expires '+expiresOn(q)+' · revision '+revNo(q),
        '<button class="btn" data-go="list">← All quotes</button>')+
      H.kpis([{l:'Total now',v:money(total(q)),d:plural(units(q),'piece'),icon:'coin',tone:'teal'},
        {l:'Stage',v:stLbl(s),d:s==='expired'?'no longer valid':'current',cls:s==='expired'||s==='lost'?'r':'g',icon:'check',tone:'blue'},
        {l:'Days left',v:stIdx(q.status)>=stIdx('accepted')?'—':daysLeft(q),d:stIdx(q.status)>=stIdx('accepted')?'accepted':'until it expires',
         cls:daysLeft(q)<0?'r':'',icon:'clock',tone:'peach'},
        {l:'Given away so far',v:money(slippage(q)),d:revNo(q)>1?'over '+plural(revNo(q),'revision'):'first price still stands',
         cls:slippage(q)?'r':'g',icon:'pct',tone:'green'}],'')+
      H.panel('What is on it',H.table([
        {label:'Item',align:'l',fmt:function(l){return esc(l.name);}},
        {label:'Rate',fmt:function(l){return inr(l.rate);},cellcls:'mono'},
        {label:'Qty',k:'qty',cellcls:'mono'},
        {label:'Line total',fmt:function(l){return inr(lineGross(l));},cellcls:'mono'}],rev(q).lines||[])+
        '<div class="kv" style="margin-top:8px"><span>Gross</span><b>'+money(gross(q))+'</b></div>'+
        '<div class="kv"><span>− Discount '+num(rev(q).disc)+'%</span><b>'+money(disc(q))+'</b></div>'+
        '<div class="kv"><span>Taxable</span><b>'+money(taxable(q))+'</b></div>'+
        '<div class="kv"><span>+ GST '+GST_PCT+'%</span><b>'+money(tax(q))+'</b></div>'+
        '<div class="kv"><span><b>Total</b></span><b class="g">'+money(total(q))+'</b></div>')+
      (stIdx(q.status)<stIdx('accepted')&&s!=='lost'?H.panel('Revise it',
        '<div class="form f3">'+H.fields([
          {id:'r_qty',label:'New quantity',type:'num',value:units(q)},
          {id:'r_disc',label:'New discount %',type:'num',value:num(rev(q).disc)}
        ])+'<div class="fld" style="align-items:flex-end"><button class="btn p" data-act="revise" data-i="'+i+'">Save as revision '+(revNo(q)+1)+'</button></div></div>'+
        '<p class="hint">Every revision is kept. The customer sees the latest one; you can see what the first one said, which is the only way to know what the haggling actually cost.</p>'):'')+
      H.panel('Every revision <span class="badge">'+revNo(q)+'</span>',H.table([
        {label:'Revision',align:'l',fmt:function(r){return '<b>'+((q.revs||[]).indexOf(r)+1)+'</b>'+
          ((q.revs||[]).indexOf(r)===revNo(q)-1?' '+H.tag('current','grn'):'');}},
        {label:'Pieces',fmt:function(r){return (r.lines||[]).reduce(function(s,l){return s+num(l.qty);},0);},cellcls:'mono'},
        {label:'Discount',fmt:function(r){return num(r.disc)+'%';},cellcls:'mono'},
        {label:'Total',fmt:function(r){var g=r2((r.lines||[]).reduce(function(s,l){return s+lineGross(l);},0));
          var d=r2(g*Math.max(0,Math.min(50,num(r.disc)))/100);
          return inr(r2((g-d)*(100+GST_PCT)/100));},cellcls:'mono'},
        {label:'',align:'l',fmt:function(r){return esc(r.why||'—');}}],q.revs||[]))+
      (s==='expired'?H.note('This quote has <b>expired</b>. The price on it is no longer valid. Press <b>Re-quote</b> on the list to raise a fresh one at today’s prices — the lines carry over, the validity restarts.'):'');
    },
    wiring:function(){var DB=db();
      return H.head('Wiring · Integration','Where every figure comes from','Quotes owns the offer and its revisions. The moment one becomes an order, the rest of the business takes over.')+
      H.note('Shared Data Core: Item/SKU · Party · Stock · Ledger/Voucher · Order — every module reads and writes these.')+
      H.panel('Every figure here, and its source',H.table([
        {label:'Figure here',align:'l',k:'f'},{label:'Comes from',align:'l',k:'s'},{label:'How it is worked out',align:'l',k:'h'}],
        CFG.wiring||[]))+
      '<div class="two">'+
      H.panel('Live example — a quote becomes an order',
        '<div class="cascade">'+
        '<div class="cl"><span class="d">1</span><div>A quote is raised. Rates come from the <b>Catalog</b>; validity is chosen deliberately.</div></div>'+
        '<div class="cl"><span class="d">2</span><div>→ <b>Sent</b>. From this moment it is a promise with an expiry date, and the clock runs on its own.</div></div>'+
        '<div class="cl"><span class="d">3</span><div>→ The customer haggles. Each <b>revision</b> is kept, so what came off the first price is visible for ever.</div></div>'+
        '<div class="cl"><span class="d">4</span><div>→ <b>Accepted</b>. The expiry stops mattering; the price is now agreed.</div></div>'+
        '<div class="cl"><span class="d">5</span><div>→ <b>Proforma</b>: the same lines, the same total, as a document the customer can pay against.</div></div>'+
        '<div class="cl"><span class="d">6</span><div>→ <b>Confirmed order</b>: it leaves this app and becomes a real order. Stock is reserved and the books take it from there.</div></div>'+
        '</div>')+
      H.panel('Two rules that pay for the whole app',
        '<p><b>1 · A quote expires by itself.</b> Nobody has to remember, and nobody can honour a three-month-old price by accident because "we did quote it". The expiry is worked out from the date and the validity you chose — it is not a field somebody has to update.</p>'+
        '<p><b>2 · Every revision is kept.</b> The customer only sees the latest, but you can always see the first. Without that history, "what did discounting cost us this quarter" is unanswerable — which is why almost nobody asks it.</p>'+
        '<p class="hint">Both are self-tests: an out-of-date quote must read as expired, and the first revision must always still be readable.</p>')+
      '</div>';
    }
  },
  actions:{
    newquote:function(){var DB=db();
      var c=(H.val('q_cust')||'').trim(), q=H.numv('q_qty'), d=H.numv('q_disc');
      if(!c){toast('Who is it for?');return;}
      if(q<=0){toast('Quantity must be at least 1');return;}
      if(d<0||d>50){toast('Discount must be between 0 and 50%');return;}
      var it=item(H.val('q_item')); if(!it)return;
      DB.seq=(DB.seq||300)+1;
      DB.quotes.push({id:CFG.prefix+DB.seq,cust:c,date:TODAY,validity:num(H.val('q_val'))||15,status:'draft',
        revs:[{lines:[{sku:it.sku,name:it.name,rate:it.rate,qty:q}],disc:d,why:'First offer'}]});
      K.save();toast('Quote raised ✓');K.render();},
    advance:function(b){var DB=db();var q=DB.quotes[num(b.getAttribute('data-i'))];
      if(!q||q.status==='lost')return;
      var s=state(q);
      if(s==='expired'){toast('It has expired — re-quote it instead');return;}
      var i=stIdx(q.status); if(i<0||i>=STAGES.length-1)return;
      q.status=STAGES[i+1].k;
      if(q.status==='accepted')q.acceptedOn=TODAY;
      K.save();toast('Now '+STAGES[i+1].l.toLowerCase());K.render();},
    lose:function(b){var DB=db();var q=DB.quotes[num(b.getAttribute('data-i'))];
      if(!q||stIdx(q.status)>=stIdx('proforma')){toast('It has already become an order');return;}
      q.status='lost';K.save();toast('Marked lost');K.render();},
    revise:function(b){var DB=db();var q=DB.quotes[num(b.getAttribute('data-i'))];
      if(!q||stIdx(q.status)>=stIdx('accepted'))return;
      var nq=H.numv('r_qty'), nd=H.numv('r_disc');
      if(nq<=0){toast('Quantity must be at least 1');return;}
      if(nd<0||nd>50){toast('Discount must be between 0 and 50%');return;}
      var lines=JSON.parse(JSON.stringify(rev(q).lines||[]));
      if(lines.length)lines[0].qty=nq;
      q.revs.push({lines:lines,disc:nd,why:'Revised at the customer’s request'});
      K.save();toast('Revision '+revNo(q)+' saved');K.render();},
    requote:function(b){var DB=db();var q=DB.quotes[num(b.getAttribute('data-i'))];
      if(!q)return;
      DB.seq=(DB.seq||300)+1;
      DB.quotes.push({id:CFG.prefix+DB.seq,cust:q.cust,date:TODAY,validity:num(q.validity),status:'draft',
        revs:[{lines:JSON.parse(JSON.stringify(rev(q).lines||[])),disc:num(rev(q).disc),why:'Re-quoted after '+q.id+' expired'}]});
      q.status='lost';
      K.save();toast('Re-quoted at today’s date ✓');K.render();},
    open:function(b){var DB=db();var q=DB.quotes[num(b.getAttribute('data-i'))];
      if(!q)return; DB.sel=q.id;K.save();K.go('one');}
  },
  tests:function(t,DB){
    /* one quote's arithmetic */
    t('a line total = quantity × rate',quotes(DB).every(function(q){
      return (rev(q).lines||[]).every(function(l){return lineGross(l)===r2(l.qty*l.rate);});}));
    t('the discount comes off before GST',quotes(DB).every(function(q){
      return taxable(q)===r2(gross(q)-disc(q))&&tax(q)===r2(taxable(q)*GST_PCT/100);}));
    t('a quote total = taxable + GST',quotes(DB).every(function(q){return total(q)===r2(taxable(q)+tax(q));}));
    t('no quote carries a discount over 50%',quotes(DB).every(function(q){
      return (q.revs||[]).every(function(r){return num(r.disc)<=50;});}));
    t('a discount over 50% would be clamped, not applied',(function(){
      var q={date:TODAY,validity:15,status:'draft',revs:[{lines:[{sku:'x',name:'x',rate:1000,qty:1}],disc:90}]};
      return disc(q)===500;})());
    /* revisions */
    t('every quote has at least one revision',quotes(DB).every(function(q){return revNo(q)>=1;}));
    t('the current figures come from the latest revision',quotes(DB).every(function(q){
      return rev(q)===q.revs[q.revs.length-1];}));
    t('the first revision is always still readable',quotes(DB).every(function(q){
      return !!(q.revs||[])[0];}));
    t('what came off = first price − price now',quotes(DB).every(function(q){
      return slippage(q)===r2(firstTotal(q)-total(q));}));
    t('a quote never revised has given nothing away',quotes(DB).filter(function(q){return revNo(q)===1;})
      .every(function(q){return slippage(q)===0;}));
    t('total slippage counts only revised quotes',
      totalSlippage(DB)===r2(quotes(DB).filter(function(q){return revNo(q)>1;})
        .reduce(function(s,q){return s+slippage(q);},0)));
    t('adding a revision does not change the first one',(function(){
      var q=quotes(DB).filter(function(x){return stIdx(x.status)<stIdx('accepted')&&x.status!=='lost';})[0];
      if(!q)return true;
      var was=firstTotal(q), n=revNo(q);
      q.revs.push({lines:JSON.parse(JSON.stringify(rev(q).lines)),disc:50,why:'probe'});
      var ok=firstTotal(q)===was&&revNo(q)===n+1;
      q.revs.pop(); return ok;})());
    /* expiry */
    t('the expiry date = the date raised + the validity',quotes(DB).every(function(q){
      return expiresOn(q)===addDays(q.date,num(q.validity));}));
    t('a quote past its validity reads as expired on its own',quotes(DB).every(function(q){
      var e=stIdx(q.status)>=0&&stIdx(q.status)<stIdx('accepted')&&daysLeft(q)<0;
      return isExpired(q)===e;}));
    t('an accepted quote never expires',quotes(DB).filter(function(q){return stIdx(q.status)>=stIdx('accepted');})
      .every(function(q){return !isExpired(q);}));
    t('nothing is both open and expired',(function(){
      var o=open(DB).map(function(q){return q.id;});
      return expired(DB).every(function(q){return o.indexOf(q.id)<0;});})());
    t('"expiring soon" is only quotes with 3 days or less left',
      expiringSoon(DB).every(function(q){return daysLeft(q)>=0&&daysLeft(q)<=3;}));
    /* the funnel */
    t('every quote is in exactly one state',quotes(DB).every(function(q){
      var s=state(q);return s==='expired'||s==='lost'||stIdx(s)>=0;}));
    t('open value counts only draft and sent quotes',
      openValue(DB)===r2(open(DB).reduce(function(s,q){return s+total(q);},0)));
    t('win rate = accepted ÷ (accepted + lost)',
      winRate(DB)===(decided(DB)?Math.round(won(DB).length/decided(DB)*100):0));
    t('a lost quote is never counted as won',
      lost(DB).every(function(q){return won(DB).indexOf(q)<0;}));
    t('a converted order is also counted as won',
      converted(DB).every(function(q){return won(DB).indexOf(q)>=0;}));
    /* becoming an order */
    t('accepting a quote does not change its total',(function(){
      var q=quotes(DB).filter(function(x){return x.status==='sent'&&!isExpired(x);})[0];
      if(!q)return true;
      var was=total(q); q.status='accepted';
      var ok=total(q)===was; q.status='sent'; return ok;})());
    t('a proforma carries the same total as the accepted quote',(function(){
      var q=quotes(DB).filter(function(x){return x.status==='accepted';})[0];
      if(!q)return true;
      var was=total(q); q.status='proforma';
      var ok=total(q)===was; q.status='accepted'; return ok;})());
    t('a quote that has become an order cannot be marked lost',
      converted(DB).every(function(q){return stIdx(q.status)>=stIdx('proforma');}));
  }
};

if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Medhava!=='undefined'&&Medhava.app)Medhava.app(SPEC);
