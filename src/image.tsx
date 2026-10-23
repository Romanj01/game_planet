export const base=new URL('.',import.meta.url).pathname;
export const asset=(url:string)=>url?.startsWith('/assets/')||url?.startsWith('/fonts/')?base+url.slice(1):url;
export default function Image({src,priority,unoptimized,fill,sizes,...props}:any){return <img {...props} src={asset(src)} loading={priority?'eager':props.loading||'lazy'} style={fill?{...props.style,width:'100%',height:'100%',objectFit:'cover'}:props.style}/>;}
