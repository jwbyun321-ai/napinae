import { groups, products, unitPrice, totals } from './pricing.mjs';
const $ = s => document.querySelector(s);
const money = n => n.toLocaleString('ko-KR') + '원';
let group = 'guest', cart = {}, category = '전체', query = '', sort = 'recommended', detailId = null;
try { const saved = JSON.parse(localStorage.getItem('mellow-cart-v1') || '{}'); if(groups[saved.group]) group=saved.group; for(const p of products){const n=Number(saved.cart?.[p.id]);if(Number.isInteger(n)&&n>0)cart[p.id]=Math.min(n,99);} } catch {}
function persist(){try{localStorage.setItem('mellow-cart-v1',JSON.stringify({cart,group}));}catch{}}
export function productArt(p, suffix=''){
 const c=p.color, id=p.id+suffix;
 let shape='';
 if(p.type==='dropper') shape=`<rect x="42" y="13" width="36" height="48" rx="17" fill="#444b35"/><rect x="33" y="48" width="54" height="33" rx="4" fill="#555c40"/><rect x="24" y="78" width="72" height="131" rx="12" fill="url(#${id})"/><rect x="31" y="85" width="4" height="111" rx="2" fill="#fff" opacity=".16"/>`;
 if(p.type==='bottle') shape=`<rect x="35" y="9" width="50" height="38" rx="4" fill="#4d543d"/><path d="M35 47H85L94 65V211Q94 219 86 219H34Q26 219 26 211V65Z" fill="url(#${id})"/><path d="M33 68V206" stroke="#fff" stroke-width="3" opacity=".2"/>`;
 if(p.type==='jar') shape=`<rect x="9" y="103" width="102" height="87" rx="14" fill="url(#${id})"/><rect x="6" y="91" width="108" height="27" rx="8" fill="#515941"/><path d="M15 97H105" stroke="#768064" stroke-width="2"/>`;
 if(p.type==='tube') shape=`<path d="M17 25H103L91 191H29Z" fill="url(#${id})"/><path d="M18 30H102M19 35H101" stroke="#fff" stroke-width="1" opacity=".35"/><rect x="28" y="188" width="64" height="28" rx="3" fill="#555d42"/>`;
 if(p.type==='stick') shape=`<rect x="37" y="32" width="46" height="182" rx="5" fill="url(#${id})"/><path d="M37 133H83" stroke="#9a6a63" stroke-width="2"/><path d="M43 39V123" stroke="#fff" opacity=".22" stroke-width="2"/>`;
 const labelY=p.type==='jar'?142:p.type==='stick'?91:125;
 return `<svg viewBox="0 0 120 235" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" x2="1"><stop stop-color="${c}"/><stop offset=".35" stop-color="${c}"/><stop offset=".7" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="${c}"/></linearGradient></defs>${shape}<text x="60" y="${labelY}" text-anchor="middle" fill="#39402e" font-family="Georgia,serif" font-size="${p.type==='stick'?10:14}" letter-spacing="-.6">mellow</text><text x="60" y="${labelY+14}" text-anchor="middle" fill="#39402e" font-family="Arial,sans-serif" font-size="4.3" letter-spacing=".5">${p.category==='선케어'?'SUN FLUID':p.en.toUpperCase()}</text><text x="60" y="${labelY+29}" text-anchor="middle" fill="#39402e" font-family="Arial,sans-serif" font-size="4.8">${p.volume}</text></svg>`;
}
$('.hp-serum').innerHTML=productArt(products[0],'-hero');$('.hp-toner').innerHTML=productArt(products[2],'-hero');$('.hp-cream').innerHTML=productArt(products[1],'-hero');
function priceHTML(p){const price=unitPrice(p,group);return `<div class="price">${groups[group].rate?`<span class="discount">${Math.round(groups[group].rate*100)}%</span>`:''}<span>${money(price)}</span>${price<p.price?`<del>${money(p.price)}</del>`:''}</div>`;}
function renderProducts(){
 const categories=['전체',...new Set(products.map(p=>p.category))];
 $('#categories').innerHTML=categories.map(c=>`<button class="${c===category?'active':''}" aria-pressed="${c===category}" data-category="${c}">${c}</button>`).join('');
 let list=products.filter(p=>(category==='전체'||p.category===category)&&`${p.name} ${p.en} ${p.category} ${p.note}`.toLowerCase().includes(query.toLowerCase()));
 if(sort!=='recommended')list.sort((a,b)=>(unitPrice(a,group)-unitPrice(b,group))*(sort==='low'?1:-1));
 $('#result-count').textContent=`전체 ${list.length}개 상품`;
 $('#products').innerHTML=list.map(p=>`<article class="product-card"><button class="product-visual" data-detail="${p.id}" aria-label="${p.name} 상세 보기"><span class="badge">${p.tag}</span>${productArt(p,'-card')}</button><div class="product-info"><p class="product-en">${p.en} · ${p.volume}</p><button class="product-name" data-detail="${p.id}">${p.name}</button><p class="product-note">${p.note}</p>${priceHTML(p)}<button class="add-button" data-add="${p.id}" aria-label="${p.name} 장바구니 담기">+</button></div></article>`).join('');
 $('#no-results').hidden=list.length>0;
}
function renderDetail(){const p=products.find(p=>p.id===detailId);if(!p)return;$('#product-detail').innerHTML=`<div class="detail-layout"><div class="detail-art">${productArt(p,'-detail')}</div><div class="detail-copy"><p class="eyebrow">MELLOW ESSENTIALS / ${p.category}</p><h2>${p.name}</h2><p>${p.en} · ${p.volume}</p><p>${p.detail}</p>${priceHTML(p)}<div class="detail-group">${groups[group].name} 그룹 · ${groups[group].rate?Math.round(groups[group].rate*100)+'% 할인 적용':'기본 가격'}</div><button class="detail-add" data-add="${p.id}">장바구니 담기</button><p><small>샘플 상품입니다. 성분·효능·표시사항은 실제 상품 정보가 아닙니다.</small></p></div></div>`;}
const groupOptions=()=>Object.entries(groups).map(([key,g])=>`<option value="${key}" ${group===key?'selected':''}>${g.name} · ${g.rate?Math.round(g.rate*100)+'% 할인':'기본 가격'}</option>`).join('');
function renderCart(){
 const t=totals(cart,group);$('#bag-count').textContent=t.count;$('#cart-title-count').textContent=t.count;
 $('#cart-group').innerHTML=`<strong>${groups[group].name} 그룹 혜택</strong> · ${groups[group].rate?Math.round(groups[group].rate*100)+'% 할인 적용':'기본 가격 적용'}<label><span class="cart-limit"> · 그룹 체험</span><select id="cart-group-select" aria-label="장바구니 사용자 그룹">${groupOptions()}</select></label>`;
 $('#cart-items').innerHTML=t.rows.length?t.rows.map(p=>`<article class="cart-row"><div class="cart-art">${productArt(p,'-cart')}</div><div><h3>${p.name}</h3>${priceHTML(p)}<div class="quantity"><button data-quantity="${p.id}" data-delta="-1" aria-label="${p.name} 수량 줄이기">−</button><span aria-label="수량">${p.qty}</span><button data-quantity="${p.id}" data-delta="1" aria-label="${p.name} 수량 늘리기" ${p.qty===99?'disabled':''}>+</button></div></div><button class="remove" data-remove="${p.id}" aria-label="${p.name} 삭제">×</button></article>`).join(''):`<div class="cart-empty"><svg viewBox="0 0 24 24"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg><h3>아직 담은 상품이 없어요.</h3><p>매일의 루틴을 채워볼까요?</p><button class="outline-button" data-close="cart-dialog">쇼핑 계속하기 ↗</button></div>`;
 $('#cart-summary').innerHTML=t.rows.length?`<div class="summary-row"><span>상품금액</span><span>${money(t.original)}</span></div><div class="summary-row discount-row"><span>${groups[group].name} 그룹 할인 (${Math.round(groups[group].rate*100)}%)</span><span>−${money(t.discount)}</span></div><div class="summary-row"><span>배송비</span><span>${t.shipping?money(t.shipping):'무료'}</span></div><p class="shipping-note">${t.subtotal<50000?money(50000-t.subtotal)+' 더 담으면 무료배송':'무료배송 혜택이 적용되었어요.'}<br>할인 후 상품금액 50,000원 이상 무료배송, 미만 3,000원.</p><div class="summary-row summary-total"><span>예상 결제금액</span><span>${money(t.total)}</span></div><button class="cart-finish" data-close="cart-dialog">쇼핑 계속하기</button><p class="cart-limit">장바구니 시제품 · 실제 주문 및 결제는 진행되지 않습니다.</p>`:'';
}
function setGroup(value){if(!groups[value])return;group=value;$('#group').value=group;$('#group-description').textContent=group==='guest'?'일반 그룹의 기본 가격을 보고 있어요.':`${groups[group].name} 그룹 ${Math.round(groups[group].rate*100)}% 할인이 모든 상품에 적용돼요.`;persist();renderProducts();renderDetail();renderCart();}
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

