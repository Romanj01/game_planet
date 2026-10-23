import {importRows} from './csv.mjs';
export const uid=()=>crypto.randomUUID();
const now=()=>new Date().toISOString();
const dateAgo=n=>new Date(Date.now()-n*86400000).toISOString();
const fail=message=>{throw new Error(message);};
const money=n=>Number.isSafeInteger(n)&&n>=0;
const quantity=n=>Number.isSafeInteger(n)&&n>=0;
export {seed} from './initial-state.mjs';
export function productView(s,p){const category=s.categories.find(c=>c.id===p.categoryId)||null;return {...p,category,categoryTags:(p.categoryIds||[]).map(categoryId=>({categoryId,category:s.categories.find(c=>c.id===categoryId)})).filter(t=>t.category),variants:p.variants.map(v=>({...v,available:Math.max(0,v.stock-v.reserved)})),minPrice:Math.min(...p.variants.map(v=>v.price-v.discount))};}
export function catalog(s,query={},slug){
 const categories=s.categories,category=categories.find(c=>c.slug===slug||c.id===slug||c.id===query.category),visible=s.products.filter(p=>p.published&&!p.archived);
 const descendantIds=id=>[id,...categories.filter(c=>c.parentId===id).flatMap(c=>descendantIds(c.id))];
 const belongs=(p,id)=>descendantIds(id).some(cid=>p.categoryIds.includes(cid));
 let products=visible.filter(p=>(!category||belongs(p,category.id))&&(!query.q||(p.name+' '+p.description+' '+p.variants.map(v=>v.sku).join(' ')).toLocaleLowerCase().includes(query.q.toLocaleLowerCase()))&&(query.collection!=='new'||p.isNew));
 products=products.map(p=>productView(s,p)).filter(p=>(!Number(query.min)||p.minPrice>=Number(query.min))&&(!Number(query.max)||p.minPrice<=Number(query.max)));
 products.sort(query.sort==='price'?(a,b)=>a.minPrice-b.minPrice:query.sort==='name'?(a,b)=>a.name.localeCompare(b.name,'ru'):(a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
 const total=products.length,page=Math.max(1,Math.min(Number(query.page)||1,Math.ceil(total/12)||1));
 return {products:products.slice((page-1)*12,page*12),total,page,categories,category,counts:Object.fromEntries(categories.map(c=>[c.id,visible.filter(p=>belongs(p,c.id)).length])),allTotal:visible.length};
}
export function finance(s,query={}){
 const inside=d=>(!query.from||d.slice(0,10)>=query.from)&&(!query.to||d.slice(0,10)<=query.to);
 const orders=s.orders.filter(o=>o.payment.status==='SUCCEEDED'&&inside(o.paidAt||o.createdAt));
 const refundRows=s.orders.flatMap(o=>o.payment.refunds||[]).filter(r=>inside(r.createdAt));
 const expenseRows=s.expenses.filter(e=>inside(e.occurredAt)),operatingExpenses=expenseRows.filter(e=>e.category!=='PURCHASE');
 const sum=(rows,key)=>rows.reduce((v,r)=>v+r[key],0),revenue=sum(orders,'total'),refunds=sum(refundRows,'amount'),fees=orders.reduce((n,o)=>n+o.payment.fee,0),cost=orders.reduce((n,o)=>n+o.items.reduce((m,i)=>m+i.cost*(i.quantity-i.returned),0),0),expenses=sum(operatingExpenses,'amount');
 const days={},months={},products={},categories={},expenseCategories={};
 for(const o of orders){const day=(o.paidAt||o.createdAt).slice(0,10),month=day.slice(0,7);days[day]??={day,revenue:0,orders:0};days[day].revenue+=o.total;days[day].orders++;months[month]??={month,profit:0};months[month].profit+=o.total-o.payment.fee-o.items.reduce((n,i)=>n+i.cost*(i.quantity-i.returned),0);
  for(const i of o.items){for(const [group,name] of [[products,i.name],[categories,s.categories.find(c=>c.id===i.categoryId)?.name||'Без категории']]){group[name]??={name,quantity:0,revenue:0,cost:0};group[name].quantity+=i.quantity;group[name].revenue+=i.price*i.quantity;group[name].cost+=i.cost*(i.quantity-i.returned);}}}
 for(const e of operatingExpenses){expenseCategories[e.category]??={category:e.category,amount:0};expenseCategories[e.category].amount+=e.amount;const month=e.occurredAt.slice(0,7);months[month]??={month,profit:0};months[month].profit-=e.amount;}
 for(const r of refundRows){const month=r.createdAt.slice(0,7);months[month]??={month,profit:0};months[month].profit-=r.amount;}
 return {revenue,refunds,fees,cost,expenses,grossProfit:revenue-refunds-cost,operatingProfit:revenue-refunds-cost-fees-expenses,sales:orders.length,average:orders.length?Math.round(revenue/orders.length):0,days:Object.values(days).sort((a,b)=>a.day.localeCompare(b.day)),months:Object.values(months).sort((a,b)=>a.month.localeCompare(b.month)),products:Object.values(products),categories:Object.values(categories),expenseCategories:Object.values(expenseCategories),expenseRows,refundRows};
}
export function read(s,path,query={}){
 if(path==='settings')return {settings:s.settings,shipping:s.shipping.filter(x=>x.enabled),integrations:{telegram:false,yookassa:true,demo:true}};
 if(path==='me')return {user:s.users[0]};
 if(path==='catalog')return catalog(s,query);
 if(path==='cart')return Object.entries(s.cart).map(([variantId,quantity])=>{const p=s.products.find(p=>p.variants.some(v=>v.id===variantId));if(!p)return null;return {variantId,quantity,variant:{...p.variants.find(v=>v.id===variantId),product:productView(s,p)}};}).filter(Boolean);
 if(path==='orders')return s.orders.filter(o=>o.userId===s.users[0].id);
 if(path==='addresses')return s.addresses;
 if(path==='favorites')return s.favorites.map(productId=>({productId}));
 if(path==='admin/products')return s.products.map(p=>productView(s,p));
 if(path==='admin/categories')return s.categories;
 if(path==='admin/orders')return s.orders;
 if(path==='admin/inventory')return {variants:s.products.flatMap(p=>p.variants.map(v=>({...v,product:{name:p.name}}))),movements:s.movements};
 if(path==='admin/finance')return finance(s,query);
 if(path==='admin/employees')return s.users;
 if(path==='admin/shipping')return s.shipping;
 if(path==='admin/audit')return s.audit;
 fail('Этот раздел недоступен в демонстрации.');
}
const transitions={CREATED:['AWAITING_PAYMENT','CANCELED'],AWAITING_PAYMENT:['CANCELED','ATTENTION'],PAYMENT_REVIEW:['CANCELED','ATTENTION'],PAID:['AWAITING_ASSEMBLY','ASSEMBLING','ATTENTION'],AWAITING_ASSEMBLY:['ASSEMBLING','ATTENTION'],ASSEMBLING:['ASSEMBLED','ATTENTION'],ASSEMBLED:['READY','SHIPPED','ATTENTION'],READY:['COMPLETED','ATTENTION'],SHIPPED:['DELIVERED','ATTENTION'],DELIVERED:['COMPLETED','ATTENTION'],COMPLETED:['ATTENTION'],CANCELED:['ATTENTION'],REFUND:['ATTENTION'],ATTENTION:[]};
export function mutate(s,action,d={}){
 const variant=id=>{const p=s.products.find(p=>p.variants.some(v=>v.id===id));return p?.variants.find(v=>v.id===id)||fail('Вариант товара не найден');};
 const order=id=>s.orders.find(o=>o.id===id)||fail('Заказ не найден');
 const history=(o,status,note)=>{o.status=status;o.history.push({id:uid(),createdAt:now(),status,note});};
 const release=o=>{if(!o.fulfilled){for(const i of o.items)variant(i.variantId).reserved=Math.max(0,variant(i.variantId).reserved-i.quantity);}};
 let result={ok:true};
 switch(action){
 case 'cart':{const v=variant(d.variantId);if(!quantity(d.quantity)||d.quantity>v.stock-v.reserved)fail('Недостаточно товара на складе');if(d.quantity)s.cart[v.id]=d.quantity;else delete s.cart[v.id];break;}
 case 'favorite':if(!s.products.some(p=>p.id===d.productId))fail('Товар не найден');s.favorites=s.favorites.filter(id=>id!==d.productId);if(d.enabled)s.favorites.push(d.productId);break;
 case 'profile':s.users[0]={...s.users[0],email:d.email||null,notifications:!!d.notifications};break;
 case 'logout':break;
 case 'botLink':fail('В демонстрации Telegram не подключён.');break;
 case 'address':if(d.remove)s.addresses=s.addresses.filter(a=>a.id!==d.id);else{if(!d.label?.trim()||!d.address?.trim())fail('Укажите название и адрес');s.addresses.push({id:uid(),label:d.label,address:d.address});}break;
 case 'checkout':{
  const existing=s.orders.find(o=>d.key&&o.key===d.key);if(existing)return existing;
  const method=s.shipping.find(m=>m.id===d.shippingMethodId&&m.enabled);if(!method)fail('Выберите способ получения');
  if(method.type==='DELIVERY'&&!d.address?.trim())fail('Укажите адрес доставки');
  if(!d.contact?.trim())fail('Укажите контакт для заказа');
  const cart=read(s,'cart');if(!cart.length)fail('Корзина пуста');
  const items=cart.map(c=>{const v=variant(c.variantId),p=s.products.find(p=>p.variants.includes(v));if(!p.published||p.archived||c.quantity>v.stock-v.reserved)fail('Наличие товара изменилось');return {id:uid(),variantId:v.id,sku:v.sku,name:p.name,quantity:c.quantity,price:v.price-v.discount,cost:v.cost,categoryId:p.categoryId,returned:0};});
  for(const i of items)variant(i.variantId).reserved+=i.quantity;
  const o={id:uid(),key:d.key,number:String(Math.max(1048,...s.orders.map(o=>Number(o.number)))+1),userId:s.users[0].id,user:{...s.users[0]},status:'AWAITING_PAYMENT',createdAt:now(),items,shipping:method.price,shippingName:method.name,shippingType:method.type,address:method.type==='DELIVERY'?d.address:'',contact:d.contact,total:items.reduce((n,i)=>n+i.price*i.quantity,0)+method.price,paymentMethod:d.paymentMethod==='SBP'?'SBP':'YOOKASSA',payment:{id:uid(),status:'PENDING',refunded:0,refunds:[],fee:0},fulfilled:false,history:[]};history(o,'AWAITING_PAYMENT','Демо-заказ создан. Реальная оплата не выполняется.');s.orders.unshift(o);s.cart={};result=o;break;
 }
 case 'pay':{const o=order(d.id);if(o.status!=='AWAITING_PAYMENT')fail('Этот заказ уже обработан');o.payment.status='SUCCEEDED';o.payment.fee=Math.round(o.total*.035);o.paidAt=now();history(o,'PAID','Демо-оплата подтверждена. Деньги не списывались.');result={url:null};break;}
 case 'refreshPayment':break;
 case 'claim':{const o=order(d.id);if(o.status!=='AWAITING_PAYMENT')fail('Заказ уже обработан');history(o,'PAYMENT_REVIEW','Пример ручной проверки оплаты');break;}
 case 'manual':{const o=order(d.id);if(o.status!=='PAYMENT_REVIEW')fail('Заказ не ожидает проверки');if(d.action==='approve'){o.payment.status='SUCCEEDED';o.paidAt=now();history(o,'PAID','Ручная демо-оплата подтверждена');}else history(o,'AWAITING_PAYMENT',d.reason||'Демо-перевод отклонён');break;}
 case 'status':{
  const o=order(d.id);if(!transitions[o.status]?.includes(d.status))fail('Этот переход статуса недоступен');
  if(['SHIPPED','READY','COMPLETED'].includes(d.status)){if(o.payment.status!=='SUCCEEDED')fail('Сначала подтвердите демо-оплату');if(d.status==='SHIPPED'&&(o.shippingType!=='DELIVERY'||!d.tracking?.trim()))fail('Для доставки укажите демонстрационный трек-номер');if(d.status==='READY'&&o.shippingType!=='PICKUP')fail('Для доставки выберите «Отправлен»');if(!o.fulfilled){for(const i of o.items){const v=variant(i.variantId);if(v.stock<i.quantity)fail('Недостаточно товара для выдачи');v.stock-=i.quantity;v.reserved=Math.max(0,v.reserved-i.quantity);s.movements.unshift({id:uid(),variantId:v.id,type:'SALE',quantity:-i.quantity,createdAt:now(),reason:'Демо-заказ №'+o.number});}o.fulfilled=true;}}
  if(d.status==='CANCELED')release(o);if(d.tracking)o.tracking=d.tracking;history(o,d.status,'Статус изменён в демо-админке');break;
 }
 case 'refund':case 'manualRefund':{const o=order(d.id);if(o.payment.refunds.some(r=>d.key&&r.key===d.key))break;if(o.payment.status!=='SUCCEEDED'||!money(d.amount)||d.amount===0||d.amount>o.total-o.payment.refunded)fail('Проверьте сумму возврата');if(!d.reason?.trim())fail('Укажите причину');o.payment.refunded+=d.amount;o.payment.refunds.push({id:uid(),key:d.key,amount:d.amount,reason:d.reason,status:'SUCCEEDED',createdAt:now()});if(o.payment.refunded===o.total){release(o);history(o,'REFUND','Полный демо-возврат. Реальные деньги не переводились.');}break;}
 case 'returnStock':{const o=s.orders.find(o=>o.items.some(i=>i.id===d.itemId)),i=o?.items.find(i=>i.id===d.itemId);if(!i||!o.fulfilled)fail('Возврат доступен после выдачи или отправки');if(!quantity(d.quantity)||d.quantity===0||d.quantity>i.quantity-i.returned)fail('Проверьте количество');i.returned+=d.quantity;variant(i.variantId).stock+=d.quantity;s.movements.unshift({id:uid(),variantId:i.variantId,type:'RETURN',quantity:d.quantity,reason:d.reason,createdAt:now()});break;}
 case 'product':{
  if(!d.name?.trim()||!d.variants?.length)fail('Укажите название и варианты');const old=s.products.find(p=>p.id===d.id),id=old?.id||uid();
  if(!Array.isArray(d.categoryIds)||d.categoryIds.some(id=>!s.categories.some(c=>c.id===id)))fail('Категория не найдена');
  const skus=new Set();const variants=d.variants.map(v=>{if(!v.sku?.trim()||skus.has(v.sku)||s.products.some(p=>p.id!==id&&p.variants.some(x=>x.sku===v.sku)))fail('Артикулы должны быть уникальны');skus.add(v.sku);if(!money(v.price)||!money(v.cost)||!money(v.discount)||v.discount>v.price)fail('Проверьте цены и скидки');const prev=old?.variants.find(x=>x.id===v.id);if(!prev&&!quantity(v.initialStock))fail('Некорректный начальный остаток');return {...v,id:prev?.id||uid(),stock:prev?.stock??v.initialStock,reserved:prev?.reserved??0};});
  const p={...old,...d,id,categoryIds:[...new Set(d.categoryIds)],categoryId:d.categoryIds[0]||null,variants,createdAt:old?.createdAt||now(),images:(d.images||[]).map(i=>({...i,id:uid()}))};if(old)s.products=s.products.map(x=>x.id===id?p:x);else s.products.unshift(p);break;
 }
 case 'category':{if(!d.name?.trim())fail('Укажите название категории');const old=s.categories.find(c=>c.id===d.id),id=old?.id||uid();let parent=d.parentId;const seen=new Set([id]);while(parent){if(seen.has(parent))fail('Категории не могут быть вложены сами в себя');seen.add(parent);const c=s.categories.find(c=>c.id===parent);if(!c)fail('Родительская категория не найдена');parent=c.parentId;}const c={...old,...d,id,slug:old?.slug||id,parentId:d.parentId||null};if(old)s.categories=s.categories.map(x=>x.id===id?c:x);else s.categories.push(c);break;}
 case 'removeCategory':{const c=s.categories.find(c=>c.id===d.id);if(!c)fail('Категория не найдена');s.categories=s.categories.filter(c=>c.id!==d.id).map(x=>x.parentId===d.id?{...x,parentId:c.parentId}:x);for(const p of s.products){p.categoryIds=p.categoryIds.filter(id=>id!==d.id);p.categoryId=p.categoryIds[0]||null;}break;}
 case 'inventory':{const v=variant(d.variantId);if(!Number.isSafeInteger(d.quantity)||!money(d.unitCost)||v.stock+d.quantity<v.reserved)fail('Остаток не может стать меньше резерва');if(!d.reason?.trim())fail('Укажите причину');v.stock+=d.quantity;if(d.purchase)v.cost=d.unitCost;s.movements.unshift({id:uid(),...d,type:d.purchase?'PURCHASE':'ADJUSTMENT',createdAt:now()});break;}
 case 'expense':if(!money(d.amount)||!d.amount||!d.description?.trim())fail('Укажите сумму и описание');s.expenses.unshift({...d,id:uid(),occurredAt:now()});break;
 case 'shipping':{if(!d.name?.trim()||!money(d.price))fail('Проверьте название и цену');const id=d.id||uid();const old=s.shipping.find(x=>x.id===id);if(old)Object.assign(old,d);else s.shipping.push({...d,id});break;}
 case 'settings':s.settings={...s.settings,...d};break;
 case 'employee':{const u=s.users.find(u=>u.telegramId===d.telegramId);if(!u||u.role==='OWNER')fail('Владелец демо всегда доступен');Object.assign(u,{role:d.role,permissions:d.permissions,blocked:!!d.blocked});break;}
 case 'importPreview':return {rows:importRows(d.text)};
 case 'importCatalog':{for(const row of importRows(d.text)){let p=s.products.find(p=>p.variants.some(v=>v.sku===row.sku));if(p){const v=p.variants.find(v=>v.sku===row.sku);if(row.stock<v.reserved)fail('Остаток меньше резерва: '+row.sku);p.name=row.name;Object.assign(v,{price:row.price,discount:row.discount,stock:row.stock});}else{const categoryIds=row.categories.map(name=>s.categories.find(c=>c.name===name)?.id).filter(Boolean);s.products.push({id:uid(),name:row.name,description:'Товар добавлен через демо-импорт. Добавьте описание и фотографию в редакторе.',categoryIds,categoryId:categoryIds[0]||null,images:[],attributes:{},published:false,archived:false,isNew:false,createdAt:now(),variants:[{id:uid(),name:'Основной',sku:row.sku,price:row.price,discount:row.discount,cost:0,stock:row.stock,reserved:0}]});}}break;}
 default:fail('Это действие не включено в демонстрацию.');
 }
 if(!['cart','favorite','refreshPayment','logout'].includes(action))s.audit.unshift({id:uid(),createdAt:now(),action,actorId:'Демо-владелец',entityId:d.id||d.variantId||'store',detail:JSON.parse(JSON.stringify(d,(_key,value)=>typeof value==='string'&&value.startsWith('data:image/')?'[фотография в браузере]':value))});
 s.audit=s.audit.slice(0,200);return result;
}
