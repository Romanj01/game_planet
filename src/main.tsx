import {useEffect,useState,Component} from 'react';
import {createRoot} from 'react-dom/client';
import {initialize,state,reset,resolveAssets,storageWarning} from './browser-api';
import {catalog,productView} from './demo-data.mjs';
import Link,{useRoute,installForms,go} from './router';
import {StoreProvider} from './components/store/provider';
import {SiteHeader,SiteFooter} from './components/store/gameplanet-shell';
import {Home} from './components/store/gameplanet-home';
import {CatalogPage} from './components/store/catalog-page';
import {ProductDetail} from './components/store/product-detail';
import {ProductCard} from './components/store/product-card';
import {FavoritesPage} from './components/store/favorites-page';
import {Icon} from './components/store/icons';
import About from './components/gameplanet-about';
import {Information} from './components/information';
import Shop from './components/shop';
import './fonts.css';
import './base.css';
import './demo.css';
import './gameplanet.css';

function App(){const current=useRoute(),[revision,setRevision]=useState(0),[resetting,setResetting]=useState(false),[confirmReset,setConfirmReset]=useState(false),[resetError,setResetError]=useState('');const [path,search='']=current.split('?'),parts=path.split('/').filter(Boolean),view=parts[0]||'store';
 useEffect(()=>{const change=()=>setRevision(n=>n+1);window.addEventListener('demo:changed',change);return()=>window.removeEventListener('demo:changed',change);},[]);
 useEffect(()=>{document.title=state.settings.name+' — демо магазина';const link=document.querySelector<HTMLLinkElement>('link[rel="icon"]');if(link)link.href=resolveAssets(state.settings.favicon||'/assets/gameplanet-favicon.svg');},[revision]);
 const config=resolveAssets(state.settings),categories=resolveAssets(state.categories),products=resolveAssets(state.products.filter((p:any)=>p.published&&!p.archived).map((p:any)=>productView(state,p)));
 let content;
 if(view==='store')content=<Home config={config} categories={categories} products={products.slice(0,8)}/>;
 else if(view==='catalog')content=<CatalogPage key={current+revision} query={Object.fromEntries(new URLSearchParams(search))} categorySlug={parts[1]}/>;
 else if(view==='product'){const p=products.find((p:any)=>p.id===parts[1]);content=p?<main className="site-width product-detail-page"><div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><Link href="/catalog">Каталог</Link><span>/</span><span>{p.name}</span></div><ProductDetail key={p.id} product={p}/><section className="related-products"><div className="section-heading"><h2>Ещё на полках</h2><Link href="/catalog">Весь каталог</Link></div><div className="store-product-grid">{products.filter((x:any)=>x.id!==p.id).slice(0,4).map((x:any)=><ProductCard key={x.id} product={x}/>)}</div></section></main>:<Missing/>;}
 else if(view==='favorites')content=<FavoritesPage products={products}/>;
 else if(view==='about')content=<About/>;
 else if(view==='contacts'||view==='delivery'||view==='trade-in')content=<Information section={view}/>;
 else if(['admin','cart','account','delivery'].includes(view)||view==='login')content=<Shop key={path} initialView={view==='login'?'account':view} initialSection={parts[1]||''}/>;
 else content=<Missing/>;
 return <StoreProvider initialConfig={config} initialCategories={categories}><aside className="demo-bar" aria-label="Демонстрация"><div className="site-width demo-bar-inner"><span><b>Демо GamePlanet</b><small>Изменения видны только в этом браузере. Без реальных платежей.</small></span><nav><Link href="/">Витрина</Link><Link className={view==='admin'?'active':''} href="/admin/orders"><Icon name="settings" size={15}/>Админ-панель</Link><button disabled={resetting} onClick={()=>{setResetError('');setConfirmReset(true);}}>{resetting?'Сбрасываем…':'Сбросить демо'}</button></nav></div></aside>{storageWarning&&<p className="demo-warning" role="alert">{storageWarning}</p>}<SiteHeader/>{content}<SiteFooter/>{confirmReset&&<div className="demo-modal-backdrop"><section className="demo-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title" onKeyDown={e=>{if(e.key==='Escape'&&!resetting)setConfirmReset(false);}}><p className="section-kicker">Начать сначала</p><h2 id="reset-title">Восстановить демо?</h2><p>Ваши изменения товаров, заказов и оформления в этом браузере заменятся исходным примером.</p>{resetError&&<p role="alert">{resetError}</p>}<div><button className="primary-button" disabled={resetting} onClick={async()=>{setResetting(true);try{await reset();setConfirmReset(false);go('/');}catch(e){setResetError((e as Error).message);}finally{setResetting(false);}}}>{resetting?'Восстанавливаем…':'Восстановить пример'}</button><button autoFocus className="text-link" disabled={resetting} onClick={()=>setConfirmReset(false)}>Отмена</button></div></section></div>}</StoreProvider>;
}
function Missing(){return <main className="site-width store-empty"><h1>Такой полки пока нет</h1><Link href="/catalog" className="primary-button">Вернуться в каталог</Link></main>;}
class ErrorBoundary extends Component<any,{error:string}>{state={error:''};static getDerivedStateFromError(error:Error){return {error:error.message};}render(){return this.state.error?<main className="site-width store-empty"><h1>Не удалось открыть демо</h1><p>{this.state.error}</p><button onClick={()=>location.reload()}>Перезагрузить</button></main>:this.props.children;}}
initialize().then(()=>{installForms();createRoot(document.getElementById('root')!).render(<ErrorBoundary><App/></ErrorBoundary>);}).catch(error=>{document.getElementById('root')!.textContent='Не удалось открыть демо: '+error.message;});
