/* Format B — Vastrangam (ethnic-wear D2C). Real SKUs, real prices, real COD behaviour. */
var CONFIG={
  id:'d2c_vastrangam', name:'D2C Sales', company:'Vastrangam', fy:'FY 2026-27', prefix:'VS-',
  storeName:'vastrangam.com',
  tagline:'Your own website, cart to doorstep — coupons, part-paid COD, loyalty and cart recovery.',
  about:'Every order from vastrangam.com in one pipeline: New → Confirmed → Packed → Shipped → Delivered. This is the channel worth protecting — no marketplace commission, no 14% return rate, and the customer is yours rather than the platform’s. Coupons only apply above their minimum order value, so a festive code can never quietly cut a ₹899 dupatta bill. A cash-on-delivery order cannot be packed until it carries a 20% advance, which is the cheapest way there is to stop refused deliveries on ethnic wear. Loyalty points are earned on delivery, never on order. And every abandoned cart is listed with its age, because a saree left in a cart three days ago is the cheapest sale in the business to win back.',
  ph:{cust:'e.g. Ananya Rao'},
  items:[
    {sku:'VS-KUR-01',name:'Cotton kurta set',rate:1799},
    {sku:'VS-SAR-02',name:'Banarasi saree',rate:4999},
    {sku:'VS-DUP-03',name:'Zari dupatta',rate:899},
    {sku:'VS-LEH-04',name:'Bridal lehenga',rate:12999}],
  coupons:[
    {code:'FIRST10',pct:10,min:1500},
    {code:'FESTIVE15',pct:15,min:3000},
    {code:'TROUSSEAU20',pct:20,min:6000}],
  orders:[
    {id:'VS-501',cust:'Ananya Rao',date:'2026-07-12',sku:'VS-SAR-02',name:'Banarasi saree',qty:1,rate:4999,status:'delivered',pay:'prepaid',adv:0,coupon:'FIRST10'},
    {id:'VS-502',cust:'Rohit Verma',date:'2026-07-18',sku:'VS-SAR-02',name:'Banarasi saree',qty:1,rate:4999,status:'shipped',pay:'cod',adv:1200,coupon:''},
    {id:'VS-503',cust:'Sneha Iyer',date:'2026-07-27',sku:'VS-KUR-01',name:'Cotton kurta set',qty:2,rate:1799,status:'packed',pay:'prepaid',adv:0,coupon:'FESTIVE15'},
    {id:'VS-504',cust:'Karan Mehta',date:'2026-07-29',sku:'VS-DUP-03',name:'Zari dupatta',qty:1,rate:899,status:'confirmed',pay:'cod',adv:100,coupon:''},
    {id:'VS-505',cust:'Divya Nair',date:'2026-07-30',sku:'VS-SAR-02',name:'Banarasi saree',qty:1,rate:4999,status:'new',pay:'prepaid',adv:0,coupon:'FIRST10'},
    {id:'VS-506',cust:'Ananya Rao',date:'2026-06-22',sku:'VS-LEH-04',name:'Bridal lehenga',qty:1,rate:12999,status:'delivered',pay:'prepaid',adv:0,coupon:'FESTIVE15'},
    {id:'VS-507',cust:'Meera Joshi',date:'2026-07-31',sku:'VS-KUR-01',name:'Cotton kurta set',qty:1,rate:1799,status:'new',pay:'cod',adv:0,coupon:''},
    {id:'VS-508',cust:'Rohit Verma',date:'2026-07-09',sku:'VS-SAR-02',name:'Banarasi saree',qty:1,rate:4999,status:'cancelled',pay:'prepaid',adv:0,coupon:''},
    {id:'VS-509',cust:'Tanvi Shah',date:'2026-07-05',sku:'VS-DUP-03',name:'Zari dupatta',qty:1,rate:899,status:'delivered',pay:'prepaid',adv:0,coupon:'FESTIVE15'}],
  carts:[
    {cust:'Priya Kulkarni',item:'Banarasi saree',sku:'VS-SAR-02',value:4999,days:3},
    {cust:'Amit Ranjan',item:'Cotton kurta set',sku:'VS-KUR-01',value:1799,days:12},
    {cust:'Nisha Gupta',item:'Bridal lehenga',sku:'VS-LEH-04',value:12999,days:6}],
  spent:{'Ananya Rao':100},
  codNote:'In ethnic wear a high COD share is expensive. A refused parcel costs the courier fee both ways and the piece comes back creased. The 20% advance rule below is the cheapest defence there is — and the customer who pays it almost always accepts the parcel.',
  cartNote:'A saree left in a cart this week is still warm — she remembers the wedding she wanted it for. After a week the occasion has usually passed, and chasing it costs more than it returns. That is the whole reason the seven-day line exists.',
  wiring:[
    {f:'Net sales',s:'This app (it owns the order)',h:'Every live order: quantity × rate, minus any coupon that actually qualified'},
    {f:'Coupon discount',s:'Coupon rules in this app',h:'Percentage of gross — but only if gross reaches the code’s minimum order value'},
    {f:'Collected',s:'Payments (UPI, gateway or cash)',h:'Prepaid orders in full, plus the advance taken on each COD order'},
    {f:'Still to collect',s:'Payments + courier',h:'For COD orders only: net minus the advance already taken'},
    {f:'Stage of an order',s:'This app',h:'Moves one step at a time; a COD order is blocked at packing without its 20% advance'},
    {f:'Stock movement',s:'Inventory &amp; Catalog (fabric and finished)',h:'Reserved when the order is confirmed, released when it is cancelled'},
    {f:'Loyalty points',s:'This app',h:'2% of net, earned only when the order reaches Delivered'},
    {f:'Points owed',s:'This app',h:'Everything earned minus everything redeemed — a real liability, not a guess'},
    {f:'Abandoned carts',s:'This app (vastrangam.com)',h:'Carts with no order against them, aged in days'},
    {f:'Customer record',s:'CRM',h:'This app writes the order; CRM reads it and works out the buyer’s worth'}],
  wiringIn:[
    {from:'Catalog',what:'The design, its name and its website price'},
    {from:'Inventory',what:'Whether a finished piece is actually in stock to promise'},
    {from:'Payments',what:'Whether the UPI or gateway payment landed'},
    {from:'Logistics',what:'The courier, the AWB and whether it was accepted at the door'},
    {from:'CRM',what:'Who the buyer is, and what she has bought before'}]
};
