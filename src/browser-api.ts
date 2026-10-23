import {seed,read,mutate} from './demo-data.mjs';
import {asset,base} from './image';
export let state:any;
let database:IDBDatabase|null=null;
let queue=Promise.resolve();
export let storageWarning='';
const namespace='gameplanet-public-demo-v1:'+base;
export function resolveAssets(value:any):any{if(typeof value==='string')return asset(value);if(Array.isArray(value))return value.map(resolveAssets);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,resolveAssets(v)]));return value;}
async function save(next:any){if(!database){try{localStorage.setItem(namespace,JSON.stringify(next));}catch{throw Error('Браузер не смог сохранить данные. Разрешите хранилище сайта или сбросьте демо.');}return;}await new Promise<void>((resolve,reject)=>{const t=database!.transaction('data','readwrite');t.objectStore('data').put(next,'state');t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);});}
function changed(){window.dispatchEvent(new Event('demo:changed'));window.dispatchEvent(new Event('store:refresh'));}
export async function initialize(){
 try{database=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open(namespace,1);request.onupgradeneeded=()=>request.result.createObjectStore('data');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('Хранилище занято другой вкладкой'));});state=await new Promise((resolve,reject)=>{const request=database!.transaction('data').objectStore('data').get('state');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}catch{database=null;storageWarning='Расширенное хранилище недоступно. Для крупных фотографий разрешите хранение данных сайта.';try{state=JSON.parse(localStorage.getItem(namespace)||'null');}catch{state=null;}}
 if(state?.version!==1){state=seed();try{await save(state);}catch{storageWarning='Сохранение в браузере недоступно. Изменения не удастся записать.';}}
 installApi();installDownloads();
}
export async function reset(){return enqueue(async()=>{const next=seed();await save(next);state=next;changed();window.dispatchEvent(new Event('store:settings'));});}
function enqueue(fn:()=>Promise<any>){const task=queue.then(fn);queue=task.catch(()=>{});return task;}
export async function action(name:string,data:any){return enqueue(async()=>{const next=structuredClone(state);const result=mutate(next,name,data);await save(next);state=next;changed();return resolveAssets(result);});}
function installApi(){const original=window.fetch.bind(window);window.fetch=async(input:any,options:any={})=>{const url=new URL(typeof input==='string'?input:input.url,location.href);if(url.origin!==location.origin||!url.pathname.startsWith('/api/'))return original(input,options);try{
  let result;const path=url.pathname.slice(5);
  if(path==='action'){const body=JSON.parse(options.body);result=await action(body.action,body.data);}
  else if(path==='upload'){const file=options.body.get('file');if(!(file instanceof File)||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('Выберите JPEG, PNG или WebP до 5 МБ');const url=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(Error('Не удалось прочитать фотографию'));reader.readAsDataURL(file);});result={url};}
  else result=read(state,path,Object.fromEntries(url.searchParams));
  return Response.json(resolveAssets(result));
 }catch(error){return Response.json({error:(error as Error).message},{status:400});}};}
function csv(rows:any[][]){return '\uFEFF'+rows.map(row=>row.map(value=>'"'+String(value??'').replaceAll('"','""')+'"').join(';')).join('\r\n');}
function installDownloads(){document.addEventListener('click',event=>{const a=(event.target as HTMLElement).closest('a');if(!a)return;const href=a.getAttribute('href')||'';if(!href.startsWith('/api/admin/'))return;event.preventDefault();const url=new URL(href,location.origin);let rows:any[][],filename:string;
 if(url.pathname.endsWith('products.csv')){filename='demo-products.csv';rows=[['Название','Артикул','Цена, ₽','Скидка, ₽','Остаток','Резерв','Категории','Новинка'],...state.products.flatMap((p:any)=>p.variants.map((v:any)=>[p.name,v.sku,v.price/100,v.discount/100,v.stock,v.reserved,p.categoryIds.map((id:string)=>state.categories.find((c:any)=>c.id===id)?.name).join(', '),p.isNew?'Да':'Нет']))];}
 else{filename='demo-finance.csv';const f=read(state,'admin/finance',Object.fromEntries(url.searchParams));rows=[['Показатель','Сумма, ₽'],...Object.entries({Выручка:f.revenue,Возвраты:f.refunds,Себестоимость:f.cost,Комиссии:f.fees,Расходы:f.expenses,'Операционная прибыль':f.operatingProfit}).map(([name,value])=>[name,Number(value)/100])];}
 const blob=URL.createObjectURL(new Blob([csv(rows)],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=blob;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(blob),1000);
 });}
