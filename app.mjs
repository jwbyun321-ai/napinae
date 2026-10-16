import { paymentMethods, checkoutSnapshot, validateShipping, createDemoOrder, remainingCart } from './checkout-model.mjs';
import { groups, products, unitPrice, totals } from './pricing.mjs';
const $ = s => document.querySelector(s);
const money = n => Number(n).toLocaleString('ko-KR') + '원';
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
function renderDetail(){const p=products.find(p=>p.id===detailId);if(!p)return;$('#product-detail').innerHTML=`<div class="detail-layout"><div class="detail-art">${productArt(p,'-detail')}</div><div class="detail-copy"><p class="eyebrow">NEPINAE / ${p.category}</p><h2>${p.name}</h2><p>${p.en} · ${p.volume}</p><p>${p.detail}</p>${priceHTML(p)}<div class="detail-group">${groups[group].name} 그룹 · ${groups[group].rate?Math.round(groups[group].rate*100)+'% 할인 적용':'기본 가격'}</div><p class="detail-source"><a href="${p.url}" target="_blank" rel="noopener noreferrer">네이버 스마트스토어에서 원상품 보기 ↗</a></p><button class="detail-add" data-add="${p.id}">장바구니 담기</button><button class="buy-now" data-buy="${p.id}">바로 구매</button><details class="product-spec"><summary>상품정보 확인</summary><dl><dt>상품번호</dt><dd>${p.number}</dd><dt>제조사 / 브랜드</dt><dd>그린코스(주) / 네피내</dd><dt>모델명</dt><dd>네피내 엑토레이어 선스크린 ${p.volume}(SPF50+)</dd><dt>품번</dt><dd>${p.model}</dd><dt>원산지</dt><dd>${p.origin}</dd><dt>제조일자</dt><dd>2026.05.13.</dd><dt>유효일자</dt><dd>2029.05.12.</dd><dt>사용부위</dt><dd>페이스용</dd><dt>개봉 후 사용기간</dt><dd>12개월</dd></dl><small>제조·유효일자는 제공된 상품정보 화면에 표시된 날짜입니다.</small></details><p><small>가격과 상품정보는 제공된 화면 기준입니다. 그룹 추가 할인은 시제품 체험용이며 네이버 스토어 혜택과 별개입니다.</small></p></div></div><section class="detail-panels" aria-label="선스크린 상세 소개"><h3>ECTO-LAYER SUNSCREEN</h3><p>두 사이즈가 공유하는 제품 소개 이미지입니다. 이미지 속 용기는 50mL이며 선택한 상품의 용량은 위 상품명을 확인해 주세요.</p><img src="./detail-01.png" alt="네피내 엑토레이어 선스크린 SPF50+ PA++++ 소개" loading="lazy" decoding="async"><img src="./detail-02.png" alt="선케어 사용감에 대한 브랜드 소개" loading="lazy" decoding="async"><img src="./detail-03.png" alt="네피내 수분 선크림 사용 이미지" loading="lazy" decoding="async"><img src="./detail-04.png" alt="수분 보호 레이어에 대한 브랜드 설명, 원료적 특성에 한함" loading="lazy" decoding="async"><img src="./detail-05.png" alt="엑토인과 대나무수 원료 소개" loading="lazy" decoding="async"><img src="./detail-06.png" alt="엑토인, 판테놀 등 포뮬러 소개, 원료적 특성에 한함" loading="lazy" decoding="async"><img src="./detail-07.png" alt="제주 대나무수 원료 소개" loading="lazy" decoding="async"></section>`;}
const groupOptions=()=>Object.entries(groups).map(([key,g])=>`<option value="${key}" ${group===key?'selected':''}>${g.name} · ${g.rate?Math.round(g.rate*100)+'% 할인':'기본 가격'}</option>`).join('');
function renderCart(){
 const t=totals(cart,group);$('#bag-count').textContent=t.count;$('#cart-title-count').textContent=t.count;
 $('#cart-group').innerHTML=`<strong>${groups[group].name} 그룹 혜택</strong> · ${groups[group].rate?Math.round(groups[group].rate*100)+'% 할인 적용':'기본 가격 적용'}<label><span class="cart-limit"> · 그룹 체험</span><select id="cart-group-select" aria-label="장바구니 사용자 그룹">${groupOptions()}</select></label>`;
 $('#cart-items').innerHTML=t.rows.length?t.rows.map(p=>`<article class="cart-row"><div class="cart-art">${productArt(p,'-cart')}</div><div><h3>${p.name}</h3>${priceHTML(p)}<div class="quantity"><button data-quantity="${p.id}" data-delta="-1" aria-label="${p.name} 수량 줄이기">−</button><span aria-label="수량">${p.qty}</span><button data-quantity="${p.id}" data-delta="1" aria-label="${p.name} 수량 늘리기" ${p.qty===99?'disabled':''}>+</button></div></div><button class="remove" data-remove="${p.id}" aria-label="${p.name} 삭제">×</button></article>`).join(''):`<div class="cart-empty"><svg viewBox="0 0 24 24"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg><h3>아직 담은 상품이 없어요.</h3><p>매일의 루틴을 채워볼까요?</p><button class="outline-button" data-close="cart-dialog">쇼핑 계속하기 ↗</button></div>`;
 $('#cart-summary').innerHTML=t.rows.length?`<div class="summary-row"><span>상품금액 (판매가 기준)</span><span>${money(t.original)}</span></div><div class="summary-row discount-row"><span>${groups[group].name} 그룹 할인 (${Math.round(groups[group].rate*100)}%)</span><span>−${money(t.discount)}</span></div><div class="summary-row"><span>배송비</span><span>${t.shipping?money(t.shipping):'무료'}</span></div><p class="shipping-note">두 상품 모두 수량·할인금액과 관계없이 무료배송입니다.</p><div class="summary-row summary-total"><span>예상 결제금액</span><span>${money(t.total)}</span></div><button class="cart-finish" data-checkout>주문하기 · ${money(t.total)}</button><button class="continue-shopping" data-close="cart-dialog">쇼핑 계속하기</button><p class="cart-limit">모의 구매 체험 · 실제 결제·배송은 진행되지 않습니다.</p>`:'';
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
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',e=>{if(e.target!==dialog)return;if(dialog.id==='checkout-dialog'&&paying)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
setGroup(group);


// Group sign-in and checkout simulation. All state stays in this browser.
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let signedIn=false,pendingPurchase=null,purchase=null,shippingDraft={},paymentDraft='card',checkoutStep=1,paying=false,orders=[];
try{signedIn=sessionStorage.getItem('nepinae-group-session')==='active';}catch{}
try{const saved=JSON.parse(localStorage.getItem('nepinae-demo-orders-v1')||'[]');if(Array.isArray(saved))orders=saved.filter(o=>o?.status==='demo_paid'&&typeof o.id==='string'&&Array.isArray(o.snapshot?.rows)).slice(0,20);}catch{}
function updateLoginUI(){
 $('#group-login-open').textContent=signedIn?groups[group].name+' · 그룹 전환':'로그인';
 $('#group-logout').hidden=!signedIn;
}
function dialogHeading(title,step){return `<div class="checkout-heading"><div><p class="eyebrow">NEPINAE / DEMO CHECKOUT</p><h2 id="checkout-title">${title}</h2></div><button class="close-button" data-close="checkout-dialog" aria-label="주문 화면 닫기" ${paying?'disabled':''}>×</button></div><ol class="checkout-steps" aria-label="주문 진행 단계"><li class="${step===1?'current':''}">01 배송정보</li><li class="${step===2?'current':''}">02 주문·결제 확인</li><li class="${step===3?'current':''}">03 완료</li></ol>`;}
function openGroupLogin(next=null){
 pendingPurchase=next;
 $('#group-login-select').innerHTML=Object.entries(groups).map(([key,g])=>`<option value="${key}" ${group===key?'selected':''}>${g.name} · ${g.rate?'판매가에서 추가 '+Math.round(g.rate*100)+'% 할인':'기본 판매가 적용'}</option>`).join('');
 updateLoginPreview();
 $('#group-login-dialog').showModal();
}
function updateLoginPreview(){
 const selected=$('#group-login-select').value;
 $('#login-benefit').innerHTML=`<strong>${groups[selected].name} 그룹 적용 가격</strong>`+products.map(p=>`<div><span>${p.volume}</span><b>${money(unitPrice(p,selected))}</b></div>`).join('')+'<p>두 상품 모두 무료배송</p>';
}
function beginPurchase(items,source){
 if(!Object.keys(items).length){toast('먼저 상품을 담아 주세요.');return;}
 for(const id of ['cart-dialog','product-dialog'])if(document.getElementById(id).open)document.getElementById(id).close();
 const next={items:{...items},source};
 if(!signedIn){openGroupLogin(next);return;}
 startCheckout(next);
}
function startCheckout(next){
 try{purchase=checkoutSnapshot(next.items,group,next.source);}catch(error){toast(error.message);return;}
 shippingDraft={name:'',phone:'',postcode:'',address:'',detail:'',memo:''};paymentDraft='card';checkoutStep=1;paying=false;
 renderCheckout();$('#checkout-dialog').showModal();
}
function orderLines(snapshot){return snapshot.rows.map(row=>`<div class="checkout-line"><div class="checkout-thumb">${productArt(row,'-order')}</div><div><strong>${escapeHTML(row.name)}</strong><p>${escapeHTML(row.volume)} · ${row.qty}개</p></div><b>${money(row.unit*row.qty)}</b></div>`).join('');}
function amountSummary(snapshot){return `<div class="summary-row"><span>상품금액 (판매가 기준)</span><span>${money(snapshot.original)}</span></div><div class="summary-row discount-row"><span>${groups[snapshot.group].name} 그룹 추가 할인</span><span>−${money(snapshot.discount)}</span></div><div class="summary-row"><span>배송비</span><span>무료</span></div><div class="summary-row summary-total"><span>총 결제금액</span><strong>${money(snapshot.total)}</strong></div>`;}
function shippingFields(){return `<div class="checkout-section-head"><h3>배송정보</h3><button type="button" class="text-button" id="fill-demo">체험 정보 자동 입력</button></div><p class="field-help">체험 정보로 진행할 수 있어요. 입력 정보와 주문 내역은 이 브라우저에만 저장됩니다.</p><div class="form-grid"><label>받는 분<input name="name" autocomplete="off" required maxlength="40" value="${escapeHTML(shippingDraft.name)}" placeholder="받는 분 이름"></label><label>연락처<input name="phone" type="tel" autocomplete="off" required maxlength="20" value="${escapeHTML(shippingDraft.phone)}" placeholder="010-0000-0000"></label><label>우편번호<input name="postcode" inputmode="numeric" required pattern="[0-9]{5}" maxlength="5" value="${escapeHTML(shippingDraft.postcode)}" placeholder="5자리 우편번호"></label><label class="wide">주소<input name="address" autocomplete="off" required maxlength="150" value="${escapeHTML(shippingDraft.address)}" placeholder="도로명 또는 지번 주소"></label><label class="wide">상세주소 <span>(선택)</span><input name="detail" autocomplete="off" maxlength="100" value="${escapeHTML(shippingDraft.detail)}" placeholder="동·호수 등"></label><label class="wide">배송 요청사항 <span>(선택)</span><input name="memo" autocomplete="off" maxlength="120" value="${escapeHTML(shippingDraft.memo)}" placeholder="예: 문 앞에 놓아주세요"></label></div>`;}
function renderCheckout(){
 if(!purchase)return;
 const intro='<p class="demo-banner">모의 구매 체험 · 실제 결제·출금·상품 배송은 발생하지 않습니다.</p>';
 if(checkoutStep===1){
 $('#checkout-content').innerHTML=dialogHeading('주문하기',1)+intro+`<form id="shipping-form" novalidate>${shippingFields()}<h3 class="checkout-section-title">결제수단</h3><label class="payment-select-label">결제수단 선택<select name="payment" id="payment-method">${Object.entries(paymentMethods).map(([key,label])=>`<option value="${key}" ${paymentDraft===key?'selected':''}>${label} (모의 결제)</option>`).join('')}</select></label><p class="field-help">카드번호나 계좌정보는 입력하지 않습니다.</p><div id="shipping-error" class="form-error" role="alert"></div><button type="submit" class="pay-button">주문·결제 확인으로 →</button></form>`;
 }else{
 $('#checkout-content').innerHTML=dialogHeading('주문·결제 확인',2)+intro+`<div class="checkout-recipient"><div><h3>배송지</h3><button class="text-button" data-checkout-back ${paying?'disabled':''}>수정</button></div><strong>${escapeHTML(shippingDraft.name)}</strong><p>${escapeHTML(shippingDraft.phone)}</p><p>(${escapeHTML(shippingDraft.postcode)}) ${escapeHTML(shippingDraft.address)} ${escapeHTML(shippingDraft.detail)}</p>${shippingDraft.memo?`<p>요청사항: ${escapeHTML(shippingDraft.memo)}</p>`:''}</div><h3 class="checkout-section-title">주문 상품 <span>${purchase.count}개 · ${groups[purchase.group].name} 그룹</span></h3>${orderLines(purchase)}<div class="checkout-totals">${amountSummary(purchase)}<p class="field-help">결제수단: ${paymentMethods[paymentDraft]} (모의 결제)</p></div><label class="demo-agreement"><input id="demo-agree" type="checkbox" ${paying?'checked disabled':''}> 모의 결제이며 실제 주문·결제가 발생하지 않음을 확인했습니다.</label><p id="payment-error" class="form-error" role="alert"></p><button class="pay-button" id="simulate-pay" ${paying?'disabled':''}>${paying?'모의 결제 처리 중…':money(purchase.total)+' 모의 결제하기'}</button><p class="processing-note" role="status">${paying?'주문 내역을 준비하고 있어요.':''}</p>`;
 }
}
function readShipping(form){return Object.fromEntries(['name','phone','postcode','address','detail','memo'].map(key=>[key,form.elements[key].value.trim()]));}
function showCompletion(order,saved=true){
 checkoutStep=3;
 $('#checkout-content').innerHTML=dialogHeading('주문이 완료되었어요',3)+`<div class="order-success"><div class="success-check">✓</div><span class="status-pill">모의 결제 완료</span><h3>감사합니다, ${escapeHTML(order.shipping.name)}님.</h3><p>실제 결제·주문 전송·배송은 이루어지지 않습니다.</p><div class="order-number">주문번호 <strong>${escapeHTML(order.id)}</strong></div></div><div class="checkout-totals">${amountSummary(order.snapshot)}<p class="field-help">결제수단: ${paymentMethods[order.method]} (모의 결제)<br>${saved?'이 브라우저의 주문 내역에 저장했습니다.':'브라우저 저장이 불가능해 현재 세션에서만 확인할 수 있습니다.'}</p></div><button class="pay-button" data-show-orders>주문 내역 확인</button><button class="continue-shopping" data-close="checkout-dialog">쇼핑 계속하기</button>`;
 $('#checkout-dialog').scrollTop=0;
}
function simulatePayment(){
 if(paying||checkoutStep!==2)return;
 if(!$('#demo-agree').checked){$('#payment-error').textContent='모의 결제 안내를 확인해 주세요.';$('#demo-agree').focus();return;}
 paying=true;renderCheckout();
 setTimeout(()=>{
 let order;try{order=createDemoOrder(purchase,shippingDraft,paymentDraft,'DEMO-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+crypto.randomUUID().slice(0,8).toUpperCase(),new Date().toISOString());}catch(error){paying=false;renderCheckout();$('#payment-error').textContent=error.message;return;}
 orders=[order,...orders].slice(0,20);let saved=true;
 try{localStorage.setItem('nepinae-demo-orders-v1',JSON.stringify(orders));}catch{saved=false;}
 cart=remainingCart(cart,purchase);persist();renderCart();paying=false;showCompletion(order,saved);
 },850);
}
function renderOrders(){
 $('#orders-content').innerHTML=`<div class="checkout-heading"><div><p class="eyebrow">NEPINAE / MY ORDERS</p><h2 id="orders-title">주문 내역</h2></div><button class="close-button" data-close="orders-dialog" aria-label="주문 내역 닫기">×</button></div><p class="demo-banner">이 브라우저에서 체험한 모의 주문입니다. 실제 결제·배송은 없습니다.</p>`+(orders.length?orders.map(order=>`<article class="saved-order"><div class="saved-order-heading"><div><strong>${escapeHTML(order.id)}</strong><p>${escapeHTML(new Date(order.createdAt).toLocaleString('ko-KR'))}</p></div><span class="status-pill">모의 결제 완료</span></div>${orderLines(order.snapshot)}<div class="summary-row"><span>${groups[order.snapshot.group]?.name||'일반'} 그룹 · ${paymentMethods[order.method]||'모의 결제'}</span><b>${money(order.snapshot.total)}</b></div><details><summary>배송정보 보기</summary><p>${escapeHTML(order.shipping.name)} · ${escapeHTML(order.shipping.phone)}</p><p>(${escapeHTML(order.shipping.postcode)}) ${escapeHTML(order.shipping.address)} ${escapeHTML(order.shipping.detail)}</p></details></article>`).join(''):'<div class="cart-empty"><h3>아직 주문 내역이 없어요.</h3><p>상품을 선택하고 모의 구매를 체험해 보세요.</p><button class="outline-button" data-close="orders-dialog">상품 둘러보기</button></div>');
}
function showOrders(){
 if($('#checkout-dialog').open)$('#checkout-dialog').close();renderOrders();$('#orders-dialog').showModal();
}
document.addEventListener('submit',event=>{
 if(event.target.id!=='shipping-form')return;event.preventDefault();const form=event.target;shippingDraft=readShipping(form);paymentDraft=form.elements.payment.value;
 const error=validateShipping(shippingDraft);if(error){$('#shipping-error').textContent=error;return;}
 checkoutStep=2;renderCheckout();$('#checkout-dialog').scrollTop=0;
});
document.addEventListener('click',event=>{
 const target=event.target;
 if(target.closest('[data-checkout]'))beginPurchase(cart,'cart');
 const buy=target.closest('[data-buy]');if(buy)beginPurchase({[buy.dataset.buy]:1},'direct');
 if(target.closest('#fill-demo')){const form=$('#shipping-form');const data={name:'체험 고객',phone:'010-0000-0000',postcode:'00000',address:'체험시 체험로 123',detail:'체험동 101호',memo:'모의 주문 체험'};for(const key in data)form.elements[key].value=data[key];$('#shipping-error').textContent='';}
 if(target.closest('[data-checkout-back]')&&!paying){checkoutStep=1;renderCheckout();$('#checkout-dialog').scrollTop=0;}
 if(target.closest('#simulate-pay'))simulatePayment();
 if(target.closest('[data-show-orders]'))showOrders();
});
$('#group-login-open').addEventListener('click',()=>openGroupLogin());
$('#group-login-select').addEventListener('change',updateLoginPreview);
$('#group-login-confirm').addEventListener('click',()=>{
 setGroup($('#group-login-select').value);signedIn=true;try{sessionStorage.setItem('nepinae-group-session','active');}catch{}
 updateLoginUI();$('#group-login-dialog').close();const next=pendingPurchase;pendingPurchase=null;if(next)startCheckout(next);else toast(groups[group].name+' 그룹으로 로그인했어요.');
});
$('#group-logout').addEventListener('click',()=>{signedIn=false;try{sessionStorage.removeItem('nepinae-group-session');}catch{}setGroup('guest');updateLoginUI();toast('로그아웃했어요.');});
$('#group').addEventListener('change',updateLoginUI);
$('#cart-group').addEventListener('change',updateLoginUI);
$('#orders-open').addEventListener('click',showOrders);
$('#checkout-dialog').addEventListener('cancel',event=>{if(paying)event.preventDefault();});
updateLoginUI();

