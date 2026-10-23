export function productCount(count:number){const n=Math.abs(count)%100,last=n%10;return `${count} ${n>=11&&n<=14?'товаров':last===1?'товар':last>=2&&last<=4?'товара':'товаров'}`;}
