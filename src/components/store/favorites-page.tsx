'use client';
import {productCount} from '@/lib/words';
import {useStore} from './provider';
import {ProductCard} from './product-card';
import type {Product} from '@/lib/store-types';
import Link from 'next/link';
import {Icon} from './icons';
export function FavoritesPage({products}:{products:Product[]}){const{favorites,user}=useStore();const saved=products.filter(p=>favorites.includes(p.id));return <main className="site-width catalog-page"><div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Избранное</span></div><div className="catalog-heading"><div><p className="section-kicker">Не потерять хорошую находку</p><h1>Избранное</h1></div><span>{productCount(saved.length)}</span></div>{saved.length?<div className="store-product-grid">{saved.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<div className="store-empty"><Icon name="heart" size={35}/><h2>{user?'Коллекция начинается с одной находки':'Сохраняй то, что понравилось'}</h2><p>{user?'Нажми на сердечко у товара — он появится здесь.':'Войди через Telegram, чтобы избранное сохранилось в твоём аккаунте.'}</p><Link className="primary-button" href={user?'/catalog':'/login'}>{user?'Открыть каталог':'Войти через Telegram'}<Icon name="arrow" size={18}/></Link></div>}</main>;}
