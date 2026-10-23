'use client';
import {useState} from 'react';
import {Icon} from '../store/icons';

export function ImageField({name,label,initial='',upload,onValue}:{name:string;label:string;initial?:string;upload:(file:File)=>Promise<string>;onValue?:(url:string)=>void}){
  const[value,setValue]=useState(initial),[busy,setBusy]=useState(false),[error,setError]=useState('');
  function change(url:string){setValue(url);onValue?.(url);}
  return <div className="admin-image-field">
    <label className="field">{label}<input name={name} value={value} onChange={e=>change(e.target.value)} placeholder="Загрузите изображение или вставьте HTTPS-ссылку"/></label>
    <div className="admin-image-preview">{value?<img src={value} alt={`Предпросмотр: ${label}`} onError={e=>e.currentTarget.setAttribute('data-broken','true')} onLoad={e=>e.currentTarget.removeAttribute('data-broken')}/>:<span><Icon name="image" size={30}/>Изображение не выбрано</span>}</div>
    <div className="row wrap"><label className="button secondary upload-button">{busy?'Загрузка…':'Загрузить изображение'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setBusy(true);setError('');try{change(await upload(file));}catch(err){setError((err as Error).message);}finally{setBusy(false);e.target.value='';}}}/></label>{value&&<button type="button" className="text-button" onClick={()=>change('')}>Убрать изображение</button>}</div>
    {error&&<p role="alert" className="error">{error}</p>}
  </div>;
}

export function ImagePreview({url,alt,onClose}:{url:string;alt:string;onClose:()=>void}){
  return <div className="admin-image-dialog" role="dialog" aria-modal="true" aria-label="Предпросмотр изображения" onClick={onClose}><div onClick={e=>e.stopPropagation()}><button type="button" className="secondary" onClick={onClose} autoFocus><Icon name="close" size={18}/>Закрыть</button><img src={url} alt={alt}/></div></div>;
}
