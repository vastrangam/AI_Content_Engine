(function(){
var K=typeof Vanijo!=='undefined'?Vanijo:{}; var H=K.H,money=K.money,inr=K.inr,num=K.num,r2=K.r2,esc=K.esc,toast=K.toast;
function db(){return K.DB;}
function pay(e){return r2(num(e.base)*num(e.present)/num(e.days));}
function payroll(DB){return r2((DB.emps||[]).reduce(function(s,e){return s+pay(e);},0));}
function attendance(DB){var tp=(DB.emps||[]).reduce(function(s,e){return s+num(e.present);},0),td=(DB.emps||[]).reduce(function(s,e){return s+num(e.days);},0);return td?Math.round(tp/td*100):0;}
function byDept(DB){var m={};(DB.emps||[]).forEach(function(e){var d=m[e.dept]=m[e.dept]||{n:0,pay:0};d.n++;d.pay+=pay(e);});return m;}
var SPEC={ id:'hr', name:'HR / Payroll', tagline:'Headcount, attendance & pro-rated payroll — salaries from days present.',
  about:'A people register. Monthly pay is pro-rated on days present out of working days, so marking attendance re-computes payroll instantly. Headcount, average attendance and department cost are all derived.',
  groups:[{label:'People',items:['dash','team','payroll']}],
  nav:[{v:'dash',label:'Dashboard',icon:'grid'},{v:'team',label:'Team',icon:'users'},{v:'payroll',label:'Payroll',icon:'coin'}],
  seed:function(DB){
    DB.emps=[
      {id:'E-01',name:'Priya Nair',dept:'Design',role:'Designer',base:38000,present:26,days:26},
      {id:'E-02',name:'Rahul Sharma',dept:'Operations',role:'Ops Lead',base:32000,present:24,days:26},
      {id:'E-03',name:'Sunita Devi',dept:'Production',role:'Master Tailor',base:28000,present:25,days:26},
      {id:'E-04',name:'Vikram Singh',dept:'Sales',role:'Sales Exec',base:24000,present:22,days:26},
      {id:'E-05',name:'Anjali Rao',dept:'Sales',role:'Sales Exec',base:24000,present:26,days:26},
      {id:'E-06',name:'Imran Khan',dept:'Production',role:'Karigar',base:26000,present:20,days:26}];
    DB.seq={n:6};
  },
  views:{
    dash:function(){var DB=db();var depts=byDept(DB);
      return H.head('Command · Dashboard','HR / Payroll — live','This month’s payroll, pro-rated on attendance.')+
      H.kpis([
        {l:'Headcount',v:DB.emps.length,d:'on rolls',icon:'users',tone:'teal'},
        {l:'Monthly payroll',v:money(payroll(DB)),d:'pro-rated',icon:'coin',tone:'blue'},
        {l:'Avg attendance',v:attendance(DB)+'%',d:'present / working days',icon:'pct',tone:'green'},
        {l:'Departments',v:Object.keys(depts).length,d:'cost centres',icon:'layers',tone:'peach'}],'')+
      H.panel('Payroll by department',H.table([{label:'Department',align:'l',k:'d'},{label:'Headcount',k:'n',cellcls:'mono'},{label:'Payroll',k:'p',cellcls:'mono'}],
        Object.keys(depts).map(function(d){return {d:d,n:depts[d].n,p:inr(depts[d].pay)};})));
    },
    team:function(){var DB=db();
      return H.head('People · Team','Team & attendance','Mark a present day — pay re-computes on the spot.')+
      H.panel('Employees <span class="badge">'+DB.emps.length+'</span>',H.table([
        {label:'ID',align:'l',k:'id',cellcls:'mono'},{label:'Name',align:'l',k:'name'},{label:'Dept',align:'l',k:'dept'},{label:'Role',align:'l',k:'role'},
        {label:'Present',fmt:function(r){return r.present+'/'+r.days;},cellcls:'mono'},{label:'Pay',fmt:function(r){return inr(pay(r));},cellcls:'mono'},
        {label:'',align:'l',fmt:function(r){return num(r.present)<num(r.days)?'<button class="btn sm" data-act="mark" data-id="'+r.id+'">+1 day</button>':H.tag('full','grn');}}],DB.emps))+'<div id="res"></div>';
    },
    payroll:function(){var DB=db();
      return H.head('People · Payroll','Payroll run','Pro-rated salary = base × present ÷ working days.')+
      H.panel('Run <span class="badge">'+money(payroll(DB))+' total</span>',H.table([
        {label:'Employee',align:'l',k:'name'},{label:'Base',fmt:function(r){return inr(r.base);},cellcls:'mono'},{label:'Present',fmt:function(r){return r.present+'/'+r.days;},cellcls:'mono'},
        {label:'Deduction',fmt:function(r){return inr(r2(r.base-pay(r)));},cellcls:'mono'},{label:'Net pay',fmt:function(r){return inr(pay(r));},cellcls:'mono'}],DB.emps));
    }
  },
  actions:{ mark:function(b){var DB=db();var e=DB.emps.filter(function(x){return x.id===b.getAttribute('data-id');})[0];
    if(e&&num(e.present)<num(e.days))e.present=num(e.present)+1;K.save();
    var el=document.getElementById('res');if(el&&e)el.innerHTML='<div class="cascade"><b>'+esc(e.name)+'</b> now '+e.present+'/'+e.days+' days — net pay '+money(pay(e))+'.</div>';
    toast('Attendance marked ✓');setTimeout(function(){K.render();},600);} },
  tests:function(t,DB){
    t('pay = base × present ÷ days',pay(DB.emps[1])===r2(32000*24/26));
    t('full-attendance employee earns base',pay(DB.emps[0])===38000);
    t('payroll = sum of net pay',payroll(DB)===r2(DB.emps.reduce(function(s,e){return s+pay(e);},0)));
    var d=byDept(DB);t('dept headcount sums to total',Object.keys(d).reduce(function(a,k){return a+d[k].n;},0)===DB.emps.length);}
};
if(typeof module!=='undefined'&&module.exports)module.exports=SPEC;
if(typeof Vanijo!=='undefined'&&Vanijo.app)Vanijo.app(SPEC);
})();
