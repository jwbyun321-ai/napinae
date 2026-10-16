import { products, groups, totals } from './pricing.mjs';
export const paymentMethods = { card: '신용·체크카드', easy: '간편결제', transfer: '계좌이체' };
export function checkoutSnapshot(cart, group, source='cart') {
 const safe={};for(const p of products){const n=Number(cart[p.id]);if(Number.isInteger(n)&&n>0)safe[p.id]=Math.min(n,99);}
 const t=totals(safe,group);if(!t.count)throw new Error('주문할 상품이 없습니다.');
 return structuredClone({...t,group:groups[group]?group:'guest',source});
}
export function validateShipping(data){
 if(!data.name?.trim())return '받는 분 이름을 입력해 주세요.';
 if(!/^0\d{8,10}$/.test((data.phone||'').replace(/[\s-]/g,'')))return '연락처를 확인해 주세요. 예: 010-0000-0000';
 if(!/^\d{5}$/.test(data.postcode||''))return '우편번호 5자리를 입력해 주세요.';
 if(!data.address?.trim())return '주소를 입력해 주세요.';
 return '';
}
export function createDemoOrder(snapshot,shipping,method,id,createdAt){
 const error=validateShipping(shipping);if(error)throw new Error(error);
 if(!paymentMethods[method])throw new Error('결제수단을 선택해 주세요.');
 return structuredClone({id,createdAt,status:'demo_paid',snapshot,shipping,method});
}
export function remainingCart(cart,snapshot){
 const next={...cart};if(snapshot.source!=='cart')return next;
 for(const row of snapshot.rows){const qty=(next[row.id]||0)-row.qty;if(qty>0)next[row.id]=qty;else delete next[row.id];}
 return next;
}
