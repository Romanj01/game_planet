'use client';
import {createContext,useContext,useEffect,useState,useCallback} from 'react';
import {useRouter} from 'next/navigation';
import {defaults} from '@/lib/ui-data';
import type {Category,StoreConfig,StoreUser} from '@/lib/store-types';
import {Icon} from './icons';
export async function readApi(path:string){const r=await fetch(`/api/${path}`,{cache:'no-store'});const body=await r.json();if(!r.ok)throw new Error(body.error||'Не удалось загрузить данные');return body;}
export async function storeAction(action:string,data?:unknown){const r=await fetch('/api/action',{method:'POST',headers:{'Content-Type':'application/json','X-Store-Action':'1'},body:JSON.stringify({action,data})});const body=await r.json();if(!r.ok)throw new Error(body.error||'Не удалось сохранить изменения');window.dispatchEvent(new Event('store:refresh'));return body;}
type State={config:StoreConfig;categories:Category[];user:StoreUser|null;count:number;cart:Record<string,number>;favorites:string[];pending:boolean;notify:(text:string,error?:boolean)=>void;refresh:()=>Promise<void>;add:(variantId:string)=>Promise<void>;favorite:(productId:string)=>Promise<void>};
const Context=createContext<State|null>(null);
export function StoreProvider({children,initialConfig,initialCategories}:{children:React.ReactNode;initialConfig:StoreConfig;initialCategories:Category[]}){
  const router=useRouter();const[config,setConfig]=useState(initialConfig),[user,setUser]=useState<StoreUser|null>(null),[cart,setCart]=useState<Record<string,number>>({}),[favorites,setFavorites]=useState<string[]>([]),[pending,setPending]=useState(false),[toast,setToast]=useState<{text:string;error:boolean}|null>(null);
  const notify=useCallback((text:string,error=false)=>setToast({text,error}),[]);
  const refresh=useCallback(async()=>{const me=await readApi('me');setUser(me.user);if(me.user){const [c,f]=await Promise.all([readApi('cart'),readApi('favorites')]);setCart(Object.fromEntries(c.map((i:{variantId:string;quantity:number})=>[i.variantId,i.quantity])));setFavorites(f.map((i:{productId:string})=>i.productId));}else{setCart({});setFavorites([]);}},[]);
  useEffect(()=>{refresh().catch(()=>{});const listener=()=>{refresh().catch(()=>{});};window.addEventListener('store:refresh',listener);return()=>window.removeEventListener('store:refresh',listener);},[refresh]);
  useEffect(()=>{const listener=()=>{readApi('settings').then(s=>setConfig(s.settings)).catch(()=>{});router.refresh();};window.addEventListener('store:settings',listener);return()=>window.removeEventListener('store:settings',listener);},[router]);
  useEffect(()=>setConfig(initialConfig),[initialConfig]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(null),4500);return()=>clearTimeout(t);},[toast]);
  async function add(variantId:string){if(!user){router.push('/login');return;}if(pending)return;setPending(true);try{await storeAction('cart',{variantId,quantity:(cart[variantId]||0)+1});await refresh();notify('Товар добавлен в корзину');}catch(e){notify((e as Error).message,true);}finally{setPending(false);}}
  async function favorite(productId:string){if(!user){router.push('/login');return;}try{await storeAction('favorite',{productId,enabled:!favorites.includes(productId)});await refresh();}catch(e){notify((e as Error).message,true);}}
  return <Context.Provider value={{config,categories:initialCategories,user,count:Object.values(cart).reduce((a,b)=>a+b,0),cart,favorites,pending,notify,refresh,add,favorite}}><div className="store-shell" style={{'--accent':config.buttonColor,'--ink':config.primary,'--paper':config.secondary} as React.CSSProperties}>{children}{toast&&<div className={`store-toast ${toast.error?'error':''}`} role={toast.error?'alert':'status'}>{toast.text}<button onClick={()=>setToast(null)} aria-label="Закрыть уведомление"><Icon name="close" size={18}/></button></div>}</div></Context.Provider>;
}
export function useStore(){const value=useContext(Context);if(!value)throw new Error('StoreProvider is required');return value;}
