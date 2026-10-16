export const groups = { guest: { name: '일반', rate: 0 }, member: { name: '회원', rate: 0.1 }, vip: { name: 'VIP', rate: 0.2 } };
export const products = [
 {id:'nepinae-50',name:'네피내 엑토레이어 선스크린 50mL',en:'ECTO-LAYER SUNSCREEN',category:'데일리 50mL',price:20800,listPrice:26000,volume:'50 mL',tag:'DAILY CARE',image:'product-50.png',crop:'9 51 730 730',imageWidth:1630,imageHeight:930,note:'SPF50+ · PA++++ · 엑토인 수분 선크림',detail:'매일의 선케어를 위한 네피내 엑토레이어 선스크린 50mL. 첨부된 상품 화면 기준으로 정상가 26,000원에서 20% 할인된 판매가 20,800원이며 무료배송 상품입니다.',url:'https://smartstore.naver.com/nepinae/products/13526673346',model:'NES26-1-50',origin:'국산',number:'13526673346'},
 {id:'nepinae-20',name:'네피내 엑토레이어 선스크린 20mL 휴대용',en:'ECTO-LAYER SUNSCREEN MINI',category:'휴대용 20mL',price:8800,listPrice:11000,volume:'20 mL',tag:'ON THE GO',image:'product-20.png',crop:'21 49 730 730',imageWidth:1646,imageHeight:902,note:'SPF50+ · PA++++ · 가볍게 휴대하는 선케어',detail:'일상과 여행에 간편하게 함께하는 휴대용 선스크린 20mL. 첨부된 상품 화면 기준으로 정상가 11,000원에서 20% 할인된 판매가 8,800원이며 무료배송 상품입니다.',url:'https://smartstore.naver.com/nepinae/products/13531565485',model:'NES26-2-20',origin:'국산(경기도 김포시)',number:'13531565485'}
];
export function unitPrice(product,group){ return Math.round(product.price*(1-(groups[group]||groups.guest).rate)); }
export function totals(cart,group){
 const rows=products.filter(p=>cart[p.id]>0).map(p=>({...p,qty:cart[p.id],unit:unitPrice(p,group)}));
 const original=rows.reduce((sum,p)=>sum+p.price*p.qty,0);
 const subtotal=rows.reduce((sum,p)=>sum+p.unit*p.qty,0);
 return {rows,original,discount:original-subtotal,subtotal,shipping:0,total:subtotal,count:rows.reduce((sum,p)=>sum+p.qty,0)};
}
