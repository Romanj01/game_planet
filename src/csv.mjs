// CSV in the same format as the demo export. Quoted separators and newlines are supported.
export function importRows(text){
 if(typeof text!=='string'||text.length>2_000_000)throw Error('CSV должен быть меньше 2 МБ');
 text=text.replace(/^\uFEFF/,'');const separator=text.split(/\r?\n/,1)[0].includes(';')?';':',';
 const table=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const ch=text[i];if(ch==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(ch===separator&&!quoted){row.push(cell);cell='';}else if((ch==='\r'||ch==='\n')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))table.push(row);row=[];cell='';}else cell+=ch;}
 if(quoted)throw Error('Не закрыты кавычки в CSV');row.push(cell);if(row.some(v=>v.trim()))table.push(row);
 const headers=table.shift()||[];if(!['Название','Артикул','Цена, ₽','Остаток'].every(key=>headers.includes(key)))throw Error('Используйте формат CSV из кнопки «Экспорт CSV»');
 if(table.length>500)throw Error('Не больше 500 строк');if(!table.length)throw Error('CSV пуст');
 const seen=new Set();return table.map((values,index)=>{const data=Object.fromEntries(headers.map((key,n)=>[key,values[n]||''])),number=key=>Number((data[key]||'0').replace(',','.'));const price=Math.round(number('Цена, ₽')*100),discount=Math.round(number('Скидка, ₽')*100),stock=number('Остаток');
 if(!data['Название'].trim()||!data['Артикул'].trim()||seen.has(data['Артикул'])||!Number.isSafeInteger(price)||price<0||!Number.isSafeInteger(discount)||discount<0||discount>price||!Number.isSafeInteger(stock)||stock<0)throw Error('Проверьте название, артикул, цену и остаток в строке '+(index+2));seen.add(data['Артикул']);return {name:data['Название'],sku:data['Артикул'],price,discount,stock,categories:(data['Категории']||'').split(',').map(v=>v.trim()).filter(Boolean)};});
}
