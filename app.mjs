import { groups, products, unitPrice, totals } from './pricing.mjs';
const $ = s => document.querySelector(s);
const money = n => n.toLocaleString('ko-KR') + '원';
let group = 'guest', cart = {}, category = '전체', query = '', sort = 'recommended', detailId = null;
try { const saved = JSON.parse(localStorage.getItem('mellow-cart-v1') || '{}'); if(groups[saved.group]) group=saved.group; for(const p of products){const n=Number(saved.cart?.[p.id]);if(Number.isInteger(n)&&n>0)cart[p.id]=Math.min(n,99);} } catch {}
function persist(){try{localStorage.setItem('mellow-cart-v1',JSON.stringify({cart,group}));}catch{}}
export function productArt(p,suffix=''){
 return `<svg viewBox="${p.crop}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="overflow:hidden"><image href="./${p.image}" width="${p.imageWidth}" height="${p.imageHeight}"/></svg>`;
}
$('.hp-serum').innerHTML=productArt(products[0],'-hero');
$('.hp-toner').innerHTML=productArt(products[1],'-hero');
$('.hp-cream').hidden=true;
function priceHTML(p){
 const price=unitPrice(p,group);
 return `<div class="price"><span class="discount">${Math.round((1-price/p.listPrice)*100)}%</span><span>${money(price)}</span><del>${money(p.listPrice)}</del></div><div class="price-explainer">판매가 ${money(p.price)} · ${groups[group].rate?groups[group].name+' 추가 '+Math.round(groups[group].rate*100)+'% 할인':'기본 20% 할인'} · 무료배송</div>`;
}
function renderProducts(){
 const categories=['전체',...new Set(products.map(p=>p.category))];
 $('#categories').innerHTML=categories.map(c=>`<button class="${c===category?'active':''}" aria-pressed="${c===category}" data-category="${c}">${c}</button>`).join('');
 let list=products.filter(p=>(category==='전체'||p.category===category)&&`${p.name} ${p.en} ${p.category} ${p.note}`.toLowerCase().includes(query.toLowerCase()));
 if(sort!=='recommended')list.sort((a,b)=>(unitPrice(a,group)-unitPrice(b,group))*(sort==='low'?1:-1));
 $('#result-count').textContent=`전체 ${list.length}개 상품`;
 $('#products').innerHTML=list.map(p=>`<article class="product-card"><button class="product-visual" data-detail="${p.id}" aria-label="${p.name} 상세 보기"><span class="badge">${p.tag}</span>${productArt(p,'-card')}</button><div class="product-info"><p class="product-en">${p.en} · ${p.volume}</p><button class="product-name" data-detail="${p.id}">${p.name}</button><p class="product-note">${p.note}</p>${priceHTML(p)}<button class="add-button" data-add="${p.id}" aria-label="${p.name} 장바구니 담기">+</button></div></article>`).join('');
 $('#no-results').hidden=list.length>0;
}
function renderDetail(){const p=products.find(p=>p.id===detailId);if(!p)return;$('#product-detail').innerHTML=`<div class="detail-layout"><div class="detail-art">${productArt(p,'-detail')}</div><div class="detail-copy"><p class="eyebrow">NEPINAE / ${p.category}</p><h2>${p.name}</h2><p>${p.en} · ${p.volume}</p><p>${p.detail}</p>${priceHTML(p)}<div class="detail-group">${groups[group].name} 그룹 · ${groups[group].rate?Math.round(groups[group].rate*100)+'% 할인 적용':'기본 가격'}</div><p class="detail-source"><a href="${p.url}" target="_blank" rel="noopener noreferrer">네이버 스마트스토어에서 원상품 보기 ↗</a></p><button class="detail-add" data-add="${p.id}">장바구니 담기</button><details class="product-spec"><summary>상품정보 확인</summary><dl><dt>상품번호</dt><dd>${p.number}</dd><dt>제조사 / 브랜드</dt><dd>그린코스(주) / 네피내</dd><dt>모델명</dt><dd>네피내 엑토레이어 선스크린 ${p.volume}(SPF50+)</dd><dt>품번</dt><dd>${p.model}</dd><dt>원산지</dt><dd>${p.origin}</dd><dt>제조일자</dt><dd>2026.05.13.</dd><dt>유효일자</dt><dd>2029.05.12.</dd><dt>사용부위</dt><dd>페이스용</dd><dt>개봉 후 사용기간</dt><dd>12개월</dd></dl><small>제조·유효일자는 제공된 상품정보 화면에 표시된 날짜입니다.</small></details><p><small>가격과 상품정보는 제공된 화면 기준입니다. 그룹 추가 할인은 시제품 체험용이며 네이버 스토어 혜택과 별개입니다.</small></p></div></div><section class="detail-panels" aria-label="선스크린 상세 소개"><h3>ECTO-LAYER SUNSCREEN</h3><p>두 사이즈가 공유하는 제품 소개 이미지입니다. 이미지 속 용기는 50mL이며 선택한 상품의 용량은 위 상품명을 확인해 주세요.</p><img src="./detail-01.png" alt="네피내 엑토레이어 선스크린 SPF50+ PA++++ 소개" loading="lazy" decoding="async"><img src="./detail-02.png" alt="선케어 사용감에 대한 브랜드 소개" loading="lazy" decoding="async"><img src="./detail-03.png" alt="네피내 수분 선크림 사용 이미지" loading="lazy" decoding="async"><img src="./detail-04.png" alt="수분 보호 레이어에 대한 브랜드 설명, 원료적 특성에 한함" loading="lazy" decoding="async"><img src="./detail-05.png" alt="엑토인과 대나무수 원료 소개" loading="lazy" decoding="async"><img src="./detail-06.png" alt="엑토인, 판테놀 등 포뮬러 소개, 원료적 특성에 한함" loading="lazy" decoding="async"><img src="./detail-07.png" alt="제주 대나무수 원료 소개" loading="lazy" decoding="async"></section>`;}
const groupOptions=()=>Object.entries(groups).map(([key,g])=>`<option value="${key}" ${group===key?'selected':''}>${g.name} · ${g.rate?Math.round(g.rate*100)+'% 할인':'기본 가격'}</option>`).join('');
function renderCart(){
 const t=totals(cart,group);$('#bag-count').textContent=t.count;$('#cart-title-count').textContent=t.count;
 $('#cart-group').innerHTML=`<strong>${groups[group].name} 그룹 혜택</strong> · ${groups[group].rate?Math.round(groups[group].rate*100)+'% 할인 적용':'기본 가격 적용'}<label><span class="cart-limit"> · 그룹 체험</span><select id="cart-group-select" aria-label="장바구니 사용자 그룹">${groupOptions()}</select></label>`;
 $('#cart-items').innerHTML=t.rows.length?t.rows.map(p=>`<article class="cart-row"><div class="cart-art">${productArt(p,'-cart')}</div><div><h3>${p.name}</h3>${priceHTML(p)}<div class="quantity"><button data-quantity="${p.id}" data-delta="-1" aria-label="${p.name} 수량 줄이기">−</button><span aria-label="수량">${p.qty}</span><button data-quantity="${p.id}" data-delta="1" aria-label="${p.name} 수량 늘리기" ${p.qty===99?'disabled':''}>+</button></div></div><button class="remove" data-remove="${p.id}" aria-label="${p.name} 삭제">×</button></article>`).join(''):`<div class="cart-empty"><svg viewBox="0 0 24 24"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg><h3>아직 담은 상품이 없어요.</h3><p>매일의 루틴을 채워볼까요?</p><button class="outline-button" data-close="cart-dialog">쇼핑 계속하기 ↗</button></div>`;
 $('#cart-summary').innerHTML=t.rows.length?`<div class="summary-row"><span>상품금액 (판매가 기준)</span><span>${money(t.original)}</span></div><div class="summary-row discount-row"><span>${groups[group].name} 그룹 할인 (${Math.round(groups[group].rate*100)}%)</span><span>−${money(t.discount)}</span></div><div class="summary-row"><span>배송비</span><span>${t.shipping?money(t.shipping):'무료'}</span></div><p class="shipping-note">두 상품 모두 수량·할인금액과 관계없이 무료배송입니다.</p><div class="summary-row summary-total"><span>예상 결제금액</span><span>${money(t.total)}</span></div><button class="cart-finish" data-close="cart-dialog">쇼핑 계속하기</button><p class="cart-limit">장바구니 시제품 · 실제 주문 및 결제는 진행되지 않습니다.</p>`:'';
}
function setGroup(value){if(!groups[value])return;group=value;$('#group').value=group;$('#group-description').textContent=group==='guest'?'기본 20% 할인된 판매가를 보고 있어요. 두 상품 모두 무료배송입니다.':`${groups[group].name} 그룹 추가 ${Math.round(groups[group].rate*100)}% 할인이 판매가에 적용돼요.`;persist();renderProducts();renderDetail();renderCart();}
let timer;function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('visible'),2400);}
function add(id){if(!products.some(p=>p.id===id))return;if((cart[id]||0)>=99){toast('상품은 최대 99개까지 담을 수 있어요.');return;}cart[id]=(cart[id]||0)+1;persist();renderCart();toast('장바구니에 담았어요.');}
document.addEventListener('click',e=>{
 const addButton=e.target.closest('[data-add]');if(addButton){add(addButton.dataset.add);return;}
 const detail=e.target.closest('[data-detail]');if(detail){detailId=detail.dataset.detail;renderDetail();$('#product-dialog').showModal();return;}
 const cat=e.target.closest('[data-category]');if(cat){category=cat.dataset.category;renderProducts();$('#categories').querySelector(`[data-category="${category}"]`).focus();return;}
 const close=e.target.closest('[data-close]');if(close){document.getElementById(close.dataset.close).close();return;}
 const qty=e.target.closest('[data-quantity]');if(qty){const id=qty.dataset.quantity;const next=Math.min(99,(cart[id]||0)+Number(qty.dataset.delta));if(next<=0)delete cart[id];else cart[id]=next;persist();renderCart();const replacement=$('#cart-items').querySelector(`[data-quantity="${id}"][data-delta="${qty.dataset.delta}"]`);replacement?.focus();return;}
 const remove=e.target.closest('[data-remove]');if(remove){delete cart[remove.dataset.remove];persist();renderCart();toast('상품을 장바구니에서 삭제했어요.');}
});
$('#group').addEventListener('change',e=>setGroup(e.target.value));
$('#cart-group').addEventListener('change',e=>{if(e.target.id==='cart-group-select'){setGroup(e.target.value);$('#cart-group-select').focus();}});
$('#search').addEventListener('input',e=>{query=e.target.value.trim();renderProducts();});
$('#sort').addEventListener('change',e=>{sort=e.target.value;renderProducts();});
$('#reset-search').addEventListener('click',()=>{category='전체';query='';$('#search').value='';renderProducts();});
$('.bag-button').addEventListener('click',()=>{renderCart();$('#cart-dialog').showModal();});
$('.search-open').addEventListener('click',()=>{$('#shop').scrollIntoView();$('#search').focus({preventScroll:true});});
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
setGroup(group);

