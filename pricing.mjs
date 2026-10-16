export const groups = { guest: { name: '일반', rate: 0 }, member: { name: '회원', rate: 0.1 }, vip: { name: 'VIP', rate: 0.2 } };
export const products = [
  {id:'serum', name:'듀 드롭 하이드레이팅 세럼', en:'Dew Drop Serum', category:'세럼', price:38000, volume:'30 ml', color:'#b9bd81', type:'dropper', tag:'BEST', note:'가볍게 스며드는 촉촉한 데일리 세럼', detail:'매일의 스킨케어에 더하는 산뜻한 수분 레이어. 세안 후 토너 다음 단계에서 적당량을 덜어 부드럽게 펴 발라주세요.'},
  {id:'cream', name:'소프트 배리어 크림', en:'Soft Barrier Cream', category:'크림', price:42000, volume:'50 ml', color:'#e8d6bf', type:'jar', tag:'BEST', note:'피부를 포근하게 감싸는 크리미한 텍스처', detail:'부드럽게 마무리하는 데일리 보습 크림. 스킨케어 마지막 단계에 얼굴과 목에 골고루 발라주세요.'},
  {id:'toner', name:'리프레시 밸런싱 토너', en:'Refresh Balancing Toner', category:'토너', price:28000, volume:'150 ml', color:'#c1cbb3', type:'bottle', tag:'NEW', note:'첫 단계부터 채우는 싱그러운 수분감', detail:'세안 후 피부를 정돈하는 산뜻한 토너. 손바닥이나 화장솜에 적당량을 덜어 가볍게 발라주세요.'},
  {id:'sun', name:'에브리데이 선 플루이드', en:'Everyday Sun Fluid', category:'선케어', price:32000, volume:'50 ml', color:'#e6c879', type:'tube', tag:'DAILY', note:'일상의 루틴에 가볍게 더하는 선케어', detail:'외출 전 스킨케어 마지막 단계에 사용하는 선케어 컨셉 상품입니다. 실제 자외선 차단 지수와 성분 정보는 정식 상품 등록 시 제공됩니다.'},
  {id:'cleanser', name:'젠틀 모닝 클렌저', en:'Gentle Morning Cleanser', category:'클렌징', price:24000, volume:'120 ml', color:'#d3c2b1', type:'tube', tag:'DAILY', note:'하루의 시작과 끝, 부드러운 클렌징', detail:'물을 묻힌 손에 적당량을 덜어 거품을 낸 다음 부드럽게 마사지하고 미온수로 씻어내세요.'},
  {id:'lip', name:'로지 틴티드 립 밤', en:'Rosy Tinted Lip Balm', category:'립케어', price:18000, volume:'4 g', color:'#c58d83', type:'stick', tag:'NEW', note:'은은한 로즈 빛으로 완성하는 입술 케어', detail:'자연스러운 색감의 데일리 립 밤. 건조함이 느껴질 때 입술에 부드럽게 덧발라주세요.'}
];
export function unitPrice(product, group) { return Math.round(product.price * (1 - (groups[group] || groups.guest).rate)); }
export function totals(cart, group) {
  const rows = products.filter(p => cart[p.id] > 0).map(p => ({...p, qty: cart[p.id], unit: unitPrice(p, group)}));
  const original = rows.reduce((sum,p) => sum + p.price * p.qty, 0);
  const subtotal = rows.reduce((sum,p) => sum + p.unit * p.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 50000 ? 0 : 3000;
  return { rows, original, discount: original - subtotal, subtotal, shipping, total: subtotal + shipping, count: rows.reduce((sum,p)=>sum+p.qty,0) };
}

