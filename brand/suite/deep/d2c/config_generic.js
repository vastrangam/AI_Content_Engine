/* Format A — Unified ERP (any industry). Neutral names; drop-in for any business selling direct. */
var CONFIG={
  id:'d2c_erp', name:'D2C Sales', company:'Acme Corp', fy:'FY 2026-27', prefix:'SO-',
  storeName:'your own website',
  tagline:'Your own storefront, cart to doorstep — with coupons, part-paid COD, loyalty and cart recovery.',
  about:'Every order from your own website in one pipeline: New → Confirmed → Packed → Shipped → Delivered. Coupons only apply above their minimum order value, so a code can never quietly cut a bill it was not meant for. A cash-on-delivery order cannot be packed until it carries a 20% advance — the single cheapest way to stop refused deliveries. Loyalty points are earned on delivery, never on order, so the points you owe is always a real number. And every abandoned cart is listed with its age, because a cart left three days ago is the cheapest sale in the business to win back.',
  ph:{cust:'e.g. Ananya Rao'},
  items:[
    {sku:'FG-101',name:'Standard product',rate:1799},
    {sku:'FG-102',name:'Premium product',rate:4999},
    {sku:'FG-103',name:'Accessory',rate:899},
    {sku:'FG-104',name:'Top-of-range product',rate:12999}],
  coupons:[
    {code:'FIRST10',pct:10,min:1500},
    {code:'FEST15',pct:15,min:3000},
    {code:'BULK20',pct:20,min:6000}],
  orders:[
    {id:'SO-501',cust:'Ananya Rao',date:'2026-07-12',sku:'FG-102',name:'Premium product',qty:1,rate:4999,status:'delivered',pay:'prepaid',adv:0,coupon:'FIRST10'},
    {id:'SO-502',cust:'Rohit Verma',date:'2026-07-18',sku:'FG-102',name:'Premium product',qty:1,rate:4999,status:'shipped',pay:'cod',adv:1200,coupon:''},
    {id:'SO-503',cust:'Sneha Iyer',date:'2026-07-27',sku:'FG-101',name:'Standard product',qty:2,rate:1799,status:'packed',pay:'prepaid',adv:0,coupon:'FEST15'},
    {id:'SO-504',cust:'Karan Mehta',date:'2026-07-29',sku:'FG-103',name:'Accessory',qty:1,rate:899,status:'confirmed',pay:'cod',adv:100,coupon:''},
    {id:'SO-505',cust:'Divya Nair',date:'2026-07-30',sku:'FG-102',name:'Premium product',qty:1,rate:4999,status:'new',pay:'prepaid',adv:0,coupon:'FIRST10'},
    {id:'SO-506',cust:'Ananya Rao',date:'2026-06-22',sku:'FG-104',name:'Top-of-range product',qty:1,rate:12999,status:'delivered',pay:'prepaid',adv:0,coupon:'FEST15'},
    {id:'SO-507',cust:'Meera Joshi',date:'2026-07-31',sku:'FG-101',name:'Standard product',qty:1,rate:1799,status:'new',pay:'cod',adv:0,coupon:''},
    {id:'SO-508',cust:'Rohit Verma',date:'2026-07-09',sku:'FG-102',name:'Premium product',qty:1,rate:4999,status:'cancelled',pay:'prepaid',adv:0,coupon:''},
    {id:'SO-509',cust:'Tanvi Shah',date:'2026-07-05',sku:'FG-103',name:'Accessory',qty:1,rate:899,status:'delivered',pay:'prepaid',adv:0,coupon:'FEST15'}],
  carts:[
    {cust:'Priya Kulkarni',item:'Premium product',sku:'FG-102',value:4999,days:3},
    {cust:'Amit Ranjan',item:'Standard product',sku:'FG-101',value:1799,days:12},
    {cust:'Nisha Gupta',item:'Top-of-range product',sku:'FG-104',value:12999,days:6}],
  spent:{'Ananya Rao':100},
  codNote:'A high cash-on-delivery share is not free. Every COD parcel can be refused at the door, and you pay the courier both ways. The 20% advance rule below is the cheapest defence there is.',
  cartNote:'A cart abandoned in the last week is still warm — the person remembers what they wanted and why. After a week the reason has usually gone, and chasing it costs more than it returns.',
  wiring:[
    {f:'Net sales',s:'This app (it owns the order)',h:'Every live order: quantity × rate, minus any coupon that actually qualified'},
    {f:'Coupon discount',s:'Coupon rules in this app',h:'Percentage of gross — but only if gross reaches the code’s minimum order value'},
    {f:'Collected',s:'Payments',h:'Prepaid orders in full, plus the advance taken on each COD order'},
    {f:'Still to collect',s:'Payments + courier',h:'For COD orders only: net minus the advance already taken'},
    {f:'Stage of an order',s:'This app',h:'Moves one step at a time; a COD order is blocked at packing without its 20% advance'},
    {f:'Stock movement',s:'Inventory',h:'Reserved when the order is confirmed, released when it is cancelled'},
    {f:'Loyalty points',s:'This app',h:'2% of net, earned only when the order reaches Delivered'},
    {f:'Points owed',s:'This app',h:'Everything earned minus everything redeemed — a real liability, not a guess'},
    {f:'Abandoned carts',s:'This app (your storefront)',h:'Carts with no order against them, aged in days'},
    {f:'Customer record',s:'CRM',h:'This app writes the order; CRM reads it and works out the customer’s worth'}],
  wiringIn:[
    {from:'Catalog',what:'The item, its name and its selling price'},
    {from:'Inventory',what:'Whether there is stock to promise'},
    {from:'Payments',what:'Whether the money actually arrived'},
    {from:'Logistics',what:'The courier, the AWB and the delivery outcome'},
    {from:'CRM',what:'Who the customer is, and what they have bought before'}]
};
