import {useSyncExternalStore} from 'react';
const subscribe=(fn:()=>void)=>{window.addEventListener('hashchange',fn);window.addEventListener('demo:route',fn);return()=>{window.removeEventListener('hashchange',fn);window.removeEventListener('demo:route',fn);};};
export const route=()=>location.hash.slice(1)||'/';
export function useRoute(){return useSyncExternalStore(subscribe,route);}
export function go(href:string,replace=false){const path=href.startsWith('/')?href:'/';if(replace){history.replaceState(null,'','#'+path);window.dispatchEvent(new Event('demo:route'));}else location.hash=path;window.scrollTo(0,0);}
const router={push:(href:string)=>go(href),replace:(href:string)=>go(href,true),refresh:()=>window.dispatchEvent(new Event('demo:route'))};
export const useRouter=()=>router;
export function usePathname(){return useRoute().split('?')[0].split('#')[0];}
export function useSearchParams(){return new URLSearchParams(useRoute().split('?')[1]||'');}
export default function Link({href,children,...props}:any){return <a href={typeof href==='string'&&href.startsWith('/')?'#'+href:href} {...props}>{children}</a>;}
export function installForms(){document.addEventListener('submit',e=>{const form=e.target as HTMLFormElement;const action=form.getAttribute('action');if(!action?.startsWith('/'))return;e.preventDefault();go(action+'?'+new URLSearchParams(new FormData(form) as any));});}
