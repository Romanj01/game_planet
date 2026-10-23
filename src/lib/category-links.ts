import type {Category} from './store-types';
export function categoryHref(category:Category){return `/catalog/${category.slug||category.id}`;}
