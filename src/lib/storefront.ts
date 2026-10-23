import {state,resolveAssets} from '../browser-api';
import {catalog} from '../demo-data.mjs';
export {categoryHref} from './category-links';
export function storefrontCatalog(query:Record<string,string|undefined>,slug?:string){return resolveAssets(catalog(state,{...query,min:query.min?String(Number(query.min)*100):'',max:query.max?String(Number(query.max)*100):''},slug));}
